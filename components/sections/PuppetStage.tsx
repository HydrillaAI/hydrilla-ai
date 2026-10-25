"use client";

import { useEffect, useRef, useState } from "react";
import type {
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Texture,
  WebGLRenderer,
} from "three";
import { CTA_PUPPET_MODELS } from "@/lib/cloudinary";

type PuppetSpec = {
  url: string;
  /** Anchor column and depth. */
  x: number;
  z: number;
  /** Resting height of the string's attachment point (top of the model). */
  top: number;
  /** Model height in world units. */
  height: number;
};

const WIDE: PuppetSpec[] = [
  { url: CTA_PUPPET_MODELS.antMan, x: -1.16, z: -0.3, top: 0.3, height: 0.78 },
  { url: CTA_PUPPET_MODELS.mantis, x: -0.6, z: -0.05, top: 0.42, height: 0.9 },
  { url: CTA_PUPPET_MODELS.lantern, x: 0, z: 0.28, top: 0.5, height: 1.04 },
  { url: CTA_PUPPET_MODELS.witch, x: 0.6, z: -0.05, top: 0.4, height: 0.9 },
  { url: CTA_PUPPET_MODELS.deadpool, x: 1.16, z: -0.3, top: 0.28, height: 0.8 },
];

const COMPACT: PuppetSpec[] = [
  { url: CTA_PUPPET_MODELS.antMan, x: -0.6, z: -0.12, top: 0.32, height: 0.8 },
  { url: CTA_PUPPET_MODELS.lantern, x: 0, z: 0.25, top: 0.5, height: 1.02 },
  { url: CTA_PUPPET_MODELS.witch, x: 0.6, z: -0.12, top: 0.34, height: 0.84 },
];

/** Strings hang from far above the frame, so the swing reads slow and soft. */
const ANCHOR_Y = 3.2;
const FLOOR_Y = -0.66;
const LOOK_Y = 0.12;
const VIEW_HEIGHT = 1.8;
const FOV = 22;
const STEP = 1 / 120;

type Puppet = {
  spec: PuppetSpec;
  length: number;
  pivot: Group;
  holder: Group;
  shadow: Mesh;
  proxy: Mesh | null;
  model: Group | null;
  width: number;
  ready: boolean;
  enterAt: number;
  theta: number;
  thetaV: number;
  phi: number;
  phiV: number;
  yaw: number;
  yawV: number;
  yawGoal: number;
  drop: number;
  dropV: number;
  seed: number;
};

function disposeObject(root: Object3D) {
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      const mat = material as Material & Record<string, Texture | null | undefined>;
      for (const value of Object.values(mat)) {
        if (value && (value as Texture).isTexture) (value as Texture).dispose();
      }
      material.dispose();
    }
  });
}

/**
 * Closing CTA marionettes. Each model hangs on a string and swings as a
 * damped pendulum: a soft breeze at rest, drag to swing, tap to hop and twirl.
 * Three.js and the models load only once the section is close to the viewport.
 */
export function PuppetStage({ className }: { className?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    let disposed = false;
    let booted = false;
    let renderer: WebGLRenderer | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let viewObserver: IntersectionObserver | null = null;
    let detachPointer: (() => void) | null = null;
    let releaseScene: (() => void) | null = null;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const puppets: Puppet[] = [];

    const boot = async () => {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const { MeshoptDecoder } = await import("three/examples/jsm/libs/meshopt_decoder.module.js");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      await MeshoptDecoder.ready;
      if (disposed) return;

      const coarse = window.matchMedia("(pointer: coarse)").matches;
      /* Decode geometry off the main thread so scrolling stays smooth. */
      (MeshoptDecoder as typeof MeshoptDecoder & { useWorkers: (count: number) => void }).useWorkers(
        coarse ? 1 : 2
      );
      const host = navigator as Navigator & {
        connection?: { saveData?: boolean };
        deviceMemory?: number;
      };
      const lowEnd =
        host.connection?.saveData === true ||
        (host.deviceMemory !== undefined && host.deviceMemory <= 2) ||
        (host.hardwareConcurrency !== undefined && host.hardwareConcurrency <= 2);
      const wide = stage.clientWidth >= 640;
      const specs = lowEnd ? [COMPACT[1]] : wide ? WIDE : COMPACT;
      const needWidth = wide ? 3.5 : 2.15;

      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
          stencil: false,
          powerPreference: coarse ? "default" : "high-performance",
        });
      } catch {
        return;
      }
      renderer.setClearColor(0x000000, 0);
      /* Error checks force a synchronous stall on every shader compile. */
      renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
      scene.environment = environment;
      scene.environmentIntensity = 0.42;

      scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe7f3, 1.0));
      const key = new THREE.DirectionalLight(0xfff8f2, 2.6);
      key.position.set(3.2, 7.2, 4.2);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xc5d7f0, 0.7);
      fill.position.set(-6, 2.2, 2.4);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffffff, 1.0);
      rim.position.set(-0.6, 3.4, -6);
      scene.add(rim);

      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 40);

      /* Strings: hairline cylinders that fade out toward the top of the frame. */
      const stringMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uColor: { value: new THREE.Color("#000c1f") },
          uTop: { value: 1 },
        },
        vertexShader: `
          varying float vY;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vY = world.y;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uTop;
          varying float vY;
          void main() {
            float a = 0.3 * smoothstep(uTop, uTop - 0.55, vY);
            gl_FragColor = vec4(uColor, a);
          }
        `,
      });
      const stringGeometry = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true);
      stringGeometry.translate(0, -0.5, 0);

      /* Contact shadows: one soft ellipse texture shared by every puppet. */
      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = 128;
      shadowCanvas.height = 128;
      const ctx = shadowCanvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, "rgba(0,12,31,0.55)");
        gradient.addColorStop(0.45, "rgba(0,12,31,0.2)");
        gradient.addColorStop(1, "rgba(0,12,31,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
      }
      const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
      const shadowGeometry = new THREE.PlaneGeometry(1, 1);
      releaseScene = () => {
        environment.dispose();
        stringGeometry.dispose();
        stringMaterial.dispose();
        shadowTexture.dispose();
        shadowGeometry.dispose();
      };

      for (const spec of specs) {
        const length = ANCHOR_Y - spec.top;
        const pivot = new THREE.Group();
        pivot.position.set(spec.x, ANCHOR_Y, spec.z);
        const string = new THREE.Mesh(stringGeometry, stringMaterial);
        string.scale.set(0.0022, length + 0.02, 0.0022);
        pivot.add(string);
        const holder = new THREE.Group();
        holder.position.y = -length;
        pivot.add(holder);
        pivot.visible = false;
        scene.add(pivot);

        const shadow = new THREE.Mesh(
          shadowGeometry,
          new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            depthWrite: false,
            opacity: 0,
          })
        );
        shadow.position.set(spec.x, FLOOR_Y, spec.z - 0.08);
        shadow.renderOrder = -1;
        scene.add(shadow);

        puppets.push({
          spec,
          length,
          pivot,
          holder,
          shadow,
          proxy: null,
          model: null,
          width: spec.height * 0.5,
          ready: false,
          enterAt: 0,
          theta: 0,
          thetaV: 0,
          phi: 0,
          phiV: 0,
          yaw: -spec.x * 0.3,
          yawV: 0,
          yawGoal: -spec.x * 0.3,
          drop: 0,
          dropV: 0,
          seed: Math.random() * Math.PI * 2,
        });
      }

      /* Drops below 1 when frames run long; see the loop. */
      let quality = 1;
      const resize = () => {
        if (!renderer) return;
        const width = stage.clientWidth;
        const height = stage.clientHeight;
        if (width < 2 || height < 2) return;
        const dpr = window.devicePixelRatio || 1;
        const pixelCap = coarse ? 1_100_000 : 2_400_000;
        let ratio = Math.min(dpr, 2);
        if (width * height * ratio * ratio > pixelCap) ratio = Math.sqrt(pixelCap / (width * height));
        const pixelRatio = Math.max(1, Math.min(ratio * quality, dpr));
        const current = renderer.getSize(new THREE.Vector2());
        if (
          current.x !== width ||
          current.y !== height ||
          renderer.getPixelRatio() !== pixelRatio
        ) {
          /* One allocation; setPixelRatio + setSize would reallocate twice. */
          renderer.setDrawingBufferSize(width, height, pixelRatio);
        }

        const aspect = width / height;
        const viewHeight = Math.max(VIEW_HEIGHT, needWidth / aspect);
        const distance = viewHeight / 2 / Math.tan((FOV * Math.PI) / 360);
        camera.aspect = aspect;
        camera.position.set(0, LOOK_Y + 0.18, distance);
        camera.lookAt(0, LOOK_Y, 0);
        camera.updateProjectionMatrix();
        stringMaterial.uniforms.uTop.value = LOOK_Y + viewHeight / 2;
      };
      resize();
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(stage);

      /* Pointer: drag to swing, sweep past to nudge, tap to hop and twirl. */
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const hitPoint = new THREE.Vector3();
      let dragged: Puppet | null = null;
      let dragTarget = 0;
      let downAt = { x: 0, y: 0, t: 0 };
      let lastPointer = { x: 0, t: 0, has: false };

      const toNdc = (event: PointerEvent) => {
        const bounds = canvas.getBoundingClientRect();
        ndc.set(
          ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
          -((event.clientY - bounds.top) / bounds.height) * 2 + 1
        );
        raycaster.setFromCamera(ndc, camera);
      };
      const pick = () => {
        const proxies = puppets.filter((p) => p.ready && p.proxy).map((p) => p.proxy as Mesh);
        const hit = raycaster.intersectObjects(proxies, false)[0];
        return hit ? puppets.find((p) => p.proxy === hit.object) ?? null : null;
      };
      const pointerWorld = (z: number) => {
        plane.constant = -z;
        return raycaster.ray.intersectPlane(plane, hitPoint);
      };

      const onPointerDown = (event: PointerEvent) => {
        toNdc(event);
        const target = pick();
        if (!target) return;
        dragged = target;
        dragTarget = target.theta;
        downAt = { x: event.clientX, y: event.clientY, t: performance.now() };
        canvas.setPointerCapture(event.pointerId);
        canvas.style.cursor = "grabbing";
        setTouched(true);
      };
      const onPointerMove = (event: PointerEvent) => {
        toNdc(event);
        if (dragged) {
          const point = pointerWorld(dragged.spec.z);
          if (!point) return;
          const anchorY = ANCHOR_Y + dragged.drop;
          const angle = Math.atan2(point.x - dragged.spec.x, anchorY - point.y);
          dragTarget = Math.max(-0.42, Math.min(0.42, angle));
          return;
        }
        const over = pick();
        canvas.style.cursor = over ? "grab" : "";
        const point = pointerWorld(0);
        const now = performance.now();
        if (point && lastPointer.has && over && !motionQuery.matches) {
          const dt = Math.max((now - lastPointer.t) / 1000, 1 / 240);
          const vx = (point.x - lastPointer.x) / dt;
          over.thetaV += Math.max(-0.35, Math.min(0.35, (vx * 0.09) / over.length));
        }
        if (point) lastPointer = { x: point.x, t: now, has: true };
      };
      const onPointerUp = (event: PointerEvent) => {
        if (!dragged) return;
        const quick = performance.now() - downAt.t < 280;
        const still = Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y) < 6;
        if (quick && still) {
          dragged.dropV += 1.5;
          dragged.yawGoal += Math.PI * 2 * (dragged.spec.x > 0 ? -1 : 1);
        }
        if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
        dragged = null;
        canvas.style.cursor = "grab";
      };
      const onPointerLeave = () => {
        lastPointer.has = false;
        if (!dragged) canvas.style.cursor = "";
      };
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);
      canvas.addEventListener("pointerleave", onPointerLeave);
      detachPointer = () => {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        canvas.removeEventListener("pointerleave", onPointerLeave);
      };

      /* Physics: damped pendulums with a breeze, a soft bob and gentle collisions. */
      const step = (time: number) => {
        const still = motionQuery.matches;
        const active = puppets.filter((p) => p.ready && time >= p.enterAt);
        const pushes = new Map<Puppet, number>();
        const sorted = [...active].sort((a, b) => a.spec.x - b.spec.x);
        for (let i = 0; i < sorted.length - 1; i++) {
          const a = sorted[i];
          const b = sorted[i + 1];
          const reachA = a.length + a.spec.height * 0.5;
          const reachB = b.length + b.spec.height * 0.5;
          const ax = a.spec.x + reachA * Math.sin(a.theta);
          const bx = b.spec.x + reachB * Math.sin(b.theta);
          const gap = bx - ax - (a.width + b.width) * 0.5 * 0.72;
          if (gap < 0) {
            pushes.set(a, (pushes.get(a) ?? 0) + (gap * 110) / reachA);
            pushes.set(b, (pushes.get(b) ?? 0) - (gap * 110) / reachB);
          }
        }

        for (const p of active) {
          const omega2 = (9.81 * 0.92) / p.length;
          const breeze = still
            ? 0
            : 0.05 * (Math.sin(time * 0.62 + p.seed) * 0.65 + Math.sin(time * 1.13 + p.seed * 1.7) * 0.35);

          let thetaA: number;
          if (p === dragged) {
            const k = 140;
            thetaA = k * (dragTarget - p.theta) - 2 * Math.sqrt(k) * p.thetaV;
          } else {
            thetaA = -omega2 * Math.sin(p.theta) - 0.5 * p.thetaV + breeze + (pushes.get(p) ?? 0);
          }
          p.thetaV = Math.max(-1.4, Math.min(1.4, p.thetaV + thetaA * STEP));
          p.theta += p.thetaV * STEP;

          const phiA = -omega2 * Math.sin(p.phi) - 0.9 * p.phiV + breeze * 0.45;
          p.phiV += phiA * STEP;
          p.phi += p.phiV * STEP;

          const look = still ? 0 : 0.24 * Math.sin(time * 0.38 + p.seed * 2.3);
          const yawA = 16 * (p.yawGoal + look - p.yaw) - 6.2 * p.yawV + p.thetaV * 0.9;
          p.yawV += yawA * STEP;
          p.yaw += p.yawV * STEP;

          const breathe = still ? 0 : 0.012 * Math.sin(time * 1.3 + p.seed);
          const dropA = 52 * (breathe - p.drop) - 9 * p.dropV;
          p.dropV += dropA * STEP;
          p.drop += p.dropV * STEP;
        }
      };

      const apply = () => {
        for (const p of puppets) {
          if (!p.ready) continue;
          p.pivot.position.y = ANCHOR_Y + p.drop;
          p.pivot.rotation.set(p.phi, 0, p.theta);
          p.holder.rotation.y = p.yaw;
          const reach = p.length + p.spec.height;
          const lift = Math.max(0, p.drop);
          const presence = Math.max(0, 1 - lift * 1.4);
          p.shadow.position.x = p.spec.x + reach * Math.sin(p.theta);
          const size = p.width * 1.7 * (1 - Math.min(lift, 0.6) * 0.4);
          p.shadow.scale.set(size, size * 0.22, 1);
          (p.shadow.material as MeshBasicMaterial).opacity = 0.42 * presence;
        }
      };

      let last = performance.now();
      let accumulator = 0;
      const start = last;
      /* Adaptive quality: if frames run long, lower resolution, then frame rate. */
      let sampleTime = 0;
      let sampleFrames = 0;
      let halfRate = false;
      let skip = false;
      const loop = () => {
        if (disposed || !renderer) return;
        const now = performance.now();
        const delta = Math.min((now - last) / 1000, 1 / 20);
        accumulator += delta;
        last = now;
        if (halfRate && (skip = !skip)) return;
        while (accumulator >= STEP) {
          step((now - start) / 1000);
          accumulator -= STEP;
        }
        apply();
        renderer.render(scene, camera);

        if (!puppets.some((p) => p.ready)) return;
        sampleTime += delta;
        sampleFrames += 1;
        if (sampleFrames < 90) return;
        const average = (sampleTime / sampleFrames) * 1000;
        sampleTime = 0;
        sampleFrames = 0;
        if (average <= (halfRate ? 40 : 24)) return;
        if (quality === 1) {
          /* Pixel cost scales with ratio², so jump straight to the target once. */
          quality = Math.max(0.55, Math.sqrt(16.7 / average));
          resize();
        } else if (!halfRate) {
          halfRate = true;
        }
      };
      viewObserver?.disconnect();
      viewObserver = new IntersectionObserver(
        ([entry]) => {
          last = performance.now();
          renderer?.setAnimationLoop(entry.isIntersecting ? loop : null);
        },
        { threshold: 0.02 }
      );
      viewObserver.observe(stage);

      const idle = () =>
        new Promise<void>((resolve) => {
          const w = window as Window & {
            requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
          };
          if (w.requestIdleCallback) w.requestIdleCallback(() => resolve(), { timeout: 1200 });
          else window.setTimeout(resolve, 200);
        });

      /* Load the center puppet first, then work outward; each drops in on arrival. */
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      const order = [...puppets].sort((a, b) => Math.abs(a.spec.x) - Math.abs(b.spec.x));
      let nextEntrance = 0;

      const load = async (p: Puppet) => {
        const response = await fetch(p.spec.url, { cache: "force-cache" });
        if (!response.ok) throw new Error(`Puppet model failed (${response.status})`);
        const buffer = await response.arrayBuffer();
        await idle();
        if (disposed) return;
        const gltf = await new Promise<{ scene: Group }>((resolve, reject) =>
          loader.parse(buffer, "", resolve, reject)
        );
        if (disposed) {
          disposeObject(gltf.scene);
          return;
        }
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = p.spec.height / (size.y || 1);
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -box.max.y * scale, -center.z * scale);
        model.traverse((node) => {
          node.updateMatrix();
          node.matrixAutoUpdate = false;
        });
        p.holder.add(model);
        p.model = model;
        p.width = Math.max(size.x, size.z) * scale;

        const proxy = new THREE.Mesh(
          new THREE.BoxGeometry(size.x * scale, p.spec.height, size.z * scale),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        proxy.position.y = -p.spec.height / 2;
        p.holder.add(proxy);
        p.proxy = proxy;

        if (renderer) await renderer.compileAsync(p.pivot, camera, scene);
        /* Upload textures one per idle slot, not all in the entrance frame. */
        const textures = new Set<Texture>();
        model.traverse((node) => {
          const mesh = node as Mesh;
          if (!mesh.isMesh) return;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const material of materials) {
            for (const value of Object.values(material)) {
              if (value && (value as Texture).isTexture) textures.add(value as Texture);
            }
          }
        });
        for (const texture of textures) {
          await idle();
          if (disposed || !renderer) return;
          renderer.initTexture(texture);
        }
        if (disposed) return;

        const now = (performance.now() - start) / 1000;
        p.enterAt = Math.max(now, nextEntrance);
        nextEntrance = p.enterAt + 0.14;
        if (!motionQuery.matches) {
          p.drop = 1.7;
          p.dropV = 0;
          p.thetaV = (Math.random() - 0.5) * 0.12;
        }
        p.ready = true;
        p.pivot.visible = true;
        apply();
        setReady(true);
      };

      for (const p of order) {
        if (disposed) return;
        try {
          await load(p);
        } catch (error) {
          console.error("CTA puppet failed to load", error);
        }
      }
    };

    /* Defer everything until the section is near the viewport. */
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || booted) return;
        booted = true;
        nearObserver.disconnect();
        void boot();
      },
      { rootMargin: "700px 0px" }
    );
    nearObserver.observe(stage);

    return () => {
      disposed = true;
      nearObserver.disconnect();
      viewObserver?.disconnect();
      resizeObserver?.disconnect();
      detachPointer?.();
      renderer?.setAnimationLoop(null);
      for (const p of puppets) {
        if (p.model) disposeObject(p.model);
        p.proxy?.geometry.dispose();
        (p.shadow.material as Material).dispose();
      }
      puppets.length = 0;
      releaseScene?.();
      renderer?.dispose();
      renderer?.forceContextLoss();
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className={className}
      role="img"
      aria-label="3D characters generated with Hydrilla, hanging on strings like marionettes"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ touchAction: "pan-y" }}
      />
      <p
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 m-0 text-center text-xs transition-opacity duration-700"
        style={{
          color: "rgba(0, 12, 31, 0.4)",
          letterSpacing: "0.01em",
          opacity: ready && !touched ? 1 : 0,
        }}
      >
        Drag to swing · Tap to twirl
      </p>
    </div>
  );
}

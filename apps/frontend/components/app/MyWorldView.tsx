"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import {
  Box,
  Check,
  ChevronDown,
  CircleHelp,
  Download,
  Focus,
  Grid3X3,
  LoaderCircle,
  Orbit,
  PanelLeft,
  Move,
  RefreshCw,
  Search,
  Sparkles,
  ZoomIn,
} from "lucide-react";
import { cn } from "../../lib/utils";
import {
  downloadGlbWithAuth,
  fetchHistory,
  getProxiedImageUrl,
  getProxyGlbUrl,
  type BackendJob,
} from "../../lib/api";

type WorldAsset = Pick<
  BackendJob,
  "id" | "prompt" | "resultGlbUrl" | "previewImageUrl" | "imageUrl" | "createdAt" | "updatedAt" | "engine"
>;

type CameraMode = "orbit" | "pan" | "zoom";

function assetName(asset: WorldAsset): string {
  const prompt = asset.prompt?.trim();
  if (!prompt) return "Untitled model";
  return prompt.length > 34 ? `${prompt.slice(0, 34).trimEnd()}…` : prompt;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Recently created";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      material.map?.dispose();
      material.dispose();
    });
  });
}

function cssColor(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function placement(index: number, total: number): THREE.Vector3 {
  const columns = Math.min(total, Math.max(4, Math.min(7, Math.ceil(Math.sqrt(Math.max(total, 1) * 1.35)))));
  const row = Math.floor(index / columns);
  const column = index % columns;
  return new THREE.Vector3((column - (columns - 1) / 2) * 5.4, 0, -row * 5.8);
}

function WorldScene({
  assets,
  selectedId,
  cameraMode,
  focusRequest,
  resetRequest,
  onSelect,
  onLoadState,
}: {
  assets: WorldAsset[];
  selectedId: string | null;
  cameraMode: CameraMode;
  focusRequest: { id: number; assetId: string } | null;
  resetRequest: number;
  onSelect: (id: string | null) => void;
  onLoadState: (id: string, loading: boolean) => void;
}) {
  const { getToken } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelsRef = useRef<THREE.Group | null>(null);
  const modelMapRef = useRef(new Map<string, THREE.Group>());
  const selectedIdRef = useRef(selectedId);
  const runRef = useRef(0);
  const selectedLoadRef = useRef(0);
  const [sceneError, setSceneError] = useState<string | null>(null);

  selectedIdRef.current = selectedId;

  const focusModel = useCallback((assetId: string) => {
    const model = modelMapRef.current.get(assetId);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!model || !camera || !controls) return;
    const target = model.position.clone().add(new THREE.Vector3(0, 0.9, 0));
    controls.target.copy(target);
    const direction = new THREE.Vector3(1, 0.72, 1).normalize();
    camera.position.copy(target).add(direction.multiplyScalar(7.5));
    camera.lookAt(target);
    controls.update();
  }, []);

  const resetCamera = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    controls.target.set(0, 0, -2.5);
    camera.position.set(10.5, 8.2, 13.5);
    camera.lookAt(controls.target);
    controls.update();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const canvasColor = cssColor("--app-canvas", "Canvas");
    const softColor = cssColor("--hyd-soft", "currentColor");
    const mistColor = cssColor("--hyd-mist", "Canvas");
    const skyColor = cssColor("--hyd-sky", "currentColor");
    scene.background = new THREE.Color(canvasColor);
    scene.fog = new THREE.Fog(canvasColor, 35, 115);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 300);
    camera.position.set(10.5, 8.2, 13.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(canvasColor, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "block h-full w-full";
    renderer.domElement.setAttribute("aria-label", "My World 3D asset environment");
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = 4;
    controls.maxDistance = 95;
    controls.minPolarAngle = 0.16;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.target.set(0, 0, -2.5);
    controls.update();
    controlsRef.current = controls;

    const ambient = new THREE.HemisphereLight(cssColor("--app-canvas", "Canvas"), softColor, 2.3);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(cssColor("--app-canvas", "Canvas"), 4.2);
    key.position.set(9, 16, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -34;
    key.shadow.camera.right = 34;
    key.shadow.camera.top = 34;
    key.shadow.camera.bottom = -34;
    key.shadow.bias = -0.0003;
    scene.add(key);
    const fill = new THREE.DirectionalLight(mistColor, 1.4);
    fill.position.set(-12, 7, -10);
    scene.add(fill);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 160),
      new THREE.MeshStandardMaterial({ color: mistColor, roughness: 0.88, metalness: 0 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.015;
    floor.receiveShadow = true;
    floor.userData.worldFloor = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(150, 75, skyColor, softColor);
    const gridMaterial = grid.material as THREE.Material;
    gridMaterial.transparent = true;
    gridMaterial.opacity = 0.72;
    grid.position.y = 0.006;
    scene.add(grid);

    const updateTheme = () => {
      const nextCanvas = cssColor("--app-canvas", "Canvas");
      const nextMist = cssColor("--hyd-mist", "Canvas");
      scene.background = new THREE.Color(nextCanvas);
      scene.fog?.color.set(nextCanvas);
      renderer.setClearColor(nextCanvas, 1);
      (floor.material as THREE.MeshStandardMaterial).color.set(nextMist);
    };
    const themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    const models = new THREE.Group();
    models.name = "my-world-models";
    scene.add(models);
    modelsRef.current = models;
    sceneRef.current = scene;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown: [number, number] | null = null;
    const onPointerDown = (event: PointerEvent) => {
      pointerDown = [event.clientX, event.clientY];
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!pointerDown || Math.hypot(event.clientX - pointerDown[0], event.clientY - pointerDown[1]) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(models.children, true).find((item) => item.object.userData.assetId);
      onSelect((hit?.object.userData.assetId as string | undefined) ?? null);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    let animationFrame = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      themeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      disposeObject(models);
      floor.geometry.dispose();
      floor.material.dispose();
      grid.geometry.dispose();
      gridMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      modelMapRef.current.clear();
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
      modelsRef.current = null;
    };
  }, [onSelect]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.enableRotate = cameraMode !== "pan";
    controls.enablePan = cameraMode !== "orbit";
    controls.enableZoom = cameraMode !== "pan";
  }, [cameraMode]);

  useEffect(() => {
    if (focusRequest) focusModel(focusRequest.assetId);
  }, [focusModel, focusRequest]);

  useEffect(() => {
    if (resetRequest) resetCamera();
  }, [resetCamera, resetRequest]);

  useEffect(() => {
    const models = modelsRef.current;
    if (!models) return;
    const run = ++runRef.current;
    modelMapRef.current.forEach((model) => {
      models.remove(model);
      disposeObject(model);
    });
    modelMapRef.current.clear();
    setSceneError(null);
    if (!assets.length) return;

    let cancelled = false;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const textureLoader = new THREE.TextureLoader();
    const selectionColor = cssColor("--hyd-sky", "currentColor");

    void (async () => {
      try {
        const token = await getToken();
        if (cancelled || run !== runRef.current) return;
        if (token) loader.setRequestHeader({ Authorization: `Bearer ${token}` });
      } catch {
        // The backend will return a useful error if the session has expired.
      }

      assets.forEach((asset, index) => {
        const group = new THREE.Group();
        group.userData.assetId = asset.id;
        group.position.copy(placement(index, assets.length));
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(1.35, 1.44, 64),
          new THREE.MeshBasicMaterial({ color: selectionColor, transparent: true, opacity: 0.9, side: THREE.DoubleSide }),
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.018;
        ring.visible = asset.id === selectedIdRef.current;
        group.add(ring);
        group.userData.selectionRing = ring;

        const imageUrl = getProxiedImageUrl(asset.previewImageUrl || asset.imageUrl);
        if (imageUrl) {
          textureLoader.load(imageUrl, (texture) => {
            if (cancelled || run !== runRef.current) {
              texture.dispose();
              return;
            }
            texture.colorSpace = THREE.SRGBColorSpace;
            const card = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, color: 0xffffff }));
            card.userData.assetId = asset.id;
            card.scale.set(3.8, 2.7, 1);
            card.position.y = 1.35;
            group.add(card);
          });
        }

        models.add(group);
        modelMapRef.current.set(asset.id, group);

      });
    })();

    return () => {
      cancelled = true;
      assets.forEach((asset) => onLoadState(asset.id, false));
    };
  }, [assets, getToken, onLoadState]);

  useEffect(() => {
    const models = modelsRef.current;
    if (!models || !selectedId) return;
    const group = modelMapRef.current.get(selectedId);
    if (!group || group.userData.glbLoaded || group.userData.glbLoading) return;
    const asset = assets.find((item) => item.id === selectedId);
    if (!asset) return;

    const request = ++selectedLoadRef.current;
    let cancelled = false;
    group.userData.glbLoading = true;
    onLoadState(asset.id, true);
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    void (async () => {
      try {
        const token = await getToken();
        if (token) loader.setRequestHeader({ Authorization: `Bearer ${token}` });
      } catch {
        // The request will surface the backend's auth error if the session expired.
      }
      loader.load(getProxyGlbUrl(asset.id), (gltf) => {
        if (cancelled || request !== selectedLoadRef.current) {
          group.userData.glbLoading = false;
          onLoadState(asset.id, false);
          disposeObject(gltf.scene);
          return;
        }
        const source = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(source);
        const center = bounds.getCenter(new THREE.Vector3());
        const dimensions = bounds.getSize(new THREE.Vector3());
        const maxDimension = Math.max(dimensions.x, dimensions.y, dimensions.z);
        const scale = maxDimension > 0 ? Math.min(3.2 / maxDimension, 4) : 1;
        source.scale.setScalar(scale);
        source.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
        source.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.userData.assetId = asset.id;
          child.castShadow = true;
          child.receiveShadow = true;
        });
        const thumbnail = group.children.find((child) => child instanceof THREE.Sprite);
        if (thumbnail) thumbnail.visible = false;
        group.add(source);
        group.userData.glbLoaded = true;
        group.userData.glbLoading = false;
        onLoadState(asset.id, false);
      }, undefined, () => {
        if (cancelled || request !== selectedLoadRef.current) return;
        group.userData.glbLoading = false;
        onLoadState(asset.id, false);
        setSceneError("Some models could not be loaded. Try refreshing My World.");
      });
    })();

    return () => {
      cancelled = true;
      onLoadState(asset.id, false);
    };
  }, [assets, getToken, onLoadState, selectedId]);

  useEffect(() => {
    modelMapRef.current.forEach((model, id) => {
      const ring = model.userData.selectionRing as THREE.Mesh | undefined;
      if (ring) ring.visible = id === selectedId;
    });
  }, [selectedId]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {sceneError ? (
        <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full border border-[var(--hyd-200)] bg-[var(--app-canvas)]/90 px-4 py-2 text-xs font-medium shadow-[var(--shadow-stage)] backdrop-blur">
          {sceneError}
        </div>
      ) : null}
    </div>
  );
}

export function MyWorldView() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [assets, setAssets] = useState<WorldAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>("orbit");
  const [focusRequest, setFocusRequest] = useState<{ id: number; assetId: string } | null>(null);
  const [resetRequest, setResetRequest] = useState(0);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [visibleAssetCount, setVisibleAssetCount] = useState(36);
  const [mobileLibraryOpen, setMobileLibraryOpen] = useState(false);

  const loadAssets = useCallback(async (quiet = false) => {
    if (!isSignedIn) return;
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const jobs = await fetchHistory(async () => await getToken());
      const next = jobs
        .filter((job) => job.status === "DONE" && Boolean(job.resultGlbUrl))
        .sort((a, b) => {
          const created = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          return created || a.id.localeCompare(b.id);
        })
        .map((job) => ({
          id: job.id,
          prompt: job.prompt,
          resultGlbUrl: job.resultGlbUrl,
          previewImageUrl: job.previewImageUrl,
          imageUrl: job.imageUrl,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          engine: job.engine,
        }));
      setAssets((current) => {
        const currentSignature = current.map((asset) => `${asset.id}:${asset.updatedAt}`).join("|");
        const nextSignature = next.map((asset) => `${asset.id}:${asset.updatedAt}`).join("|");
        return currentSignature === nextSignature ? current : next;
      });
      setSelectedId((current) => (current && next.some((asset) => asset.id === current) ? current : next.at(-1)?.id ?? null));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load your 3D world.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    void loadAssets();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadAssets(true);
    };
    const interval = window.setInterval(refreshWhenVisible, 60_000);
    window.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [isLoaded, isSignedIn, loadAssets]);

  const filteredAssets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return assets.filter((asset) => !normalized || assetName(asset).toLowerCase().includes(normalized));
  }, [assets, query]);
  const visibleAssets = filteredAssets.slice().reverse().slice(0, visibleAssetCount);
  const selected = assets.find((asset) => asset.id === selectedId) ?? null;

  const setAssetLoading = useCallback((id: string, isLoading: boolean) => {
    setLoadingIds((current) => {
      const next = new Set(current);
      if (isLoading) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const focusSelected = (id: string) => {
    setSelectedId(id);
    setFocusRequest({ id: Date.now(), assetId: id });
  };

  const downloadSelected = async () => {
    if (!selected?.resultGlbUrl) return;
    await downloadGlbWithAuth(selected.resultGlbUrl, `${assetName(selected).replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "hydrilla-model"}.glb`, async () => await getToken());
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex h-[calc(100dvh-64px)] items-center justify-center bg-[var(--app-canvas)]">
        <div className="flex items-center gap-3 rounded-full border border-[var(--hyd-200)] bg-[var(--app-canvas)]/80 px-4 py-2.5 text-sm font-medium text-[var(--hyd-ink)] shadow-[var(--shadow-stage)] backdrop-blur">
          <LoaderCircle className="h-4 w-4 animate-spin text-[var(--hyd-400)]" />
          Loading your world…
        </div>
      </div>
    );
  }

  return (
    <main className="relative h-[calc(100dvh-64px)] overflow-hidden bg-[var(--app-canvas)] text-[var(--hyd-ink)] md:min-h-[560px]">
      <WorldScene
        assets={assets}
        selectedId={selectedId}
        cameraMode={cameraMode}
        focusRequest={focusRequest}
        resetRequest={resetRequest}
        onSelect={setSelectedId}
        onLoadState={setAssetLoading}
      />

      <aside className={cn("absolute inset-y-3 left-3 z-20 flex w-[min(286px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[22px] border border-[var(--hyd-200)] bg-[var(--app-canvas)]/90 shadow-[var(--shadow-stage-md)] backdrop-blur-xl transition-transform sm:inset-y-5 sm:left-5 md:translate-x-0", mobileLibraryOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)] md:translate-x-0")}>
        <div className="border-b border-[var(--hyd-200)] px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--hyd-50)] text-[var(--hyd-400)]"><Box className="h-5 w-5" strokeWidth={1.8} /></div>
              <div>
                <h1 className="text-[17px] font-semibold tracking-[-0.03em] text-[var(--hyd-ink)]">My World</h1>
                <p className="mt-0.5 text-[11px] font-medium opacity-55">All your generated 3D assets</p>
              </div>
            </div>
            <button type="button" className="rounded-lg p-1.5 opacity-55 transition hover:bg-[var(--hyd-50)] hover:opacity-100" aria-label="My World help" title="My World help">
              <CircleHelp className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-[var(--hyd-50)] px-3 py-2.5 text-xs opacity-65">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search models…" className="min-w-0 flex-1 bg-transparent outline-none placeholder:opacity-55" aria-label="Search models" />
            <kbd className="hidden rounded border border-[var(--hyd-200)] bg-[var(--app-canvas)] px-1.5 py-0.5 text-[10px] opacity-55 sm:block">/</kbd>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] opacity-55">
          <span>{assets.length} {assets.length === 1 ? "model" : "models"}</span>
          <button type="button" onClick={() => void loadAssets(true)} disabled={refreshing} className="rounded-lg p-1.5 transition hover:bg-[var(--hyd-50)] disabled:opacity-50" aria-label="Refresh models" title="Refresh models">
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
          {visibleAssets.length ? visibleAssets.map((asset) => {
            const active = asset.id === selectedId;
            const image = asset.previewImageUrl || asset.imageUrl;
            return (
              <button key={asset.id} type="button" onClick={() => { setSelectedId(asset.id); setMobileLibraryOpen(false); }} className={cn("group mb-1 flex w-full items-center gap-3 rounded-xl border px-2.5 py-2 text-left transition", active ? "border-[var(--hyd-400)] bg-[var(--nav-active-bg)] text-[var(--nav-active-fg)] shadow-[var(--shadow-stage)]" : "border-transparent hover:border-[var(--hyd-200)] hover:bg-[var(--hyd-50)]")}>
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[var(--hyd-50)]">
                  {image ? <img src={getProxiedImageUrl(image) || image} alt="" className="h-full w-full object-cover" /> : <Box className="m-3 h-5 w-5 opacity-55" strokeWidth={1.7} />}
                  {loadingIds.has(asset.id) ? <span className="absolute inset-0 flex items-center justify-center bg-[var(--app-canvas)]/70"><LoaderCircle className="h-4 w-4 animate-spin text-[var(--hyd-400)]" /></span> : null}
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-semibold">{assetName(asset)}</span>
                  <span className="mt-0.5 block text-[10px] opacity-55">3D Model</span>
                  <span className="block text-[10px] opacity-55">{formatDate(asset.createdAt)}</span>
                </span>
                <ChevronDown className="h-4 w-4 -rotate-90 opacity-45 transition group-hover:opacity-100" />
              </button>
            );
          }) : (
            <div className="px-3 py-12 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--hyd-50)] text-[var(--hyd-400)]"><Sparkles className="h-5 w-5" /></div>
              <p className="mt-3 text-sm font-semibold">{query ? "No matching models" : "Your world is empty"}</p>
              <p className="mt-1 text-xs leading-5 opacity-55">{query ? "Try a different search." : "Generate a 3D model and it will appear here automatically."}</p>
            </div>
          )}
          {visibleAssets.length < filteredAssets.length ? (
            <button
              type="button"
              onClick={() => setVisibleAssetCount((count) => count + 36)}
              className="mt-2 w-full rounded-xl border border-[var(--hyd-200)] px-3 py-2 text-[11px] font-semibold text-[var(--hyd-ink)] transition hover:bg-[var(--hyd-50)]"
            >
              Load more models
            </button>
          ) : null}
        </div>
      </aside>

      <button type="button" onClick={() => setMobileLibraryOpen(true)} className="absolute left-3 top-3 z-10 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--hyd-200)] bg-[var(--app-canvas)]/90 px-3 py-2 text-xs font-semibold shadow-[var(--shadow-stage)] backdrop-blur md:hidden"><Grid3X3 className="h-3.5 w-3.5 text-[var(--hyd-400)]" /> Models</button>
      <div className="absolute left-1/2 top-5 z-10 hidden -translate-x-1/2 items-center gap-2 rounded-xl border border-[var(--hyd-200)] bg-[var(--app-canvas)]/85 px-3.5 py-2 text-xs font-semibold shadow-[var(--shadow-stage)] backdrop-blur sm:flex">
        <Grid3X3 className="h-3.5 w-3.5 text-[var(--hyd-400)]" strokeWidth={1.8} />
        {assets.length} {assets.length === 1 ? "Model" : "Models"}
      </div>

      <div className="absolute right-3 top-3 z-10 flex items-center gap-0.5 rounded-xl border border-[var(--hyd-200)] bg-[var(--app-canvas)]/85 p-1 shadow-[var(--shadow-stage)] backdrop-blur sm:right-6 sm:top-5">
        {(["orbit", "pan", "zoom"] as CameraMode[]).map((mode) => {
          const Icon = mode === "orbit" ? Orbit : mode === "pan" ? Move : ZoomIn;
          return <button key={mode} type="button" aria-label={mode} onClick={() => setCameraMode(mode)} className={cn("inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium capitalize transition", cameraMode === mode ? "bg-[var(--nav-active-bg)] text-[var(--nav-active-fg)]" : "opacity-65 hover:bg-[var(--hyd-50)] hover:opacity-100")}><Icon className="h-3.5 w-3.5" strokeWidth={1.8} /><span className="hidden sm:inline">{mode}</span></button>;
        })}
        <span className="mx-1 h-4 w-px bg-[var(--hyd-200)]" />
        <button type="button" onClick={() => setResetRequest((value) => value + 1)} className="rounded-lg px-2 py-1.5 text-[11px] font-medium opacity-65 transition hover:bg-[var(--hyd-50)] hover:opacity-100">Reset</button>
      </div>

      {error ? (
        <div role="alert" className="absolute left-1/2 top-20 z-20 flex max-w-[min(520px,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 rounded-xl border border-[var(--hyd-200)] bg-[var(--app-canvas)]/95 px-4 py-3 text-xs shadow-[var(--shadow-stage)] backdrop-blur">
          <span className="min-w-0 flex-1">{error}</span>
          <button type="button" onClick={() => void loadAssets()} className="shrink-0 rounded-lg bg-[var(--hyd-ink)] px-2.5 py-1.5 font-semibold text-[var(--app-canvas)] hover:opacity-80">Retry</button>
        </div>
      ) : null}

      {selected ? (
        <div className="absolute bottom-3 left-1/2 z-10 flex w-[min(540px,calc(100vw-1.5rem))] -translate-x-1/2 items-center gap-2 rounded-2xl border border-[var(--hyd-200)] bg-[var(--app-canvas)]/90 p-2.5 shadow-[var(--shadow-stage-md)] backdrop-blur-xl sm:bottom-6 sm:gap-4 sm:p-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[var(--hyd-50)]">
            {(selected.previewImageUrl || selected.imageUrl) ? <img src={getProxiedImageUrl(selected.previewImageUrl || selected.imageUrl) || selected.previewImageUrl || selected.imageUrl || ""} alt="" className="h-full w-full object-cover" /> : <Box className="m-2.5 h-5 w-5 opacity-55" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{assetName(selected)}</p>
            <p className="mt-0.5 truncate text-[10px] opacity-55">3D Model · {formatDate(selected.createdAt)}{selected.engine ? ` · ${selected.engine}` : ""}</p>
          </div>
          <button type="button" onClick={() => focusSelected(selected.id)} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--hyd-200)] bg-[var(--hyd-50)] px-2.5 py-2 text-[11px] font-semibold transition hover:bg-[var(--nav-active-bg)] hover:text-[var(--nav-active-fg)]"><Focus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Focus</span></button>
          <button type="button" onClick={() => void downloadSelected()} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-[var(--hyd-ink)] px-2.5 py-2 text-[11px] font-semibold text-[var(--app-canvas)] transition hover:opacity-80"><Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Download</span></button>
        </div>
      ) : null}

      {!assets.length && !error ? (
        <div className="absolute left-1/2 top-1/2 z-[1] hidden -translate-x-1/2 -translate-y-1/2 text-center lg:block">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--hyd-200)] bg-[var(--app-canvas)]/75 text-[var(--hyd-400)] shadow-[var(--shadow-stage)] backdrop-blur"><Box className="h-7 w-7" strokeWidth={1.5} /></div>
          <p className="mt-4 text-sm font-semibold">A clean space for your creations</p>
          <p className="mt-1 text-xs opacity-55">Completed 3D models will be placed here automatically.</p>
        </div>
      ) : null}
    </main>
  );
}

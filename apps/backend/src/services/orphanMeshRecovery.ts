import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config } from "../config.js";
import { logger } from "../logger.js";
import { updateJobResult, updateJobStatus } from "../repository/jobs.js";
import { getDirectS3GlbUrl } from "../utils/s3Urls.js";
import { onGenerationCompleted } from "./notifications.js";

const isVercel =
  process.env.VERCEL === "1" ||
  process.env.VERCEL_ENV ||
  process.cwd().startsWith("/var/task") ||
  process.cwd().startsWith("/var/runtime");

const headClient: { value: S3Client | null } = { value: null };

function getHeadClient(): S3Client | null {
  if (headClient.value) {
    return headClient.value;
  }
  const hasAwsCreds = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  if (!hasAwsCreds && isVercel) {
    return null;
  }
  if (!config.s3.bucket) {
    return null;
  }
  headClient.value = new S3Client({ region: config.s3.region });
  return headClient.value;
}

async function s3KeyExists(key: string): Promise<boolean> {
  const client = getHeadClient();
  if (!client || !config.s3.bucket) {
    return false;
  }
  try {
    await client.send(new HeadObjectCommand({ Bucket: config.s3.bucket, Key: key }));
    return true;
  } catch (err: any) {
    const code = err?.Code || err?.name || err?.$metadata?.httpStatusCode;
    if (code === "NoSuchKey" || code === "NotFound" || code === 404) {
      return false;
    }
    logger.warn({ err, key }, "S3 HEAD failed while checking orphan mesh");
    return false;
  }
}

/**
 * Find a completed mesh on S3 that was never written to the job row.
 * Prefers image/{jobId}/mesh.glb, then text/{jobId}/mesh.glb.
 */
export async function findOrphanMeshUrl(jobId: string): Promise<string | null> {
  const imageKey = `image/${jobId}/mesh.glb`;
  if (await s3KeyExists(imageKey)) {
    return getDirectS3GlbUrl(jobId);
  }
  const textKey = `text/${jobId}/mesh.glb`;
  if (await s3KeyExists(textKey)) {
    return `https://${config.s3.bucket}.s3.${config.s3.region}.amazonaws.com/${textKey}`;
  }
  return null;
}

export type OrphanMeshJob = {
  id: string;
  userId: string | null;
  status: string;
  resultGlbUrl?: string | null;
  previewImageUrl?: string | null;
  generateType?: unknown;
  prompt?: string | null;
  createdAt?: string | Date;
  creditsUsed?: number | null;
};

/**
 * If a WAIT/RUN (or already-timed-out FAIL) job already has mesh.glb on S3,
 * promote it to DONE with the S3 URL instead of timing out / refunding.
 * Returns the recovered GLB URL, or null when no mesh exists.
 */
export async function recoverOrphanMeshIfPresent(
  job: OrphanMeshJob
): Promise<string | null> {
  if (job.status !== "WAIT" && job.status !== "RUN" && job.status !== "FAIL") {
    return job.resultGlbUrl ?? null;
  }

  if (job.resultGlbUrl) {
    await updateJobStatus(job.id, {
      status: "DONE",
      errorCode: null,
      errorMessage: null,
    });
    notifyRecovered(job, job.resultGlbUrl);
    return job.resultGlbUrl;
  }

  const glbUrl = await findOrphanMeshUrl(job.id);
  if (!glbUrl) {
    return null;
  }

  await updateJobResult(job.id, {
    resultGlbUrl: glbUrl,
    previewImageUrl: job.previewImageUrl ?? null,
  });
  await updateJobStatus(job.id, {
    status: "DONE",
    errorCode: null,
    errorMessage: null,
  });

  logger.info(
    { jobId: job.id, userId: job.userId, glbUrl, previousStatus: job.status },
    "Recovered orphan mesh from S3 before timeout/fail"
  );

  notifyRecovered(job, glbUrl);
  return glbUrl;
}

function notifyRecovered(job: OrphanMeshJob, glbUrl: string): void {
  if (!job.userId || (job.status !== "WAIT" && job.status !== "RUN")) {
    return;
  }
  onGenerationCompleted({
    userId: job.userId,
    jobId: job.id,
    kind: job.generateType ? String(job.generateType) : null,
    prompt: job.prompt || null,
    createdAt: job.createdAt,
    glbUrl,
    previewUrl: job.previewImageUrl ?? null,
  });
}

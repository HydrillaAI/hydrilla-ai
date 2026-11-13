import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { H2, H3 } from "@/components/Heading";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { FeedbackWidget } from "@/components/FeedbackWidget";

export const metadata = {
  title: "Authentication",
  description:
    "The Hydrilla AI API uses secure Bearer keys to authenticate requests. Manage your keys and monitor usage through the developer dashboard.",
  alternates: { canonical: "https://docs.hydrilla.ai/authentication" },
};

// CONTENT-FLAG: this sample key (hyd_live_d81a9f02b37c4e91823abce) looks like a real key.
// Recommend replacing it with the placeholder hyd_live_your_api_key_here. Kept unchanged for review.
const curlAuth = `curl -X GET https://hydrilla-ai-g1bm.vercel.app/v1/user/me \\
  -H "Authorization: Bearer hyd_live_d81a9f02b37c4e91823abce"`;

const curlApiKeyHeader = `curl -X GET https://hydrilla-ai-g1bm.vercel.app/v1/user/me \\
  -H "x-api-key: hyd_live_d81a9f02b37c4e91823abce"`;

// CONTENT-FLAG: the error message links to hydrilla.co while the API base is api.hydrilla.co (domain mismatch).
const error401 = `{
  "error": "Unauthorized",
  "message": "Invalid or revoked API key. Generate a key at https://hydrilla.co/app/api-keys"
}`;

const error402 = `{
  "error": "Insufficient credits",
  "message": "This operation requires 2 credits, but your balance is 0.",
  "credits_available": 0,
  "credits_required": 2,
  "upgrade_url": "https://hydrilla.co/app/settings"
}`;

export default async function AuthenticationPage() {
  return (
    <div className="prose">
      <PageHeader
        pathname="/authentication"
        heading="Authentication"
        summary="The Hydrilla AI API uses secure Bearer keys to authenticate requests. Manage your keys and monitor usage through the developer dashboard."
      />

      <H2 id="authorization-headers">Authorization headers</H2>
      <p>
        Pass your API key in the <code>Authorization</code> header using standard Bearer
        authentication (recommended):
      </p>
      <CodeBlock code={curlAuth} lang="bash" filename="bearer-header.sh" />
      <p>
        Alternatively, send the key in the <code>x-api-key</code> header:
      </p>
      <CodeBlock code={curlApiKeyHeader} lang="bash" filename="x-api-key-header.sh" />

      <H2 id="key-security">Key security and hashing</H2>
      <div className="mt-3 space-y-3">
        <Callout variant="note" title="One-time reveal">
          <p>
            When you generate a key, the full key (<code>hyd_live_…</code>) is shown once. Store it
            securely in your environment variables.
          </p>
        </Callout>
        <Callout variant="note" title="SHA-256 hashing">
          <p>
            Hydrilla never stores your plaintext API key in the database. Only a cryptographic
            SHA-256 hash is persisted.
          </p>
        </Callout>
        <Callout variant="warning" title="Instant revocation">
          <p>
            You can revoke an API key at any time in the dashboard under{" "}
            <a href="https://hydrilla.co/app/api-keys" target="_blank" rel="noreferrer">
              API Keys
            </a>
            . Revocation is instantaneous.
          </p>
        </Callout>
      </div>

      <H2 id="error-codes">Error codes</H2>
      <H3 id="401-unauthorized">401 Unauthorized</H3>
      <p>Returned if the key is missing, malformed, or has been revoked.</p>
      <CodeBlock code={error401} lang="json" filename="401_UNAUTHORIZED.json" />
      <H3 id="402-insufficient-credits">402 Insufficient credits</H3>
      <p>Returned if your account credit balance is too low to run the generation.</p>
      <CodeBlock code={error402} lang="json" filename="402_INSUFFICIENT_CREDITS.json" />

      <FeedbackWidget />
    </div>
  );
}

import { redirect } from "next/navigation";
import { getIntegration } from "@/lib/integrations";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Plugins used to sign in here. They now use an API key instead, so older
 * plugin versions that still open this address are sent to the setup guide
 * for their app, where the current plugin and the key steps are.
 */
export default async function IntegrationsConnectPage({ searchParams }: Props) {
  const { app } = await searchParams;
  const slug = typeof app === "string" ? app.toLowerCase() : "";
  const integration = getIntegration(slug);
  if (integration && integration.downloadPath) {
    redirect(`/integrations/${integration.slug}`);
  }
  redirect("/integrations");
}

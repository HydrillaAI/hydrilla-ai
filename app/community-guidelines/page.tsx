import Link from "next/link";
import { PickleArticlePage } from "@/components/layout/PicklePage";

export default function CommunityGuidelinesPage() {
  return (
    <PickleArticlePage
      kicker="Community"
      kickerHref="/discover"
      title="Community Guidelines"
      subtitle="The Hydrilla community is a place to share 3D work, learn from each other and find collaborators. These rules keep it useful and safe."
      date="Oct 25, 2026"
      author="Hydrilla Team"
      ctaLabel="Explore the community"
      ctaHref="/discover"
    >
      <h2 className="pickle-h2">Share your own work</h2>
      <div className="pickle-text">
        <p>
          Post models you generated with Hydrilla and images you have the right to share. Don&apos;t post other
          people&apos;s work as your own, and don&apos;t use reference images you don&apos;t have rights to. Nothing you
          generate is public until you post it, and deleting a post or the source asset removes it from the community.
        </p>
      </div>

      <h2 className="pickle-h2">What isn&apos;t allowed</h2>
      <div className="pickle-text">
        <ul>
          <li>Sexual content, or any sexualised depiction of minors.</li>
          <li>Graphic violence or gore presented for shock value.</li>
          <li>Hate, harassment, or content that targets a person or group.</li>
          <li>Impersonating people, brands or Hydrilla staff, including through your username.</li>
          <li>Spam, misleading titles, and posts made to promote unrelated products.</li>
          <li>Real people&apos;s likeness without their consent.</li>
        </ul>
      </div>

      <h2 className="pickle-h2">Licenses</h2>
      <div className="pickle-text">
        <p>
          Every post carries the license you choose when you share it: CC BY-NC 4.0 (the default), CC BY 4.0, CC0, or
          all rights reserved. The license applies to the shared files; it doesn&apos;t change your ownership of your
          generations under our <Link href="/terms">Terms of Service</Link>. If you allow downloads, anyone can
          download the model file, so pick a license you&apos;re comfortable with.
        </p>
      </div>

      <h2 className="pickle-h2">Comments and profiles</h2>
      <div className="pickle-text">
        <p>
          Be constructive. Critique the work, not the person. Your display name, username, bio and avatar are public;
          don&apos;t put personal contact details there that you wouldn&apos;t want everyone to see.
        </p>
      </div>

      <h2 className="pickle-h2">Reports and enforcement</h2>
      <div className="pickle-text">
        <p>
          Use the flag on any post, comment or profile to report it. Reports are reviewed by the Hydrilla team and are
          not shown to the person you report. We may remove content, and repeated or serious violations lead to
          suspension from the community. Suspension doesn&apos;t affect your access to the Studio or your assets.
          Questions or appeals: <a href="mailto:founders@hydrilla.ai">founders@hydrilla.ai</a>.
        </p>
      </div>
    </PickleArticlePage>
  );
}

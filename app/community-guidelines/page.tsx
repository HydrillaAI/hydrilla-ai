import Link from "next/link";
import { PickleArticlePage } from "@/components/layout/PicklePage";

export default function CommunityGuidelinesPage() {
  return (
    <PickleArticlePage
      kicker="Community"
      kickerHref="/discover"
      title="Community Guidelines"
      date="Effective October 26, 2026"
      author="Hydrilla Legal"
      ctaLabel="Explore the community"
      ctaHref="/discover"
    >
      <div className="pickle-text">
        <p>
          These Community Guidelines apply to everything you create, post, or share on Hydrilla AI, including generated
          models, uploads, prompts, posts, comments, and profiles. They keep the Service safe, lawful, and useful for
          everyone, and they form part of our <Link href="/terms">Terms of Service</Link>. Hydrilla AI Private Limited may
          update them from time to time.
        </p>
      </div>

      <h2 className="pickle-h2">1. Be safe and respectful to other users</h2>
      <div className="pickle-text">
        <p>
          Do not create, upload, post, or share content that is abusive, illegal, or violates the rights of others. This
          includes:
        </p>
        <ul>
          <li>Sexually explicit material, and any content that sexualises, exploits, or endangers minors.</li>
          <li>Depictions of real people that are intimate, degrading, or made without their consent.</li>
          <li>Content that harasses, threatens, or promotes hatred or violence against people or groups based on who they are.</li>
          <li>Graphic violence or gore, and content that encourages or glorifies terrorism, self-harm, or illegal activity.</li>
          <li>Deceptive content that could cause real-world harm, and other people&apos;s private information shared without a right to do so.</li>
          <li>Spam, misleading titles, and posts made to promote unrelated products or services.</li>
        </ul>
      </div>

      <h2 className="pickle-h2">2. Represent yourself honestly</h2>
      <div className="pickle-text">
        <p>
          We may disable accounts that deceive others or cause harm. Do not impersonate any person, brand, or Hydrilla AI
          staff, including through your username, display name, or avatar. Do not use unauthorised bots, scripts, or bulk
          uploads, or any scheme that artificially inflates views, likes, downloads, or followers.
        </p>
      </div>

      <h2 className="pickle-h2">3. Respect third-party rights and intellectual property</h2>
      <div className="pickle-text">
        <p>
          Post only models you generated with Hydrilla, and files and images you have the right to share. Do not post
          content that infringes copyright, trademark, privacy, or publicity rights, and do not write prompts or use
          reference images designed to reproduce someone else&apos;s protected work, brand, or likeness. If you believe
          content on Hydrilla infringes your rights, follow the process in section 6 of our{" "}
          <Link href="/terms#copyright">Terms of Service</Link>.
        </p>
      </div>

      <h2 className="pickle-h2">4. Respect Hydrilla AI&apos;s rights</h2>
      <div className="pickle-text">
        <p>
          Do not use the Service, its Outputs, or community content to build, train, or improve a competing AI 3D model
          or service, and do not scrape or copy the Service, our models, or our brand.
        </p>
      </div>

      <h2 className="pickle-h2">5. Licenses on shared content</h2>
      <div className="pickle-text">
        <p>
          Nothing you generate is public until you post it. Each post carries the license you choose when you share it:
          CC BY-NC 4.0 (the default), CC BY 4.0, CC0, or all rights reserved. The license applies to the shared files and
          does not change your ownership of your generations under the Terms. If you allow downloads, anyone can download
          the model file, so choose a license you are comfortable with. Deleting a post or its source asset removes it
          from the community.
        </p>
      </div>

      <h2 className="pickle-h2">6. Comments and profiles</h2>
      <div className="pickle-text">
        <p>
          Critique the work, not the person. Your display name, username, bio, and avatar are public, so do not include
          personal contact details you would not want everyone to see.
        </p>
      </div>

      <h2 className="pickle-h2">7. Reports and enforcement</h2>
      <div className="pickle-text">
        <p>
          Use the flag on any post, comment, or profile to report it. Reports are reviewed by the Hydrilla AI team and are
          not shown to the person reported. We may remove content, restrict features, or suspend or close accounts that
          violate these Guidelines, and we may report illegal content to the authorities. Repeated or serious violations
          lead to removal from the community, and we may take action without prior notice where needed to protect users or
          the Service. To appeal a decision or ask a question, contact us using the details below.
        </p>
      </div>

      <h2 className="pickle-h2">8. Contact</h2>
      <div className="pickle-text">
        <p>
          <strong>Hydrilla AI Private Limited</strong>
          <br />
          5-40A, Ullipatteda, Muthyal Reddy Palli, S V Nagar
          <br />
          Tirupati, Andhra Pradesh 517502, India
          <br />
          Website: <a href="https://hydrilla.ai">hydrilla.ai</a>
          <br />
          Email: <a href="mailto:founders@hydrilla.ai">founders@hydrilla.ai</a>
        </p>
      </div>
    </PickleArticlePage>
  );
}

import { getKitJsonLd } from "@/lib/kit-schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { PickleCta } from "@/components/layout/PicklePage";
import { TEAM_MEMBERS } from "@/lib/team";

const KIT_ROLES: Record<string, string> = {
  "Tharak Nagaveti": "Co-founder & CEO",
  "Dharani Kumar": "Co-founder & CTO",
  "Tejesh Varma": "CGO",
  "Aditya Sontena": "Lead Developer",
  "Rishik Kalyan": "Creative Director",
  "Hem Charan": "Software Engineer",
  "Krishna Manohar": "Data Scientist",
  "Kishan Kumar": "Marketing Head",
};

export default function TeamPage() {
  return (
    <>
      <JsonLd data={getKitJsonLd("/team")} />
      <article className="pickle-article">
        <header className="pickle-article-header">
          <p className="pickle-article-kicker">Company</p>
          <h1 className="pickle-article-title">Team</h1>
          <div className="pickle-lead">
            <p>
              The people at Hydrilla AI building BlueFox, Hydrilla&apos;s 3D model, and the AI 3D workspace. Each card links to that person&apos;s LinkedIn profile.{" "}
              <Link href="/about">About Hydrilla</Link>
            </p>
          </div>
        </header>
        <div className="pickle-article-column">
          <div className="pickle-intro">
            <p>
              We are <strong>a small team</strong> that spans engineering, research, data, creative direction, and marketing. That mix shows up in the product: the people who build the model sit next to the people who judge whether its output works in an artist&apos;s scene.
            </p>
          </div>

          <section className="pickle-section">
            <ul className="grid w-full grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
              {TEAM_MEMBERS.map((member) => {
                const role = KIT_ROLES[member.name] || member.role;
                const card = (
                  <>
                    <Image
                      src={member.image}
                      alt={`Portrait of ${member.name}, ${role} at Hydrilla.`}
                      width={320}
                      height={320}
                      className="aspect-square w-full rounded-[24px] bg-[#f5f5f7] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <span className="mt-3 block text-[17px] font-medium text-black">{member.name}</span>
                    <span className="block text-[15px] text-black/70">{role}</span>
                  </>
                );
                return (
                  <li key={member.id}>
                    {member.connect ? (
                      <a href={member.connect} className="group block">{card}</a>
                    ) : (
                      card
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
          <PickleCta
            line={
              <>
                We&apos;re hiring across engineering and research. <Link href="/careers">See open roles</Link>
              </>
            }
            secondary={{ label: "See open roles", href: "/careers" }}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}

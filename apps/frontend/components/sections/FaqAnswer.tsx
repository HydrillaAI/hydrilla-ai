import Link from "next/link";

const SITE = "https://hydrilla.ai";
const URL_PATTERN = /(https:\/\/hydrilla\.ai\/[^\s]*[^\s.,)])/g;

/** FAQ answers are plain strings; hydrilla.ai URLs inside them render as links. */
export function FaqAnswer({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_PATTERN).map((part, index) =>
        part.startsWith(`${SITE}/`) ? (
          <Link key={index} href={part.slice(SITE.length)} className="faq-answer-link">
            {part.slice("https://".length)}
          </Link>
        ) : (
          part
        )
      )}
    </>
  );
}

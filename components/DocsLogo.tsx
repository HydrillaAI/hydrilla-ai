import Image from "next/image";

export function DocsLogo() {
  return (
    <>
      <Image
        src="/logo-hydrilla/hydsvgblack.svg"
        alt="Hydrilla"
        width={82}
        height={24}
        priority
        className="h-6 w-auto dark:hidden"
      />
      <Image
        src="/logo-hydrilla/hydsvg.svg"
        alt=""
        width={82}
        height={24}
        priority
        className="hidden h-6 w-auto dark:block"
      />
    </>
  );
}

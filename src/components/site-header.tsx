import Link from "next/link";
import { focusRing } from "@/components/styles";

const LINKS = [
  { href: "/#modelos", label: "Modelos" },
  { href: "/perguntas-frequentes", label: "Dúvidas" },
  { href: "/contato", label: "Contato" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-foreground/15">
      <nav aria-label="Principal" className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className={`flex min-h-11 items-center font-semibold ${focusRing}`}>
          Plaquinhas NFC
        </Link>
        <ul className="flex gap-4 text-sm">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={`flex min-h-11 items-center underline-offset-4 hover:underline ${focusRing}`}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

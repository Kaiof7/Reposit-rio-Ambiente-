"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { focusRing } from "@/components/styles";

const LINKS = [
  { href: "/#modelos", label: "Modelos" },
  { href: "/perguntas-frequentes", label: "Dúvidas" },
  { href: "/contato", label: "Contato" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="border-b border-foreground/15">
      <nav aria-label="Principal" className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className={`flex min-h-11 items-center font-semibold ${focusRing}`}>
          Sua Plaquinha NFC
        </Link>
        <ul className="flex gap-4 text-sm">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={link.href === pathname ? "page" : undefined}
                className={`flex min-h-11 items-center underline-offset-4 hover:underline aria-[current=page]:font-semibold ${focusRing}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

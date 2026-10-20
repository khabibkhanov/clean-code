import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Darslar", template: "%s | Darslar" },
  description: "Chuqur, manbalarga tayangan dasturlash kurslari o'zbek tilida.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <header className="border-b border-rule">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/clean-code" className="font-semibold tracking-tight">
              Clean Code
            </Link>
            {/* Hub lives in another zone, so a plain <a> (hard navigation), not <Link>. */}
            <a href="/" className="text-sm text-muted hover:text-ink">
              Kurslar
            </a>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}

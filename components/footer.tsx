import Link from "next/link";

const footerSections = [
  {
    title: "Product",
    links: [
      { href: "/events", label: "Browse Events" },
      { href: "/categories", label: "Categories" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/support", label: "Help Center" },
      { href: "/login", label: "Sign In" },
      { href: "/register", label: "Create Account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "#", label: "Terms" },
      { href: "#", label: "Privacy" },
      { href: "#", label: "Refunds" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-black/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          <div className="max-w-md space-y-3">
            <p className="text-lg font-semibold uppercase tracking-[0.2em] text-white">EventHub</p>
            <p className="text-sm leading-7 text-white/60">
              Cloud-native event discovery and ticket booking designed for premium, high-conversion customer journeys.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h2 className="text-sm font-semibold text-white">{section.title}</h2>
                <div className="flex flex-col gap-2">
                  {section.links.map((link) => (
                    <Link key={link.label} href={link.href} className="text-sm text-white/60 transition hover:text-white">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-white/8 pt-6 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 EventHub. All rights reserved.</p>
          <p>Instagram / LinkedIn / X</p>
        </div>
      </div>
    </footer>
  );
}

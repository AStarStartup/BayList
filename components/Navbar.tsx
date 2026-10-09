import Link from "next/link";
import { Github } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "Services", href: "/services" },
    { name: "Photography", href: "/photography" },
    { name: "Store", href: "/store" },
    { name: "3D Printing", href: "/3d-printing" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md border-slate-200">
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-black tracking-tighter text-slate-900 hover:opacity-80 transition-opacity"
        >
          BayList
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <a
          href="https://github.com/AStarStartup"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-600 hover:text-blue-600 transition-colors"
          aria-label="GitHub"
        >
          <Github className="w-5 h-5" />
        </a>
      </div>
    </nav>
  );
}

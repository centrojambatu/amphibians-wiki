"use client";

import {useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {Menu, X, ChevronDown} from "lucide-react";

import {Button} from "@/components/ui/button";

interface SubMenuItem {
  href: string;
  label: string;
  external?: boolean;
}

interface NavLink {
  href: string;
  label: string;
  submenu?: SubMenuItem[];
}

const navLinks: NavLink[] = [
  {
    href: "/sapopedia",
    label: "Anfibios Ecuador",
  },
  {
    href: "#",
    label: "Lista Roja",
  },
  {
    href: "#",
    label: "Nombres",
    submenu: [
      { href: "/sapopedia/nombres", label: "Nombres estándar" },
      { href: "https://deepskyblue-beaver-511675.hostingersite.com/jambatu/", label: "Jambatu", external: true },
      { href: "https://deepskyblue-beaver-511675.hostingersite.com/rana-sapo/", label: "Rana o Sapo", external: true },
      { href: "https://deepskyblue-beaver-511675.hostingersite.com/nombres-estandarizados/", label: "Nombres estandarizados", external: true },
      { href: "/sapopedia/nombres-vernaculos", label: "Nombres vernáculos" },
      { href: "https://deepskyblue-beaver-511675.hostingersite.com/nombres-indigenas-vernaculos/", label: "Nombres indígenas", external: true },
      { href: "/sapopedia/nombres-renacuajos", label: "Nombres de renacuajos" },

      { href: "https://deepskyblue-beaver-511675.hostingersite.com/renacuajos/", label: "Renacuajos", external: true },

    ],
  },
  {href: "/sapoteca", label: "Biblioteca"},
  {href: "/mapoteca", label: "Mapoteca"},
  {href: "/videoteca", label: "Videoteca"},
  {href: "/fonoteca", label: "Fonoteca"},
  {href: "/fototeca", label: "Fototeca"},
  {href: "/moleculoteca", label: "Moleculoteca"},
  {href: "/sapopedia/editor-citas", label: "Editor Ficha Especie"},
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => {
    setIsOpen(false);
    setMobileSubmenuOpen(null);
  };

  const toggleMobileSubmenu = (label: string) => {
    setMobileSubmenuOpen(mobileSubmenuOpen === label ? null : label);
  };

  return (
    <header className="sticky top-0 z-[100] bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link className="flex items-center gap-2 !no-underline hover:!no-underline" href="/sapopedia" onClick={closeMenu} style={{ textDecoration: "none" }}>
            <Image
              priority
              alt="Anfibios de Ecuador"
              className="h-auto w-auto"
              height={45}
              src="/assets/references/logo.png"
              width={150}
            />
            <span
              className="text-[11px] font-bold tracking-widest no-underline hover:no-underline"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", color: "#f07304", textDecoration: "none" }}
            >
              SAPOPEDIA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 lg:flex xl:gap-4">
            {navLinks.map((link) => (
              link.submenu ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setOpenSubmenu(link.label)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  <Button className="cursor-pointer text-sm gap-1" variant="ghost">
                    {link.label}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  {openSubmenu === link.label && (
                    <div className="absolute left-0 top-full z-[110] min-w-[180px] rounded-md border bg-background py-0 px-0.5 shadow-lg">
                      {link.submenu.map((sublink) => (
                        sublink.external ? (
                          <a
                            key={sublink.href}
                            href={sublink.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block -mb-1 last:mb-0"
                          >
                            <Button
                              className="w-full cursor-pointer justify-start text-sm !text-[#f07304] hover:!text-[#f07304] !h-7 !py-0.5"
                              variant="ghost"
                              onClick={() => setOpenSubmenu(null)}
                            >
                              {sublink.label}
                            </Button>
                          </a>
                        ) : (
                          <Link key={sublink.href} href={sublink.href} className="block mt-2 first:mt-0">
                            <Button
                              className="w-full cursor-pointer justify-start text-sm !h-7 !py-0.5"
                              variant="ghost"
                              onClick={() => setOpenSubmenu(null)}
                            >
                              {sublink.label}
                            </Button>
                          </Link>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={link.label} href={link.href}>
                  <Button className="cursor-pointer text-sm" variant="ghost">
                    {link.label}
                  </Button>
                </Link>
              )
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            className="lg:hidden"
            size="icon"
            variant="ghost"
            onClick={toggleMenu}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="mt-4 flex flex-col gap-2 border-t pt-4 lg:hidden">
            {navLinks.map((link) => (
              link.submenu ? (
                <div key={link.label}>
                  <Button
                    className="w-full cursor-pointer justify-between"
                    variant="ghost"
                    onClick={() => toggleMobileSubmenu(link.label)}
                  >
                    {link.label}
                    <ChevronDown className={`h-4 w-4 transition-transform ${mobileSubmenuOpen === link.label ? "rotate-180" : ""}`} />
                  </Button>
                  {mobileSubmenuOpen === link.label && (
                    <div className="ml-4 flex flex-col gap-0 border-l pl-2">
                      {link.submenu.map((sublink) => (
                        sublink.external ? (
                          <a
                            key={sublink.href}
                            href={sublink.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={closeMenu}
                            className="block -mb-1 last:mb-0"
                          >
                            <Button
                              className="w-full cursor-pointer justify-start text-sm !text-[#f07304] hover:!text-[#f07304] !h-7 !py-0.5"
                              variant="ghost"
                            >
                              {sublink.label}
                            </Button>
                          </a>
                        ) : (
                          <Link key={sublink.href} href={sublink.href} onClick={closeMenu} className="block mt-2 first:mt-0">
                            <Button className="w-full cursor-pointer justify-start text-sm !h-7 !py-0.5" variant="ghost">
                              {sublink.label}
                            </Button>
                          </Link>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={link.label} href={link.href} onClick={closeMenu}>
                  <Button className="w-full cursor-pointer justify-start" variant="ghost">
                    {link.label}
                  </Button>
                </Link>
              )
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

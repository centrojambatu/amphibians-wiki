"use client";

import {useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {Menu, X} from "lucide-react";

import {Button} from "@/components/ui/button";

const navLinks = [
  {href: "/sapopedia", label: "Sapopedia"},
  {href: "/sapopedia/lista-roja", label: "Lista Roja"},
  {href: "/sapopedia/nombres", label: "Nombres"},
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

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link className="flex items-center" href="/sapopedia" onClick={closeMenu}>
            <Image
              priority
              alt="Anfibios de Ecuador"
              className="h-auto w-auto"
              height={45}
              src="/assets/references/logo.png"
              width={150}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 lg:flex xl:gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button className="cursor-pointer text-sm" variant="ghost">
                  {link.label}
                </Button>
              </Link>
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
              <Link key={link.href} href={link.href} onClick={closeMenu}>
                <Button className="w-full cursor-pointer justify-start" variant="ghost">
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

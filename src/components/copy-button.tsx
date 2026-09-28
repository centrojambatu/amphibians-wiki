"use client";

import {useState} from "react";
import {Check, Copy} from "lucide-react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export default function CopyButton({text, className = ""}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Eliminar tags HTML para copiar solo el texto
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = text;
      const plainText = tempDiv.textContent || tempDiv.innerText || "";

      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copiado" : "Copiar al portapapeles"}
      className={`text-muted-foreground hover:text-foreground inline-flex items-center px-2 py-1 transition-colors ${className}`}
      title={copied ? "¡Copiado!" : "Copiar al portapapeles"}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

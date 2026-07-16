"use client";

import {MoveLeft} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

interface BackArrowProps {
  fallbackHref?: string;
  className?: string;
}

export const BackArrow = ({
  fallbackHref = "/sapopedia",
  className,
}: BackArrowProps) => {
  const router = useRouter();
  const [hasInternalReferrer, setHasInternalReferrer] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const referrer = document.referrer;

    if (!referrer) return;
    try {
      const referrerUrl = new URL(referrer);

      if (
        referrerUrl.origin === window.location.origin &&
        referrerUrl.pathname !== window.location.pathname
      ) {
        setHasInternalReferrer(true);
      }
    } catch {
      // referrer inválido, mantener fallback
    }
  }, []);

  const baseClassName =
    "text-muted-foreground inline-flex items-center hover:no-underline";

  const finalClassName = className
    ? `${baseClassName} ${className}`
    : baseClassName;

  if (hasInternalReferrer) {
    return (
      <button
        aria-label="Volver"
        className={finalClassName}
        type="button"
        onClick={() => {
          router.back();
        }}
      >
        <MoveLeft className="h-8 w-8" strokeWidth={1} />
      </button>
    );
  }

  return (
    <Link aria-label="Volver" className={finalClassName} href={fallbackHref}>
      <MoveLeft className="h-8 w-8" strokeWidth={1} />
    </Link>
  );
};

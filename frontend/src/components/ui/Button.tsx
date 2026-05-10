import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "nav";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-action text-canvas hover:bg-[#1a1a1a] active:bg-[#2a2a2a] rounded-pill px-6 py-3 text-body font-medium",
  ghost:
    "bg-transparent text-ink border border-concrete hover:bg-sage rounded-pill px-6 py-[11px] text-body font-medium",
  nav:
    "bg-transparent text-ink hover:bg-sage rounded-nav px-[18px] py-[11px] text-body font-medium",
};

export function Button({ variant = "primary", className = "", children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

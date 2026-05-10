interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeader({ eyebrow, title, subtitle, align = "left" }: Props) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-[720px] mb-10 ${alignCls}`}>
      {eyebrow ? (
        <div className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-gunmetal mb-3">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="text-heading-lg font-medium text-ink">{title}</h2>
      {subtitle ? (
        <p className="mt-3 text-body-lg text-gunmetal leading-[1.5]">{subtitle}</p>
      ) : null}
    </div>
  );
}

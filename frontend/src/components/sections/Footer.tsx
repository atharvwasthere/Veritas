export function Footer() {
  return (
    <footer className="bg-ink text-canvas mt-section relative overflow-hidden">
      <img
        src="/img/flatiron.webp"
        alt=""
        aria-hidden
        className="absolute right-10 -bottom-6 h-[260px] opacity-[0.08] invert pointer-events-none select-none"
      />
      <div className="mx-auto max-w-page px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-10 relative">
        <div>
          <div className="flex items-center gap-2">
            <img
              src="/img/logo.png"
              alt=""
              aria-hidden
              className="h-7 w-7 object-contain invert"
            />
            <span className="font-mono text-[16px] tracking-[0.16em]">VERITAS</span>
          </div>
          <p className="mt-4 text-body text-canvas/60 leading-[1.5] max-w-[260px]">
            Public-source diligence for pre-seed VC analysts. Built with Anakin · Hackathon
            2026 · Bangalore.
          </p>
        </div>
        <FooterCol title="Product" links={["How it works", "Scores", "Frameworks", "Export"]} />
        <FooterCol title="Built with" links={["Anakin", "Claude", "FastAPI", "PptxGenJS"]} />
        <FooterCol title="Resources" links={["Privacy", "Terms", "Contact"]} />
      </div>
      <div className="border-t border-canvas/10 relative">
        <div className="mx-auto max-w-page px-10 py-6 flex items-center justify-between text-body-sm text-canvas/50">
          <span>© 2026 Veritas</span>
          <span className="font-mono">v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-canvas/60 mb-4">
        {title}
      </div>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-body text-canvas/80 hover:text-canvas">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "../ui/Button";

interface Props {
  onCta: () => void;
}

const linkBase =
  "rounded-nav px-[18px] py-[11px] text-body text-ink hover:bg-sage transition-colors";

export function Nav({ onCta }: Props) {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 bg-canvas/85 backdrop-blur border-b border-stone"
    >
      <div className="mx-auto max-w-page px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <NavLink to="/" className="flex items-center gap-2 text-ink">
            <img
              src="/img/logo.png"
              alt="Veritas logo"
              className="h-7 w-7 object-contain"
            />
            <span className="font-mono text-[16px] font-medium tracking-[0.16em]">
              VERITAS
            </span>
          </NavLink>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/scores"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "bg-sage font-medium" : ""}`
              }
            >
              Scores
            </NavLink>
            <NavLink
              to="/frameworks"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "bg-sage font-medium" : ""}`
              }
            >
              Frameworks
            </NavLink>
            <NavLink
              to="/method"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "bg-sage font-medium" : ""}`
              }
            >
              Method
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => window.open("https://anakin.io", "_blank")}
          >
            Powered by Anakin
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              navigate("/");
              setTimeout(onCta, 80);
            }}
          >
            Run audit
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

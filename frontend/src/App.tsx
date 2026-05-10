import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

import { AuditProvider, useAudit } from "@/lib/auditContext";

import { Nav } from "./components/sections/Nav";
import { Footer } from "./components/sections/Footer";
import { Landing } from "./pages/Landing";
import { AuditOverview } from "./pages/AuditOverview";
import { Scores } from "./pages/Scores";
import { Frameworks } from "./pages/Frameworks";
import { ScoresInfo } from "./pages/ScoresInfo";
import { FrameworksInfo } from "./pages/FrameworksInfo";
import { MethodInfo } from "./pages/MethodInfo";

function PageShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isRunning } = useAudit();

  // Auto-route to /audit when a run starts from landing.
  useEffect(() => {
    if (isRunning && location.pathname === "/") navigate("/audit");
  }, [isRunning, location.pathname, navigate]);

  // Scroll to top on route change.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const focusInput = () => {
    if (location.pathname !== "/") navigate("/");
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>("input[type=text]");
      input?.focus();
      input?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Nav onCta={focusInput} />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes location={location}>
              <Route path="/" element={<Landing />} />

              {/* Public/marketing info pages */}
              <Route path="/scores" element={<ScoresInfo />} />
              <Route path="/frameworks" element={<FrameworksInfo />} />
              <Route path="/method" element={<MethodInfo />} />

              {/* Live audit + report views */}
              <Route path="/audit" element={<AuditOverview />} />
              <Route path="/audit/scores" element={<Scores />} />
              <Route path="/audit/frameworks" element={<Frameworks />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuditProvider>
      <PageShell />
    </AuditProvider>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function IntroWipe() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink pointer-events-none"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="display text-paper text-4xl md:text-6xl tracking-tight"
          >
            ROHAN
            <span className="text-signal">.</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

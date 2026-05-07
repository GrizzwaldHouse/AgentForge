"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  glow?: boolean;
  hover?: boolean;
}

export function GlassPanel({ className, glow = false, hover = false, children, ...props }: GlassPanelProps) {
  return (
    <motion.div
      className={cn(
        "relative rounded-2xl border backdrop-blur-2xl overflow-hidden",
        "bg-white/[0.06] border-white/[0.10]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]",
        glow && "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/[0.08] before:to-transparent before:pointer-events-none",
        hover && "hover:border-white/[0.18] hover:bg-white/[0.09] transition-all duration-300",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

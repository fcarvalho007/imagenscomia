import { cn } from "@/lib/utils";
import { ReactNode, useCallback, useRef, useState } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const SpotlightCard = ({ children, className, style }: SpotlightCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const prefersReduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setPos({ x: -1000, y: -1000 }); }}
      className={cn("relative overflow-hidden transition-all duration-300", className)}
      style={{
        ...style,
        transform: hovering && !prefersReduced ? "translateY(-2px)" : undefined,
        borderColor: hovering ? "rgba(22,163,74,0.3)" : undefined,
        boxShadow: hovering ? "0 8px 30px rgba(22,163,74,0.08)" : undefined,
      }}
    >
      {/* Spotlight gradient */}
      {hovering && !prefersReduced && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, rgba(22,163,74,0.08), transparent 60%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

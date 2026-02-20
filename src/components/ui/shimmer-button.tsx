import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ShimmerButtonProps {
  children: ReactNode;
  className?: string;
}

export const ShimmerButton = ({ children, className }: ShimmerButtonProps) => (
  <div className={cn("relative inline-block shimmer-btn-wrapper", className)}>
    {children}
    <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden shimmer-sweep" />
    <style>{`
      @media (prefers-reduced-motion: no-preference) {
        .shimmer-btn-wrapper {
          animation: shimmer-pulse 2s ease-in-out infinite;
        }
        .shimmer-btn-wrapper:hover {
          transform: scale(1.02);
          transition: transform 0.2s ease;
        }
        .shimmer-sweep::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 40%,
            rgba(255,255,255,0.15) 50%,
            transparent 60%
          );
          background-size: 200% 100%;
          animation: shimmer-sweep-move 3s linear infinite;
        }
      }
      @keyframes shimmer-pulse {
        0%, 100% { box-shadow: 0 0 20px rgba(22,163,74,0.4); }
        50% { box-shadow: 0 0 30px rgba(22,163,74,0.55); }
      }
      .shimmer-btn-wrapper:hover {
        box-shadow: 0 0 35px rgba(22,163,74,0.6) !important;
      }
      @keyframes shimmer-sweep-move {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

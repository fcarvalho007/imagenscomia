import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  className?: string;
  intensity?: number;
}

export const AuroraBackground = ({ className, intensity = 1 }: AuroraBackgroundProps) => (
  <div className={cn("absolute inset-0 overflow-hidden", className)} style={{ background: "#050709" }}>
    {/* Blob 1 — green */}
    <div
      className="absolute w-[600px] h-[600px] rounded-full aurora-blob-1"
      style={{
        background: `radial-gradient(circle, rgba(22,163,74,${0.15 * intensity}) 0%, transparent 70%)`,
        top: "10%",
        left: "20%",
      }}
    />
    {/* Blob 2 — blue */}
    <div
      className="absolute w-[500px] h-[500px] rounded-full aurora-blob-2"
      style={{
        background: `radial-gradient(circle, rgba(29,78,216,${0.10 * intensity}) 0%, transparent 70%)`,
        top: "40%",
        right: "15%",
      }}
    />
    {/* Blob 3 — violet */}
    <div
      className="absolute w-[550px] h-[550px] rounded-full aurora-blob-3"
      style={{
        background: `radial-gradient(circle, rgba(124,58,237,${0.08 * intensity}) 0%, transparent 70%)`,
        bottom: "10%",
        left: "40%",
      }}
    />
    {/* Noise grain overlay */}
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.03 }}>
      <filter id="aurora-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#aurora-noise)" />
    </svg>

    <style>{`
      @media (prefers-reduced-motion: no-preference) {
        .aurora-blob-1 {
          animation: aurora-float-1 20s ease-in-out infinite;
        }
        .aurora-blob-2 {
          animation: aurora-float-2 25s ease-in-out infinite;
        }
        .aurora-blob-3 {
          animation: aurora-float-3 30s ease-in-out infinite;
        }
      }
      @keyframes aurora-float-1 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(60px, -40px) scale(1.1); }
        66% { transform: translate(-30px, 30px) scale(0.95); }
      }
      @keyframes aurora-float-2 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(-50px, 50px) scale(1.08); }
        66% { transform: translate(40px, -20px) scale(0.92); }
      }
      @keyframes aurora-float-3 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(40px, 40px) scale(1.05); }
        66% { transform: translate(-60px, -30px) scale(0.97); }
      }
    `}</style>
  </div>
);

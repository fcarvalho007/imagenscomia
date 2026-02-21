import googleLogo from "@/assets/logos/google.png";
import chatgptLogo from "@/assets/logos/chatgpt.webp";
import claudeLogo from "@/assets/logos/claude.png";
import freepikLogo from "@/assets/logos/freepik.png";
import bytedanceLogo from "@/assets/logos/bytedance.svg";
import geminiLogo from "@/assets/logos/gemini.png";
import llamaLogo from "@/assets/logos/llama-meta.png";
import runcomfyLogo from "@/assets/logos/runcomfy.webp";

const logos = [
  { src: googleLogo, alt: "Google" },
  { src: chatgptLogo, alt: "ChatGPT" },
  { src: claudeLogo, alt: "Claude" },
  { src: freepikLogo, alt: "Freepik" },
  { src: bytedanceLogo, alt: "ByteDance" },
  { src: geminiLogo, alt: "Gemini" },
  { src: llamaLogo, alt: "LLaMA by Meta" },
  { src: runcomfyLogo, alt: "RunComfy" },
];

export const LogoMarquee = ({ label = "Plataformas a considerar" }: { label?: string }) => {
  return (
    <section
      className="py-8"
      style={{
        background: "#060D1A",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <p className="text-center text-sm uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </p>

      <div
        className="relative overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="flex w-max animate-marquee">
          {[...logos, ...logos].map((logo, i) => (
            <img
              key={i}
              src={logo.src}
              alt={logo.alt}
              className="h-7 mx-10 object-contain transition-opacity duration-300 hover:opacity-80"
              style={{
                filter: "brightness(0) invert(1)",
                opacity: 0.5,
              }}
              loading="lazy"
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
};

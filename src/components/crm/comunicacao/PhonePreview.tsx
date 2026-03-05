import { Wifi, Battery, Signal } from "lucide-react";

interface PhonePreviewProps {
  sender: string;
  message: string;
}

export default function PhonePreview({ sender, message }: PhonePreviewProps) {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center">
      {/* Phone frame */}
      <div
        className="relative w-[260px] rounded-[2.2rem] p-[10px] shadow-2xl"
        style={{
          background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
          border: "2px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 60px -15px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Screen */}
        <div
          className="rounded-[1.6rem] overflow-hidden relative"
          style={{
            background: "linear-gradient(180deg, #0c1524 0%, #111827 100%)",
            minHeight: 420,
          }}
        >
          {/* Notch */}
          <div className="flex justify-center pt-2 pb-1">
            <div
              className="w-[90px] h-[22px] rounded-full"
              style={{ background: "#000", border: "1px solid rgba(255,255,255,0.05)" }}
            />
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-5 py-1 text-[9px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            <span className="font-medium">{timeStr}</span>
            <div className="flex items-center gap-1">
              <Signal size={9} />
              <Wifi size={9} />
              <Battery size={9} />
            </div>
          </div>

          {/* Conversation header */}
          <div
            className="mx-3 mt-2 rounded-xl px-3 py-2.5 flex items-center gap-2.5"
            style={{
              background: "rgba(255,255,255,0.05)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                color: "#fff",
              }}
            >
              {sender.charAt(0)}
            </div>
            <div>
              <div className="text-[11px] font-semibold text-white/90 leading-tight">{sender}</div>
              <div className="text-[9px] text-white/35">SMS</div>
            </div>
          </div>

          {/* Messages area */}
          <div className="px-3 py-4 flex flex-col gap-2 min-h-[260px]">
            {message ? (
              <div className="flex justify-start">
                <div
                  className="max-w-[85%] rounded-2xl rounded-tl-md px-3.5 py-2.5 text-[11px] leading-relaxed"
                  style={{
                    background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.15))",
                    border: "1px solid rgba(59,130,246,0.2)",
                    color: "rgba(255,255,255,0.9)",
                    wordBreak: "break-word",
                  }}
                >
                  {message}
                  <div className="text-[8px] text-white/30 text-right mt-1.5">{timeStr}</div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[10px] text-white/20 italic text-center px-4">
                  A mensagem aparecerá aqui em tempo real…
                </p>
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-0 inset-x-0 px-4 pb-3 pt-2">
            <div className="w-[100px] h-[4px] rounded-full mx-auto" style={{ background: "rgba(255,255,255,0.15)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

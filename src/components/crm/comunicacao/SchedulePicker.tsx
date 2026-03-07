import { useState } from "react";
import { Clock, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SchedulePickerProps {
  scheduledAt: Date | null;
  onChange: (date: Date | null) => void;
}

export default function SchedulePicker({ scheduledAt, onChange }: SchedulePickerProps) {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("09:00");

  const toggle = () => {
    if (enabled) {
      setEnabled(false);
      onChange(null);
    } else {
      setEnabled(true);
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const [h, m] = time.split(":").map(Number);
      d.setHours(h, m, 0, 0);
      onChange(d);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const [h, m] = time.split(":").map(Number);
    date.setHours(h, m, 0, 0);
    onChange(date);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (scheduledAt) {
      const d = new Date(scheduledAt);
      const [h, m] = newTime.split(":").map(Number);
      d.setHours(h, m, 0, 0);
      onChange(d);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Toggle */}
      <div className="flex items-center gap-1.5 p-0.5 rounded-lg" style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
        <button
          onClick={() => { if (enabled) toggle(); }}
          className="text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all"
          style={{
            background: !enabled ? "#FFFFFF" : "transparent",
            color: !enabled ? "#2563eb" : "#94A3B8",
            boxShadow: !enabled ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          }}
        >
          Agora
        </button>
        <button
          onClick={() => { if (!enabled) toggle(); }}
          className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all"
          style={{
            background: enabled ? "#FFFFFF" : "transparent",
            color: enabled ? "#2563eb" : "#94A3B8",
            boxShadow: enabled ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          }}
        >
          <Clock size={10} /> Agendar
        </button>
      </div>

      {enabled && (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className={cn("flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all", scheduledAt ? "text-slate-800" : "text-slate-400")} style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0" }}>
                <CalendarIcon size={12} />
                {scheduledAt ? format(scheduledAt, "dd/MM/yyyy") : "Escolher data"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={scheduledAt || undefined}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date()}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg outline-none"
            style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", color: "#1e293b" }}
          />
        </div>
      )}
    </div>
  );
}

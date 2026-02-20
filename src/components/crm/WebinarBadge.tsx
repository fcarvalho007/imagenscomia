import { webinarBadgeStyle } from "@/config/webinarConfig";

interface WebinarBadgeProps {
  webinar: string;
  className?: string;
}

export default function WebinarBadge({ webinar, className = "" }: WebinarBadgeProps) {
  const style = webinarBadgeStyle(webinar);
  return (
    <span
      className={`inline-block text-[8px] font-bold px-[5px] py-[2px] rounded-[3px] leading-none uppercase ${className}`}
      style={{ background: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}

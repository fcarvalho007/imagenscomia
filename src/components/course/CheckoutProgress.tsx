import { Check } from "lucide-react";

export function CheckoutProgress({ labels, current }: { labels: string[]; current: number }) {
  return <ol className="checkout-progress" aria-label="Etapas do checkout">
    {labels.map((label, index) => <li key={label} aria-current={index === current ? "step" : undefined} className={index < current ? "is-complete" : ""}>
      <span className="checkout-progress-dot" aria-hidden="true">{index < current ? <Check size={14} /> : index + 1}</span>
      <span>{label}</span>
    </li>)}
  </ol>;
}

import { useState } from "react";
import { Plus, X, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Attendee {
  firstName: string;
  lastName: string;
  email: string;
}

const PRICE_PER_PERSON = 57.81;
const DISCOUNT_THRESHOLD = 3;
const DISCOUNT_RATE = 0.10;

function calcTotal(count: number) {
  const base = count * PRICE_PER_PERSON;
  if (count >= DISCOUNT_THRESHOLD) return base * (1 - DISCOUNT_RATE);
  return base;
}

export default function GroupCheckoutForm() {
  const [buyer, setBuyer] = useState({ firstName: "", lastName: "", email: "", company: "" });
  const [attendees, setAttendees] = useState<Attendee[]>([
    { firstName: "", lastName: "", email: "" },
    { firstName: "", lastName: "", email: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = attendees.length;
  const hasDiscount = count >= DISCOUNT_THRESHOLD;
  const baseTotal = count * PRICE_PER_PERSON;
  const total = calcTotal(count);

  const updateAttendee = (idx: number, field: keyof Attendee, value: string) => {
    setAttendees((prev) => prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  };

  const addAttendee = () => {
    if (count >= 10) return;
    setAttendees((prev) => [...prev, { firstName: "", lastName: "", email: "" }]);
  };

  const removeAttendee = (idx: number) => {
    if (count <= 1) return;
    setAttendees((prev) => prev.filter((_, i) => i !== idx));
  };

  const isValid =
    buyer.firstName.trim() &&
    buyer.email.trim() &&
    attendees.every((a) => a.firstName.trim() && a.email.trim());

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnErr } = await supabase.functions.invoke("create-group-payment", {
        body: {
          buyer: {
            firstName: buyer.firstName.trim(),
            lastName: buyer.lastName.trim(),
            email: buyer.email.trim().toLowerCase(),
            company: buyer.company.trim() || undefined,
          },
          attendees: attendees.map((a) => ({
            firstName: a.firstName.trim(),
            lastName: a.lastName.trim(),
            email: a.email.trim().toLowerCase(),
          })),
          plan: "masterclass",
          webinar: "video",
          discountApplied: hasDiscount,
        },
      });

      if (fnErr) throw fnErr;
      if (data?.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        throw new Error("Sem link de pagamento");
      }
    } catch (err: unknown) {
      console.error("Group payment error:", err);
      setError(err instanceof Error ? err.message : "Erro ao processar. Tenta novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Buyer info */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-4 h-4" /> Quem paga
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Primeiro nome *"
            value={buyer.firstName}
            onChange={(e) => setBuyer((b) => ({ ...b, firstName: e.target.value }))}
            className="col-span-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-purple-300"
          />
          <input
            placeholder="Apelido"
            value={buyer.lastName}
            onChange={(e) => setBuyer((b) => ({ ...b, lastName: e.target.value }))}
            className="col-span-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-purple-300"
          />
        </div>
        <input
          type="email"
          placeholder="Email (recebe o recibo) *"
          value={buyer.email}
          onChange={(e) => setBuyer((b) => ({ ...b, email: e.target.value }))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-purple-300"
        />
        <input
          placeholder="Empresa (opcional)"
          value={buyer.company}
          onChange={(e) => setBuyer((b) => ({ ...b, company: e.target.value }))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-purple-300"
        />
      </div>

      {/* Attendees */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Participantes na Masterclass</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Cada participante recebe um email de confirmação</p>
        </div>

        <div className="space-y-2">
          {attendees.map((a, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                placeholder={`Nome ${idx + 1} *`}
                value={a.firstName}
                onChange={(e) => updateAttendee(idx, "firstName", e.target.value)}
                className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-purple-300"
              />
              <input
                type="email"
                placeholder={`Email ${idx + 1} *`}
                value={a.email}
                onChange={(e) => updateAttendee(idx, "email", e.target.value)}
                className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-purple-300"
              />
              {count > 1 && (
                <button
                  type="button"
                  onClick={() => removeAttendee(idx)}
                  className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {count < 10 && (
          <button
            type="button"
            onClick={addAttendee}
            className="w-full py-2 rounded-lg border border-dashed border-purple-300 text-[#7c3aed] text-[13px] font-medium hover:bg-purple-50 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar participante
          </button>
        )}
      </div>

      {/* Price summary */}
      <div className="rounded-xl bg-[#f5f3ff] border border-[#e9d5ff] p-4 space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-gray-700">
            {count} participante{count !== 1 ? "s" : ""} × €{PRICE_PER_PERSON.toFixed(2)}
          </span>
          {hasDiscount ? (
            <span className="text-sm text-gray-400 line-through">€{baseTotal.toFixed(2)}</span>
          ) : (
            <span className="text-sm font-semibold text-gray-900">€{baseTotal.toFixed(2)}</span>
          )}
        </div>

        {hasDiscount && (
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              Desconto grupo aplicado (−10%)
            </span>
            <span className="text-sm font-semibold text-gray-900">€{total.toFixed(2)}</span>
          </div>
        )}

        <p className="text-[11px] text-gray-400">IVA (23%) incluído</p>

        <div className="pt-1">
          <div className="text-base font-semibold text-[#7c3aed]">Total a pagar: €{total.toFixed(2)}</div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      {/* CTA */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className="w-full rounded-lg py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ backgroundColor: "#7c3aed" }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> A processar...
          </>
        ) : (
          `Garantir ${count} lugar${count !== 1 ? "es" : ""} na Masterclass →`
        )}
      </button>

      {/* Reassurance */}
      <p className="text-[11px] text-gray-400 text-center leading-relaxed">
        Cada participante recebe um email individual com o link do calendário e os detalhes de acesso.
      </p>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Plus, X, Loader2, Lock, Zap, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Attendee {
  firstName: string;
  lastName: string;
  email: string;
}

interface GroupCheckoutFormProps {
  buyerFirstName: string;
  buyerLastName: string;
  buyerEmail: string;
}

const PRICE_PER_PERSON = 57.81;
const DISCOUNT_THRESHOLD = 3;
const DISCOUNT_RATE = 0.10;

function fmt(v: number) {
  return v.toFixed(2).replace(".", ",");
}

function calcTotal(count: number) {
  const base = count * PRICE_PER_PERSON;
  if (count >= DISCOUNT_THRESHOLD) return base * (1 - DISCOUNT_RATE);
  return base;
}

export default function GroupCheckoutForm({ buyerFirstName, buyerLastName, buyerEmail }: GroupCheckoutFormProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([
    { firstName: buyerFirstName, lastName: buyerLastName, email: buyerEmail },
  ]);
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync buyer data into attendee row 0
  useEffect(() => {
    setAttendees((prev) => {
      const copy = [...prev];
      copy[0] = { firstName: buyerFirstName, lastName: buyerLastName, email: buyerEmail };
      return copy;
    });
  }, [buyerFirstName, buyerLastName, buyerEmail]);

  const count = attendees.length;
  const hasDiscount = count >= DISCOUNT_THRESHOLD;
  const total = calcTotal(count);

  const updateAttendee = (idx: number, field: keyof Attendee, value: string) => {
    setAttendees((prev) => prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  };

  const addAttendee = () => {
    if (count >= 10) return;
    setAttendees((prev) => [...prev, { firstName: "", lastName: "", email: "" }]);
  };

  const removeAttendee = (idx: number) => {
    if (idx === 0 || count <= 1) return;
    setAttendees((prev) => prev.filter((_, i) => i !== idx));
  };

  const isValid =
    buyerFirstName.trim() &&
    buyerEmail.trim() &&
    attendees.every((a) => a.firstName.trim() && a.email.trim());

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnErr } = await supabase.functions.invoke("create-group-payment", {
        body: {
          buyer: {
            firstName: buyerFirstName.trim(),
            lastName: buyerLastName.trim(),
            email: buyerEmail.trim().toLowerCase(),
            company: company.trim() || undefined,
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
    <div className="w-full flex flex-col gap-3">
      {/* Attendees section */}
      <div
        style={{
          background: "#fafafa",
          border: "1px solid #f3f4f6",
          borderRadius: 10,
          padding: 16,
        }}
      >
        <div className="mb-3">
          <h3 className="text-sm font-bold" style={{ color: "#111827" }}>Quem vai participar?</h3>
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
            Cada pessoa recebe um email individual com todos os detalhes.
          </p>
        </div>

        <div className="space-y-2">
          {attendees.map((a, idx) => (
            <div key={idx}>
              {/* Row label */}
              <div className="mb-1">
                {idx === 0 ? (
                  <span
                    style={{
                      fontSize: 10,
                      color: "#9ca3af",
                      background: "#f3f4f6",
                      borderRadius: 4,
                      padding: "1px 6px",
                      fontWeight: 500,
                    }}
                  >
                    Tu
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: "#6b7280" }}>
                    Participante {idx + 1}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  placeholder="Nome completo"
                  value={a.firstName}
                  onChange={(e) => updateAttendee(idx, "firstName", e.target.value)}
                  disabled={idx === 0}
                  className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-purple-300 disabled:bg-gray-50 disabled:text-gray-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={a.email}
                  onChange={(e) => updateAttendee(idx, "email", e.target.value)}
                  disabled={idx === 0}
                  className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-purple-300 disabled:bg-gray-50 disabled:text-gray-500"
                />
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => removeAttendee(idx)}
                    className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {count < 10 && (
          <button
            type="button"
            onClick={addAttendee}
            className="w-full py-2 mt-3 rounded-lg border border-dashed border-purple-300 text-[#7c3aed] text-[13px] font-medium hover:bg-purple-50 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar outra pessoa
          </button>
        )}
      </div>

      {/* Company field */}
      <div
        style={{
          background: "#fafafa",
          border: "1px solid #f3f4f6",
          borderRadius: 10,
          padding: "10px 14px",
        }}
      >
        <input
          placeholder="Empresa (para fatura, opcional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-purple-300"
        />
      </div>

      {/* Price summary */}
      <div
        style={{
          background: "#f5f3ff",
          borderRadius: 10,
          padding: "14px 16px",
        }}
      >
        <p style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
          {count} pessoa{count !== 1 ? "s" : ""} · Masterclass Vídeo com IA
        </p>
        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
          €{fmt(PRICE_PER_PERSON)} por pessoa{hasDiscount ? " · desconto grupo (−10%)" : " · IVA incluído"}
        </p>
        <div style={{ height: 1, background: "#e9d5ff", margin: "10px 0" }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: "#7c3aed" }}>
          Total: €{fmt(total)}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      {/* Trust row */}
      <div className="flex items-center justify-center gap-4 py-1" style={{ fontSize: 10, color: "#9ca3af" }}>
        <span className="flex items-center gap-1"><Lock className="w-3 h-3" />Pagamento seguro</span>
        <span className="flex items-center gap-1"><Zap className="w-3 h-3" />Acesso imediato</span>
        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />Confirmação por email</span>
      </div>

      {/* CTA */}
      <div className="sticky bottom-0 z-10 bg-white pt-1 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="w-full rounded-lg py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", borderRadius: 10, height: 52 }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> A processar...
            </>
          ) : (
            `Confirmar inscrição para ${count} pessoa${count !== 1 ? "s" : ""} →`
          )}
        </button>
      </div>

      <p className="text-center" style={{ fontSize: 10, color: "#9ca3af" }}>
        Ao prosseguir, aceitas os nossos termos e política de privacidade
      </p>
    </div>
  );
}

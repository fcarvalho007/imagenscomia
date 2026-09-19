import { useEffect, useState, useRef } from "react";
import { Loader2, Mail, MessageSquare, TestTube } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { renderCourseBody } from "@shared/course/richtext";
import RichTextEditor from "@/components/crm/comunicacao/RichTextEditor";



const stateMessages: Record<string, string> = {
  sent: "Teste enviado.",
  duplicate: "Teste já registado. Confirme o resultado antes de repetir.",
  review: "O fornecedor não confirmou o envio. Verifique antes de repetir.",
  blocked: "Configuração em falta para este canal.",
  throttled: "Aguarde antes de enviar outro teste.",
  rejected: "O pedido foi recusado antes de qualquer envio.",
  unreachable: "O pedido não chegou ao servidor. Nada foi enviado.",
};

// Server-side reason codes turned into a useful sentence, without exposing contacts.
const reasonMessages: Record<string, string> = {
  unauthorized: "Sessão sem permissão de administrador verificada em dois passos.",
  invalid_request: "Pedido mal formado.",
  invalid_subject: "Assunto inválido.",
  invalid_message: "Mensagem inválida.",
  invalid_sms_body: "SMS: até 160 caracteres básicos, sem acentos.",
  email_not_verified: "O email da sessão não está verificado.",
  claim_failed: "A base de dados não aceitou o registo do teste.",
  email_configuration_missing: "Falta configuração de email.",
  sms_configuration_missing: "Falta configuração de SMS.",
  test_mobile_missing: "Falta o telemóvel de teste no servidor.",
  provider_unreachable: "Não foi possível contactar o fornecedor.",
  provider_timeout: "O fornecedor não respondeu a tempo; resultado por confirmar.",
  resend_missing_id: "O fornecedor respondeu sem identificador de envio.",
  sms_response_requires_verification: "Resposta do fornecedor de SMS por confirmar.",
};

const describeReason = (reason?: string | null) => {
  if (!reason) return "";
  if (reasonMessages[reason]) return reasonMessages[reason];
  const http = /^(resend|sms_http)_(\d{3})$/.exec(reason);
  if (http) return `O fornecedor respondeu com erro ${http[2]}.`;
  return `Motivo: ${reason}`;
};

/**
 * Self-test panel. The destination is decided on the server: email goes to the
 * signed-in administrator, SMS goes to the owner's fixed number. No recipient
 * can be typed here, and no participant, payment or conversion is created.
 */
export default function CourseTestSend() {
  const attempt=useRef<{signature:string;id:string}|null>(null);
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [subject, setSubject] = useState("Teste do CRM");
  const [emailBody, setEmailBody] = useState("<p>Olá, {{nome}}.</p><p>Esta é uma mensagem de teste.</p>");
  const [smsBody, setSmsBody] = useState("Teste do CRM do curso.");
  const [sending, setSending] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [last, setLast] = useState<string | null>(null);
  const [lastReason, setLastReason] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAdminEmail(data.session?.user?.email || ""));
  }, []);

  const smsInvalid = smsBody.length < 1 || smsBody.length > 160 || /[^\x20-\x7e]|[\[\]{}^~|\\]/.test(smsBody);
  const emailInvalid = subject.trim().length < 2 || renderCourseBody(emailBody, "html").text.trim().length < 2;
  const disabled = sending || (channel === "email" ? emailInvalid : smsInvalid);

  const send = async () => {
    if (disabled) return;
    setSending(true);
    setLast(null);
    setLastReason("");
    try {
      const signature=JSON.stringify([channel,subject,emailBody,smsBody]);
      if(attempt.current?.signature!==signature)attempt.current={signature,id:crypto.randomUUID()};
      const { data, error } = await supabase.functions.invoke("course-test-send", {
        body: {
          channel,
          request_id: attempt.current.id,
          subject: channel === "email" ? subject.trim() : "",
          body: channel === "email" ? emailBody : smsBody,
          format: channel === "email" ? "html" : "text",
        },
      });
      if (error) {
        // Distinguish a transport failure (blocked before the server answered)
        // from a server refusal, which carries a reason code in the body.
        const response = (error as { context?: Response })?.context;
        if (response && typeof response.json === "function") {
          let payload: { reason?: string; error?: string } = {};
          try {
            payload = await response.clone().json();
          } catch {
            payload = {};
          }
          setLast("rejected");
          setLastReason(describeReason(payload.reason) || `Servidor respondeu ${response.status}.`);
          toast.error(`${stateMessages.rejected} ${describeReason(payload.reason)}`.trim());
        } else {
          setLast("unreachable");
          setLastReason("O pedido foi bloqueado antes de chegar ao servidor (rede ou permissões do navegador).");
          toast.error(stateMessages.unreachable);
        }
        return;
      }
      const state = String(data?.state || "review");
      setLast(state);
      setLastReason(describeReason(data?.reason));
      if (state === "sent") toast.success(`${stateMessages.sent} ${data?.target ? `Destino: ${data.target}` : ""}`);
      else toast.error(`${stateMessages[state] || "Não foi possível concluir o teste."} ${describeReason(data?.reason)}`.trim());
    } catch (err) {
      setLast("unreachable");
      setLastReason(err instanceof Error ? err.message : "Erro inesperado.");
      toast.error(stateMessages.unreachable);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mb-5 rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2">
        <TestTube size={16} className="text-slate-500" />
        <h2 className="text-sm font-bold text-slate-900">Enviar teste para mim</h2>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Disponível mesmo sem inscritos. O destino é fixo: o email da sua sessão
        {adminEmail ? ` (${adminEmail})` : ""} e o telemóvel de teste configurado no servidor. Não é possível indicar outro contacto.
      </p>

      <div className="mt-3 flex gap-2">
        {(["email", "sms"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setChannel(value)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${channel === value ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
          >
            {value === "email" ? <Mail size={13} /> : <MessageSquare size={13} />}
            {value === "email" ? "Email" : "SMS"}
          </button>
        ))}
      </div>

      {channel === "email" ? (
        <div className="mt-3 space-y-3">
          <label className="block text-xs font-semibold text-slate-500">
            Assunto
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={160}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 outline-none"
            />
          </label>
          <RichTextEditor value={emailBody} onChange={setEmailBody} minHeight={140} placeholder="Escreva a mensagem de teste…" />
        </div>
      ) : (
        <div className="mt-3">
          <textarea
            value={smsBody}
            onChange={(e) => setSmsBody(e.target.value)}
            rows={3}
            maxLength={160}
            aria-label="Mensagem de teste por SMS"
            className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900 outline-none"
          />
          <p className={`mt-1 text-xs ${smsInvalid ? "text-red-600" : "text-slate-500"}`}>
            {smsBody.length}/160 · um segmento, sem acentos nem emojis.
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={send}
          disabled={disabled}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
        >
          {sending ? <Loader2 size={13} className="animate-spin" /> : <TestTube size={13} />}
          Enviar teste
        </button>
        {last && <span className="text-xs text-slate-500">{stateMessages[last] || last}</span>}
      </div>
      <p className="mt-2 text-xs text-slate-500">Limite: um teste por minuto e 20 por dia em cada canal. Os testes ficam num registo separado.</p>
    </div>
  );
}

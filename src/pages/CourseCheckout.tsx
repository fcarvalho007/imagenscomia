import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, LockKeyhole } from "lucide-react";
import { EDITIONS, uuid } from "@/lib/course/contract";
import { money } from "@/lib/course/editions";
import { checkoutRequest, loadCheckoutConfig, paymentDestination, validQuote, type CheckoutConfig, type Quote } from "@/lib/course/checkout-client";
import "./course-checkout-demo.css";

const editions = {
  "lisboa-2026": { label: "Lisboa · Presencial", dates: "29 e 30 de outubro de 2026", place: "Hotel Gat Rossio", schedule: "Quinta e sexta-feira · 09h00–17h30" },
  "porto-2026": { label: "Porto · Presencial", dates: "19 e 20 de novembro de 2026", place: "Porto · local a confirmar", schedule: "Quinta e sexta-feira · 09h00–17h30" },
  "online-2026": { label: "Online · Em direto", dates: "2, 4, 9 e 11 de dezembro de 2026", place: "4 sessões online", schedule: "Quartas e sextas-feiras · 09h30–13h00" },
};
type Edition = typeof EDITIONS[number];
const readOrder = () => { try { return JSON.parse(sessionStorage.getItem("fcia-course-order") || "null"); } catch { return null; } };
const closedPayments: Record<string, [string, string]> = {
  expired: ["Prazo de pagamento terminado", "Esta referência expirou. Contacte o suporte para retomar a inscrição."],
  cancelled: ["Pedido de pagamento cancelado", "Contacte o suporte se quiser retomar a inscrição ou se já tiver efetuado o pagamento."],
  refunded: ["Pagamento reembolsado", "Este pagamento foi reembolsado. Para esclarecer a sua inscrição, contacte o suporte."],
  review: ["Pagamento em verificação", "Estamos a verificar este pedido. Contacte o suporte antes de repetir o pagamento."],
};
const support = <a href="mailto:info@fredericocarvalho.pt">info@fredericocarvalho.pt</a>;

export default function CourseCheckout() {
  const params = new URLSearchParams(window.location.search);
  const returning = params.get("payment") === "return" || params.get("fcia_payment") === "return";
  const previous = useRef(readOrder());
  const attribution = useRef((() => {
    const data=new URLSearchParams(window.location.hash.slice(1));
    const campaign: Record<string,string>={};
    if(data.get('metrics')!=='allow'||!uuid(data.get('sid')))return {session_id:null,attribution:campaign};
    for(const key of ['utm_source','utm_medium','utm_campaign']){const v=data.get(key);if(v&&/^[a-zA-Z0-9_-]{1,100}$/.test(v))campaign[key]=v;}
    return {session_id:data.get('sid'),attribution:campaign};
  })());
  const initial = params.get("edition") || (returning ? previous.current?.edition : null);
  const [edition, setEdition] = useState<Edition>(EDITIONS.includes(initial as Edition) ? initial as Edition : "lisboa-2026");
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [message, setMessage] = useState(""), [paymentState, setPaymentState] = useState(returning ? "checking" : "");
  const [billingSaved, setBillingSaved] = useState(false);
  const requestId = useRef<string>(returning && uuid(previous.current?.request_id) ? previous.current.request_id : crypto.randomUUID());
  const submitted = useRef(false), quoteSequence = useRef(0);
  const selected = editions[edition];
  const [step, setStep] = useState(0);
  const [reviewContact, setReviewContact] = useState({name:"",email:""});
  const stepTitles = ["Onde quer participar?", "Como se chama?", "Qual é o seu email?", "Quer indicar um telemóvel?", "Como podemos contactar consigo?", "Está tudo certo?"];
  const formRef = useRef<HTMLFormElement>(null);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { stepHeading.current?.focus({preventScroll:true}); window.scrollTo({top:0,behavior:"instant"}); }, [step]);
  function nextStep() {
    const current = formRef.current?.querySelector(`[data-checkout-step="${step}"]`);
    const invalid = Array.from(current?.querySelectorAll<HTMLInputElement>('input,select') || []).find(input => !input.checkValidity());
    if (invalid) { invalid.reportValidity(); return; }
    if(step===4 && formRef.current){const values=new FormData(formRef.current);setReviewContact({name:String(values.get("name")||""),email:String(values.get("email")||"")});}
    setError(""); setStep(value => Math.min(5,value+1));
  }

  useEffect(() => {
    if (window.location.hash) history.replaceState(null, '', window.location.pathname+window.location.search);
    const title = document.title; document.title = "Inscrição · Curso de inteligência artificial";
    const meta = document.createElement("meta"); meta.name = "robots"; meta.content = "noindex, nofollow"; document.head.append(meta);
    let active = true;
    loadCheckoutConfig().then(c => { if (active) setConfig(c); }).catch(() => { if (active) setError("As inscrições online estão temporariamente indisponíveis. Contacte o suporte."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; document.title = title; meta.remove(); };
  }, []);
  async function refreshQuote(c: CheckoutConfig, e: Edition) {
    const sequence = ++quoteSequence.current; setQuote(null);
    try { const result = await checkoutRequest(c, "quote", { edition: e }); if (!validQuote(result.quote)) throw new Error(); if (sequence === quoteSequence.current) setQuote(result.quote); }
    catch { if (sequence === quoteSequence.current) setError("Esta edição não está disponível para inscrição online. Contacte o suporte."); }
  }
  useEffect(() => { if (config?.enabled && !returning) { setError(""); void refreshQuote(config, edition); } return () => { quoteSequence.current++; }; }, [config, edition]);
  useEffect(() => {
    if (!returning || !config) return;
    if (!uuid(previous.current?.request_id)) { setPaymentState("missing"); return; }
    let active = true, timer: ReturnType<typeof setTimeout>, attempts = 0;
    const check = async () => {
      try { const result = await checkoutRequest(config, "status", { request_id: requestId.current }); if (!active) return; setPaymentState(result.state); if (result.state === "paid" || closedPayments[result.state]) return; }
      catch { if (active) setError("Não foi possível consultar o pagamento. Contacte o suporte antes de voltar a pagar."); }
      if (active && ++attempts < 6) timer = setTimeout(check, 5000);
    };
    void check(); return () => { active = false; clearTimeout(timer); };
  }, [config]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(step<5){nextStep();return;} if (!config?.enabled || !quote || busy) return;
    if(!event.currentTarget.checkValidity()){setStep(1);setError("Reveja os dados antes de continuar.");return;}
    const values = new FormData(event.currentTarget);
    if (values.get("website")) return;
    if (values.has("sms") && !/^(?:\+351|00351)?9[1236]\d{7}$/.test(String(values.get("phone")).replace(/\s/g, ""))) { setError("Para receber SMS, indique um número móvel português válido ou retire essa opção."); return; }
    setBusy(true); setError(""); setMessage(""); submitted.current = true;
    try {
      // Only the unguessable order capability is stored, never contact or billing details.
      try { sessionStorage.setItem("fcia-course-order", JSON.stringify({ request_id: requestId.current, edition })); }
      catch { submitted.current = false; throw new Error("Permita o armazenamento neste navegador para acompanhar o pagamento. Ainda não foi criado qualquer pedido."); }
      const result = await checkoutRequest(config, "checkout", {
        request_id: requestId.current, edition, expected_amount: quote.amount_cents,
        name: values.get("name"), email: values.get("email"), phone: values.get("phone"), website: "",
        privacy_acknowledged: values.has("privacy"), terms_acknowledged: values.has("terms"), sms_consent: values.has("sms"), marketing_consent: values.has("marketing"), ...attribution.current, checkout_source: "lovable",
      });
      if (result.state === "ready") { window.location.assign(paymentDestination(result.payment_url)); return; }
      if (result.state === "paid") setPaymentState("paid");
      else if (result.state === "price_changed") { submitted.current = false; await refreshQuote(config, edition); setMessage("O preço mudou. Reveja o total antes de continuar."); }
      else if (result.state === "full") setMessage("Esta edição já não tem lugares disponíveis. Contacte o suporte para conhecer as alternativas.");
      else setMessage("O pedido precisa de verificação. Contacte o suporte antes de repetir o pagamento.");
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível confirmar o pedido."); }
    finally { setBusy(false); }
  }
  async function saveBilling(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!config || busy) return; setBusy(true); setError("");
    const billing = { ...Object.fromEntries(new FormData(event.currentTarget)), country: "Portugal" };
    try { await checkoutRequest(config, "billing", { request_id: requestId.current, billing }); setBillingSaved(true); }
    catch { setError("Verifique o NIF e os restantes dados. Para corrigir uma fatura já emitida, contacte o suporte."); }
    finally { setBusy(false); }
  }
  return <div className="course-checkout-demo course-checkout-live"><div className="checkout-demo-shell">
    <header className="checkout-demo-nav"><a className="checkout-demo-back" href="https://fredericocarvalho.pt/curso-de-inteligencia-artificial/"><ArrowLeft size={18} /> Voltar ao curso</a><span>Frederico Carvalho</span></header>
    <main><header className={`checkout-demo-heading ${step>0&&!returning ? "checkout-heading-compact" : ""}`}><h1>{paymentState === "paid" ? "Inscrição confirmada." : returning ? "Acompanhe o seu pagamento." : "O seu próximo passo com IA."}</h1><p>{paymentState === "paid" ? "O pagamento foi confirmado. Falta apenas completar os dados para a sua fatura." : "14 horas em direto e duas sessões individuais: antes para definir o desafio, depois para ajudar a aplicar."}</p></header>
    {error && <p className="checkout-live-feedback" role="alert">{error} {support}</p>}
    {message && <p className="checkout-live-feedback" role="status">{message} {support}</p>}
    {loading ? <p role="status">A consultar a disponibilidade…</p> : returning && paymentState !== "paid" ? <section className="checkout-live-feedback"><h2>{paymentState === "checking" ? "A verificar o pagamento…" : closedPayments[paymentState]?.[0] || "Confirmação de pagamento pendente"}</h2><p>{paymentState === "missing" ? "Abra a confirmação no navegador onde iniciou a inscrição, ou contacte o suporte." : closedPayments[paymentState]?.[1] || "Se escolheu Multibanco, a confirmação só acontece depois de pagar a referência. Não repita o pagamento enquanto aguarda."}</p><p>{support}</p></section> : paymentState === "paid" ? <section className="checkout-live-form"><h2>Dados para a fatura</h2>{billingSaved ? <p role="status">Dados guardados. A fatura será enviada para o email da inscrição após emissão.</p> : <form onSubmit={saveBilling}><div className="checkout-live-fields">{[
      ["name", "Nome ou empresa", "organization", 2], ["tax_id", "NIF português", "off", 9], ["address", "Morada", "street-address", 5], ["postal_code", "Código postal", "postal-code", 8], ["city", "Localidade", "address-level2", 2],
    ].map(([name, label, auto, min]) => <label key={name}>{label}<input name={String(name)} autoComplete={String(auto)} required minLength={Number(min)} maxLength={name === "tax_id" ? 9 : 180} pattern={name === "tax_id" ? "[0-9]{9}" : name === "postal_code" ? "[0-9]{4}-[0-9]{3}" : undefined} /></label>)}</div><p>Para faturação fora de Portugal, contacte {support}.</p><button className="checkout-live-submit" disabled={busy}>{busy ? "A guardar…" : "Guardar dados de faturação"}</button></form>}</section> : !config?.enabled ? <section className="checkout-live-feedback"><h2>Inscrições online disponíveis em breve.</h2><p>Para saber mais sobre esta edição, contacte {support}.</p></section> : <form ref={formRef} className="checkout-demo-layout checkout-guided" onSubmit={submit} noValidate>
      <div className="checkout-step-header"><p role="status">Passo {step+1} de {stepTitles.length}</p><progress value={step+1} max={stepTitles.length} aria-label="Progresso da inscrição"/><h2 ref={stepHeading} tabIndex={-1}>{stepTitles[step]}</h2></div>
      <div className="checkout-demo-content"><section className="checkout-demo-course" data-checkout-step="0" hidden={step!==0}><label className="checkout-demo-select">Edição<select value={edition} disabled={busy || submitted.current} onChange={e => { setEdition(e.target.value as Edition); requestId.current = crypto.randomUUID(); }}>{EDITIONS.map(id => <option key={id} value={id}>{editions[id].label}</option>)}</select></label><p className="checkout-demo-schedule">{selected.dates}<span>{selected.place}<br />{selected.schedule}</span></p></section>
      <section className="checkout-live-form checkout-step-fields"><div className="checkout-live-fields"><label data-checkout-step="1" hidden={step!==1}>Nome completo<input name="name" autoComplete="name" required minLength={2} maxLength={120} readOnly={busy || submitted.current} /></label><label data-checkout-step="2" hidden={step!==2}>Email<input name="email" type="email" autoComplete="email" required maxLength={254} readOnly={busy || submitted.current} /></label><label data-checkout-step="3" hidden={step!==3}>Telemóvel <span>(opcional)</span><input name="phone" type="tel" autoComplete="tel" maxLength={30} readOnly={busy || submitted.current} /></label></div><label className="checkout-live-honey" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <div data-checkout-step="4" hidden={step!==4}><label className="checkout-live-check"><input name="privacy" type="checkbox" required /><span>Li a <a href={config.privacyUrl} target="_blank" rel="noreferrer">política de privacidade</a>.</span></label><label className="checkout-live-check"><input name="terms" type="checkbox" required /><span>Aceito as <a href={config.termsUrl} target="_blank" rel="noreferrer">condições de inscrição, alteração e cancelamento</a>.</span></label><label className="checkout-live-check"><input name="sms" type="checkbox" /><span>Quero receber os lembretes do curso por SMS. Opcional.</span></label><label className="checkout-live-check"><input name="marketing" type="checkbox" /><span>Quero receber novidades sobre futuras formações. Opcional.</span></label></div></section>
      {step===5 && <section className="checkout-review"><h3>Reveja a sua inscrição</h3><p><strong>{reviewContact.name}</strong><br/>{reviewContact.email}</p><p>{selected.label} · {selected.dates}</p><p>Confirme os dados e o total. O pagamento é concluído no passo seguinte, através da Eupago.</p><button type="button" className="checkout-step-back" disabled={busy} onClick={()=>setStep(1)}>Rever os meus dados</button></section>}
      <div className="checkout-step-actions">{step>0 && <button type="button" className="checkout-step-back" disabled={busy} onClick={()=>setStep(step-1)}><ArrowLeft size={18}/> Voltar</button>}{step<5 && <button type="submit" className="checkout-live-submit">{step===3 ? "Continuar" : "Próximo passo"}<ArrowRight size={18}/></button>}</div></div>
      <aside className="checkout-live-summary"><h2>O seu curso</h2><strong>{selected.label}</strong><p>{selected.dates}</p><ul>{["14 horas de formação em direto", "Sessão individual antes e depois", "Templates, checklists e recursos", "Videoaulas de resumo", ...(edition === "online-2026" ? ["Gravações disponíveis durante 1 ano"] : [])].map(item => <li key={item}><Check size={17} aria-hidden="true" />{item}</li>)}</ul><dl><div><dt>Curso</dt><dd>{quote ? money(quote.net_cents) : "—"}</dd></div><div><dt>IVA (23%)</dt><dd>{quote ? money(quote.amount_cents - quote.net_cents) : "—"}</dd></div><div className="checkout-live-total"><dt>Total a pagar</dt><dd>{quote ? money(quote.amount_cents) : "—"}</dd></div></dl><button className="checkout-live-submit" hidden={step!==5} disabled={!quote || busy}>{busy ? "A preparar o pagamento…" : "Continuar para pagamento"}<ArrowRight size={18} aria-hidden="true" /></button><p className="checkout-live-secure"><LockKeyhole size={15} aria-hidden="true" />Cartão, MB WAY ou Multibanco através da Eupago.</p></aside>
    </form>}</main><footer className="checkout-live-footer">Precisa de ajuda? {support} · <a href="tel:+351915015508">915 015 508</a></footer>
  </div></div>;
}

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  demoComplement,
  demoEditions,
  demoTotal,
  type DemoEdition,
} from "@/lib/course/checkout-demo";
import { money } from "@/lib/course/editions";
import "./course-checkout-demo.css";

export default function CourseCheckoutDemo() {
  const [edition, setEdition] = useState<DemoEdition>(() => {
    const requested = new URLSearchParams(window.location.search).get("edition");
    return requested && Object.prototype.hasOwnProperty.call(demoEditions, requested) ? requested as DemoEdition : "lisboa-2026";
  });
  const [complement, setComplement] = useState(false);
  const [complete, setComplete] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousComplete = useRef(complete);
  const selected = demoEditions[edition];
  const totals = demoTotal(edition, complement);
  useEffect(() => {
    const title = document.title;
    document.title = "Checkout de demonstração · Curso IA";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.append(meta);
    return () => {
      document.title = title;
      meta.remove();
    };
  }, []);
  useEffect(() => {
    if (previousComplete.current !== complete) heading.current?.focus();
    previousComplete.current = complete;
  }, [complete]);
  return (
    <div className="course-checkout-demo">
      <div className="checkout-demo-notice">
        <strong>Demonstração</strong>
        <span>
          Explore o checkout. Não é criada uma inscrição nem efetuada qualquer
          cobrança.
        </span>
      </div>
      <div className="checkout-demo-shell">
        <header className="checkout-demo-nav">
          <a href="/crm/curso-ia" className="checkout-demo-back">
            <ArrowLeft size={18} aria-hidden="true" /> Voltar ao CRM
          </a>
          <span>Frederico Carvalho</span>
        </header>
        <main>
          <header className="checkout-demo-heading">
            <h1 ref={heading} tabIndex={-1}>
              {complete
                ? "Simulação concluída."
                : "O seu próximo passo com IA."}
            </h1>
            <p>
              {complete
                ? "Este é o resumo da sua escolha. Nenhum pagamento, inscrição, email ou fatura foi criado."
                : "Curso de inteligência artificial aplicado ao negócio, com acompanhamento individual antes e depois."}
            </p>
          </header>
          <form
            className="checkout-demo-layout"
            onSubmit={(e) => {
              e.preventDefault();
              setComplete(true);
            }}
          >
            <div className="checkout-demo-content">
              <section
                className="checkout-demo-course"
                aria-labelledby="checkout-course-title"
              >
                <h2 id="checkout-course-title">
                  {complete ? "A edição escolhida" : "Escolha a sua edição"}
                </h2>
                {complete ? (
                  <p className="checkout-demo-edition-name">{selected.label}</p>
                ) : (
                  <label className="checkout-demo-select">
                    Edição
                    <select
                      value={edition}
                      onChange={(e) =>
                        setEdition(e.target.value as DemoEdition)
                      }
                    >
                      {Object.entries(demoEditions).map(([id, e]) => (
                        <option key={id} value={id}>
                          {e.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <p className="checkout-demo-schedule">
                  {selected.schedule}
                  <span>{selected.format} · 14 horas em direto</span>
                </p>
                <h3>Já faz parte do seu curso</h3>
                <ul className="checkout-demo-included">
                  <li>
                    <Check aria-hidden="true" size={19} />
                    <span>
                      <strong>Duas sessões individuais.</strong> Uma antes e
                      outra depois da formação.
                    </span>
                  </li>
                  <li>
                    <Check aria-hidden="true" size={19} />
                    <span>
                      Templates, recursos de apoio, checklists e videoaulas de
                      resumo.
                    </span>
                  </li>
                  {edition === "online-2026" && (
                    <li>
                      <Check aria-hidden="true" size={19} />
                      <span>
                        Gravações das sessões online disponíveis durante um ano.
                      </span>
                    </li>
                  )}
                </ul>
              </section>
              {(!complete || complement) && (
                <section
                  className={`checkout-demo-offer ${complement ? "is-selected" : ""}`}
                  aria-labelledby="checkout-offer-title"
                >
                  <div className="checkout-demo-offer-meta">
                    <span>Demonstração — oferta em estudo</span>
                    <span>Opcional · videoaulas gravadas</span>
                  </div>
                  <h2 id="checkout-offer-title">{demoComplement.title}</h2>
                  <p className="checkout-demo-offer-intro">
                    Quer aprofundar a criação de imagem e vídeo? Acrescente
                    videoaulas práticas para explorar esta área ao seu ritmo.
                  </p>
                  <dl className="checkout-demo-syllabus">
                    <div>
                      <dt>Preparar a direção visual</dt>
                      <dd>Referências, estilo e coerência com a marca.</dd>
                    </div>
                    <div>
                      <dt>Produzir imagens consistentes</dt>
                      <dd>Desenvolver variações sem recomeçar o processo.</dd>
                    </div>
                    <div>
                      <dt>Transformar imagens em vídeos</dt>
                      <dd>
                        Preparar sequências, rever resultados e adaptar para
                        publicação.
                      </dd>
                    </div>
                  </dl>
                  <p className="checkout-demo-offer-note">
                    Uma formação complementar gravada, com materiais
                    reutilizáveis. As videoaulas de resumo e os restantes
                    recursos do curso principal continuam incluídos, mesmo sem
                    este complemento.
                  </p>
                  {!complete && (
                    <label className="checkout-demo-choice">
                      <input
                        type="checkbox"
                        checked={complement}
                        onChange={(e) => setComplement(e.target.checked)}
                        aria-describedby="checkout-demo-price-note"
                      />
                      <span>
                        Adicionar o pacote à simulação
                        <strong>+67 € + IVA</strong>
                      </span>
                    </label>
                  )}
                  <p
                    id="checkout-demo-price-note"
                    className="checkout-demo-caption"
                  >
                    Valor exclusivamente demonstrativo. Conteúdo, preço final,
                    prazo de acesso e disponibilidade por aprovar.
                  </p>
                </section>
              )}
              {complete && !complement && (
                <p className="checkout-demo-without">
                  Escolheu apenas o curso principal, com todos os recursos e
                  acompanhamento incluídos.
                </p>
              )}
            </div>
            <aside
              className="checkout-demo-summary"
              aria-labelledby="checkout-summary-title"
            >
              <h2 id="checkout-summary-title">
                {complete ? "A sua simulação" : "Resumo da simulação"}
              </h2>
              <div aria-live="polite" aria-atomic="true">
                <dl className="checkout-demo-lines">
                  <div>
                    <dt>
                      Curso de inteligência artificial
                      <small>{selected.label}</small>
                    </dt>
                    <dd>{money(selected.net)}</dd>
                  </div>
                  {complement && (
                    <div>
                      <dt>
                        Pacote de imagem e vídeo
                        <small>Complemento demonstrativo</small>
                      </dt>
                      <dd>{money(demoComplement.net)}</dd>
                    </div>
                  )}
                </dl>
                <dl className="checkout-demo-totals">
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{money(totals.subtotal)}</dd>
                  </div>
                  <div>
                    <dt>IVA · 23%</dt>
                    <dd>{money(totals.vat)}</dd>
                  </div>
                  <div className="checkout-demo-total">
                    <dt>Total simulado</dt>
                    <dd data-testid="demo-total">{money(totals.total)}</dd>
                  </div>
                </dl>
              </div>
              {complete ? (
                <button
                  className="checkout-demo-submit"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setComplete(false);
                  }}
                >
                  Editar simulação
                  <ArrowLeft size={19} aria-hidden="true" />
                </button>
              ) : (
                <button className="checkout-demo-submit" type="submit">
                  Concluir simulação
                  <ArrowRight size={19} aria-hidden="true" />
                </button>
              )}
              <p className="checkout-demo-caption">
                Não será encaminhado para pagamento. Os valores servem apenas
                para testar este percurso.
              </p>
            </aside>
          </form>
        </main>
        <footer className="checkout-demo-footer">
          Pré-visualização local · nenhum dado pessoal é solicitado ou guardado.
        </footer>
      </div>
    </div>
  );
}

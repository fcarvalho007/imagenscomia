import { ScrollReveal } from "./ScrollReveal";
import { CTAButton } from "./CTAButton";
import { Check, X, Video, PlayCircle, Users, MessageCircle } from "lucide-react";

export const PricingSection = () => (
  <section className="py-24 bg-muted/30 grid-tron">
    <div className="container mx-auto px-4 max-w-4xl">
      <ScrollReveal>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Como <span className="text-gradient">participar</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          Assista gratuitamente ao vivo, ou garanta acesso permanente à gravação por apenas €15
        </p>
      </ScrollReveal>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Free - Live */}
        <ScrollReveal delay={0}>
          <div className="bg-card rounded-2xl p-8 neon-border hover:neon-glow transition-shadow h-full flex flex-col relative">
            <div className="absolute -top-3 left-6 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
              RECOMENDADO
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Video className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">Participação ao Vivo</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Quinta, 20 Fev • 19h00 (Lisboa)</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gradient">Grátis</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                { text: "Webinar completo ao vivo (90 min)", included: true },
                { text: "Perguntas ao vivo no Q&A", included: true },
                { text: "Kit IA Empresarial 2025 completo", included: true },
                { text: "3 Aplicações Web exclusivas", included: true },
                { text: "50 Templates de Prompts", included: true },
                { text: "Gravação para rever depois", included: false, note: "Apenas ao vivo" },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-2 text-sm">
                  {item.included ? (
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                  )}
                  <span className={item.included ? "text-foreground/80" : "text-muted-foreground/50"}>
                    {item.text}
                    {item.note && <span className="text-xs ml-1">({item.note})</span>}
                  </span>
                </li>
              ))}
            </ul>
            <CTAButton className="w-full" />
          </div>
        </ScrollReveal>

        {/* Paid - Recording */}
        <ScrollReveal delay={0.15}>
          <div className="bg-card rounded-2xl p-8 border border-border h-full flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <PlayCircle className="w-6 h-6 text-secondary" />
              <h3 className="text-xl font-bold">Acesso à Gravação</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Disponível após o webinar</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">€15</span>
              <span className="text-sm text-muted-foreground ml-2">pagamento único</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                { text: "Gravação completa do webinar", included: true },
                { text: "Ver e rever sem limite (1 ano)", included: true },
                { text: "Kit IA Empresarial 2025 completo", included: true },
                { text: "3 Aplicações Web exclusivas", included: true },
                { text: "50 Templates de Prompts", included: true },
                { text: "Ideal para quem não pode estar ao vivo", included: true },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-secondary/60 mt-0.5 shrink-0" />
                  <span className="text-foreground/70">{item.text}</span>
                </li>
              ))}
            </ul>

            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Não pode estar ao vivo? Garanta acesso à gravação.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Disponível para compra após o webinar
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal>
        <p className="text-center text-sm text-muted-foreground mt-8 max-w-lg mx-auto">
          💡 <strong>Dica:</strong> Inscreva-se gratuitamente agora. Se no dia não puder assistir, terá a opção de adquirir a gravação por €15.
        </p>
      </ScrollReveal>
    </div>
  </section>
);

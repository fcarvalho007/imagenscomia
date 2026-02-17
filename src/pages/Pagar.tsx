import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Shield, CheckCircle, AlertCircle, RefreshCw, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type PageStatus = "loading" | "redirecting" | "timeout" | "paid" | "error";
type ErrorType = "not_found" | "network" | "generic";

const WHATSAPP_URL = "https://api.whatsapp.com/send?phone=351915015508&text=WebinarAI%20Pagamento";
const TIMEOUT_MS = 12_000;

const Pagar = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("o");
  const [status, setStatus] = useState<PageStatus>("loading");
  const [errorType, setErrorType] = useState<ErrorType>("generic");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolvedRef = useRef(false);

  const resolve = useCallback(async () => {
    if (!orderId) {
      setStatus("error");
      setErrorType("not_found");
      return;
    }

    resolvedRef.current = false;
    setStatus("loading");

    // Start timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!resolvedRef.current) {
        setStatus("timeout");
      }
    }, TIMEOUT_MS);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resolve-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({ order_id: orderId }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || !data) {
        resolvedRef.current = true;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setStatus("error");
        setErrorType(res.status === 404 ? "not_found" : "network");
        return;
      }

      if (data.status === "paid") {
        resolvedRef.current = true;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setStatus("paid");
        return;
      }

      if (data.redirect_url) {
        resolvedRef.current = true;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setRedirectUrl(data.redirect_url);
        setStatus("redirecting");
        window.location.href = data.redirect_url;
        return;
      }

      resolvedRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setStatus("error");
      setErrorType("generic");
    } catch {
      resolvedRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setStatus("error");
      setErrorType("network");
    }
  }, [orderId]);

  useEffect(() => {
    resolve();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resolve]);

  const errorMessages: Record<ErrorType, { title: string; subtitle: string }> = {
    not_found: {
      title: "Pedido não localizado",
      subtitle: "Não foi possível localizar este pedido. Verifique o link ou contacte o suporte.",
    },
    network: {
      title: "Problema temporário",
      subtitle: "Ocorreu um problema temporário. Tente novamente ou fale connosco no WhatsApp.",
    },
    generic: {
      title: "Não foi possível processar",
      subtitle: "Ocorreu um erro inesperado. Tente novamente ou contacte o suporte.",
    },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">

        {/* LOADING */}
        {status === "loading" && (
          <div className="space-y-5">
            <div className="relative mx-auto w-16 h-16">
              <Shield className="w-16 h-16 text-primary animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-foreground">A terminar o pagamento…</h1>
            <p className="text-sm text-muted-foreground">A validar o link e a abrir o checkout seguro.</p>
            <Progress className="h-2 w-full" />
          </div>
        )}

        {/* REDIRECTING */}
        {status === "redirecting" && (
          <div className="space-y-5">
            <div className="relative mx-auto w-16 h-16">
              <Shield className="w-16 h-16 text-primary animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Pagamento seguro — a redirecionar…</h1>
            <Progress className="h-2 w-full" />
          </div>
        )}

        {/* TIMEOUT */}
        {status === "timeout" && (
          <div className="space-y-5">
            <Shield className="w-14 h-14 text-muted-foreground mx-auto" />
            <h1 className="text-xl font-bold text-foreground">A demorar mais do que o esperado</h1>
            <p className="text-sm text-muted-foreground">
              Se o checkout não abriu automaticamente, use o botão abaixo.
            </p>
            <div className="flex flex-col gap-3">
              {redirectUrl && (
                <Button asChild size="lg" className="w-full">
                  <a href={redirectUrl}>Continuar para pagamento</a>
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-2"
                onClick={() => resolve()}
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </Button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com o suporte via WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* PAID */}
        {status === "paid" && (
          <div className="space-y-5">
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Pagamento já confirmado ✅</h1>
            <p className="text-muted-foreground">A inscrição está garantida.</p>
            <Button asChild size="lg" className="w-full">
              <Link to="/live">Aceder ao webinar</Link>
            </Button>
          </div>
        )}

        {/* ERROR */}
        {status === "error" && (
          <div className="space-y-5">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <h1 className="text-xl font-bold text-foreground">{errorMessages[errorType].title}</h1>
            <p className="text-sm text-muted-foreground">{errorMessages[errorType].subtitle}</p>
            <div className="flex flex-col gap-3">
              {errorType !== "not_found" && (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => resolve()}
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar novamente
                </Button>
              )}
              <Button asChild size="lg" variant={errorType === "not_found" ? "default" : "outline"} className="w-full gap-2">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" />
                  Contactar suporte
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagar;

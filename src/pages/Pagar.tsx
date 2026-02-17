import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

type ResolveStatus = "loading" | "redirecting" | "paid" | "error";

const Pagar = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("o");
  const [status, setStatus] = useState<ResolveStatus>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      setErrorMsg("Link inválido — order_id em falta.");
      return;
    }

    const resolve = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("resolve-payment", {
          body: { order_id: orderId },
        });

        if (error) {
          setStatus("error");
          setErrorMsg("Não foi possível resolver o pagamento. Tente novamente.");
          return;
        }

        if (data.status === "paid") {
          setStatus("paid");
          return;
        }

        if (data.redirect_url) {
          setStatus("redirecting");
          window.location.href = data.redirect_url;
          return;
        }

        setStatus("error");
        setErrorMsg(data.error || "Erro inesperado.");
      } catch {
        setStatus("error");
        setErrorMsg("Ligação instável. Verifique a internet e tente novamente.");
      }
    };

    resolve();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-lg text-foreground">A verificar o pagamento…</p>
          </>
        )}

        {status === "redirecting" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-lg text-foreground">Pagamento seguro — a redirecionar…</p>
          </>
        )}

        {status === "paid" && (
          <>
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Pagamento já confirmado</h1>
            <p className="text-muted-foreground">A inscrição está garantida.</p>
            <Link
              to="/live"
              className="inline-block mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
            >
              Aceder ao webinar
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Erro</h1>
            <p className="text-muted-foreground">{errorMsg}</p>
            <a
              href="https://wa.me/351915015508?text=Preciso%20de%20ajuda%20com%20o%20pagamento"
              className="inline-block mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contactar suporte
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default Pagar;

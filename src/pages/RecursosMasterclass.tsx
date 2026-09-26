import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";
import RecursosMasterclassLogin from "@/components/recursos/RecursosMasterclassLogin";
import RecursosMasterclassConteudo from "@/components/recursos/RecursosMasterclassConteudo";
import { clearToken, legacyRegLookup, resolveToken } from "@/lib/legacyAccess";

type PageState = "loading" | "login" | "authed";

interface UserData {
  email: string;
  token: string | null;
  plan: string | null;
  name: string | null;
}

const SCOPE = "recursos-masterclass" as const;

export default function RecursosMasterclass() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<PageState>("loading");
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const token = resolveToken(SCOPE, searchParams.get("t"));
    if (!token) {
      setState("login");
      return;
    }

    const validate = async () => {
      try {
        const reg = await legacyRegLookup(token);
        if (!reg || !(reg.paid || reg.premium)) throw new Error("no access");
        setUserData({
          email: reg.email,
          token,
          plan: reg.plan_selected,
          name: reg.first_name ?? reg.name,
        });
        setState("authed");
      } catch {
        clearToken(SCOPE);
        setState("login");
      }
    };

    validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    clearToken(SCOPE);
    setUserData(null);
    setState("login");
  };

  if (state === "loading") {
    return (
      <>
        <div className="min-h-screen bg-[hsl(var(--off-white))] flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[hsl(var(--ink-300))]" />
        </div>
        <WhatsAppSupportButton />
      </>
    );
  }

  if (state === "login") {
    return <><RecursosMasterclassLogin /><WhatsAppSupportButton /></>;
  }

  return <><RecursosMasterclassConteudo userData={userData!} onLogout={handleLogout} /><WhatsAppSupportButton /></>;
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";
import RecursosVideoLogin from "@/components/recursos/RecursosVideoLogin";
import RecursosVideoConteudo from "@/components/recursos/RecursosVideoConteudo";

type PageState = "loading" | "login" | "authed";

interface UserData {
  email: string;
  token: string | null;
  plan: string | null;
  name: string | null;
}

export default function RecursosVideo() {
  const [state, setState] = useState<PageState>("loading");
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("recursos_video_token");
    const email = sessionStorage.getItem("recursos_video_email");

    if (!token || !email) {
      setState("login");
      return;
    }

    const validate = async () => {
      try {
        const { data: rows } = await supabase
          .from("registrations")
          .select("paid_at, plan_selected, first_name, premium_granted_at")
          .eq("email", email)
          .eq("edit_token", token)
          .eq("webinar", "video")
          .order("paid_at", { ascending: false, nullsFirst: false })
          .order("premium_granted_at", { ascending: false, nullsFirst: false })
          .limit(1);

        const data = rows?.[0] ?? null;
        const hasAccess = !!(data?.paid_at || (data as any)?.premium_granted_at);
        if (hasAccess) {
          setUserData({ email, token, plan: data!.plan_selected, name: data!.first_name });
          setState("authed");
        } else {
          throw new Error("no access");
        }
      } catch {
        sessionStorage.removeItem("recursos_video_token");
        sessionStorage.removeItem("recursos_video_email");
        sessionStorage.removeItem("recursos_video_plan");
        sessionStorage.removeItem("recursos_video_name");
        setState("login");
      }
    };

    validate();
  }, []);

  const handleAuthed = (data: UserData) => {
    setUserData(data);
    setState("authed");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("recursos_video_token");
    sessionStorage.removeItem("recursos_video_email");
    sessionStorage.removeItem("recursos_video_plan");
    sessionStorage.removeItem("recursos_video_name");
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
    return <><RecursosVideoLogin onAuthed={handleAuthed} /><WhatsAppSupportButton /></>;
  }

  return <><RecursosVideoConteudo userData={userData!} onLogout={handleLogout} /><WhatsAppSupportButton /></>;
}

import { editionNames } from "@/lib/course/editions";
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useWebinarContext } from "@/contexts/WebinarContext";
import type { AcquisitionCost } from "@/components/crm/FaturacaoView";

const PLATFORMS = [
  "Meta Ads (Facebook / Instagram)",
  "Google Ads",
  "LinkedIn Ads",
  "E-goi / Email marketing",
  "SMS (smsonline.pt)",
  "Lovable.app",
  "Outro",
];

const CATEGORIES = [
  { value: "paid_media", label: "Paid Media" },
  { value: "plataforma", label: "Plataforma" },
  { value: "producao", label: "Produção" },
  { value: "outro", label: "Outro" },
];

interface Props {
  courseEdition?: string;
  cost: AcquisitionCost | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function CostModal({ cost, onClose, onSaved, courseEdition }: Props) {
  const { webinarContext } = useWebinarContext();
  const [platform, setPlatform] = useState(cost?.platform || PLATFORMS[0]);
  const [description, setDescription] = useState(cost?.description || "");
  const [amount, setAmount] = useState(cost ? String(cost.amount) : "");
  const [costDate, setCostDate] = useState(cost?.cost_date || new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(cost?.category || "paid_media");
  const [webinar, setWebinar] = useState(cost?.webinar || (courseEdition !== undefined ? courseEdition || "lisboa-2026" : (webinarContext === "consolidado" ? "video" : webinarContext)));
  const [saving, setSaving] = useState(false);
  const [webinarOptions, setWebinarOptions] = useState<{ value: string; label: string; emoji: string }[]>([]);

  useEffect(() => {
    if(courseEdition !== undefined) {setWebinarOptions(Object.entries(editionNames).map(([value,label])=>({value,label,emoji:""})));return;}
    supabase.from("webinar_settings").select("webinar, label, emoji").then(({ data }) => {
      if (data && data.length > 0) {
        setWebinarOptions(data.map((d: any) => ({ value: d.webinar, label: d.label, emoji: d.emoji })));
      } else {
        setWebinarOptions([
          { value: "imagens", label: "Imagens IA", emoji: "📷" },
          { value: "video", label: "Vídeo IA", emoji: "🎬" },
        ]);
      }
    });
  }, [courseEdition]);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({ title: "Valor inválido", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      platform,
      description,
      amount: Number(amount),
      cost_date: costDate,
      category,
      webinar,
      updated_at: new Date().toISOString(),
    };

    try {
      let error;
      if(courseEdition !== undefined) {
        ({error}=await (supabase as any).rpc("save_course_cost",{cost_id:cost?.id||null,edition_id:webinar,cost_platform:platform,cost_description:description,cost_amount:Number(amount),cost_day:costDate,cost_category:category}));
      } else if(cost) ({error}=await supabase.from("acquisition_costs" as any).update(payload as any).eq("id",cost.id));
      else ({error}=await supabase.from("acquisition_costs" as any).insert(payload as any));
      if(error) throw error;
      toast({title:cost?"Custo atualizado":"Custo adicionado"});
    } catch {toast({title:"Não foi possível guardar o custo. Verifique os campos e volte a tentar.",variant:"destructive"});setSaving(false);return;}

    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="rounded-xl p-6 w-full max-w-md space-y-4" style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>
            {cost ? "Editar Custo" : "Adicionar Custo"}
          </h3>
          <button onClick={onClose}><X size={16} style={{ color: "rgba(255,255,255,0.4)" }} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-medium mb-1 block" style={{ color: "rgba(255,255,255,0.5)" }}>Plataforma</label>
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-[13px]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }}
            >
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium mb-1 block" style={{ color: "rgba(255,255,255,0.5)" }}>Descrição</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição do custo" className="text-[13px]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium mb-1 block" style={{ color: "rgba(255,255,255,0.5)" }}>Valor (€) · s/ IVA</label>
              <Input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="150.00" className="text-[13px]" />
            </div>
            <div>
              <label className="text-[11px] font-medium mb-1 block" style={{ color: "rgba(255,255,255,0.5)" }}>Data</label>
              <Input type="date" value={costDate} onChange={e => setCostDate(e.target.value)} className="text-[13px]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium mb-1 block" style={{ color: "rgba(255,255,255,0.5)" }}>Categoria</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-[13px]"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }}
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium mb-1 block" style={{ color: "rgba(255,255,255,0.5)" }}>{courseEdition !== undefined ? "Edição" : "Webinar"}</label>
              <select
                disabled={!!cost && courseEdition !== undefined}
                value={webinar}
                onChange={e => setWebinar(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-[13px]"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }}
              >
                {webinarOptions.map(w => (
                  <option key={w.value} value={w.value}>{w.emoji} {w.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1">
            {saving && <Loader2 size={12} className="animate-spin" />}
            {cost ? "Guardar" : "Adicionar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

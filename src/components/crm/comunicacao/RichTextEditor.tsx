import { useCallback, useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Link2, Heading2, Quote, User } from "lucide-react";
import { sanitizeCourseHTML } from "@shared/course/richtext";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

/**
 * Visual editor for course messages. The stored value is always the output of the
 * shared sanitiser, the very same module the delivery worker runs, so the preview
 * and the delivered email cannot diverge.
 */
export default function RichTextEditor({ value, onChange, placeholder, minHeight = 220 }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Last HTML this editor emitted. Anything else arriving in `value` is an
  // external change (template switch, cleared form) and must be re-hydrated.
  const emitted = useRef<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const next = sanitizeCourseHTML(value || "");
    if (emitted.current === next) return;
    // Never destroy the caret while the author is typing in this editor.
    if (emitted.current !== null && document.activeElement === el) return;
    emitted.current = next;
    if (el.innerHTML !== next) el.innerHTML = next;
  }, [value]);

  const push = useCallback(() => {
    const html = sanitizeCourseHTML(ref.current?.innerHTML || "");
    emitted.current = html;
    onChange(html);
  }, [onChange]);

  const run = (command: string, argument?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, argument);
    push();
  };

  const insertToken = () => {
    ref.current?.focus();
    document.execCommand("insertText", false, "{{nome}}");
    push();
  };

  const addLink = () => {
    const url = window.prompt("Endereço do link (https:// ou mailto:)");
    if (!url) return;
    if (!/^https:\/\/|^mailto:/i.test(url.trim())) {
      window.alert("Só são aceites endereços https:// ou mailto:");
      return;
    }
    run("createLink", url.trim());
  };

  const buttons = [
    { icon: <Bold size={14} />, label: "Negrito", action: () => run("bold") },
    { icon: <Italic size={14} />, label: "Itálico", action: () => run("italic") },
    { icon: <Underline size={14} />, label: "Sublinhado", action: () => run("underline") },
    { icon: <Heading2 size={14} />, label: "Subtítulo", action: () => run("formatBlock", "<h2>") },
    { icon: <List size={14} />, label: "Lista", action: () => run("insertUnorderedList") },
    { icon: <ListOrdered size={14} />, label: "Lista numerada", action: () => run("insertOrderedList") },
    { icon: <Quote size={14} />, label: "Citação", action: () => run("formatBlock", "<blockquote>") },
    { icon: <Link2 size={14} />, label: "Link", action: addLink },
  ];

  return (
    <div className="rounded-xl overflow-hidden bg-white" style={{ border: "1.5px solid #E2E8F0" }}>
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200">
        {buttons.map((b) => (
          <button
            key={b.label}
            type="button"
            title={b.label}
            aria-label={b.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={b.action}
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {b.icon}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-slate-200" />
        <button
          type="button"
          title="Inserir o primeiro nome do participante"
          aria-label="Inserir nome"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertToken}
          className="flex h-7 items-center gap-1 rounded px-2 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <User size={12} /> nome
        </button>
      </div>
      <div
        ref={ref}
        role="textbox"
        aria-multiline="true"
        aria-label="Mensagem"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={push}
        onBlur={push}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
          push();
        }}
        className="px-4 py-3 text-sm text-slate-900 outline-none max-w-none [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_a]:text-blue-600 [&_a]:underline [&_h2]:text-base [&_h2]:font-bold [&_blockquote]:border-l-2 [&_blockquote]:border-slate-200 [&_blockquote]:pl-3 [&_blockquote]:text-slate-600 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400"
        style={{ minHeight, lineHeight: 1.7 }}
      />
    </div>
  );
}

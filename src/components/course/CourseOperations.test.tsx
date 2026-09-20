import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const editions = [
  { id: "lisboa-2026", label: "Lisboa · presencial", starts_at: "2026-10-29T09:00:00Z", ends_at: "2026-10-30T17:00:00Z", automation_enabled: true, sms_enabled: false, invoicing_enabled: false, operations: {} },
  { id: "porto-2026", label: "Porto · presencial", starts_at: "2026-11-12T09:00:00Z", ends_at: "2026-11-13T17:00:00Z", automation_enabled: false, sms_enabled: false, invoicing_enabled: false, operations: {} },
];

function builder(data: unknown) {
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  for (const key of ["select", "order", "range", "in", "eq"]) chain[key] = vi.fn(self);
  chain.maybeSingle = vi.fn(async () => ({ data: null, error: null }));
  chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve({ data, error: null }).then(resolve);
  return chain;
}

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => builder(table === "course_editions" ? editions : []),
    rpc: async () => ({ data: { queued: 0, sent: 0, blocked: 0, review: 0 }, error: null }),
  },
}));

import CourseOperations from "./CourseOperations";

describe("CourseOperations sem edição selecionada", () => {
  it("mostra cartões clicáveis por edição e avisa como abrir o fluxo", async () => {
    render(<CourseOperations edition="" />);
    await waitFor(() => expect(screen.getByRole("button", { name: /Lisboa · presencial/ })).toBeInTheDocument());
    expect(screen.getByText("Escolha uma edição para ver o fluxo sequencial de contacto.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Porto · presencial/ })).toBeInTheDocument();
  });

  it("seleciona a edição ao clicar no cartão", async () => {
    const onEditionChange = vi.fn();
    render(<CourseOperations edition="" onEditionChange={onEditionChange} />);
    await waitFor(() => expect(screen.getByRole("button", { name: /Lisboa · presencial/ })).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: /Lisboa · presencial/ }));
    expect(onEditionChange).toHaveBeenCalledWith("lisboa-2026");
  });
});

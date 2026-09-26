import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CourseCheckoutDemo from "./CourseCheckoutDemo";
beforeEach(()=>{vi.spyOn(window,"scrollTo").mockImplementation(()=>{});});
afterEach(() => {
  cleanup();
  history.replaceState(null, "", "/");
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe("isolated checkout demonstration", () => {
  it.each([
    ["lisboa-2026", "611,31", "693,72"],
    ["porto-2026", "611,31", "693,72"],
    ["online-2026", "488,31", "570,72"],
  ])(
    "simulates %s with and without the optional pack, without network activity",
    (edition, base, extra) => {
      const fetch = vi.fn();
      vi.stubGlobal("fetch", fetch);
      render(<CourseCheckoutDemo />);

      fireEvent.change(screen.getByRole("combobox", { name: "Edição" }), {
        target: { value: edition },
      });
      expect(screen.getByTestId("demo-total")).toHaveTextContent(base);
      fireEvent.click(screen.getByRole("button", {name:"Próximo passo"}));
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
      fireEvent.click(checkbox);
      expect(screen.getByTestId("demo-total")).toHaveTextContent(extra);
      fireEvent.click(checkbox);
      expect(screen.getByTestId("demo-total")).toHaveTextContent(base);
      fireEvent.click(screen.getByRole("button", {name:/Continuar sem complemento|Próximo passo/}));
      fireEvent.click(
        screen.getByRole("button", { name: "Concluir simulação" }),
      );
      expect(
        screen.getByRole("heading", { name: "Simulação concluída." }),
      ).toHaveFocus();
      expect(screen.getByTestId("demo-total")).toHaveTextContent(base);
      fireEvent.click(screen.getByRole("button", { name: "Editar simulação" }));
      fireEvent.click(screen.getByRole("button", {name:"Próximo passo"}));
      fireEvent.click(screen.getByRole("checkbox",{hidden:true}));
      fireEvent.click(screen.getByRole("button", {name:/Continuar sem complemento|Próximo passo/}));
      fireEvent.click(
        screen.getByRole("button", { name: "Concluir simulação" }),
      );
      expect(screen.getByTestId("demo-total")).toHaveTextContent(extra);
      expect(fetch).not.toHaveBeenCalled();
    },
  );
  it.each(["lisboa-2026", "porto-2026", "online-2026"])("opens the requested edition from a CRM link: %s", (edition) => {
    history.replaceState(null, "", "/curso-ia/checkout-demonstracao?edition=" + edition);
    render(<CourseCheckoutDemo />);
    expect(screen.getByRole("combobox", { name: "Edição" })).toHaveValue(edition);
    expect(screen.getByRole("checkbox",{hidden:true})).not.toBeChecked();
  });
  it("ignores an unsupported edition in the URL", () => {
    history.replaceState(null, "", "/curso-ia/checkout-demonstracao?edition=constructor");
    render(<CourseCheckoutDemo />);
    expect(screen.getByRole("combobox", { name: "Edição" })).toHaveValue("lisboa-2026");
  });
  it("recalculates a selected pack when the edition changes and preserves the base inclusions", () => {
    render(<CourseCheckoutDemo />);
    fireEvent.click(screen.getByRole("checkbox",{hidden:true}));
    fireEvent.change(screen.getByRole("combobox", { name: "Edição" }), {
      target: { value: "online-2026" },
    });
    expect(screen.getByTestId("demo-total")).toHaveTextContent("570,72");
    expect(screen.getByText("Duas sessões individuais.")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Gravações das sessões online disponíveis durante um ano/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Valor exclusivamente demonstrativo/),
    ).toBeInTheDocument();
    expect(document.querySelector('input[type="email"]')).toBeNull();
  });
});

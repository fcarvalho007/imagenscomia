import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CourseCheckoutDemo from "./CourseCheckoutDemo";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
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
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
      fireEvent.change(screen.getByRole("combobox", { name: "Edição" }), {
        target: { value: edition },
      });
      expect(screen.getByTestId("demo-total")).toHaveTextContent(base);
      fireEvent.click(checkbox);
      expect(screen.getByTestId("demo-total")).toHaveTextContent(extra);
      fireEvent.click(checkbox);
      expect(screen.getByTestId("demo-total")).toHaveTextContent(base);
      fireEvent.click(
        screen.getByRole("button", { name: "Concluir simulação" }),
      );
      expect(
        screen.getByRole("heading", { name: "Simulação concluída." }),
      ).toHaveFocus();
      expect(screen.getByTestId("demo-total")).toHaveTextContent(base);
      fireEvent.click(screen.getByRole("button", { name: "Editar simulação" }));
      fireEvent.click(screen.getByRole("checkbox"));
      fireEvent.click(
        screen.getByRole("button", { name: "Concluir simulação" }),
      );
      expect(screen.getByTestId("demo-total")).toHaveTextContent(extra);
      expect(fetch).not.toHaveBeenCalled();
    },
  );
  it("recalculates a selected pack when the edition changes and preserves the base inclusions", () => {
    render(<CourseCheckoutDemo />);
    fireEvent.click(screen.getByRole("checkbox"));
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

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import WebinarLinks from "./WebinarLinks";
import { WebinarProvider } from "@/contexts/WebinarContext";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function renderWithContext(search: string) {
  window.history.replaceState({}, "", `/crm${search}`);
  return render(
    <WebinarProvider>
      <WebinarLinks />
    </WebinarProvider>
  );
}

describe("WebinarLinks", () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  it("lista os links do Vídeo IA, incluindo landing page e checkout", () => {
    renderWithContext("?webinar=video");
    expect(screen.getByRole("heading", { name: "Landing page" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Checkout" })).toBeInTheDocument();
    expect(screen.getByText(/\/comprar$/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sessão ao vivo" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Convites" })).not.toBeInTheDocument();
  });

  it("lista os links do Imagens IA", () => {
    renderWithContext("?webinar=imagens");
    expect(screen.getByRole("heading", { name: "Convites" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Checkout" })).not.toBeInTheDocument();
  });

  it("no consolidado mostra os dois grupos", () => {
    renderWithContext("?webinar=consolidado");
    expect(screen.getByText(/Imagens IA/)).toBeInTheDocument();
    expect(screen.getByText(/Vídeo IA/)).toBeInTheDocument();
  });

  it("o botão Copiar escreve o endereço absoluto", async () => {
    renderWithContext("?webinar=video");
    fireEvent.click(screen.getByRole("button", { name: "Copiar link: Checkout" }));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`${window.location.origin}/comprar`);
    });
  });
});

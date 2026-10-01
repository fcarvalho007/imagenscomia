import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RichTextEditor from "./RichTextEditor";

// jsdom has no execCommand; record the calls the toolbar makes.
const calls: Array<[string, string | undefined]> = [];

beforeEach(() => {
  calls.length = 0;
  Object.defineProperty(document, "execCommand", {
    configurable: true,
    writable: true,
    value: (command: string, _ui: boolean, argument?: string) => {
      calls.push([command, argument]);
      return true;
    },
  });
});

describe("RichTextEditor interaction", () => {
  it("runs a toolbar action from a keyboard activation (click without mousedown)", () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="" onChange={onChange} />);
    // Enter/Space on a focused button dispatches click only, never mousedown.
    fireEvent.click(screen.getByLabelText("Negrito"));
    expect(calls).toContainEqual(["bold", undefined]);
    expect(onChange).toHaveBeenCalled();
  });

  it("inserts the name token from a keyboard activation", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    fireEvent.click(screen.getByLabelText("Inserir nome"));
    expect(calls).toContainEqual(["insertText", "{{nome}}"]);
  });

  it("keeps the selection on mousedown by preventing the default focus shift", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    fireEvent(screen.getByLabelText("Itálico"), event);
    expect(event.defaultPrevented).toBe(true);
    // Mousedown alone must not execute the command twice.
    expect(calls).toHaveLength(0);
  });

  it("hydrates external value changes such as switching template or clearing the form", () => {
    const { rerender } = render(<RichTextEditor value="<p>Primeiro</p>" onChange={vi.fn()} />);
    const box = screen.getByRole("textbox");
    expect(box.innerHTML).toContain("Primeiro");
    rerender(<RichTextEditor value="<p>Segundo</p>" onChange={vi.fn()} />);
    expect(box.innerHTML).toContain("Segundo");
    rerender(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(box.innerHTML).toBe("");
  });

  it("does not rewrite the box while the author is typing in it", () => {
    const onChange = vi.fn();
    const { rerender } = render(<RichTextEditor value="<p>Inicio</p>" onChange={onChange} />);
    const box = screen.getByRole("textbox") as HTMLDivElement;
    box.focus();
    box.innerHTML = "<p>Inicio editado</p>";
    fireEvent.input(box);
    const emitted = onChange.mock.calls.at(-1)?.[0] as string;
    // The controlled parent echoes the value back: the caret must survive it.
    rerender(<RichTextEditor value={emitted} onChange={onChange} />);
    expect(box.innerHTML).toContain("Inicio editado");
  });
});

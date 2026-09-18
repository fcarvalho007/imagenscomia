import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from "@testing-library/react";
const mocks = vi.hoisted(() => ({
  admin: true,
  aal: "aal2",
  session: true,
  from: vi.fn(),
  rpc: vi.fn(),
  queries: [] as string[],
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: async () => ({
        data: { session: mocks.session ? { user: { id: "qa-user" } } : null },
      }),
      mfa: {
        getAuthenticatorAssuranceLevel: async () => ({
          data: { currentLevel: mocks.aal },
        }),
      },
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signOut: vi.fn(),
    },
    from: mocks.from,
    rpc: mocks.rpc,
  },
}));
vi.mock("@/components/crm/CRMLogin", () => ({
  default: () => <div>Login e segundo fator</div>,
}));
import CourseCRM from "./CourseCRM";
beforeEach(() => {
  cleanup();
  mocks.admin = true;
  mocks.aal = "aal2";
  mocks.session = true;
  mocks.from.mockReset();
  mocks.rpc.mockReset();
  mocks.queries = [];
  mocks.rpc.mockImplementation(async (name) =>
    name === "has_role"
      ? { data: mocks.admin }
      : {
          data: {
            sessions: 10,
            requests: 0,
            confirmed: 0,
            revenue_cents: 0,
            tasks_due: 0,
            quiz_completed: 2,
            pricing_sessions: 3,
            registration_sessions: 1,
            followups_due: 0,
          },
        },
  );
  mocks.from.mockImplementation(() => {
    const q = {
      select: () => q,
      order: () => q,
      range: () => q,
      eq: (name: string, value: string) => {
        mocks.queries.push(name + ":" + value);
        return q;
      },
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: [], error: null }).then(resolve),
    };
    return q;
  });
});
describe("Course CRM access and edition scope", () => {
  it.each(["aal1", "none"])(
    "blocks data queries without aal2 (%s)",
    async (level) => {
      mocks.aal = level;
      render(<CourseCRM />);
      expect(
        await screen.findByText("Login e segundo fator"),
      ).toBeInTheDocument();
      expect(mocks.from).not.toHaveBeenCalled();
    },
  );
  it("blocks non-admins", async () => {
    mocks.admin = false;
    render(<CourseCRM />);
    await screen.findByText("Login e segundo fator");
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("filters rows and metrics together when changing edition", async () => {
    render(<CourseCRM />);
    await screen.findByText("Um curso. Três edições.");
    await waitFor(() => expect(mocks.from).toHaveBeenCalled());
    fireEvent.change(screen.getByLabelText("Edição"), {
      target: { value: "porto-2026" },
    });
    await waitFor(() => expect(mocks.queries).toContain("edition:porto-2026"));
    expect(mocks.rpc).toHaveBeenCalledWith("course_edition_metrics", {
      edition_id: "porto-2026",
    });
  });
  it("shows a backend error instead of invented statistics", async () => {
    mocks.rpc.mockImplementation(async (name) =>
      name === "has_role"
        ? { data: true }
        : { error: { message: "missing migration" } },
    );
    render(<CourseCRM />);
    expect(
      await screen.findByText(/Não foi possível carregar o curso/),
    ).toBeInTheDocument();
  });
});

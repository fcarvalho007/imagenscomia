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
  rows: [] as any[],
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
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  mocks.admin = true;
  mocks.aal = "aal2";
  mocks.session = true;
  mocks.from.mockReset();
  mocks.rpc.mockReset();
  mocks.queries = [];
  mocks.rows = [];
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
  mocks.from.mockImplementation((table) => {
    const q = {
      select: () => q,
      order: () => q,
      range: () => q,
      limit: () => q,
      eq: (name: string, value: string) => {
        mocks.queries.push(name + ":" + value);
        return q;
      },
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: ['course_registrations','course_activity','course_costs'].includes(table)?mocks.rows:[], error: null }).then(resolve),
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
    await screen.findByRole("heading", {name:"Dashboard"});
    await waitFor(() => expect(mocks.from).toHaveBeenCalled());
    fireEvent.change(screen.getByLabelText("Edição"), {
      target: { value: "porto-2026" },
    });
    await waitFor(() => expect(mocks.queries).toContain("edition:porto-2026"));
    expect(mocks.rpc).toHaveBeenCalledWith("course_period_metrics", {
      edition_id: "porto-2026",
      since: null,
    });
  });
  it("keeps the shared WebinarCRM sidebar and switches pipeline and table in place", async () => {
    render(<CourseCRM />);
    await screen.findByRole("heading", {name:"Dashboard"});
    expect(screen.getByText("WebinarCRM")).toBeInTheDocument();
    expect(screen.getByLabelText("Projeto")).toHaveValue("curso-ia");
    fireEvent.click(screen.getByRole("button",{name:"Pipeline"}));
    expect(screen.getByRole("heading",{name:"Pipeline"})).toBeInTheDocument();
    expect(screen.getByRole("button",{name:"Pipeline"})).toHaveAttribute("aria-current","page");
    fireEvent.click(screen.getByRole("button",{name:"Tabela"}));
    expect(screen.getByRole("table",{name:"Inscrições da edição selecionada"})).toBeInTheDocument();
    expect(screen.getByRole("button",{name:"Exportar CSV"})).toBeDisabled();
  });
  it("shows a backend error instead of invented statistics", async () => {
    mocks.rpc.mockImplementation(async (name) =>
      name === "has_role"
        ? { data: true }
        : { error: { message: "missing migration" } },
    );
    render(<CourseCRM />);
    expect(
      await screen.findByText(/Indicadores indisponíveis/),
    ).toBeInTheDocument();
  });
});

it("opens the original contact modal and financial table without touching webinar endpoints",async()=>{
 mocks.rows=[{id:'course-only',name:'Participante de teste',email:'teste@example.invalid',phone:'',edition:'lisboa-2026',status:'confirmed',notes:'',next_followup_at:null,created_at:'2026-09-01T10:00:00Z',marketing_consent:false,before_session:'pending',after_session:'pending',attribution:{},course_payments:{state:'paid',amount_cents:61131,paid_at:'2026-09-01T10:00:00Z'},course_invoices:null,course_tasks:[]}];
 render(<CourseCRM/>);
 await screen.findByRole('heading',{name:'Dashboard'});
 await waitFor(()=>expect(mocks.from).toHaveBeenCalled());
 fireEvent.click(screen.getByRole('button',{name:'Tabela'}));
 fireEvent.click(await screen.findByText('Participante de teste',{exact:true}));
 expect(screen.getByRole('dialog',{name:'Ficha de Participante de teste'})).toBeInTheDocument();
 expect(screen.queryByRole('button',{name:'Enviar link de pagamento'})).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Fechar ficha'}));
 fireEvent.click(screen.getByRole('button',{name:'Faturação'}));
 expect(await screen.findByText('Faturação · InvoiceExpress')).toBeInTheDocument();
 expect(screen.queryByRole('button',{name:'Emitir e Enviar'})).not.toBeInTheDocument();
 expect(mocks.from.mock.calls.every(([table])=>['course_registrations','course_activity','course_costs'].includes(table))).toBe(true);
 expect(mocks.rpc.mock.calls.every(([name])=>['has_role','course_period_metrics'].includes(name))).toBe(true);
});

it('retains original webinar columns and table controls without the course extension',async()=>{
 const {default:PipelineView}=await import('@/components/crm/PipelineView');
 const {default:TableView}=await import('@/components/crm/TableView');
 const {WebinarProvider}=await import('@/contexts/WebinarContext');
 const renderView=render(<WebinarProvider><PipelineView inscritos={[]} onSelectInscrito={()=>{}}/></WebinarProvider>);
 expect(screen.getByText('Masterclass Vídeo')).toBeInTheDocument();
 expect(screen.getByText('Pack IA Completo (SP + MC)')).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Pré-webinar'})).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Faturas em lote'})).toBeInTheDocument();
 renderView.unmount();
 render(<WebinarProvider><TableView inscritos={[]} onSelectInscrito={()=>{}}/></WebinarProvider>);
 expect(screen.getByRole('option',{name:'Todos os planos'})).toBeInTheDocument();
 expect(screen.getByRole('option',{name:'Masterclass'})).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Faturas em lote'})).toBeInTheDocument();
});

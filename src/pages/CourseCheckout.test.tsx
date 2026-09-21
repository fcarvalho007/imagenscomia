import {fireEvent, render, screen, cleanup, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import CourseCheckout from './CourseCheckout';
import {checkoutRequest,loadCheckoutConfig} from '@/lib/course/checkout-client';
vi.mock('@/lib/course/checkout-client',async()=>({...await vi.importActual('@/lib/course/checkout-client'),checkoutRequest:vi.fn(),loadCheckoutConfig:vi.fn()}));
beforeEach(()=>{
 vi.spyOn(window,'scrollTo').mockImplementation(()=>{});
 vi.mocked(loadCheckoutConfig).mockResolvedValue({enabled:true,nonce:'test-only',privacyUrl:'https://fredericocarvalho.pt/privacidade',termsUrl:'https://fredericocarvalho.pt/condicoes'});
 vi.mocked(checkoutRequest).mockImplementation(async(_config,kind,body)=>kind==='quote'?{accepted:true,quote:{net_cents:(body as {edition:string}).edition==='online-2026'?39700:49700,amount_cents:(body as {edition:string}).edition==='online-2026'?48831:61131,vat_percent:23,currency:'EUR'}}:{accepted:true,state:'review'});
});
afterEach(()=>{cleanup();vi.clearAllMocks();vi.restoreAllMocks();history.replaceState(null,'','/');sessionStorage.clear();});
describe('guided checkout',()=>{
 it.each(['lisboa-2026','porto-2026','online-2026'])('validates each step and waits for explicit final submission: %s',async edition=>{
  history.replaceState(null,'','/?edition='+edition);render(<CourseCheckout/>);
  await screen.findByRole('heading',{name:'Onde quer participar?'});
  const next=()=>fireEvent.click(screen.getByRole('button',{name:'Próximo passo'}));
  next();next();expect(screen.getByRole('heading',{name:'Como se chama?'})).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Nome completo'),{target:{value:'Teste local'}});next();
  fireEvent.change(screen.getByLabelText('Email',{exact:true}),{target:{value:'invalid'}});next();
  expect(screen.getByRole('heading',{name:'Qual é o seu email?'})).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Email',{exact:true}),{target:{value:'test@example.invalid'}});next();
  fireEvent.click(screen.getByRole('button',{name:/^Continuar$/}));next();
  expect(screen.getByRole('heading',{name:'Como podemos contactar consigo?'})).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText(/Li a/));fireEvent.click(screen.getByLabelText(/Aceito as/));next();
  expect(screen.getByRole('heading',{name:'Está tudo certo?'})).toBeInTheDocument();
  expect(vi.mocked(checkoutRequest).mock.calls.filter(c=>c[1]==='checkout')).toHaveLength(0);
  await waitFor(()=>expect(screen.getByRole('button',{name:'Continuar para pagamento'})).toBeEnabled());
  fireEvent.click(screen.getByRole('button',{name:'Continuar para pagamento'}));
  await waitFor(()=>expect(vi.mocked(checkoutRequest).mock.calls.filter(c=>c[1]==='checkout')).toHaveLength(1));
  const payload=vi.mocked(checkoutRequest).mock.calls.find(c=>c[1]==='checkout')![2];
  expect(payload).toMatchObject({edition,name:'Teste local',email:'test@example.invalid',sms_consent:false,marketing_consent:false,expected_amount:edition==='online-2026'?48831:61131});
 });
});

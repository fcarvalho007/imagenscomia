import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import CourseAutomationFlow from './CourseAutomationFlow';
afterEach(cleanup);
const props={counts:null,registrations:null,enabled:false,startsAt:'2026-10-29T09:00:00Z',endsAt:'2026-10-30T17:30:00Z',onPreview:vi.fn(),onPeople:vi.fn()};
it('shows the full day-grouped sequence with computed dates and links counts to people filters',()=>{
 const onPeople=vi.fn();render(<CourseAutomationFlow {...props} counts={[{template:'confirmation',state:'blocked',count:3}]} registrations={12} onPeople={onPeople}/>);
 expect(screen.getByText('PRÉ-CURSO')).toBeTruthy();
 expect(screen.getByText(/DIA 0 · INÍCIO — 29 OUT/)).toBeTruthy();
 expect(screen.getByText(/DIA 1 · PÓS-CURSO — 31 OUT/)).toBeTruthy();
 expect(screen.getByText(/DIA 7 · ACOMPANHAMENTO — 6 NOV/)).toBeTruthy();
 expect(screen.getByText(/DIA 14 · LEMBRETE — 13 NOV/)).toBeTruthy();
 expect(screen.getByText(/DIA 30 · FECHO — 29 NOV/)).toBeTruthy();
 expect(screen.getByText('48 horas antes')).toBeTruthy();expect(screen.getByText('24 horas antes')).toBeTruthy();
 expect(screen.getByText('7 dias depois do fim')).toBeTruthy();expect(screen.getByText('14 dias depois do fim')).toBeTruthy();
 expect(screen.getByText(/12 inscrições nesta edição/)).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Bloqueados: 3'}));expect(onPeople).toHaveBeenCalledWith('confirmation','blocked');
});
it('keeps unavailable counts unknown and previews SMS without sending',()=>{
 const onPreview=vi.fn();render(<CourseAutomationFlow {...props} onPreview={onPreview}/>);
 expect(screen.getByText(/Contagem indisponível/)).toBeTruthy();
 expect(screen.getAllByRole('button',{name:'Agendados: —'})).toHaveLength(7);
 fireEvent.click(screen.getAllByRole('button',{name:'Ver SMS e template'})[0]);expect(onPreview).toHaveBeenCalledWith('practical_sms');
});

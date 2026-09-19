import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import CourseAutomationFlow from './CourseAutomationFlow';
afterEach(cleanup);
const props={counts:null,registrations:null,enabled:false,startsAt:'2026-10-29T09:00:00Z',endsAt:'2026-10-30T17:30:00Z',onPreview:vi.fn(),onPeople:vi.fn()};
it('separates pre/post timings and links a message count to exact people filter',()=>{
 const onPeople=vi.fn();render(<CourseAutomationFlow {...props} counts={[{template:'confirmation',state:'blocked',count:3}]} registrations={12} onPeople={onPeople}/>);
 expect(screen.getByText('48 horas antes')).toBeTruthy();expect(screen.getByText('24 horas antes')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Bloqueados: 3'}));expect(onPeople).toHaveBeenCalledWith('confirmation','blocked');
 fireEvent.click(screen.getByRole('button',{name:'Pós-evento'}));expect(screen.getByText('14 dias depois')).toBeTruthy();expect(screen.queryByText('48 horas antes')).toBeNull();
});
it('keeps unavailable counts unknown and previews SMS without sending',()=>{
 const onPreview=vi.fn();render(<CourseAutomationFlow {...props} onPreview={onPreview}/>);
 expect(screen.getByText(/Contagem indisponível/)).toBeTruthy();expect(screen.getAllByRole('button',{name:'Agendados: —'})).toHaveLength(4);
 fireEvent.click(screen.getByRole('button',{name:'Ver SMS e template'}));expect(onPreview).toHaveBeenCalledWith('practical_sms');
});

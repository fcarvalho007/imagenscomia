UPDATE email_templates SET html_body = '<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px 28px;">
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá {{fname}},</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Ontem fizemos uma sessão sobre vídeo com IA — desde briefing até clip publicável.</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 24px;">Se quiseres rever tudo com calma, a gravação completa está disponível no Premium Pass.</p>
  <div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#555;font-size:15px;font-weight:700;margin:0 0 12px;">Premium Pass — €27+IVA</p>
    <p style="color:#333;font-size:15px;margin:0 0 4px;">✓ Sessão completa em HD (~70 min, sem cortes)</p>
    <p style="color:#333;font-size:15px;margin:0 0 4px;">✓ Workbook Resumo da Sessão (PDF)</p>
    <p style="color:#333;font-size:15px;margin:0 0 4px;">✓ Guia técnico de GEMs para vídeo</p>
    <p style="color:#333;font-size:15px;margin:0 0 16px;">✓ Sessão Q&A ao vivo (10 Março, 14h30)</p>
    <div style="text-align:center;">
      <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Obter o Premium Pass — €27+IVA →</a>
    </div>
  </div>
  <div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#333;font-size:16px;font-weight:700;margin:0 0 8px;">Queres ir mais fundo?</p>
    <p style="color:#555;font-size:15px;font-weight:700;margin:0 0 8px;">Masterclass Vídeo com IA — €47+IVA</p>
    <p style="color:#555;font-size:15px;margin:0 0 12px;">3 horas ao vivo com demonstrações avançadas, casos reais e acompanhamento personalizado.</p>
    <p style="color:#333;font-size:15px;margin:0 0 16px;">📅 Quinta-feira, 12 de Março às 10h00</p>
    <div style="text-align:center;">
      <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Saber mais sobre a Masterclass →</a>
    </div>
  </div>
  <p style="color:#999;font-size:13px;line-height:1.5;margin:16px 0 0;">Até breve,</p>
  <p style="color:#333;font-size:16px;font-weight:700;margin:4px 0 0;">Frederico Carvalho</p>
  <p style="color:#999;font-size:12px;margin:0;">DIGITALFC</p>
</div>
</body></html>', updated_at = now() WHERE template_key = 'video_postwebinar_day1';

UPDATE email_templates SET html_body = '<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px 28px;">
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá {{fname}},</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Este é o último email sobre o webinar de Vídeo com IA.</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Se decidiste que não é para ti neste momento, tudo bem — sem pressão nenhuma.</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Mas se ainda tens interesse, esta é a última oportunidade para garantir o Premium Pass com acesso à gravação, workbook, guia GEMs e Q&A.</p>
  <div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#555;font-size:15px;font-weight:700;margin:0 0 12px;">Premium Pass — €27+IVA</p>
    <div style="text-align:center;">
      <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Última oportunidade — Obter acesso →</a>
    </div>
  </div>
  <p style="color:#999;font-size:13px;line-height:1.5;margin:16px 0 0;">Obrigado por teres participado.</p>
  <p style="color:#333;font-size:16px;font-weight:700;margin:4px 0 0;">Frederico Carvalho</p>
  <p style="color:#999;font-size:12px;margin:0;">DIGITALFC</p>
</div>
</body></html>', updated_at = now() WHERE template_key = 'video_postwebinar_closing';
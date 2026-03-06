-- 1. video_confirmation_post_event — Confirmação pós-evento (standalone product)
UPDATE email_templates
SET subject = '{{fname}}, tens uma sessão prática à tua espera 🎬',
    html_body = '<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px 28px;">
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá {{fname}},</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 8px;">Obrigado pela inscrição. ✅</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 24px;">Preparámos uma <strong>sessão prática de 70 minutos sobre criação de vídeo profissional com IA</strong> — do briefing ao clip publicável, sem cortes, sem teoria a mais. Vai directo ao ponto.</p>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:24px;margin:0 0 24px;">
    <p style="color:#166534;font-size:18px;font-weight:700;margin:0 0 12px;">🎬 Premium Pass — €27+IVA</p>
    <ul style="color:#333;font-size:15px;line-height:1.8;margin:0 0 16px;padding-left:20px;">
      <li>Sessão HD completa (70 min, sem cortes)</li>
      <li>Workbook Resumo da Sessão (PDF)</li>
      <li>Guia técnico de GEMs para vídeo</li>
      <li>Versão áudio MP3 para ouvir em movimento</li>
    </ul>
    <div style="text-align:center;">
      <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:16px;">Obter acesso à sessão →</a>
    </div>
  </div>
  <div style="border-top:1px solid #eee;padding-top:20px;margin:0 0 24px;">
    <p style="color:#333;font-size:15px;font-weight:700;margin:0 0 8px;">🎓 Masterclass — €47+IVA</p>
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 8px;">3 horas de formação avançada com demonstrações ao vivo, casos reais e acompanhamento personalizado. Inclui tudo do Premium Pass.</p>
  </div>
  <div style="border-top:1px solid #eee;padding-top:16px;margin-top:32px;">
    <p style="color:#333;font-size:16px;margin:0 0 4px;">Abraço,</p>
    <p style="color:#333;font-size:16px;font-weight:700;margin:0 0 4px;">Frederico Carvalho</p>
    <p style="color:#999;font-size:12px;margin:0;">DIGITALFC</p>
  </div>
</div>
</body></html>',
    updated_at = now()
WHERE template_key = 'video_confirmation_post_event';

-- 2. video_postwebinar_day1 — Day 1 (24h)
UPDATE email_templates
SET subject = '70 minutos que mudam a forma como crias vídeo, {{fname}}',
    html_body = '<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px 28px;">
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá {{fname}},</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Queria saber se já tiveste oportunidade de ver a sessão prática sobre vídeo com IA.</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 24px;">São <strong>70 minutos</strong> de conteúdo directo ao ponto — desde o briefing inicial até ao clip publicável. Sem teoria a mais, sem enrolamento. Tudo o que precisas para começar a criar vídeo profissional com IA.</p>
  <div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#555;font-size:15px;font-weight:700;margin:0 0 12px;">Premium Pass — €27+IVA</p>
    <p style="color:#333;font-size:15px;margin:0 0 4px;">✓ Sessão HD completa (70 min, sem cortes)</p>
    <p style="color:#333;font-size:15px;margin:0 0 4px;">✓ Workbook Resumo da Sessão (PDF)</p>
    <p style="color:#333;font-size:15px;margin:0 0 4px;">✓ Guia técnico de GEMs para vídeo</p>
    <p style="color:#333;font-size:15px;margin:0 0 16px;">✓ Versão áudio MP3</p>
    <div style="text-align:center;">
      <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Quero acesso à sessão — €27+IVA →</a>
    </div>
  </div>
  <div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#333;font-size:16px;font-weight:700;margin:0 0 8px;">Queres ir mais fundo?</p>
    <p style="color:#555;font-size:15px;font-weight:700;margin:0 0 8px;">Masterclass — €47+IVA</p>
    <p style="color:#555;font-size:15px;margin:0 0 12px;">3 horas de formação avançada com demonstrações ao vivo, casos reais e acompanhamento personalizado. Inclui tudo do Premium Pass.</p>
    <div style="text-align:center;">
      <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#7c3aed;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Saber mais sobre a Masterclass →</a>
    </div>
  </div>
  <p style="color:#999;font-size:13px;line-height:1.5;margin:16px 0 0;">Até breve,</p>
  <p style="color:#333;font-size:16px;font-weight:700;margin:4px 0 0;">Frederico Carvalho</p>
  <p style="color:#999;font-size:12px;margin:0;">DIGITALFC</p>
</div>
</body></html>',
    updated_at = now()
WHERE template_key = 'video_postwebinar_day1';

-- 3. video_postwebinar_day3 — Day 3 (72h)
UPDATE email_templates
SET subject = 'Ainda a tempo, {{fname}} ⏳',
    html_body = '<!DOCTYPE html>
<html lang="pt"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
<tr><td style="background:linear-gradient(135deg,#166534 0%,#16a34a 100%);padding:32px 40px;text-align:center;">
  <p style="margin:0 0 6px;font-size:12px;color:#bbf7d0;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">Vídeo com IA</p>
  <h1 style="margin:0;font-size:24px;font-weight:700;color:#fff;line-height:1.3;">Ainda a tempo, {{fname}} ⏳</h1>
  <p style="margin:10px 0 0;font-size:15px;color:#dcfce7;">O acesso à sessão prática continua disponível.</p>
</td></tr>
<tr><td style="padding:36px 40px;">
  <p style="margin:0 0 20px;font-size:16px;color:#374151;line-height:1.6;">Olá {{fname}},</p>
  <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.7;">Sei que às vezes o timing não é o ideal — por isso queria lembrar-te que ainda podes aceder à sessão prática sobre criação de vídeo com IA.</p>
  <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.7;">São 70 minutos de conteúdo prático e directo, com tudo o que precisas para começar a produzir vídeo profissional com ferramentas de IA.</p>
  <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1f2937;">O que inclui:</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr><td style="padding:6px 0;font-size:14px;color:#374151;">▸ Sessão HD completa (70 min, sem cortes)</td></tr>
    <tr><td style="padding:6px 0;font-size:14px;color:#374151;">▸ Workbook Resumo da Sessão (PDF)</td></tr>
    <tr><td style="padding:6px 0;font-size:14px;color:#374151;">▸ Guia técnico de GEMs para vídeo</td></tr>
    <tr><td style="padding:6px 0;font-size:14px;color:#374151;">▸ Versão áudio MP3 para ouvir em qualquer lado</td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
  <tr><td align="center">
    <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">Obter a sessão — €27+IVA →</a>
  </td></tr>
  </table>
  <p style="text-align:center;font-size:13px;color:#9ca3af;">Dúvidas? Fala connosco via <a href="https://wa.me/351915015508" style="color:#16a34a;text-decoration:none;">WhatsApp</a>.</p>
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
  <p style="margin:0;font-size:12px;color:#9ca3af;">Frederico Carvalho · <a href="https://imagenscomia.com" style="color:#16a34a;text-decoration:none;">imagenscomia.com</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>',
    updated_at = now()
WHERE template_key = 'video_postwebinar_day3';

-- 4. video_postwebinar_closing — Email de fecho
UPDATE email_templates
SET subject = 'Um último email, {{fname}}',
    html_body = '<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px 28px;">
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá {{fname}},</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Este é o último email que te envio sobre a sessão prática de Vídeo com IA.</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Se decidiste que não é para ti neste momento, tudo bem — sem pressão nenhuma.</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Mas se ainda tens interesse, esta é a última oportunidade para garantir o acesso à sessão completa com todos os materiais de apoio.</p>
  <div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#555;font-size:15px;font-weight:700;margin:0 0 8px;">Premium Pass — €27+IVA</p>
    <p style="color:#333;font-size:14px;margin:0 0 4px;">✓ 70 min de sessão prática (HD, sem cortes)</p>
    <p style="color:#333;font-size:14px;margin:0 0 4px;">✓ Workbook + Guia GEMs + Áudio MP3</p>
    <div style="text-align:center;margin-top:16px;">
      <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Última oportunidade — Obter acesso →</a>
    </div>
  </div>
  <p style="color:#999;font-size:13px;line-height:1.5;margin:16px 0 0;">Obrigado pelo interesse.</p>
  <p style="color:#333;font-size:16px;font-weight:700;margin:4px 0 0;">Frederico Carvalho</p>
  <p style="color:#999;font-size:12px;margin:0;">DIGITALFC</p>
</div>
</body></html>',
    updated_at = now()
WHERE template_key = 'video_postwebinar_closing';
UPDATE email_templates
SET html_body = '<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Georgia,''Times New Roman'',serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#064e3b 0%,#16a34a 100%);padding:44px 32px 36px;text-align:center;">
    <p style="color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">✅ Masterclass · Vídeo Profissional com IA</p>
    <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0;letter-spacing:-0.3px;">Obrigado pela presença</h1>
  </div>

  <!-- Body -->
  <div style="padding:40px 32px 32px;">
    <p style="color:#1a1a1a;font-size:16px;line-height:1.8;margin:0 0 18px;">Olá {{fname}},</p>
    <p style="color:#333;font-size:16px;line-height:1.8;margin:0 0 18px;">Chegou ao fim a Masterclass de Vídeo Profissional com Inteligência Artificial e a sequência de conteúdos ao tema de conteúdo visual.</p>
    <p style="color:#333;font-size:16px;line-height:1.8;margin:0 0 28px;">Para quem teve a oportunidade de assistir ao vivo, obrigado pela presença e participação.</p>

    <!-- Callout box -->
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:24px 24px;border-radius:0 10px 10px 0;margin:0 0 32px;">
      <p style="color:#1a1a1a;font-size:15px;line-height:1.8;margin:0;"><span style="font-size:20px;vertical-align:middle;">📦</span>&nbsp; Nas próximas <strong>24 horas</strong>, vou enviar novo email, com o acesso à gravação completa, materiais e conteúdo complementar do que foi partilhado durante a sessão.</p>
    </div>

    <!-- Resources -->
    <p style="color:#1a1a1a;font-size:16px;line-height:1.8;margin:0 0 16px;font-weight:600;">Adicionalmente:</p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 12px;">
      <tr>
        <td style="padding:16px 20px;background:#fafafa;border-radius:10px;border:1px solid #eee;">
          <p style="margin:0 0 8px;font-size:15px;color:#333;line-height:1.6;"><span style="font-size:18px;vertical-align:middle;">📚</span>&nbsp; Para rever o conteúdo e ficheiros do webinar <strong>Imagens com IA</strong> (18 Fev):</p>
          <a href="https://imagenscomia.com/recursos" style="display:inline-block;background:#16a34a;color:#ffffff;font-size:14px;font-weight:600;padding:10px 24px;border-radius:6px;text-decoration:none;letter-spacing:0.3px;">Aceder a Recursos — Imagens</a>
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 28px;">
      <tr>
        <td style="padding:16px 20px;background:#fafafa;border-radius:10px;border:1px solid #eee;">
          <p style="margin:0 0 8px;font-size:15px;color:#333;line-height:1.6;"><span style="font-size:18px;vertical-align:middle;">🎬</span>&nbsp; Para rever o conteúdo e ficheiros do webinar <strong>Vídeo com IA</strong> (12 Fev):</p>
          <a href="https://imagenscomia.com/recursos-video" style="display:inline-block;background:#16a34a;color:#ffffff;font-size:14px;font-weight:600;padding:10px 24px;border-radius:6px;text-decoration:none;letter-spacing:0.3px;">Aceder a Recursos — Vídeo</a>
        </td>
      </tr>
    </table>

    <p style="color:#888;font-size:14px;line-height:1.7;margin:0 0 24px;font-style:italic;">Acesso através do email registado na plataforma.</p>
    <p style="color:#333;font-size:16px;line-height:1.8;margin:0 0 32px;">Acredito que a documentação e os processos vão trazer valor acrescentado.</p>

    <!-- Signature -->
    <div style="border-top:1px solid #eee;padding-top:24px;margin-top:8px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;padding-right:16px;">
            <img src="https://imagenscomia.com/frederico-avatar.jpg" alt="Frederico Carvalho" width="52" height="52" style="border-radius:50%;display:block;object-fit:cover;" />
          </td>
          <td style="vertical-align:middle;">
            <p style="color:#1a1a1a;font-size:15px;font-weight:700;margin:0 0 2px;">Frederico Carvalho</p>
            <p style="color:#999;font-size:12px;margin:0;">DIGITALFC · <a href="https://fredericocarvalho.pt" style="color:#999;text-decoration:none;">fredericocarvalho.pt</a></p>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
    <p style="color:#bbb;font-size:11px;line-height:1.6;margin:0;">DIGITALFC · Porto, Portugal<br>Este email foi enviado porque participou num evento Imagens com IA.</p>
  </div>

</div>
</body></html>',
updated_at = now()
WHERE template_key = 'video_masterclass_thankyou'
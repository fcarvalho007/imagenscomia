(() => {
  const config = window.FCIA_WOO_CHECKOUT;
  if (!config) return;
  document.addEventListener('change', event => {
    if (event.target.name !== 'ondedesejarealizarcurso') return;
    const target = new URL(config.url);
    target.searchParams.set('fcia_edition', event.target.value);
    location.assign(target.href);
  });
  function metrics() {
    const field = document.getElementById('fcia_metrics');
    if (!field) return;
    field.value = '';
    try {
      if (localStorage.getItem('fcia-metrics-consent') !== 'allow') return;
      const session = sessionStorage.getItem('fcia-session');
      if (!/^[a-f0-9-]{36}$/i.test(session || '')) return;
      const campaign = JSON.parse(sessionStorage.getItem('fcia-campaign') || '{}');
      field.value = JSON.stringify({ ...campaign, consent: 'allow', session_id: session });
    } catch { /* Analytics is optional; it must not block payment. */ }
  }
  metrics();
  if (window.jQuery) window.jQuery(document.body).on('updated_checkout', metrics);
})();

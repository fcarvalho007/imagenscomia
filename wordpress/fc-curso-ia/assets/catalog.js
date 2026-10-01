/* Catalogue supplied by WordPress. No personal information is stored here. */
(() => {
  const rows = window.FCIA_INTEGRATION?.editions;
  if (!Array.isArray(rows) || !rows.length) return;
  const choices = {};
  const money = n => new Intl.NumberFormat('pt-PT', {style:'currency',currency:'EUR',maximumFractionDigits:2}).format(n/100);
  const date = value => new Intl.DateTimeFormat('pt-PT',{day:'numeric',month:'long',timeZone:'Europe/Lisbon'}).format(new Date(value));
  const selected = mode => rows.find(e=>e.id===choices[mode]) || rows.filter(e=>e.modality===mode).sort((a,b)=>Number(b.can_buy)-Number(a.can_buy)||Date.parse(a.starts_utc)-Date.parse(b.starts_utc))[0];
  const text = (selector, value) => {const node=document.querySelector(selector);if(node && node.textContent!==value)node.textContent=value;};
  const mode = () => {const value=document.querySelector('#compact-location')?.textContent.toLowerCase()||'';return value.includes('porto')?'porto':value.includes('online')?'online':'lisboa';};
  window.FCIA_CATALOG={selected};
  function render() {
    for (const m of ['lisboa','porto','online']) {
      const e=selected(m);const card=document.querySelector(m==='lisboa'?'.edition-featured':'.edition-'+m);
      if(!e){if(card)card.hidden=true;continue;}
      if(!card)continue;
      const root=m==='lisboa'?'.edition-featured':'.edition-'+m;
      text(root+' .edition-date strong',e.date_label);text(root+' .edition-date span',e.schedule);text(root+' .edition-date small',e.venue);
      text(root+' .edition-price p strong',money(e.price_cents));text(root+' .edition-price > small',money(Math.round(e.price_cents*1.23))+' com IVA a 23%');
      const early=e.early_utc&&Date.now()<Date.parse(e.early_utc);
      text(root+' .edition-price > span',early?'Inscrição (early-bird)':'Inscrição');
      text(root+' .price-deadline strong',early?'Até '+date(e.early_utc):'Preço em vigor');
      text(root+' .price-deadline > span',early?'Depois: '+money(e.net_cents)+' + IVA.':'');
      const next=card.querySelector('.next-price');if(next){next.hidden=!early;text(root+' .next-price strong',money(e.net_cents)+' + IVA');text(root+' .next-price > span:last-child',money(Math.round(e.net_cents*1.23))+' com IVA');}
      const button=card.querySelector('[data-select-format]');if(button){const disabled=!e.can_buy;button.setAttribute('aria-disabled',String(disabled));if(disabled&&button.textContent!=='Edição indisponível')button.textContent='Edição indisponível';if(!disabled&&button.textContent==='Edição indisponível')button.textContent='Quero inscrever-me';}
    }
    if(!document.body.classList.contains('course-open'))return;
    const m=mode(),e=selected(m);if(!e)return;
    text('#compact-location',e.label);text('#compact-venue',e.venue);text('#compact-date',e.date_label);text('#compact-schedule',e.schedule);text('#compact-duration',e.duration);text('#compact-price',money(e.price_cents));text('#compact-total',money(Math.round(e.price_cents*1.23))+' com IVA');
    const early=e.early_utc&&Date.now()<Date.parse(e.early_utc);text('#compact-price-label',early?'Inscrição (early-bird)':'Inscrição');text('#compact-deadline',!e.can_buy?'Edição indisponível':early?'Até '+date(e.early_utc):'');
    text('#hero-edition',e.label);text('#hero-date',e.date_label);text('#hero-venue',e.venue);text('#hero-lisboa-price',money(e.price_cents));text('#hero-lisboa-total',money(Math.round(e.price_cents*1.23))+' no total');
    const alternatives=rows.filter(r=>r.modality===m);
    let picker=document.getElementById('fcia-edition-picker');
    if(alternatives.length>1){
      if(!picker){const label=document.createElement('label');label.id='fcia-edition-picker-label';label.textContent='Escolha a edição';picker=document.createElement('select');picker.id='fcia-edition-picker';picker.setAttribute('aria-label','Escolha a edição');label.append(picker);document.getElementById('compact-summary')?.append(label);picker.addEventListener('change',()=>{choices[picker.dataset.mode]=picker.value;render();});}
      if(picker.dataset.mode!==m||picker.options.length!==alternatives.length){picker.replaceChildren(...alternatives.map(r=>new Option(r.date_label+(r.can_buy?'':' · indisponível'),r.id)));picker.dataset.mode=m;}
      picker.value=e.id;picker.parentElement.hidden=false;
    }else if(picker)picker.parentElement.hidden=true;
  }
  let queued=false;
  const observer=new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;observer.disconnect();render();observe();});}});
  function observe(){for(const selector of ['#compact-summary','#edicoes','#hero-title']){const node=document.querySelector(selector);if(node)observer.observe(node,{childList:true,subtree:true,characterData:true});}observer.observe(document.body,{attributes:true,attributeFilter:['class']});}
  document.addEventListener('fc:qualification',render);
  document.addEventListener('click',event=>{if(event.target.closest('[data-select-format][aria-disabled="true"]')){event.preventDefault();event.stopImmediatePropagation();}},true);
  render();observe();
})();

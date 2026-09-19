/* Course integration: no backend calls until enabled; analytics requires opt-in. */
(() => {
 'use strict';
 const config = window.FCIA_INTEGRATION;
 if (!config || (!config.enabled && !config.tracking)) return;
 const $ = s => document.querySelector(s);
 const storage = {get:(k,session=false)=>{try{return (session?sessionStorage:localStorage).getItem(k);}catch{return null;}},set:(k,v,session=false)=>{try{(session?sessionStorage:localStorage).setItem(k,v);}catch{/* Storage is optional. */}},remove:(k)=>{try{sessionStorage.removeItem(k);}catch{/* Storage is optional. */}}};
 const uid = () => crypto.randomUUID();
 let consent = storage.get('fcia-metrics-consent') === 'allow';
 let session = null;
 let campaign = {};
 let pricingVisible = false;
 let edition = 'lisboa-2026';
 const names = {'lisboa-2026':'Lisboa · 29 e 30 outubro 2026','porto-2026':'Porto · 19 e 20 novembro 2026','online-2026':'Online · 2, 4, 9 e 11 dezembro 2026'};
 const sent = new Set();
 async function post(url,data) {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{const response=await fetch(url,{method:'POST',credentials:'same-origin',signal:controller.signal,headers:{'Content-Type':'application/json','X-WP-Nonce':config.nonce},body:JSON.stringify(data)});
  if(!response.ok)throw new Error('Pedido não guardado');
  const result=await response.json();if(result.accepted!==true)throw new Error('Receção não confirmada');return result;}finally{clearTimeout(timer);}
 }
 function event(name,once=true){
  const key=name==='page_view'?name:name+':'+edition;
  if(!config.tracking||!consent||!session||(once&&sent.has(key)))return;
  sent.add(key);
  post(config.eventUrl,{id:uid(),session_id:session,name,edition:name==='page_view'?null:edition}).catch(()=>{sent.delete(key);});
 }
 function beginMetrics(){
  if(!config.tracking||!consent)return;
  session=storage.get('fcia-session',true)||uid();storage.set('fcia-session',session,true);
  const params=new URLSearchParams(location.search);campaign={};
  try{const saved=JSON.parse(storage.get('fcia-campaign',true)||'{}');for(const key of ['utm_source','utm_medium','utm_campaign'])if(/^[a-zA-Z0-9_-]{1,100}$/.test(saved[key]||''))campaign[key]=saved[key];}catch{/* Ignore corrupt optional attribution. */}
  for(const key of ['utm_source','utm_medium','utm_campaign']){const value=params.get(key);if(value&&/^[a-zA-Z0-9_-]{1,100}$/.test(value))campaign[key]=value;}
  storage.set('fcia-campaign',JSON.stringify(campaign),true);
  event('page_view');if(pricingVisible)event('pricing_viewed');
 }
 if(config.tracking){
  const panel=document.createElement('aside');panel.className='fcia-consent';panel.setAttribute('aria-label','Métricas opcionais');
  panel.innerHTML='<p>Podemos medir as visitas e os passos até à inscrição para melhorar esta página? A sua escolha não afeta a inscrição.</p><div><button type="button" data-metrics="allow">Permitir métricas</button><button type="button" data-metrics="deny">Não permitir</button></div>';
  panel.hidden=storage.get('fcia-metrics-consent')!==null;
  document.body.append(panel);
  const preferences=document.createElement('button');preferences.type='button';preferences.className='fcia-preferences';preferences.textContent='Preferências de métricas';
  ($('footer')||document.body).append(preferences);
  preferences.addEventListener('click',()=>{panel.hidden=false;panel.querySelector('button').focus();});
  panel.addEventListener('click',e=>{const button=e.target.closest('[data-metrics]');if(!button)return;consent=button.dataset.metrics==='allow';storage.set('fcia-metrics-consent',consent?'allow':'deny');panel.hidden=true;if(consent)beginMetrics();else{session=null;campaign={};sent.clear();storage.remove('fcia-session');storage.remove('fcia-campaign');}});
  beginMetrics();
  $('#start-quiz')?.addEventListener('click',()=>event('quiz_started'));
  $('#qualifier')?.addEventListener('change',()=>event('quiz_started'));
  document.addEventListener('fc:qualification',()=>{if(document.body.classList.contains('course-open'))event('quiz_completed');});
  const pricing=$('#edicoes');if(pricing&&'IntersectionObserver' in window)new IntersectionObserver(entries=>{pricingVisible=entries.some(e=>e.isIntersecting);if(pricingVisible)event('pricing_viewed');},{threshold:.15}).observe(pricing);
 }
 function billingPanel(token){
  if(!/^[a-f0-9-]{36}$/i.test(token)||$('#fcia-billing-panel'))return;
  const section=document.createElement('section');section.id='fcia-billing-panel';section.className='fcia-billing-panel';section.setAttribute('aria-labelledby','fcia-billing-title');
  section.innerHTML='<h2 id="fcia-billing-title">Dados para a sua fatura</h2><p>Pagamento confirmado? Complete os dados para receber a fatura-recibo por email.</p><form class="fcia-registration"><div class="fcia-fields"><label>Nome ou empresa<input name="name" autocomplete="organization" required minlength="2" maxlength="180"></label><label>NIF português<input name="tax_id" inputmode="numeric" pattern="[0-9]{9}" maxlength="9" required></label><label>Morada<input name="address" autocomplete="street-address" required minlength="5" maxlength="180"></label><label>Código postal<input name="postal_code" autocomplete="postal-code" placeholder="0000-000" pattern="[0-9]{4}-[0-9]{3}" required></label><label>Localidade<input name="city" autocomplete="address-level2" required minlength="2" maxlength="180"></label></div><p>Para faturação fora de Portugal ou para corrigir uma fatura emitida, contacte o suporte: <a href="tel:+351915015508">915 015 508</a>.</p><button class="button button-primary" type="submit">Guardar dados de faturação</button><p role="status" class="fcia-result"></p></form>';
  document.body.prepend(section);const bf=section.querySelector('form');
  bf.addEventListener('submit',async ev=>{ev.preventDefault();if(!bf.reportValidity())return;const button=bf.querySelector('button');if(button.disabled)return;button.disabled=true;const result=bf.querySelector('[role=status]');
   const billing=Object.fromEntries(new FormData(bf));billing.country='Portugal';
   try{await post(config.billingUrl,{request_id:token,billing});result.textContent='Dados guardados. A fatura será enviada para o email da inscrição após emissão.';button.textContent='Dados guardados';}
   catch{result.textContent='Não foi possível guardar. Verifique o NIF e os restantes dados. Se a fatura já foi emitida, contacte o suporte.';button.disabled=false;}
  });section.scrollIntoView({block:'start'});
 }
 if(config.enabled&&location.hash.startsWith('#fcia-billing=')){
  const token=location.hash.slice('#fcia-billing='.length);history.replaceState(null,'',location.pathname+location.search);billingPanel(token);
 }
 const holder=$('#inscricao');
 let form;
 if(config.enabled&&holder&&!config.checkoutUrl){
  holder.removeAttribute('role');
  const intro=holder.querySelector('p');if(intro)intro.textContent='Preencha os seus dados e continue para o pagamento seguro. A inscrição é confirmada após validação do pagamento.';
  form=document.createElement('form');form.className='fcia-registration';form.id='fcia-registration';
  form.innerHTML=`<div class="fcia-fields"><label>Nome<input name="name" autocomplete="name" required minlength="2" maxlength="120"></label><label>Email<input name="email" type="email" autocomplete="email" required maxlength="254"></label><label>Telefone <span>(opcional)</span><input name="phone" type="tel" autocomplete="tel" maxlength="30"></label><label>Edição<select name="edition">${Object.entries(names).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label></div><label class="fcia-honey" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><label class="fcia-check"><input type="checkbox" name="privacy" required><span>Li a <a class="fcia-privacy" target="_blank" rel="noopener noreferrer">política de privacidade</a> sobre o tratamento dos meus dados para este pedido.</span></label><label class="fcia-check"><input type="checkbox" name="terms" required><span>Aceito as <a class="fcia-terms" target="_blank" rel="noopener noreferrer">condições de inscrição, alteração e cancelamento</a>.</span></label><label class="fcia-check"><input type="checkbox" name="sms"><span>Quero receber por SMS os lembretes deste curso (opcional, para números móveis portugueses).</span></label><label class="fcia-check"><input type="checkbox" name="marketing"><span>Quero receber novidades sobre futuras formações (opcional).</span></label><p class="fcia-quote" aria-live="polite">A consultar o valor da edição…</p><button class="button button-primary" type="submit" disabled>Continuar para pagamento</button><p class="fcia-result" role="status" aria-live="polite"></p>`;
  form.querySelector('.fcia-privacy').href=config.privacyUrl;form.querySelector('.fcia-terms').href=config.termsUrl;
  holder.insertBefore(form,$('#registration-whatsapp'));
  const whatsapp=$('#registration-whatsapp');if(whatsapp){whatsapp.textContent='Prefere falar com o suporte?';whatsapp.className='fcia-support-link';}
  let requestId=uid(),busy=false,quote=null,quoteSequence=0;
  const total=form.querySelector('.fcia-quote');
  const money=cents=>new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(cents/100);
  async function getQuote(){
   const sequence=++quoteSequence;quote=null;form.querySelector('[type=submit]').disabled=true;total.textContent='A consultar o valor da edição…';
   try{const data=await post(config.quoteUrl,{edition:form.elements.edition.value});if(sequence!==quoteSequence)return;quote=data.quote;total.textContent=money(quote.net_cents)+' + IVA ('+quote.vat_percent+'%). Total a pagar: '+money(quote.amount_cents)+'.';form.querySelector('[type=submit]').disabled=false;}
   catch{if(sequence===quoteSequence)total.textContent='Inscrições indisponíveis neste momento. Contacte o suporte.';}
  }
  form.loadQuote=getQuote;
  form.selectEdition=value=>{if(form.elements.edition.value!==value){form.elements.edition.value=value;requestId=uid();}void getQuote();};
  const note=holder.querySelector('small');if(note)note.textContent='Pagamento por cartão, MB WAY ou Multibanco através da Eupago. Para duas inscrições com desconto, contacte o suporte antes de pagar.';
  form.elements.edition.addEventListener('change',()=>{edition=form.elements.edition.value;requestId=uid();void getQuote();event('edition_selected',false);});
  form.addEventListener('focusin',()=>event('registration_started'));
  form.addEventListener('submit',async e=>{
   e.preventDefault();if(busy||!quote||!form.reportValidity())return;
   if(form.elements.sms.checked&&!/^(?:\+351|00351)?9[1236]\d{7}$/.test(form.elements.phone.value.replace(/\s/g,''))){form.querySelector('.fcia-result').textContent='Para receber SMS, indique um número móvel português válido ou retire essa opção.';form.elements.phone.focus();return;}
   busy=true;const button=form.querySelector('[type=submit]'),result=form.querySelector('.fcia-result');button.disabled=true;button.textContent='A enviar…';result.textContent='';
   const data={expected_amount:quote.amount_cents,request_id:requestId,edition:form.elements.edition.value,name:form.elements.name.value,email:form.elements.email.value,phone:form.elements.phone.value,website:form.elements.website.value,privacy_acknowledged:form.elements.privacy.checked,terms_acknowledged:form.elements.terms.checked,marketing_consent:form.elements.marketing.checked,sms_consent:form.elements.sms.checked,session_id:consent?session:null,attribution:consent?campaign:{}};
   storage.set('fcia-checkout',JSON.stringify({request_id:requestId,edition}),true);
   try{
    const resultData=await post(config.registrationUrl,data);
    if(resultData.state==='ready'){
     const target=new URL(resultData.payment_url);
     if(target.protocol!=='https:'||!['clientes.eupago.pt','sandbox.eupago.pt'].includes(target.hostname))throw new Error('Destino inválido');
     result.textContent='A abrir o pagamento seguro…';window.location.assign(target.href);
    }else if(resultData.state==='paid'){result.textContent='Pagamento confirmado. A sua inscrição está registada.';}
    else if(resultData.state==='price_changed'){await getQuote();result.textContent='O preço foi atualizado. Reveja o total acima antes de continuar.';}
    else if(resultData.state==='full'){result.textContent='Esta edição já não tem lugares disponíveis. Contacte o suporte para alternativas.';}
    else{result.textContent='Os seus dados ficaram registados, mas o pagamento precisa de verificação. Contacte o suporte antes de voltar a tentar pagar.';}
   }
   catch{result.textContent='Não foi possível confirmar a receção. Tente novamente ou contacte o suporte pelo link abaixo.';}
   finally{busy=false;button.disabled=!quote;button.textContent='Continuar para pagamento';}
  });
 }
 function checkoutLink(){
  const target=new URL(config.checkoutUrl);if(target.origin!=='https://imagenscomia.com'||target.pathname!=='/curso-ia/checkout')throw new Error('Invalid checkout destination');
  target.searchParams.set('edition',edition);
  if(consent&&session){const data=new URLSearchParams({metrics:'allow',sid:session,...campaign});target.hash=data.toString();}
  return target.href;
 }
 if(config.enabled&&holder&&config.checkoutUrl){
  const intro=holder.querySelector('p');if(intro)intro.textContent='Continue para a inscrição segura, com a edição e o valor que escolheu.';
  const link=document.createElement('a');link.className='button button-primary';link.textContent='Continuar a inscrição';link.href=checkoutLink();link.id='fcia-checkout-link';
  link.addEventListener('click',()=>{event('registration_started');link.href=checkoutLink();});holder.insertBefore(link,$('#registration-whatsapp'));
 }
 document.addEventListener('fc:checkout',e=>{
  const label=String(e.detail?.label||'').toLowerCase();edition=label.includes('porto')?'porto-2026':label.includes('online')?'online-2026':'lisboa-2026';
  if(form)form.selectEdition(edition);
  event('edition_selected',false);event('registration_started');
  if(config.enabled&&config.checkoutUrl)window.location.assign(checkoutLink());
 });
 if(config.enabled&&new URLSearchParams(location.search).get('fcia_payment')==='return'){
  let order;try{order=JSON.parse(storage.get('fcia-checkout',true)||'null');}catch{order=null;}
  const notice=document.createElement('aside');notice.className='fcia-payment-status';notice.setAttribute('role','status');document.body.prepend(notice);
  if(!order){notice.textContent='Obrigado. O estado da inscrição será confirmado após a validação do pagamento. Contacte o suporte se precisar de ajuda.';return;}
  let attempts=0;
  async function check(){
   attempts++;notice.textContent='A verificar o pagamento…';
   try{const result=await post(config.statusUrl,{request_id:order.request_id});
    if(result.state==='paid'){notice.textContent='Pagamento confirmado. A sua inscrição está registada. Complete os dados de faturação abaixo. O acompanhamento segue por email.';billingPanel(order.request_id);return;}
    if(result.state==='refunded'){notice.textContent='O reembolso foi registado. Contacte o suporte se precisar de ajuda.';return;}
    notice.textContent='O pagamento ainda não foi confirmado. Se escolheu Multibanco, a inscrição será confirmada depois de pagar a referência.';
   }catch{notice.textContent='Não foi possível consultar o estado. Contacte o suporte antes de repetir o pagamento.';}
   if(attempts<6)setTimeout(check,5000);
  }
  void check();
 }
})();

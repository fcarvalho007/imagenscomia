<?php
/**
 * Plugin Name: Frederico Carvalho — Curso IA e CRM
 * Description: Landing page nativa, pedidos de inscrição e acesso ao CRM existente. Integração desativada por defeito.
 * Version: 0.6.2
 * Requires at least: 6.2
 * Requires PHP: 7.4
 * Author: Frederico Carvalho
 * Update URI: false
 */
if (!defined('ABSPATH')) { exit; }
final class FCIA_Course {
 const OPTION = 'fcia_course_settings';
 static function settings() { return wp_parse_args(get_option(self::OPTION, array()), array('page_id'=>0,'crm_url'=>'https://imagenscomia.com/crm','endpoint'=>'https://gwphpsehcnhwjiypyolg.supabase.co/functions/v1/course-wordpress-ingest','privacy_url'=>get_privacy_policy_url(),'terms_url'=>'','registration'=>0,'tracking'=>0,'indexable'=>0,'embed'=>0)); }
 static function ready() { $s=self::settings();return $s['registration'] && $s['privacy_url'] && $s['terms_url'] && self::bridge_ready(); }
 static function bridge_ready() { $s=self::settings();return strlen(self::bridge_secret())>=32 && preg_match('~^https://[a-z0-9]+\.supabase\.co/functions/v1/course-wordpress-ingest$~',$s['endpoint']); }
 static function bridge_secret() {
  if(defined('FCIA_BRIDGE_SECRET'))return is_string(FCIA_BRIDGE_SECRET)?FCIA_BRIDGE_SECRET:'';
  if(!function_exists('openssl_decrypt'))return '';
  $stored=get_option('fcia_bridge_encrypted','');if(!is_string($stored))return '';
  $raw=base64_decode($stored,true);if($raw===false||strlen($raw)<29)return '';
  $value=openssl_decrypt(substr($raw,28),'aes-256-gcm',hash('sha256',wp_salt('auth'),true),OPENSSL_RAW_DATA,substr($raw,0,12),substr($raw,12,16));
  return is_string($value)&&strlen($value)>=32?$value:'';
 }
 static function setup_bridge() {
  if(!current_user_can('manage_options')||!isset($_POST['fcia_create_bridge']))return;
  check_admin_referer('fcia_create_bridge');
  if(self::bridge_secret()!==''||defined('FCIA_BRIDGE_SECRET')){echo '<div class="notice notice-error"><p>A chave já existe. A configuração atual não foi alterada.</p></div>';return;}
  if(!function_exists('openssl_encrypt')){echo '<div class="notice notice-error"><p>O alojamento não disponibiliza encriptação. Configure a chave no wp-config.php com o apoio do alojamento.</p></div>';return;}
  try {
   $secret=bin2hex(random_bytes(32));$iv=random_bytes(12);$tag='';
   $cipher=openssl_encrypt($secret,'aes-256-gcm',hash('sha256',wp_salt('auth'),true),OPENSSL_RAW_DATA,$iv,$tag);
   if($cipher===false||!update_option('fcia_bridge_encrypted',base64_encode($iv.$tag.$cipher),false))throw new Exception('Unable to store');
   echo '<div class="card" style="max-width:960px"><h2>Chave criada — copie antes de sair</h2><p>Esta chave só é apresentada agora. No Lovable, guarde-a no campo de segredo <strong>COURSE_WP_BRIDGE_SECRET</strong>. Não a coloque no chat nem no GitHub.</p><input type="password" id="fcia-created-secret" class="large-text" readonly autocomplete="off" value="'.esc_attr($secret).'" aria-label="Chave de ligação criada"><p><button type="button" class="button" onclick="navigator.clipboard.writeText(document.getElementById(&quot;fcia-created-secret&quot;).value).then(()=>this.textContent=&quot;Copiada&quot;).catch(()=>this.textContent=&quot;Selecione e copie a chave&quot;)">Copiar chave</button></p><p>Depois de guardar no Lovable, use “Verificar ligação e totais”. As vendas continuam desligadas.</p></div>';
  } catch(Throwable $e){echo '<div class="notice notice-error"><p>Não foi possível guardar a chave. Não foi ativada nenhuma integração.</p></div>';}
 }
 static function sanitize($v) {
  $out=array('page_id'=>absint($v['page_id']??0));
  foreach(array('crm_url','privacy_url','terms_url') as $k){$url=esc_url_raw($v[$k]??'',array('https'));$out[$k]=$url;}
  $endpoint=trim($v['endpoint']??'');$out['endpoint']=preg_match('~^https://[a-z0-9]+\.supabase\.co/functions/v1/course-wordpress-ingest$~',$endpoint)?$endpoint:'';
  foreach(array('registration','tracking','indexable','embed') as $k)$out[$k]=empty($v[$k])?0:1;
  return $out;
 }
 static function admin() {
  if(!current_user_can('manage_options'))return;
  $s=self::settings();$public=$s['page_id']?get_permalink($s['page_id']):'';
  $preview=add_query_arg(array('fc_ia_preview'=>'1','preview'=>'primeira-visita'),home_url('/'));
  echo '<div class="wrap"><h1>Curso IA — landing page e inscrições</h1><p>A LP1 apresenta o curso. Após as três perguntas, a LP2 mostra a edição escolhida e o programa completo.</p>';
  settings_errors();self::setup_bridge();
  if(self::bridge_secret()===''&&!defined('FCIA_BRIDGE_SECRET')){echo '<div class="card" style="max-width:960px"><h2>Ligação segura — configurar uma vez</h2><p>Crie a chave aqui e copie-a para o segredo COURSE_WP_BRIDGE_SECRET do Lovable. Este passo não ativa pagamentos nem mensagens.</p><form method="post">';wp_nonce_field('fcia_create_bridge');echo '<button class="button" name="fcia_create_bridge" value="1">Criar chave de ligação</button></form></div>';}
  if(isset($_POST['fcia_diagnostics'])){
   check_admin_referer('fcia_diagnostics');
   $diagnostic=self::bridge_ready()?self::relay('diagnostics',array()):new WP_Error('missing_key','Falta a chave de ligação segura entre WordPress e backend.');
   if(is_wp_error($diagnostic))echo '<div class="notice notice-error"><p>'.esc_html($diagnostic->get_error_message()).'</p></div>';
   else {
    $d=$diagnostic->get_data();echo '<div class="notice notice-success"><p><strong>Ligação autenticada e base de dados verificadas.</strong> Teste de leitura: não criou inscrições, pagamentos, emails ou faturas.</p></div><div class="card" style="max-width:960px"><h2>Estado real do backend</h2><ul>';
    foreach(array('payment_configured'=>'Pagamento configurado','payment_enabled'=>'Cobranças ativas','email_configured'=>'Email configurado','email_enabled'=>'Emails ativos','invoice_configured'=>'Faturação configurada','invoice_enabled'=>'Emissão de faturas ativa','sms_configured'=>'SMS configurado','sms_enabled'=>'SMS ativos','worker_configured'=>'Chave do serviço de automações configurada') as $key=>$label)echo '<li>'.esc_html($label).': <strong>'.(!empty($d['checks'][$key])?'sim':'não').'</strong></li>';
    echo '</ul><h3>Totais consultados, sem cobrança</h3><ul>';
    foreach(($d['editions']??array()) as $edition)echo '<li>'.esc_html($edition['label']).': '.esc_html(number_format_i18n($edition['net_cents']/100,2)).' € + IVA · Total '.esc_html(number_format_i18n($edition['amount_cents']/100,2)).' €</li>';
    echo '</ul><p>Este teste não confirma entrega de emails, receção de webhooks ou emissão fiscal.</p></div>';
   }
  }
  echo '<form method="post" style="margin:20px 0">';wp_nonce_field('fcia_diagnostics');echo '<button class="button" name="fcia_diagnostics" value="1">Verificar ligação e totais — sem custos</button></form>';
  echo '<div class="card" style="max-width:960px"><h2>Landing page</h2><p>A pré-visualização começa sempre na LP1, mesmo que já tenha respondido ao formulário. Pode percorrer as duas etapas sem criar inscrições.</p><p><a class="button button-primary" target="_blank" rel="noopener" href="'.esc_url($preview).'">Ver LP1 e testar o percurso</a>';
  if($public)echo ' <a class="button" target="_blank" rel="noopener" href="'.esc_url($public).'">Abrir página do curso</a>';
  echo '</p><p><strong>Endereço:</strong> '.($public?'<a href="'.esc_url($public).'">'.esc_html($public).'</a>':'Página por selecionar.').'</p></div>';
  echo '<div class="card" style="max-width:960px"><h2>CRM e pagamentos</h2><p><a class="button" target="_blank" rel="noopener noreferrer" href="'.esc_url($s['crm_url']).'">Abrir CRM</a></p><p>O curso tem três edições independentes: Lisboa, Porto e online. Use a verificação abaixo para consultar a ligação e a configuração real do backend. A publicação do CRM é verificada no respetivo endereço.</p><p><strong>Pagamentos:</strong> '.(self::ready()?'ativados nas definições.':'desativados. A publicação do backend, a ligação segura e a validação do checkout ainda têm de estar concluídas.').'</p><p><strong>Privacidade:</strong> '.($s['privacy_url']?'página configurada.':'por configurar.').' <strong>Condições de inscrição:</strong> '.($s['terms_url']?'página configurada.':'por finalizar antes de abrir as vendas.').'</p></div>';
  echo '<form action="options.php" method="post"><details style="margin-top:24px"><summary style="cursor:pointer;font-size:16px;font-weight:600">Definições da página e da integração</summary>';settings_fields('fcia_course');
  echo '<table class="form-table"><tr><th><label for="fcia-page">Página do curso</label></th><td>';wp_dropdown_pages(array('name'=>self::OPTION.'[page_id]','id'=>'fcia-page','selected'=>$s['page_id'],'show_option_none'=>'Selecionar uma página WordPress'));echo '<p class="description">Endereço previsto: /curso-de-inteligencia-artificial/. O tema das restantes páginas mantém-se.</p></td></tr>';
  foreach(array('crm_url'=>'URL do CRM publicado','endpoint'=>'Endpoint da integração Supabase','privacy_url'=>'Política de privacidade','terms_url'=>'Condições de inscrição, alteração e cancelamento') as $k=>$label){echo '<tr><th><label for="fcia-'.$k.'">'.esc_html($label).'</label></th><td><input type="url" class="large-text" id="fcia-'.$k.'" name="'.self::OPTION.'['.$k.']" value="'.esc_attr($s[$k]).'" /></td></tr>';}
  foreach(array('registration'=>'Ativar inscrições e pagamento online (após homologação)','tracking'=>'Ativar métricas opcionais, mediante consentimento','indexable'=>'Permitir indexação apenas no endereço da página pública','embed'=>'Mostrar o CRM dentro do painel, por iframe') as $k=>$label){echo '<tr><th><label for="fcia-'.$k.'">'.esc_html($label).'</label></th><td><input id="fcia-'.$k.'" type="checkbox" name="'.self::OPTION.'['.$k.']" value="1" '.checked($s[$k],1,false).' /></td></tr>';}
  echo '</table><p class="description">Configuração técnica: use a chave criada neste painel, ou a constante FCIA_BRIDGE_SECRET do alojamento. A mesma chave deve existir em COURSE_WP_BRIDGE_SECRET no backend. Não introduza chaves de pagamentos nem a service_role do Supabase nestes campos.</p><p>Chave e endereço configurados: <strong>'.(self::bridge_ready()?'sim':'não').'</strong>. Esta indicação não confirma que o backend está publicado ou operacional.</p>';submit_button('Guardar definições');echo '</details></form>';
  if($s['embed']&&$s['crm_url'])echo '<h2>CRM</h2><p>Se o alojamento impedir a incorporação, use “Abrir CRM”.</p><iframe src="'.esc_url($s['crm_url']).'" title="CRM do curso de inteligência artificial" referrerpolicy="strict-origin-when-cross-origin" style="width:100%;height:80vh;border:1px solid #ccd0d4;background:white"></iframe>';
  echo '</div>';
 }
 static function allowed_request($req) {
  if(!wp_verify_nonce($req->get_header('X-WP-Nonce'),'wp_rest'))return new WP_Error('invalid_nonce','Atualize a página e volte a tentar.',array('status'=>403));
  $origin=$req->get_header('origin');if($origin){$home=wp_parse_url(home_url());$incoming=wp_parse_url($origin);if(($home['host']??'')!==($incoming['host']??'')||($home['scheme']??'')!==($incoming['scheme']??'')||($home['port']??null)!==($incoming['port']??null))return new WP_Error('invalid_origin','Origem inválida.',array('status'=>403));}
  return true;
 }
 static function relay($kind,$data) {
  $s=self::settings();$stamp=(string)time();$body=wp_json_encode(array('kind'=>$kind,'data'=>$data));
  $response=wp_safe_remote_post($s['endpoint'],array('timeout'=>15,'redirection'=>0,'headers'=>array('Content-Type'=>'application/json','X-Course-Timestamp'=>$stamp,'X-Course-Signature'=>hash_hmac('sha256',$stamp.'.'.$body,self::bridge_secret())),'body'=>$body));
  if(is_wp_error($response)||wp_remote_retrieve_response_code($response)!==200)return new WP_Error('integration_unavailable','Não foi possível guardar. Tente novamente ou contacte o suporte.',array('status'=>503));
  $result=json_decode(wp_remote_retrieve_body($response),true);if(empty($result['accepted']))return new WP_Error('integration_unavailable','Não foi possível confirmar a receção.',array('status'=>503));
  return rest_ensure_response($result);
 }
 static function receive($req,$kind) {
  $s=self::settings();if(!self::bridge_ready()||($kind==='event'?!$s['tracking']:!self::ready()))return new WP_Error('disabled','Integração indisponível.',array('status'=>503));
  if(strlen($req->get_body())>10000)return new WP_Error('size','Pedido demasiado grande.',array('status'=>413));
  $data=$req->get_json_params();if(!is_array($data))return new WP_Error('fields','Dados inválidos.',array('status'=>400));
  $ip=$_SERVER['REMOTE_ADDR']??'unknown';$bucket='fcia_'.hash_hmac('sha256',$kind.$ip,wp_salt());$n=(int)get_transient($bucket);
  if($n>=($kind==='checkout'?10:120))return new WP_Error('rate_limit','Aguarde antes de voltar a tentar.',array('status'=>429));set_transient($bucket,$n+1,5*MINUTE_IN_SECONDS);
  if($kind==='checkout'){
   foreach(array('name','email','phone') as $field)if(isset($data[$field])&&!is_string($data[$field]))return new WP_Error('fields','Dados inválidos.',array('status'=>400));
   if(!empty($data['website']))return new WP_Error('invalid','Dados inválidos.',array('status'=>400));
   $data=array_intersect_key($data,array_flip(array('request_id','edition','name','email','phone','sms_consent','marketing_consent','privacy_acknowledged','terms_acknowledged','session_id','attribution','expected_amount')));
   $data['name']=sanitize_text_field($data['name']??'');$data['email']=sanitize_email($data['email']??'');$data['phone']=sanitize_text_field($data['phone']??'');
   if(!$data['email']||strlen($data['name'])<2||empty($data['privacy_acknowledged']))return new WP_Error('fields','Verifique o nome, o email e a política de privacidade.',array('status'=>400));
  }elseif($kind==='event') $data=array_intersect_key($data,array_flip(array('id','session_id','name','edition')));
  elseif($kind==='billing'){$data=array('request_id'=>sanitize_text_field($data['request_id']??''),'billing'=>array_intersect_key(is_array($data['billing']??null)?$data['billing']:array(),array_flip(array('name','tax_id','address','postal_code','city','country'))));}
  elseif($kind==='quote')$data=array('edition'=>sanitize_text_field($data['edition']??''));
  else $data=array('request_id'=>sanitize_text_field($data['request_id']??''));
  return self::relay($kind,$data);
 }
 static function render() {
  $s=self::settings();$preview=isset($_GET['fc_ia_preview'])&&is_string($_GET['fc_ia_preview'])&&$_GET['fc_ia_preview']==='1';
  if(!$preview && (!$s['page_id']||!is_page($s['page_id'])))return;
  // Admin previews must not silently resume a visitor's saved LP2 preferences.
  if($preview&&!isset($_GET['preview'])){nocache_headers();wp_safe_redirect(add_query_arg(array('fc_ia_preview'=>'1','preview'=>'primeira-visita'),home_url('/')),302);exit;}
  $file=__DIR__.'/page/index.html';if(!is_readable($file))return;
  status_header(200);nocache_headers();header('Content-Type: text/html; charset=UTF-8');
  $indexable=!$preview&&$s['indexable']&&get_option('blog_public');header('X-Robots-Tag: '.($indexable?'index, follow':'noindex, nofollow'),true);
  $html=file_get_contents($file);$base=plugins_url('page/',__FILE__);
  // LP1 uses the brand headline; LP2 retains the course headline. Also supports
  // installations carrying the previous bundled HTML, without replacing assets.
  $html=str_replace('<h1 id="hero-title">Curso de inteligência artificial. ', '<h1 id="hero-title">Inteligência artificial. ', $html);
  $html=str_replace('<h2 id="public-summary-title">Formação prática em IA para o seu negócio</h2>', '<h2 id="public-summary-title">Curso de inteligência artificial aplicada ao negócio</h2>', $html);
  $headline_script = <<<'JS'
<script>(()=>{const title=document.getElementById('hero-title');if(!title)return;const sync=()=>{const text=document.body.classList.contains('is-intro')?'Inteligência artificial. ':'Curso de inteligência artificial. ';if(title.firstChild.nodeValue!==text)title.firstChild.nodeValue=text;};new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});})();</script>
JS;
  $html=str_replace('</body>',$headline_script.'</body>',$html);

  $html=preg_replace_callback('/\b(src|href)="([^"#][^"]*)"/i',function($m)use($base){if(preg_match('~^(?:[a-z][a-z0-9+.-]*:|//|/)~i',$m[2]))return $m[0];return $m[1].'="'.esc_url($base.$m[2]).'"';},$html);
  if(!$preview&&self::ready()){
   $html=str_replace('Ao escolher a edição, fale com o suporte para confirmar a disponibilidade e receber os passos para se inscrever.','Escolha a edição, preencha os seus dados e continue para o pagamento seguro. A inscrição é confirmada após validação do pagamento.',$html);
   $html=str_replace('A página indica como contactar o suporte pelo WhatsApp para confirmar a disponibilidade e receber os passos seguintes. <strong>A inscrição só fica concluída após confirmação pelo suporte.</strong>','Preencha os seus dados e continue para o pagamento pela Eupago. <strong>A inscrição fica confirmada após validação do pagamento.</strong> Para uma inscrição conjunta com desconto, contacte o suporte antes de pagar.',$html);
  }
  $canonical=$s['page_id']?get_permalink($s['page_id']):'';
  if($indexable)$html=str_replace('content="noindex, nofollow"','content="index, follow, max-image-preview:large"',$html);
  if($canonical)$html=str_replace('</head>','<link rel="canonical" href="'.esc_url($canonical).'"><meta property="og:url" content="'.esc_url($canonical).'">'.'</head>',$html);
  $html=str_replace('</head>','<meta property="og:image" content="'.esc_url($base.'assets/frederico-carvalho-v20.webp').'"><link rel="stylesheet" href="'.esc_url(add_query_arg('ver','0.6.2',plugins_url('assets/integration.css',__FILE__))).'">'.'</head>',$html);
  $config=array('enabled'=>!$preview&&self::ready(),'tracking'=>!$preview&&$s['tracking']&&$s['privacy_url']&&self::bridge_ready(),'registrationUrl'=>rest_url('fcia/v1/checkout'),'quoteUrl'=>rest_url('fcia/v1/quote'),'statusUrl'=>rest_url('fcia/v1/status'),'billingUrl'=>rest_url('fcia/v1/billing'),'eventUrl'=>rest_url('fcia/v1/event'),'nonce'=>wp_create_nonce('wp_rest'),'privacyUrl'=>$s['privacy_url'],'termsUrl'=>$s['terms_url']);
  $html=str_replace('</body>','<script>window.FCIA_INTEGRATION='.wp_json_encode($config,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT).';</script><script defer src="'.esc_url(add_query_arg('ver','0.6.2',plugins_url('assets/integration.js',__FILE__))).'"></script></body>',$html);
  echo $html;exit;
 }
}
add_action('admin_menu',function(){add_menu_page('Curso IA','Curso IA','manage_options','fcia-course',array('FCIA_Course','admin'),'dashicons-welcome-learn-more',26);});
add_action('admin_init',function(){register_setting('fcia_course',FCIA_Course::OPTION,array('sanitize_callback'=>array('FCIA_Course','sanitize')));});
add_action('rest_api_init',function(){foreach(array('checkout','event','quote','status','billing') as $kind)register_rest_route('fcia/v1','/'.$kind,array('methods'=>'POST','permission_callback'=>array('FCIA_Course','allowed_request'),'callback'=>function($req)use($kind){return FCIA_Course::receive($req,$kind);}));});
add_action('template_redirect',array('FCIA_Course','render'),0);

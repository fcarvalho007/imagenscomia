<?php
if (!defined('ABSPATH')) exit;
/** WordPress is the catalogue owner. Only successfully synchronised editions reach visitors. */
final class FCIA_Editions {
 const OPTION='fcia_editions_v1';
 const CHECKOUT='/checkout/curso-inteligencia-artificial-marketing/';
 const CHECKOUT_ID=98086;
 static function defaults(){
  $base=array('revision'=>0,'synced'=>false,'availability'=>'open','capacity'=>16,'product_id'=>0,'early_net_cents'=>49700,'net_cents'=>59700,'venue'=>'','schedule'=>'Quinta e sexta-feira · 09h00–17h30','duration'=>'2 dias de formação · 14 horas em direto','hours'=>14);
  return array(
   'lisboa-2026'=>array_merge($base,array('id'=>'lisboa-2026','modality'=>'lisboa','label'=>'Lisboa · Presencial','starts_at'=>'2026-10-29T09:00','ends_at'=>'2026-10-30T17:30','early_until'=>'2026-10-19T23:59','date_label'=>'29 e 30 de outubro de 2026','venue'=>'Hotel Gat Rossio')),
   'porto-2026'=>array_merge($base,array('id'=>'porto-2026','modality'=>'porto','label'=>'Porto · Presencial','starts_at'=>'2026-11-19T09:00','ends_at'=>'2026-11-20T17:30','early_until'=>'2026-11-09T23:59','date_label'=>'19 e 20 de novembro de 2026','venue'=>'Porto · local a confirmar')),
   'online-2026'=>array_merge($base,array('id'=>'online-2026','modality'=>'online','label'=>'Online · em direto','starts_at'=>'2026-12-02T09:30','ends_at'=>'2026-12-11T13:00','early_until'=>'','early_net_cents'=>39700,'net_cents'=>39700,'date_label'=>'2, 4, 9 e 11 de dezembro de 2026','venue'=>'Online · ligação enviada aos participantes','schedule'=>'Quartas e sextas-feiras · 09h30–13h00 · hora de Lisboa','duration'=>'4 sessões de 3h30 · 14 horas em direto'))
  );
 }
 static function all(){return get_option(self::OPTION,self::defaults());}
 static function utc($v){if(!$v)return null;$d=DateTimeImmutable::createFromFormat('!Y-m-d\TH:i',$v,new DateTimeZone('Europe/Lisbon'));if(!$d||$d->format('Y-m-d\TH:i')!==$v)throw new Exception('Verifique a data e a hora.');return $d->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z');}
 static function price($e){return $e['early_until']&&time()<strtotime(self::utc($e['early_until']))?(int)$e['early_net_cents']:(int)$e['net_cents'];}
 static function public_data(){
  $out=array();foreach(self::all() as $e){if(empty($e['synced'])||$e['availability']==='draft')continue;$e['price_cents']=self::price($e);$e['starts_utc']=self::utc($e['starts_at']);$e['early_utc']=self::utc($e['early_until']);$e['remaining']=self::remaining($e);$e['can_buy']=$e['availability']==='open'&&strtotime($e['starts_utc'])>time()&&$e['remaining']>0;$out[]=$e;}return $out;
 }
 static function remaining($e){$p=!empty($e['product_id'])&&function_exists('wc_get_product')?wc_get_product($e['product_id']):false;return $p&&$p->managing_stock()?max(0,(int)$p->get_stock_quantity()):(int)$e['capacity'];}
 static function payload($e){return array('id'=>$e['id'],'revision'=>$e['revision'],'modality'=>$e['modality'],'label'=>$e['label'],'starts_at'=>self::utc($e['starts_at']),'ends_at'=>self::utc($e['ends_at']),'early_until'=>self::utc($e['early_until']),'early_net_cents'=>$e['early_net_cents'],'net_cents'=>$e['net_cents'],'capacity'=>$e['capacity'],'product_id'=>$e['product_id'],'availability'=>$e['availability'],'operations'=>array('schedule'=>$e['date_label'].' · '.$e['schedule'],'venue'=>$e['venue'],'location'=>$e['venue'],'date_label'=>$e['date_label'],'modality'=>$e['modality']));}
 static function sync_product(&$e,$old=null){
  if(!class_exists('WC_Product_Simple'))throw new Exception('WooCommerce não está disponível.');
  $p=!empty($e['product_id'])?wc_get_product($e['product_id']):new WC_Product_Simple();
  if(!$p)throw new Exception('O produto associado não existe.');
  if($p->get_id()&&$p->get_meta('_fcia_edition')!==$e['id'])throw new Exception('Produto não pertence a esta edição.');
  $p->set_name('Curso de inteligência artificial · '.$e['label'].' · '.$e['date_label']);$p->set_status($e['availability']==='draft'?'draft':'publish');$p->set_catalog_visibility('hidden');$p->set_virtual(true);$p->set_sold_individually(true);$p->set_tax_status('taxable');$p->set_tax_class('');
  $factor=get_option('woocommerce_prices_include_tax')==='yes'?1.23:1;
  $p->set_regular_price(wc_format_decimal($e['net_cents']/100*$factor));$p->set_sale_price($e['early_until']?wc_format_decimal($e['early_net_cents']/100*$factor):'');$p->set_date_on_sale_to($e['early_until']?strtotime(self::utc($e['early_until'])):null);$p->set_price(wc_format_decimal(self::price($e)/100*$factor));
  $p->set_manage_stock(true);$p->set_backorders('no');
  $stock=$p->get_id()?max(0,(int)$p->get_stock_quantity()+(int)$e['capacity']-(int)($old['capacity']??$e['capacity'])):$e['capacity'];
  $p->set_stock_quantity($stock);$p->set_stock_status($e['availability']==='open'&&$stock>0?'instock':'outofstock');$p->update_meta_data('_fcia_edition',$e['id']);$e['product_id']=$p->save();
 }
 static function save($e,$old=null){
  self::sync_product($e,$old);$e['revision']=max(time(),(int)($old['revision']??0)+1);$e['synced']=false;
  $all=self::all();$all[$e['id']]=$e;update_option(self::OPTION,$all,false);
  $res=FCIA_Course::relay('wordpress_edition',self::payload($e));
  if(is_wp_error($res))throw new Exception('Guardado no WordPress, mas falta sincronizar com o CRM. Use «Sincronizar». A edição fica indisponível para novas inscrições até confirmar a ligação.');
  $e['synced']=true;$all[$e['id']]=$e;update_option(self::OPTION,$all,false);
  if(function_exists('rocket_clean_post')){rocket_clean_post(FCIA_Course::settings()['page_id']);rocket_clean_post(self::CHECKOUT_ID);}
  return $e;
 }
 static function validate($v,$old=null){
  $e=$old?:array_merge(array_values(self::defaults())[0],array('id'=>'','product_id'=>0,'synced'=>false,'revision'=>0));
  foreach(array('label','venue','date_label','schedule','duration') as $k){$e[$k]=sanitize_text_field($v[$k]??'');if(strlen($e[$k])>240)throw new Exception('Um dos textos é demasiado longo.');}
  $e['modality']=sanitize_key($v['modality']??'');$e['availability']=sanitize_key($v['availability']??'draft');
  if(!in_array($e['modality'],array('lisboa','porto','online'),true)||!in_array($e['availability'],array('draft','open','sold_out','closed'),true)||strlen($e['label'])<2)throw new Exception('Preencha o nome, modalidade e disponibilidade.');
  foreach(array('starts_at','ends_at','early_until') as $k){$e[$k]=sanitize_text_field($v[$k]??'');self::utc($e[$k]);}
  if(!$e['starts_at']||!$e['ends_at']||self::utc($e['ends_at'])<=self::utc($e['starts_at']))throw new Exception('O fim deve ser posterior ao início.');
  if($e['early_until']&&self::utc($e['early_until'])>=self::utc($e['starts_at']))throw new Exception('O early-bird deve terminar antes do início.');
  foreach(array('early_net_cents','net_cents') as $k){$value=str_replace(',','.',trim($v[$k]??''));if(!preg_match('/^\d{1,5}(\.\d{1,2})?$/',$value)||(float)$value<=0)throw new Exception('Indique preços válidos, sem IVA.');$e[$k]=(int)round((float)$value*100);}
  if($e['early_net_cents']>$e['net_cents'])throw new Exception('O early-bird não pode exceder o preço regular.');
  $e['capacity']=absint($v['capacity']??0);if($e['capacity']<1||$e['capacity']>10000)throw new Exception('Indique uma lotação entre 1 e 10000.');
  if($old&&$e['modality']!==$old['modality'])throw new Exception('Para outra modalidade, crie uma edição.');
  foreach(array('venue','date_label','schedule','duration') as $key)if(!$e[$key])throw new Exception('Preencha o local, datas, horário e duração.');
  if(!$old)$e['id']=$e['modality'].'-'.substr($e['starts_at'],0,10).'-'.strtolower(wp_generate_password(5,false,false));
  return $e;
 }
 static function admin(){
  if(!current_user_can('manage_options'))return;
  $all=self::all();$message='';$error='';$selected=sanitize_key($_GET['edition']??'');
  if($_SERVER['REQUEST_METHOD']==='POST'&&isset($_POST['fcia_edition_action'])){
   check_admin_referer('fcia_editions');
   try{$action=sanitize_key($_POST['fcia_edition_action']);$id=sanitize_key($_POST['id']??'');$old=$all[$id]??null;
    if($action==='activate'){foreach($all as $item)if(empty($item['synced']))throw new Exception('Sincronize todas as edições antes de ativar.');if(!class_exists('WFACP_Common'))throw new Exception('FunnelKit indisponível.');update_option('fcia_woo_enabled',true,false);$message='Checkout WordPress ativado para o curso.';}
    elseif($action==='prepare'){foreach($all as $item)self::save($item,$item);$message='Edições preparadas e sincronizadas com o CRM.';}
    elseif($action==='save'){$saved=self::save(self::validate(wp_unslash($_POST['edition']??array()),$old),$old);$selected=$saved['id'];$message='Edição guardada. Landing page, produto e CRM atualizados.';}
    elseif($action==='sync'&&$old){self::save($old,$old);$message='Edição sincronizada.';}
    elseif($action==='duplicate'&&$old){$copy=$old;$copy['id']=$old['modality'].'-'.substr($old['starts_at'],0,10).'-'.strtolower(wp_generate_password(5,false,false));$copy['label'].=' — nova edição';$copy['availability']='draft';$copy['product_id']=0;$copy['revision']=0;$copy['synced']=false;$saved=self::save($copy);$selected=$saved['id'];$message='Cópia criada como rascunho. Reveja as datas antes de abrir inscrições; não foram copiados participantes nem ativadas automações.';}
   }catch(Throwable $ex){$error=$ex->getMessage();}$all=self::all();
  }
  echo '<div class="wrap fcia-editions"><h1>Edições do Curso IA</h1><p>Datas, local, preços e disponibilidade num só lugar. O checkout mantém o layout do FunnelKit.</p>';
  if($message)echo '<div class="notice notice-success"><p>'.esc_html($message).'</p></div>';if($error)echo '<div class="notice notice-error"><p>'.esc_html($error).'</p></div>';
  echo '<p><a class="button" href="'.esc_url(admin_url('admin.php?page=fcia-course')).'">Ligação e diagnóstico</a> <a class="button" href="'.esc_url(home_url(self::CHECKOUT)).'" target="_blank" rel="noopener">Ver checkout</a> <a class="button button-primary" href="'.esc_url(admin_url('admin.php?page=fcia-editions&edition=new')).'">Criar edição</a></p>';
  if(!get_option(self::OPTION)){echo '<form method="post">';wp_nonce_field('fcia_editions');echo '<p><button name="fcia_edition_action" value="prepare" class="button button-primary">Preparar as três edições e sincronizar</button></p></form>';}
  if(!FCIA_Woo::active()&&get_option(self::OPTION)){echo '<form method="post">';wp_nonce_field('fcia_editions');echo '<p><button name="fcia_edition_action" value="activate" class="button button-primary">Ativar checkout WordPress</button></p></form>';}
  echo '<table class="widefat striped"><thead><tr><th>Edição</th><th>Início · hora de Lisboa</th><th>Preço atual sem IVA</th><th>Disponibilidade</th><th>CRM</th><th>Ações</th></tr></thead><tbody>';
  $labels=array('draft'=>'Rascunho','open'=>'Inscrições abertas','sold_out'=>'Esgotado','closed'=>'Encerrado');
  foreach($all as $e){echo '<tr><td><strong>'.esc_html($e['label']).'</strong></td><td>'.esc_html(str_replace('T',' · ',$e['starts_at'])).'</td><td>'.esc_html(number_format_i18n(self::price($e)/100,2)).' €</td><td>'.esc_html($labels[$e['availability']]).'<br>'.self::remaining($e).' lugares</td><td>'.(!empty($e['synced'])?'Sincronizado':'Por sincronizar').'</td><td><a class="button" href="'.esc_url(add_query_arg(array('page'=>'fcia-editions','edition'=>$e['id']),admin_url('admin.php'))).'">Editar</a><form method="post" style="display:inline">';wp_nonce_field('fcia_editions');echo '<input type="hidden" name="id" value="'.esc_attr($e['id']).'"><button class="button" name="fcia_edition_action" value="duplicate">Duplicar</button> <button class="button" name="fcia_edition_action" value="sync">Sincronizar</button></form></td></tr>';}
  echo '</tbody></table>';
  if($selected){$e=$all[$selected]??array_merge(array_values(self::defaults())[0],array('id'=>'','label'=>'','availability'=>'draft','product_id'=>0));
   echo '<h2>'.($e['id']?'Editar edição':'Nova edição').'</h2><form method="post">';wp_nonce_field('fcia_editions');echo '<input type="hidden" name="id" value="'.esc_attr($e['id']).'"><table class="form-table">';
   foreach(array('label'=>'Nome da edição','date_label'=>'Datas a apresentar (inclua todos os dias)','venue'=>'Local / hotel','schedule'=>'Horário e dias da semana','duration'=>'Duração a apresentar','starts_at'=>'Início · hora de Lisboa','ends_at'=>'Fim · hora de Lisboa','early_until'=>'Fim do early-bird · opcional','early_net_cents'=>'Preço early-bird (€ sem IVA)','net_cents'=>'Preço regular (€ sem IVA)','capacity'=>'Lotação total') as $k=>$label){$type=in_array($k,array('starts_at','ends_at','early_until'))?'datetime-local':($k==='capacity'?'number':'text');$value=strpos($k,'cents')!==false?number_format($e[$k]/100,2,'.',''):$e[$k];echo '<tr><th><label for="edition-'.$k.'">'.esc_html($label).'</label></th><td><input id="edition-'.$k.'" type="'.$type.'" class="regular-text" name="edition['.$k.']" value="'.esc_attr($value).'" '.($k!=='early_until'?'required':'').'></td></tr>';}
   foreach(array('modality'=>array('lisboa'=>'Lisboa · presencial','porto'=>'Porto · presencial','online'=>'Online'),'availability'=>$labels) as $k=>$opts){echo '<tr><th><label for="edition-'.$k.'">'.($k==='modality'?'Modalidade':'Disponibilidade').'</label></th><td><select id="edition-'.$k.'" name="edition['.$k.']">';foreach($opts as $value=>$label)echo '<option value="'.$value.'" '.selected($e[$k],$value,false).'>'.esc_html($label).'</option>';echo '</select></td></tr>';}
   echo '</table><p>Alterar datas atualiza os lembretes automáticos ainda não enviados. Campanhas manuais e histórico não são alterados. Os montantes das encomendas já criadas mantêm-se.</p><button class="button button-primary" name="fcia_edition_action" value="save">Guardar e sincronizar</button></form>';
  }
  echo '<h2>Utilização e estado da integração</h2>';FCIA_Woo::summary();echo '</div><style>.fcia-editions{max-width:1150px}.fcia-editions h2{margin-top:32px}.fcia-editions td,.fcia-editions th{padding:12px}.fcia-editions input,.fcia-editions select{min-height:40px}.fcia-editions .widefat{display:block;overflow:auto}.fcia-editions .form-table input{max-width:100%}@media(max-width:782px){.fcia-editions .form-table td{padding-left:0}}</style>';
 }
}
add_action('admin_menu',function(){add_submenu_page('fcia-course','Edições','Edições','manage_options','fcia-editions',array('FCIA_Editions','admin'));});

<?php
if (!defined('ABSPATH')) exit;
/** Uses WooCommerce's checkout and payment state; never creates a charge or invoice. */
final class FCIA_Woo {
 const JOB='fcia_sync_woo_order';
 static function active(){return (bool)get_option('fcia_woo_enabled',false);}
 static function scope(){return self::active()&&class_exists('WFACP_Common')&&(int)WFACP_Common::get_id()===FCIA_Editions::CHECKOUT_ID;}
 static function edition($id){$all=FCIA_Editions::all();return isset($all[$id])&&!empty($all[$id]['synced'])?$all[$id]:null;}
 static function available($e){return $e&&$e['availability']==='open'&&strtotime(FCIA_Editions::utc($e['starts_at']))>time()&&FCIA_Editions::remaining($e)>0;}
 static function selected(){
  $id=isset($_GET['fcia_edition'])&&is_string($_GET['fcia_edition'])?sanitize_key($_GET['fcia_edition']):'';
  if(!$id&&function_exists('WC')&&WC()->session)$id=WC()->session->get('fcia_edition','');
  if($id)return self::edition($id);
  foreach(FCIA_Editions::public_data() as $e)if($e['can_buy'])return $e;
  return null;
 }
 static function start(){
  if(!self::active()||!is_page(FCIA_Editions::CHECKOUT_ID))return;
  if(!defined('DONOTCACHEPAGE'))define('DONOTCACHEPAGE',true);nocache_headers();
  $requested=isset($_GET['fcia_edition'])&&is_string($_GET['fcia_edition'])?sanitize_key($_GET['fcia_edition']):'';
  $e=$requested?self::edition($requested):self::selected();
  if(!$e){foreach(FCIA_Editions::public_data() as $candidate)if($candidate['can_buy']){$e=$candidate;break;}}
  if(!self::available($e)){wp_die('Esta edição não está disponível. <a href="'.esc_url(get_permalink(FCIA_Course::settings()['page_id'])).'">Ver as edições do curso</a>','Inscrições indisponíveis',array('response'=>409));}
  if(WC()->session)WC()->session->set('fcia_edition',$e['id']);
 }
 static function products($products){
  if(!self::scope())return $products;$e=self::selected();if(!self::available($e))return array();
  $p=wc_get_product($e['product_id']);if(!$p)return array();
  $row=array_merge(WFACP_Common::get_default_product_config(),array('id'=>$p->get_id(),'parent_product_id'=>0,'title'=>$p->get_name(),'type'=>'simple','variable'=>'no','quantity'=>1,'org_quantity'=>1,'is_default'=>true,'image'=>'','price'=>$p->get_price_html(),'regular_price'=>wc_price($p->get_regular_price()),'sale_price'=>$p->get_sale_price()?wc_price($p->get_sale_price()):''));
  return array('fcia_'.$p->get_id()=>$row);
 }
 static function field($field,$key){
  if(!self::scope()||$key!=='ondedesejarealizarcurso')return $field;
  $options=array();foreach(FCIA_Editions::public_data() as $e)if($e['can_buy'])$options[$e['id']]=$e['label'].' · '.$e['date_label'];
  $field['type']='select';$field['label']='Edição do curso';$field['options']=$options;$field['required']=true;$field['default']=self::selected()['id']??'';return $field;
 }
 static function course_cart(){if(!function_exists('WC')||!WC()->cart)return false;foreach(WC()->cart->get_cart() as $item)if(!empty($item['data'])&&$item['data']->get_meta('_fcia_edition'))return true;return false;}
 static function validate($data,$errors){
  if(!self::scope()&&!self::course_cart())return;$e=self::selected();$posted=sanitize_key($_POST['ondedesejarealizarcurso']??'');
  if(!self::available($e)||$posted!==$e['id']){$errors->add('fcia_edition','A edição mudou ou está indisponível. Atualize a página antes de continuar.');return;}
  $cart=WC()->cart->get_cart();
  if(count($cart)!==1){$errors->add('fcia_cart','A inscrição deve conter uma edição e um participante.');return;}
  $item=reset($cart);if((int)$item['product_id']!==(int)$e['product_id']||(int)$item['quantity']!==1)$errors->add('fcia_cart','O produto não corresponde à edição escolhida. Atualize a página.');
 }
 static function tag($order,$data){
  if(!self::scope()&&!self::course_cart())return;$e=self::selected();if(!self::available($e))throw new Exception('Edição indisponível.');
  $order->update_meta_data('_fcia_edition',$e['id']);$order->update_meta_data('_fcia_request',wp_generate_uuid4());
  $order->update_meta_data('_fcia_sms_consent',!empty($_POST['fcia_sms_consent']));
  $order->update_meta_data('_fcia_marketing_consent',!empty($_POST['fcia_marketing_consent']));
  $metrics=json_decode(wp_unslash($_POST['fcia_metrics']??''),true);$safe=array();
  if(is_array($metrics)&&($metrics['consent']??'')==='allow'&&preg_match('/^[a-f0-9-]{36}$/i',$metrics['session_id']??'')){
   $safe['session_id']=$metrics['session_id'];$safe['attribution']=array();foreach(array('utm_source','utm_medium','utm_campaign') as $k)if(preg_match('/^[a-zA-Z0-9_-]{1,100}$/',$metrics[$k]??''))$safe['attribution'][$k]=$metrics[$k];
  }
  $order->update_meta_data('_fcia_metrics',$safe);$order->update_meta_data('_fcia_sync_state','pending');
 }
 static function enqueue($id){
  $order=wc_get_order($id);if(!$order||!$order->get_meta('_fcia_edition'))return;
  if(function_exists('as_schedule_single_action')){if(!as_next_scheduled_action(self::JOB,array((int)$id),'fcia'))as_schedule_single_action(time()+5,self::JOB,array((int)$id),'fcia');}
  elseif(!wp_next_scheduled(self::JOB,array((int)$id)))wp_schedule_single_event(time()+5,self::JOB,array((int)$id));
 }
 static function snapshot($o){
  $items=$o->get_items();if(count($items)!==1)throw new Exception('order_items_review');$item=reset($items);
  if((int)$item->get_quantity()!==1)throw new Exception('quantity_review');
  $e=self::edition($o->get_meta('_fcia_edition'));if(!$e||(int)$e['product_id']!==(int)$item->get_product_id())throw new Exception('edition_review');
  $metrics=$o->get_meta('_fcia_metrics');if(!is_array($metrics))$metrics=array();
  $state=$o->get_status();if($o->get_total_refunded()>0&&$o->get_total_refunded()<$o->get_total())$state='partial_refund';
  return array('site'=>'https://fredericocarvalho.pt','order_id'=>$o->get_id(),'request_id'=>$o->get_meta('_fcia_request'),'edition'=>$e['id'],'product_id'=>$item->get_product_id(),'state'=>$state,'paid'=>$o->is_paid(),'paid_at'=>$o->get_date_paid()?$o->get_date_paid()->date('c'):null,'amount_cents'=>(int)round($o->get_total()*100),'net_cents'=>(int)round(($o->get_total()-$o->get_total_tax())*100),'currency'=>$o->get_currency(),'name'=>trim($o->get_billing_first_name().' '.$o->get_billing_last_name()),'email'=>$o->get_billing_email(),'phone'=>$o->get_billing_phone(),'sms_consent'=>(bool)$o->get_meta('_fcia_sms_consent'),'marketing_consent'=>(bool)$o->get_meta('_fcia_marketing_consent'),'session_id'=>$metrics['session_id']??null,'attribution'=>$metrics['attribution']??(object)array());
 }
 static function sync($id){
  $lock='fcia_order_lock_'.absint($id);if(!add_option($lock,time(),'','no')){if((int)get_option($lock)<time()-120)delete_option($lock);self::enqueue($id);return;}
  $o=wc_get_order($id);if(!$o||!$o->get_meta('_fcia_edition')){delete_option($lock);return;}
  try{
   $p=self::snapshot($o);$hash=hash('sha256',wp_json_encode($p));
   if($o->get_meta('_fcia_sync_hash')!==$hash){$o->update_meta_data('_fcia_sync_revision',(int)$o->get_meta('_fcia_sync_revision')+1);$o->update_meta_data('_fcia_sync_hash',$hash);$o->update_meta_data('_fcia_sync_state','pending');$o->save_meta_data();}
   if($o->get_meta('_fcia_sync_state')==='synced')return;
   $p['revision']=(int)$o->get_meta('_fcia_sync_revision');$r=FCIA_Course::relay('woocommerce_order',$p);if(is_wp_error($r))throw new Exception('crm_unavailable');
   $o->update_meta_data('_fcia_sync_state','synced');$o->update_meta_data('_fcia_sync_at',time());$o->update_meta_data('_fcia_sync_attempt',0);$o->delete_meta_data('_fcia_sync_error');$o->save_meta_data();
  }catch(Throwable $ex){
   $n=(int)$o->get_meta('_fcia_sync_attempt')+1;$o->update_meta_data('_fcia_sync_attempt',$n);$o->update_meta_data('_fcia_sync_state','pending');$o->update_meta_data('_fcia_sync_error',in_array($ex->getMessage(),array('order_items_review','quantity_review','edition_review'),true)?$ex->getMessage():'crm_unavailable');$o->save_meta_data();
   if($n<=30){$delay=min(3600,60*(2**min($n,6)));if(function_exists('as_schedule_single_action'))as_schedule_single_action(time()+$delay,self::JOB,array((int)$id),'fcia');elseif(!wp_next_scheduled(self::JOB,array((int)$id)))wp_schedule_single_event(time()+$delay,self::JOB,array((int)$id));}
  }finally{delete_option($lock);}
 }
 static function extra_fields(){
  if(!self::scope())return;
  echo '<div class="fcia-checkout-consents"><input type="hidden" name="fcia_metrics" id="fcia_metrics" value=""><p><label><input type="checkbox" name="fcia_sms_consent" value="1"> Quero receber por SMS os lembretes deste curso (opcional).</label></p><p><label><input type="checkbox" name="fcia_marketing_consent" value="1"> Quero receber novidades sobre futuras formações (opcional).</label></p></div>';
 }
 static function footer(){
  if(!self::scope())return;$url=home_url(FCIA_Editions::CHECKOUT);
  echo '<script>window.FCIA_WOO_CHECKOUT='.wp_json_encode(array('url'=>$url),JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT).';</script><script src="'.esc_url(plugins_url('../assets/woo-checkout.js',__FILE__)).'"></script>';
 }
 static function pending_ids(){
  global $wpdb;$hpos=class_exists('\Automattic\WooCommerce\Utilities\OrderUtil')&&\Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled();
  $table=$hpos?$wpdb->prefix.'wc_orders_meta':$wpdb->postmeta;$column=$hpos?'order_id':'post_id';
  return array_map('intval',$wpdb->get_col($wpdb->prepare("SELECT DISTINCT $column FROM $table WHERE meta_key=%s AND meta_value=%s",'_fcia_sync_state','pending')));
 }
 static function summary(){
  if(!function_exists('wc_get_orders')){echo '<p>WooCommerce indisponível.</p>';return;}
  if(isset($_POST['fcia_retry_orders'])){check_admin_referer('fcia_retry_orders');$ids=array_slice(self::pending_ids(),0,100);foreach($ids as $id)self::enqueue($id);echo '<p>Nova tentativa agendada para '.count($ids).' encomendas pendentes.</p>';}
  $pending=count(self::pending_ids());
  global $wpdb;$ids=$wpdb->get_col($wpdb->prepare("SELECT DISTINCT i.order_id FROM {$wpdb->prefix}woocommerce_order_items i INNER JOIN {$wpdb->prefix}woocommerce_order_itemmeta m ON m.order_item_id=i.order_item_id WHERE m.meta_key='_product_id' AND m.meta_value=%s",'98080'));$paid=0;$all=0;foreach($ids as $oid){$o=wc_get_order($oid);if(!$o||$o->get_status()==='trash')continue;$all++;if($o->is_paid())$paid++;}
  echo '<p><strong>Curso anterior:</strong> '.(int)$all.' encomendas registadas; '.(int)$paid.' em estado pago. Contagem por produto original, sem importar participantes. Não é uma contagem de visitantes únicos.</p>'; 
  echo '<p><strong>Encomendas por sincronizar:</strong> '.(int)$pending.'. Pagamentos e faturas são geridos no WooCommerce. O CRM recebe inscrições e gere o acompanhamento do curso.</p>';
  if($pending){echo '<form method="post">';wp_nonce_field('fcia_retry_orders');echo '<button class="button" name="fcia_retry_orders" value="1">Voltar a sincronizar encomendas pendentes</button></form>';}
  echo '<p><a class="button" href="'.esc_url(admin_url('admin.php?page=wc-admin&path=/analytics/products&filter=single_product&products=98080&period=custom&after=2020-01-01&before='.gmdate('Y-m-d'))).'">Ver vendas do curso anterior</a> <a class="button" href="'.esc_url(admin_url('admin.php?page=wc-orders')).'">Ver encomendas no WooCommerce</a></p><p>As vendas anteriores não são importadas automaticamente para o Curso IA. As visitas sem encomenda dependem das métricas que estavam ativas no checkout.</p>';
 }
}
add_action('template_redirect',array('FCIA_Woo','start'),-20);
add_filter('wfacp_save_products',array('FCIA_Woo','products'),30);
add_filter('wfacp_forms_field',array('FCIA_Woo','field'),30,2);
add_filter('wfacp_default_values',function($value,$key){return FCIA_Woo::scope()&&$key==='ondedesejarealizarcurso'?(FCIA_Woo::selected()['id']??''):$value;},30,2);
add_filter('woocommerce_is_purchasable',function($ok,$p){$id=$p->get_meta('_fcia_edition');return $id?$ok&&FCIA_Woo::active()&&FCIA_Woo::available(FCIA_Woo::edition($id)):$ok;},20,2);
add_action('woocommerce_after_checkout_validation',array('FCIA_Woo','validate'),20,2);
add_action('woocommerce_checkout_create_order',array('FCIA_Woo','tag'),20,2);
add_action('woocommerce_checkout_order_processed',array('FCIA_Woo','enqueue'),30);
add_action('woocommerce_order_status_changed',array('FCIA_Woo','enqueue'),30);
add_action('woocommerce_payment_complete',array('FCIA_Woo','enqueue'),30);
add_action('woocommerce_order_refunded',array('FCIA_Woo','enqueue'),30);
add_action(FCIA_Woo::JOB,array('FCIA_Woo','sync'));
add_action('woocommerce_review_order_before_submit',array('FCIA_Woo','extra_fields'));
add_action('wp_footer',array('FCIA_Woo','footer'),90);

add_filter('wfacp_default_product',function($defaults){$e=FCIA_Woo::selected();return FCIA_Woo::scope()&&$e?array('fcia_'.$e['product_id']):$defaults;},100);

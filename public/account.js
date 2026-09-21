const $=s=>document.querySelector(s),money=(n,c='PHP')=>new Intl.NumberFormat('en-PH',{style:'currency',currency:c}).format(n),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=v=>new Date(v).toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'});
async function load(){
 try{
  const r=await fetch('/api/account'),data=await r.json();if(r.status===401){location.href='/account';return}if(!r.ok)throw Error(data.error||'Unable to load your orders.');
  const orders=data.orders||[],name=data.profile?.name||data.profile?.email||'Customer';
  $('#welcome').textContent='Signed in as '+name;
  $('#allCount').textContent=orders.length;
  $('#activeCount').textContent=orders.filter(o=>!['Delivered','Cancelled'].includes(o.status)).length;
  $('#deliveredCount').textContent=orders.filter(o=>o.status==='Delivered').length;
  $('#empty').hidden=!!orders.length;
  $('#orders').innerHTML=orders.map(o=>'<article class="order"><div class="order-head"><div><span class="label">Order</span><span class="order-id">'+esc(o.id)+'</span></div><div><span class="label">Placed</span>'+esc(date(o.created_at))+'</div><div><span class="label">Total</span><strong>'+money(o.total,o.items[0]?.currency)+'</strong></div><div><span class="status '+esc(o.status)+'">'+esc(o.status)+'</span></div></div><div class="order-body"><div>'+o.items.map(i=>'<div class="item"><div><strong>'+esc(i.name)+'</strong><p>'+esc(i.color)+' / '+esc(i.size)+' · Qty '+i.qty+(i.preorder?' · PRE-ORDER':'')+'</p></div><strong>'+money(i.price*i.qty,i.currency)+'</strong></div>').join('')+'</div><aside class="meta"><p><span class="label">Payment</span>'+esc(o.payment_method)+' · '+esc(o.payment_status)+'</p>'+(o.tracking?'<p><span class="label">Tracking</span>'+esc(o.tracking)+'</p>':'<p><span class="label">Tracking</span>Added when your order ships.</p>')+'<div class="total"><span>Order total</span><span>'+money(o.total,o.items[0]?.currency)+'</span></div></aside></div></article>').join('');
 }catch(e){$('#notice').textContent=e.message;$('#orders').innerHTML='';}
}
load();

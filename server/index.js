const ADMIN_EMAIL='subsubanjr.eduardo@gmail.com';
const statuses=['Pending','Confirmed','Preparing','Shipped','Delivered','Cancelled'];
const payments=['Unpaid','Paid','Refunded'];
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const fail=(msg,status=400)=>{throw Object.assign(new Error(msg),{status})};
const db=env=>{if(!env.DB)fail('Store data is temporarily unavailable.',503);return env.DB};
const decode=row=>({...row,customer:JSON.parse(row.customer),items:JSON.parse(row.items)});
const userFrom=request=>{
 const id=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');
 if(!id||!email)return null;
 let name='';
 if(request.headers.get('oai-authenticated-user-full-name-encoding')==='percent-encoded-utf-8'){
  try{name=decodeURIComponent(request.headers.get('oai-authenticated-user-full-name')||'')}catch{}
 }
 return {id,email:email.toLowerCase(),name:name.trim()};
};
const ensureCustomer=async(env,user)=>{
 const now=new Date().toISOString();
 await db(env).prepare('INSERT INTO customers (user_id,email,name,created_at,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET email=excluded.email,name=CASE WHEN length(excluded.name)=0 THEN customers.name ELSE excluded.name END,updated_at=excluded.updated_at')
  .bind(user.id,user.email,user.name,now,now).run();
};
const signInPage=(title,message,returnTo)=>new Response('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>'+title+'</title><body style="font:16px Inter,Arial,sans-serif;background:#f8f8f6;color:#09090a;max-width:600px;margin:13vh auto;padding:28px"><p style="font-size:12px;letter-spacing:.18em;font-weight:700">MEDICINAL LIFESTYLE</p><h1 style="font-size:42px;line-height:1;margin:18px 0">'+title+'</h1><p style="color:#555;line-height:1.65">'+message+'</p><a href="/signin-with-chatgpt?return_to='+encodeURIComponent(returnTo)+'" target="_top" style="display:inline-block;background:#09090a;color:#fff;text-decoration:none;padding:16px 20px;font-weight:700;margin:18px 0">CREATE ACCOUNT / SIGN IN →</a><p><a href="/" style="color:#555">Back to store</a></p></body></html>',{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});

export default {async fetch(request,env){try{
 const url=new URL(request.url),p=url.pathname,user=userFrom(request),admin=user?.email===ADMIN_EMAIL;
 if(p.startsWith('/api/')&&!['GET','HEAD'].includes(request.method)){
  if(request.headers.get('Origin')!==url.origin)return json({error:'Request origin not allowed.'},403);
  if(!request.headers.get('Content-Type')?.includes('application/json'))return json({error:'JSON required.'},415);
  if(Number(request.headers.get('Content-Length')||0)>(p==='/api/admin/media'?7000000:1000000))return json({error:'Request too large.'},413);
 }
 const cmsResponse=await cms(request,env,user,admin,p);if(cmsResponse)return cmsResponse;
 if(p==='/api/me'&&request.method==='GET')return json({authenticated:!!user,user:user&&{email:user.email,name:user.name}});
 if(p==='/api/account'&&request.method==='GET'){
  if(!user)return json({error:'Sign in to view your account.',signIn:true},401);
  await ensureCustomer(env,user);
  const profile=await db(env).prepare('SELECT email,name,created_at FROM customers WHERE user_id=?').bind(user.id).first();
  const {results}=await db(env).prepare('SELECT * FROM orders WHERE customer_user_id=? ORDER BY created_at DESC LIMIT 500').bind(user.id).all();
  return json({profile,orders:results.map(decode)});
 }
 const reviewMatch=p.match(/^\/api\/products\/([^/]+)\/reviews$/);
 if(reviewMatch&&request.method==='GET'){
  const productId=decodeURIComponent(reviewMatch[1]);if(!(await readShop(env)).data.products.some(x=>x.id===productId&&x.status==='published'&&x.availability!=='Hidden'))fail('Product not found.',404);
  const {results}=await db(env).prepare('SELECT id,customer_name,rating,title,body,created_at,updated_at FROM reviews WHERE product_id=? ORDER BY updated_at DESC LIMIT 50').bind(productId).all();
  const summary=await db(env).prepare('SELECT COUNT(*) AS count, COALESCE(AVG(rating),0) AS average FROM reviews WHERE product_id=?').bind(productId).first();
  return json({reviews:results,summary:{count:Number(summary.count),average:Number(summary.average)}});
 }
 if(reviewMatch&&request.method==='POST'){
  if(!user)return json({error:'Create an account or sign in to write a review.',signIn:true},401);
  const productId=decodeURIComponent(reviewMatch[1]);if(!(await readShop(env)).data.products.some(x=>x.id===productId&&x.status==='published'&&x.availability!=='Hidden'))fail('Product not found.',404);
  const b=await request.json();
  if(!Number.isInteger(b.rating)||b.rating<1||b.rating>5)fail('Choose a rating from 1 to 5 stars.');
  if(typeof b.title!=='string'||b.title.trim().length>100)fail('Review title is too long.');
  if(typeof b.body!=='string'||b.body.trim().length<10||b.body.trim().length>1000)fail('Review must be between 10 and 1,000 characters.');
  await ensureCustomer(env,user);
  const now=new Date().toISOString(),name=(user.name||user.email.split('@')[0]).slice(0,80);
  await db(env).prepare('INSERT INTO reviews (id,product_id,customer_user_id,customer_name,rating,title,body,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(product_id,customer_user_id) DO UPDATE SET customer_name=excluded.customer_name,rating=excluded.rating,title=excluded.title,body=excluded.body,updated_at=excluded.updated_at')
   .bind('RV-'+crypto.randomUUID().slice(0,12).toUpperCase(),productId,user.id,name,b.rating,b.title.trim(),b.body.trim(),now,now).run();
  return json({ok:true},201);
 }
 if(p.startsWith('/api/admin/')&&!admin)return json({error:'Sign in with the store owner account to manage orders.'},403);
 if(p==='/api/admin/orders'&&request.method==='GET'){
  const {results}=await db(env).prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 1000').all();
  return json({orders:results.map(decode)});
 }
 if(p.startsWith('/api/admin/orders/')&&request.method==='PATCH')return await updateOrder(request,env,user,p);
 if(p==='/api/orders'&&request.method==='POST')return await placeOrder(request,env,user);
 if(p.startsWith('/api/'))return json({error:'Not found'},404);
 if((p==='/account'||p==='/account/')&&!user)return signInPage('YOUR ACCOUNT','Create an account or sign in before checkout, then return here anytime to see every order and its latest status.','/account');
 if(p==='/admin'||p==='/admin/'){
  if(!admin){const signed=!!user;return signed?new Response('<html><meta name="viewport" content="width=device-width"><title>Admin access</title><body style="font:18px Arial;max-width:560px;margin:15vh auto;padding:24px"><h1>Medicinal Lifestyle admin</h1><p>This account is not authorized. Sign in with the store owner account.</p><a href="/signout-with-chatgpt?return_to=%2Fadmin" target="_top">Sign out</a><p><a href="/">Back to store</a></p></body></html>',{status:403,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}}):signInPage('ADMIN ACCESS','Sign in with the store owner account to manage orders.','/admin');}
 }
 const key=(p==='/'||p==='/shop')?'/index.html':p==='/admin'||p==='/admin/'?'/admin.html':p==='/account'||p==='/account/'?'/account.html':p;
 if(key==='/admin.html'&&!admin)return json({error:'Admin access required'},403);
 if(key==='/account.html'&&!user)return json({error:'Customer account required'},401);
 const a=assets[key];if(!a)return new Response('Not found',{status:404});
 return new Response(Uint8Array.from(atob(a.data),c=>c.charCodeAt(0)),{headers:{'Content-Type':a.type,'Cache-Control':key.endsWith('.jpg')?'public, max-age=86400':'no-store','X-Content-Type-Options':'nosniff'}});
 }catch(e){console.error('Store request failed:',e.message);return json({error:e.status?e.message:'Unable to complete this request. Please try again.'},e.status||503);}}};

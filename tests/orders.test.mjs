import {DatabaseSync} from 'node:sqlite';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker from '../dist/server/index.js';

const sqlite=new DatabaseSync(':memory:');
for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort()){
 for(const statement of fs.readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(statement.trim())sqlite.exec(statement);
}
const env={DB:{prepare(sql){let args=[];return {bind(...values){args=values;return this},async all(){return {results:sqlite.prepare(sql).all(...args)}},async first(){return sqlite.prepare(sql).get(...args)||null},async run(){const r=sqlite.prepare(sql).run(...args);return {meta:{changes:r.changes}}}}}}};
env.DB.batch=async statements=>{sqlite.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());sqlite.exec('COMMIT');return result;}catch(e){sqlite.exec('ROLLBACK');throw e;}};
const origin='https://store.test';
const users={
 customer:{id:'customer-1',email:'buyer@example.com',name:'Test Buyer'},
 admin:{id:'owner-1',email:'subsubanjr.eduardo@gmail.com',name:'Eduardo'}
};
async function call(path,method='GET',body,who){
 const u=users[who];
 return worker.fetch(new Request(origin+path,{method,headers:{...(body?{'Content-Type':'application/json',Origin:origin}:{}),...(u?{'oai-authenticated-user-id':u.id,'oai-authenticated-user-email':u.email,'oai-authenticated-user-full-name':encodeURIComponent(u.name),'oai-authenticated-user-full-name-encoding':'percent-encoded-utf-8'}:{})},...(body?{body:JSON.stringify(body)}:{})}),env);
}

assert.equal((await call('/api/admin/orders')).status,403);
assert.equal((await call('/admin.html')).status,403);
assert.equal((await call('/account.html')).status,401);
assert.equal((await call('/account')).status,200);
assert.equal((await call('/')).status,200);

const payload={requestKey:crypto.randomUUID(),customer:{name:'Test Buyer',phone:'09170000000',email:'buyer@example.com',address:'Test Street',city:'Claveria',postal:'9004'},payment:'GCash',total:3398,items:[{id:'white-hoodie',color:'White',size:'M',qty:2,price:1}]};
assert.equal((await call('/api/orders','POST',payload)).status,401);
assert.equal((await call('/api/orders','POST',payload,'customer')).status,409);payload.items[0].price=1699;
let r=await call('/api/orders','POST',payload,'customer');assert.equal(r.status,201);const {id}=await r.json();assert.ok(id);
assert.equal((await call('/api/orders','POST',payload,'customer')).status,201);
let account=await (await call('/api/account','GET',null,'customer')).json();assert.equal(account.orders.length,1);assert.equal(account.orders[0].id,id);assert.equal(account.profile.email,'buyer@example.com');

let reviews=await (await call('/api/products/white-hoodie/reviews')).json();assert.equal(reviews.summary.count,0);
assert.equal((await call('/api/products/white-hoodie/reviews','POST',{rating:5,title:'Great fit',body:'Heavyweight and comfortable.'})).status,401);
assert.equal((await call('/api/products/white-hoodie/reviews','POST',{rating:5,title:'Great fit',body:'Heavyweight and comfortable.'},'customer')).status,201);
assert.equal((await call('/api/products/white-hoodie/reviews','POST',{rating:4,title:'Updated',body:'Still a very comfortable hoodie.'},'customer')).status,201);
reviews=await (await call('/api/products/white-hoodie/reviews')).json();assert.equal(reviews.summary.count,1);assert.equal(reviews.summary.average,4);assert.equal(reviews.reviews[0].title,'Updated');

let list=(await (await call('/api/admin/orders','GET',null,'admin')).json()).orders;assert.equal(list.length,1);assert.equal(list[0].total,3398);assert.equal(list[0].preorder,1);assert.equal(list[0].payment_status,'Unpaid');assert.equal(list[0].customer.name,'Test Buyer');
const changes={status:'Confirmed',payment_status:'Paid',tracking:'Courier 123',notes:'Verified manually',revision:0};
assert.equal((await call('/api/admin/orders/'+id,'PATCH',changes,'customer')).status,403);
assert.equal((await call('/api/admin/orders/'+id,'PATCH',changes,'admin')).status,200);
assert.equal((await call('/api/admin/orders/'+id,'PATCH',changes,'admin')).status,409);
list=(await (await call('/api/admin/orders','GET',null,'admin')).json()).orders;assert.equal(list[0].status,'Confirmed');assert.equal(list[0].payment_status,'Paid');
payload.requestKey=crypto.randomUUID();payload.items[0].qty=-2;assert.equal((await call('/api/orders','POST',payload,'customer')).status,400);
const cross=new Request(origin+'/api/orders',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://evil.test','oai-authenticated-user-id':'customer-1','oai-authenticated-user-email':'buyer@example.com'},body:JSON.stringify(payload)});assert.equal((await worker.fetch(cross,env)).status,403);
console.log('Passed: customer sign-in checkout, account order history, product reviews, admin management, persistence, pricing, validation, idempotency and access control.');

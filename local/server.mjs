import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import {randomBytes,randomUUID,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');process.chdir(root);
if(fs.existsSync('.env'))process.loadEnvFile('.env');
const port=Number(process.env.PORT||3000);if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT must be between 1 and 65535.');
const origin='http://localhost:'+port;
const dataDir=path.resolve(process.env.DATA_DIR||'data');fs.mkdirSync(dataDir,{recursive:true});fs.mkdirSync(path.join(dataDir,'uploads'),{recursive:true});
const sqlite=new DatabaseSync(path.join(dataDir,'store.sqlite'));sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
sqlite.exec('CREATE TABLE IF NOT EXISTS local_migrations(name TEXT PRIMARY KEY)');
for(const name of fs.readdirSync('drizzle').filter(x=>x.endsWith('.sql')).sort()){
 if(sqlite.prepare('SELECT 1 FROM local_migrations WHERE name=?').get(name))continue;
 sqlite.exec('BEGIN');try{sqlite.exec(fs.readFileSync(path.join('drizzle',name),'utf8'));sqlite.prepare('INSERT INTO local_migrations VALUES(?)').run(name);sqlite.exec('COMMIT');}catch(e){sqlite.exec('ROLLBACK');throw e;}
}
sqlite.exec(`CREATE TABLE IF NOT EXISTS local_users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,salt TEXT NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('admin','customer')));
CREATE UNIQUE INDEX IF NOT EXISTS local_one_admin ON local_users(role) WHERE role='admin';
CREATE TABLE IF NOT EXISTS local_sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES local_users(id),expires INTEGER NOT NULL);`);
if(!sqlite.prepare("SELECT 1 FROM shop WHERE id='store'").get()&&fs.existsSync('local/store-snapshot.json')){const snapshot=JSON.parse(fs.readFileSync('local/store-snapshot.json','utf8'));sqlite.prepare("INSERT INTO shop(id,data,revision,token) VALUES('store',?,0,'')").run(JSON.stringify(snapshot));}
const DB={prepare(sql){let args=[];return {bind(...v){args=v;return this},async first(){return sqlite.prepare(sql).get(...args)||null},async all(){return {results:sqlite.prepare(sql).all(...args)}},run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...args).changes)}}}}},async batch(statements){sqlite.exec('BEGIN IMMEDIATE');try{const results=statements.map(s=>s.run());sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
const assetTypes={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2'};
// Import exactly the published business logic. Read public assets from disk on each request.
const moduleFile=path.join(dataDir,'runtime-worker.mjs');
function buildRuntime(){let combined=fs.readFileSync('server/seed.js','utf8')+'\n'+fs.readFileSync('server/cms.js','utf8')+'\n'+fs.readFileSync('server/index.js','utf8');combined=combined.replace('admin=user?.email===ADMIN_EMAIL','admin=user?.email===(env.ADMIN_EMAIL||ADMIN_EMAIL)');fs.writeFileSync(moduleFile,"const assets={};\n"+combined);}
buildRuntime();let worker=(await import(pathToFileURL(moduleFile).href+'?v='+Date.now())).default;
// pathToFileURL is needed for Windows drive letters; see import below for the portable reload path.
let codeVersion=0;
async function reload(){buildRuntime();worker=(await import(pathToFileURL(moduleFile).href+'?v='+(++codeVersion))).default;}
const watchers=['server/seed.js','server/cms.js','server/index.js'].map(f=>fs.watch(f,()=>reload().then(()=>console.log('Server code reloaded.')).catch(e=>console.error('Reload failed:',e.message))));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hash=s=>createHash('sha256').update(s).digest('hex');
const home=v=>typeof v==='string'&&/^\/(?!\/)/.test(v)&&!/[\\\r\n]/.test(v)?v:'/account';
const respond=(body,status=200,headers={})=>new Response(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const json=(data,status=200)=>respond(JSON.stringify(data),status,{'Content-Type':'application/json'});
const redirect=(target,cookie)=>respond(null,303,{Location:target,...(cookie?{'Set-Cookie':cookie}:{})});
const getOwner=()=>sqlite.prepare("SELECT * FROM local_users WHERE role='admin'").get();
function session(req){const token=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('ml_session='))?.slice(11);return token?sqlite.prepare('SELECT u.* FROM local_sessions s JOIN local_users u ON s.user_id=u.id WHERE s.token_hash=? AND s.expires>?').get(hash(token),Date.now()):null;}
function newSession(user){const token=randomBytes(32).toString('hex');sqlite.prepare('DELETE FROM local_sessions WHERE expires<?').run(Date.now());sqlite.prepare('INSERT INTO local_sessions VALUES(?,?,?)').run(hash(token),user.id,Date.now()+7*86400000);return 'ml_session='+token+'; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800';}
function page(mode,returnTo,error=''){
 const setup=mode==='setup',register=mode==='register',title=setup?'SET UP YOUR STORE':register?'CREATE ACCOUNT':'WELCOME BACK';
 return respond(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · Medicinal Lifestyle</title><link rel="stylesheet" href="/styles.css"><style>body{min-height:100vh;display:grid;place-items:center;padding:24px}.auth{width:min(520px,100%);background:white;border:1px solid #d8d8d4;padding:40px}.auth h1{font-family:'Archivo Black',Arial,sans-serif;font-size:34px;line-height:1;margin:25px 0}.auth p{line-height:1.6;color:#666}.auth label{display:block;margin:18px 0;font-size:14px;font-weight:600}.auth input{width:100%;padding:14px;margin-top:8px;border:1px solid #bbb;font:inherit}.auth .primary{width:100%;background:#111;color:white;margin:12px 0}.auth a{text-decoration:underline}.error{color:#9d2424!important;background:#fff0c2;padding:14px}</style></head><body><main class="auth"><a href="/" class="brand">MEDICINAL LIFESTYLE</a><h1>${title}</h1><p>${setup?'Create the administrator for this local copy. This does not change your hosted store.':register?'Create your local customer account to order and track purchases.':'Sign in to your local customer or administrator account.'}</p>${error?'<p class="error" role="alert">'+esc(error)+'</p>':''}<form method="post" action="/${mode}"><input type="hidden" name="return_to" value="${esc(returnTo)}">${setup||register?'<label>Name<input name="name" autocomplete="name" required maxlength="100"></label>':''}<label>Email<input type="email" name="email" autocomplete="email" required maxlength="254"></label><label>Password<input type="password" name="password" autocomplete="${setup||register?'new-password':'current-password'}" required minlength="12" maxlength="200"></label>${setup||register?'<p>Use at least 12 characters.</p>':''}<button class="primary" type="submit">${setup?'CREATE ADMIN ACCOUNT':register?'CREATE ACCOUNT':'SIGN IN'} →</button></form>${setup?'':`<p><a href="/${register?'login':'register'}?return_to=${encodeURIComponent(returnTo)}">${register?'Already have an account? Sign in':'Create a customer account'}</a></p>`}<p><a href="/">Back to store</a></p></main></body></html>`,200,{'Content-Type':'text/html; charset=utf-8'});
}
const attempts=new Map();
async function auth(req,url){const p=url.pathname;const next=home(url.searchParams.get('return_to'));
 if(p==='/signin-with-chatgpt')return redirect((getOwner()?'/login':'/setup')+'?return_to='+encodeURIComponent(next));
 if(p==='/signout-with-chatgpt')return respond('<!doctype html><html><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/styles.css"><main style="padding:50px"><h1>Sign out?</h1><form action="/logout" method="post"><button class="primary dark">SIGN OUT</button></form><p><a href="/">Back to store</a></p></main></html>',200,{'Content-Type':'text/html'});
 if(p==='/logout'&&req.method==='POST'){if(req.headers.get('origin')!==origin)return json({error:'Origin not allowed.'},403);const token=(req.headers.get('cookie')||'').match(/(?:^|;\s*)ml_session=([^;]+)/)?.[1];if(token)sqlite.prepare('DELETE FROM local_sessions WHERE token_hash=?').run(hash(token));return redirect('/','ml_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');}
 if(!['/setup','/login','/register'].includes(p))return null;
 const mode=p.slice(1);if(mode==='setup'&&getOwner())return redirect('/login?return_to=%2Fadmin');if(mode!=='setup'&&!getOwner())return redirect('/setup');if(req.method==='GET')return page(mode,next);
 if(req.method!=='POST')return respond('Method not allowed',405);if(req.headers.get('origin')!==origin)return json({error:'Origin not allowed.'},403);
 const bucket='auth',record=attempts.get(bucket);if(record&&record.expires>Date.now()&&record.count>=30)return respond('Too many attempts. Try again in 15 minutes.',429);if(!record||record.expires<Date.now())attempts.set(bucket,{count:1,expires:Date.now()+900000});else record.count++;
 const form=await req.formData(),email=String(form.get('email')||'').trim().toLowerCase(),password=String(form.get('password')||''),name=String(form.get('name')||'').trim().slice(0,100),returnTo=home(form.get('return_to'));
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||password.length<12||password.length>200)return page(mode,returnTo,'Enter a valid email and a password of at least 12 characters.');
 let user=sqlite.prepare('SELECT * FROM local_users WHERE email=?').get(email);
 if(mode==='login'){const salt=user?.salt||'0'.repeat(32);const candidate=scryptSync(password,salt,64);if(!user||!timingSafeEqual(candidate,Buffer.from(user.password_hash,'hex')))return page(mode,returnTo,'Email or password is incorrect.');}
 else{if(!name)return page(mode,returnTo,'Enter your name.');if(user)return page(mode,returnTo,'An account with that email already exists.');const salt=randomBytes(16).toString('hex'),passwordHash=scryptSync(password,salt,64).toString('hex');const id=randomUUID();sqlite.prepare('INSERT INTO local_users VALUES(?,?,?,?,?,?)').run(id,email,name,salt,passwordHash,mode==='setup'?'admin':'customer');user=sqlite.prepare('SELECT * FROM local_users WHERE id=?').get(id);}
 return redirect(mode==='setup'?'/admin':returnTo,newSession(user));
}
async function route(req){const url=new URL(req.url),p=url.pathname;const authResponse=await auth(req,url);if(authResponse)return authResponse;const user=session(req),owner=getOwner();
 if((p==='/admin'||p==='/admin/')&&!owner)return redirect('/setup');
 const headers=new Headers(req.headers);for(const key of [...headers.keys()])if(key.startsWith('oai-')||key.startsWith('x-forwarded-'))headers.delete(key);
 if(user){headers.set('oai-authenticated-user-id',user.id);headers.set('oai-authenticated-user-email',user.email);headers.set('oai-authenticated-user-full-name',encodeURIComponent(user.name));headers.set('oai-authenticated-user-full-name-encoding','percent-encoded-utf-8');}
 const env={DB,ADMIN_EMAIL:owner?.email||'unconfigured.invalid',CLOUDINARY_CLOUD_NAME:process.env.CLOUDINARY_CLOUD_NAME,CLOUDINARY_API_KEY:process.env.CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET:process.env.CLOUDINARY_API_SECRET};
 if(p==='/api/admin/media'&&req.method==='POST'&&!(env.CLOUDINARY_CLOUD_NAME&&env.CLOUDINARY_API_KEY&&env.CLOUDINARY_API_SECRET)){
 if(user?.role!=='admin')return json({error:'Admin access required.'},403);if(req.headers.get('origin')!==origin)return json({error:'Origin not allowed.'},403);const b=await req.json(),match=typeof b.data==='string'&&b.data.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);if(!match)return json({error:'Use a JPG, PNG or WebP image.'},400);const bytes=Buffer.from(match[2],'base64');if(bytes.length>5*1024*1024)return json({error:'Image exceeds 5 MB.'},400);const valid=match[1]==='jpeg'?bytes[0]===255&&bytes[1]===216:match[1]==='png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';if(!valid)return json({error:'Invalid image file.'},400);const file=randomUUID()+'.'+(match[1]==='jpeg'?'jpg':match[1]);fs.writeFileSync(path.join(dataDir,'uploads',file),bytes);return json({url:'/uploads/'+file,publicId:''});}
 if(p.startsWith('/uploads/')){const filename=p.slice(9);if(!/^[a-f0-9-]+\.(jpg|png|webp)$/.test(filename))return respond('Not found',404);const file=path.join(dataDir,'uploads',filename);return fs.existsSync(file)?respond(fs.readFileSync(file),200,{'Content-Type':assetTypes[path.extname(file)]}):respond('Not found',404);}
 const forwarded=new Request(req.url,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:await req.arrayBuffer()}:{})});
 if(p.startsWith('/api/')){const response=await worker.fetch(forwarded,env);if(p==='/api/admin/store'&&response.ok){const b=await response.json();b.database='Local SQLite — data/store.sqlite';b.mediaConfigured=true;b.localMedia=true;return json(b);}return response;}
 const key=p==='/'||p==='/shop'?'/index.html':p==='/admin'||p==='/admin/'?'/admin.html':p==='/account'||p==='/account/'?'/account.html':p;
 if(key==='/admin.html'&&user?.role!=='admin')return user?respond('This account is not an administrator. <a href="/signout-with-chatgpt">Sign out</a>',403,{'Content-Type':'text/html'}):redirect('/login?return_to=%2Fadmin');
 if(key==='/account.html'&&!user)return redirect('/login?return_to=%2Faccount');
 if(req.method!=='GET'&&req.method!=='HEAD')return respond('Method not allowed',405);
 let decoded;try{decoded=decodeURIComponent(key);}catch{return respond('Not found',404);}const file=path.resolve('public','.'+decoded),publicRoot=path.resolve('public')+path.sep;if(!file.startsWith(publicRoot)||!fs.existsSync(file)||!fs.statSync(file).isFile())return respond('Not found',404);
 return respond(req.method==='HEAD'?null:fs.readFileSync(file),200,{'Content-Type':assetTypes[path.extname(file)]||'application/octet-stream'});
}
const server=http.createServer(async(incoming,outgoing)=>{try{
 if(incoming.headers.host!=='localhost:'+port){outgoing.writeHead(400);outgoing.end('Open '+origin+' in your browser.');return;}
 const chunks=[];let size=0;for await(const chunk of incoming){size+=chunk.length;if(size>7500000){outgoing.writeHead(413);outgoing.end('Request too large.');return;}chunks.push(chunk);}
 const req=new Request(origin+(incoming.url||'/'),{method:incoming.method,headers:incoming.headers,...(!['GET','HEAD'].includes(incoming.method)?{body:Buffer.concat(chunks)}:{})});const response=await route(req);outgoing.writeHead(response.status,Object.fromEntries(response.headers));outgoing.end(Buffer.from(await response.arrayBuffer()));
 }catch(e){console.error(e.message);if(!outgoing.headersSent)outgoing.writeHead(500,{'Content-Type':'application/json'});outgoing.end(JSON.stringify({error:'Unable to complete request. Check the terminal.'}));}});
server.listen(port,'127.0.0.1',()=>{console.log('\nMedicinal Lifestyle — local development\nStore: '+origin+'\nAdmin: '+origin+'/admin\n'+(!getOwner()?'First run: open '+origin+'/setup to create your admin account.\n':'')+'Database: '+path.join(dataDir,'store.sqlite')+'\nPress Ctrl+C to stop.\n');});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'Port '+port+' is in use. Stop the other server or change PORT in .env.':e.message);process.exit(1);});
process.on('SIGINT',()=>{watchers.forEach(w=>w.close());server.close(()=>{sqlite.close();process.exit(0);});});

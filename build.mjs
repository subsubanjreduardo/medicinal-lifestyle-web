import fs from 'node:fs';
import path from 'node:path';
const assets={};
function walk(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(f.isDirectory())walk(p);else {let url='/'+path.relative('public',p);assets[url]={data:fs.readFileSync(p).toString('base64'),type:({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg'})[path.extname(p)]||'application/octet-stream'};}}}
walk('public');fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
fs.writeFileSync('dist/server/index.js','const assets='+JSON.stringify(assets)+';\n'+fs.readFileSync('server/seed.js','utf8')+'\n'+fs.readFileSync('server/cms.js','utf8')+'\n'+fs.readFileSync('server/index.js','utf8'));
fs.writeFileSync('dist/.openai/hosting.json',JSON.stringify({d1:'DB'}));
if(fs.existsSync('drizzle'))fs.cpSync('drizzle','dist/.openai/drizzle',{recursive:true});

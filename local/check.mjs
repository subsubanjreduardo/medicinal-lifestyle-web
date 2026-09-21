import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const required=['public/index.html','public/admin.html','public/account.html','public/app.js','public/cms-admin.js','public/styles.css','public/admin.css','local/server.mjs','server/cms.js','server/index.js'];
for(const p of required)assert.ok(fs.existsSync(p),'Missing: '+p);
const files=['local/server.mjs',...fs.readdirSync('public').filter(x=>x.endsWith('.js')).map(x=>'public/'+x),...fs.readdirSync('server').filter(x=>x.endsWith('.js')).map(x=>'server/'+x)];
for(const file of files){const r=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});assert.equal(r.status,0,file);}
const photos=fs.readdirSync('public/assets').filter(x=>/\.(jpg|png|webp)$/i.test(x));assert.ok(photos.length>=9,'Original product photography is missing.');
console.log('PASS: application files, JavaScript syntax and '+photos.length+' original photographs.');

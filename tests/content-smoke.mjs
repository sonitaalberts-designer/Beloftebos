import assert from 'node:assert/strict';import fs from 'node:fs';
const base='http://localhost:5173';const cookie=fs.readFileSync('work/test-cookie.txt','utf8');
async function call(path,v){const r=await fetch(base+path,{method:v?'POST':'GET',headers:{Cookie:cookie,...(v?{'Content-Type':'application/json'}:{})},body:v?JSON.stringify(v):undefined});let d=await r.json();assert.equal(r.status,200,JSON.stringify(d));return d;}
const fd=new FormData();fd.set('file',new File([fs.readFileSync('public/images/room.avif')],'test.avif',{type:'image/avif'}));let r=await fetch(base+'/api/admin/upload',{method:'POST',headers:{Cookie:cookie},body:fd});assert.equal(r.status,200);let image=await r.json();assert.equal((await fetch(base+image.url)).status,200);
await call('/api/admin/save',{collection:'gallery_images',entry:{id:'qa-gallery',title:'QA image',image:image.url,alt:'Automated upload test',category:'Rooms',published:false}});
await call('/api/admin/save',{collection:'blog_posts',entry:{id:'qa-post',title:'QA draft',slug:'qa-draft',description:'Test editing',body:'QA draft content',published:false}});
let d=await call('/api/admin/data');assert.ok(d.data.blog_posts.some(p=>p.id==='qa-post'));assert.ok(d.data.gallery_images.some(p=>p.id==='qa-gallery'));
await call('/api/admin/delete',{collection:'blog_posts',id:'qa-post'});await call('/api/admin/delete',{collection:'gallery_images',id:'qa-gallery'});
for(const path of ['/','/accommodation','/journal/where-to-stay-near-louis-trichardt']){r=await fetch(base+path);const html=await r.text();assert.match(html,/<title>/);assert.match(html,/name="description"/);assert.match(html,/rel="canonical"/);assert.match(html,/property="og:title"/);}
r=await fetch(base+'/');const html=await r.text();assert.match(html,/LodgingBusiness/);assert.match(html,/FAQPage/);assert.match(await (await fetch(base+'/sitemap.xml')).text(),/journal\/where-to-stay-near-louis-trichardt/);
const cross=await fetch(base+'/api/admin/save',{method:'POST',headers:{Cookie:cookie,Origin:'https://attacker.invalid','Content-Type':'application/json'},body:'{}'});assert.ok([400,403].includes(cross.status));
console.log('PASS: image upload and retrieval, gallery CMS, journal CMS and deletion, SEO metadata, canonical URLs, structured data, sitemap, and cross-origin write rejection.');

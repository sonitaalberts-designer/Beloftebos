import assert from 'node:assert/strict';
import {supabaseStorage} from '../lib/storage.ts';
const originalFetch=globalThis.fetch;
process.env.SUPABASE_URL='https://storage.example.test';
process.env.SUPABASE_SERVICE_ROLE_KEY='test-only-key';
process.env.SUPABASE_STORAGE_BUCKET='website-images';
let calls=[];
globalThis.fetch=async (url,options)=>{calls.push({url,options});return new Response(new Uint8Array([1,2,3]),{headers:{'content-type':'image/png'}})};
try {
 const storage=supabaseStorage();
 await storage.put('photo.png',new Uint8Array([1,2,3]),{httpMetadata:{contentType:'image/png'}});
 assert.equal(calls[0].url,'https://storage.example.test/storage/v1/object/website-images/photo.png');
 assert.equal(calls[0].options.method,'POST');
 assert.equal(calls[0].options.headers.Authorization,'Bearer test-only-key');
 assert.equal(calls[0].options.headers['x-upsert'],'false');
 assert.equal((await storage.get('photo.png')).httpMetadata.contentType,'image/png');
 globalThis.fetch=async()=>new Response(null,{status:404});
 assert.equal(await storage.get('missing.png'),null);
 globalThis.fetch=async()=>new Response(null,{status:403});
 await assert.rejects(()=>storage.get('private.png'),/storage request failed/);
 await assert.rejects(()=>storage.put('photo.png',new Uint8Array([1]),{httpMetadata:{contentType:'image/png'}}),/upload failed/);
 delete process.env.SUPABASE_STORAGE_BUCKET;
 assert.equal(supabaseStorage(),undefined);
 console.log('Storage adapter: six checks passed');
} finally { globalThis.fetch=originalFetch; }

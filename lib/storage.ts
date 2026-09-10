// Private Supabase bucket accessed only from server-side authenticated routes.
export function supabaseStorage() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!url || !key || !bucket) return undefined;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const endpoint = (id: string) => `${url}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeURIComponent(id)}`;
  return {
    async get(id: string) {
      const response = await fetch(endpoint(id).replace("/object/", "/object/authenticated/"), { headers, cache: "no-store" });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Image storage request failed");
      return { body: response.body, httpMetadata: { contentType: response.headers.get("content-type") ?? "image/jpeg" } };
    },
    async put(id: string, bytes: Uint8Array, options: { httpMetadata: { contentType: string } }) {
      const response = await fetch(endpoint(id), {
        method: "POST",
        headers: { ...headers, "Content-Type": options.httpMetadata.contentType, "x-upsert": "false" },
        body: new Blob([new Uint8Array(bytes)], { type: options.httpMetadata.contentType }),
      });
      if (!response.ok) throw new Error("Image upload failed");
    },
  };
}

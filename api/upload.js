import supabase from './db-client.js';
import { requireRole, setCors, SALES_ROLES, CONTENT_ROLES, ADMIN_ROLES, cleanStr, audit } from './_auth.js';
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const ALLOWED_FOLDERS = ['properties', 'projects', 'developers', 'blog', 'avatars'];
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'POST') {
      const auth = await requireRole(req, res, [...SALES_ROLES, ...CONTENT_ROLES]);
      if (!auth) return;
      const { fileName, fileBase64, contentType, folder } = req.body || {};
      if (!fileName || !fileBase64) return res.status(400).json({ error: 'fileName and fileBase64 required' });
      if (typeof fileBase64 !== 'string' || fileBase64.length > 11 * 1024 * 1024) return res.status(400).json({ error: 'Invalid file payload' });
      const mime = ALLOWED_MIME.includes(contentType) ? contentType : 'image/jpeg';
      let buffer;
      try { buffer = Buffer.from(fileBase64, 'base64'); } catch { return res.status(400).json({ error: 'Invalid file encoding' }); }
      if (!buffer.length || buffer.length > 8 * 1024 * 1024) return res.status(400).json({ error: 'File too large (max 8MB)' });
      const head = buffer.subarray(0, 4);
      const isImg = (head[0] === 0xff && head[1] === 0xd8) || (head[0] === 0x89 && head[1] === 0x50) || (head[0] === 0x52 && head[1] === 0x49) || (head[0] === 0x00 && head[1] === 0x00);
      if (!isImg) return res.status(400).json({ error: 'Only image uploads are allowed' });
      const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
      const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'properties';
      const path = `${safeFolder}/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from('property-media').upload(path, buffer, { contentType: mime, upsert: true });
      if (error) throw error;
      audit(req, auth, 'upload', 'media', path, { folder: safeFolder, bytes: buffer.length });
      const { data: urlData } = supabase.storage.from('property-media').getPublicUrl(path);
      return res.status(200).json({ url: urlData.publicUrl, path });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error('API upload error:', err); res.status(500).json({ error: err.message }); }
}

-- Run only AFTER deploying /api/admin/upload-image and switching admin clients.
-- Public bucket image downloads remain public; only direct uploads are restricted.
DROP POLICY IF EXISTS "Allow Uploads" ON storage.objects;

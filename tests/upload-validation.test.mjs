import test from 'node:test';
import assert from 'node:assert/strict';
import { validateImageFile } from '../lib/upload-validation.ts';

test('Rejects missing or empty files', () => {
  const result = validateImageFile(null);
  assert.equal(result.valid, false);
});

test('Rejects non-image MIME types', () => {
  const fakeFile = {
    name: 'malicious.exe',
    size: 1024,
    type: 'application/x-msdownload',
  };
  const result = validateImageFile(fakeFile);
  assert.equal(result.valid, false);
  assert.match(result.error, /Invalid file type/);
});

test('Rejects oversized files over 10MB', () => {
  const bigFile = {
    name: 'huge.png',
    size: 15 * 1024 * 1024,
    type: 'image/png',
  };
  const result = validateImageFile(bigFile);
  assert.equal(result.valid, false);
  assert.match(result.error, /exceeds the 10MB limit/);
});

test('Accepts valid images and produces safe randomized filenames', () => {
  const validFile = {
    name: 'editorial-photo.jpeg',
    size: 500 * 1024,
    type: 'image/jpeg',
  };
  const result = validateImageFile(validFile, 'product');
  assert.equal(result.valid, true);
  assert.ok(result.safeFileName.startsWith('product-'));
  assert.ok(result.safeFileName.endsWith('.jpg'));
});

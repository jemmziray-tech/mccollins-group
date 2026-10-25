import test from 'node:test';
import assert from 'node:assert/strict';
import { isAdminEmail, getAdminEmails } from '../lib/admin.ts';

test('Default admin emails include configured team addresses', () => {
  const admins = getAdminEmails();
  assert.ok(admins.length >= 3);
  assert.ok(admins.includes('jem.mziray@gmail.com'));
});

test('Validates admin identity case-insensitively', () => {
  assert.equal(isAdminEmail('Jem.Mziray@gmail.com'), true);
  assert.equal(isAdminEmail('jem.mziray@gmail.com'), true);
  assert.equal(isAdminEmail('hacker@evil.com'), false);
  assert.equal(isAdminEmail(null), false);
  assert.equal(isAdminEmail(undefined), false);
});

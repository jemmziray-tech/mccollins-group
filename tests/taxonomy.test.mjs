import test from 'node:test';
import assert from 'node:assert/strict';
import { TAXONOMY, ALL_CATEGORIES, isValidCategory, isValidDepartment } from '../lib/product-taxonomy.ts';

test('Taxonomy includes core luxury fashion categories', () => {
  assert.ok(ALL_CATEGORIES.includes('Ready to Wear') || ALL_CATEGORIES.includes('Dresses'));
  assert.ok(ALL_CATEGORIES.includes('Tailored Suits'));
  assert.ok(ALL_CATEGORIES.includes('Classic Boots'));
  assert.ok(ALL_CATEGORIES.includes('Luxury Bags'));
});

test('Validates categories accurately', () => {
  assert.equal(isValidCategory('Dresses'), true);
  assert.equal(isValidCategory('Uncategorized'), true);
  assert.equal(isValidCategory('NonExistentCategoryXYZ'), false);
});

test('Validates departments accurately', () => {
  assert.equal(isValidDepartment('Men'), true);
  assert.equal(isValidDepartment('Women'), true);
  assert.equal(isValidDepartment('Kids'), true);
  assert.equal(isValidDepartment('Unisex'), true);
  assert.equal(isValidDepartment('UnknownDept'), false);
});

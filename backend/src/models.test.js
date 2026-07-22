import test from 'node:test';
import assert from 'node:assert/strict';
import { MenuItem, Order } from './models.js';

test('restaurant models expose required operational fields', () => {
  assert.ok(MenuItem.schema.path('variants'));
  assert.ok(MenuItem.schema.path('addOns'));
  assert.ok(Order.schema.path('status').enumValues.includes('preparing'));
  assert.ok(Order.schema.path('status').enumValues.includes('ready'));
});

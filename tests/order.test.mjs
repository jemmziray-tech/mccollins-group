import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrder } from '../lib/order-transaction.ts';
import { normalizeOrderItems, orderOwnerFromSession } from '../lib/order-input.ts';

const product = (id = 'p1', overrides = {}) => ({
  id, name: id, stock: 5, price: 125, isAvailable: true, archivedAt: null, sizes: ['S', 'M'], ...overrides,
});

// A stateful transaction adapter: tests assert orders/stock, not query strings.
function database(products, { onRead, failCreate = false, rollback = true } = {}) {
  const state = { products: structuredClone(products), orders: [] };
  return {
    state,
    async $transaction(run) {
      const before = structuredClone(state);
      const tx = {
        product: {
          async findMany({ where, orderBy }) {
            const rows = structuredClone(state.products.filter(p => where.id.in.includes(p.id) && p.archivedAt === null));
            if (orderBy?.id === 'asc') rows.sort((a, b) => a.id.localeCompare(b.id));
            if (onRead) await onRead();
            return rows;
          },
          async updateMany({ where, data }) {
            const p = state.products.find(p => p.id === where.id);
            if (!p || ('archivedAt' in where && p.archivedAt !== where.archivedAt) ||
                ('isAvailable' in where && p.isAvailable !== where.isAvailable) ||
                ('price' in where && p.price !== where.price) ||
                (typeof where.stock === 'number' && p.stock !== where.stock) ||
                (where.stock?.gte !== undefined && p.stock < where.stock.gte)) return { count: 0 };
            if (data.stock?.decrement !== undefined) p.stock -= data.stock.decrement;
            if (data.isAvailable !== undefined) p.isAvailable = data.isAvailable;
            return { count: 1 };
          },
        },
        order: {
          async create({ data }) {
            if (failCreate) throw new Error('Order insert failed');
            const order = { id: `order-${state.orders.length}`, ...data };
            state.orders.push(order);
            return order;
          },
        },
      };
      try { return await run(tx); }
      catch (error) {
        if (rollback) Object.assign(state, before);
        throw error;
      }
    },
  };
}

test('calculates prices on the server, combines duplicate sizes and preserves distinct sizes', async () => {
  const db = database([product()]);
  const result = await createOrder(db, { userId: 'verified-user', items: [
    { productId: 'p1', quantity: 1, size: 'S', price: 1 },
    { productId: 'p1', quantity: 1, size: 'M' },
    { productId: 'p1', quantity: 1, size: 'S' },
  ] });
  assert.equal(result.calculatedTotal, 375);
  assert.equal(db.state.products[0].stock, 2);
  assert.equal(result.order.userId, 'verified-user');
  assert.deepEqual(result.order.items.create.map(({size, quantity}) => ({size, quantity})), [
    { size: 'S', quantity: 2 }, { size: 'M', quantity: 1 },
  ]);
});

test('two checkouts reading the last unit concurrently produce exactly one order', async () => {
  let reads = 0;
  let release;
  const barrier = new Promise(resolve => { release = resolve; });
  const db = database([product('last', { stock: 1 })], {
    rollback: false, // Losing reservation writes nothing, so no rollback is needed.
    onRead: async () => { if (++reads === 2) release(); await barrier; },
  });
  const request = { items: [{ productId: 'last', quantity: 1 }] };
  const outcomes = await Promise.allSettled([createOrder(db, request), createOrder(db, request)]);
  assert.equal(outcomes.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(outcomes.filter(r => r.status === 'rejected').length, 1);
  assert.equal(db.state.products[0].stock, 0);
  assert.equal(db.state.products[0].isAvailable, false);
  assert.equal(db.state.orders.length, 1);
});

test('rolls back reserved stock if a later item is unavailable or the order insert fails', async () => {
  const db = database([product('a'), product('b', { stock: 0 })]);
  await assert.rejects(createOrder(db, { items: [
    { productId: 'a', quantity: 1 }, { productId: 'b', quantity: 1 },
  ] }));
  assert.equal(db.state.products[0].stock, 5);
  assert.equal(db.state.orders.length, 0);
  const failing = database([product()], { failCreate: true });
  await assert.rejects(createOrder(failing, { items: [{ productId: 'p1', quantity: 1 }] }));
  assert.equal(failing.state.products[0].stock, 5);
});

test('rejects archived, hidden and invalid-size products', async () => {
  for (const overrides of [{ archivedAt: new Date() }, { isAvailable: false }]) {
    const db = database([product('p1', overrides)]);
    await assert.rejects(createOrder(db, { items: [{ productId: 'p1', quantity: 1 }] }));
    assert.equal(db.state.orders.length, 0);
  }
  await assert.rejects(createOrder(database([product()]), { items: [{ productId: 'p1', quantity: 1, size: 'XL' }] }));
});

test('rejects quantity coercion attacks and aggregated quantities above the cap', async () => {
  for (const quantity of [0, -1, null, false, '', ' ', 'NaN', Infinity, 1.5, 101]) {
    assert.throws(() => normalizeOrderItems([{ id: 'p1', quantity }]));
  }
  assert.deepEqual(normalizeOrderItems([{ id: 'p1' }]), [{ productId: 'p1', quantity: 1, size: null }]);
  await assert.rejects(createOrder(database([product()]), { items: [
    { productId: 'p1', quantity: 60 }, { productId: 'p1', quantity: 60 },
  ] }));
});

test('guest email never attaches an order to a registered account', async () => {
  assert.equal(orderOwnerFromSession(null), null);
  assert.equal(orderOwnerFromSession({ user: { id: 'verified-user' } }), 'verified-user');
  assert.throws(() => orderOwnerFromSession({ user: { email: 'someone@example.com' } }));
  const db = database([product()]);
  const result = await createOrder(db, {
    items: [{ productId: 'p1', quantity: 1 }], userEmail: 'victim@example.com',
  });
  assert.equal(result.order.userId, null);
});

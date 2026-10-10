const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');

// Exercise the actual TypeScript modules with controlled HTTP/auth dependencies.
// Uses Node's test runner and the project's existing TypeScript dependency.
function load(file, dependencies = {}, globals = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(source, {
    module, exports: module.exports, crypto, Headers, Response, FormData, ...globals,
    require: (name) => {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error('Unexpected test dependency: ' + name);
    },
  }, { filename: file });
  return module.exports;
}

const { resolveBookingSubmission } = load('lib/booking-submission.ts');
const payload = { eventId: 1, ticketSelections: [{ ticketTypeId: 2, quantity: 1 }], paymentMethod: 'CARD' };

test('unchanged logical submission reuses its UUID, including a copied request', () => {
  const first = resolveBookingSubmission(null, payload);
  assert.match(first.key, /^[0-9a-f-]{36}$/);
  assert.equal(resolveBookingSubmission(first, structuredClone(payload)).key, first.key);
});

for (const [name, changed] of [
  ['event', { ...payload, eventId: 3 }],
  ['tier', { ...payload, ticketSelections: [{ ticketTypeId: 4, quantity: 1 }] }],
  ['quantity', { ...payload, ticketSelections: [{ ticketTypeId: 2, quantity: 2 }] }],
  ['payment method', { ...payload, paymentMethod: 'WALLET' }],
]) {
  test('changing ' + name + ' starts a new logical submission', () => {
    const first = resolveBookingSubmission(null, payload);
    assert.notEqual(resolveBookingSubmission(first, changed).key, first.key);
  });
}

function bookingApi(fetch, refresh = async () => null) {
  const fetcher = load('lib/api/fetcher.ts', {
    '@/lib/api/config': { getApiBaseUrl: () => 'http://gateway.test/api' },
    '@/lib/api/errors': load('lib/api/errors.ts'),
    '@/lib/auth': { refreshAccessTokenWithStoredToken: refresh },
  }, { fetch });
  return load('lib/api/endpoints.ts', {
    '@/lib/api/fetcher': fetcher, '@/lib/api/query': { toQueryString: () => '' },
  }).api;
}

test('booking headers and body survive a 401 token-refresh retry', async () => {
  const requests = [];
  const api = bookingApi(async (url, options) => {
    requests.push({ url, ...options });
    return requests.length === 1 ? new Response('', { status: 401 })
      : Response.json({ bookingId: 10 }, { status: 201 });
  }, async () => 'refreshed-token');
  const submission = resolveBookingSubmission(null, payload);
  assert.equal((await api.bookings.create(payload, 'original-token', submission.key)).bookingId, 10);
  assert.equal(requests.length, 2);
  requests.forEach(request => {
    assert.equal(request.url, 'http://gateway.test/api/booking-service/api/v1/bookings');
    assert.equal(request.headers.get('Idempotency-Key'), submission.key);
    assert.equal(request.headers.get('X-Correlation-ID'), submission.key);
    assert.equal(request.body, JSON.stringify(payload));
  });
  assert.equal(requests[0].headers.get('Authorization'), 'Bearer original-token');
  assert.equal(requests[1].headers.get('Authorization'), 'Bearer refreshed-token');
});

test('manual retry after an uncertain network failure sends the same key/body', async () => {
  const requests = [];
  const api = bookingApi(async (_url, options) => {
    requests.push(options);
    if (requests.length === 1) throw new TypeError('Network connection lost');
    return Response.json({ bookingId: 10 }, { status: 201 });
  });
  let submission = resolveBookingSubmission(null, payload);
  await assert.rejects(api.bookings.create(payload, 'token', submission.key), /Network connection lost/);
  submission = resolveBookingSubmission(submission, structuredClone(payload));
  await api.bookings.create(payload, 'token', submission.key);
  assert.equal(requests[0].headers.get('Idempotency-Key'), requests[1].headers.get('Idempotency-Key'));
  assert.equal(requests[0].body, requests[1].body);
});

test('sold-out tier disables selection; a full selection disables increment', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { TicketTierCard } = load('components/ticket-tier-card.tsx', {
    'react/jsx-runtime': require('react/jsx-runtime'),
    '@/components/icons': { CheckIcon: () => null },
    '@/components/ui/card': { Card: ({ children }) => React.createElement('div', null, children) },
    '@/lib/utils': { formatCurrency: String },
  });
  const tier = { id: '2', name: 'Standard', price: 10, description: '', benefits: [], available: 0 };
  const soldOut = renderToStaticMarkup(React.createElement(TicketTierCard, { tier, quantity: 0, onChange: () => {} }));
  assert.match(soldOut, /Sold out/);
  assert.equal((soldOut.match(/<button[^>]*disabled=""/g) || []).length, 2);
  const atLimit = renderToStaticMarkup(React.createElement(TicketTierCard, {
    tier: { ...tier, available: 2 }, quantity: 2, onChange: () => {},
  }));
  assert.match(atLimit, /aria-label="Increase Standard tickets" disabled=""/);
  assert.equal((atLimit.match(/<button[^>]*disabled=""/g) || []).length, 1);
});

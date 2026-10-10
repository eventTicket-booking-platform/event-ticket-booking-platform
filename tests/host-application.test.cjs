const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { load } = require('./helpers/load.cjs');

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://customer.test' });
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.IS_REACT_ACT_ENVIRONMENT = true;

// React DOM must load after the browser environment is available.
const React = require('react');
const { act } = React;
const { createRoot } = require('react-dom/client');
const jsx = require('react/jsx-runtime');
const config = { getApiBaseUrl: () => 'http://gateway.test/api' };
const { ApiError } = load('lib/api/errors.ts');
const auth = load('lib/auth.ts', { '@/lib/api/config': config }, { window });
const utils = load('lib/utils.ts');
const link = { default: ({ href, children, ...props }) => React.createElement('a', { href, ...props }, children) };
const uiDependencies = { 'react/jsx-runtime': jsx, '@/lib/utils': utils, 'next/link': link };
const buttons = load('components/ui/button.tsx', uiDependencies);
const card = load('components/ui/card.tsx', uiDependencies);
const input = load('components/ui/input.tsx', uiDependencies);
const BASE = 'http://gateway.test/api/user-service/api/v1/host-applications';
let root, container, requests, notices, redirects;

function token(roles = ['user']) {
  return `header.${Buffer.from(JSON.stringify({ sub: 'customer-id', realm_access: { roles } })).toString('base64url')}.signature`;
}

function application(status, extra = {}) {
  return { id: 'application-id', organizationName: 'Existing Org', reason: 'Community events', status,
    rejectionReason: null, ...extra };
}

function response(data, status = 200) {
  return Response.json({ code: status, message: 'Application', data }, { status });
}

function missing() {
  return Response.json({ message: 'Host application not found' }, { status: 404 });
}

beforeEach(() => {
  window.localStorage.clear();
  auth.setStoredAuthSession(token(), 'refresh-token');
  requests = [];
  notices = [];
  redirects = [];
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

async function mount(handler = () => missing(), refresh = async () => null) {
  const fetcher = load('lib/api/fetcher.ts', {
    '@/lib/api/config': config, '@/lib/api/errors': { ApiError },
    '@/lib/auth': { refreshAccessTokenWithStoredToken: refresh },
  }, { fetch: async (url, options) => {
    requests.push({ url, ...options });
    return handler(url, options);
  } });
  const { api } = load('lib/api/endpoints.ts', {
    '@/lib/api/fetcher': fetcher, '@/lib/api/query': { toQueryString: () => '' },
  });
  const router = { replace: (path) => redirects.push(path) };
  const snackbar = Object.fromEntries(['success', 'warning', 'error'].map(variant =>
    [variant, message => notices.push({ variant, message })]));
  const { default: Page } = load('app/become-a-host/page.tsx', {
    react: React, 'react/jsx-runtime': jsx, 'next/navigation': { useRouter: () => router },
    '@/components/ui/button': buttons, '@/components/ui/card': card, '@/components/ui/input': input,
    '@/components/ui/snackbar': { useSnackbar: () => snackbar }, '@/lib/api': { api, ApiError },
    '@/lib/auth': auth,
  }, { process: { env: { NEXT_PUBLIC_HOST_DASHBOARD_URL: 'http://host-dashboard.test/login' } } });
  await act(async () => root.render(React.createElement(Page)));
  return api;
}

async function fill(id, value) {
  const field = container.querySelector(`#${id}`);
  assert.ok(field, `Missing field ${id}`);
  const prototype = id === 'reason' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  await act(async () => {
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(field, value);
    field.dispatchEvent(new window.Event('input', { bubbles: true }));
  });
}

async function submit() {
  const form = container.querySelector('form');
  assert.ok(form);
  await act(async () => form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })));
}

test('no application shows labeled form after authenticated GET /me returns 404', async () => {
  await mount();
  assert.equal(requests[0].url, BASE + '/me');
  assert.equal(requests[0].headers.get('Authorization'), 'Bearer ' + token());
  assert.ok(container.querySelector('label[for="organizationName"]'));
  assert.ok(container.querySelector('label[for="reason"]'));
  assert.match(container.textContent, /Submit Application/);
  assert.equal(notices.length, 0);
});

test('submission sends only organizationName and reason, then displays pending without a form', async () => {
  await mount((_url, options) => options.method === 'POST' ? response(application('PENDING'), 201) : missing());
  await fill('organizationName', '  Local Events  ');
  await fill('reason', '  Bring people together  ');
  await submit();
  const post = requests.find(request => request.method === 'POST');
  assert.equal(post.url, BASE);
  assert.equal(post.headers.get('Authorization'), 'Bearer ' + token());
  assert.deepEqual(JSON.parse(post.body), { organizationName: 'Local Events', reason: 'Bring people together' });
  assert.match(container.textContent, /Host application is under review/);
  assert.equal(container.querySelector('form'), null);
  assert.equal(notices.at(-1).variant, 'success');
});

test('API helper strips caller-supplied identity, role and status fields', async () => {
  const api = await mount((_url, options) => options.method === 'POST' ? response(application('PENDING'), 201) : missing());
  await api.hostApplications.apply({ organizationName: 'Org', reason: 'Events', userId: 'victim',
    email: 'victim@example.test', role: 'admin', status: 'APPROVED' }, token());
  assert.deepEqual(Object.keys(JSON.parse(requests.at(-1).body)).sort(), ['organizationName', 'reason']);
});

test('pending application shows review status and prevents another submission', async () => {
  await mount(() => response(application('PENDING')));
  assert.match(container.textContent, /Host application is under review/);
  assert.equal(container.querySelector('form'), null);
  assert.equal(container.querySelector('button[type="submit"]'), null);
});

test('approved application shows dashboard link and explains renewed login', async () => {
  await mount(() => response(application('APPROVED')));
  assert.match(container.textContent, /Your host application has been approved/);
  assert.equal(container.querySelector('a').href, 'http://host-dashboard.test/login');
  assert.match(container.textContent, /Sign in again/);
  assert.equal(container.querySelector('form'), null);
});

test('rejected application displays rejection reason as text and pre-fills resubmission', async () => {
  await mount(() => response(application('REJECTED', { rejectionReason: '<script>More information</script>' })));
  assert.match(container.textContent, /Application was rejected/);
  assert.match(container.textContent, /<script>More information<\/script>/);
  assert.equal(container.querySelector('script'), null);
  assert.equal(container.querySelector('#organizationName').value, 'Existing Org');
  assert.equal(container.querySelector('#reason').value, 'Community events');
  assert.match(container.textContent, /Apply Again/);
});

test('rejected applicant can edit and resubmit through the same POST endpoint', async () => {
  await mount((_url, options) => response(application(options.method === 'POST' ? 'PENDING' : 'REJECTED')));
  await fill('organizationName', 'Updated Org');
  await submit();
  assert.equal(requests.at(-1).url, BASE);
  assert.deepEqual(JSON.parse(requests.at(-1).body), { organizationName: 'Updated Org', reason: 'Community events' });
  assert.match(container.textContent, /Host application is under review/);
  assert.equal(container.querySelector('form'), null);
});

test('409 warns and reloads current application rather than leaving a duplicate submission form', async () => {
  let reads = 0;
  await mount((_url, options) => options.method === 'POST'
    ? Response.json({ message: 'raw backend error', stackTrace: ['private'] }, { status: 409 })
    : ++reads === 1 ? missing() : response(application('PENDING')));
  await fill('organizationName', 'Org');
  await submit();
  assert.equal(reads, 2);
  assert.match(container.textContent, /Host application is under review/);
  assert.equal(container.querySelector('form'), null);
  assert.ok(notices.some(notice => notice.variant === 'warning' && /already pending or approved/.test(notice.message)));
  assert.ok(notices.every(notice => !notice.message.includes('raw backend error')));
});

test('unauthenticated visitor is redirected without fetching or showing a usable form', async () => {
  auth.clearStoredAuthSession();
  await mount();
  assert.deepEqual(redirects, ['/login']);
  assert.equal(container.querySelector('form'), null);
  assert.equal(requests.length, 0);
});

test('session removed while editing cannot submit', async () => {
  await mount();
  await fill('organizationName', 'Org');
  auth.clearStoredAuthSession();
  await submit();
  assert.deepEqual(redirects, ['/login']);
  assert.equal(requests.filter(request => request.method === 'POST').length, 0);
  assert.equal(container.querySelector('form'), null);
});

for (const role of ['host', 'admin']) {
  test(`${role} accounts see dashboard guidance instead of another application`, async () => {
    auth.setStoredAuthSession(token(['user', role]));
    await mount();
    assert.match(container.textContent, /already has dashboard access/);
    assert.equal(container.querySelector('form'), null);
    assert.equal(requests.length, 0);
  });
}

for (const method of ['GET', 'POST']) {
  test(`unrecoverable 401 on ${method} clears session and redirects to existing login`, async () => {
    await mount((_url, options) => options.method === method ? new Response('', { status: 401 }) : missing());
    if (method === 'POST') {
      await fill('organizationName', 'Org');
      await submit();
    }
    assert.deepEqual(redirects, ['/login']);
    assert.equal(auth.getStoredAccessToken(), null);
    assert.equal(auth.getStoredRefreshToken(), null);
    assert.equal(container.querySelector('form'), null);
  });

  test(`403 on ${method} shows safe authorization message without a submission form`, async () => {
    await mount((_url, options) => options.method === method
      ? Response.json({ message: 'private backend details' }, { status: 403 }) : missing());
    if (method === 'POST') {
      await fill('organizationName', 'Org');
      await submit();
    }
    assert.match(container.textContent, /Only eligible customer accounts/);
    assert.equal(container.querySelector('form'), null);
    assert.ok(notices.every(notice => !notice.message.includes('private backend')));
  });
}

test('400 shows safe validation guidance and preserves entered form for correction', async () => {
  await mount((_url, options) => options.method === 'POST'
    ? Response.json({ message: 'private stack trace' }, { status: 400 }) : missing());
  await fill('organizationName', 'Org');
  await submit();
  assert.match(notices.at(-1).message, /Check the organization name/);
  assert.equal(container.querySelector('#organizationName').value, 'Org');
  assert.equal(container.querySelector('button[type="submit"]').disabled, false);
});

test('POST token-refresh retry preserves the application body and updates bearer token', async () => {
  let posts = 0;
  await mount((_url, options) => options.method !== 'POST' ? missing()
    : ++posts === 1 ? new Response('', { status: 401 }) : response(application('PENDING'), 201), async () => 'fresh-token');
  await fill('organizationName', 'Org');
  await submit();
  const attempts = requests.filter(request => request.method === 'POST');
  assert.equal(attempts.length, 2);
  assert.equal(attempts[0].body, attempts[1].body);
  assert.equal(attempts[1].headers.get('Authorization'), 'Bearer fresh-token');
  assert.match(container.textContent, /Host application is under review/);
});

test('normal customer navigation includes Become a Host in desktop and mobile menus only', async () => {
  const { Navbar } = load('components/navbar.tsx', {
    react: React, 'react/jsx-runtime': jsx, 'next/link': link,
    'next/navigation': { useRouter: () => ({ push() {}, refresh() {} }) },
    '@/components/icons': { MenuIcon: () => null }, '@/components/ui/button': buttons,
    '@/lib/auth': auth, '@/lib/utils': utils,
  });
  await act(async () => root.render(React.createElement(Navbar)));
  assert.equal(container.querySelectorAll('a[href="/become-a-host"]').length, 2);
  for (const roles of [['user', 'host'], ['user', 'admin'], []]) {
    auth.setStoredAccessToken(token(roles));
    await act(async () => root.render(React.createElement(Navbar)));
    assert.equal(container.querySelectorAll('a[href="/become-a-host"]').length, 0);
  }
});

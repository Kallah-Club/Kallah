/* The Kallah Club: shared app code for account.html, course.html and admin.html.
 *
 * The key below is the PUBLIC (publishable) key. It is safe in the browser:
 * every table is protected by Row Level Security in Supabase, so a visitor can
 * only ever read or change the rows the database allows. Never put a
 * service_role / secret key in this file.
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://damndwwdymxtwpjyxnsx.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_T4p_qWd7XMKdjyfgDvSuDg_J8z9ziWq';

  // Preview mode (?preview=1, see preview.js) swaps in sample data that never
  // touches the real database. Otherwise this is the real Supabase client.
  var sb = (window.KCPreview && window.KCPreview.on)
    ? window.KCPreview.client()
    : window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });

  /* ------------------------------------------------------------ DOM helper
   * h('a', {href: '#', class: 'btn', onclick: fn}, 'Text', childNode)
   * Strings always become text nodes, so user data can never inject HTML. */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'dataset') Object.keys(v).forEach(function (d) { el.dataset[d] = v[d]; });
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, String(v));
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, kid) {
    if (kid === null || kid === undefined || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(function (k) { append(el, k); }); return; }
    el.appendChild(typeof kid === 'string' || typeof kid === 'number' ? document.createTextNode(String(kid)) : kid);
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

  /* Static, trusted icon markup (never user data). */
  var ICONS = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.2 4.2L19 7"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
    arrowL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    arrowR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    diamond: '<svg viewBox="0 0 10 10"><path d="M5 0 L10 5 L5 10 L0 5 Z" fill="currentColor"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19.5h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/></svg>'
  };
  function icon(name, cls) {
    var s = document.createElement('span');
    s.className = 'ico' + (cls ? ' ' + cls : '');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = ICONS[name] || '';
    return s;
  }

  /* ------------------------------------------------------------ formatting */
  function parseDateOnly(s) {
    if (!s) return null;
    var p = String(s).split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function fmtDate(v, opts) {
    if (!v) return '';
    var d = /^\d{4}-\d{2}-\d{2}$/.test(v) ? parseDateOnly(v) : new Date(v);
    if (isNaN(d)) return '';
    return d.toLocaleDateString(undefined, opts || { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function daysUntil(dateOnly) {
    var d = parseDateOnly(dateOnly);
    if (!d) return null;
    var t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.round((d - t) / 86400000);
  }
  function relTime(v) {
    if (!v) return 'never';
    var s = (Date.now() - new Date(v).getTime()) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' h ago';
    if (s < 86400 * 30) return Math.floor(s / 86400) + ' d ago';
    return fmtDate(v);
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function firstName(profile) {
    var n = profile && profile.full_name ? profile.full_name.trim() : '';
    return n ? n.split(/\s+/)[0] : '';
  }

  /* ------------------------------------------------------------ rich text
   * Lesson bodies are written by the admin in Markdown (HTML allowed) and are
   * ALWAYS passed through DOMPurify before reaching the page. */
  if (window.DOMPurify && DOMPurify.addHook) {
    DOMPurify.addHook('afterSanitizeAttributes', function (node) {
      if (node.tagName === 'A' && node.getAttribute('href')) {
        var href = node.getAttribute('href');
        if (/^https?:/i.test(href)) { node.setAttribute('target', '_blank'); node.setAttribute('rel', 'noopener noreferrer'); }
      }
    });
  }
  function renderRich(src) {
    // The page already has its own <h1>, so lesson headings start at <h2>.
    src = String(src || '').replace(/^(#{1,5})[ \t]/gm, '#$1 ');
    var html = window.marked ? marked.parse(src, { gfm: true, breaks: true }) : '';
    var clean = DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['style'],
      ADD_ATTR: ['target'],
      RETURN_DOM_FRAGMENT: true
    });
    return clean;
  }

  /* Only YouTube and Vimeo are embedded; any other https link shows as a button. */
  function videoEmbed(url) {
    if (!url) return null;
    var u;
    try { u = new URL(url); } catch (e) { return null; }
    if (u.protocol !== 'https:') return null;
    var host = u.hostname.replace(/^www\.|^m\./, '');
    var src = null, id;
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      id = u.searchParams.get('v') || (u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{6,20})/) || [])[1];
    } else if (host === 'youtu.be') {
      id = (u.pathname.match(/^\/([\w-]{6,20})/) || [])[1];
    }
    if (id && /^[\w-]{6,20}$/.test(id)) src = 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0';
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      var vm = u.pathname.match(/(\d{5,12})/);
      if (vm) src = 'https://player.vimeo.com/video/' + vm[1] + '?dnt=1';
    }
    if (src) {
      return h('div', { class: 'video' },
        h('iframe', { src: src, title: 'Lesson video', loading: 'lazy', allow: 'autoplay; fullscreen; picture-in-picture; encrypted-media', allowfullscreen: true, referrerpolicy: 'strict-origin-when-cross-origin' }));
    }
    return h('a', { class: 'btn line video-link', href: u.href, target: '_blank', rel: 'noopener noreferrer' }, icon('play'), ' Watch the lesson video');
  }

  /* ------------------------------------------------------------ toast */
  var toastTimer;
  function toast(msg, kind) {
    var t = document.getElementById('toast');
    if (!t) { t = h('div', { id: 'toast', class: 'toast', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(t); }
    t.textContent = msg;
    t.className = 'toast show' + (kind ? ' ' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = 'toast'; }, 3600);
  }

  /* ------------------------------------------------------------ auth */
  function pageUrl(name) { return new URL(name, window.location.href).href.split('#')[0]; }

  async function getSession() {
    var r = await sb.auth.getSession();
    return r.data ? r.data.session : null;
  }
  async function getProfile(user) {
    var r = await sb.from('profiles').select('id, email, first_name, last_name, full_name, phone, wedding_date, role, created_at').eq('id', user.id).maybeSingle();
    if (r.error) throw r.error;
    return r.data || { id: user.id, email: user.email, full_name: '', wedding_date: null, role: 'student' };
  }
  /* Sends visitors without a valid session to the log-in page and back afterwards.
   * An error fragment from an email link (#error=...&error_code=otp_expired) is
   * passed along so account.html can show the "Link expired" screen. */
  function toLogin() {
    var here = window.location.pathname.split('/').pop() + window.location.search;
    var frag = /(^|&)error/.test(window.location.hash.slice(1)) ? window.location.hash : '';
    window.location.replace(pageUrl('account.html') + '?next=' + encodeURIComponent(here || 'course.html') + frag);
    return new Promise(function () {});
  }
  async function requireUser() {
    var s = await getSession();
    if (!s) return toLogin();
    // getSession() only reads the stored session; check it with the server so a
    // revoked or deleted account is sent to log in instead of seeing errors.
    var u = await sb.auth.getUser();
    if (u.error || !u.data || !u.data.user) {
      if (u.error && /Failed to fetch|NetworkError/i.test(u.error.message || '')) throw u.error;
      try { await sb.auth.signOut({ scope: 'local' }); } catch (e) {}
      return toLogin();
    }
    return u.data.user;
  }
  /* Reads every row of a query, 1000 at a time (the API's default page limit).
   * build() must return a fresh query with a stable order each time. */
  async function fetchAll(build) {
    var out = [], from = 0, step = 1000;
    for (;;) {
      var r = await build().range(from, from + step - 1);
      if (r.error) throw r.error;
      out = out.concat(r.data || []);
      if (!r.data || r.data.length < step) return out;
      from += step;
    }
  }
  /* A lesson is ready for students when it has text or a video. */
  function hasContent(l) { return !!((l.body && l.body.trim()) || l.video_url); }
  async function signOut() {
    await sb.auth.signOut();
    window.location.href = pageUrl('account.html') + '?signed_out=1';
  }
  /* Only allow redirecting to our own app pages after log in. */
  function safeNext(v) {
    if (!v) return 'course.html';
    return /^(course|admin|account)\.html(\?[\w=&%.-]*)?$/.test(v) ? v : 'course.html';
  }

  /* Top bar shared by course.html and admin.html */
  function topbar(opts) {
    var p = opts.profile || {};
    var links = [
      h('a', { href: 'course.html', 'data-nav': '', class: opts.active === 'course' ? 'on' : null }, 'My course'),
      h('a', { href: 'course.html?view=profile', 'data-nav': '', class: opts.active === 'profile' ? 'on' : null }, 'Profile'),
      h('a', { href: 'library.html', class: opts.active === 'library' ? 'on' : null }, 'Library')
    ];
    if (p.role === 'admin') links.push(h('a', { href: 'admin.html', class: opts.active === 'admin' ? 'on' : null }, 'Dashboard'));
    var initials = ((p.full_name || p.email || '?').trim().split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2) || '?').toUpperCase();
    var bar = h('header', { class: 'topbar' },
      h('div', { class: 'wrap topbar-in' },
        h('a', { class: 'brand', href: 'index.html' }, h('b', null, 'The Kallah'), h('i', null, 'Club')),
        h('nav', { class: 'toplinks', 'aria-label': 'Main' }, links),
        h('div', { class: 'me' },
          h('span', { class: 'avatar', 'aria-hidden': 'true', text: initials }),
          h('button', { class: 'btn line small', type: 'button', onclick: signOut }, 'Log out'))));
    return bar;
  }

  function csvCell(v) {
    var s = v === null || v === undefined ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // stop spreadsheet formula injection
    return '"' + s.replace(/"/g, '""') + '"';
  }
  function downloadCsv(filename, rows) {
    var csv = rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n');
    var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    var a = h('a', { href: URL.createObjectURL(blob), download: filename });
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function progressRing(pct, size) {
    size = size || 132;
    var r = 52, c = 2 * Math.PI * r;
    var wrap = h('div', { class: 'ring', style: 'width:' + size + 'px;height:' + size + 'px', role: 'img', 'aria-label': Math.round(pct) + ' percent complete' });
    wrap.innerHTML = '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="' + r + '" class="ring-bg"/>' +
      '<circle cx="60" cy="60" r="' + r + '" class="ring-fg" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + (c * (1 - pct / 100)).toFixed(2) + '"/></svg>';
    wrap.appendChild(h('div', { class: 'ring-label' }, h('b', null, Math.round(pct) + '%'), h('span', null, 'complete')));
    return wrap;
  }

  function friendlyError(err) {
    var m = (err && (err.message || err.error_description)) || 'Something went wrong. Please try again.';
    if (/Invalid login credentials/i.test(m)) return 'That email and password do not match. Please try again.';
    if (/Email not confirmed/i.test(m)) return 'Please confirm your email first. Check your inbox for the link we sent.';
    if (/User already registered/i.test(m)) return 'An account with this email already exists. Try logging in instead.';
    if (/rate limit/i.test(m)) return 'Too many attempts. Please wait a minute and try again.';
    if (/Password should be/i.test(m)) return 'Please choose a password of at least 8 characters.';
    if (/Failed to fetch|NetworkError/i.test(m)) return 'We could not reach the server. Check your connection and try again.';
    if (/JWT|PGRST30|refresh token|session (not found|missing)/i.test(m)) return 'Your session has ended. Please log in again.';
    return m;
  }

  window.KC = {
    sb: sb, h: h, clear: clear, icon: icon, toast: toast,
    getSession: getSession, getProfile: getProfile, requireUser: requireUser, signOut: signOut,
    safeNext: safeNext, pageUrl: pageUrl, topbar: topbar,
    fmtDate: fmtDate, daysUntil: daysUntil, relTime: relTime, pad2: pad2, firstName: firstName,
    renderRich: renderRich, videoEmbed: videoEmbed, downloadCsv: downloadCsv,
    fetchAll: fetchAll, hasContent: hasContent,
    progressRing: progressRing, friendlyError: friendlyError
  };
})();

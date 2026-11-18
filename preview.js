/* The Kallah Club: preview mode.
 *
 * Open any app page with ?preview=1 to look around without logging in.
 * Everything comes from the SAMPLE data below, kept in this browser tab only.
 * Nothing is read from or written to the real database. ?preview=0 turns it off.
 *
 * app.js calls KCPreview.client() instead of the real Supabase client while
 * preview is on. The real login and database rules are unchanged.
 */
(function () {
  'use strict';

  var KEY = 'kc-preview';
  var qs = new URLSearchParams(window.location.search);
  try {
    if (qs.get('preview') === '1') sessionStorage.setItem(KEY, '1');
    if (qs.get('preview') === '0') sessionStorage.removeItem(KEY);
  } catch (e) {}
  var on = qs.get('preview') === '1';
  try { on = on || sessionStorage.getItem(KEY) === '1'; } catch (e) {}

  if (!on) { window.KCPreview = { on: false }; return; }

  function iso(daysAgo, hour) {
    var d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour || 10, 0, 0, 0);
    return d.toISOString();
  }
  function dateOnly(daysAhead) {
    var d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().slice(0, 10);
  }

  var ME = 'preview-0000-me';
  var LESSONS = [
    [1, 1, 'Foundations', 1, 'Your Course Plan', 'Personal details, wedding timeline, family customs, rabbinic guidance, learning schedule, and reminders.'],
    [2, 1, 'Foundations', 2, 'The Purpose of Marriage', 'The Jewish vision of partnership and creating a home where the physical and spiritual come together.'],
    [3, 1, 'Foundations', 3, 'Adam and Chava', 'Creation, individuality, free choice, and the journey toward becoming one.'],
    [4, 2, 'The Jewish Home', 1, 'Mitzvot and Meaning', 'How mitzvot connect us to Hashem and elevate everyday life.'],
    [5, 2, 'The Jewish Home', 2, 'The Three Mitzvot', 'Challah, Shabbat candles, and family purity, with their practical foundations and deeper meaning.'],
    [6, 2, 'The Jewish Home', 3, 'The Power of a Jewish Woman', 'Your role in shaping the values, atmosphere, and spiritual direction of your home.'],
    [7, 3, 'Family Purity', 1, 'Tumah and Taharah', 'A clear introduction to spiritual transition, potential life, and renewal.'],
    [8, 3, 'Family Purity', 2, 'Your Cycle', 'Hefsek taharah, the seven clean days, bedikot, timing, stains, colors, and when to ask a question.'],
    [9, 3, 'Family Purity', 3, 'Harchakot', 'The practical guidelines for the niddah period at home and while traveling, including family customs.'],
    [10, 4, 'Mikvah and Calendar', 1, 'Mikvah Preparation', 'Chafifah, chatzitzot, immersion, prayer, appointments, and preparation for Shabbat and Yom Tov.'],
    [11, 4, 'Mikvah and Calendar', 2, 'The Jewish Calendar', 'Tracking the cycle, calculating the required onot, using an app, and preparing for separation and mikvah.'],
    [12, 4, 'Mikvah and Calendar', 3, 'Personal Resources', 'Customized dates, reminders, mikvah information, trusted contacts, helpful apps, prayers, and books.']
  ];
  var SAMPLE_BODY = function (title) {
    return '## ' + title + '\n\n*Sample lesson text for the preview. The real lesson will be written by the teacher.*\n\n' +
      'Welcome to this lesson. Take a few quiet minutes, read slowly, and write down any questions you want to ask.\n\n' +
      '### In this lesson\n\n- The main idea, explained simply\n- How it looks in everyday life\n- A short reflection for you to keep\n\n' +
      '> A home is built with wisdom, and with understanding it is established.\n\n' +
      'When you are ready, mark this lesson complete and continue to the next one.';
  };

  var db = {
    lessons: LESSONS.map(function (l) {
      var open = l[0] <= 6;
      return { id: l[0], part: l[1], part_title: l[2], position: l[3], title: l[4], summary: l[5],
        body: open ? SAMPLE_BODY(l[4]) : '', video_url: null, published: true,
        created_at: iso(30), updated_at: iso(2) };
    }),
    profiles: [
      { id: ME, email: 'preview@example.com', full_name: 'Preview Kallah', wedding_date: dateOnly(74), role: 'admin', created_at: iso(30) },
      { id: 's1', email: 'chana.sample@example.com', full_name: 'Chana Levi', wedding_date: dateOnly(41), role: 'student', created_at: iso(21) },
      { id: 's2', email: 'rivka.sample@example.com', full_name: 'Rivka Cohen', wedding_date: dateOnly(96), role: 'student', created_at: iso(18) },
      { id: 's3', email: 'leah.sample@example.com', full_name: 'Leah Mizrahi', wedding_date: dateOnly(23), role: 'student', created_at: iso(12) },
      { id: 's4', email: 'sarah.sample@example.com', full_name: 'Sarah Benhamou', wedding_date: dateOnly(150), role: 'student', created_at: iso(9) },
      { id: 's5', email: 'miriam.sample@example.com', full_name: 'Miriam Azoulay', wedding_date: null, role: 'student', created_at: iso(4) },
      { id: 's6', email: 'esther.sample@example.com', full_name: 'Esther Katz', wedding_date: dateOnly(58), role: 'student', created_at: iso(1) }
    ],
    lesson_progress: [],
    waitlist: [
      'devorah', 'yael', 'tova', 'shira', 'noa', 'batsheva', 'aviva', 'hadassah'
    ].map(function (n, i) { return { id: i + 1, email: n + '.sample@example.com', created_at: iso(i * 2 + 1, 9 + i) }; }),
    announcements: [
      { id: 1, title: 'Welcome to The Kallah Club', body: 'Sample announcement: I am so glad you are here. Start with lesson one and go at your own pace.', published: true, created_at: iso(6) },
      { id: 2, title: 'New lessons this week', body: 'Sample announcement: Part two, The Jewish Home, is now open.', published: true, created_at: iso(2) }
    ]
  };
  // Sample progress: how far each sample student has gotten.
  [[ME, 2], ['s1', 6], ['s2', 3], ['s3', 5], ['s4', 1], ['s5', 0], ['s6', 2]].forEach(function (p, i) {
    for (var l = 1; l <= p[1]; l++) {
      db.lesson_progress.push({ user_id: p[0], lesson_id: l, completed_at: iso(20 - l - i, 11), last_viewed_at: iso(20 - l - i, 11) });
    }
    if (p[1] < 6) db.lesson_progress.push({ user_id: p[0], lesson_id: p[1] + 1, completed_at: null, last_viewed_at: iso(1 + i, 20) });
  });

  var user = { id: ME, email: 'preview@example.com', email_confirmed_at: iso(30), user_metadata: { full_name: 'Preview Kallah' } };
  var session = { user: user, access_token: 'preview', expires_at: 4102444800 };

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function pick(row, cols) {
    if (!cols || cols === '*') return clone(row);
    var out = {};
    cols.split(',').map(function (c) { return c.trim(); }).forEach(function (c) { if (c in row) out[c] = row[c]; });
    return clone(out);
  }
  function nextId(rows) { return rows.reduce(function (m, r) { return typeof r.id === 'number' && r.id > m ? r.id : m; }, 0) + 1; }

  function Query(table) {
    this.table = table; this.op = 'select'; this.cols = '*'; this.filters = [];
    this.orders = []; this.lim = null; this.rng = null; this.mode = 'many'; this.payload = null;
    this.wantRows = false; this.conflict = null;
  }
  Query.prototype.select = function (cols) { if (this.op === 'select') this.cols = cols || '*'; else this.wantRows = true; return this; };
  Query.prototype.eq = function (col, val) { this.filters.push([col, val]); return this; };
  Query.prototype.order = function (col, opts) { this.orders.push([col, !opts || opts.ascending !== false]); return this; };
  Query.prototype.limit = function (n) { this.lim = n; return this; };
  Query.prototype.range = function (a, b) { this.rng = [a, b]; return this; };
  Query.prototype.single = function () { this.mode = 'single'; return this; };
  Query.prototype.maybeSingle = function () { this.mode = 'maybe'; return this; };
  Query.prototype.insert = function (row) { this.op = 'insert'; this.payload = row; return this; };
  Query.prototype.update = function (row) { this.op = 'update'; this.payload = row; return this; };
  Query.prototype.upsert = function (row, opts) { this.op = 'upsert'; this.payload = row; this.conflict = opts && opts.onConflict; return this; };
  Query.prototype['delete'] = function () { this.op = 'delete'; return this; };
  Query.prototype.match = function (rows) {
    var f = this.filters;
    return rows.filter(function (r) { return f.every(function (x) { return String(r[x[0]]) === String(x[1]); }); });
  };
  Query.prototype.run = function () {
    var rows = db[this.table];
    if (!rows) return { data: null, error: { message: 'Not available in preview' } };
    var self = this, out;
    if (this.op === 'select') {
      out = this.match(rows).slice();
      if (this.orders.length) out.sort(function (a, b) {
        for (var i = 0; i < self.orders.length; i++) {
          var c = self.orders[i][0], asc = self.orders[i][1];
          var av = a[c], bv = b[c];
          if (av === bv) continue;
          if (av == null) return 1;
          if (bv == null) return -1;
          return (av < bv ? -1 : 1) * (asc ? 1 : -1);
        }
        return 0;
      });
      if (this.rng) out = out.slice(this.rng[0], this.rng[1] + 1);
      if (this.lim != null) out = out.slice(0, this.lim);
      out = out.map(function (r) { return pick(r, self.cols); });
    } else if (this.op === 'insert') {
      var list = Array.isArray(this.payload) ? this.payload : [this.payload];
      out = list.map(function (p) {
        var r = Object.assign({ id: nextId(rows), created_at: new Date().toISOString() }, clone(p));
        rows.push(r); return clone(r);
      });
    } else if (this.op === 'update') {
      out = this.match(rows).map(function (r) { Object.assign(r, clone(self.payload)); return clone(r); });
    } else if (this.op === 'upsert') {
      var keys = (this.conflict || 'id').split(',').map(function (k) { return k.trim(); });
      out = (Array.isArray(this.payload) ? this.payload : [this.payload]).map(function (p) {
        var hit = rows.filter(function (r) { return keys.every(function (k) { return String(r[k]) === String(p[k]); }); })[0];
        if (hit) { Object.assign(hit, clone(p)); return clone(hit); }
        var r = clone(p); rows.push(r); return clone(r);
      });
    } else if (this.op === 'delete') {
      var gone = this.match(rows);
      db[this.table] = rows.filter(function (r) { return gone.indexOf(r) === -1; });
      out = gone.map(clone);
    }
    if (this.mode === 'single') return out.length === 1 ? { data: out[0], error: null } : { data: null, error: { message: 'Row not found' } };
    if (this.mode === 'maybe') return { data: out[0] || null, error: null };
    return { data: out, error: null };
  };
  Query.prototype.then = function (ok, bad) {
    var self = this;
    return new Promise(function (res) { setTimeout(function () { res(self.run()); }, 120); }).then(ok, bad);
  };

  var client = {
    from: function (t) { return new Query(t); },
    auth: {
      getSession: function () { return Promise.resolve({ data: { session: session }, error: null }); },
      getUser: function () { return Promise.resolve({ data: { user: user }, error: null }); },
      onAuthStateChange: function () { return { data: { subscription: { unsubscribe: function () {} } } }; },
      signOut: function () { try { sessionStorage.removeItem(KEY); } catch (e) {} return Promise.resolve({ error: null }); },
      updateUser: function () { return Promise.resolve({ data: { user: user }, error: null }); },
      signInWithPassword: function () { return Promise.resolve({ data: { session: session, user: user }, error: null }); },
      signUp: function () { return Promise.resolve({ data: { session: null, user: null }, error: { message: 'Sign-up is turned off in preview mode.' } }); },
      resetPasswordForEmail: function () { return Promise.resolve({ data: {}, error: null }); },
      resend: function () { return Promise.resolve({ data: {}, error: null }); }
    }
  };

  function banner() {
    if (document.getElementById('kc-preview-banner')) return;
    var b = document.createElement('div');
    b.id = 'kc-preview-banner';
    b.setAttribute('role', 'note');
    b.style.cssText = 'position:sticky;top:0;z-index:50;display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center;align-items:center;' +
      'padding:9px 16px;background:#5d7184;color:#f7f4f0;font:500 13px Inter,system-ui,sans-serif;letter-spacing:.02em;text-align:center';
    var t = document.createElement('span');
    t.textContent = 'Preview mode: sample data only. Nothing here is real or saved.';
    var a = document.createElement('a');
    a.href = window.location.pathname.split('/').pop() + '?preview=0';
    a.textContent = 'Exit preview';
    a.style.cssText = 'color:#f7f4f0;text-decoration:underline';
    b.appendChild(t); b.appendChild(a);
    document.body.insertBefore(b, document.body.firstChild);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', banner); else banner();

  window.KCPreview = { on: true, client: function () { return client; } };
})();

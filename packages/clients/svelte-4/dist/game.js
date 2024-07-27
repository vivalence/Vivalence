function t() {}
function n(t) {
  return t();
}
function e() {
  return Object.create(null);
}
function o(t) {
  t.forEach(n);
}
function r(t) {
  return "function" == typeof t;
}
function c(t, n) {
  return t != t ? n == n : t !== n || (t && "object" == typeof t) || "function" == typeof t;
}
function u(t, n) {
  t.appendChild(n);
}
function a(t) {
  t.parentNode && t.parentNode.removeChild(t);
}
function f(t) {
  return document.createElement(t);
}
function i(t) {
  return document.createTextNode(t);
}
let s;
function d(t) {
  s = t;
}
const l = [],
  $ = [];
let h = [];
const p = [],
  m = Promise.resolve();
let g = !1;
function _(t) {
  h.push(t);
}
const y = new Set();
let x = 0;
function b() {
  if (0 !== x) return;
  const t = s;
  do {
    try {
      for (; x < l.length; ) {
        const t = l[x];
        x++, d(t), v(t.$$);
      }
    } catch (t) {
      throw ((l.length = 0), (x = 0), t);
    }
    for (d(null), l.length = 0, x = 0; $.length; ) $.pop()();
    for (let t = 0; t < h.length; t += 1) {
      const n = h[t];
      y.has(n) || (y.add(n), n());
    }
    h.length = 0;
  } while (l.length);
  for (; p.length; ) p.pop()();
  (g = !1), y.clear(), d(t);
}
function v(t) {
  if (null !== t.fragment) {
    t.update(), o(t.before_update);
    const n = t.dirty;
    (t.dirty = [-1]), t.fragment && t.fragment.p(t.ctx, n), t.after_update.forEach(_);
  }
}
const w = new Set();
function k(t, n) {
  const e = t.$$;
  null !== e.fragment &&
    (!(function (t) {
      const n = [],
        e = [];
      h.forEach((o) => (-1 === t.indexOf(o) ? n.push(o) : e.push(o))),
        e.forEach((t) => t()),
        (h = n);
    })(e.after_update),
    o(e.on_destroy),
    e.fragment && e.fragment.d(n),
    (e.on_destroy = e.fragment = null),
    (e.ctx = []));
}
function E(t, n) {
  -1 === t.$$.dirty[0] && (l.push(t), g || ((g = !0), m.then(b)), t.$$.dirty.fill(0)),
    (t.$$.dirty[(n / 31) | 0] |= 1 << n % 31);
}
function N(c, u, f, i, l, $, h = null, p = [-1]) {
  const m = s;
  d(c);
  const g = (c.$$ = {
    fragment: null,
    ctx: [],
    props: $,
    update: t,
    not_equal: l,
    bound: e(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(u.context || (m ? m.$$.context : [])),
    callbacks: e(),
    dirty: p,
    skip_bound: !1,
    root: u.target || m.$$.root
  });
  h && h(g.root);
  let y = !1;
  if (
    ((g.ctx = f
      ? f(c, u.props || {}, (t, n, ...e) => {
          const o = e.length ? e[0] : n;
          return (
            g.ctx &&
              l(g.ctx[t], (g.ctx[t] = o)) &&
              (!g.skip_bound && g.bound[t] && g.bound[t](o), y && E(c, t)),
            n
          );
        })
      : []),
    g.update(),
    (y = !0),
    o(g.before_update),
    (g.fragment = !!i && i(g.ctx)),
    u.target)
  ) {
    if (u.hydrate) {
      const t = (function (t) {
        return Array.from(t.childNodes);
      })(u.target);
      g.fragment && g.fragment.l(t), t.forEach(a);
    } else g.fragment && g.fragment.c();
    u.intro && (x = c.$$.fragment) && x.i && (w.delete(x), x.i(v)),
      (function (t, e, c) {
        const { fragment: u, after_update: a } = t.$$;
        u && u.m(e, c),
          _(() => {
            const e = t.$$.on_mount.map(n).filter(r);
            t.$$.on_destroy ? t.$$.on_destroy.push(...e) : o(e), (t.$$.on_mount = []);
          }),
          a.forEach(_);
      })(c, u.target, u.anchor),
      b();
  }
  var x, v;
  d(m);
}
class O {
  $$ = void 0;
  $$set = void 0;
  $destroy() {
    k(this, 1), (this.$destroy = t);
  }
  $on(n, e) {
    if (!r(e)) return t;
    const o = this.$$.callbacks[n] || (this.$$.callbacks[n] = []);
    return (
      o.push(e),
      () => {
        const t = o.indexOf(e);
        -1 !== t && o.splice(t, 1);
      }
    );
  }
  $set(t) {
    var n;
    this.$$set &&
      ((n = t), 0 !== Object.keys(n).length) &&
      ((this.$$.skip_bound = !0), this.$$set(t), (this.$$.skip_bound = !1));
  }
}
function S(n) {
  let e,
    o,
    r,
    c,
    s = n[0].toFixed(2) + "";
  return {
    c() {
      (e = f("div")),
        (o = f("h1")),
        (o.textContent = "Game"),
        (r = i("\n    Game - Score: ")),
        (c = i(s));
    },
    m(t, n) {
      !(function (t, n, e) {
        t.insertBefore(n, e || null);
      })(t, e, n),
        u(e, o),
        u(e, r),
        u(e, c);
    },
    p(t, [n]) {
      1 & n &&
        s !== (s = t[0].toFixed(2) + "") &&
        (function (t, n) {
          (n = "" + n), t.data !== n && (t.data = n);
        })(c, s);
    },
    i: t,
    o: t,
    d(t) {
      t && a(e);
    }
  };
}
function j(t, n, e) {
  let o = 0;
  return (
    setInterval(() => {
      e(0, (o = 100 * Math.random()));
    }, 5e3),
    [o]
  );
}
"undefined" != typeof window &&
  (window.__svelte || (window.__svelte = { v: new Set() })).v.add("4");
class C extends O {
  constructor(t) {
    super(), N(this, t, j, S, c, {});
  }
}
export { C as default };
//# sourceMappingURL=Game.js.map

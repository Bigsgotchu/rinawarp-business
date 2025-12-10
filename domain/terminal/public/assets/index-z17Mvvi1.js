(function () {
  const t = document.createElement('link').relList;
  if (t && t.supports && t.supports('modulepreload')) return;
  for (const h of document.querySelectorAll('link[rel="modulepreload"]')) i(h);
  new MutationObserver((h) => {
    for (const m of h)
      if (m.type === 'childList')
        for (const y of m.addedNodes)
          y.tagName === 'LINK' && y.rel === 'modulepreload' && i(y);
  }).observe(document, { childList: !0, subtree: !0 });
  function r(h) {
    const m = {};
    return (
      h.integrity && (m.integrity = h.integrity),
      h.referrerPolicy && (m.referrerPolicy = h.referrerPolicy),
      h.crossOrigin === 'use-credentials'
        ? (m.credentials = 'include')
        : h.crossOrigin === 'anonymous'
          ? (m.credentials = 'omit')
          : (m.credentials = 'same-origin'),
      m
    );
  }
  function i(h) {
    if (h.ep) return;
    h.ep = !0;
    const m = r(h);
    fetch(h.href, m);
  }
})();
var Wh =
  typeof globalThis < 'u'
    ? globalThis
    : typeof window < 'u'
      ? window
      : typeof global < 'u'
        ? global
        : typeof self < 'u'
          ? self
          : {};
function jh(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, 'default')
    ? e.default
    : e;
}
var Cl = { exports: {} },
  Rs = {},
  bl = { exports: {} },
  Z = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var bi = Symbol.for('react.element'),
  Uh = Symbol.for('react.portal'),
  $h = Symbol.for('react.fragment'),
  Vh = Symbol.for('react.strict_mode'),
  Kh = Symbol.for('react.profiler'),
  qh = Symbol.for('react.provider'),
  Gh = Symbol.for('react.context'),
  Xh = Symbol.for('react.forward_ref'),
  Yh = Symbol.for('react.suspense'),
  Qh = Symbol.for('react.memo'),
  Jh = Symbol.for('react.lazy'),
  ha = Symbol.iterator;
function Zh(e) {
  return e === null || typeof e != 'object'
    ? null
    : ((e = (ha && e[ha]) || e['@@iterator']),
    typeof e == 'function' ? e : null);
}
var xl = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  },
  El = Object.assign,
  kl = {};
function Ar(e, t, r) {
  ((this.props = e),
  (this.context = t),
  (this.refs = kl),
  (this.updater = r || xl));
}
Ar.prototype.isReactComponent = {};
Ar.prototype.setState = function (e, t) {
  if (typeof e != 'object' && typeof e != 'function' && e != null)
    throw Error(
      'setState(...): takes an object of state variables to update or a function which returns an object of state variables.'
    );
  this.updater.enqueueSetState(this, e, t, 'setState');
};
Ar.prototype.forceUpdate = function (e) {
  this.updater.enqueueForceUpdate(this, e, 'forceUpdate');
};
function Ll() {}
Ll.prototype = Ar.prototype;
function mo(e, t, r) {
  ((this.props = e),
  (this.context = t),
  (this.refs = kl),
  (this.updater = r || xl));
}
var vo = (mo.prototype = new Ll());
vo.constructor = mo;
El(vo, Ar.prototype);
vo.isPureReactComponent = !0;
var ua = Array.isArray,
  Dl = Object.prototype.hasOwnProperty,
  go = { current: null },
  Rl = { key: !0, ref: !0, __self: !0, __source: !0 };
function Tl(e, t, r) {
  var i,
    h = {},
    m = null,
    y = null;
  if (t != null)
    for (i in (t.ref !== void 0 && (y = t.ref),
    t.key !== void 0 && (m = '' + t.key),
    t))
      Dl.call(t, i) && !Rl.hasOwnProperty(i) && (h[i] = t[i]);
  var a = arguments.length - 2;
  if (a === 1) h.children = r;
  else if (1 < a) {
    for (var l = Array(a), f = 0; f < a; f++) l[f] = arguments[f + 2];
    h.children = l;
  }
  if (e && e.defaultProps)
    for (i in ((a = e.defaultProps), a)) h[i] === void 0 && (h[i] = a[i]);
  return {
    $$typeof: bi,
    type: e,
    key: m,
    ref: y,
    props: h,
    _owner: go.current,
  };
}
function eu(e, t) {
  return {
    $$typeof: bi,
    type: e.type,
    key: t,
    ref: e.ref,
    props: e.props,
    _owner: e._owner,
  };
}
function So(e) {
  return typeof e == 'object' && e !== null && e.$$typeof === bi;
}
function tu(e) {
  var t = { '=': '=0', ':': '=2' };
  return (
    '$' +
    e.replace(/[=:]/g, function (r) {
      return t[r];
    })
  );
}
var da = /\/+/g;
function Xs(e, t) {
  return typeof e == 'object' && e !== null && e.key != null
    ? tu('' + e.key)
    : t.toString(36);
}
function qi(e, t, r, i, h) {
  var m = typeof e;
  (m === 'undefined' || m === 'boolean') && (e = null);
  var y = !1;
  if (e === null) y = !0;
  else
    switch (m) {
    case 'string':
    case 'number':
      y = !0;
      break;
    case 'object':
      switch (e.$$typeof) {
      case bi:
      case Uh:
        y = !0;
      }
    }
  if (y)
    return (
      (y = e),
      (h = h(y)),
      (e = i === '' ? '.' + Xs(y, 0) : i),
      ua(h)
        ? ((r = ''),
        e != null && (r = e.replace(da, '$&/') + '/'),
        qi(h, t, r, '', function (f) {
          return f;
        }))
        : h != null &&
          (So(h) &&
            (h = eu(
              h,
              r +
                (!h.key || (y && y.key === h.key)
                  ? ''
                  : ('' + h.key).replace(da, '$&/') + '/') +
                e
            )),
          t.push(h)),
      1
    );
  if (((y = 0), (i = i === '' ? '.' : i + ':'), ua(e)))
    for (var a = 0; a < e.length; a++) {
      m = e[a];
      var l = i + Xs(m, a);
      y += qi(m, t, r, l, h);
    }
  else if (((l = Zh(e)), typeof l == 'function'))
    for (e = l.call(e), a = 0; !(m = e.next()).done; )
      ((m = m.value), (l = i + Xs(m, a++)), (y += qi(m, t, r, l, h)));
  else if (m === 'object')
    throw (
      (t = String(e)),
      Error(
        'Objects are not valid as a React child (found: ' +
          (t === '[object Object]'
            ? 'object with keys {' + Object.keys(e).join(', ') + '}'
            : t) +
          '). If you meant to render a collection of children, use an array instead.'
      )
    );
  return y;
}
function Ti(e, t, r) {
  if (e == null) return e;
  var i = [],
    h = 0;
  return (
    qi(e, i, '', '', function (m) {
      return t.call(r, m, h++);
    }),
    i
  );
}
function ru(e) {
  if (e._status === -1) {
    var t = e._result;
    ((t = t()),
    t.then(
      function (r) {
        (e._status === 0 || e._status === -1) &&
            ((e._status = 1), (e._result = r));
      },
      function (r) {
        (e._status === 0 || e._status === -1) &&
            ((e._status = 2), (e._result = r));
      }
    ),
    e._status === -1 && ((e._status = 0), (e._result = t)));
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var Te = { current: null },
  Gi = { transition: null },
  iu = {
    ReactCurrentDispatcher: Te,
    ReactCurrentBatchConfig: Gi,
    ReactCurrentOwner: go,
  };
function Al() {
  throw Error('act(...) is not supported in production builds of React.');
}
Z.Children = {
  map: Ti,
  forEach: function (e, t, r) {
    Ti(
      e,
      function () {
        t.apply(this, arguments);
      },
      r
    );
  },
  count: function (e) {
    var t = 0;
    return (
      Ti(e, function () {
        t++;
      }),
      t
    );
  },
  toArray: function (e) {
    return (
      Ti(e, function (t) {
        return t;
      }) || []
    );
  },
  only: function (e) {
    if (!So(e))
      throw Error(
        'React.Children.only expected to receive a single React element child.'
      );
    return e;
  },
};
Z.Component = Ar;
Z.Fragment = $h;
Z.Profiler = Kh;
Z.PureComponent = mo;
Z.StrictMode = Vh;
Z.Suspense = Yh;
Z.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = iu;
Z.act = Al;
Z.cloneElement = function (e, t, r) {
  if (e == null)
    throw Error(
      'React.cloneElement(...): The argument must be a React element, but you passed ' +
        e +
        '.'
    );
  var i = El({}, e.props),
    h = e.key,
    m = e.ref,
    y = e._owner;
  if (t != null) {
    if (
      (t.ref !== void 0 && ((m = t.ref), (y = go.current)),
      t.key !== void 0 && (h = '' + t.key),
      e.type && e.type.defaultProps)
    )
      var a = e.type.defaultProps;
    for (l in t)
      Dl.call(t, l) &&
        !Rl.hasOwnProperty(l) &&
        (i[l] = t[l] === void 0 && a !== void 0 ? a[l] : t[l]);
  }
  var l = arguments.length - 2;
  if (l === 1) i.children = r;
  else if (1 < l) {
    a = Array(l);
    for (var f = 0; f < l; f++) a[f] = arguments[f + 2];
    i.children = a;
  }
  return { $$typeof: bi, type: e.type, key: h, ref: m, props: i, _owner: y };
};
Z.createContext = function (e) {
  return (
    (e = {
      $$typeof: Gh,
      _currentValue: e,
      _currentValue2: e,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
      _defaultValue: null,
      _globalName: null,
    }),
    (e.Provider = { $$typeof: qh, _context: e }),
    (e.Consumer = e)
  );
};
Z.createElement = Tl;
Z.createFactory = function (e) {
  var t = Tl.bind(null, e);
  return ((t.type = e), t);
};
Z.createRef = function () {
  return { current: null };
};
Z.forwardRef = function (e) {
  return { $$typeof: Xh, render: e };
};
Z.isValidElement = So;
Z.lazy = function (e) {
  return { $$typeof: Jh, _payload: { _status: -1, _result: e }, _init: ru };
};
Z.memo = function (e, t) {
  return { $$typeof: Qh, type: e, compare: t === void 0 ? null : t };
};
Z.startTransition = function (e) {
  var t = Gi.transition;
  Gi.transition = {};
  try {
    e();
  } finally {
    Gi.transition = t;
  }
};
Z.unstable_act = Al;
Z.useCallback = function (e, t) {
  return Te.current.useCallback(e, t);
};
Z.useContext = function (e) {
  return Te.current.useContext(e);
};
Z.useDebugValue = function () {};
Z.useDeferredValue = function (e) {
  return Te.current.useDeferredValue(e);
};
Z.useEffect = function (e, t) {
  return Te.current.useEffect(e, t);
};
Z.useId = function () {
  return Te.current.useId();
};
Z.useImperativeHandle = function (e, t, r) {
  return Te.current.useImperativeHandle(e, t, r);
};
Z.useInsertionEffect = function (e, t) {
  return Te.current.useInsertionEffect(e, t);
};
Z.useLayoutEffect = function (e, t) {
  return Te.current.useLayoutEffect(e, t);
};
Z.useMemo = function (e, t) {
  return Te.current.useMemo(e, t);
};
Z.useReducer = function (e, t, r) {
  return Te.current.useReducer(e, t, r);
};
Z.useRef = function (e) {
  return Te.current.useRef(e);
};
Z.useState = function (e) {
  return Te.current.useState(e);
};
Z.useSyncExternalStore = function (e, t, r) {
  return Te.current.useSyncExternalStore(e, t, r);
};
Z.useTransition = function () {
  return Te.current.useTransition();
};
Z.version = '18.3.1';
bl.exports = Z;
var ie = bl.exports;
const su = jh(ie);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var nu = ie,
  ou = Symbol.for('react.element'),
  au = Symbol.for('react.fragment'),
  lu = Object.prototype.hasOwnProperty,
  cu = nu.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
  hu = { key: !0, ref: !0, __self: !0, __source: !0 };
function Pl(e, t, r) {
  var i,
    h = {},
    m = null,
    y = null;
  (r !== void 0 && (m = '' + r),
  t.key !== void 0 && (m = '' + t.key),
  t.ref !== void 0 && (y = t.ref));
  for (i in t) lu.call(t, i) && !hu.hasOwnProperty(i) && (h[i] = t[i]);
  if (e && e.defaultProps)
    for (i in ((t = e.defaultProps), t)) h[i] === void 0 && (h[i] = t[i]);
  return {
    $$typeof: ou,
    type: e,
    key: m,
    ref: y,
    props: h,
    _owner: cu.current,
  };
}
Rs.Fragment = au;
Rs.jsx = Pl;
Rs.jsxs = Pl;
Cl.exports = Rs;
var K = Cl.exports,
  Cn = {},
  Ml = { exports: {} },
  Ue = {},
  Bl = { exports: {} },
  Ol = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ (function (e) {
  function t(I, E) {
    var R = I.length;
    I.push(E);
    e: for (; 0 < R; ) {
      var D = (R - 1) >>> 1,
        P = I[D];
      if (0 < h(P, E)) ((I[D] = E), (I[R] = P), (R = D));
      else break e;
    }
  }
  function r(I) {
    return I.length === 0 ? null : I[0];
  }
  function i(I) {
    if (I.length === 0) return null;
    var E = I[0],
      R = I.pop();
    if (R !== E) {
      I[0] = R;
      e: for (var D = 0, P = I.length, F = P >>> 1; D < F; ) {
        var U = 2 * (D + 1) - 1,
          Y = I[U],
          z = U + 1,
          M = I[z];
        if (0 > h(Y, R))
          z < P && 0 > h(M, Y)
            ? ((I[D] = M), (I[z] = R), (D = z))
            : ((I[D] = Y), (I[U] = R), (D = U));
        else if (z < P && 0 > h(M, R)) ((I[D] = M), (I[z] = R), (D = z));
        else break e;
      }
    }
    return E;
  }
  function h(I, E) {
    var R = I.sortIndex - E.sortIndex;
    return R !== 0 ? R : I.id - E.id;
  }
  if (typeof performance == 'object' && typeof performance.now == 'function') {
    var m = performance;
    e.unstable_now = function () {
      return m.now();
    };
  } else {
    var y = Date,
      a = y.now();
    e.unstable_now = function () {
      return y.now() - a;
    };
  }
  var l = [],
    f = [],
    g = 1,
    u = null,
    d = 3,
    v = !1,
    w = !1,
    p = !1,
    c = typeof setTimeout == 'function' ? setTimeout : null,
    n = typeof clearTimeout == 'function' ? clearTimeout : null,
    s = typeof setImmediate < 'u' ? setImmediate : null;
  typeof navigator < 'u' &&
    navigator.scheduling !== void 0 &&
    navigator.scheduling.isInputPending !== void 0 &&
    navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function o(I) {
    for (var E = r(f); E !== null; ) {
      if (E.callback === null) i(f);
      else if (E.startTime <= I)
        (i(f), (E.sortIndex = E.expirationTime), t(l, E));
      else break;
      E = r(f);
    }
  }
  function _(I) {
    if (((p = !1), o(I), !w))
      if (r(l) !== null) ((w = !0), $(C));
      else {
        var E = r(f);
        E !== null && G(_, E.startTime - I);
      }
  }
  function C(I, E) {
    ((w = !1), p && ((p = !1), n(S), (S = -1)), (v = !0));
    var R = d;
    try {
      for (
        o(E), u = r(l);
        u !== null && (!(u.expirationTime > E) || (I && !B()));

      ) {
        var D = u.callback;
        if (typeof D == 'function') {
          ((u.callback = null), (d = u.priorityLevel));
          var P = D(u.expirationTime <= E);
          ((E = e.unstable_now()),
          typeof P == 'function' ? (u.callback = P) : u === r(l) && i(l),
          o(E));
        } else i(l);
        u = r(l);
      }
      if (u !== null) var F = !0;
      else {
        var U = r(f);
        (U !== null && G(_, U.startTime - E), (F = !1));
      }
      return F;
    } finally {
      ((u = null), (d = R), (v = !1));
    }
  }
  var b = !1,
    x = null,
    S = -1,
    k = 5,
    T = -1;
  function B() {
    return !(e.unstable_now() - T < k);
  }
  function O() {
    if (x !== null) {
      var I = e.unstable_now();
      T = I;
      var E = !0;
      try {
        E = x(!0, I);
      } finally {
        E ? A() : ((b = !1), (x = null));
      }
    } else b = !1;
  }
  var A;
  if (typeof s == 'function')
    A = function () {
      s(O);
    };
  else if (typeof MessageChannel < 'u') {
    var H = new MessageChannel(),
      W = H.port2;
    ((H.port1.onmessage = O),
    (A = function () {
      W.postMessage(null);
    }));
  } else
    A = function () {
      c(O, 0);
    };
  function $(I) {
    ((x = I), b || ((b = !0), A()));
  }
  function G(I, E) {
    S = c(function () {
      I(e.unstable_now());
    }, E);
  }
  ((e.unstable_IdlePriority = 5),
  (e.unstable_ImmediatePriority = 1),
  (e.unstable_LowPriority = 4),
  (e.unstable_NormalPriority = 3),
  (e.unstable_Profiling = null),
  (e.unstable_UserBlockingPriority = 2),
  (e.unstable_cancelCallback = function (I) {
    I.callback = null;
  }),
  (e.unstable_continueExecution = function () {
    w || v || ((w = !0), $(C));
  }),
  (e.unstable_forceFrameRate = function (I) {
    0 > I || 125 < I
      ? console.error(
        'forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported'
      )
      : (k = 0 < I ? Math.floor(1e3 / I) : 5);
  }),
  (e.unstable_getCurrentPriorityLevel = function () {
    return d;
  }),
  (e.unstable_getFirstCallbackNode = function () {
    return r(l);
  }),
  (e.unstable_next = function (I) {
    switch (d) {
    case 1:
    case 2:
    case 3:
      var E = 3;
      break;
    default:
      E = d;
    }
    var R = d;
    d = E;
    try {
      return I();
    } finally {
      d = R;
    }
  }),
  (e.unstable_pauseExecution = function () {}),
  (e.unstable_requestPaint = function () {}),
  (e.unstable_runWithPriority = function (I, E) {
    switch (I) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      break;
    default:
      I = 3;
    }
    var R = d;
    d = I;
    try {
      return E();
    } finally {
      d = R;
    }
  }),
  (e.unstable_scheduleCallback = function (I, E, R) {
    var D = e.unstable_now();
    switch (
      (typeof R == 'object' && R !== null
        ? ((R = R.delay), (R = typeof R == 'number' && 0 < R ? D + R : D))
        : (R = D),
      I)
    ) {
    case 1:
      var P = -1;
      break;
    case 2:
      P = 250;
      break;
    case 5:
      P = 1073741823;
      break;
    case 4:
      P = 1e4;
      break;
    default:
      P = 5e3;
    }
    return (
      (P = R + P),
      (I = {
        id: g++,
        callback: E,
        priorityLevel: I,
        startTime: R,
        expirationTime: P,
        sortIndex: -1,
      }),
      R > D
        ? ((I.sortIndex = R),
        t(f, I),
        r(l) === null &&
              I === r(f) &&
              (p ? (n(S), (S = -1)) : (p = !0), G(_, R - D)))
        : ((I.sortIndex = P), t(l, I), w || v || ((w = !0), $(C))),
      I
    );
  }),
  (e.unstable_shouldYield = B),
  (e.unstable_wrapCallback = function (I) {
    var E = d;
    return function () {
      var R = d;
      d = E;
      try {
        return I.apply(this, arguments);
      } finally {
        d = R;
      }
    };
  }));
})(Ol);
Bl.exports = Ol;
var uu = Bl.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var du = ie,
  je = uu;
function V(e) {
  for (
    var t = 'https://reactjs.org/docs/error-decoder.html?invariant=' + e, r = 1;
    r < arguments.length;
    r++
  )
    t += '&args[]=' + encodeURIComponent(arguments[r]);
  return (
    'Minified React error #' +
    e +
    '; visit ' +
    t +
    ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings.'
  );
}
var Il = new Set(),
  oi = {};
function rr(e, t) {
  (xr(e, t), xr(e + 'Capture', t));
}
function xr(e, t) {
  for (oi[e] = t, e = 0; e < t.length; e++) Il.add(t[e]);
}
var vt = !(
    typeof window > 'u' ||
    typeof window.document > 'u' ||
    typeof window.document.createElement > 'u'
  ),
  bn = Object.prototype.hasOwnProperty,
  fu =
    /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
  fa = {},
  _a = {};
function _u(e) {
  return bn.call(_a, e)
    ? !0
    : bn.call(fa, e)
      ? !1
      : fu.test(e)
        ? (_a[e] = !0)
        : ((fa[e] = !0), !1);
}
function pu(e, t, r, i) {
  if (r !== null && r.type === 0) return !1;
  switch (typeof t) {
  case 'function':
  case 'symbol':
    return !0;
  case 'boolean':
    return i
      ? !1
      : r !== null
        ? !r.acceptsBooleans
        : ((e = e.toLowerCase().slice(0, 5)), e !== 'data-' && e !== 'aria-');
  default:
    return !1;
  }
}
function mu(e, t, r, i) {
  if (t === null || typeof t > 'u' || pu(e, t, r, i)) return !0;
  if (i) return !1;
  if (r !== null)
    switch (r.type) {
    case 3:
      return !t;
    case 4:
      return t === !1;
    case 5:
      return isNaN(t);
    case 6:
      return isNaN(t) || 1 > t;
    }
  return !1;
}
function Ae(e, t, r, i, h, m, y) {
  ((this.acceptsBooleans = t === 2 || t === 3 || t === 4),
  (this.attributeName = i),
  (this.attributeNamespace = h),
  (this.mustUseProperty = r),
  (this.propertyName = e),
  (this.type = t),
  (this.sanitizeURL = m),
  (this.removeEmptyString = y));
}
var be = {};
'children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style'
  .split(' ')
  .forEach(function (e) {
    be[e] = new Ae(e, 0, !1, e, null, !1, !1);
  });
[
  ['acceptCharset', 'accept-charset'],
  ['className', 'class'],
  ['htmlFor', 'for'],
  ['httpEquiv', 'http-equiv'],
].forEach(function (e) {
  var t = e[0];
  be[t] = new Ae(t, 1, !1, e[1], null, !1, !1);
});
['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(function (e) {
  be[e] = new Ae(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
[
  'autoReverse',
  'externalResourcesRequired',
  'focusable',
  'preserveAlpha',
].forEach(function (e) {
  be[e] = new Ae(e, 2, !1, e, null, !1, !1);
});
'allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope'
  .split(' ')
  .forEach(function (e) {
    be[e] = new Ae(e, 3, !1, e.toLowerCase(), null, !1, !1);
  });
['checked', 'multiple', 'muted', 'selected'].forEach(function (e) {
  be[e] = new Ae(e, 3, !0, e, null, !1, !1);
});
['capture', 'download'].forEach(function (e) {
  be[e] = new Ae(e, 4, !1, e, null, !1, !1);
});
['cols', 'rows', 'size', 'span'].forEach(function (e) {
  be[e] = new Ae(e, 6, !1, e, null, !1, !1);
});
['rowSpan', 'start'].forEach(function (e) {
  be[e] = new Ae(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var yo = /[\-:]([a-z])/g;
function wo(e) {
  return e[1].toUpperCase();
}
'accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height'
  .split(' ')
  .forEach(function (e) {
    var t = e.replace(yo, wo);
    be[t] = new Ae(t, 1, !1, e, null, !1, !1);
  });
'xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type'
  .split(' ')
  .forEach(function (e) {
    var t = e.replace(yo, wo);
    be[t] = new Ae(t, 1, !1, e, 'http://www.w3.org/1999/xlink', !1, !1);
  });
['xml:base', 'xml:lang', 'xml:space'].forEach(function (e) {
  var t = e.replace(yo, wo);
  be[t] = new Ae(t, 1, !1, e, 'http://www.w3.org/XML/1998/namespace', !1, !1);
});
['tabIndex', 'crossOrigin'].forEach(function (e) {
  be[e] = new Ae(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
be.xlinkHref = new Ae(
  'xlinkHref',
  1,
  !1,
  'xlink:href',
  'http://www.w3.org/1999/xlink',
  !0,
  !1
);
['src', 'href', 'action', 'formAction'].forEach(function (e) {
  be[e] = new Ae(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function Co(e, t, r, i) {
  var h = be.hasOwnProperty(t) ? be[t] : null;
  (h !== null
    ? h.type !== 0
    : i ||
      !(2 < t.length) ||
      (t[0] !== 'o' && t[0] !== 'O') ||
      (t[1] !== 'n' && t[1] !== 'N')) &&
    (mu(t, r, h, i) && (r = null),
    i || h === null
      ? _u(t) && (r === null ? e.removeAttribute(t) : e.setAttribute(t, '' + r))
      : h.mustUseProperty
        ? (e[h.propertyName] = r === null ? (h.type === 3 ? !1 : '') : r)
        : ((t = h.attributeName),
        (i = h.attributeNamespace),
        r === null
          ? e.removeAttribute(t)
          : ((h = h.type),
          (r = h === 3 || (h === 4 && r === !0) ? '' : '' + r),
          i ? e.setAttributeNS(i, t, r) : e.setAttribute(t, r))));
}
var wt = du.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  Ai = Symbol.for('react.element'),
  or = Symbol.for('react.portal'),
  ar = Symbol.for('react.fragment'),
  bo = Symbol.for('react.strict_mode'),
  xn = Symbol.for('react.profiler'),
  Hl = Symbol.for('react.provider'),
  Nl = Symbol.for('react.context'),
  xo = Symbol.for('react.forward_ref'),
  En = Symbol.for('react.suspense'),
  kn = Symbol.for('react.suspense_list'),
  Eo = Symbol.for('react.memo'),
  Et = Symbol.for('react.lazy'),
  Fl = Symbol.for('react.offscreen'),
  pa = Symbol.iterator;
function Nr(e) {
  return e === null || typeof e != 'object'
    ? null
    : ((e = (pa && e[pa]) || e['@@iterator']),
    typeof e == 'function' ? e : null);
}
var ue = Object.assign,
  Ys;
function Kr(e) {
  if (Ys === void 0)
    try {
      throw Error();
    } catch (r) {
      var t = r.stack.trim().match(/\n( *(at )?)/);
      Ys = (t && t[1]) || '';
    }
  return (
    `
` +
    Ys +
    e
  );
}
var Qs = !1;
function Js(e, t) {
  if (!e || Qs) return '';
  Qs = !0;
  var r = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (t)
      if (
        ((t = function () {
          throw Error();
        }),
        Object.defineProperty(t.prototype, 'props', {
          set: function () {
            throw Error();
          },
        }),
        typeof Reflect == 'object' && Reflect.construct)
      ) {
        try {
          Reflect.construct(t, []);
        } catch (f) {
          var i = f;
        }
        Reflect.construct(e, [], t);
      } else {
        try {
          t.call();
        } catch (f) {
          i = f;
        }
        e.call(t.prototype);
      }
    else {
      try {
        throw Error();
      } catch (f) {
        i = f;
      }
      e();
    }
  } catch (f) {
    if (f && i && typeof f.stack == 'string') {
      for (
        var h = f.stack.split(`
`),
          m = i.stack.split(`
`),
          y = h.length - 1,
          a = m.length - 1;
        1 <= y && 0 <= a && h[y] !== m[a];

      )
        a--;
      for (; 1 <= y && 0 <= a; y--, a--)
        if (h[y] !== m[a]) {
          if (y !== 1 || a !== 1)
            do
              if ((y--, a--, 0 > a || h[y] !== m[a])) {
                var l =
                  `
` + h[y].replace(' at new ', ' at ');
                return (
                  e.displayName &&
                    l.includes('<anonymous>') &&
                    (l = l.replace('<anonymous>', e.displayName)),
                  l
                );
              }
            while (1 <= y && 0 <= a);
          break;
        }
    }
  } finally {
    ((Qs = !1), (Error.prepareStackTrace = r));
  }
  return (e = e ? e.displayName || e.name : '') ? Kr(e) : '';
}
function vu(e) {
  switch (e.tag) {
  case 5:
    return Kr(e.type);
  case 16:
    return Kr('Lazy');
  case 13:
    return Kr('Suspense');
  case 19:
    return Kr('SuspenseList');
  case 0:
  case 2:
  case 15:
    return ((e = Js(e.type, !1)), e);
  case 11:
    return ((e = Js(e.type.render, !1)), e);
  case 1:
    return ((e = Js(e.type, !0)), e);
  default:
    return '';
  }
}
function Ln(e) {
  if (e == null) return null;
  if (typeof e == 'function') return e.displayName || e.name || null;
  if (typeof e == 'string') return e;
  switch (e) {
  case ar:
    return 'Fragment';
  case or:
    return 'Portal';
  case xn:
    return 'Profiler';
  case bo:
    return 'StrictMode';
  case En:
    return 'Suspense';
  case kn:
    return 'SuspenseList';
  }
  if (typeof e == 'object')
    switch (e.$$typeof) {
    case Nl:
      return (e.displayName || 'Context') + '.Consumer';
    case Hl:
      return (e._context.displayName || 'Context') + '.Provider';
    case xo:
      var t = e.render;
      return (
        (e = e.displayName),
        e ||
            ((e = t.displayName || t.name || ''),
            (e = e !== '' ? 'ForwardRef(' + e + ')' : 'ForwardRef')),
        e
      );
    case Eo:
      return (
        (t = e.displayName || null),
        t !== null ? t : Ln(e.type) || 'Memo'
      );
    case Et:
      ((t = e._payload), (e = e._init));
      try {
        return Ln(e(t));
      } catch {}
    }
  return null;
}
function gu(e) {
  var t = e.type;
  switch (e.tag) {
  case 24:
    return 'Cache';
  case 9:
    return (t.displayName || 'Context') + '.Consumer';
  case 10:
    return (t._context.displayName || 'Context') + '.Provider';
  case 18:
    return 'DehydratedFragment';
  case 11:
    return (
      (e = t.render),
      (e = e.displayName || e.name || ''),
      t.displayName || (e !== '' ? 'ForwardRef(' + e + ')' : 'ForwardRef')
    );
  case 7:
    return 'Fragment';
  case 5:
    return t;
  case 4:
    return 'Portal';
  case 3:
    return 'Root';
  case 6:
    return 'Text';
  case 16:
    return Ln(t);
  case 8:
    return t === bo ? 'StrictMode' : 'Mode';
  case 22:
    return 'Offscreen';
  case 12:
    return 'Profiler';
  case 21:
    return 'Scope';
  case 13:
    return 'Suspense';
  case 19:
    return 'SuspenseList';
  case 25:
    return 'TracingMarker';
  case 1:
  case 0:
  case 17:
  case 2:
  case 14:
  case 15:
    if (typeof t == 'function') return t.displayName || t.name || null;
    if (typeof t == 'string') return t;
  }
  return null;
}
function Ft(e) {
  switch (typeof e) {
  case 'boolean':
  case 'number':
  case 'string':
  case 'undefined':
    return e;
  case 'object':
    return e;
  default:
    return '';
  }
}
function zl(e) {
  var t = e.type;
  return (
    (e = e.nodeName) &&
    e.toLowerCase() === 'input' &&
    (t === 'checkbox' || t === 'radio')
  );
}
function Su(e) {
  var t = zl(e) ? 'checked' : 'value',
    r = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
    i = '' + e[t];
  if (
    !e.hasOwnProperty(t) &&
    typeof r < 'u' &&
    typeof r.get == 'function' &&
    typeof r.set == 'function'
  ) {
    var h = r.get,
      m = r.set;
    return (
      Object.defineProperty(e, t, {
        configurable: !0,
        get: function () {
          return h.call(this);
        },
        set: function (y) {
          ((i = '' + y), m.call(this, y));
        },
      }),
      Object.defineProperty(e, t, { enumerable: r.enumerable }),
      {
        getValue: function () {
          return i;
        },
        setValue: function (y) {
          i = '' + y;
        },
        stopTracking: function () {
          ((e._valueTracker = null), delete e[t]);
        },
      }
    );
  }
}
function Pi(e) {
  e._valueTracker || (e._valueTracker = Su(e));
}
function Wl(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var r = t.getValue(),
    i = '';
  return (
    e && (i = zl(e) ? (e.checked ? 'true' : 'false') : e.value),
    (e = i),
    e !== r ? (t.setValue(e), !0) : !1
  );
}
function ns(e) {
  if (((e = e || (typeof document < 'u' ? document : void 0)), typeof e > 'u'))
    return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function Dn(e, t) {
  var r = t.checked;
  return ue({}, t, {
    defaultChecked: void 0,
    defaultValue: void 0,
    value: void 0,
    checked: r ?? e._wrapperState.initialChecked,
  });
}
function ma(e, t) {
  var r = t.defaultValue == null ? '' : t.defaultValue,
    i = t.checked != null ? t.checked : t.defaultChecked;
  ((r = Ft(t.value != null ? t.value : r)),
  (e._wrapperState = {
    initialChecked: i,
    initialValue: r,
    controlled:
        t.type === 'checkbox' || t.type === 'radio'
          ? t.checked != null
          : t.value != null,
  }));
}
function jl(e, t) {
  ((t = t.checked), t != null && Co(e, 'checked', t, !1));
}
function Rn(e, t) {
  jl(e, t);
  var r = Ft(t.value),
    i = t.type;
  if (r != null)
    i === 'number'
      ? ((r === 0 && e.value === '') || e.value != r) && (e.value = '' + r)
      : e.value !== '' + r && (e.value = '' + r);
  else if (i === 'submit' || i === 'reset') {
    e.removeAttribute('value');
    return;
  }
  (t.hasOwnProperty('value')
    ? Tn(e, t.type, r)
    : t.hasOwnProperty('defaultValue') && Tn(e, t.type, Ft(t.defaultValue)),
  t.checked == null &&
      t.defaultChecked != null &&
      (e.defaultChecked = !!t.defaultChecked));
}
function va(e, t, r) {
  if (t.hasOwnProperty('value') || t.hasOwnProperty('defaultValue')) {
    var i = t.type;
    if (
      !(
        (i !== 'submit' && i !== 'reset') ||
        (t.value !== void 0 && t.value !== null)
      )
    )
      return;
    ((t = '' + e._wrapperState.initialValue),
    r || t === e.value || (e.value = t),
    (e.defaultValue = t));
  }
  ((r = e.name),
  r !== '' && (e.name = ''),
  (e.defaultChecked = !!e._wrapperState.initialChecked),
  r !== '' && (e.name = r));
}
function Tn(e, t, r) {
  (t !== 'number' || ns(e.ownerDocument) !== e) &&
    (r == null
      ? (e.defaultValue = '' + e._wrapperState.initialValue)
      : e.defaultValue !== '' + r && (e.defaultValue = '' + r));
}
var qr = Array.isArray;
function gr(e, t, r, i) {
  if (((e = e.options), t)) {
    t = {};
    for (var h = 0; h < r.length; h++) t['$' + r[h]] = !0;
    for (r = 0; r < e.length; r++)
      ((h = t.hasOwnProperty('$' + e[r].value)),
      e[r].selected !== h && (e[r].selected = h),
      h && i && (e[r].defaultSelected = !0));
  } else {
    for (r = '' + Ft(r), t = null, h = 0; h < e.length; h++) {
      if (e[h].value === r) {
        ((e[h].selected = !0), i && (e[h].defaultSelected = !0));
        return;
      }
      t !== null || e[h].disabled || (t = e[h]);
    }
    t !== null && (t.selected = !0);
  }
}
function An(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(V(91));
  return ue({}, t, {
    value: void 0,
    defaultValue: void 0,
    children: '' + e._wrapperState.initialValue,
  });
}
function ga(e, t) {
  var r = t.value;
  if (r == null) {
    if (((r = t.children), (t = t.defaultValue), r != null)) {
      if (t != null) throw Error(V(92));
      if (qr(r)) {
        if (1 < r.length) throw Error(V(93));
        r = r[0];
      }
      t = r;
    }
    (t == null && (t = ''), (r = t));
  }
  e._wrapperState = { initialValue: Ft(r) };
}
function Ul(e, t) {
  var r = Ft(t.value),
    i = Ft(t.defaultValue);
  (r != null &&
    ((r = '' + r),
    r !== e.value && (e.value = r),
    t.defaultValue == null && e.defaultValue !== r && (e.defaultValue = r)),
  i != null && (e.defaultValue = '' + i));
}
function Sa(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== '' && t !== null && (e.value = t);
}
function $l(e) {
  switch (e) {
  case 'svg':
    return 'http://www.w3.org/2000/svg';
  case 'math':
    return 'http://www.w3.org/1998/Math/MathML';
  default:
    return 'http://www.w3.org/1999/xhtml';
  }
}
function Pn(e, t) {
  return e == null || e === 'http://www.w3.org/1999/xhtml'
    ? $l(t)
    : e === 'http://www.w3.org/2000/svg' && t === 'foreignObject'
      ? 'http://www.w3.org/1999/xhtml'
      : e;
}
var Mi,
  Vl = (function (e) {
    return typeof MSApp < 'u' && MSApp.execUnsafeLocalFunction
      ? function (t, r, i, h) {
        MSApp.execUnsafeLocalFunction(function () {
          return e(t, r, i, h);
        });
      }
      : e;
  })(function (e, t) {
    if (e.namespaceURI !== 'http://www.w3.org/2000/svg' || 'innerHTML' in e)
      e.innerHTML = t;
    else {
      for (
        Mi = Mi || document.createElement('div'),
        Mi.innerHTML = '<svg>' + t.valueOf().toString() + '</svg>',
        t = Mi.firstChild;
        e.firstChild;

      )
        e.removeChild(e.firstChild);
      for (; t.firstChild; ) e.appendChild(t.firstChild);
    }
  });
function ai(e, t) {
  if (t) {
    var r = e.firstChild;
    if (r && r === e.lastChild && r.nodeType === 3) {
      r.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var Qr = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0,
  },
  yu = ['Webkit', 'ms', 'Moz', 'O'];
Object.keys(Qr).forEach(function (e) {
  yu.forEach(function (t) {
    ((t = t + e.charAt(0).toUpperCase() + e.substring(1)), (Qr[t] = Qr[e]));
  });
});
function Kl(e, t, r) {
  return t == null || typeof t == 'boolean' || t === ''
    ? ''
    : r || typeof t != 'number' || t === 0 || (Qr.hasOwnProperty(e) && Qr[e])
      ? ('' + t).trim()
      : t + 'px';
}
function ql(e, t) {
  e = e.style;
  for (var r in t)
    if (t.hasOwnProperty(r)) {
      var i = r.indexOf('--') === 0,
        h = Kl(r, t[r], i);
      (r === 'float' && (r = 'cssFloat'), i ? e.setProperty(r, h) : (e[r] = h));
    }
}
var wu = ue(
  { menuitem: !0 },
  {
    area: !0,
    base: !0,
    br: !0,
    col: !0,
    embed: !0,
    hr: !0,
    img: !0,
    input: !0,
    keygen: !0,
    link: !0,
    meta: !0,
    param: !0,
    source: !0,
    track: !0,
    wbr: !0,
  }
);
function Mn(e, t) {
  if (t) {
    if (wu[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
      throw Error(V(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(V(60));
      if (
        typeof t.dangerouslySetInnerHTML != 'object' ||
        !('__html' in t.dangerouslySetInnerHTML)
      )
        throw Error(V(61));
    }
    if (t.style != null && typeof t.style != 'object') throw Error(V(62));
  }
}
function Bn(e, t) {
  if (e.indexOf('-') === -1) return typeof t.is == 'string';
  switch (e) {
  case 'annotation-xml':
  case 'color-profile':
  case 'font-face':
  case 'font-face-src':
  case 'font-face-uri':
  case 'font-face-format':
  case 'font-face-name':
  case 'missing-glyph':
    return !1;
  default:
    return !0;
  }
}
var On = null;
function ko(e) {
  return (
    (e = e.target || e.srcElement || window),
    e.correspondingUseElement && (e = e.correspondingUseElement),
    e.nodeType === 3 ? e.parentNode : e
  );
}
var In = null,
  Sr = null,
  yr = null;
function ya(e) {
  if ((e = ki(e))) {
    if (typeof In != 'function') throw Error(V(280));
    var t = e.stateNode;
    t && ((t = Bs(t)), In(e.stateNode, e.type, t));
  }
}
function Gl(e) {
  Sr ? (yr ? yr.push(e) : (yr = [e])) : (Sr = e);
}
function Xl() {
  if (Sr) {
    var e = Sr,
      t = yr;
    if (((yr = Sr = null), ya(e), t)) for (e = 0; e < t.length; e++) ya(t[e]);
  }
}
function Yl(e, t) {
  return e(t);
}
function Ql() {}
var Zs = !1;
function Jl(e, t, r) {
  if (Zs) return e(t, r);
  Zs = !0;
  try {
    return Yl(e, t, r);
  } finally {
    ((Zs = !1), (Sr !== null || yr !== null) && (Ql(), Xl()));
  }
}
function li(e, t) {
  var r = e.stateNode;
  if (r === null) return null;
  var i = Bs(r);
  if (i === null) return null;
  r = i[t];
  e: switch (t) {
  case 'onClick':
  case 'onClickCapture':
  case 'onDoubleClick':
  case 'onDoubleClickCapture':
  case 'onMouseDown':
  case 'onMouseDownCapture':
  case 'onMouseMove':
  case 'onMouseMoveCapture':
  case 'onMouseUp':
  case 'onMouseUpCapture':
  case 'onMouseEnter':
    ((i = !i.disabled) ||
        ((e = e.type),
        (i = !(
          e === 'button' ||
          e === 'input' ||
          e === 'select' ||
          e === 'textarea'
        ))),
    (e = !i));
    break e;
  default:
    e = !1;
  }
  if (e) return null;
  if (r && typeof r != 'function') throw Error(V(231, t, typeof r));
  return r;
}
var Hn = !1;
if (vt)
  try {
    var Fr = {};
    (Object.defineProperty(Fr, 'passive', {
      get: function () {
        Hn = !0;
      },
    }),
    window.addEventListener('test', Fr, Fr),
    window.removeEventListener('test', Fr, Fr));
  } catch {
    Hn = !1;
  }
function Cu(e, t, r, i, h, m, y, a, l) {
  var f = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(r, f);
  } catch (g) {
    this.onError(g);
  }
}
var Jr = !1,
  os = null,
  as = !1,
  Nn = null,
  bu = {
    onError: function (e) {
      ((Jr = !0), (os = e));
    },
  };
function xu(e, t, r, i, h, m, y, a, l) {
  ((Jr = !1), (os = null), Cu.apply(bu, arguments));
}
function Eu(e, t, r, i, h, m, y, a, l) {
  if ((xu.apply(this, arguments), Jr)) {
    if (Jr) {
      var f = os;
      ((Jr = !1), (os = null));
    } else throw Error(V(198));
    as || ((as = !0), (Nn = f));
  }
}
function ir(e) {
  var t = e,
    r = e;
  if (e.alternate) for (; t.return; ) t = t.return;
  else {
    e = t;
    do ((t = e), t.flags & 4098 && (r = t.return), (e = t.return));
    while (e);
  }
  return t.tag === 3 ? r : null;
}
function Zl(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (
      (t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)),
      t !== null)
    )
      return t.dehydrated;
  }
  return null;
}
function wa(e) {
  if (ir(e) !== e) throw Error(V(188));
}
function ku(e) {
  var t = e.alternate;
  if (!t) {
    if (((t = ir(e)), t === null)) throw Error(V(188));
    return t !== e ? null : e;
  }
  for (var r = e, i = t; ; ) {
    var h = r.return;
    if (h === null) break;
    var m = h.alternate;
    if (m === null) {
      if (((i = h.return), i !== null)) {
        r = i;
        continue;
      }
      break;
    }
    if (h.child === m.child) {
      for (m = h.child; m; ) {
        if (m === r) return (wa(h), e);
        if (m === i) return (wa(h), t);
        m = m.sibling;
      }
      throw Error(V(188));
    }
    if (r.return !== i.return) ((r = h), (i = m));
    else {
      for (var y = !1, a = h.child; a; ) {
        if (a === r) {
          ((y = !0), (r = h), (i = m));
          break;
        }
        if (a === i) {
          ((y = !0), (i = h), (r = m));
          break;
        }
        a = a.sibling;
      }
      if (!y) {
        for (a = m.child; a; ) {
          if (a === r) {
            ((y = !0), (r = m), (i = h));
            break;
          }
          if (a === i) {
            ((y = !0), (i = m), (r = h));
            break;
          }
          a = a.sibling;
        }
        if (!y) throw Error(V(189));
      }
    }
    if (r.alternate !== i) throw Error(V(190));
  }
  if (r.tag !== 3) throw Error(V(188));
  return r.stateNode.current === r ? e : t;
}
function ec(e) {
  return ((e = ku(e)), e !== null ? tc(e) : null);
}
function tc(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = tc(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var rc = je.unstable_scheduleCallback,
  Ca = je.unstable_cancelCallback,
  Lu = je.unstable_shouldYield,
  Du = je.unstable_requestPaint,
  pe = je.unstable_now,
  Ru = je.unstable_getCurrentPriorityLevel,
  Lo = je.unstable_ImmediatePriority,
  ic = je.unstable_UserBlockingPriority,
  ls = je.unstable_NormalPriority,
  Tu = je.unstable_LowPriority,
  sc = je.unstable_IdlePriority,
  Ts = null,
  ht = null;
function Au(e) {
  if (ht && typeof ht.onCommitFiberRoot == 'function')
    try {
      ht.onCommitFiberRoot(Ts, e, void 0, (e.current.flags & 128) === 128);
    } catch {}
}
var it = Math.clz32 ? Math.clz32 : Bu,
  Pu = Math.log,
  Mu = Math.LN2;
function Bu(e) {
  return ((e >>>= 0), e === 0 ? 32 : (31 - ((Pu(e) / Mu) | 0)) | 0);
}
var Bi = 64,
  Oi = 4194304;
function Gr(e) {
  switch (e & -e) {
  case 1:
    return 1;
  case 2:
    return 2;
  case 4:
    return 4;
  case 8:
    return 8;
  case 16:
    return 16;
  case 32:
    return 32;
  case 64:
  case 128:
  case 256:
  case 512:
  case 1024:
  case 2048:
  case 4096:
  case 8192:
  case 16384:
  case 32768:
  case 65536:
  case 131072:
  case 262144:
  case 524288:
  case 1048576:
  case 2097152:
    return e & 4194240;
  case 4194304:
  case 8388608:
  case 16777216:
  case 33554432:
  case 67108864:
    return e & 130023424;
  case 134217728:
    return 134217728;
  case 268435456:
    return 268435456;
  case 536870912:
    return 536870912;
  case 1073741824:
    return 1073741824;
  default:
    return e;
  }
}
function cs(e, t) {
  var r = e.pendingLanes;
  if (r === 0) return 0;
  var i = 0,
    h = e.suspendedLanes,
    m = e.pingedLanes,
    y = r & 268435455;
  if (y !== 0) {
    var a = y & ~h;
    a !== 0 ? (i = Gr(a)) : ((m &= y), m !== 0 && (i = Gr(m)));
  } else ((y = r & ~h), y !== 0 ? (i = Gr(y)) : m !== 0 && (i = Gr(m)));
  if (i === 0) return 0;
  if (
    t !== 0 &&
    t !== i &&
    !(t & h) &&
    ((h = i & -i), (m = t & -t), h >= m || (h === 16 && (m & 4194240) !== 0))
  )
    return t;
  if ((i & 4 && (i |= r & 16), (t = e.entangledLanes), t !== 0))
    for (e = e.entanglements, t &= i; 0 < t; )
      ((r = 31 - it(t)), (h = 1 << r), (i |= e[r]), (t &= ~h));
  return i;
}
function Ou(e, t) {
  switch (e) {
  case 1:
  case 2:
  case 4:
    return t + 250;
  case 8:
  case 16:
  case 32:
  case 64:
  case 128:
  case 256:
  case 512:
  case 1024:
  case 2048:
  case 4096:
  case 8192:
  case 16384:
  case 32768:
  case 65536:
  case 131072:
  case 262144:
  case 524288:
  case 1048576:
  case 2097152:
    return t + 5e3;
  case 4194304:
  case 8388608:
  case 16777216:
  case 33554432:
  case 67108864:
    return -1;
  case 134217728:
  case 268435456:
  case 536870912:
  case 1073741824:
    return -1;
  default:
    return -1;
  }
}
function Iu(e, t) {
  for (
    var r = e.suspendedLanes,
      i = e.pingedLanes,
      h = e.expirationTimes,
      m = e.pendingLanes;
    0 < m;

  ) {
    var y = 31 - it(m),
      a = 1 << y,
      l = h[y];
    (l === -1
      ? (!(a & r) || a & i) && (h[y] = Ou(a, t))
      : l <= t && (e.expiredLanes |= a),
    (m &= ~a));
  }
}
function Fn(e) {
  return (
    (e = e.pendingLanes & -1073741825),
    e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
  );
}
function nc() {
  var e = Bi;
  return ((Bi <<= 1), !(Bi & 4194240) && (Bi = 64), e);
}
function en(e) {
  for (var t = [], r = 0; 31 > r; r++) t.push(e);
  return t;
}
function xi(e, t, r) {
  ((e.pendingLanes |= t),
  t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
  (e = e.eventTimes),
  (t = 31 - it(t)),
  (e[t] = r));
}
function Hu(e, t) {
  var r = e.pendingLanes & ~t;
  ((e.pendingLanes = t),
  (e.suspendedLanes = 0),
  (e.pingedLanes = 0),
  (e.expiredLanes &= t),
  (e.mutableReadLanes &= t),
  (e.entangledLanes &= t),
  (t = e.entanglements));
  var i = e.eventTimes;
  for (e = e.expirationTimes; 0 < r; ) {
    var h = 31 - it(r),
      m = 1 << h;
    ((t[h] = 0), (i[h] = -1), (e[h] = -1), (r &= ~m));
  }
}
function Do(e, t) {
  var r = (e.entangledLanes |= t);
  for (e = e.entanglements; r; ) {
    var i = 31 - it(r),
      h = 1 << i;
    ((h & t) | (e[i] & t) && (e[i] |= t), (r &= ~h));
  }
}
var re = 0;
function oc(e) {
  return (
    (e &= -e),
    1 < e ? (4 < e ? (e & 268435455 ? 16 : 536870912) : 4) : 1
  );
}
var ac,
  Ro,
  lc,
  cc,
  hc,
  zn = !1,
  Ii = [],
  At = null,
  Pt = null,
  Mt = null,
  ci = new Map(),
  hi = new Map(),
  Lt = [],
  Nu =
    'mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit'.split(
      ' '
    );
function ba(e, t) {
  switch (e) {
  case 'focusin':
  case 'focusout':
    At = null;
    break;
  case 'dragenter':
  case 'dragleave':
    Pt = null;
    break;
  case 'mouseover':
  case 'mouseout':
    Mt = null;
    break;
  case 'pointerover':
  case 'pointerout':
    ci.delete(t.pointerId);
    break;
  case 'gotpointercapture':
  case 'lostpointercapture':
    hi.delete(t.pointerId);
  }
}
function zr(e, t, r, i, h, m) {
  return e === null || e.nativeEvent !== m
    ? ((e = {
      blockedOn: t,
      domEventName: r,
      eventSystemFlags: i,
      nativeEvent: m,
      targetContainers: [h],
    }),
    t !== null && ((t = ki(t)), t !== null && Ro(t)),
    e)
    : ((e.eventSystemFlags |= i),
    (t = e.targetContainers),
    h !== null && t.indexOf(h) === -1 && t.push(h),
    e);
}
function Fu(e, t, r, i, h) {
  switch (t) {
  case 'focusin':
    return ((At = zr(At, e, t, r, i, h)), !0);
  case 'dragenter':
    return ((Pt = zr(Pt, e, t, r, i, h)), !0);
  case 'mouseover':
    return ((Mt = zr(Mt, e, t, r, i, h)), !0);
  case 'pointerover':
    var m = h.pointerId;
    return (ci.set(m, zr(ci.get(m) || null, e, t, r, i, h)), !0);
  case 'gotpointercapture':
    return (
      (m = h.pointerId),
      hi.set(m, zr(hi.get(m) || null, e, t, r, i, h)),
      !0
    );
  }
  return !1;
}
function uc(e) {
  var t = Kt(e.target);
  if (t !== null) {
    var r = ir(t);
    if (r !== null) {
      if (((t = r.tag), t === 13)) {
        if (((t = Zl(r)), t !== null)) {
          ((e.blockedOn = t),
          hc(e.priority, function () {
            lc(r);
          }));
          return;
        }
      } else if (t === 3 && r.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = r.tag === 3 ? r.stateNode.containerInfo : null;
        return;
      }
    }
  }
  e.blockedOn = null;
}
function Xi(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var r = Wn(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (r === null) {
      r = e.nativeEvent;
      var i = new r.constructor(r.type, r);
      ((On = i), r.target.dispatchEvent(i), (On = null));
    } else return ((t = ki(r)), t !== null && Ro(t), (e.blockedOn = r), !1);
    t.shift();
  }
  return !0;
}
function xa(e, t, r) {
  Xi(e) && r.delete(t);
}
function zu() {
  ((zn = !1),
  At !== null && Xi(At) && (At = null),
  Pt !== null && Xi(Pt) && (Pt = null),
  Mt !== null && Xi(Mt) && (Mt = null),
  ci.forEach(xa),
  hi.forEach(xa));
}
function Wr(e, t) {
  e.blockedOn === t &&
    ((e.blockedOn = null),
    zn ||
      ((zn = !0),
      je.unstable_scheduleCallback(je.unstable_NormalPriority, zu)));
}
function ui(e) {
  function t(h) {
    return Wr(h, e);
  }
  if (0 < Ii.length) {
    Wr(Ii[0], e);
    for (var r = 1; r < Ii.length; r++) {
      var i = Ii[r];
      i.blockedOn === e && (i.blockedOn = null);
    }
  }
  for (
    At !== null && Wr(At, e),
    Pt !== null && Wr(Pt, e),
    Mt !== null && Wr(Mt, e),
    ci.forEach(t),
    hi.forEach(t),
    r = 0;
    r < Lt.length;
    r++
  )
    ((i = Lt[r]), i.blockedOn === e && (i.blockedOn = null));
  for (; 0 < Lt.length && ((r = Lt[0]), r.blockedOn === null); )
    (uc(r), r.blockedOn === null && Lt.shift());
}
var wr = wt.ReactCurrentBatchConfig,
  hs = !0;
function Wu(e, t, r, i) {
  var h = re,
    m = wr.transition;
  wr.transition = null;
  try {
    ((re = 1), To(e, t, r, i));
  } finally {
    ((re = h), (wr.transition = m));
  }
}
function ju(e, t, r, i) {
  var h = re,
    m = wr.transition;
  wr.transition = null;
  try {
    ((re = 4), To(e, t, r, i));
  } finally {
    ((re = h), (wr.transition = m));
  }
}
function To(e, t, r, i) {
  if (hs) {
    var h = Wn(e, t, r, i);
    if (h === null) (un(e, t, i, us, r), ba(e, i));
    else if (Fu(h, e, t, r, i)) i.stopPropagation();
    else if ((ba(e, i), t & 4 && -1 < Nu.indexOf(e))) {
      for (; h !== null; ) {
        var m = ki(h);
        if (
          (m !== null && ac(m),
          (m = Wn(e, t, r, i)),
          m === null && un(e, t, i, us, r),
          m === h)
        )
          break;
        h = m;
      }
      h !== null && i.stopPropagation();
    } else un(e, t, i, null, r);
  }
}
var us = null;
function Wn(e, t, r, i) {
  if (((us = null), (e = ko(i)), (e = Kt(e)), e !== null))
    if (((t = ir(e)), t === null)) e = null;
    else if (((r = t.tag), r === 13)) {
      if (((e = Zl(t)), e !== null)) return e;
      e = null;
    } else if (r === 3) {
      if (t.stateNode.current.memoizedState.isDehydrated)
        return t.tag === 3 ? t.stateNode.containerInfo : null;
      e = null;
    } else t !== e && (e = null);
  return ((us = e), null);
}
function dc(e) {
  switch (e) {
  case 'cancel':
  case 'click':
  case 'close':
  case 'contextmenu':
  case 'copy':
  case 'cut':
  case 'auxclick':
  case 'dblclick':
  case 'dragend':
  case 'dragstart':
  case 'drop':
  case 'focusin':
  case 'focusout':
  case 'input':
  case 'invalid':
  case 'keydown':
  case 'keypress':
  case 'keyup':
  case 'mousedown':
  case 'mouseup':
  case 'paste':
  case 'pause':
  case 'play':
  case 'pointercancel':
  case 'pointerdown':
  case 'pointerup':
  case 'ratechange':
  case 'reset':
  case 'resize':
  case 'seeked':
  case 'submit':
  case 'touchcancel':
  case 'touchend':
  case 'touchstart':
  case 'volumechange':
  case 'change':
  case 'selectionchange':
  case 'textInput':
  case 'compositionstart':
  case 'compositionend':
  case 'compositionupdate':
  case 'beforeblur':
  case 'afterblur':
  case 'beforeinput':
  case 'blur':
  case 'fullscreenchange':
  case 'focus':
  case 'hashchange':
  case 'popstate':
  case 'select':
  case 'selectstart':
    return 1;
  case 'drag':
  case 'dragenter':
  case 'dragexit':
  case 'dragleave':
  case 'dragover':
  case 'mousemove':
  case 'mouseout':
  case 'mouseover':
  case 'pointermove':
  case 'pointerout':
  case 'pointerover':
  case 'scroll':
  case 'toggle':
  case 'touchmove':
  case 'wheel':
  case 'mouseenter':
  case 'mouseleave':
  case 'pointerenter':
  case 'pointerleave':
    return 4;
  case 'message':
    switch (Ru()) {
    case Lo:
      return 1;
    case ic:
      return 4;
    case ls:
    case Tu:
      return 16;
    case sc:
      return 536870912;
    default:
      return 16;
    }
  default:
    return 16;
  }
}
var Rt = null,
  Ao = null,
  Yi = null;
function fc() {
  if (Yi) return Yi;
  var e,
    t = Ao,
    r = t.length,
    i,
    h = 'value' in Rt ? Rt.value : Rt.textContent,
    m = h.length;
  for (e = 0; e < r && t[e] === h[e]; e++);
  var y = r - e;
  for (i = 1; i <= y && t[r - i] === h[m - i]; i++);
  return (Yi = h.slice(e, 1 < i ? 1 - i : void 0));
}
function Qi(e) {
  var t = e.keyCode;
  return (
    'charCode' in e
      ? ((e = e.charCode), e === 0 && t === 13 && (e = 13))
      : (e = t),
    e === 10 && (e = 13),
    32 <= e || e === 13 ? e : 0
  );
}
function Hi() {
  return !0;
}
function Ea() {
  return !1;
}
function $e(e) {
  function t(r, i, h, m, y) {
    ((this._reactName = r),
    (this._targetInst = h),
    (this.type = i),
    (this.nativeEvent = m),
    (this.target = y),
    (this.currentTarget = null));
    for (var a in e)
      e.hasOwnProperty(a) && ((r = e[a]), (this[a] = r ? r(m) : m[a]));
    return (
      (this.isDefaultPrevented = (
        m.defaultPrevented != null ? m.defaultPrevented : m.returnValue === !1
      )
        ? Hi
        : Ea),
      (this.isPropagationStopped = Ea),
      this
    );
  }
  return (
    ue(t.prototype, {
      preventDefault: function () {
        this.defaultPrevented = !0;
        var r = this.nativeEvent;
        r &&
          (r.preventDefault
            ? r.preventDefault()
            : typeof r.returnValue != 'unknown' && (r.returnValue = !1),
          (this.isDefaultPrevented = Hi));
      },
      stopPropagation: function () {
        var r = this.nativeEvent;
        r &&
          (r.stopPropagation
            ? r.stopPropagation()
            : typeof r.cancelBubble != 'unknown' && (r.cancelBubble = !0),
          (this.isPropagationStopped = Hi));
      },
      persist: function () {},
      isPersistent: Hi,
    }),
    t
  );
}
var Pr = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0,
  },
  Po = $e(Pr),
  Ei = ue({}, Pr, { view: 0, detail: 0 }),
  Uu = $e(Ei),
  tn,
  rn,
  jr,
  As = ue({}, Ei, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: Mo,
    button: 0,
    buttons: 0,
    relatedTarget: function (e) {
      return e.relatedTarget === void 0
        ? e.fromElement === e.srcElement
          ? e.toElement
          : e.fromElement
        : e.relatedTarget;
    },
    movementX: function (e) {
      return 'movementX' in e
        ? e.movementX
        : (e !== jr &&
            (jr && e.type === 'mousemove'
              ? ((tn = e.screenX - jr.screenX), (rn = e.screenY - jr.screenY))
              : (rn = tn = 0),
            (jr = e)),
        tn);
    },
    movementY: function (e) {
      return 'movementY' in e ? e.movementY : rn;
    },
  }),
  ka = $e(As),
  $u = ue({}, As, { dataTransfer: 0 }),
  Vu = $e($u),
  Ku = ue({}, Ei, { relatedTarget: 0 }),
  sn = $e(Ku),
  qu = ue({}, Pr, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
  Gu = $e(qu),
  Xu = ue({}, Pr, {
    clipboardData: function (e) {
      return 'clipboardData' in e ? e.clipboardData : window.clipboardData;
    },
  }),
  Yu = $e(Xu),
  Qu = ue({}, Pr, { data: 0 }),
  La = $e(Qu),
  Ju = {
    Esc: 'Escape',
    Spacebar: ' ',
    Left: 'ArrowLeft',
    Up: 'ArrowUp',
    Right: 'ArrowRight',
    Down: 'ArrowDown',
    Del: 'Delete',
    Win: 'OS',
    Menu: 'ContextMenu',
    Apps: 'ContextMenu',
    Scroll: 'ScrollLock',
    MozPrintableKey: 'Unidentified',
  },
  Zu = {
    8: 'Backspace',
    9: 'Tab',
    12: 'Clear',
    13: 'Enter',
    16: 'Shift',
    17: 'Control',
    18: 'Alt',
    19: 'Pause',
    20: 'CapsLock',
    27: 'Escape',
    32: ' ',
    33: 'PageUp',
    34: 'PageDown',
    35: 'End',
    36: 'Home',
    37: 'ArrowLeft',
    38: 'ArrowUp',
    39: 'ArrowRight',
    40: 'ArrowDown',
    45: 'Insert',
    46: 'Delete',
    112: 'F1',
    113: 'F2',
    114: 'F3',
    115: 'F4',
    116: 'F5',
    117: 'F6',
    118: 'F7',
    119: 'F8',
    120: 'F9',
    121: 'F10',
    122: 'F11',
    123: 'F12',
    144: 'NumLock',
    145: 'ScrollLock',
    224: 'Meta',
  },
  ed = {
    Alt: 'altKey',
    Control: 'ctrlKey',
    Meta: 'metaKey',
    Shift: 'shiftKey',
  };
function td(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = ed[e]) ? !!t[e] : !1;
}
function Mo() {
  return td;
}
var rd = ue({}, Ei, {
    key: function (e) {
      if (e.key) {
        var t = Ju[e.key] || e.key;
        if (t !== 'Unidentified') return t;
      }
      return e.type === 'keypress'
        ? ((e = Qi(e)), e === 13 ? 'Enter' : String.fromCharCode(e))
        : e.type === 'keydown' || e.type === 'keyup'
          ? Zu[e.keyCode] || 'Unidentified'
          : '';
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: Mo,
    charCode: function (e) {
      return e.type === 'keypress' ? Qi(e) : 0;
    },
    keyCode: function (e) {
      return e.type === 'keydown' || e.type === 'keyup' ? e.keyCode : 0;
    },
    which: function (e) {
      return e.type === 'keypress'
        ? Qi(e)
        : e.type === 'keydown' || e.type === 'keyup'
          ? e.keyCode
          : 0;
    },
  }),
  id = $e(rd),
  sd = ue({}, As, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0,
  }),
  Da = $e(sd),
  nd = ue({}, Ei, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Mo,
  }),
  od = $e(nd),
  ad = ue({}, Pr, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
  ld = $e(ad),
  cd = ue({}, As, {
    deltaX: function (e) {
      return 'deltaX' in e ? e.deltaX : 'wheelDeltaX' in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function (e) {
      return 'deltaY' in e
        ? e.deltaY
        : 'wheelDeltaY' in e
          ? -e.wheelDeltaY
          : 'wheelDelta' in e
            ? -e.wheelDelta
            : 0;
    },
    deltaZ: 0,
    deltaMode: 0,
  }),
  hd = $e(cd),
  ud = [9, 13, 27, 32],
  Bo = vt && 'CompositionEvent' in window,
  Zr = null;
vt && 'documentMode' in document && (Zr = document.documentMode);
var dd = vt && 'TextEvent' in window && !Zr,
  _c = vt && (!Bo || (Zr && 8 < Zr && 11 >= Zr)),
  Ra = ' ',
  Ta = !1;
function pc(e, t) {
  switch (e) {
  case 'keyup':
    return ud.indexOf(t.keyCode) !== -1;
  case 'keydown':
    return t.keyCode !== 229;
  case 'keypress':
  case 'mousedown':
  case 'focusout':
    return !0;
  default:
    return !1;
  }
}
function mc(e) {
  return ((e = e.detail), typeof e == 'object' && 'data' in e ? e.data : null);
}
var lr = !1;
function fd(e, t) {
  switch (e) {
  case 'compositionend':
    return mc(t);
  case 'keypress':
    return t.which !== 32 ? null : ((Ta = !0), Ra);
  case 'textInput':
    return ((e = t.data), e === Ra && Ta ? null : e);
  default:
    return null;
  }
}
function _d(e, t) {
  if (lr)
    return e === 'compositionend' || (!Bo && pc(e, t))
      ? ((e = fc()), (Yi = Ao = Rt = null), (lr = !1), e)
      : null;
  switch (e) {
  case 'paste':
    return null;
  case 'keypress':
    if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
      if (t.char && 1 < t.char.length) return t.char;
      if (t.which) return String.fromCharCode(t.which);
    }
    return null;
  case 'compositionend':
    return _c && t.locale !== 'ko' ? null : t.data;
  default:
    return null;
  }
}
var pd = {
  color: !0,
  date: !0,
  datetime: !0,
  'datetime-local': !0,
  email: !0,
  month: !0,
  number: !0,
  password: !0,
  range: !0,
  search: !0,
  tel: !0,
  text: !0,
  time: !0,
  url: !0,
  week: !0,
};
function Aa(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === 'input' ? !!pd[e.type] : t === 'textarea';
}
function vc(e, t, r, i) {
  (Gl(i),
  (t = ds(t, 'onChange')),
  0 < t.length &&
      ((r = new Po('onChange', 'change', null, r, i)),
      e.push({ event: r, listeners: t })));
}
var ei = null,
  di = null;
function md(e) {
  Dc(e, 0);
}
function Ps(e) {
  var t = ur(e);
  if (Wl(t)) return e;
}
function vd(e, t) {
  if (e === 'change') return t;
}
var gc = !1;
if (vt) {
  var nn;
  if (vt) {
    var on = 'oninput' in document;
    if (!on) {
      var Pa = document.createElement('div');
      (Pa.setAttribute('oninput', 'return;'),
      (on = typeof Pa.oninput == 'function'));
    }
    nn = on;
  } else nn = !1;
  gc = nn && (!document.documentMode || 9 < document.documentMode);
}
function Ma() {
  ei && (ei.detachEvent('onpropertychange', Sc), (di = ei = null));
}
function Sc(e) {
  if (e.propertyName === 'value' && Ps(di)) {
    var t = [];
    (vc(t, di, e, ko(e)), Jl(md, t));
  }
}
function gd(e, t, r) {
  e === 'focusin'
    ? (Ma(), (ei = t), (di = r), ei.attachEvent('onpropertychange', Sc))
    : e === 'focusout' && Ma();
}
function Sd(e) {
  if (e === 'selectionchange' || e === 'keyup' || e === 'keydown')
    return Ps(di);
}
function yd(e, t) {
  if (e === 'click') return Ps(t);
}
function wd(e, t) {
  if (e === 'input' || e === 'change') return Ps(t);
}
function Cd(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var nt = typeof Object.is == 'function' ? Object.is : Cd;
function fi(e, t) {
  if (nt(e, t)) return !0;
  if (typeof e != 'object' || e === null || typeof t != 'object' || t === null)
    return !1;
  var r = Object.keys(e),
    i = Object.keys(t);
  if (r.length !== i.length) return !1;
  for (i = 0; i < r.length; i++) {
    var h = r[i];
    if (!bn.call(t, h) || !nt(e[h], t[h])) return !1;
  }
  return !0;
}
function Ba(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function Oa(e, t) {
  var r = Ba(e);
  e = 0;
  for (var i; r; ) {
    if (r.nodeType === 3) {
      if (((i = e + r.textContent.length), e <= t && i >= t))
        return { node: r, offset: t - e };
      e = i;
    }
    e: {
      for (; r; ) {
        if (r.nextSibling) {
          r = r.nextSibling;
          break e;
        }
        r = r.parentNode;
      }
      r = void 0;
    }
    r = Ba(r);
  }
}
function yc(e, t) {
  return e && t
    ? e === t
      ? !0
      : e && e.nodeType === 3
        ? !1
        : t && t.nodeType === 3
          ? yc(e, t.parentNode)
          : 'contains' in e
            ? e.contains(t)
            : e.compareDocumentPosition
              ? !!(e.compareDocumentPosition(t) & 16)
              : !1
    : !1;
}
function wc() {
  for (var e = window, t = ns(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var r = typeof t.contentWindow.location.href == 'string';
    } catch {
      r = !1;
    }
    if (r) e = t.contentWindow;
    else break;
    t = ns(e.document);
  }
  return t;
}
function Oo(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return (
    t &&
    ((t === 'input' &&
      (e.type === 'text' ||
        e.type === 'search' ||
        e.type === 'tel' ||
        e.type === 'url' ||
        e.type === 'password')) ||
      t === 'textarea' ||
      e.contentEditable === 'true')
  );
}
function bd(e) {
  var t = wc(),
    r = e.focusedElem,
    i = e.selectionRange;
  if (
    t !== r &&
    r &&
    r.ownerDocument &&
    yc(r.ownerDocument.documentElement, r)
  ) {
    if (i !== null && Oo(r)) {
      if (
        ((t = i.start),
        (e = i.end),
        e === void 0 && (e = t),
        'selectionStart' in r)
      )
        ((r.selectionStart = t),
        (r.selectionEnd = Math.min(e, r.value.length)));
      else if (
        ((e = ((t = r.ownerDocument || document) && t.defaultView) || window),
        e.getSelection)
      ) {
        e = e.getSelection();
        var h = r.textContent.length,
          m = Math.min(i.start, h);
        ((i = i.end === void 0 ? m : Math.min(i.end, h)),
        !e.extend && m > i && ((h = i), (i = m), (m = h)),
        (h = Oa(r, m)));
        var y = Oa(r, i);
        h &&
          y &&
          (e.rangeCount !== 1 ||
            e.anchorNode !== h.node ||
            e.anchorOffset !== h.offset ||
            e.focusNode !== y.node ||
            e.focusOffset !== y.offset) &&
          ((t = t.createRange()),
          t.setStart(h.node, h.offset),
          e.removeAllRanges(),
          m > i
            ? (e.addRange(t), e.extend(y.node, y.offset))
            : (t.setEnd(y.node, y.offset), e.addRange(t)));
      }
    }
    for (t = [], e = r; (e = e.parentNode); )
      e.nodeType === 1 &&
        t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
    for (typeof r.focus == 'function' && r.focus(), r = 0; r < t.length; r++)
      ((e = t[r]),
      (e.element.scrollLeft = e.left),
      (e.element.scrollTop = e.top));
  }
}
var xd = vt && 'documentMode' in document && 11 >= document.documentMode,
  cr = null,
  jn = null,
  ti = null,
  Un = !1;
function Ia(e, t, r) {
  var i = r.window === r ? r.document : r.nodeType === 9 ? r : r.ownerDocument;
  Un ||
    cr == null ||
    cr !== ns(i) ||
    ((i = cr),
    'selectionStart' in i && Oo(i)
      ? (i = { start: i.selectionStart, end: i.selectionEnd })
      : ((i = (
        (i.ownerDocument && i.ownerDocument.defaultView) ||
          window
      ).getSelection()),
      (i = {
        anchorNode: i.anchorNode,
        anchorOffset: i.anchorOffset,
        focusNode: i.focusNode,
        focusOffset: i.focusOffset,
      })),
    (ti && fi(ti, i)) ||
      ((ti = i),
      (i = ds(jn, 'onSelect')),
      0 < i.length &&
        ((t = new Po('onSelect', 'select', null, t, r)),
        e.push({ event: t, listeners: i }),
        (t.target = cr))));
}
function Ni(e, t) {
  var r = {};
  return (
    (r[e.toLowerCase()] = t.toLowerCase()),
    (r['Webkit' + e] = 'webkit' + t),
    (r['Moz' + e] = 'moz' + t),
    r
  );
}
var hr = {
    animationend: Ni('Animation', 'AnimationEnd'),
    animationiteration: Ni('Animation', 'AnimationIteration'),
    animationstart: Ni('Animation', 'AnimationStart'),
    transitionend: Ni('Transition', 'TransitionEnd'),
  },
  an = {},
  Cc = {};
vt &&
  ((Cc = document.createElement('div').style),
  'AnimationEvent' in window ||
    (delete hr.animationend.animation,
    delete hr.animationiteration.animation,
    delete hr.animationstart.animation),
  'TransitionEvent' in window || delete hr.transitionend.transition);
function Ms(e) {
  if (an[e]) return an[e];
  if (!hr[e]) return e;
  var t = hr[e],
    r;
  for (r in t) if (t.hasOwnProperty(r) && r in Cc) return (an[e] = t[r]);
  return e;
}
var bc = Ms('animationend'),
  xc = Ms('animationiteration'),
  Ec = Ms('animationstart'),
  kc = Ms('transitionend'),
  Lc = new Map(),
  Ha =
    'abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel'.split(
      ' '
    );
function Wt(e, t) {
  (Lc.set(e, t), rr(t, [e]));
}
for (var ln = 0; ln < Ha.length; ln++) {
  var cn = Ha[ln],
    Ed = cn.toLowerCase(),
    kd = cn[0].toUpperCase() + cn.slice(1);
  Wt(Ed, 'on' + kd);
}
Wt(bc, 'onAnimationEnd');
Wt(xc, 'onAnimationIteration');
Wt(Ec, 'onAnimationStart');
Wt('dblclick', 'onDoubleClick');
Wt('focusin', 'onFocus');
Wt('focusout', 'onBlur');
Wt(kc, 'onTransitionEnd');
xr('onMouseEnter', ['mouseout', 'mouseover']);
xr('onMouseLeave', ['mouseout', 'mouseover']);
xr('onPointerEnter', ['pointerout', 'pointerover']);
xr('onPointerLeave', ['pointerout', 'pointerover']);
rr(
  'onChange',
  'change click focusin focusout input keydown keyup selectionchange'.split(' ')
);
rr(
  'onSelect',
  'focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange'.split(
    ' '
  )
);
rr('onBeforeInput', ['compositionend', 'keypress', 'textInput', 'paste']);
rr(
  'onCompositionEnd',
  'compositionend focusout keydown keypress keyup mousedown'.split(' ')
);
rr(
  'onCompositionStart',
  'compositionstart focusout keydown keypress keyup mousedown'.split(' ')
);
rr(
  'onCompositionUpdate',
  'compositionupdate focusout keydown keypress keyup mousedown'.split(' ')
);
var Xr =
    'abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting'.split(
      ' '
    ),
  Ld = new Set('cancel close invalid load scroll toggle'.split(' ').concat(Xr));
function Na(e, t, r) {
  var i = e.type || 'unknown-event';
  ((e.currentTarget = r), Eu(i, t, void 0, e), (e.currentTarget = null));
}
function Dc(e, t) {
  t = (t & 4) !== 0;
  for (var r = 0; r < e.length; r++) {
    var i = e[r],
      h = i.event;
    i = i.listeners;
    e: {
      var m = void 0;
      if (t)
        for (var y = i.length - 1; 0 <= y; y--) {
          var a = i[y],
            l = a.instance,
            f = a.currentTarget;
          if (((a = a.listener), l !== m && h.isPropagationStopped())) break e;
          (Na(h, a, f), (m = l));
        }
      else
        for (y = 0; y < i.length; y++) {
          if (
            ((a = i[y]),
            (l = a.instance),
            (f = a.currentTarget),
            (a = a.listener),
            l !== m && h.isPropagationStopped())
          )
            break e;
          (Na(h, a, f), (m = l));
        }
    }
  }
  if (as) throw ((e = Nn), (as = !1), (Nn = null), e);
}
function ne(e, t) {
  var r = t[Gn];
  r === void 0 && (r = t[Gn] = new Set());
  var i = e + '__bubble';
  r.has(i) || (Rc(t, e, 2, !1), r.add(i));
}
function hn(e, t, r) {
  var i = 0;
  (t && (i |= 4), Rc(r, e, i, t));
}
var Fi = '_reactListening' + Math.random().toString(36).slice(2);
function _i(e) {
  if (!e[Fi]) {
    ((e[Fi] = !0),
    Il.forEach(function (r) {
      r !== 'selectionchange' && (Ld.has(r) || hn(r, !1, e), hn(r, !0, e));
    }));
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Fi] || ((t[Fi] = !0), hn('selectionchange', !1, t));
  }
}
function Rc(e, t, r, i) {
  switch (dc(t)) {
  case 1:
    var h = Wu;
    break;
  case 4:
    h = ju;
    break;
  default:
    h = To;
  }
  ((r = h.bind(null, t, r, e)),
  (h = void 0),
  !Hn ||
      (t !== 'touchstart' && t !== 'touchmove' && t !== 'wheel') ||
      (h = !0),
  i
    ? h !== void 0
      ? e.addEventListener(t, r, { capture: !0, passive: h })
      : e.addEventListener(t, r, !0)
    : h !== void 0
      ? e.addEventListener(t, r, { passive: h })
      : e.addEventListener(t, r, !1));
}
function un(e, t, r, i, h) {
  var m = i;
  if (!(t & 1) && !(t & 2) && i !== null)
    e: for (;;) {
      if (i === null) return;
      var y = i.tag;
      if (y === 3 || y === 4) {
        var a = i.stateNode.containerInfo;
        if (a === h || (a.nodeType === 8 && a.parentNode === h)) break;
        if (y === 4)
          for (y = i.return; y !== null; ) {
            var l = y.tag;
            if (
              (l === 3 || l === 4) &&
              ((l = y.stateNode.containerInfo),
              l === h || (l.nodeType === 8 && l.parentNode === h))
            )
              return;
            y = y.return;
          }
        for (; a !== null; ) {
          if (((y = Kt(a)), y === null)) return;
          if (((l = y.tag), l === 5 || l === 6)) {
            i = m = y;
            continue e;
          }
          a = a.parentNode;
        }
      }
      i = i.return;
    }
  Jl(function () {
    var f = m,
      g = ko(r),
      u = [];
    e: {
      var d = Lc.get(e);
      if (d !== void 0) {
        var v = Po,
          w = e;
        switch (e) {
        case 'keypress':
          if (Qi(r) === 0) break e;
        case 'keydown':
        case 'keyup':
          v = id;
          break;
        case 'focusin':
          ((w = 'focus'), (v = sn));
          break;
        case 'focusout':
          ((w = 'blur'), (v = sn));
          break;
        case 'beforeblur':
        case 'afterblur':
          v = sn;
          break;
        case 'click':
          if (r.button === 2) break e;
        case 'auxclick':
        case 'dblclick':
        case 'mousedown':
        case 'mousemove':
        case 'mouseup':
        case 'mouseout':
        case 'mouseover':
        case 'contextmenu':
          v = ka;
          break;
        case 'drag':
        case 'dragend':
        case 'dragenter':
        case 'dragexit':
        case 'dragleave':
        case 'dragover':
        case 'dragstart':
        case 'drop':
          v = Vu;
          break;
        case 'touchcancel':
        case 'touchend':
        case 'touchmove':
        case 'touchstart':
          v = od;
          break;
        case bc:
        case xc:
        case Ec:
          v = Gu;
          break;
        case kc:
          v = ld;
          break;
        case 'scroll':
          v = Uu;
          break;
        case 'wheel':
          v = hd;
          break;
        case 'copy':
        case 'cut':
        case 'paste':
          v = Yu;
          break;
        case 'gotpointercapture':
        case 'lostpointercapture':
        case 'pointercancel':
        case 'pointerdown':
        case 'pointermove':
        case 'pointerout':
        case 'pointerover':
        case 'pointerup':
          v = Da;
        }
        var p = (t & 4) !== 0,
          c = !p && e === 'scroll',
          n = p ? (d !== null ? d + 'Capture' : null) : d;
        p = [];
        for (var s = f, o; s !== null; ) {
          o = s;
          var _ = o.stateNode;
          if (
            (o.tag === 5 &&
              _ !== null &&
              ((o = _),
              n !== null && ((_ = li(s, n)), _ != null && p.push(pi(s, _, o)))),
            c)
          )
            break;
          s = s.return;
        }
        0 < p.length &&
          ((d = new v(d, w, null, r, g)), u.push({ event: d, listeners: p }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (
          ((d = e === 'mouseover' || e === 'pointerover'),
          (v = e === 'mouseout' || e === 'pointerout'),
          d &&
            r !== On &&
            (w = r.relatedTarget || r.fromElement) &&
            (Kt(w) || w[gt]))
        )
          break e;
        if (
          (v || d) &&
          ((d =
            g.window === g
              ? g
              : (d = g.ownerDocument)
                ? d.defaultView || d.parentWindow
                : window),
          v
            ? ((w = r.relatedTarget || r.toElement),
            (v = f),
            (w = w ? Kt(w) : null),
            w !== null &&
                ((c = ir(w)), w !== c || (w.tag !== 5 && w.tag !== 6)) &&
                (w = null))
            : ((v = null), (w = f)),
          v !== w)
        ) {
          if (
            ((p = ka),
            (_ = 'onMouseLeave'),
            (n = 'onMouseEnter'),
            (s = 'mouse'),
            (e === 'pointerout' || e === 'pointerover') &&
              ((p = Da),
              (_ = 'onPointerLeave'),
              (n = 'onPointerEnter'),
              (s = 'pointer')),
            (c = v == null ? d : ur(v)),
            (o = w == null ? d : ur(w)),
            (d = new p(_, s + 'leave', v, r, g)),
            (d.target = c),
            (d.relatedTarget = o),
            (_ = null),
            Kt(g) === f &&
              ((p = new p(n, s + 'enter', w, r, g)),
              (p.target = o),
              (p.relatedTarget = c),
              (_ = p)),
            (c = _),
            v && w)
          )
            t: {
              for (p = v, n = w, s = 0, o = p; o; o = sr(o)) s++;
              for (o = 0, _ = n; _; _ = sr(_)) o++;
              for (; 0 < s - o; ) ((p = sr(p)), s--);
              for (; 0 < o - s; ) ((n = sr(n)), o--);
              for (; s--; ) {
                if (p === n || (n !== null && p === n.alternate)) break t;
                ((p = sr(p)), (n = sr(n)));
              }
              p = null;
            }
          else p = null;
          (v !== null && Fa(u, d, v, p, !1),
          w !== null && c !== null && Fa(u, c, w, p, !0));
        }
      }
      e: {
        if (
          ((d = f ? ur(f) : window),
          (v = d.nodeName && d.nodeName.toLowerCase()),
          v === 'select' || (v === 'input' && d.type === 'file'))
        )
          var C = vd;
        else if (Aa(d))
          if (gc) C = wd;
          else {
            C = Sd;
            var b = gd;
          }
        else
          (v = d.nodeName) &&
            v.toLowerCase() === 'input' &&
            (d.type === 'checkbox' || d.type === 'radio') &&
            (C = yd);
        if (C && (C = C(e, f))) {
          vc(u, C, r, g);
          break e;
        }
        (b && b(e, d, f),
        e === 'focusout' &&
            (b = d._wrapperState) &&
            b.controlled &&
            d.type === 'number' &&
            Tn(d, 'number', d.value));
      }
      switch (((b = f ? ur(f) : window), e)) {
      case 'focusin':
        (Aa(b) || b.contentEditable === 'true') &&
            ((cr = b), (jn = f), (ti = null));
        break;
      case 'focusout':
        ti = jn = cr = null;
        break;
      case 'mousedown':
        Un = !0;
        break;
      case 'contextmenu':
      case 'mouseup':
      case 'dragend':
        ((Un = !1), Ia(u, r, g));
        break;
      case 'selectionchange':
        if (xd) break;
      case 'keydown':
      case 'keyup':
        Ia(u, r, g);
      }
      var x;
      if (Bo)
        e: {
          switch (e) {
          case 'compositionstart':
            var S = 'onCompositionStart';
            break e;
          case 'compositionend':
            S = 'onCompositionEnd';
            break e;
          case 'compositionupdate':
            S = 'onCompositionUpdate';
            break e;
          }
          S = void 0;
        }
      else
        lr
          ? pc(e, r) && (S = 'onCompositionEnd')
          : e === 'keydown' && r.keyCode === 229 && (S = 'onCompositionStart');
      (S &&
        (_c &&
          r.locale !== 'ko' &&
          (lr || S !== 'onCompositionStart'
            ? S === 'onCompositionEnd' && lr && (x = fc())
            : ((Rt = g),
            (Ao = 'value' in Rt ? Rt.value : Rt.textContent),
            (lr = !0))),
        (b = ds(f, S)),
        0 < b.length &&
          ((S = new La(S, e, null, r, g)),
          u.push({ event: S, listeners: b }),
          x ? (S.data = x) : ((x = mc(r)), x !== null && (S.data = x)))),
      (x = dd ? fd(e, r) : _d(e, r)) &&
          ((f = ds(f, 'onBeforeInput')),
          0 < f.length &&
            ((g = new La('onBeforeInput', 'beforeinput', null, r, g)),
            u.push({ event: g, listeners: f }),
            (g.data = x))));
    }
    Dc(u, t);
  });
}
function pi(e, t, r) {
  return { instance: e, listener: t, currentTarget: r };
}
function ds(e, t) {
  for (var r = t + 'Capture', i = []; e !== null; ) {
    var h = e,
      m = h.stateNode;
    (h.tag === 5 &&
      m !== null &&
      ((h = m),
      (m = li(e, r)),
      m != null && i.unshift(pi(e, m, h)),
      (m = li(e, t)),
      m != null && i.push(pi(e, m, h))),
    (e = e.return));
  }
  return i;
}
function sr(e) {
  if (e === null) return null;
  do e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function Fa(e, t, r, i, h) {
  for (var m = t._reactName, y = []; r !== null && r !== i; ) {
    var a = r,
      l = a.alternate,
      f = a.stateNode;
    if (l !== null && l === i) break;
    (a.tag === 5 &&
      f !== null &&
      ((a = f),
      h
        ? ((l = li(r, m)), l != null && y.unshift(pi(r, l, a)))
        : h || ((l = li(r, m)), l != null && y.push(pi(r, l, a)))),
    (r = r.return));
  }
  y.length !== 0 && e.push({ event: t, listeners: y });
}
var Dd = /\r\n?/g,
  Rd = /\u0000|\uFFFD/g;
function za(e) {
  return (typeof e == 'string' ? e : '' + e)
    .replace(
      Dd,
      `
`
    )
    .replace(Rd, '');
}
function zi(e, t, r) {
  if (((t = za(t)), za(e) !== t && r)) throw Error(V(425));
}
function fs() {}
var $n = null,
  Vn = null;
function Kn(e, t) {
  return (
    e === 'textarea' ||
    e === 'noscript' ||
    typeof t.children == 'string' ||
    typeof t.children == 'number' ||
    (typeof t.dangerouslySetInnerHTML == 'object' &&
      t.dangerouslySetInnerHTML !== null &&
      t.dangerouslySetInnerHTML.__html != null)
  );
}
var qn = typeof setTimeout == 'function' ? setTimeout : void 0,
  Td = typeof clearTimeout == 'function' ? clearTimeout : void 0,
  Wa = typeof Promise == 'function' ? Promise : void 0,
  Ad =
    typeof queueMicrotask == 'function'
      ? queueMicrotask
      : typeof Wa < 'u'
        ? function (e) {
          return Wa.resolve(null).then(e).catch(Pd);
        }
        : qn;
function Pd(e) {
  setTimeout(function () {
    throw e;
  });
}
function dn(e, t) {
  var r = t,
    i = 0;
  do {
    var h = r.nextSibling;
    if ((e.removeChild(r), h && h.nodeType === 8))
      if (((r = h.data), r === '/$')) {
        if (i === 0) {
          (e.removeChild(h), ui(t));
          return;
        }
        i--;
      } else (r !== '$' && r !== '$?' && r !== '$!') || i++;
    r = h;
  } while (r);
  ui(t);
}
function Bt(e) {
  for (; e != null; e = e.nextSibling) {
    var t = e.nodeType;
    if (t === 1 || t === 3) break;
    if (t === 8) {
      if (((t = e.data), t === '$' || t === '$!' || t === '$?')) break;
      if (t === '/$') return null;
    }
  }
  return e;
}
function ja(e) {
  e = e.previousSibling;
  for (var t = 0; e; ) {
    if (e.nodeType === 8) {
      var r = e.data;
      if (r === '$' || r === '$!' || r === '$?') {
        if (t === 0) return e;
        t--;
      } else r === '/$' && t++;
    }
    e = e.previousSibling;
  }
  return null;
}
var Mr = Math.random().toString(36).slice(2),
  ct = '__reactFiber$' + Mr,
  mi = '__reactProps$' + Mr,
  gt = '__reactContainer$' + Mr,
  Gn = '__reactEvents$' + Mr,
  Md = '__reactListeners$' + Mr,
  Bd = '__reactHandles$' + Mr;
function Kt(e) {
  var t = e[ct];
  if (t) return t;
  for (var r = e.parentNode; r; ) {
    if ((t = r[gt] || r[ct])) {
      if (
        ((r = t.alternate),
        t.child !== null || (r !== null && r.child !== null))
      )
        for (e = ja(e); e !== null; ) {
          if ((r = e[ct])) return r;
          e = ja(e);
        }
      return t;
    }
    ((e = r), (r = e.parentNode));
  }
  return null;
}
function ki(e) {
  return (
    (e = e[ct] || e[gt]),
    !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e
  );
}
function ur(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(V(33));
}
function Bs(e) {
  return e[mi] || null;
}
var Xn = [],
  dr = -1;
function jt(e) {
  return { current: e };
}
function oe(e) {
  0 > dr || ((e.current = Xn[dr]), (Xn[dr] = null), dr--);
}
function se(e, t) {
  (dr++, (Xn[dr] = e.current), (e.current = t));
}
var zt = {},
  Le = jt(zt),
  Oe = jt(!1),
  Qt = zt;
function Er(e, t) {
  var r = e.type.contextTypes;
  if (!r) return zt;
  var i = e.stateNode;
  if (i && i.__reactInternalMemoizedUnmaskedChildContext === t)
    return i.__reactInternalMemoizedMaskedChildContext;
  var h = {},
    m;
  for (m in r) h[m] = t[m];
  return (
    i &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = t),
      (e.__reactInternalMemoizedMaskedChildContext = h)),
    h
  );
}
function Ie(e) {
  return ((e = e.childContextTypes), e != null);
}
function _s() {
  (oe(Oe), oe(Le));
}
function Ua(e, t, r) {
  if (Le.current !== zt) throw Error(V(168));
  (se(Le, t), se(Oe, r));
}
function Tc(e, t, r) {
  var i = e.stateNode;
  if (((t = t.childContextTypes), typeof i.getChildContext != 'function'))
    return r;
  i = i.getChildContext();
  for (var h in i) if (!(h in t)) throw Error(V(108, gu(e) || 'Unknown', h));
  return ue({}, r, i);
}
function ps(e) {
  return (
    (e =
      ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || zt),
    (Qt = Le.current),
    se(Le, e),
    se(Oe, Oe.current),
    !0
  );
}
function $a(e, t, r) {
  var i = e.stateNode;
  if (!i) throw Error(V(169));
  (r
    ? ((e = Tc(e, t, Qt)),
    (i.__reactInternalMemoizedMergedChildContext = e),
    oe(Oe),
    oe(Le),
    se(Le, e))
    : oe(Oe),
  se(Oe, r));
}
var ft = null,
  Os = !1,
  fn = !1;
function Ac(e) {
  ft === null ? (ft = [e]) : ft.push(e);
}
function Od(e) {
  ((Os = !0), Ac(e));
}
function Ut() {
  if (!fn && ft !== null) {
    fn = !0;
    var e = 0,
      t = re;
    try {
      var r = ft;
      for (re = 1; e < r.length; e++) {
        var i = r[e];
        do i = i(!0);
        while (i !== null);
      }
      ((ft = null), (Os = !1));
    } catch (h) {
      throw (ft !== null && (ft = ft.slice(e + 1)), rc(Lo, Ut), h);
    } finally {
      ((re = t), (fn = !1));
    }
  }
  return null;
}
var fr = [],
  _r = 0,
  ms = null,
  vs = 0,
  Ke = [],
  qe = 0,
  Jt = null,
  _t = 1,
  pt = '';
function $t(e, t) {
  ((fr[_r++] = vs), (fr[_r++] = ms), (ms = e), (vs = t));
}
function Pc(e, t, r) {
  ((Ke[qe++] = _t), (Ke[qe++] = pt), (Ke[qe++] = Jt), (Jt = e));
  var i = _t;
  e = pt;
  var h = 32 - it(i) - 1;
  ((i &= ~(1 << h)), (r += 1));
  var m = 32 - it(t) + h;
  if (30 < m) {
    var y = h - (h % 5);
    ((m = (i & ((1 << y) - 1)).toString(32)),
    (i >>= y),
    (h -= y),
    (_t = (1 << (32 - it(t) + h)) | (r << h) | i),
    (pt = m + e));
  } else ((_t = (1 << m) | (r << h) | i), (pt = e));
}
function Io(e) {
  e.return !== null && ($t(e, 1), Pc(e, 1, 0));
}
function Ho(e) {
  for (; e === ms; )
    ((ms = fr[--_r]), (fr[_r] = null), (vs = fr[--_r]), (fr[_r] = null));
  for (; e === Jt; )
    ((Jt = Ke[--qe]),
    (Ke[qe] = null),
    (pt = Ke[--qe]),
    (Ke[qe] = null),
    (_t = Ke[--qe]),
    (Ke[qe] = null));
}
var We = null,
  ze = null,
  ae = !1,
  rt = null;
function Mc(e, t) {
  var r = Ge(5, null, null, 0);
  ((r.elementType = 'DELETED'),
  (r.stateNode = t),
  (r.return = e),
  (t = e.deletions),
  t === null ? ((e.deletions = [r]), (e.flags |= 16)) : t.push(r));
}
function Va(e, t) {
  switch (e.tag) {
  case 5:
    var r = e.type;
    return (
      (t =
          t.nodeType !== 1 || r.toLowerCase() !== t.nodeName.toLowerCase()
            ? null
            : t),
      t !== null
        ? ((e.stateNode = t), (We = e), (ze = Bt(t.firstChild)), !0)
        : !1
    );
  case 6:
    return (
      (t = e.pendingProps === '' || t.nodeType !== 3 ? null : t),
      t !== null ? ((e.stateNode = t), (We = e), (ze = null), !0) : !1
    );
  case 13:
    return (
      (t = t.nodeType !== 8 ? null : t),
      t !== null
        ? ((r = Jt !== null ? { id: _t, overflow: pt } : null),
        (e.memoizedState = {
          dehydrated: t,
          treeContext: r,
          retryLane: 1073741824,
        }),
        (r = Ge(18, null, null, 0)),
        (r.stateNode = t),
        (r.return = e),
        (e.child = r),
        (We = e),
        (ze = null),
        !0)
        : !1
    );
  default:
    return !1;
  }
}
function Yn(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function Qn(e) {
  if (ae) {
    var t = ze;
    if (t) {
      var r = t;
      if (!Va(e, t)) {
        if (Yn(e)) throw Error(V(418));
        t = Bt(r.nextSibling);
        var i = We;
        t && Va(e, t)
          ? Mc(i, r)
          : ((e.flags = (e.flags & -4097) | 2), (ae = !1), (We = e));
      }
    } else {
      if (Yn(e)) throw Error(V(418));
      ((e.flags = (e.flags & -4097) | 2), (ae = !1), (We = e));
    }
  }
}
function Ka(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; )
    e = e.return;
  We = e;
}
function Wi(e) {
  if (e !== We) return !1;
  if (!ae) return (Ka(e), (ae = !0), !1);
  var t;
  if (
    ((t = e.tag !== 3) &&
      !(t = e.tag !== 5) &&
      ((t = e.type),
      (t = t !== 'head' && t !== 'body' && !Kn(e.type, e.memoizedProps))),
    t && (t = ze))
  ) {
    if (Yn(e)) throw (Bc(), Error(V(418)));
    for (; t; ) (Mc(e, t), (t = Bt(t.nextSibling)));
  }
  if ((Ka(e), e.tag === 13)) {
    if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
      throw Error(V(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var r = e.data;
          if (r === '/$') {
            if (t === 0) {
              ze = Bt(e.nextSibling);
              break e;
            }
            t--;
          } else (r !== '$' && r !== '$!' && r !== '$?') || t++;
        }
        e = e.nextSibling;
      }
      ze = null;
    }
  } else ze = We ? Bt(e.stateNode.nextSibling) : null;
  return !0;
}
function Bc() {
  for (var e = ze; e; ) e = Bt(e.nextSibling);
}
function kr() {
  ((ze = We = null), (ae = !1));
}
function No(e) {
  rt === null ? (rt = [e]) : rt.push(e);
}
var Id = wt.ReactCurrentBatchConfig;
function Ur(e, t, r) {
  if (
    ((e = r.ref), e !== null && typeof e != 'function' && typeof e != 'object')
  ) {
    if (r._owner) {
      if (((r = r._owner), r)) {
        if (r.tag !== 1) throw Error(V(309));
        var i = r.stateNode;
      }
      if (!i) throw Error(V(147, e));
      var h = i,
        m = '' + e;
      return t !== null &&
        t.ref !== null &&
        typeof t.ref == 'function' &&
        t.ref._stringRef === m
        ? t.ref
        : ((t = function (y) {
          var a = h.refs;
          y === null ? delete a[m] : (a[m] = y);
        }),
        (t._stringRef = m),
        t);
    }
    if (typeof e != 'string') throw Error(V(284));
    if (!r._owner) throw Error(V(290, e));
  }
  return e;
}
function ji(e, t) {
  throw (
    (e = Object.prototype.toString.call(t)),
    Error(
      V(
        31,
        e === '[object Object]'
          ? 'object with keys {' + Object.keys(t).join(', ') + '}'
          : e
      )
    )
  );
}
function qa(e) {
  var t = e._init;
  return t(e._payload);
}
function Oc(e) {
  function t(n, s) {
    if (e) {
      var o = n.deletions;
      o === null ? ((n.deletions = [s]), (n.flags |= 16)) : o.push(s);
    }
  }
  function r(n, s) {
    if (!e) return null;
    for (; s !== null; ) (t(n, s), (s = s.sibling));
    return null;
  }
  function i(n, s) {
    for (n = new Map(); s !== null; )
      (s.key !== null ? n.set(s.key, s) : n.set(s.index, s), (s = s.sibling));
    return n;
  }
  function h(n, s) {
    return ((n = Nt(n, s)), (n.index = 0), (n.sibling = null), n);
  }
  function m(n, s, o) {
    return (
      (n.index = o),
      e
        ? ((o = n.alternate),
        o !== null
          ? ((o = o.index), o < s ? ((n.flags |= 2), s) : o)
          : ((n.flags |= 2), s))
        : ((n.flags |= 1048576), s)
    );
  }
  function y(n) {
    return (e && n.alternate === null && (n.flags |= 2), n);
  }
  function a(n, s, o, _) {
    return s === null || s.tag !== 6
      ? ((s = yn(o, n.mode, _)), (s.return = n), s)
      : ((s = h(s, o)), (s.return = n), s);
  }
  function l(n, s, o, _) {
    var C = o.type;
    return C === ar
      ? g(n, s, o.props.children, _, o.key)
      : s !== null &&
          (s.elementType === C ||
            (typeof C == 'object' &&
              C !== null &&
              C.$$typeof === Et &&
              qa(C) === s.type))
        ? ((_ = h(s, o.props)), (_.ref = Ur(n, s, o)), (_.return = n), _)
        : ((_ = ss(o.type, o.key, o.props, null, n.mode, _)),
        (_.ref = Ur(n, s, o)),
        (_.return = n),
        _);
  }
  function f(n, s, o, _) {
    return s === null ||
      s.tag !== 4 ||
      s.stateNode.containerInfo !== o.containerInfo ||
      s.stateNode.implementation !== o.implementation
      ? ((s = wn(o, n.mode, _)), (s.return = n), s)
      : ((s = h(s, o.children || [])), (s.return = n), s);
  }
  function g(n, s, o, _, C) {
    return s === null || s.tag !== 7
      ? ((s = Yt(o, n.mode, _, C)), (s.return = n), s)
      : ((s = h(s, o)), (s.return = n), s);
  }
  function u(n, s, o) {
    if ((typeof s == 'string' && s !== '') || typeof s == 'number')
      return ((s = yn('' + s, n.mode, o)), (s.return = n), s);
    if (typeof s == 'object' && s !== null) {
      switch (s.$$typeof) {
      case Ai:
        return (
          (o = ss(s.type, s.key, s.props, null, n.mode, o)),
          (o.ref = Ur(n, null, s)),
          (o.return = n),
          o
        );
      case or:
        return ((s = wn(s, n.mode, o)), (s.return = n), s);
      case Et:
        var _ = s._init;
        return u(n, _(s._payload), o);
      }
      if (qr(s) || Nr(s))
        return ((s = Yt(s, n.mode, o, null)), (s.return = n), s);
      ji(n, s);
    }
    return null;
  }
  function d(n, s, o, _) {
    var C = s !== null ? s.key : null;
    if ((typeof o == 'string' && o !== '') || typeof o == 'number')
      return C !== null ? null : a(n, s, '' + o, _);
    if (typeof o == 'object' && o !== null) {
      switch (o.$$typeof) {
      case Ai:
        return o.key === C ? l(n, s, o, _) : null;
      case or:
        return o.key === C ? f(n, s, o, _) : null;
      case Et:
        return ((C = o._init), d(n, s, C(o._payload), _));
      }
      if (qr(o) || Nr(o)) return C !== null ? null : g(n, s, o, _, null);
      ji(n, o);
    }
    return null;
  }
  function v(n, s, o, _, C) {
    if ((typeof _ == 'string' && _ !== '') || typeof _ == 'number')
      return ((n = n.get(o) || null), a(s, n, '' + _, C));
    if (typeof _ == 'object' && _ !== null) {
      switch (_.$$typeof) {
      case Ai:
        return (
          (n = n.get(_.key === null ? o : _.key) || null),
          l(s, n, _, C)
        );
      case or:
        return (
          (n = n.get(_.key === null ? o : _.key) || null),
          f(s, n, _, C)
        );
      case Et:
        var b = _._init;
        return v(n, s, o, b(_._payload), C);
      }
      if (qr(_) || Nr(_)) return ((n = n.get(o) || null), g(s, n, _, C, null));
      ji(s, _);
    }
    return null;
  }
  function w(n, s, o, _) {
    for (
      var C = null, b = null, x = s, S = (s = 0), k = null;
      x !== null && S < o.length;
      S++
    ) {
      x.index > S ? ((k = x), (x = null)) : (k = x.sibling);
      var T = d(n, x, o[S], _);
      if (T === null) {
        x === null && (x = k);
        break;
      }
      (e && x && T.alternate === null && t(n, x),
      (s = m(T, s, S)),
      b === null ? (C = T) : (b.sibling = T),
      (b = T),
      (x = k));
    }
    if (S === o.length) return (r(n, x), ae && $t(n, S), C);
    if (x === null) {
      for (; S < o.length; S++)
        ((x = u(n, o[S], _)),
        x !== null &&
            ((s = m(x, s, S)),
            b === null ? (C = x) : (b.sibling = x),
            (b = x)));
      return (ae && $t(n, S), C);
    }
    for (x = i(n, x); S < o.length; S++)
      ((k = v(x, n, S, o[S], _)),
      k !== null &&
          (e && k.alternate !== null && x.delete(k.key === null ? S : k.key),
          (s = m(k, s, S)),
          b === null ? (C = k) : (b.sibling = k),
          (b = k)));
    return (
      e &&
        x.forEach(function (B) {
          return t(n, B);
        }),
      ae && $t(n, S),
      C
    );
  }
  function p(n, s, o, _) {
    var C = Nr(o);
    if (typeof C != 'function') throw Error(V(150));
    if (((o = C.call(o)), o == null)) throw Error(V(151));
    for (
      var b = (C = null), x = s, S = (s = 0), k = null, T = o.next();
      x !== null && !T.done;
      S++, T = o.next()
    ) {
      x.index > S ? ((k = x), (x = null)) : (k = x.sibling);
      var B = d(n, x, T.value, _);
      if (B === null) {
        x === null && (x = k);
        break;
      }
      (e && x && B.alternate === null && t(n, x),
      (s = m(B, s, S)),
      b === null ? (C = B) : (b.sibling = B),
      (b = B),
      (x = k));
    }
    if (T.done) return (r(n, x), ae && $t(n, S), C);
    if (x === null) {
      for (; !T.done; S++, T = o.next())
        ((T = u(n, T.value, _)),
        T !== null &&
            ((s = m(T, s, S)),
            b === null ? (C = T) : (b.sibling = T),
            (b = T)));
      return (ae && $t(n, S), C);
    }
    for (x = i(n, x); !T.done; S++, T = o.next())
      ((T = v(x, n, S, T.value, _)),
      T !== null &&
          (e && T.alternate !== null && x.delete(T.key === null ? S : T.key),
          (s = m(T, s, S)),
          b === null ? (C = T) : (b.sibling = T),
          (b = T)));
    return (
      e &&
        x.forEach(function (O) {
          return t(n, O);
        }),
      ae && $t(n, S),
      C
    );
  }
  function c(n, s, o, _) {
    if (
      (typeof o == 'object' &&
        o !== null &&
        o.type === ar &&
        o.key === null &&
        (o = o.props.children),
      typeof o == 'object' && o !== null)
    ) {
      switch (o.$$typeof) {
      case Ai:
        e: {
          for (var C = o.key, b = s; b !== null; ) {
            if (b.key === C) {
              if (((C = o.type), C === ar)) {
                if (b.tag === 7) {
                  (r(n, b.sibling),
                  (s = h(b, o.props.children)),
                  (s.return = n),
                  (n = s));
                  break e;
                }
              } else if (
                b.elementType === C ||
                  (typeof C == 'object' &&
                    C !== null &&
                    C.$$typeof === Et &&
                    qa(C) === b.type)
              ) {
                (r(n, b.sibling),
                (s = h(b, o.props)),
                (s.ref = Ur(n, b, o)),
                (s.return = n),
                (n = s));
                break e;
              }
              r(n, b);
              break;
            } else t(n, b);
            b = b.sibling;
          }
          o.type === ar
            ? ((s = Yt(o.props.children, n.mode, _, o.key)),
            (s.return = n),
            (n = s))
            : ((_ = ss(o.type, o.key, o.props, null, n.mode, _)),
            (_.ref = Ur(n, s, o)),
            (_.return = n),
            (n = _));
        }
        return y(n);
      case or:
        e: {
          for (b = o.key; s !== null; ) {
            if (s.key === b)
              if (
                s.tag === 4 &&
                  s.stateNode.containerInfo === o.containerInfo &&
                  s.stateNode.implementation === o.implementation
              ) {
                (r(n, s.sibling),
                (s = h(s, o.children || [])),
                (s.return = n),
                (n = s));
                break e;
              } else {
                r(n, s);
                break;
              }
            else t(n, s);
            s = s.sibling;
          }
          ((s = wn(o, n.mode, _)), (s.return = n), (n = s));
        }
        return y(n);
      case Et:
        return ((b = o._init), c(n, s, b(o._payload), _));
      }
      if (qr(o)) return w(n, s, o, _);
      if (Nr(o)) return p(n, s, o, _);
      ji(n, o);
    }
    return (typeof o == 'string' && o !== '') || typeof o == 'number'
      ? ((o = '' + o),
      s !== null && s.tag === 6
        ? (r(n, s.sibling), (s = h(s, o)), (s.return = n), (n = s))
        : (r(n, s), (s = yn(o, n.mode, _)), (s.return = n), (n = s)),
      y(n))
      : r(n, s);
  }
  return c;
}
var Lr = Oc(!0),
  Ic = Oc(!1),
  gs = jt(null),
  Ss = null,
  pr = null,
  Fo = null;
function zo() {
  Fo = pr = Ss = null;
}
function Wo(e) {
  var t = gs.current;
  (oe(gs), (e._currentValue = t));
}
function Jn(e, t, r) {
  for (; e !== null; ) {
    var i = e.alternate;
    if (
      ((e.childLanes & t) !== t
        ? ((e.childLanes |= t), i !== null && (i.childLanes |= t))
        : i !== null && (i.childLanes & t) !== t && (i.childLanes |= t),
      e === r)
    )
      break;
    e = e.return;
  }
}
function Cr(e, t) {
  ((Ss = e),
  (Fo = pr = null),
  (e = e.dependencies),
  e !== null &&
      e.firstContext !== null &&
      (e.lanes & t && (Be = !0), (e.firstContext = null)));
}
function Ye(e) {
  var t = e._currentValue;
  if (Fo !== e)
    if (((e = { context: e, memoizedValue: t, next: null }), pr === null)) {
      if (Ss === null) throw Error(V(308));
      ((pr = e), (Ss.dependencies = { lanes: 0, firstContext: e }));
    } else pr = pr.next = e;
  return t;
}
var qt = null;
function jo(e) {
  qt === null ? (qt = [e]) : qt.push(e);
}
function Hc(e, t, r, i) {
  var h = t.interleaved;
  return (
    h === null ? ((r.next = r), jo(t)) : ((r.next = h.next), (h.next = r)),
    (t.interleaved = r),
    St(e, i)
  );
}
function St(e, t) {
  e.lanes |= t;
  var r = e.alternate;
  for (r !== null && (r.lanes |= t), r = e, e = e.return; e !== null; )
    ((e.childLanes |= t),
    (r = e.alternate),
    r !== null && (r.childLanes |= t),
    (r = e),
    (e = e.return));
  return r.tag === 3 ? r.stateNode : null;
}
var kt = !1;
function Uo(e) {
  e.updateQueue = {
    baseState: e.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, interleaved: null, lanes: 0 },
    effects: null,
  };
}
function Nc(e, t) {
  ((e = e.updateQueue),
  t.updateQueue === e &&
      (t.updateQueue = {
        baseState: e.baseState,
        firstBaseUpdate: e.firstBaseUpdate,
        lastBaseUpdate: e.lastBaseUpdate,
        shared: e.shared,
        effects: e.effects,
      }));
}
function mt(e, t) {
  return {
    eventTime: e,
    lane: t,
    tag: 0,
    payload: null,
    callback: null,
    next: null,
  };
}
function Ot(e, t, r) {
  var i = e.updateQueue;
  if (i === null) return null;
  if (((i = i.shared), te & 2)) {
    var h = i.pending;
    return (
      h === null ? (t.next = t) : ((t.next = h.next), (h.next = t)),
      (i.pending = t),
      St(e, r)
    );
  }
  return (
    (h = i.interleaved),
    h === null ? ((t.next = t), jo(i)) : ((t.next = h.next), (h.next = t)),
    (i.interleaved = t),
    St(e, r)
  );
}
function Ji(e, t, r) {
  if (
    ((t = t.updateQueue), t !== null && ((t = t.shared), (r & 4194240) !== 0))
  ) {
    var i = t.lanes;
    ((i &= e.pendingLanes), (r |= i), (t.lanes = r), Do(e, r));
  }
}
function Ga(e, t) {
  var r = e.updateQueue,
    i = e.alternate;
  if (i !== null && ((i = i.updateQueue), r === i)) {
    var h = null,
      m = null;
    if (((r = r.firstBaseUpdate), r !== null)) {
      do {
        var y = {
          eventTime: r.eventTime,
          lane: r.lane,
          tag: r.tag,
          payload: r.payload,
          callback: r.callback,
          next: null,
        };
        (m === null ? (h = m = y) : (m = m.next = y), (r = r.next));
      } while (r !== null);
      m === null ? (h = m = t) : (m = m.next = t);
    } else h = m = t;
    ((r = {
      baseState: i.baseState,
      firstBaseUpdate: h,
      lastBaseUpdate: m,
      shared: i.shared,
      effects: i.effects,
    }),
    (e.updateQueue = r));
    return;
  }
  ((e = r.lastBaseUpdate),
  e === null ? (r.firstBaseUpdate = t) : (e.next = t),
  (r.lastBaseUpdate = t));
}
function ys(e, t, r, i) {
  var h = e.updateQueue;
  kt = !1;
  var m = h.firstBaseUpdate,
    y = h.lastBaseUpdate,
    a = h.shared.pending;
  if (a !== null) {
    h.shared.pending = null;
    var l = a,
      f = l.next;
    ((l.next = null), y === null ? (m = f) : (y.next = f), (y = l));
    var g = e.alternate;
    g !== null &&
      ((g = g.updateQueue),
      (a = g.lastBaseUpdate),
      a !== y &&
        (a === null ? (g.firstBaseUpdate = f) : (a.next = f),
        (g.lastBaseUpdate = l)));
  }
  if (m !== null) {
    var u = h.baseState;
    ((y = 0), (g = f = l = null), (a = m));
    do {
      var d = a.lane,
        v = a.eventTime;
      if ((i & d) === d) {
        g !== null &&
          (g = g.next =
            {
              eventTime: v,
              lane: 0,
              tag: a.tag,
              payload: a.payload,
              callback: a.callback,
              next: null,
            });
        e: {
          var w = e,
            p = a;
          switch (((d = t), (v = r), p.tag)) {
          case 1:
            if (((w = p.payload), typeof w == 'function')) {
              u = w.call(v, u, d);
              break e;
            }
            u = w;
            break e;
          case 3:
            w.flags = (w.flags & -65537) | 128;
          case 0:
            if (
              ((w = p.payload),
              (d = typeof w == 'function' ? w.call(v, u, d) : w),
              d == null)
            )
              break e;
            u = ue({}, u, d);
            break e;
          case 2:
            kt = !0;
          }
        }
        a.callback !== null &&
          a.lane !== 0 &&
          ((e.flags |= 64),
          (d = h.effects),
          d === null ? (h.effects = [a]) : d.push(a));
      } else
        ((v = {
          eventTime: v,
          lane: d,
          tag: a.tag,
          payload: a.payload,
          callback: a.callback,
          next: null,
        }),
        g === null ? ((f = g = v), (l = u)) : (g = g.next = v),
        (y |= d));
      if (((a = a.next), a === null)) {
        if (((a = h.shared.pending), a === null)) break;
        ((d = a),
        (a = d.next),
        (d.next = null),
        (h.lastBaseUpdate = d),
        (h.shared.pending = null));
      }
    } while (!0);
    if (
      (g === null && (l = u),
      (h.baseState = l),
      (h.firstBaseUpdate = f),
      (h.lastBaseUpdate = g),
      (t = h.shared.interleaved),
      t !== null)
    ) {
      h = t;
      do ((y |= h.lane), (h = h.next));
      while (h !== t);
    } else m === null && (h.shared.lanes = 0);
    ((er |= y), (e.lanes = y), (e.memoizedState = u));
  }
}
function Xa(e, t, r) {
  if (((e = t.effects), (t.effects = null), e !== null))
    for (t = 0; t < e.length; t++) {
      var i = e[t],
        h = i.callback;
      if (h !== null) {
        if (((i.callback = null), (i = r), typeof h != 'function'))
          throw Error(V(191, h));
        h.call(i);
      }
    }
}
var Li = {},
  ut = jt(Li),
  vi = jt(Li),
  gi = jt(Li);
function Gt(e) {
  if (e === Li) throw Error(V(174));
  return e;
}
function $o(e, t) {
  switch ((se(gi, t), se(vi, e), se(ut, Li), (e = t.nodeType), e)) {
  case 9:
  case 11:
    t = (t = t.documentElement) ? t.namespaceURI : Pn(null, '');
    break;
  default:
    ((e = e === 8 ? t.parentNode : t),
    (t = e.namespaceURI || null),
    (e = e.tagName),
    (t = Pn(t, e)));
  }
  (oe(ut), se(ut, t));
}
function Dr() {
  (oe(ut), oe(vi), oe(gi));
}
function Fc(e) {
  Gt(gi.current);
  var t = Gt(ut.current),
    r = Pn(t, e.type);
  t !== r && (se(vi, e), se(ut, r));
}
function Vo(e) {
  vi.current === e && (oe(ut), oe(vi));
}
var ce = jt(0);
function ws(e) {
  for (var t = e; t !== null; ) {
    if (t.tag === 13) {
      var r = t.memoizedState;
      if (
        r !== null &&
        ((r = r.dehydrated), r === null || r.data === '$?' || r.data === '$!')
      )
        return t;
    } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
      if (t.flags & 128) return t;
    } else if (t.child !== null) {
      ((t.child.return = t), (t = t.child));
      continue;
    }
    if (t === e) break;
    for (; t.sibling === null; ) {
      if (t.return === null || t.return === e) return null;
      t = t.return;
    }
    ((t.sibling.return = t.return), (t = t.sibling));
  }
  return null;
}
var _n = [];
function Ko() {
  for (var e = 0; e < _n.length; e++)
    _n[e]._workInProgressVersionPrimary = null;
  _n.length = 0;
}
var Zi = wt.ReactCurrentDispatcher,
  pn = wt.ReactCurrentBatchConfig,
  Zt = 0,
  he = null,
  ve = null,
  Se = null,
  Cs = !1,
  ri = !1,
  Si = 0,
  Hd = 0;
function xe() {
  throw Error(V(321));
}
function qo(e, t) {
  if (t === null) return !1;
  for (var r = 0; r < t.length && r < e.length; r++)
    if (!nt(e[r], t[r])) return !1;
  return !0;
}
function Go(e, t, r, i, h, m) {
  if (
    ((Zt = m),
    (he = t),
    (t.memoizedState = null),
    (t.updateQueue = null),
    (t.lanes = 0),
    (Zi.current = e === null || e.memoizedState === null ? Wd : jd),
    (e = r(i, h)),
    ri)
  ) {
    m = 0;
    do {
      if (((ri = !1), (Si = 0), 25 <= m)) throw Error(V(301));
      ((m += 1),
      (Se = ve = null),
      (t.updateQueue = null),
      (Zi.current = Ud),
      (e = r(i, h)));
    } while (ri);
  }
  if (
    ((Zi.current = bs),
    (t = ve !== null && ve.next !== null),
    (Zt = 0),
    (Se = ve = he = null),
    (Cs = !1),
    t)
  )
    throw Error(V(300));
  return e;
}
function Xo() {
  var e = Si !== 0;
  return ((Si = 0), e);
}
function lt() {
  var e = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };
  return (Se === null ? (he.memoizedState = Se = e) : (Se = Se.next = e), Se);
}
function Qe() {
  if (ve === null) {
    var e = he.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = ve.next;
  var t = Se === null ? he.memoizedState : Se.next;
  if (t !== null) ((Se = t), (ve = e));
  else {
    if (e === null) throw Error(V(310));
    ((ve = e),
    (e = {
      memoizedState: ve.memoizedState,
      baseState: ve.baseState,
      baseQueue: ve.baseQueue,
      queue: ve.queue,
      next: null,
    }),
    Se === null ? (he.memoizedState = Se = e) : (Se = Se.next = e));
  }
  return Se;
}
function yi(e, t) {
  return typeof t == 'function' ? t(e) : t;
}
function mn(e) {
  var t = Qe(),
    r = t.queue;
  if (r === null) throw Error(V(311));
  r.lastRenderedReducer = e;
  var i = ve,
    h = i.baseQueue,
    m = r.pending;
  if (m !== null) {
    if (h !== null) {
      var y = h.next;
      ((h.next = m.next), (m.next = y));
    }
    ((i.baseQueue = h = m), (r.pending = null));
  }
  if (h !== null) {
    ((m = h.next), (i = i.baseState));
    var a = (y = null),
      l = null,
      f = m;
    do {
      var g = f.lane;
      if ((Zt & g) === g)
        (l !== null &&
          (l = l.next =
            {
              lane: 0,
              action: f.action,
              hasEagerState: f.hasEagerState,
              eagerState: f.eagerState,
              next: null,
            }),
        (i = f.hasEagerState ? f.eagerState : e(i, f.action)));
      else {
        var u = {
          lane: g,
          action: f.action,
          hasEagerState: f.hasEagerState,
          eagerState: f.eagerState,
          next: null,
        };
        (l === null ? ((a = l = u), (y = i)) : (l = l.next = u),
        (he.lanes |= g),
        (er |= g));
      }
      f = f.next;
    } while (f !== null && f !== m);
    (l === null ? (y = i) : (l.next = a),
    nt(i, t.memoizedState) || (Be = !0),
    (t.memoizedState = i),
    (t.baseState = y),
    (t.baseQueue = l),
    (r.lastRenderedState = i));
  }
  if (((e = r.interleaved), e !== null)) {
    h = e;
    do ((m = h.lane), (he.lanes |= m), (er |= m), (h = h.next));
    while (h !== e);
  } else h === null && (r.lanes = 0);
  return [t.memoizedState, r.dispatch];
}
function vn(e) {
  var t = Qe(),
    r = t.queue;
  if (r === null) throw Error(V(311));
  r.lastRenderedReducer = e;
  var i = r.dispatch,
    h = r.pending,
    m = t.memoizedState;
  if (h !== null) {
    r.pending = null;
    var y = (h = h.next);
    do ((m = e(m, y.action)), (y = y.next));
    while (y !== h);
    (nt(m, t.memoizedState) || (Be = !0),
    (t.memoizedState = m),
    t.baseQueue === null && (t.baseState = m),
    (r.lastRenderedState = m));
  }
  return [m, i];
}
function zc() {}
function Wc(e, t) {
  var r = he,
    i = Qe(),
    h = t(),
    m = !nt(i.memoizedState, h);
  if (
    (m && ((i.memoizedState = h), (Be = !0)),
    (i = i.queue),
    Yo($c.bind(null, r, i, e), [e]),
    i.getSnapshot !== t || m || (Se !== null && Se.memoizedState.tag & 1))
  ) {
    if (
      ((r.flags |= 2048),
      wi(9, Uc.bind(null, r, i, h, t), void 0, null),
      ye === null)
    )
      throw Error(V(349));
    Zt & 30 || jc(r, t, h);
  }
  return h;
}
function jc(e, t, r) {
  ((e.flags |= 16384),
  (e = { getSnapshot: t, value: r }),
  (t = he.updateQueue),
  t === null
    ? ((t = { lastEffect: null, stores: null }),
    (he.updateQueue = t),
    (t.stores = [e]))
    : ((r = t.stores), r === null ? (t.stores = [e]) : r.push(e)));
}
function Uc(e, t, r, i) {
  ((t.value = r), (t.getSnapshot = i), Vc(t) && Kc(e));
}
function $c(e, t, r) {
  return r(function () {
    Vc(t) && Kc(e);
  });
}
function Vc(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var r = t();
    return !nt(e, r);
  } catch {
    return !0;
  }
}
function Kc(e) {
  var t = St(e, 1);
  t !== null && st(t, e, 1, -1);
}
function Ya(e) {
  var t = lt();
  return (
    typeof e == 'function' && (e = e()),
    (t.memoizedState = t.baseState = e),
    (e = {
      pending: null,
      interleaved: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: yi,
      lastRenderedState: e,
    }),
    (t.queue = e),
    (e = e.dispatch = zd.bind(null, he, e)),
    [t.memoizedState, e]
  );
}
function wi(e, t, r, i) {
  return (
    (e = { tag: e, create: t, destroy: r, deps: i, next: null }),
    (t = he.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
      (he.updateQueue = t),
      (t.lastEffect = e.next = e))
      : ((r = t.lastEffect),
      r === null
        ? (t.lastEffect = e.next = e)
        : ((i = r.next), (r.next = e), (e.next = i), (t.lastEffect = e))),
    e
  );
}
function qc() {
  return Qe().memoizedState;
}
function es(e, t, r, i) {
  var h = lt();
  ((he.flags |= e),
  (h.memoizedState = wi(1 | t, r, void 0, i === void 0 ? null : i)));
}
function Is(e, t, r, i) {
  var h = Qe();
  i = i === void 0 ? null : i;
  var m = void 0;
  if (ve !== null) {
    var y = ve.memoizedState;
    if (((m = y.destroy), i !== null && qo(i, y.deps))) {
      h.memoizedState = wi(t, r, m, i);
      return;
    }
  }
  ((he.flags |= e), (h.memoizedState = wi(1 | t, r, m, i)));
}
function Qa(e, t) {
  return es(8390656, 8, e, t);
}
function Yo(e, t) {
  return Is(2048, 8, e, t);
}
function Gc(e, t) {
  return Is(4, 2, e, t);
}
function Xc(e, t) {
  return Is(4, 4, e, t);
}
function Yc(e, t) {
  if (typeof t == 'function')
    return (
      (e = e()),
      t(e),
      function () {
        t(null);
      }
    );
  if (t != null)
    return (
      (e = e()),
      (t.current = e),
      function () {
        t.current = null;
      }
    );
}
function Qc(e, t, r) {
  return (
    (r = r != null ? r.concat([e]) : null),
    Is(4, 4, Yc.bind(null, t, e), r)
  );
}
function Qo() {}
function Jc(e, t) {
  var r = Qe();
  t = t === void 0 ? null : t;
  var i = r.memoizedState;
  return i !== null && t !== null && qo(t, i[1])
    ? i[0]
    : ((r.memoizedState = [e, t]), e);
}
function Zc(e, t) {
  var r = Qe();
  t = t === void 0 ? null : t;
  var i = r.memoizedState;
  return i !== null && t !== null && qo(t, i[1])
    ? i[0]
    : ((e = e()), (r.memoizedState = [e, t]), e);
}
function eh(e, t, r) {
  return Zt & 21
    ? (nt(r, t) || ((r = nc()), (he.lanes |= r), (er |= r), (e.baseState = !0)),
    t)
    : (e.baseState && ((e.baseState = !1), (Be = !0)), (e.memoizedState = r));
}
function Nd(e, t) {
  var r = re;
  ((re = r !== 0 && 4 > r ? r : 4), e(!0));
  var i = pn.transition;
  pn.transition = {};
  try {
    (e(!1), t());
  } finally {
    ((re = r), (pn.transition = i));
  }
}
function th() {
  return Qe().memoizedState;
}
function Fd(e, t, r) {
  var i = Ht(e);
  if (
    ((r = {
      lane: i,
      action: r,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    }),
    rh(e))
  )
    ih(t, r);
  else if (((r = Hc(e, t, r, i)), r !== null)) {
    var h = Re();
    (st(r, e, i, h), sh(r, t, i));
  }
}
function zd(e, t, r) {
  var i = Ht(e),
    h = { lane: i, action: r, hasEagerState: !1, eagerState: null, next: null };
  if (rh(e)) ih(t, h);
  else {
    var m = e.alternate;
    if (
      e.lanes === 0 &&
      (m === null || m.lanes === 0) &&
      ((m = t.lastRenderedReducer), m !== null)
    )
      try {
        var y = t.lastRenderedState,
          a = m(y, r);
        if (((h.hasEagerState = !0), (h.eagerState = a), nt(a, y))) {
          var l = t.interleaved;
          (l === null
            ? ((h.next = h), jo(t))
            : ((h.next = l.next), (l.next = h)),
          (t.interleaved = h));
          return;
        }
      } catch {
      } finally {
      }
    ((r = Hc(e, t, h, i)),
    r !== null && ((h = Re()), st(r, e, i, h), sh(r, t, i)));
  }
}
function rh(e) {
  var t = e.alternate;
  return e === he || (t !== null && t === he);
}
function ih(e, t) {
  ri = Cs = !0;
  var r = e.pending;
  (r === null ? (t.next = t) : ((t.next = r.next), (r.next = t)),
  (e.pending = t));
}
function sh(e, t, r) {
  if (r & 4194240) {
    var i = t.lanes;
    ((i &= e.pendingLanes), (r |= i), (t.lanes = r), Do(e, r));
  }
}
var bs = {
    readContext: Ye,
    useCallback: xe,
    useContext: xe,
    useEffect: xe,
    useImperativeHandle: xe,
    useInsertionEffect: xe,
    useLayoutEffect: xe,
    useMemo: xe,
    useReducer: xe,
    useRef: xe,
    useState: xe,
    useDebugValue: xe,
    useDeferredValue: xe,
    useTransition: xe,
    useMutableSource: xe,
    useSyncExternalStore: xe,
    useId: xe,
    unstable_isNewReconciler: !1,
  },
  Wd = {
    readContext: Ye,
    useCallback: function (e, t) {
      return ((lt().memoizedState = [e, t === void 0 ? null : t]), e);
    },
    useContext: Ye,
    useEffect: Qa,
    useImperativeHandle: function (e, t, r) {
      return (
        (r = r != null ? r.concat([e]) : null),
        es(4194308, 4, Yc.bind(null, t, e), r)
      );
    },
    useLayoutEffect: function (e, t) {
      return es(4194308, 4, e, t);
    },
    useInsertionEffect: function (e, t) {
      return es(4, 2, e, t);
    },
    useMemo: function (e, t) {
      var r = lt();
      return (
        (t = t === void 0 ? null : t),
        (e = e()),
        (r.memoizedState = [e, t]),
        e
      );
    },
    useReducer: function (e, t, r) {
      var i = lt();
      return (
        (t = r !== void 0 ? r(t) : t),
        (i.memoizedState = i.baseState = t),
        (e = {
          pending: null,
          interleaved: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: e,
          lastRenderedState: t,
        }),
        (i.queue = e),
        (e = e.dispatch = Fd.bind(null, he, e)),
        [i.memoizedState, e]
      );
    },
    useRef: function (e) {
      var t = lt();
      return ((e = { current: e }), (t.memoizedState = e));
    },
    useState: Ya,
    useDebugValue: Qo,
    useDeferredValue: function (e) {
      return (lt().memoizedState = e);
    },
    useTransition: function () {
      var e = Ya(!1),
        t = e[0];
      return ((e = Nd.bind(null, e[1])), (lt().memoizedState = e), [t, e]);
    },
    useMutableSource: function () {},
    useSyncExternalStore: function (e, t, r) {
      var i = he,
        h = lt();
      if (ae) {
        if (r === void 0) throw Error(V(407));
        r = r();
      } else {
        if (((r = t()), ye === null)) throw Error(V(349));
        Zt & 30 || jc(i, t, r);
      }
      h.memoizedState = r;
      var m = { value: r, getSnapshot: t };
      return (
        (h.queue = m),
        Qa($c.bind(null, i, m, e), [e]),
        (i.flags |= 2048),
        wi(9, Uc.bind(null, i, m, r, t), void 0, null),
        r
      );
    },
    useId: function () {
      var e = lt(),
        t = ye.identifierPrefix;
      if (ae) {
        var r = pt,
          i = _t;
        ((r = (i & ~(1 << (32 - it(i) - 1))).toString(32) + r),
        (t = ':' + t + 'R' + r),
        (r = Si++),
        0 < r && (t += 'H' + r.toString(32)),
        (t += ':'));
      } else ((r = Hd++), (t = ':' + t + 'r' + r.toString(32) + ':'));
      return (e.memoizedState = t);
    },
    unstable_isNewReconciler: !1,
  },
  jd = {
    readContext: Ye,
    useCallback: Jc,
    useContext: Ye,
    useEffect: Yo,
    useImperativeHandle: Qc,
    useInsertionEffect: Gc,
    useLayoutEffect: Xc,
    useMemo: Zc,
    useReducer: mn,
    useRef: qc,
    useState: function () {
      return mn(yi);
    },
    useDebugValue: Qo,
    useDeferredValue: function (e) {
      var t = Qe();
      return eh(t, ve.memoizedState, e);
    },
    useTransition: function () {
      var e = mn(yi)[0],
        t = Qe().memoizedState;
      return [e, t];
    },
    useMutableSource: zc,
    useSyncExternalStore: Wc,
    useId: th,
    unstable_isNewReconciler: !1,
  },
  Ud = {
    readContext: Ye,
    useCallback: Jc,
    useContext: Ye,
    useEffect: Yo,
    useImperativeHandle: Qc,
    useInsertionEffect: Gc,
    useLayoutEffect: Xc,
    useMemo: Zc,
    useReducer: vn,
    useRef: qc,
    useState: function () {
      return vn(yi);
    },
    useDebugValue: Qo,
    useDeferredValue: function (e) {
      var t = Qe();
      return ve === null ? (t.memoizedState = e) : eh(t, ve.memoizedState, e);
    },
    useTransition: function () {
      var e = vn(yi)[0],
        t = Qe().memoizedState;
      return [e, t];
    },
    useMutableSource: zc,
    useSyncExternalStore: Wc,
    useId: th,
    unstable_isNewReconciler: !1,
  };
function et(e, t) {
  if (e && e.defaultProps) {
    ((t = ue({}, t)), (e = e.defaultProps));
    for (var r in e) t[r] === void 0 && (t[r] = e[r]);
    return t;
  }
  return t;
}
function Zn(e, t, r, i) {
  ((t = e.memoizedState),
  (r = r(i, t)),
  (r = r == null ? t : ue({}, t, r)),
  (e.memoizedState = r),
  e.lanes === 0 && (e.updateQueue.baseState = r));
}
var Hs = {
  isMounted: function (e) {
    return (e = e._reactInternals) ? ir(e) === e : !1;
  },
  enqueueSetState: function (e, t, r) {
    e = e._reactInternals;
    var i = Re(),
      h = Ht(e),
      m = mt(i, h);
    ((m.payload = t),
    r != null && (m.callback = r),
    (t = Ot(e, m, h)),
    t !== null && (st(t, e, h, i), Ji(t, e, h)));
  },
  enqueueReplaceState: function (e, t, r) {
    e = e._reactInternals;
    var i = Re(),
      h = Ht(e),
      m = mt(i, h);
    ((m.tag = 1),
    (m.payload = t),
    r != null && (m.callback = r),
    (t = Ot(e, m, h)),
    t !== null && (st(t, e, h, i), Ji(t, e, h)));
  },
  enqueueForceUpdate: function (e, t) {
    e = e._reactInternals;
    var r = Re(),
      i = Ht(e),
      h = mt(r, i);
    ((h.tag = 2),
    t != null && (h.callback = t),
    (t = Ot(e, h, i)),
    t !== null && (st(t, e, i, r), Ji(t, e, i)));
  },
};
function Ja(e, t, r, i, h, m, y) {
  return (
    (e = e.stateNode),
    typeof e.shouldComponentUpdate == 'function'
      ? e.shouldComponentUpdate(i, m, y)
      : t.prototype && t.prototype.isPureReactComponent
        ? !fi(r, i) || !fi(h, m)
        : !0
  );
}
function nh(e, t, r) {
  var i = !1,
    h = zt,
    m = t.contextType;
  return (
    typeof m == 'object' && m !== null
      ? (m = Ye(m))
      : ((h = Ie(t) ? Qt : Le.current),
      (i = t.contextTypes),
      (m = (i = i != null) ? Er(e, h) : zt)),
    (t = new t(r, m)),
    (e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null),
    (t.updater = Hs),
    (e.stateNode = t),
    (t._reactInternals = e),
    i &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = h),
      (e.__reactInternalMemoizedMaskedChildContext = m)),
    t
  );
}
function Za(e, t, r, i) {
  ((e = t.state),
  typeof t.componentWillReceiveProps == 'function' &&
      t.componentWillReceiveProps(r, i),
  typeof t.UNSAFE_componentWillReceiveProps == 'function' &&
      t.UNSAFE_componentWillReceiveProps(r, i),
  t.state !== e && Hs.enqueueReplaceState(t, t.state, null));
}
function eo(e, t, r, i) {
  var h = e.stateNode;
  ((h.props = r), (h.state = e.memoizedState), (h.refs = {}), Uo(e));
  var m = t.contextType;
  (typeof m == 'object' && m !== null
    ? (h.context = Ye(m))
    : ((m = Ie(t) ? Qt : Le.current), (h.context = Er(e, m))),
  (h.state = e.memoizedState),
  (m = t.getDerivedStateFromProps),
  typeof m == 'function' && (Zn(e, t, m, r), (h.state = e.memoizedState)),
  typeof t.getDerivedStateFromProps == 'function' ||
      typeof h.getSnapshotBeforeUpdate == 'function' ||
      (typeof h.UNSAFE_componentWillMount != 'function' &&
        typeof h.componentWillMount != 'function') ||
      ((t = h.state),
      typeof h.componentWillMount == 'function' && h.componentWillMount(),
      typeof h.UNSAFE_componentWillMount == 'function' &&
        h.UNSAFE_componentWillMount(),
      t !== h.state && Hs.enqueueReplaceState(h, h.state, null),
      ys(e, r, h, i),
      (h.state = e.memoizedState)),
  typeof h.componentDidMount == 'function' && (e.flags |= 4194308));
}
function Rr(e, t) {
  try {
    var r = '',
      i = t;
    do ((r += vu(i)), (i = i.return));
    while (i);
    var h = r;
  } catch (m) {
    h =
      `
Error generating stack: ` +
      m.message +
      `
` +
      m.stack;
  }
  return { value: e, source: t, stack: h, digest: null };
}
function gn(e, t, r) {
  return { value: e, source: null, stack: r ?? null, digest: t ?? null };
}
function to(e, t) {
  try {
    console.error(t.value);
  } catch (r) {
    setTimeout(function () {
      throw r;
    });
  }
}
var $d = typeof WeakMap == 'function' ? WeakMap : Map;
function oh(e, t, r) {
  ((r = mt(-1, r)), (r.tag = 3), (r.payload = { element: null }));
  var i = t.value;
  return (
    (r.callback = function () {
      (Es || ((Es = !0), (uo = i)), to(e, t));
    }),
    r
  );
}
function ah(e, t, r) {
  ((r = mt(-1, r)), (r.tag = 3));
  var i = e.type.getDerivedStateFromError;
  if (typeof i == 'function') {
    var h = t.value;
    ((r.payload = function () {
      return i(h);
    }),
    (r.callback = function () {
      to(e, t);
    }));
  }
  var m = e.stateNode;
  return (
    m !== null &&
      typeof m.componentDidCatch == 'function' &&
      (r.callback = function () {
        (to(e, t),
        typeof i != 'function' &&
            (It === null ? (It = new Set([this])) : It.add(this)));
        var y = t.stack;
        this.componentDidCatch(t.value, {
          componentStack: y !== null ? y : '',
        });
      }),
    r
  );
}
function el(e, t, r) {
  var i = e.pingCache;
  if (i === null) {
    i = e.pingCache = new $d();
    var h = new Set();
    i.set(t, h);
  } else ((h = i.get(t)), h === void 0 && ((h = new Set()), i.set(t, h)));
  h.has(r) || (h.add(r), (e = nf.bind(null, e, t, r)), t.then(e, e));
}
function tl(e) {
  do {
    var t;
    if (
      ((t = e.tag === 13) &&
        ((t = e.memoizedState), (t = t !== null ? t.dehydrated !== null : !0)),
      t)
    )
      return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function rl(e, t, r, i, h) {
  return e.mode & 1
    ? ((e.flags |= 65536), (e.lanes = h), e)
    : (e === t
      ? (e.flags |= 65536)
      : ((e.flags |= 128),
      (r.flags |= 131072),
      (r.flags &= -52805),
      r.tag === 1 &&
            (r.alternate === null
              ? (r.tag = 17)
              : ((t = mt(-1, 1)), (t.tag = 2), Ot(r, t, 1))),
      (r.lanes |= 1)),
    e);
}
var Vd = wt.ReactCurrentOwner,
  Be = !1;
function De(e, t, r, i) {
  t.child = e === null ? Ic(t, null, r, i) : Lr(t, e.child, r, i);
}
function il(e, t, r, i, h) {
  r = r.render;
  var m = t.ref;
  return (
    Cr(t, h),
    (i = Go(e, t, r, i, m, h)),
    (r = Xo()),
    e !== null && !Be
      ? ((t.updateQueue = e.updateQueue),
      (t.flags &= -2053),
      (e.lanes &= ~h),
      yt(e, t, h))
      : (ae && r && Io(t), (t.flags |= 1), De(e, t, i, h), t.child)
  );
}
function sl(e, t, r, i, h) {
  if (e === null) {
    var m = r.type;
    return typeof m == 'function' &&
      !na(m) &&
      m.defaultProps === void 0 &&
      r.compare === null &&
      r.defaultProps === void 0
      ? ((t.tag = 15), (t.type = m), lh(e, t, m, i, h))
      : ((e = ss(r.type, null, i, t, t.mode, h)),
      (e.ref = t.ref),
      (e.return = t),
      (t.child = e));
  }
  if (((m = e.child), !(e.lanes & h))) {
    var y = m.memoizedProps;
    if (
      ((r = r.compare), (r = r !== null ? r : fi), r(y, i) && e.ref === t.ref)
    )
      return yt(e, t, h);
  }
  return (
    (t.flags |= 1),
    (e = Nt(m, i)),
    (e.ref = t.ref),
    (e.return = t),
    (t.child = e)
  );
}
function lh(e, t, r, i, h) {
  if (e !== null) {
    var m = e.memoizedProps;
    if (fi(m, i) && e.ref === t.ref)
      if (((Be = !1), (t.pendingProps = i = m), (e.lanes & h) !== 0))
        e.flags & 131072 && (Be = !0);
      else return ((t.lanes = e.lanes), yt(e, t, h));
  }
  return ro(e, t, r, i, h);
}
function ch(e, t, r) {
  var i = t.pendingProps,
    h = i.children,
    m = e !== null ? e.memoizedState : null;
  if (i.mode === 'hidden')
    if (!(t.mode & 1))
      ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
      se(vr, Fe),
      (Fe |= r));
    else {
      if (!(r & 1073741824))
        return (
          (e = m !== null ? m.baseLanes | r : r),
          (t.lanes = t.childLanes = 1073741824),
          (t.memoizedState = {
            baseLanes: e,
            cachePool: null,
            transitions: null,
          }),
          (t.updateQueue = null),
          se(vr, Fe),
          (Fe |= e),
          null
        );
      ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
      (i = m !== null ? m.baseLanes : r),
      se(vr, Fe),
      (Fe |= i));
    }
  else
    (m !== null ? ((i = m.baseLanes | r), (t.memoizedState = null)) : (i = r),
    se(vr, Fe),
    (Fe |= i));
  return (De(e, t, h, r), t.child);
}
function hh(e, t) {
  var r = t.ref;
  ((e === null && r !== null) || (e !== null && e.ref !== r)) &&
    ((t.flags |= 512), (t.flags |= 2097152));
}
function ro(e, t, r, i, h) {
  var m = Ie(r) ? Qt : Le.current;
  return (
    (m = Er(t, m)),
    Cr(t, h),
    (r = Go(e, t, r, i, m, h)),
    (i = Xo()),
    e !== null && !Be
      ? ((t.updateQueue = e.updateQueue),
      (t.flags &= -2053),
      (e.lanes &= ~h),
      yt(e, t, h))
      : (ae && i && Io(t), (t.flags |= 1), De(e, t, r, h), t.child)
  );
}
function nl(e, t, r, i, h) {
  if (Ie(r)) {
    var m = !0;
    ps(t);
  } else m = !1;
  if ((Cr(t, h), t.stateNode === null))
    (ts(e, t), nh(t, r, i), eo(t, r, i, h), (i = !0));
  else if (e === null) {
    var y = t.stateNode,
      a = t.memoizedProps;
    y.props = a;
    var l = y.context,
      f = r.contextType;
    typeof f == 'object' && f !== null
      ? (f = Ye(f))
      : ((f = Ie(r) ? Qt : Le.current), (f = Er(t, f)));
    var g = r.getDerivedStateFromProps,
      u =
        typeof g == 'function' ||
        typeof y.getSnapshotBeforeUpdate == 'function';
    (u ||
      (typeof y.UNSAFE_componentWillReceiveProps != 'function' &&
        typeof y.componentWillReceiveProps != 'function') ||
      ((a !== i || l !== f) && Za(t, y, i, f)),
    (kt = !1));
    var d = t.memoizedState;
    ((y.state = d),
    ys(t, i, y, h),
    (l = t.memoizedState),
    a !== i || d !== l || Oe.current || kt
      ? (typeof g == 'function' && (Zn(t, r, g, i), (l = t.memoizedState)),
      (a = kt || Ja(t, r, a, i, d, l, f))
        ? (u ||
                (typeof y.UNSAFE_componentWillMount != 'function' &&
                  typeof y.componentWillMount != 'function') ||
                (typeof y.componentWillMount == 'function' &&
                  y.componentWillMount(),
                typeof y.UNSAFE_componentWillMount == 'function' &&
                  y.UNSAFE_componentWillMount()),
        typeof y.componentDidMount == 'function' && (t.flags |= 4194308))
        : (typeof y.componentDidMount == 'function' && (t.flags |= 4194308),
        (t.memoizedProps = i),
        (t.memoizedState = l)),
      (y.props = i),
      (y.state = l),
      (y.context = f),
      (i = a))
      : (typeof y.componentDidMount == 'function' && (t.flags |= 4194308),
      (i = !1)));
  } else {
    ((y = t.stateNode),
    Nc(e, t),
    (a = t.memoizedProps),
    (f = t.type === t.elementType ? a : et(t.type, a)),
    (y.props = f),
    (u = t.pendingProps),
    (d = y.context),
    (l = r.contextType),
    typeof l == 'object' && l !== null
      ? (l = Ye(l))
      : ((l = Ie(r) ? Qt : Le.current), (l = Er(t, l))));
    var v = r.getDerivedStateFromProps;
    ((g =
      typeof v == 'function' ||
      typeof y.getSnapshotBeforeUpdate == 'function') ||
      (typeof y.UNSAFE_componentWillReceiveProps != 'function' &&
        typeof y.componentWillReceiveProps != 'function') ||
      ((a !== u || d !== l) && Za(t, y, i, l)),
    (kt = !1),
    (d = t.memoizedState),
    (y.state = d),
    ys(t, i, y, h));
    var w = t.memoizedState;
    a !== u || d !== w || Oe.current || kt
      ? (typeof v == 'function' && (Zn(t, r, v, i), (w = t.memoizedState)),
      (f = kt || Ja(t, r, f, i, d, w, l) || !1)
        ? (g ||
              (typeof y.UNSAFE_componentWillUpdate != 'function' &&
                typeof y.componentWillUpdate != 'function') ||
              (typeof y.componentWillUpdate == 'function' &&
                y.componentWillUpdate(i, w, l),
              typeof y.UNSAFE_componentWillUpdate == 'function' &&
                y.UNSAFE_componentWillUpdate(i, w, l)),
        typeof y.componentDidUpdate == 'function' && (t.flags |= 4),
        typeof y.getSnapshotBeforeUpdate == 'function' && (t.flags |= 1024))
        : (typeof y.componentDidUpdate != 'function' ||
              (a === e.memoizedProps && d === e.memoizedState) ||
              (t.flags |= 4),
        typeof y.getSnapshotBeforeUpdate != 'function' ||
              (a === e.memoizedProps && d === e.memoizedState) ||
              (t.flags |= 1024),
        (t.memoizedProps = i),
        (t.memoizedState = w)),
      (y.props = i),
      (y.state = w),
      (y.context = l),
      (i = f))
      : (typeof y.componentDidUpdate != 'function' ||
          (a === e.memoizedProps && d === e.memoizedState) ||
          (t.flags |= 4),
      typeof y.getSnapshotBeforeUpdate != 'function' ||
          (a === e.memoizedProps && d === e.memoizedState) ||
          (t.flags |= 1024),
      (i = !1));
  }
  return io(e, t, r, i, m, h);
}
function io(e, t, r, i, h, m) {
  hh(e, t);
  var y = (t.flags & 128) !== 0;
  if (!i && !y) return (h && $a(t, r, !1), yt(e, t, m));
  ((i = t.stateNode), (Vd.current = t));
  var a =
    y && typeof r.getDerivedStateFromError != 'function' ? null : i.render();
  return (
    (t.flags |= 1),
    e !== null && y
      ? ((t.child = Lr(t, e.child, null, m)), (t.child = Lr(t, null, a, m)))
      : De(e, t, a, m),
    (t.memoizedState = i.state),
    h && $a(t, r, !0),
    t.child
  );
}
function uh(e) {
  var t = e.stateNode;
  (t.pendingContext
    ? Ua(e, t.pendingContext, t.pendingContext !== t.context)
    : t.context && Ua(e, t.context, !1),
  $o(e, t.containerInfo));
}
function ol(e, t, r, i, h) {
  return (kr(), No(h), (t.flags |= 256), De(e, t, r, i), t.child);
}
var so = { dehydrated: null, treeContext: null, retryLane: 0 };
function no(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function dh(e, t, r) {
  var i = t.pendingProps,
    h = ce.current,
    m = !1,
    y = (t.flags & 128) !== 0,
    a;
  if (
    ((a = y) ||
      (a = e !== null && e.memoizedState === null ? !1 : (h & 2) !== 0),
    a
      ? ((m = !0), (t.flags &= -129))
      : (e === null || e.memoizedState !== null) && (h |= 1),
    se(ce, h & 1),
    e === null)
  )
    return (
      Qn(t),
      (e = t.memoizedState),
      e !== null && ((e = e.dehydrated), e !== null)
        ? (t.mode & 1
          ? e.data === '$!'
            ? (t.lanes = 8)
            : (t.lanes = 1073741824)
          : (t.lanes = 1),
        null)
        : ((y = i.children),
        (e = i.fallback),
        m
          ? ((i = t.mode),
          (m = t.child),
          (y = { mode: 'hidden', children: y }),
          !(i & 1) && m !== null
            ? ((m.childLanes = 0), (m.pendingProps = y))
            : (m = zs(y, i, 0, null)),
          (e = Yt(e, i, r, null)),
          (m.return = t),
          (e.return = t),
          (m.sibling = e),
          (t.child = m),
          (t.child.memoizedState = no(r)),
          (t.memoizedState = so),
          e)
          : Jo(t, y))
    );
  if (((h = e.memoizedState), h !== null && ((a = h.dehydrated), a !== null)))
    return Kd(e, t, y, i, a, h, r);
  if (m) {
    ((m = i.fallback), (y = t.mode), (h = e.child), (a = h.sibling));
    var l = { mode: 'hidden', children: i.children };
    return (
      !(y & 1) && t.child !== h
        ? ((i = t.child),
        (i.childLanes = 0),
        (i.pendingProps = l),
        (t.deletions = null))
        : ((i = Nt(h, l)), (i.subtreeFlags = h.subtreeFlags & 14680064)),
      a !== null ? (m = Nt(a, m)) : ((m = Yt(m, y, r, null)), (m.flags |= 2)),
      (m.return = t),
      (i.return = t),
      (i.sibling = m),
      (t.child = i),
      (i = m),
      (m = t.child),
      (y = e.child.memoizedState),
      (y =
        y === null
          ? no(r)
          : {
            baseLanes: y.baseLanes | r,
            cachePool: null,
            transitions: y.transitions,
          }),
      (m.memoizedState = y),
      (m.childLanes = e.childLanes & ~r),
      (t.memoizedState = so),
      i
    );
  }
  return (
    (m = e.child),
    (e = m.sibling),
    (i = Nt(m, { mode: 'visible', children: i.children })),
    !(t.mode & 1) && (i.lanes = r),
    (i.return = t),
    (i.sibling = null),
    e !== null &&
      ((r = t.deletions),
      r === null ? ((t.deletions = [e]), (t.flags |= 16)) : r.push(e)),
    (t.child = i),
    (t.memoizedState = null),
    i
  );
}
function Jo(e, t) {
  return (
    (t = zs({ mode: 'visible', children: t }, e.mode, 0, null)),
    (t.return = e),
    (e.child = t)
  );
}
function Ui(e, t, r, i) {
  return (
    i !== null && No(i),
    Lr(t, e.child, null, r),
    (e = Jo(t, t.pendingProps.children)),
    (e.flags |= 2),
    (t.memoizedState = null),
    e
  );
}
function Kd(e, t, r, i, h, m, y) {
  if (r)
    return t.flags & 256
      ? ((t.flags &= -257), (i = gn(Error(V(422)))), Ui(e, t, y, i))
      : t.memoizedState !== null
        ? ((t.child = e.child), (t.flags |= 128), null)
        : ((m = i.fallback),
        (h = t.mode),
        (i = zs({ mode: 'visible', children: i.children }, h, 0, null)),
        (m = Yt(m, h, y, null)),
        (m.flags |= 2),
        (i.return = t),
        (m.return = t),
        (i.sibling = m),
        (t.child = i),
        t.mode & 1 && Lr(t, e.child, null, y),
        (t.child.memoizedState = no(y)),
        (t.memoizedState = so),
        m);
  if (!(t.mode & 1)) return Ui(e, t, y, null);
  if (h.data === '$!') {
    if (((i = h.nextSibling && h.nextSibling.dataset), i)) var a = i.dgst;
    return (
      (i = a),
      (m = Error(V(419))),
      (i = gn(m, i, void 0)),
      Ui(e, t, y, i)
    );
  }
  if (((a = (y & e.childLanes) !== 0), Be || a)) {
    if (((i = ye), i !== null)) {
      switch (y & -y) {
      case 4:
        h = 2;
        break;
      case 16:
        h = 8;
        break;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        h = 32;
        break;
      case 536870912:
        h = 268435456;
        break;
      default:
        h = 0;
      }
      ((h = h & (i.suspendedLanes | y) ? 0 : h),
      h !== 0 &&
          h !== m.retryLane &&
          ((m.retryLane = h), St(e, h), st(i, e, h, -1)));
    }
    return (sa(), (i = gn(Error(V(421)))), Ui(e, t, y, i));
  }
  return h.data === '$?'
    ? ((t.flags |= 128),
    (t.child = e.child),
    (t = of.bind(null, e)),
    (h._reactRetry = t),
    null)
    : ((e = m.treeContext),
    (ze = Bt(h.nextSibling)),
    (We = t),
    (ae = !0),
    (rt = null),
    e !== null &&
        ((Ke[qe++] = _t),
        (Ke[qe++] = pt),
        (Ke[qe++] = Jt),
        (_t = e.id),
        (pt = e.overflow),
        (Jt = t)),
    (t = Jo(t, i.children)),
    (t.flags |= 4096),
    t);
}
function al(e, t, r) {
  e.lanes |= t;
  var i = e.alternate;
  (i !== null && (i.lanes |= t), Jn(e.return, t, r));
}
function Sn(e, t, r, i, h) {
  var m = e.memoizedState;
  m === null
    ? (e.memoizedState = {
      isBackwards: t,
      rendering: null,
      renderingStartTime: 0,
      last: i,
      tail: r,
      tailMode: h,
    })
    : ((m.isBackwards = t),
    (m.rendering = null),
    (m.renderingStartTime = 0),
    (m.last = i),
    (m.tail = r),
    (m.tailMode = h));
}
function fh(e, t, r) {
  var i = t.pendingProps,
    h = i.revealOrder,
    m = i.tail;
  if ((De(e, t, i.children, r), (i = ce.current), i & 2))
    ((i = (i & 1) | 2), (t.flags |= 128));
  else {
    if (e !== null && e.flags & 128)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && al(e, r, t);
        else if (e.tag === 19) al(e, r, t);
        else if (e.child !== null) {
          ((e.child.return = e), (e = e.child));
          continue;
        }
        if (e === t) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === t) break e;
          e = e.return;
        }
        ((e.sibling.return = e.return), (e = e.sibling));
      }
    i &= 1;
  }
  if ((se(ce, i), !(t.mode & 1))) t.memoizedState = null;
  else
    switch (h) {
    case 'forwards':
      for (r = t.child, h = null; r !== null; )
        ((e = r.alternate),
        e !== null && ws(e) === null && (h = r),
        (r = r.sibling));
      ((r = h),
      r === null
        ? ((h = t.child), (t.child = null))
        : ((h = r.sibling), (r.sibling = null)),
      Sn(t, !1, h, r, m));
      break;
    case 'backwards':
      for (r = null, h = t.child, t.child = null; h !== null; ) {
        if (((e = h.alternate), e !== null && ws(e) === null)) {
          t.child = h;
          break;
        }
        ((e = h.sibling), (h.sibling = r), (r = h), (h = e));
      }
      Sn(t, !0, r, null, m);
      break;
    case 'together':
      Sn(t, !1, null, null, void 0);
      break;
    default:
      t.memoizedState = null;
    }
  return t.child;
}
function ts(e, t) {
  !(t.mode & 1) &&
    e !== null &&
    ((e.alternate = null), (t.alternate = null), (t.flags |= 2));
}
function yt(e, t, r) {
  if (
    (e !== null && (t.dependencies = e.dependencies),
    (er |= t.lanes),
    !(r & t.childLanes))
  )
    return null;
  if (e !== null && t.child !== e.child) throw Error(V(153));
  if (t.child !== null) {
    for (
      e = t.child, r = Nt(e, e.pendingProps), t.child = r, r.return = t;
      e.sibling !== null;

    )
      ((e = e.sibling),
      (r = r.sibling = Nt(e, e.pendingProps)),
      (r.return = t));
    r.sibling = null;
  }
  return t.child;
}
function qd(e, t, r) {
  switch (t.tag) {
  case 3:
    (uh(t), kr());
    break;
  case 5:
    Fc(t);
    break;
  case 1:
    Ie(t.type) && ps(t);
    break;
  case 4:
    $o(t, t.stateNode.containerInfo);
    break;
  case 10:
    var i = t.type._context,
      h = t.memoizedProps.value;
    (se(gs, i._currentValue), (i._currentValue = h));
    break;
  case 13:
    if (((i = t.memoizedState), i !== null))
      return i.dehydrated !== null
        ? (se(ce, ce.current & 1), (t.flags |= 128), null)
        : r & t.child.childLanes
          ? dh(e, t, r)
          : (se(ce, ce.current & 1),
          (e = yt(e, t, r)),
          e !== null ? e.sibling : null);
    se(ce, ce.current & 1);
    break;
  case 19:
    if (((i = (r & t.childLanes) !== 0), e.flags & 128)) {
      if (i) return fh(e, t, r);
      t.flags |= 128;
    }
    if (
      ((h = t.memoizedState),
      h !== null &&
          ((h.rendering = null), (h.tail = null), (h.lastEffect = null)),
      se(ce, ce.current),
      i)
    )
      break;
    return null;
  case 22:
  case 23:
    return ((t.lanes = 0), ch(e, t, r));
  }
  return yt(e, t, r);
}
var _h, oo, ph, mh;
_h = function (e, t) {
  for (var r = t.child; r !== null; ) {
    if (r.tag === 5 || r.tag === 6) e.appendChild(r.stateNode);
    else if (r.tag !== 4 && r.child !== null) {
      ((r.child.return = r), (r = r.child));
      continue;
    }
    if (r === t) break;
    for (; r.sibling === null; ) {
      if (r.return === null || r.return === t) return;
      r = r.return;
    }
    ((r.sibling.return = r.return), (r = r.sibling));
  }
};
oo = function () {};
ph = function (e, t, r, i) {
  var h = e.memoizedProps;
  if (h !== i) {
    ((e = t.stateNode), Gt(ut.current));
    var m = null;
    switch (r) {
    case 'input':
      ((h = Dn(e, h)), (i = Dn(e, i)), (m = []));
      break;
    case 'select':
      ((h = ue({}, h, { value: void 0 })),
      (i = ue({}, i, { value: void 0 })),
      (m = []));
      break;
    case 'textarea':
      ((h = An(e, h)), (i = An(e, i)), (m = []));
      break;
    default:
      typeof h.onClick != 'function' &&
          typeof i.onClick == 'function' &&
          (e.onclick = fs);
    }
    Mn(r, i);
    var y;
    r = null;
    for (f in h)
      if (!i.hasOwnProperty(f) && h.hasOwnProperty(f) && h[f] != null)
        if (f === 'style') {
          var a = h[f];
          for (y in a) a.hasOwnProperty(y) && (r || (r = {}), (r[y] = ''));
        } else
          f !== 'dangerouslySetInnerHTML' &&
            f !== 'children' &&
            f !== 'suppressContentEditableWarning' &&
            f !== 'suppressHydrationWarning' &&
            f !== 'autoFocus' &&
            (oi.hasOwnProperty(f)
              ? m || (m = [])
              : (m = m || []).push(f, null));
    for (f in i) {
      var l = i[f];
      if (
        ((a = h != null ? h[f] : void 0),
        i.hasOwnProperty(f) && l !== a && (l != null || a != null))
      )
        if (f === 'style')
          if (a) {
            for (y in a)
              !a.hasOwnProperty(y) ||
                (l && l.hasOwnProperty(y)) ||
                (r || (r = {}), (r[y] = ''));
            for (y in l)
              l.hasOwnProperty(y) &&
                a[y] !== l[y] &&
                (r || (r = {}), (r[y] = l[y]));
          } else (r || (m || (m = []), m.push(f, r)), (r = l));
        else
          f === 'dangerouslySetInnerHTML'
            ? ((l = l ? l.__html : void 0),
            (a = a ? a.__html : void 0),
            l != null && a !== l && (m = m || []).push(f, l))
            : f === 'children'
              ? (typeof l != 'string' && typeof l != 'number') ||
                (m = m || []).push(f, '' + l)
              : f !== 'suppressContentEditableWarning' &&
                f !== 'suppressHydrationWarning' &&
                (oi.hasOwnProperty(f)
                  ? (l != null && f === 'onScroll' && ne('scroll', e),
                  m || a === l || (m = []))
                  : (m = m || []).push(f, l));
    }
    r && (m = m || []).push('style', r);
    var f = m;
    (t.updateQueue = f) && (t.flags |= 4);
  }
};
mh = function (e, t, r, i) {
  r !== i && (t.flags |= 4);
};
function $r(e, t) {
  if (!ae)
    switch (e.tailMode) {
    case 'hidden':
      t = e.tail;
      for (var r = null; t !== null; )
        (t.alternate !== null && (r = t), (t = t.sibling));
      r === null ? (e.tail = null) : (r.sibling = null);
      break;
    case 'collapsed':
      r = e.tail;
      for (var i = null; r !== null; )
        (r.alternate !== null && (i = r), (r = r.sibling));
      i === null
        ? t || e.tail === null
          ? (e.tail = null)
          : (e.tail.sibling = null)
        : (i.sibling = null);
    }
}
function Ee(e) {
  var t = e.alternate !== null && e.alternate.child === e.child,
    r = 0,
    i = 0;
  if (t)
    for (var h = e.child; h !== null; )
      ((r |= h.lanes | h.childLanes),
      (i |= h.subtreeFlags & 14680064),
      (i |= h.flags & 14680064),
      (h.return = e),
      (h = h.sibling));
  else
    for (h = e.child; h !== null; )
      ((r |= h.lanes | h.childLanes),
      (i |= h.subtreeFlags),
      (i |= h.flags),
      (h.return = e),
      (h = h.sibling));
  return ((e.subtreeFlags |= i), (e.childLanes = r), t);
}
function Gd(e, t, r) {
  var i = t.pendingProps;
  switch ((Ho(t), t.tag)) {
  case 2:
  case 16:
  case 15:
  case 0:
  case 11:
  case 7:
  case 8:
  case 12:
  case 9:
  case 14:
    return (Ee(t), null);
  case 1:
    return (Ie(t.type) && _s(), Ee(t), null);
  case 3:
    return (
      (i = t.stateNode),
      Dr(),
      oe(Oe),
      oe(Le),
      Ko(),
      i.pendingContext &&
          ((i.context = i.pendingContext), (i.pendingContext = null)),
      (e === null || e.child === null) &&
          (Wi(t)
            ? (t.flags |= 4)
            : e === null ||
              (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
              ((t.flags |= 1024), rt !== null && (po(rt), (rt = null)))),
      oo(e, t),
      Ee(t),
      null
    );
  case 5:
    Vo(t);
    var h = Gt(gi.current);
    if (((r = t.type), e !== null && t.stateNode != null))
      (ph(e, t, r, i, h),
      e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152)));
    else {
      if (!i) {
        if (t.stateNode === null) throw Error(V(166));
        return (Ee(t), null);
      }
      if (((e = Gt(ut.current)), Wi(t))) {
        ((i = t.stateNode), (r = t.type));
        var m = t.memoizedProps;
        switch (((i[ct] = t), (i[mi] = m), (e = (t.mode & 1) !== 0), r)) {
        case 'dialog':
          (ne('cancel', i), ne('close', i));
          break;
        case 'iframe':
        case 'object':
        case 'embed':
          ne('load', i);
          break;
        case 'video':
        case 'audio':
          for (h = 0; h < Xr.length; h++) ne(Xr[h], i);
          break;
        case 'source':
          ne('error', i);
          break;
        case 'img':
        case 'image':
        case 'link':
          (ne('error', i), ne('load', i));
          break;
        case 'details':
          ne('toggle', i);
          break;
        case 'input':
          (ma(i, m), ne('invalid', i));
          break;
        case 'select':
          ((i._wrapperState = { wasMultiple: !!m.multiple }),
          ne('invalid', i));
          break;
        case 'textarea':
          (ga(i, m), ne('invalid', i));
        }
        (Mn(r, m), (h = null));
        for (var y in m)
          if (m.hasOwnProperty(y)) {
            var a = m[y];
            y === 'children'
              ? typeof a == 'string'
                ? i.textContent !== a &&
                    (m.suppressHydrationWarning !== !0 &&
                      zi(i.textContent, a, e),
                    (h = ['children', a]))
                : typeof a == 'number' &&
                    i.textContent !== '' + a &&
                    (m.suppressHydrationWarning !== !0 &&
                      zi(i.textContent, a, e),
                    (h = ['children', '' + a]))
              : oi.hasOwnProperty(y) &&
                  a != null &&
                  y === 'onScroll' &&
                  ne('scroll', i);
          }
        switch (r) {
        case 'input':
          (Pi(i), va(i, m, !0));
          break;
        case 'textarea':
          (Pi(i), Sa(i));
          break;
        case 'select':
        case 'option':
          break;
        default:
          typeof m.onClick == 'function' && (i.onclick = fs);
        }
        ((i = h), (t.updateQueue = i), i !== null && (t.flags |= 4));
      } else {
        ((y = h.nodeType === 9 ? h : h.ownerDocument),
        e === 'http://www.w3.org/1999/xhtml' && (e = $l(r)),
        e === 'http://www.w3.org/1999/xhtml'
          ? r === 'script'
            ? ((e = y.createElement('div')),
            (e.innerHTML = '<script><\/script>'),
            (e = e.removeChild(e.firstChild)))
            : typeof i.is == 'string'
              ? (e = y.createElement(r, { is: i.is }))
              : ((e = y.createElement(r)),
              r === 'select' &&
                      ((y = e),
                      i.multiple
                        ? (y.multiple = !0)
                        : i.size && (y.size = i.size)))
          : (e = y.createElementNS(e, r)),
        (e[ct] = t),
        (e[mi] = i),
        _h(e, t, !1, !1),
        (t.stateNode = e));
        e: {
          switch (((y = Bn(r, i)), r)) {
          case 'dialog':
            (ne('cancel', e), ne('close', e), (h = i));
            break;
          case 'iframe':
          case 'object':
          case 'embed':
            (ne('load', e), (h = i));
            break;
          case 'video':
          case 'audio':
            for (h = 0; h < Xr.length; h++) ne(Xr[h], e);
            h = i;
            break;
          case 'source':
            (ne('error', e), (h = i));
            break;
          case 'img':
          case 'image':
          case 'link':
            (ne('error', e), ne('load', e), (h = i));
            break;
          case 'details':
            (ne('toggle', e), (h = i));
            break;
          case 'input':
            (ma(e, i), (h = Dn(e, i)), ne('invalid', e));
            break;
          case 'option':
            h = i;
            break;
          case 'select':
            ((e._wrapperState = { wasMultiple: !!i.multiple }),
            (h = ue({}, i, { value: void 0 })),
            ne('invalid', e));
            break;
          case 'textarea':
            (ga(e, i), (h = An(e, i)), ne('invalid', e));
            break;
          default:
            h = i;
          }
          (Mn(r, h), (a = h));
          for (m in a)
            if (a.hasOwnProperty(m)) {
              var l = a[m];
              m === 'style'
                ? ql(e, l)
                : m === 'dangerouslySetInnerHTML'
                  ? ((l = l ? l.__html : void 0), l != null && Vl(e, l))
                  : m === 'children'
                    ? typeof l == 'string'
                      ? (r !== 'textarea' || l !== '') && ai(e, l)
                      : typeof l == 'number' && ai(e, '' + l)
                    : m !== 'suppressContentEditableWarning' &&
                        m !== 'suppressHydrationWarning' &&
                        m !== 'autoFocus' &&
                        (oi.hasOwnProperty(m)
                          ? l != null && m === 'onScroll' && ne('scroll', e)
                          : l != null && Co(e, m, l, y));
            }
          switch (r) {
          case 'input':
            (Pi(e), va(e, i, !1));
            break;
          case 'textarea':
            (Pi(e), Sa(e));
            break;
          case 'option':
            i.value != null && e.setAttribute('value', '' + Ft(i.value));
            break;
          case 'select':
            ((e.multiple = !!i.multiple),
            (m = i.value),
            m != null
              ? gr(e, !!i.multiple, m, !1)
              : i.defaultValue != null &&
                      gr(e, !!i.multiple, i.defaultValue, !0));
            break;
          default:
            typeof h.onClick == 'function' && (e.onclick = fs);
          }
          switch (r) {
          case 'button':
          case 'input':
          case 'select':
          case 'textarea':
            i = !!i.autoFocus;
            break e;
          case 'img':
            i = !0;
            break e;
          default:
            i = !1;
          }
        }
        i && (t.flags |= 4);
      }
      t.ref !== null && ((t.flags |= 512), (t.flags |= 2097152));
    }
    return (Ee(t), null);
  case 6:
    if (e && t.stateNode != null) mh(e, t, e.memoizedProps, i);
    else {
      if (typeof i != 'string' && t.stateNode === null) throw Error(V(166));
      if (((r = Gt(gi.current)), Gt(ut.current), Wi(t))) {
        if (
          ((i = t.stateNode),
          (r = t.memoizedProps),
          (i[ct] = t),
          (m = i.nodeValue !== r) && ((e = We), e !== null))
        )
          switch (e.tag) {
          case 3:
            zi(i.nodeValue, r, (e.mode & 1) !== 0);
            break;
          case 5:
            e.memoizedProps.suppressHydrationWarning !== !0 &&
                  zi(i.nodeValue, r, (e.mode & 1) !== 0);
          }
        m && (t.flags |= 4);
      } else
        ((i = (r.nodeType === 9 ? r : r.ownerDocument).createTextNode(i)),
        (i[ct] = t),
        (t.stateNode = i));
    }
    return (Ee(t), null);
  case 13:
    if (
      (oe(ce),
      (i = t.memoizedState),
      e === null ||
          (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
    ) {
      if (ae && ze !== null && t.mode & 1 && !(t.flags & 128))
        (Bc(), kr(), (t.flags |= 98560), (m = !1));
      else if (((m = Wi(t)), i !== null && i.dehydrated !== null)) {
        if (e === null) {
          if (!m) throw Error(V(318));
          if (
            ((m = t.memoizedState),
            (m = m !== null ? m.dehydrated : null),
            !m)
          )
            throw Error(V(317));
          m[ct] = t;
        } else
          (kr(),
          !(t.flags & 128) && (t.memoizedState = null),
          (t.flags |= 4));
        (Ee(t), (m = !1));
      } else (rt !== null && (po(rt), (rt = null)), (m = !0));
      if (!m) return t.flags & 65536 ? t : null;
    }
    return t.flags & 128
      ? ((t.lanes = r), t)
      : ((i = i !== null),
      i !== (e !== null && e.memoizedState !== null) &&
            i &&
            ((t.child.flags |= 8192),
            t.mode & 1 &&
              (e === null || ce.current & 1 ? ge === 0 && (ge = 3) : sa())),
      t.updateQueue !== null && (t.flags |= 4),
      Ee(t),
      null);
  case 4:
    return (
      Dr(),
      oo(e, t),
      e === null && _i(t.stateNode.containerInfo),
      Ee(t),
      null
    );
  case 10:
    return (Wo(t.type._context), Ee(t), null);
  case 17:
    return (Ie(t.type) && _s(), Ee(t), null);
  case 19:
    if ((oe(ce), (m = t.memoizedState), m === null)) return (Ee(t), null);
    if (((i = (t.flags & 128) !== 0), (y = m.rendering), y === null))
      if (i) $r(m, !1);
      else {
        if (ge !== 0 || (e !== null && e.flags & 128))
          for (e = t.child; e !== null; ) {
            if (((y = ws(e)), y !== null)) {
              for (
                t.flags |= 128,
                $r(m, !1),
                i = y.updateQueue,
                i !== null && ((t.updateQueue = i), (t.flags |= 4)),
                t.subtreeFlags = 0,
                i = r,
                r = t.child;
                r !== null;

              )
                ((m = r),
                (e = i),
                (m.flags &= 14680066),
                (y = m.alternate),
                y === null
                  ? ((m.childLanes = 0),
                  (m.lanes = e),
                  (m.child = null),
                  (m.subtreeFlags = 0),
                  (m.memoizedProps = null),
                  (m.memoizedState = null),
                  (m.updateQueue = null),
                  (m.dependencies = null),
                  (m.stateNode = null))
                  : ((m.childLanes = y.childLanes),
                  (m.lanes = y.lanes),
                  (m.child = y.child),
                  (m.subtreeFlags = 0),
                  (m.deletions = null),
                  (m.memoizedProps = y.memoizedProps),
                  (m.memoizedState = y.memoizedState),
                  (m.updateQueue = y.updateQueue),
                  (m.type = y.type),
                  (e = y.dependencies),
                  (m.dependencies =
                          e === null
                            ? null
                            : {
                              lanes: e.lanes,
                              firstContext: e.firstContext,
                            })),
                (r = r.sibling));
              return (se(ce, (ce.current & 1) | 2), t.child);
            }
            e = e.sibling;
          }
        m.tail !== null &&
            pe() > Tr &&
            ((t.flags |= 128), (i = !0), $r(m, !1), (t.lanes = 4194304));
      }
    else {
      if (!i)
        if (((e = ws(y)), e !== null)) {
          if (
            ((t.flags |= 128),
            (i = !0),
            (r = e.updateQueue),
            r !== null && ((t.updateQueue = r), (t.flags |= 4)),
            $r(m, !0),
            m.tail === null && m.tailMode === 'hidden' && !y.alternate && !ae)
          )
            return (Ee(t), null);
        } else
          2 * pe() - m.renderingStartTime > Tr &&
              r !== 1073741824 &&
              ((t.flags |= 128), (i = !0), $r(m, !1), (t.lanes = 4194304));
      m.isBackwards
        ? ((y.sibling = t.child), (t.child = y))
        : ((r = m.last),
        r !== null ? (r.sibling = y) : (t.child = y),
        (m.last = y));
    }
    return m.tail !== null
      ? ((t = m.tail),
      (m.rendering = t),
      (m.tail = t.sibling),
      (m.renderingStartTime = pe()),
      (t.sibling = null),
      (r = ce.current),
      se(ce, i ? (r & 1) | 2 : r & 1),
      t)
      : (Ee(t), null);
  case 22:
  case 23:
    return (
      ia(),
      (i = t.memoizedState !== null),
      e !== null && (e.memoizedState !== null) !== i && (t.flags |= 8192),
      i && t.mode & 1
        ? Fe & 1073741824 && (Ee(t), t.subtreeFlags & 6 && (t.flags |= 8192))
        : Ee(t),
      null
    );
  case 24:
    return null;
  case 25:
    return null;
  }
  throw Error(V(156, t.tag));
}
function Xd(e, t) {
  switch ((Ho(t), t.tag)) {
  case 1:
    return (
      Ie(t.type) && _s(),
      (e = t.flags),
      e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
    );
  case 3:
    return (
      Dr(),
      oe(Oe),
      oe(Le),
      Ko(),
      (e = t.flags),
      e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
    );
  case 5:
    return (Vo(t), null);
  case 13:
    if (
      (oe(ce), (e = t.memoizedState), e !== null && e.dehydrated !== null)
    ) {
      if (t.alternate === null) throw Error(V(340));
      kr();
    }
    return (
      (e = t.flags),
      e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
    );
  case 19:
    return (oe(ce), null);
  case 4:
    return (Dr(), null);
  case 10:
    return (Wo(t.type._context), null);
  case 22:
  case 23:
    return (ia(), null);
  case 24:
    return null;
  default:
    return null;
  }
}
var $i = !1,
  ke = !1,
  Yd = typeof WeakSet == 'function' ? WeakSet : Set,
  Q = null;
function mr(e, t) {
  var r = e.ref;
  if (r !== null)
    if (typeof r == 'function')
      try {
        r(null);
      } catch (i) {
        _e(e, t, i);
      }
    else r.current = null;
}
function ao(e, t, r) {
  try {
    r();
  } catch (i) {
    _e(e, t, i);
  }
}
var ll = !1;
function Qd(e, t) {
  if ((($n = hs), (e = wc()), Oo(e))) {
    if ('selectionStart' in e)
      var r = { start: e.selectionStart, end: e.selectionEnd };
    else
      e: {
        r = ((r = e.ownerDocument) && r.defaultView) || window;
        var i = r.getSelection && r.getSelection();
        if (i && i.rangeCount !== 0) {
          r = i.anchorNode;
          var h = i.anchorOffset,
            m = i.focusNode;
          i = i.focusOffset;
          try {
            (r.nodeType, m.nodeType);
          } catch {
            r = null;
            break e;
          }
          var y = 0,
            a = -1,
            l = -1,
            f = 0,
            g = 0,
            u = e,
            d = null;
          t: for (;;) {
            for (
              var v;
              u !== r || (h !== 0 && u.nodeType !== 3) || (a = y + h),
              u !== m || (i !== 0 && u.nodeType !== 3) || (l = y + i),
              u.nodeType === 3 && (y += u.nodeValue.length),
              (v = u.firstChild) !== null;

            )
              ((d = u), (u = v));
            for (;;) {
              if (u === e) break t;
              if (
                (d === r && ++f === h && (a = y),
                d === m && ++g === i && (l = y),
                (v = u.nextSibling) !== null)
              )
                break;
              ((u = d), (d = u.parentNode));
            }
            u = v;
          }
          r = a === -1 || l === -1 ? null : { start: a, end: l };
        } else r = null;
      }
    r = r || { start: 0, end: 0 };
  } else r = null;
  for (Vn = { focusedElem: e, selectionRange: r }, hs = !1, Q = t; Q !== null; )
    if (((t = Q), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null))
      ((e.return = t), (Q = e));
    else
      for (; Q !== null; ) {
        t = Q;
        try {
          var w = t.alternate;
          if (t.flags & 1024)
            switch (t.tag) {
            case 0:
            case 11:
            case 15:
              break;
            case 1:
              if (w !== null) {
                var p = w.memoizedProps,
                  c = w.memoizedState,
                  n = t.stateNode,
                  s = n.getSnapshotBeforeUpdate(
                    t.elementType === t.type ? p : et(t.type, p),
                    c
                  );
                n.__reactInternalSnapshotBeforeUpdate = s;
              }
              break;
            case 3:
              var o = t.stateNode.containerInfo;
              o.nodeType === 1
                ? (o.textContent = '')
                : o.nodeType === 9 &&
                    o.documentElement &&
                    o.removeChild(o.documentElement);
              break;
            case 5:
            case 6:
            case 4:
            case 17:
              break;
            default:
              throw Error(V(163));
            }
        } catch (_) {
          _e(t, t.return, _);
        }
        if (((e = t.sibling), e !== null)) {
          ((e.return = t.return), (Q = e));
          break;
        }
        Q = t.return;
      }
  return ((w = ll), (ll = !1), w);
}
function ii(e, t, r) {
  var i = t.updateQueue;
  if (((i = i !== null ? i.lastEffect : null), i !== null)) {
    var h = (i = i.next);
    do {
      if ((h.tag & e) === e) {
        var m = h.destroy;
        ((h.destroy = void 0), m !== void 0 && ao(t, r, m));
      }
      h = h.next;
    } while (h !== i);
  }
}
function Ns(e, t) {
  if (
    ((t = t.updateQueue), (t = t !== null ? t.lastEffect : null), t !== null)
  ) {
    var r = (t = t.next);
    do {
      if ((r.tag & e) === e) {
        var i = r.create;
        r.destroy = i();
      }
      r = r.next;
    } while (r !== t);
  }
}
function lo(e) {
  var t = e.ref;
  if (t !== null) {
    var r = e.stateNode;
    switch (e.tag) {
    case 5:
      e = r;
      break;
    default:
      e = r;
    }
    typeof t == 'function' ? t(e) : (t.current = e);
  }
}
function vh(e) {
  var t = e.alternate;
  (t !== null && ((e.alternate = null), vh(t)),
  (e.child = null),
  (e.deletions = null),
  (e.sibling = null),
  e.tag === 5 &&
      ((t = e.stateNode),
      t !== null &&
        (delete t[ct], delete t[mi], delete t[Gn], delete t[Md], delete t[Bd])),
  (e.stateNode = null),
  (e.return = null),
  (e.dependencies = null),
  (e.memoizedProps = null),
  (e.memoizedState = null),
  (e.pendingProps = null),
  (e.stateNode = null),
  (e.updateQueue = null));
}
function gh(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function cl(e) {
  e: for (;;) {
    for (; e.sibling === null; ) {
      if (e.return === null || gh(e.return)) return null;
      e = e.return;
    }
    for (
      e.sibling.return = e.return, e = e.sibling;
      e.tag !== 5 && e.tag !== 6 && e.tag !== 18;

    ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      ((e.child.return = e), (e = e.child));
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function co(e, t, r) {
  var i = e.tag;
  if (i === 5 || i === 6)
    ((e = e.stateNode),
    t
      ? r.nodeType === 8
        ? r.parentNode.insertBefore(e, t)
        : r.insertBefore(e, t)
      : (r.nodeType === 8
        ? ((t = r.parentNode), t.insertBefore(e, r))
        : ((t = r), t.appendChild(e)),
      (r = r._reactRootContainer),
      r != null || t.onclick !== null || (t.onclick = fs)));
  else if (i !== 4 && ((e = e.child), e !== null))
    for (co(e, t, r), e = e.sibling; e !== null; )
      (co(e, t, r), (e = e.sibling));
}
function ho(e, t, r) {
  var i = e.tag;
  if (i === 5 || i === 6)
    ((e = e.stateNode), t ? r.insertBefore(e, t) : r.appendChild(e));
  else if (i !== 4 && ((e = e.child), e !== null))
    for (ho(e, t, r), e = e.sibling; e !== null; )
      (ho(e, t, r), (e = e.sibling));
}
var we = null,
  tt = !1;
function xt(e, t, r) {
  for (r = r.child; r !== null; ) (Sh(e, t, r), (r = r.sibling));
}
function Sh(e, t, r) {
  if (ht && typeof ht.onCommitFiberUnmount == 'function')
    try {
      ht.onCommitFiberUnmount(Ts, r);
    } catch {}
  switch (r.tag) {
  case 5:
    ke || mr(r, t);
  case 6:
    var i = we,
      h = tt;
    ((we = null),
    xt(e, t, r),
    (we = i),
    (tt = h),
    we !== null &&
          (tt
            ? ((e = we),
            (r = r.stateNode),
            e.nodeType === 8 ? e.parentNode.removeChild(r) : e.removeChild(r))
            : we.removeChild(r.stateNode)));
    break;
  case 18:
    we !== null &&
        (tt
          ? ((e = we),
          (r = r.stateNode),
          e.nodeType === 8
            ? dn(e.parentNode, r)
            : e.nodeType === 1 && dn(e, r),
          ui(e))
          : dn(we, r.stateNode));
    break;
  case 4:
    ((i = we),
    (h = tt),
    (we = r.stateNode.containerInfo),
    (tt = !0),
    xt(e, t, r),
    (we = i),
    (tt = h));
    break;
  case 0:
  case 11:
  case 14:
  case 15:
    if (
      !ke &&
        ((i = r.updateQueue), i !== null && ((i = i.lastEffect), i !== null))
    ) {
      h = i = i.next;
      do {
        var m = h,
          y = m.destroy;
        ((m = m.tag),
        y !== void 0 && (m & 2 || m & 4) && ao(r, t, y),
        (h = h.next));
      } while (h !== i);
    }
    xt(e, t, r);
    break;
  case 1:
    if (
      !ke &&
        (mr(r, t),
        (i = r.stateNode),
        typeof i.componentWillUnmount == 'function')
    )
      try {
        ((i.props = r.memoizedProps),
        (i.state = r.memoizedState),
        i.componentWillUnmount());
      } catch (a) {
        _e(r, t, a);
      }
    xt(e, t, r);
    break;
  case 21:
    xt(e, t, r);
    break;
  case 22:
    r.mode & 1
      ? ((ke = (i = ke) || r.memoizedState !== null), xt(e, t, r), (ke = i))
      : xt(e, t, r);
    break;
  default:
    xt(e, t, r);
  }
}
function hl(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var r = e.stateNode;
    (r === null && (r = e.stateNode = new Yd()),
    t.forEach(function (i) {
      var h = af.bind(null, e, i);
      r.has(i) || (r.add(i), i.then(h, h));
    }));
  }
}
function Je(e, t) {
  var r = t.deletions;
  if (r !== null)
    for (var i = 0; i < r.length; i++) {
      var h = r[i];
      try {
        var m = e,
          y = t,
          a = y;
        e: for (; a !== null; ) {
          switch (a.tag) {
          case 5:
            ((we = a.stateNode), (tt = !1));
            break e;
          case 3:
            ((we = a.stateNode.containerInfo), (tt = !0));
            break e;
          case 4:
            ((we = a.stateNode.containerInfo), (tt = !0));
            break e;
          }
          a = a.return;
        }
        if (we === null) throw Error(V(160));
        (Sh(m, y, h), (we = null), (tt = !1));
        var l = h.alternate;
        (l !== null && (l.return = null), (h.return = null));
      } catch (f) {
        _e(h, t, f);
      }
    }
  if (t.subtreeFlags & 12854)
    for (t = t.child; t !== null; ) (yh(t, e), (t = t.sibling));
}
function yh(e, t) {
  var r = e.alternate,
    i = e.flags;
  switch (e.tag) {
  case 0:
  case 11:
  case 14:
  case 15:
    if ((Je(t, e), at(e), i & 4)) {
      try {
        (ii(3, e, e.return), Ns(3, e));
      } catch (p) {
        _e(e, e.return, p);
      }
      try {
        ii(5, e, e.return);
      } catch (p) {
        _e(e, e.return, p);
      }
    }
    break;
  case 1:
    (Je(t, e), at(e), i & 512 && r !== null && mr(r, r.return));
    break;
  case 5:
    if (
      (Je(t, e),
      at(e),
      i & 512 && r !== null && mr(r, r.return),
      e.flags & 32)
    ) {
      var h = e.stateNode;
      try {
        ai(h, '');
      } catch (p) {
        _e(e, e.return, p);
      }
    }
    if (i & 4 && ((h = e.stateNode), h != null)) {
      var m = e.memoizedProps,
        y = r !== null ? r.memoizedProps : m,
        a = e.type,
        l = e.updateQueue;
      if (((e.updateQueue = null), l !== null))
        try {
          (a === 'input' && m.type === 'radio' && m.name != null && jl(h, m),
          Bn(a, y));
          var f = Bn(a, m);
          for (y = 0; y < l.length; y += 2) {
            var g = l[y],
              u = l[y + 1];
            g === 'style'
              ? ql(h, u)
              : g === 'dangerouslySetInnerHTML'
                ? Vl(h, u)
                : g === 'children'
                  ? ai(h, u)
                  : Co(h, g, u, f);
          }
          switch (a) {
          case 'input':
            Rn(h, m);
            break;
          case 'textarea':
            Ul(h, m);
            break;
          case 'select':
            var d = h._wrapperState.wasMultiple;
            h._wrapperState.wasMultiple = !!m.multiple;
            var v = m.value;
            v != null
              ? gr(h, !!m.multiple, v, !1)
              : d !== !!m.multiple &&
                    (m.defaultValue != null
                      ? gr(h, !!m.multiple, m.defaultValue, !0)
                      : gr(h, !!m.multiple, m.multiple ? [] : '', !1));
          }
          h[mi] = m;
        } catch (p) {
          _e(e, e.return, p);
        }
    }
    break;
  case 6:
    if ((Je(t, e), at(e), i & 4)) {
      if (e.stateNode === null) throw Error(V(162));
      ((h = e.stateNode), (m = e.memoizedProps));
      try {
        h.nodeValue = m;
      } catch (p) {
        _e(e, e.return, p);
      }
    }
    break;
  case 3:
    if (
      (Je(t, e), at(e), i & 4 && r !== null && r.memoizedState.isDehydrated)
    )
      try {
        ui(t.containerInfo);
      } catch (p) {
        _e(e, e.return, p);
      }
    break;
  case 4:
    (Je(t, e), at(e));
    break;
  case 13:
    (Je(t, e),
    at(e),
    (h = e.child),
    h.flags & 8192 &&
          ((m = h.memoizedState !== null),
          (h.stateNode.isHidden = m),
          !m ||
            (h.alternate !== null && h.alternate.memoizedState !== null) ||
            (ta = pe())),
    i & 4 && hl(e));
    break;
  case 22:
    if (
      ((g = r !== null && r.memoizedState !== null),
      e.mode & 1 ? ((ke = (f = ke) || g), Je(t, e), (ke = f)) : Je(t, e),
      at(e),
      i & 8192)
    ) {
      if (
        ((f = e.memoizedState !== null),
        (e.stateNode.isHidden = f) && !g && e.mode & 1)
      )
        for (Q = e, g = e.child; g !== null; ) {
          for (u = Q = g; Q !== null; ) {
            switch (((d = Q), (v = d.child), d.tag)) {
            case 0:
            case 11:
            case 14:
            case 15:
              ii(4, d, d.return);
              break;
            case 1:
              mr(d, d.return);
              var w = d.stateNode;
              if (typeof w.componentWillUnmount == 'function') {
                ((i = d), (r = d.return));
                try {
                  ((t = i),
                  (w.props = t.memoizedProps),
                  (w.state = t.memoizedState),
                  w.componentWillUnmount());
                } catch (p) {
                  _e(i, r, p);
                }
              }
              break;
            case 5:
              mr(d, d.return);
              break;
            case 22:
              if (d.memoizedState !== null) {
                dl(u);
                continue;
              }
            }
            v !== null ? ((v.return = d), (Q = v)) : dl(u);
          }
          g = g.sibling;
        }
      e: for (g = null, u = e; ; ) {
        if (u.tag === 5) {
          if (g === null) {
            g = u;
            try {
              ((h = u.stateNode),
              f
                ? ((m = h.style),
                typeof m.setProperty == 'function'
                  ? m.setProperty('display', 'none', 'important')
                  : (m.display = 'none'))
                : ((a = u.stateNode),
                (l = u.memoizedProps.style),
                (y =
                        l != null && l.hasOwnProperty('display')
                          ? l.display
                          : null),
                (a.style.display = Kl('display', y))));
            } catch (p) {
              _e(e, e.return, p);
            }
          }
        } else if (u.tag === 6) {
          if (g === null)
            try {
              u.stateNode.nodeValue = f ? '' : u.memoizedProps;
            } catch (p) {
              _e(e, e.return, p);
            }
        } else if (
          ((u.tag !== 22 && u.tag !== 23) ||
              u.memoizedState === null ||
              u === e) &&
            u.child !== null
        ) {
          ((u.child.return = u), (u = u.child));
          continue;
        }
        if (u === e) break e;
        for (; u.sibling === null; ) {
          if (u.return === null || u.return === e) break e;
          (g === u && (g = null), (u = u.return));
        }
        (g === u && (g = null),
        (u.sibling.return = u.return),
        (u = u.sibling));
      }
    }
    break;
  case 19:
    (Je(t, e), at(e), i & 4 && hl(e));
    break;
  case 21:
    break;
  default:
    (Je(t, e), at(e));
  }
}
function at(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var r = e.return; r !== null; ) {
          if (gh(r)) {
            var i = r;
            break e;
          }
          r = r.return;
        }
        throw Error(V(160));
      }
      switch (i.tag) {
      case 5:
        var h = i.stateNode;
        i.flags & 32 && (ai(h, ''), (i.flags &= -33));
        var m = cl(e);
        ho(e, m, h);
        break;
      case 3:
      case 4:
        var y = i.stateNode.containerInfo,
          a = cl(e);
        co(e, a, y);
        break;
      default:
        throw Error(V(161));
      }
    } catch (l) {
      _e(e, e.return, l);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function Jd(e, t, r) {
  ((Q = e), wh(e));
}
function wh(e, t, r) {
  for (var i = (e.mode & 1) !== 0; Q !== null; ) {
    var h = Q,
      m = h.child;
    if (h.tag === 22 && i) {
      var y = h.memoizedState !== null || $i;
      if (!y) {
        var a = h.alternate,
          l = (a !== null && a.memoizedState !== null) || ke;
        a = $i;
        var f = ke;
        if ((($i = y), (ke = l) && !f))
          for (Q = h; Q !== null; )
            ((y = Q),
            (l = y.child),
            y.tag === 22 && y.memoizedState !== null
              ? fl(h)
              : l !== null
                ? ((l.return = y), (Q = l))
                : fl(h));
        for (; m !== null; ) ((Q = m), wh(m), (m = m.sibling));
        ((Q = h), ($i = a), (ke = f));
      }
      ul(e);
    } else
      h.subtreeFlags & 8772 && m !== null ? ((m.return = h), (Q = m)) : ul(e);
  }
}
function ul(e) {
  for (; Q !== null; ) {
    var t = Q;
    if (t.flags & 8772) {
      var r = t.alternate;
      try {
        if (t.flags & 8772)
          switch (t.tag) {
          case 0:
          case 11:
          case 15:
            ke || Ns(5, t);
            break;
          case 1:
            var i = t.stateNode;
            if (t.flags & 4 && !ke)
              if (r === null) i.componentDidMount();
              else {
                var h =
                    t.elementType === t.type
                      ? r.memoizedProps
                      : et(t.type, r.memoizedProps);
                i.componentDidUpdate(
                  h,
                  r.memoizedState,
                  i.__reactInternalSnapshotBeforeUpdate
                );
              }
            var m = t.updateQueue;
            m !== null && Xa(t, m, i);
            break;
          case 3:
            var y = t.updateQueue;
            if (y !== null) {
              if (((r = null), t.child !== null))
                switch (t.child.tag) {
                case 5:
                  r = t.child.stateNode;
                  break;
                case 1:
                  r = t.child.stateNode;
                }
              Xa(t, y, r);
            }
            break;
          case 5:
            var a = t.stateNode;
            if (r === null && t.flags & 4) {
              r = a;
              var l = t.memoizedProps;
              switch (t.type) {
              case 'button':
              case 'input':
              case 'select':
              case 'textarea':
                l.autoFocus && r.focus();
                break;
              case 'img':
                l.src && (r.src = l.src);
              }
            }
            break;
          case 6:
            break;
          case 4:
            break;
          case 12:
            break;
          case 13:
            if (t.memoizedState === null) {
              var f = t.alternate;
              if (f !== null) {
                var g = f.memoizedState;
                if (g !== null) {
                  var u = g.dehydrated;
                  u !== null && ui(u);
                }
              }
            }
            break;
          case 19:
          case 17:
          case 21:
          case 22:
          case 23:
          case 25:
            break;
          default:
            throw Error(V(163));
          }
        ke || (t.flags & 512 && lo(t));
      } catch (d) {
        _e(t, t.return, d);
      }
    }
    if (t === e) {
      Q = null;
      break;
    }
    if (((r = t.sibling), r !== null)) {
      ((r.return = t.return), (Q = r));
      break;
    }
    Q = t.return;
  }
}
function dl(e) {
  for (; Q !== null; ) {
    var t = Q;
    if (t === e) {
      Q = null;
      break;
    }
    var r = t.sibling;
    if (r !== null) {
      ((r.return = t.return), (Q = r));
      break;
    }
    Q = t.return;
  }
}
function fl(e) {
  for (; Q !== null; ) {
    var t = Q;
    try {
      switch (t.tag) {
      case 0:
      case 11:
      case 15:
        var r = t.return;
        try {
          Ns(4, t);
        } catch (l) {
          _e(t, r, l);
        }
        break;
      case 1:
        var i = t.stateNode;
        if (typeof i.componentDidMount == 'function') {
          var h = t.return;
          try {
            i.componentDidMount();
          } catch (l) {
            _e(t, h, l);
          }
        }
        var m = t.return;
        try {
          lo(t);
        } catch (l) {
          _e(t, m, l);
        }
        break;
      case 5:
        var y = t.return;
        try {
          lo(t);
        } catch (l) {
          _e(t, y, l);
        }
      }
    } catch (l) {
      _e(t, t.return, l);
    }
    if (t === e) {
      Q = null;
      break;
    }
    var a = t.sibling;
    if (a !== null) {
      ((a.return = t.return), (Q = a));
      break;
    }
    Q = t.return;
  }
}
var Zd = Math.ceil,
  xs = wt.ReactCurrentDispatcher,
  Zo = wt.ReactCurrentOwner,
  Xe = wt.ReactCurrentBatchConfig,
  te = 0,
  ye = null,
  me = null,
  Ce = 0,
  Fe = 0,
  vr = jt(0),
  ge = 0,
  Ci = null,
  er = 0,
  Fs = 0,
  ea = 0,
  si = null,
  Me = null,
  ta = 0,
  Tr = 1 / 0,
  dt = null,
  Es = !1,
  uo = null,
  It = null,
  Vi = !1,
  Tt = null,
  ks = 0,
  ni = 0,
  fo = null,
  rs = -1,
  is = 0;
function Re() {
  return te & 6 ? pe() : rs !== -1 ? rs : (rs = pe());
}
function Ht(e) {
  return e.mode & 1
    ? te & 2 && Ce !== 0
      ? Ce & -Ce
      : Id.transition !== null
        ? (is === 0 && (is = nc()), is)
        : ((e = re),
        e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : dc(e.type))),
        e)
    : 1;
}
function st(e, t, r, i) {
  if (50 < ni) throw ((ni = 0), (fo = null), Error(V(185)));
  (xi(e, r, i),
  (!(te & 2) || e !== ye) &&
      (e === ye && (!(te & 2) && (Fs |= r), ge === 4 && Dt(e, Ce)),
      He(e, i),
      r === 1 && te === 0 && !(t.mode & 1) && ((Tr = pe() + 500), Os && Ut())));
}
function He(e, t) {
  var r = e.callbackNode;
  Iu(e, t);
  var i = cs(e, e === ye ? Ce : 0);
  if (i === 0)
    (r !== null && Ca(r), (e.callbackNode = null), (e.callbackPriority = 0));
  else if (((t = i & -i), e.callbackPriority !== t)) {
    if ((r != null && Ca(r), t === 1))
      (e.tag === 0 ? Od(_l.bind(null, e)) : Ac(_l.bind(null, e)),
      Ad(function () {
        !(te & 6) && Ut();
      }),
      (r = null));
    else {
      switch (oc(i)) {
      case 1:
        r = Lo;
        break;
      case 4:
        r = ic;
        break;
      case 16:
        r = ls;
        break;
      case 536870912:
        r = sc;
        break;
      default:
        r = ls;
      }
      r = Rh(r, Ch.bind(null, e));
    }
    ((e.callbackPriority = t), (e.callbackNode = r));
  }
}
function Ch(e, t) {
  if (((rs = -1), (is = 0), te & 6)) throw Error(V(327));
  var r = e.callbackNode;
  if (br() && e.callbackNode !== r) return null;
  var i = cs(e, e === ye ? Ce : 0);
  if (i === 0) return null;
  if (i & 30 || i & e.expiredLanes || t) t = Ls(e, i);
  else {
    t = i;
    var h = te;
    te |= 2;
    var m = xh();
    (ye !== e || Ce !== t) && ((dt = null), (Tr = pe() + 500), Xt(e, t));
    do
      try {
        rf();
        break;
      } catch (a) {
        bh(e, a);
      }
    while (!0);
    (zo(),
    (xs.current = m),
    (te = h),
    me !== null ? (t = 0) : ((ye = null), (Ce = 0), (t = ge)));
  }
  if (t !== 0) {
    if (
      (t === 2 && ((h = Fn(e)), h !== 0 && ((i = h), (t = _o(e, h)))), t === 1)
    )
      throw ((r = Ci), Xt(e, 0), Dt(e, i), He(e, pe()), r);
    if (t === 6) Dt(e, i);
    else {
      if (
        ((h = e.current.alternate),
        !(i & 30) &&
          !ef(h) &&
          ((t = Ls(e, i)),
          t === 2 && ((m = Fn(e)), m !== 0 && ((i = m), (t = _o(e, m)))),
          t === 1))
      )
        throw ((r = Ci), Xt(e, 0), Dt(e, i), He(e, pe()), r);
      switch (((e.finishedWork = h), (e.finishedLanes = i), t)) {
      case 0:
      case 1:
        throw Error(V(345));
      case 2:
        Vt(e, Me, dt);
        break;
      case 3:
        if (
          (Dt(e, i), (i & 130023424) === i && ((t = ta + 500 - pe()), 10 < t))
        ) {
          if (cs(e, 0) !== 0) break;
          if (((h = e.suspendedLanes), (h & i) !== i)) {
            (Re(), (e.pingedLanes |= e.suspendedLanes & h));
            break;
          }
          e.timeoutHandle = qn(Vt.bind(null, e, Me, dt), t);
          break;
        }
        Vt(e, Me, dt);
        break;
      case 4:
        if ((Dt(e, i), (i & 4194240) === i)) break;
        for (t = e.eventTimes, h = -1; 0 < i; ) {
          var y = 31 - it(i);
          ((m = 1 << y), (y = t[y]), y > h && (h = y), (i &= ~m));
        }
        if (
          ((i = h),
          (i = pe() - i),
          (i =
              (120 > i
                ? 120
                : 480 > i
                  ? 480
                  : 1080 > i
                    ? 1080
                    : 1920 > i
                      ? 1920
                      : 3e3 > i
                        ? 3e3
                        : 4320 > i
                          ? 4320
                          : 1960 * Zd(i / 1960)) - i),
          10 < i)
        ) {
          e.timeoutHandle = qn(Vt.bind(null, e, Me, dt), i);
          break;
        }
        Vt(e, Me, dt);
        break;
      case 5:
        Vt(e, Me, dt);
        break;
      default:
        throw Error(V(329));
      }
    }
  }
  return (He(e, pe()), e.callbackNode === r ? Ch.bind(null, e) : null);
}
function _o(e, t) {
  var r = si;
  return (
    e.current.memoizedState.isDehydrated && (Xt(e, t).flags |= 256),
    (e = Ls(e, t)),
    e !== 2 && ((t = Me), (Me = r), t !== null && po(t)),
    e
  );
}
function po(e) {
  Me === null ? (Me = e) : Me.push.apply(Me, e);
}
function ef(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var r = t.updateQueue;
      if (r !== null && ((r = r.stores), r !== null))
        for (var i = 0; i < r.length; i++) {
          var h = r[i],
            m = h.getSnapshot;
          h = h.value;
          try {
            if (!nt(m(), h)) return !1;
          } catch {
            return !1;
          }
        }
    }
    if (((r = t.child), t.subtreeFlags & 16384 && r !== null))
      ((r.return = t), (t = r));
    else {
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return !0;
        t = t.return;
      }
      ((t.sibling.return = t.return), (t = t.sibling));
    }
  }
  return !0;
}
function Dt(e, t) {
  for (
    t &= ~ea,
    t &= ~Fs,
    e.suspendedLanes |= t,
    e.pingedLanes &= ~t,
    e = e.expirationTimes;
    0 < t;

  ) {
    var r = 31 - it(t),
      i = 1 << r;
    ((e[r] = -1), (t &= ~i));
  }
}
function _l(e) {
  if (te & 6) throw Error(V(327));
  br();
  var t = cs(e, 0);
  if (!(t & 1)) return (He(e, pe()), null);
  var r = Ls(e, t);
  if (e.tag !== 0 && r === 2) {
    var i = Fn(e);
    i !== 0 && ((t = i), (r = _o(e, i)));
  }
  if (r === 1) throw ((r = Ci), Xt(e, 0), Dt(e, t), He(e, pe()), r);
  if (r === 6) throw Error(V(345));
  return (
    (e.finishedWork = e.current.alternate),
    (e.finishedLanes = t),
    Vt(e, Me, dt),
    He(e, pe()),
    null
  );
}
function ra(e, t) {
  var r = te;
  te |= 1;
  try {
    return e(t);
  } finally {
    ((te = r), te === 0 && ((Tr = pe() + 500), Os && Ut()));
  }
}
function tr(e) {
  Tt !== null && Tt.tag === 0 && !(te & 6) && br();
  var t = te;
  te |= 1;
  var r = Xe.transition,
    i = re;
  try {
    if (((Xe.transition = null), (re = 1), e)) return e();
  } finally {
    ((re = i), (Xe.transition = r), (te = t), !(te & 6) && Ut());
  }
}
function ia() {
  ((Fe = vr.current), oe(vr));
}
function Xt(e, t) {
  ((e.finishedWork = null), (e.finishedLanes = 0));
  var r = e.timeoutHandle;
  if ((r !== -1 && ((e.timeoutHandle = -1), Td(r)), me !== null))
    for (r = me.return; r !== null; ) {
      var i = r;
      switch ((Ho(i), i.tag)) {
      case 1:
        ((i = i.type.childContextTypes), i != null && _s());
        break;
      case 3:
        (Dr(), oe(Oe), oe(Le), Ko());
        break;
      case 5:
        Vo(i);
        break;
      case 4:
        Dr();
        break;
      case 13:
        oe(ce);
        break;
      case 19:
        oe(ce);
        break;
      case 10:
        Wo(i.type._context);
        break;
      case 22:
      case 23:
        ia();
      }
      r = r.return;
    }
  if (
    ((ye = e),
    (me = e = Nt(e.current, null)),
    (Ce = Fe = t),
    (ge = 0),
    (Ci = null),
    (ea = Fs = er = 0),
    (Me = si = null),
    qt !== null)
  ) {
    for (t = 0; t < qt.length; t++)
      if (((r = qt[t]), (i = r.interleaved), i !== null)) {
        r.interleaved = null;
        var h = i.next,
          m = r.pending;
        if (m !== null) {
          var y = m.next;
          ((m.next = h), (i.next = y));
        }
        r.pending = i;
      }
    qt = null;
  }
  return e;
}
function bh(e, t) {
  do {
    var r = me;
    try {
      if ((zo(), (Zi.current = bs), Cs)) {
        for (var i = he.memoizedState; i !== null; ) {
          var h = i.queue;
          (h !== null && (h.pending = null), (i = i.next));
        }
        Cs = !1;
      }
      if (
        ((Zt = 0),
        (Se = ve = he = null),
        (ri = !1),
        (Si = 0),
        (Zo.current = null),
        r === null || r.return === null)
      ) {
        ((ge = 1), (Ci = t), (me = null));
        break;
      }
      e: {
        var m = e,
          y = r.return,
          a = r,
          l = t;
        if (
          ((t = Ce),
          (a.flags |= 32768),
          l !== null && typeof l == 'object' && typeof l.then == 'function')
        ) {
          var f = l,
            g = a,
            u = g.tag;
          if (!(g.mode & 1) && (u === 0 || u === 11 || u === 15)) {
            var d = g.alternate;
            d
              ? ((g.updateQueue = d.updateQueue),
              (g.memoizedState = d.memoizedState),
              (g.lanes = d.lanes))
              : ((g.updateQueue = null), (g.memoizedState = null));
          }
          var v = tl(y);
          if (v !== null) {
            ((v.flags &= -257),
            rl(v, y, a, m, t),
            v.mode & 1 && el(m, f, t),
            (t = v),
            (l = f));
            var w = t.updateQueue;
            if (w === null) {
              var p = new Set();
              (p.add(l), (t.updateQueue = p));
            } else w.add(l);
            break e;
          } else {
            if (!(t & 1)) {
              (el(m, f, t), sa());
              break e;
            }
            l = Error(V(426));
          }
        } else if (ae && a.mode & 1) {
          var c = tl(y);
          if (c !== null) {
            (!(c.flags & 65536) && (c.flags |= 256),
            rl(c, y, a, m, t),
            No(Rr(l, a)));
            break e;
          }
        }
        ((m = l = Rr(l, a)),
        ge !== 4 && (ge = 2),
        si === null ? (si = [m]) : si.push(m),
        (m = y));
        do {
          switch (m.tag) {
          case 3:
            ((m.flags |= 65536), (t &= -t), (m.lanes |= t));
            var n = oh(m, l, t);
            Ga(m, n);
            break e;
          case 1:
            a = l;
            var s = m.type,
              o = m.stateNode;
            if (
              !(m.flags & 128) &&
                (typeof s.getDerivedStateFromError == 'function' ||
                  (o !== null &&
                    typeof o.componentDidCatch == 'function' &&
                    (It === null || !It.has(o))))
            ) {
              ((m.flags |= 65536), (t &= -t), (m.lanes |= t));
              var _ = ah(m, a, t);
              Ga(m, _);
              break e;
            }
          }
          m = m.return;
        } while (m !== null);
      }
      kh(r);
    } catch (C) {
      ((t = C), me === r && r !== null && (me = r = r.return));
      continue;
    }
    break;
  } while (!0);
}
function xh() {
  var e = xs.current;
  return ((xs.current = bs), e === null ? bs : e);
}
function sa() {
  ((ge === 0 || ge === 3 || ge === 2) && (ge = 4),
  ye === null || (!(er & 268435455) && !(Fs & 268435455)) || Dt(ye, Ce));
}
function Ls(e, t) {
  var r = te;
  te |= 2;
  var i = xh();
  (ye !== e || Ce !== t) && ((dt = null), Xt(e, t));
  do
    try {
      tf();
      break;
    } catch (h) {
      bh(e, h);
    }
  while (!0);
  if ((zo(), (te = r), (xs.current = i), me !== null)) throw Error(V(261));
  return ((ye = null), (Ce = 0), ge);
}
function tf() {
  for (; me !== null; ) Eh(me);
}
function rf() {
  for (; me !== null && !Lu(); ) Eh(me);
}
function Eh(e) {
  var t = Dh(e.alternate, e, Fe);
  ((e.memoizedProps = e.pendingProps),
  t === null ? kh(e) : (me = t),
  (Zo.current = null));
}
function kh(e) {
  var t = e;
  do {
    var r = t.alternate;
    if (((e = t.return), t.flags & 32768)) {
      if (((r = Xd(r, t)), r !== null)) {
        ((r.flags &= 32767), (me = r));
        return;
      }
      if (e !== null)
        ((e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null));
      else {
        ((ge = 6), (me = null));
        return;
      }
    } else if (((r = Gd(r, t, Fe)), r !== null)) {
      me = r;
      return;
    }
    if (((t = t.sibling), t !== null)) {
      me = t;
      return;
    }
    me = t = e;
  } while (t !== null);
  ge === 0 && (ge = 5);
}
function Vt(e, t, r) {
  var i = re,
    h = Xe.transition;
  try {
    ((Xe.transition = null), (re = 1), sf(e, t, r, i));
  } finally {
    ((Xe.transition = h), (re = i));
  }
  return null;
}
function sf(e, t, r, i) {
  do br();
  while (Tt !== null);
  if (te & 6) throw Error(V(327));
  r = e.finishedWork;
  var h = e.finishedLanes;
  if (r === null) return null;
  if (((e.finishedWork = null), (e.finishedLanes = 0), r === e.current))
    throw Error(V(177));
  ((e.callbackNode = null), (e.callbackPriority = 0));
  var m = r.lanes | r.childLanes;
  if (
    (Hu(e, m),
    e === ye && ((me = ye = null), (Ce = 0)),
    (!(r.subtreeFlags & 2064) && !(r.flags & 2064)) ||
      Vi ||
      ((Vi = !0),
      Rh(ls, function () {
        return (br(), null);
      })),
    (m = (r.flags & 15990) !== 0),
    r.subtreeFlags & 15990 || m)
  ) {
    ((m = Xe.transition), (Xe.transition = null));
    var y = re;
    re = 1;
    var a = te;
    ((te |= 4),
    (Zo.current = null),
    Qd(e, r),
    yh(r, e),
    bd(Vn),
    (hs = !!$n),
    (Vn = $n = null),
    (e.current = r),
    Jd(r),
    Du(),
    (te = a),
    (re = y),
    (Xe.transition = m));
  } else e.current = r;
  if (
    (Vi && ((Vi = !1), (Tt = e), (ks = h)),
    (m = e.pendingLanes),
    m === 0 && (It = null),
    Au(r.stateNode),
    He(e, pe()),
    t !== null)
  )
    for (i = e.onRecoverableError, r = 0; r < t.length; r++)
      ((h = t[r]), i(h.value, { componentStack: h.stack, digest: h.digest }));
  if (Es) throw ((Es = !1), (e = uo), (uo = null), e);
  return (
    ks & 1 && e.tag !== 0 && br(),
    (m = e.pendingLanes),
    m & 1 ? (e === fo ? ni++ : ((ni = 0), (fo = e))) : (ni = 0),
    Ut(),
    null
  );
}
function br() {
  if (Tt !== null) {
    var e = oc(ks),
      t = Xe.transition,
      r = re;
    try {
      if (((Xe.transition = null), (re = 16 > e ? 16 : e), Tt === null))
        var i = !1;
      else {
        if (((e = Tt), (Tt = null), (ks = 0), te & 6)) throw Error(V(331));
        var h = te;
        for (te |= 4, Q = e.current; Q !== null; ) {
          var m = Q,
            y = m.child;
          if (Q.flags & 16) {
            var a = m.deletions;
            if (a !== null) {
              for (var l = 0; l < a.length; l++) {
                var f = a[l];
                for (Q = f; Q !== null; ) {
                  var g = Q;
                  switch (g.tag) {
                  case 0:
                  case 11:
                  case 15:
                    ii(8, g, m);
                  }
                  var u = g.child;
                  if (u !== null) ((u.return = g), (Q = u));
                  else
                    for (; Q !== null; ) {
                      g = Q;
                      var d = g.sibling,
                        v = g.return;
                      if ((vh(g), g === f)) {
                        Q = null;
                        break;
                      }
                      if (d !== null) {
                        ((d.return = v), (Q = d));
                        break;
                      }
                      Q = v;
                    }
                }
              }
              var w = m.alternate;
              if (w !== null) {
                var p = w.child;
                if (p !== null) {
                  w.child = null;
                  do {
                    var c = p.sibling;
                    ((p.sibling = null), (p = c));
                  } while (p !== null);
                }
              }
              Q = m;
            }
          }
          if (m.subtreeFlags & 2064 && y !== null) ((y.return = m), (Q = y));
          else
            e: for (; Q !== null; ) {
              if (((m = Q), m.flags & 2048))
                switch (m.tag) {
                case 0:
                case 11:
                case 15:
                  ii(9, m, m.return);
                }
              var n = m.sibling;
              if (n !== null) {
                ((n.return = m.return), (Q = n));
                break e;
              }
              Q = m.return;
            }
        }
        var s = e.current;
        for (Q = s; Q !== null; ) {
          y = Q;
          var o = y.child;
          if (y.subtreeFlags & 2064 && o !== null) ((o.return = y), (Q = o));
          else
            e: for (y = s; Q !== null; ) {
              if (((a = Q), a.flags & 2048))
                try {
                  switch (a.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Ns(9, a);
                  }
                } catch (C) {
                  _e(a, a.return, C);
                }
              if (a === y) {
                Q = null;
                break e;
              }
              var _ = a.sibling;
              if (_ !== null) {
                ((_.return = a.return), (Q = _));
                break e;
              }
              Q = a.return;
            }
        }
        if (
          ((te = h), Ut(), ht && typeof ht.onPostCommitFiberRoot == 'function')
        )
          try {
            ht.onPostCommitFiberRoot(Ts, e);
          } catch {}
        i = !0;
      }
      return i;
    } finally {
      ((re = r), (Xe.transition = t));
    }
  }
  return !1;
}
function pl(e, t, r) {
  ((t = Rr(r, t)),
  (t = oh(e, t, 1)),
  (e = Ot(e, t, 1)),
  (t = Re()),
  e !== null && (xi(e, 1, t), He(e, t)));
}
function _e(e, t, r) {
  if (e.tag === 3) pl(e, e, r);
  else
    for (; t !== null; ) {
      if (t.tag === 3) {
        pl(t, e, r);
        break;
      } else if (t.tag === 1) {
        var i = t.stateNode;
        if (
          typeof t.type.getDerivedStateFromError == 'function' ||
          (typeof i.componentDidCatch == 'function' &&
            (It === null || !It.has(i)))
        ) {
          ((e = Rr(r, e)),
          (e = ah(t, e, 1)),
          (t = Ot(t, e, 1)),
          (e = Re()),
          t !== null && (xi(t, 1, e), He(t, e)));
          break;
        }
      }
      t = t.return;
    }
}
function nf(e, t, r) {
  var i = e.pingCache;
  (i !== null && i.delete(t),
  (t = Re()),
  (e.pingedLanes |= e.suspendedLanes & r),
  ye === e &&
      (Ce & r) === r &&
      (ge === 4 || (ge === 3 && (Ce & 130023424) === Ce && 500 > pe() - ta)
        ? Xt(e, 0)
        : (ea |= r)),
  He(e, t));
}
function Lh(e, t) {
  t === 0 &&
    (e.mode & 1
      ? ((t = Oi), (Oi <<= 1), !(Oi & 130023424) && (Oi = 4194304))
      : (t = 1));
  var r = Re();
  ((e = St(e, t)), e !== null && (xi(e, t, r), He(e, r)));
}
function of(e) {
  var t = e.memoizedState,
    r = 0;
  (t !== null && (r = t.retryLane), Lh(e, r));
}
function af(e, t) {
  var r = 0;
  switch (e.tag) {
  case 13:
    var i = e.stateNode,
      h = e.memoizedState;
    h !== null && (r = h.retryLane);
    break;
  case 19:
    i = e.stateNode;
    break;
  default:
    throw Error(V(314));
  }
  (i !== null && i.delete(t), Lh(e, r));
}
var Dh;
Dh = function (e, t, r) {
  if (e !== null)
    if (e.memoizedProps !== t.pendingProps || Oe.current) Be = !0;
    else {
      if (!(e.lanes & r) && !(t.flags & 128)) return ((Be = !1), qd(e, t, r));
      Be = !!(e.flags & 131072);
    }
  else ((Be = !1), ae && t.flags & 1048576 && Pc(t, vs, t.index));
  switch (((t.lanes = 0), t.tag)) {
  case 2:
    var i = t.type;
    (ts(e, t), (e = t.pendingProps));
    var h = Er(t, Le.current);
    (Cr(t, r), (h = Go(null, t, i, e, h, r)));
    var m = Xo();
    return (
      (t.flags |= 1),
      typeof h == 'object' &&
        h !== null &&
        typeof h.render == 'function' &&
        h.$$typeof === void 0
        ? ((t.tag = 1),
        (t.memoizedState = null),
        (t.updateQueue = null),
        Ie(i) ? ((m = !0), ps(t)) : (m = !1),
        (t.memoizedState =
              h.state !== null && h.state !== void 0 ? h.state : null),
        Uo(t),
        (h.updater = Hs),
        (t.stateNode = h),
        (h._reactInternals = t),
        eo(t, i, e, r),
        (t = io(null, t, i, !0, m, r)))
        : ((t.tag = 0), ae && m && Io(t), De(null, t, h, r), (t = t.child)),
      t
    );
  case 16:
    i = t.elementType;
    e: {
      switch (
        (ts(e, t),
        (e = t.pendingProps),
        (h = i._init),
        (i = h(i._payload)),
        (t.type = i),
        (h = t.tag = cf(i)),
        (e = et(i, e)),
        h)
      ) {
      case 0:
        t = ro(null, t, i, e, r);
        break e;
      case 1:
        t = nl(null, t, i, e, r);
        break e;
      case 11:
        t = il(null, t, i, e, r);
        break e;
      case 14:
        t = sl(null, t, i, et(i.type, e), r);
        break e;
      }
      throw Error(V(306, i, ''));
    }
    return t;
  case 0:
    return (
      (i = t.type),
      (h = t.pendingProps),
      (h = t.elementType === i ? h : et(i, h)),
      ro(e, t, i, h, r)
    );
  case 1:
    return (
      (i = t.type),
      (h = t.pendingProps),
      (h = t.elementType === i ? h : et(i, h)),
      nl(e, t, i, h, r)
    );
  case 3:
    e: {
      if ((uh(t), e === null)) throw Error(V(387));
      ((i = t.pendingProps),
      (m = t.memoizedState),
      (h = m.element),
      Nc(e, t),
      ys(t, i, null, r));
      var y = t.memoizedState;
      if (((i = y.element), m.isDehydrated))
        if (
          ((m = {
            element: i,
            isDehydrated: !1,
            cache: y.cache,
            pendingSuspenseBoundaries: y.pendingSuspenseBoundaries,
            transitions: y.transitions,
          }),
          (t.updateQueue.baseState = m),
          (t.memoizedState = m),
          t.flags & 256)
        ) {
          ((h = Rr(Error(V(423)), t)), (t = ol(e, t, i, r, h)));
          break e;
        } else if (i !== h) {
          ((h = Rr(Error(V(424)), t)), (t = ol(e, t, i, r, h)));
          break e;
        } else
          for (
            ze = Bt(t.stateNode.containerInfo.firstChild),
            We = t,
            ae = !0,
            rt = null,
            r = Ic(t, null, i, r),
            t.child = r;
            r;

          )
            ((r.flags = (r.flags & -3) | 4096), (r = r.sibling));
      else {
        if ((kr(), i === h)) {
          t = yt(e, t, r);
          break e;
        }
        De(e, t, i, r);
      }
      t = t.child;
    }
    return t;
  case 5:
    return (
      Fc(t),
      e === null && Qn(t),
      (i = t.type),
      (h = t.pendingProps),
      (m = e !== null ? e.memoizedProps : null),
      (y = h.children),
      Kn(i, h) ? (y = null) : m !== null && Kn(i, m) && (t.flags |= 32),
      hh(e, t),
      De(e, t, y, r),
      t.child
    );
  case 6:
    return (e === null && Qn(t), null);
  case 13:
    return dh(e, t, r);
  case 4:
    return (
      $o(t, t.stateNode.containerInfo),
      (i = t.pendingProps),
      e === null ? (t.child = Lr(t, null, i, r)) : De(e, t, i, r),
      t.child
    );
  case 11:
    return (
      (i = t.type),
      (h = t.pendingProps),
      (h = t.elementType === i ? h : et(i, h)),
      il(e, t, i, h, r)
    );
  case 7:
    return (De(e, t, t.pendingProps, r), t.child);
  case 8:
    return (De(e, t, t.pendingProps.children, r), t.child);
  case 12:
    return (De(e, t, t.pendingProps.children, r), t.child);
  case 10:
    e: {
      if (
        ((i = t.type._context),
        (h = t.pendingProps),
        (m = t.memoizedProps),
        (y = h.value),
        se(gs, i._currentValue),
        (i._currentValue = y),
        m !== null)
      )
        if (nt(m.value, y)) {
          if (m.children === h.children && !Oe.current) {
            t = yt(e, t, r);
            break e;
          }
        } else
          for (m = t.child, m !== null && (m.return = t); m !== null; ) {
            var a = m.dependencies;
            if (a !== null) {
              y = m.child;
              for (var l = a.firstContext; l !== null; ) {
                if (l.context === i) {
                  if (m.tag === 1) {
                    ((l = mt(-1, r & -r)), (l.tag = 2));
                    var f = m.updateQueue;
                    if (f !== null) {
                      f = f.shared;
                      var g = f.pending;
                      (g === null
                        ? (l.next = l)
                        : ((l.next = g.next), (g.next = l)),
                      (f.pending = l));
                    }
                  }
                  ((m.lanes |= r),
                  (l = m.alternate),
                  l !== null && (l.lanes |= r),
                  Jn(m.return, r, t),
                  (a.lanes |= r));
                  break;
                }
                l = l.next;
              }
            } else if (m.tag === 10) y = m.type === t.type ? null : m.child;
            else if (m.tag === 18) {
              if (((y = m.return), y === null)) throw Error(V(341));
              ((y.lanes |= r),
              (a = y.alternate),
              a !== null && (a.lanes |= r),
              Jn(y, r, t),
              (y = m.sibling));
            } else y = m.child;
            if (y !== null) y.return = m;
            else
              for (y = m; y !== null; ) {
                if (y === t) {
                  y = null;
                  break;
                }
                if (((m = y.sibling), m !== null)) {
                  ((m.return = y.return), (y = m));
                  break;
                }
                y = y.return;
              }
            m = y;
          }
      (De(e, t, h.children, r), (t = t.child));
    }
    return t;
  case 9:
    return (
      (h = t.type),
      (i = t.pendingProps.children),
      Cr(t, r),
      (h = Ye(h)),
      (i = i(h)),
      (t.flags |= 1),
      De(e, t, i, r),
      t.child
    );
  case 14:
    return (
      (i = t.type),
      (h = et(i, t.pendingProps)),
      (h = et(i.type, h)),
      sl(e, t, i, h, r)
    );
  case 15:
    return lh(e, t, t.type, t.pendingProps, r);
  case 17:
    return (
      (i = t.type),
      (h = t.pendingProps),
      (h = t.elementType === i ? h : et(i, h)),
      ts(e, t),
      (t.tag = 1),
      Ie(i) ? ((e = !0), ps(t)) : (e = !1),
      Cr(t, r),
      nh(t, i, h),
      eo(t, i, h, r),
      io(null, t, i, !0, e, r)
    );
  case 19:
    return fh(e, t, r);
  case 22:
    return ch(e, t, r);
  }
  throw Error(V(156, t.tag));
};
function Rh(e, t) {
  return rc(e, t);
}
function lf(e, t, r, i) {
  ((this.tag = e),
  (this.key = r),
  (this.sibling =
      this.child =
      this.return =
      this.stateNode =
      this.type =
      this.elementType =
        null),
  (this.index = 0),
  (this.ref = null),
  (this.pendingProps = t),
  (this.dependencies =
      this.memoizedState =
      this.updateQueue =
      this.memoizedProps =
        null),
  (this.mode = i),
  (this.subtreeFlags = this.flags = 0),
  (this.deletions = null),
  (this.childLanes = this.lanes = 0),
  (this.alternate = null));
}
function Ge(e, t, r, i) {
  return new lf(e, t, r, i);
}
function na(e) {
  return ((e = e.prototype), !(!e || !e.isReactComponent));
}
function cf(e) {
  if (typeof e == 'function') return na(e) ? 1 : 0;
  if (e != null) {
    if (((e = e.$$typeof), e === xo)) return 11;
    if (e === Eo) return 14;
  }
  return 2;
}
function Nt(e, t) {
  var r = e.alternate;
  return (
    r === null
      ? ((r = Ge(e.tag, t, e.key, e.mode)),
      (r.elementType = e.elementType),
      (r.type = e.type),
      (r.stateNode = e.stateNode),
      (r.alternate = e),
      (e.alternate = r))
      : ((r.pendingProps = t),
      (r.type = e.type),
      (r.flags = 0),
      (r.subtreeFlags = 0),
      (r.deletions = null)),
    (r.flags = e.flags & 14680064),
    (r.childLanes = e.childLanes),
    (r.lanes = e.lanes),
    (r.child = e.child),
    (r.memoizedProps = e.memoizedProps),
    (r.memoizedState = e.memoizedState),
    (r.updateQueue = e.updateQueue),
    (t = e.dependencies),
    (r.dependencies =
      t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
    (r.sibling = e.sibling),
    (r.index = e.index),
    (r.ref = e.ref),
    r
  );
}
function ss(e, t, r, i, h, m) {
  var y = 2;
  if (((i = e), typeof e == 'function')) na(e) && (y = 1);
  else if (typeof e == 'string') y = 5;
  else
    e: switch (e) {
    case ar:
      return Yt(r.children, h, m, t);
    case bo:
      ((y = 8), (h |= 8));
      break;
    case xn:
      return (
        (e = Ge(12, r, t, h | 2)),
        (e.elementType = xn),
        (e.lanes = m),
        e
      );
    case En:
      return ((e = Ge(13, r, t, h)), (e.elementType = En), (e.lanes = m), e);
    case kn:
      return ((e = Ge(19, r, t, h)), (e.elementType = kn), (e.lanes = m), e);
    case Fl:
      return zs(r, h, m, t);
    default:
      if (typeof e == 'object' && e !== null)
        switch (e.$$typeof) {
        case Hl:
          y = 10;
          break e;
        case Nl:
          y = 9;
          break e;
        case xo:
          y = 11;
          break e;
        case Eo:
          y = 14;
          break e;
        case Et:
          ((y = 16), (i = null));
          break e;
        }
      throw Error(V(130, e == null ? e : typeof e, ''));
    }
  return (
    (t = Ge(y, r, t, h)),
    (t.elementType = e),
    (t.type = i),
    (t.lanes = m),
    t
  );
}
function Yt(e, t, r, i) {
  return ((e = Ge(7, e, i, t)), (e.lanes = r), e);
}
function zs(e, t, r, i) {
  return (
    (e = Ge(22, e, i, t)),
    (e.elementType = Fl),
    (e.lanes = r),
    (e.stateNode = { isHidden: !1 }),
    e
  );
}
function yn(e, t, r) {
  return ((e = Ge(6, e, null, t)), (e.lanes = r), e);
}
function wn(e, t, r) {
  return (
    (t = Ge(4, e.children !== null ? e.children : [], e.key, t)),
    (t.lanes = r),
    (t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation,
    }),
    t
  );
}
function hf(e, t, r, i, h) {
  ((this.tag = t),
  (this.containerInfo = e),
  (this.finishedWork =
      this.pingCache =
      this.current =
      this.pendingChildren =
        null),
  (this.timeoutHandle = -1),
  (this.callbackNode = this.pendingContext = this.context = null),
  (this.callbackPriority = 0),
  (this.eventTimes = en(0)),
  (this.expirationTimes = en(-1)),
  (this.entangledLanes =
      this.finishedLanes =
      this.mutableReadLanes =
      this.expiredLanes =
      this.pingedLanes =
      this.suspendedLanes =
      this.pendingLanes =
        0),
  (this.entanglements = en(0)),
  (this.identifierPrefix = i),
  (this.onRecoverableError = h),
  (this.mutableSourceEagerHydrationData = null));
}
function oa(e, t, r, i, h, m, y, a, l) {
  return (
    (e = new hf(e, t, r, a, l)),
    t === 1 ? ((t = 1), m === !0 && (t |= 8)) : (t = 0),
    (m = Ge(3, null, null, t)),
    (e.current = m),
    (m.stateNode = e),
    (m.memoizedState = {
      element: i,
      isDehydrated: r,
      cache: null,
      transitions: null,
      pendingSuspenseBoundaries: null,
    }),
    Uo(m),
    e
  );
}
function uf(e, t, r) {
  var i = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
    $$typeof: or,
    key: i == null ? null : '' + i,
    children: e,
    containerInfo: t,
    implementation: r,
  };
}
function Th(e) {
  if (!e) return zt;
  e = e._reactInternals;
  e: {
    if (ir(e) !== e || e.tag !== 1) throw Error(V(170));
    var t = e;
    do {
      switch (t.tag) {
      case 3:
        t = t.stateNode.context;
        break e;
      case 1:
        if (Ie(t.type)) {
          t = t.stateNode.__reactInternalMemoizedMergedChildContext;
          break e;
        }
      }
      t = t.return;
    } while (t !== null);
    throw Error(V(171));
  }
  if (e.tag === 1) {
    var r = e.type;
    if (Ie(r)) return Tc(e, r, t);
  }
  return t;
}
function Ah(e, t, r, i, h, m, y, a, l) {
  return (
    (e = oa(r, i, !0, e, h, m, y, a, l)),
    (e.context = Th(null)),
    (r = e.current),
    (i = Re()),
    (h = Ht(r)),
    (m = mt(i, h)),
    (m.callback = t ?? null),
    Ot(r, m, h),
    (e.current.lanes = h),
    xi(e, h, i),
    He(e, i),
    e
  );
}
function Ws(e, t, r, i) {
  var h = t.current,
    m = Re(),
    y = Ht(h);
  return (
    (r = Th(r)),
    t.context === null ? (t.context = r) : (t.pendingContext = r),
    (t = mt(m, y)),
    (t.payload = { element: e }),
    (i = i === void 0 ? null : i),
    i !== null && (t.callback = i),
    (e = Ot(h, t, y)),
    e !== null && (st(e, h, y, m), Ji(e, h, y)),
    y
  );
}
function Ds(e) {
  if (((e = e.current), !e.child)) return null;
  switch (e.child.tag) {
  case 5:
    return e.child.stateNode;
  default:
    return e.child.stateNode;
  }
}
function ml(e, t) {
  if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
    var r = e.retryLane;
    e.retryLane = r !== 0 && r < t ? r : t;
  }
}
function aa(e, t) {
  (ml(e, t), (e = e.alternate) && ml(e, t));
}
function df() {
  return null;
}
var Ph =
  typeof reportError == 'function'
    ? reportError
    : function (e) {
      console.error(e);
    };
function la(e) {
  this._internalRoot = e;
}
js.prototype.render = la.prototype.render = function (e) {
  var t = this._internalRoot;
  if (t === null) throw Error(V(409));
  Ws(e, t, null, null);
};
js.prototype.unmount = la.prototype.unmount = function () {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    (tr(function () {
      Ws(null, e, null, null);
    }),
    (t[gt] = null));
  }
};
function js(e) {
  this._internalRoot = e;
}
js.prototype.unstable_scheduleHydration = function (e) {
  if (e) {
    var t = cc();
    e = { blockedOn: null, target: e, priority: t };
    for (var r = 0; r < Lt.length && t !== 0 && t < Lt[r].priority; r++);
    (Lt.splice(r, 0, e), r === 0 && uc(e));
  }
};
function ca(e) {
  return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
}
function Us(e) {
  return !(
    !e ||
    (e.nodeType !== 1 &&
      e.nodeType !== 9 &&
      e.nodeType !== 11 &&
      (e.nodeType !== 8 || e.nodeValue !== ' react-mount-point-unstable '))
  );
}
function vl() {}
function ff(e, t, r, i, h) {
  if (h) {
    if (typeof i == 'function') {
      var m = i;
      i = function () {
        var f = Ds(y);
        m.call(f);
      };
    }
    var y = Ah(t, i, e, 0, null, !1, !1, '', vl);
    return (
      (e._reactRootContainer = y),
      (e[gt] = y.current),
      _i(e.nodeType === 8 ? e.parentNode : e),
      tr(),
      y
    );
  }
  for (; (h = e.lastChild); ) e.removeChild(h);
  if (typeof i == 'function') {
    var a = i;
    i = function () {
      var f = Ds(l);
      a.call(f);
    };
  }
  var l = oa(e, 0, !1, null, null, !1, !1, '', vl);
  return (
    (e._reactRootContainer = l),
    (e[gt] = l.current),
    _i(e.nodeType === 8 ? e.parentNode : e),
    tr(function () {
      Ws(t, l, r, i);
    }),
    l
  );
}
function $s(e, t, r, i, h) {
  var m = r._reactRootContainer;
  if (m) {
    var y = m;
    if (typeof h == 'function') {
      var a = h;
      h = function () {
        var l = Ds(y);
        a.call(l);
      };
    }
    Ws(t, y, e, h);
  } else y = ff(r, t, e, h, i);
  return Ds(y);
}
ac = function (e) {
  switch (e.tag) {
  case 3:
    var t = e.stateNode;
    if (t.current.memoizedState.isDehydrated) {
      var r = Gr(t.pendingLanes);
      r !== 0 &&
          (Do(t, r | 1), He(t, pe()), !(te & 6) && ((Tr = pe() + 500), Ut()));
    }
    break;
  case 13:
    (tr(function () {
      var i = St(e, 1);
      if (i !== null) {
        var h = Re();
        st(i, e, 1, h);
      }
    }),
    aa(e, 1));
  }
};
Ro = function (e) {
  if (e.tag === 13) {
    var t = St(e, 134217728);
    if (t !== null) {
      var r = Re();
      st(t, e, 134217728, r);
    }
    aa(e, 134217728);
  }
};
lc = function (e) {
  if (e.tag === 13) {
    var t = Ht(e),
      r = St(e, t);
    if (r !== null) {
      var i = Re();
      st(r, e, t, i);
    }
    aa(e, t);
  }
};
cc = function () {
  return re;
};
hc = function (e, t) {
  var r = re;
  try {
    return ((re = e), t());
  } finally {
    re = r;
  }
};
In = function (e, t, r) {
  switch (t) {
  case 'input':
    if ((Rn(e, r), (t = r.name), r.type === 'radio' && t != null)) {
      for (r = e; r.parentNode; ) r = r.parentNode;
      for (
        r = r.querySelectorAll(
          'input[name=' + JSON.stringify('' + t) + '][type="radio"]'
        ),
        t = 0;
        t < r.length;
        t++
      ) {
        var i = r[t];
        if (i !== e && i.form === e.form) {
          var h = Bs(i);
          if (!h) throw Error(V(90));
          (Wl(i), Rn(i, h));
        }
      }
    }
    break;
  case 'textarea':
    Ul(e, r);
    break;
  case 'select':
    ((t = r.value), t != null && gr(e, !!r.multiple, t, !1));
  }
};
Yl = ra;
Ql = tr;
var _f = { usingClientEntryPoint: !1, Events: [ki, ur, Bs, Gl, Xl, ra] },
  Vr = {
    findFiberByHostInstance: Kt,
    bundleType: 0,
    version: '18.3.1',
    rendererPackageName: 'react-dom',
  },
  pf = {
    bundleType: Vr.bundleType,
    version: Vr.version,
    rendererPackageName: Vr.rendererPackageName,
    rendererConfig: Vr.rendererConfig,
    overrideHookState: null,
    overrideHookStateDeletePath: null,
    overrideHookStateRenamePath: null,
    overrideProps: null,
    overridePropsDeletePath: null,
    overridePropsRenamePath: null,
    setErrorHandler: null,
    setSuspenseHandler: null,
    scheduleUpdate: null,
    currentDispatcherRef: wt.ReactCurrentDispatcher,
    findHostInstanceByFiber: function (e) {
      return ((e = ec(e)), e === null ? null : e.stateNode);
    },
    findFiberByHostInstance: Vr.findFiberByHostInstance || df,
    findHostInstancesForRefresh: null,
    scheduleRefresh: null,
    scheduleRoot: null,
    setRefreshHandler: null,
    getCurrentFiber: null,
    reconcilerVersion: '18.3.1-next-f1338f8080-20240426',
  };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < 'u') {
  var Ki = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!Ki.isDisabled && Ki.supportsFiber)
    try {
      ((Ts = Ki.inject(pf)), (ht = Ki));
    } catch {}
}
Ue.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = _f;
Ue.createPortal = function (e, t) {
  var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!ca(t)) throw Error(V(200));
  return uf(e, t, null, r);
};
Ue.createRoot = function (e, t) {
  if (!ca(e)) throw Error(V(299));
  var r = !1,
    i = '',
    h = Ph;
  return (
    t != null &&
      (t.unstable_strictMode === !0 && (r = !0),
      t.identifierPrefix !== void 0 && (i = t.identifierPrefix),
      t.onRecoverableError !== void 0 && (h = t.onRecoverableError)),
    (t = oa(e, 1, !1, null, null, r, !1, i, h)),
    (e[gt] = t.current),
    _i(e.nodeType === 8 ? e.parentNode : e),
    new la(t)
  );
};
Ue.findDOMNode = function (e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == 'function'
      ? Error(V(188))
      : ((e = Object.keys(e).join(',')), Error(V(268, e)));
  return ((e = ec(t)), (e = e === null ? null : e.stateNode), e);
};
Ue.flushSync = function (e) {
  return tr(e);
};
Ue.hydrate = function (e, t, r) {
  if (!Us(t)) throw Error(V(200));
  return $s(null, e, t, !0, r);
};
Ue.hydrateRoot = function (e, t, r) {
  if (!ca(e)) throw Error(V(405));
  var i = (r != null && r.hydratedSources) || null,
    h = !1,
    m = '',
    y = Ph;
  if (
    (r != null &&
      (r.unstable_strictMode === !0 && (h = !0),
      r.identifierPrefix !== void 0 && (m = r.identifierPrefix),
      r.onRecoverableError !== void 0 && (y = r.onRecoverableError)),
    (t = Ah(t, null, e, 1, r ?? null, h, !1, m, y)),
    (e[gt] = t.current),
    _i(e),
    i)
  )
    for (e = 0; e < i.length; e++)
      ((r = i[e]),
      (h = r._getVersion),
      (h = h(r._source)),
      t.mutableSourceEagerHydrationData == null
        ? (t.mutableSourceEagerHydrationData = [r, h])
        : t.mutableSourceEagerHydrationData.push(r, h));
  return new js(t);
};
Ue.render = function (e, t, r) {
  if (!Us(t)) throw Error(V(200));
  return $s(null, e, t, !1, r);
};
Ue.unmountComponentAtNode = function (e) {
  if (!Us(e)) throw Error(V(40));
  return e._reactRootContainer
    ? (tr(function () {
      $s(null, null, e, !1, function () {
        ((e._reactRootContainer = null), (e[gt] = null));
      });
    }),
    !0)
    : !1;
};
Ue.unstable_batchedUpdates = ra;
Ue.unstable_renderSubtreeIntoContainer = function (e, t, r, i) {
  if (!Us(r)) throw Error(V(200));
  if (e == null || e._reactInternals === void 0) throw Error(V(38));
  return $s(e, t, r, !1, i);
};
Ue.version = '18.3.1-next-f1338f8080-20240426';
function Mh() {
  if (
    !(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > 'u' ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != 'function'
    )
  )
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Mh);
    } catch (e) {
      console.error(e);
    }
}
(Mh(), (Ml.exports = Ue));
var mf = Ml.exports,
  gl = mf;
((Cn.createRoot = gl.createRoot), (Cn.hydrateRoot = gl.hydrateRoot));
const Sl = {
    mermaid: {
      '--bg-color': '#0b132b',
      '--primary-color': '#ff66cc',
      '--secondary-color': '#ff7f50',
      '--accent-color': '#20c997',
      '--highlight-color': '#4dabf7',
      '--text-color': '#e0f7fa',
    },
    racecar: {
      '--bg-color': '#111',
      '--primary-color': '#ff0000',
      '--secondary-color': '#00ff00',
      '--accent-color': '#ffff00',
      '--highlight-color': '#ffffff',
      '--text-color': '#f1f1f1',
    },
  },
  Ne = {
    colors: {
      primary: '#00d4ff',
      secondary: '#ff6b9d',
      accent: '#00ff88',
      highlight: '#ffd700',
      bgPrimary: '#001122',
      bgSecondary: '#002244',
      bgTertiary: '#003366',
      textPrimary: '#e0f7ff',
      textSecondary: '#b3e5fc',
      textMuted: '#81d4fa',
      glow: '#00d4ff',
      shimmer: '#ffffff',
      bubble: '#4fc3f7',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3',
    },
    gradients: {
      ocean: 'linear-gradient(135deg, #001122 0%, #002244 50%, #003366 100%)',
      bubbles:
        'radial-gradient(circle at 30% 20%, rgba(79, 195, 247, 0.3) 0%, transparent 50%)',
    },
    styles: `
    /* Enhanced Mermaid Theme Styles */
    :root {
      --primary-color: ${Ne.colors.primary};
      --secondary-color: ${Ne.colors.secondary};
      --accent-color: ${Ne.colors.accent};
      --highlight-color: ${Ne.colors.highlight};
      --bg-color: ${Ne.colors.bgPrimary};
      --text-color: ${Ne.colors.textPrimary};
      --glow: ${Ne.colors.glow};
      --shimmer: ${Ne.colors.shimmer};
      --bubble: ${Ne.colors.bubble};
    }
    
    /* Ocean background with animated bubbles */
    .terminal {
      background: ${Ne.gradients.ocean};
      position: relative;
      overflow: hidden;
    }
    
    .terminal::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${Ne.gradients.bubbles};
      animation: float 20s infinite linear;
      pointer-events: none;
    }
    
    /* Animated bubbles */
    .terminal::after {
      content: '🫧';
      position: absolute;
      top: 20px;
      left: 10%;
      font-size: 20px;
      animation: float 15s infinite ease-in-out;
      opacity: 0.6;
    }
    
    /* Terminal header with glow effect */
    .terminal-header {
      background: linear-gradient(90deg, 
        rgba(0, 212, 255, 0.1) 0%, 
        rgba(255, 107, 157, 0.1) 50%, 
        rgba(0, 255, 136, 0.1) 100%);
      border: 2px solid var(--primary-color);
      border-radius: 15px;
      box-shadow: 
        0 0 20px rgba(0, 212, 255, 0.3),
        inset 0 0 20px rgba(0, 212, 255, 0.1);
      animation: glow 3s ease-in-out infinite;
      position: relative;
      overflow: hidden;
    }
    
    .terminal-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(255, 255, 255, 0.2), 
        transparent);
      animation: shimmer 3s infinite;
    }
    
    /* Glowing title */
    .terminal-header h2 {
      text-shadow: 
        0 0 10px var(--glow),
        0 0 20px var(--glow),
        0 0 30px var(--glow);
      background: linear-gradient(45deg, var(--primary-color), var(--secondary-color), var(--accent-color));
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 2s ease-in-out infinite;
    }
    
    /* Logs with underwater effect */
    .logs {
      background: rgba(0, 17, 34, 0.8);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 10px;
      backdrop-filter: blur(10px);
      box-shadow: 
        0 0 30px rgba(0, 212, 255, 0.2),
        inset 0 0 30px rgba(0, 212, 255, 0.1);
    }
    
    /* Input bar with coral glow */
    .input-bar {
      background: linear-gradient(90deg, 
        rgba(255, 107, 157, 0.1) 0%, 
        rgba(0, 255, 136, 0.1) 100%);
      border: 2px solid var(--secondary-color);
      border-radius: 25px;
      box-shadow: 
        0 0 15px rgba(255, 107, 157, 0.4),
        inset 0 0 15px rgba(255, 107, 157, 0.1);
      animation: breathe 4s ease-in-out infinite;
    }
    
    .input-bar input {
      background: transparent;
      color: var(--text-color);
      text-shadow: 0 0 5px var(--glow);
    }
    
    .input-bar input::placeholder {
      color: rgba(224, 247, 255, 0.6);
      text-shadow: 0 0 3px var(--glow);
    }
    
    /* Command suggestions with bubble effect */
    .suggestions-dropdown {
      background: rgba(0, 17, 34, 0.95);
      border: 2px solid var(--accent-color);
      border-radius: 15px;
      backdrop-filter: blur(15px);
      box-shadow: 
        0 0 25px rgba(0, 255, 136, 0.4),
        inset 0 0 25px rgba(0, 255, 136, 0.1);
    }
    
    .suggestion-item {
      transition: all 0.3s ease;
      border-radius: 10px;
      margin: 2px;
    }
    
    .suggestion-item:hover {
      background: rgba(0, 255, 136, 0.2);
      transform: translateX(5px);
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }
    
    .suggestion-item.selected {
      background: linear-gradient(45deg, var(--accent-color), var(--primary-color));
      color: var(--bg-color);
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
      transform: scale(1.02);
    }
    
    /* Buttons with ocean wave effect */
    button {
      background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
      border: none;
      border-radius: 20px;
      color: var(--bg-color);
      font-weight: bold;
      text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
      box-shadow: 
        0 4px 15px rgba(0, 212, 255, 0.3),
        inset 0 0 10px rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(255, 255, 255, 0.3), 
        transparent);
      transition: left 0.5s ease;
    }
    
    button:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 6px 20px rgba(0, 212, 255, 0.4),
        inset 0 0 15px rgba(255, 255, 255, 0.3);
    }
    
    button:hover::before {
      left: 100%;
    }
    
    button:active {
      transform: translateY(0);
      box-shadow: 
        0 2px 10px rgba(0, 212, 255, 0.3),
        inset 0 0 10px rgba(0, 0, 0, 0.2);
    }
    
    /* Stats cards with floating effect */
    .stat-card {
      background: rgba(0, 17, 34, 0.8);
      border: 2px solid var(--primary-color);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      box-shadow: 
        0 0 20px rgba(0, 212, 255, 0.3),
        inset 0 0 20px rgba(0, 212, 255, 0.1);
      transition: all 0.3s ease;
      animation: float 6s ease-in-out infinite;
    }
    
    .stat-card:nth-child(2) {
      animation-delay: -2s;
    }
    
    .stat-card:nth-child(3) {
      animation-delay: -4s;
    }
    
    .stat-card:hover {
      transform: translateY(-10px) scale(1.05);
      box-shadow: 
        0 0 30px rgba(0, 212, 255, 0.5),
        inset 0 0 30px rgba(0, 212, 255, 0.2);
    }
    
    /* Theme selector with coral glow */
    .theme-selector {
      background: linear-gradient(135deg, 
        rgba(255, 107, 157, 0.1) 0%, 
        rgba(0, 255, 136, 0.1) 100%);
      border: 2px solid var(--secondary-color);
      border-radius: 20px;
      box-shadow: 
        0 0 25px rgba(255, 107, 157, 0.3),
        inset 0 0 25px rgba(255, 107, 157, 0.1);
    }
    
    /* Scrollbar styling */
    .logs::-webkit-scrollbar {
      width: 8px;
    }
    
    .logs::-webkit-scrollbar-track {
      background: rgba(0, 17, 34, 0.5);
      border-radius: 4px;
    }
    
    .logs::-webkit-scrollbar-thumb {
      background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
      border-radius: 4px;
      box-shadow: 0 0 5px var(--glow);
    }
    
    .logs::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(45deg, var(--accent-color), var(--secondary-color));
      box-shadow: 0 0 10px var(--glow);
    }
    
    /* Ripple effect for clicks */
    .ripple {
      position: relative;
      overflow: hidden;
    }
    
    .ripple::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      animation: ripple 0.6s ease-out;
    }
    
    /* Loading animation */
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(0, 212, 255, 0.3);
      border-radius: 50%;
      border-top-color: var(--primary-color);
      animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .terminal-header h2 {
        font-size: 1.5rem;
      }
      
      .stat-card {
        margin: 10px 0;
      }
      
      .suggestions-dropdown {
        max-height: 150px;
      }
    }
  `,
  };
function vf() {
  const e = document.getElementById('mermaid-enhanced-theme');
  e && e.remove();
  const t = document.createElement('style');
  ((t.id = 'mermaid-enhanced-theme'),
  (t.textContent = Ne.styles),
  document.head.appendChild(t));
  const r = document.documentElement;
  (Object.entries(Ne.colors).forEach(([i, h]) => {
    r.style.setProperty(`--${i.replace(/([A-Z])/g, '-$1').toLowerCase()}`, h);
  }),
  gf(),
  console.log('🌊 Enhanced Mermaid theme applied with ocean animations!'));
}
function gf() {
  const e = document.querySelector('.terminal');
  if (!e) return;
  const t = document.createElement('div');
  t.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 1;
  `;
  for (let r = 0; r < 15; r++) {
    const i = document.createElement('div');
    ((i.innerHTML = '🫧'),
    (i.style.cssText = `
      position: absolute;
      font-size: ${Math.random() * 20 + 10}px;
      left: ${Math.random() * 100}%;
      bottom: -50px;
      animation: float ${Math.random() * 10 + 10}s infinite linear;
      animation-delay: ${Math.random() * 5}s;
      opacity: ${Math.random() * 0.5 + 0.3};
      color: var(--bubble);
      text-shadow: 0 0 10px var(--glow);
    `),
    t.appendChild(i));
  }
  e.appendChild(t);
}
function Yr(e = 'mermaid') {
  if (e === 'mermaid-enhanced') {
    (vf(), localStorage.setItem('theme', e));
    return;
  }
  const t = Sl[e] || Sl.mermaid,
    r = document.documentElement;
  (Object.entries(t).forEach(([i, h]) => {
    r.style.setProperty(i, h);
  }),
  localStorage.setItem('theme', e));
}
function Sf() {
  const e = localStorage.getItem('theme') || 'mermaid';
  Yr(e);
}
class yf {
  constructor() {
    ((this.commandHistory = []),
    (this.userPreferences = {}),
    (this.context = {
      currentDirectory: '',
      recentCommands: [],
      systemInfo: {},
      projectType: null,
    }));
  }
  async predictCommand(t, r = {}) {
    try {
      const i = await this.generatePredictions(t, r);
      return {
        suggestions: i.suggestions,
        explanation: i.explanation,
        confidence: i.confidence,
        alternatives: i.alternatives,
      };
    } catch (i) {
      return (
        console.error('Command prediction error:', i),
        this.getFallbackSuggestions(t)
      );
    }
  }
  async generatePredictions(t, r) {
    const i = this.buildPredictionPrompt(t, r);
    try {
      const m = await (
        await fetch('https://api.rinawarptech.com/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: i,
            provider: 'groq',
            enableVoice: !1,
          }),
        })
      ).json();
      return this.parseAIResponse(m.response);
    } catch {
      return this.getLocalPredictions(t);
    }
  }
  buildPredictionPrompt(t, r) {
    return `
You are an expert terminal command predictor. Analyze this user input and provide intelligent suggestions.

User Input: "${t}"
Context: ${JSON.stringify(r, null, 2)}

Provide:
1. 3-5 specific command suggestions with explanations
2. What each command does in simple terms
3. Alternative approaches
4. Potential risks or warnings
5. Confidence level (1-10)

Format as JSON:
{
  "suggestions": [
    {
      "command": "git status",
      "explanation": "Shows current git repository status",
      "confidence": 9,
      "category": "git"
    }
  ],
  "explanation": "Overall explanation of what the user is trying to do",
  "confidence": 8,
  "alternatives": ["alternative approaches"],
  "warnings": ["potential risks"]
}
`;
  }
  parseAIResponse(t) {
    try {
      const r = t.match(/\{[\s\S]*\}/);
      if (r) return JSON.parse(r[0]);
    } catch (r) {
      console.error('Failed to parse AI response:', r);
    }
    return this.getFallbackSuggestions(input);
  }
  getLocalPredictions(t) {
    const r = t.toLowerCase();
    return r.includes('git') || r.includes('commit') || r.includes('push')
      ? {
        suggestions: [
          {
            command: 'git status',
            explanation: 'Check current repository status',
            confidence: 9,
            category: 'git',
          },
          {
            command: 'git add .',
            explanation: 'Stage all changes for commit',
            confidence: 8,
            category: 'git',
          },
          {
            command: 'git commit -m "message"',
            explanation: 'Commit staged changes with message',
            confidence: 8,
            category: 'git',
          },
        ],
        explanation: 'Git version control commands',
        confidence: 7,
        alternatives: ['GitHub CLI', 'VS Code Git integration'],
        warnings: ['Make sure you are in a git repository'],
      }
      : r.includes('file') || r.includes('list') || r.includes('directory')
        ? {
          suggestions: [
            {
              command: 'ls -la',
              explanation: 'List all files with detailed information',
              confidence: 9,
              category: 'filesystem',
            },
            {
              command: 'find . -name "*.js"',
              explanation: 'Find all JavaScript files',
              confidence: 8,
              category: 'filesystem',
            },
            {
              command: 'du -sh *',
              explanation: 'Show directory sizes',
              confidence: 7,
              category: 'filesystem',
            },
          ],
          explanation: 'File and directory operations',
          confidence: 8,
          alternatives: ['File manager', 'VS Code explorer'],
          warnings: [],
        }
        : r.includes('cpu') || r.includes('memory') || r.includes('system')
          ? {
            suggestions: [
              {
                command: 'top',
                explanation: 'Show running processes and system stats',
                confidence: 9,
                category: 'system',
              },
              {
                command: 'htop',
                explanation: 'Interactive process viewer (if installed)',
                confidence: 8,
                category: 'system',
              },
              {
                command: 'df -h',
                explanation: 'Show disk usage by filesystem',
                confidence: 8,
                category: 'system',
              },
            ],
            explanation: 'System monitoring and process management',
            confidence: 8,
            alternatives: [
              'Activity Monitor (macOS)',
              'Task Manager (Windows)',
            ],
            warnings: ['Some commands may require sudo privileges'],
          }
          : {
            suggestions: [
              {
                command: 'help',
                explanation: 'Show available commands',
                confidence: 6,
                category: 'general',
              },
              {
                command: 'man [command]',
                explanation: 'Show manual page for a command',
                confidence: 7,
                category: 'general',
              },
            ],
            explanation: 'General help and documentation',
            confidence: 5,
            alternatives: ['Ask Rina for help', 'Check documentation'],
            warnings: [],
          };
  }
  getFallbackSuggestions(t) {
    return {
      suggestions: [
        {
          command: 'help',
          explanation: 'Show available commands',
          confidence: 5,
          category: 'general',
        },
      ],
      explanation: 'Basic help command',
      confidence: 3,
      alternatives: [],
      warnings: ['AI prediction unavailable'],
    };
  }
  learnFromCommand(t, r, i) {
    (this.commandHistory.push({
      command: t,
      success: r,
      context: i,
      timestamp: new Date(),
    }),
    this.updateUserPreferences());
  }
  updateUserPreferences() {
    const t = this.commandHistory.slice(-20),
      r = {};
    (t.forEach((i) => {
      i.success && (r[i.context.category] = (r[i.context.category] || 0) + 1);
    }),
    (this.userPreferences = {
      favoriteCategories: Object.keys(r).sort((i, h) => r[h] - r[i]),
      lastUpdated: new Date(),
    }));
  }
  getContextualSuggestions() {
    const t = [];
    return (
      this.context.currentDirectory.includes('node_modules') &&
        t.push({
          command: 'cd ..',
          explanation: 'Go back to project root',
          confidence: 8,
          category: 'navigation',
        }),
      this.context.recentCommands.includes('git add') &&
        t.push({
          command: 'git commit -m "feat: add new feature"',
          explanation: 'Commit staged changes',
          confidence: 9,
          category: 'git',
        }),
      t
    );
  }
}
class wf {
  constructor() {
    ((this.explanations = new Map()),
    (this.examples = new Map()),
    this.initializeCommandDatabase());
  }
  initializeCommandDatabase() {
    Object.entries({
      'git status': {
        explanation:
          'Shows the current state of your Git repository, including staged, unstaged, and untracked files.',
        examples: [
          'git status',
          'git status --short',
          'git status --porcelain',
        ],
        category: 'git',
        difficulty: 'beginner',
        related: ['git add', 'git commit', 'git diff'],
      },
      'git add': {
        explanation:
          'Stages changes for the next commit. You can add specific files or all changes.',
        examples: [
          'git add filename.txt',
          'git add .',
          'git add --all',
          'git add -p',
        ],
        category: 'git',
        difficulty: 'beginner',
        related: ['git status', 'git commit', 'git reset'],
      },
      'git commit': {
        explanation:
          'Creates a snapshot of your staged changes with a descriptive message.',
        examples: [
          'git commit -m "Add new feature"',
          'git commit -am "Quick commit"',
          'git commit --amend',
        ],
        category: 'git',
        difficulty: 'beginner',
        related: ['git add', 'git push', 'git log'],
      },
      'git push': {
        explanation: 'Uploads your local commits to the remote repository.',
        examples: [
          'git push',
          'git push origin main',
          'git push -u origin feature-branch',
        ],
        category: 'git',
        difficulty: 'beginner',
        related: ['git commit', 'git pull', 'git fetch'],
      },
      ls: {
        explanation: 'Lists files and directories in the current location.',
        examples: ['ls', 'ls -la', 'ls -lh', 'ls -t'],
        category: 'filesystem',
        difficulty: 'beginner',
        related: ['dir', 'find', 'tree'],
      },
      cd: {
        explanation: 'Changes the current directory to the specified path.',
        examples: ['cd /path/to/directory', 'cd ..', 'cd ~', 'cd -'],
        category: 'filesystem',
        difficulty: 'beginner',
        related: ['pwd', 'ls', 'pushd', 'popd'],
      },
      mkdir: {
        explanation: 'Creates a new directory with the specified name.',
        examples: [
          'mkdir newfolder',
          'mkdir -p path/to/nested/folder',
          'mkdir folder1 folder2 folder3',
        ],
        category: 'filesystem',
        difficulty: 'beginner',
        related: ['rmdir', 'rm', 'ls'],
      },
      rm: {
        explanation: 'Removes files or directories. Use with caution!',
        examples: [
          'rm filename.txt',
          'rm -r directory',
          'rm -rf directory',
          'rm -i filename.txt',
        ],
        category: 'filesystem',
        difficulty: 'intermediate',
        related: ['rmdir', 'mv', 'cp'],
        warning: 'This command permanently deletes files!',
      },
      top: {
        explanation:
          'Shows real-time information about running processes and system resource usage.',
        examples: ['top', 'top -u username', 'top -p 1234'],
        category: 'system',
        difficulty: 'intermediate',
        related: ['htop', 'ps', 'kill'],
      },
      ps: {
        explanation: 'Shows information about running processes.',
        examples: ['ps aux', 'ps -ef', 'ps -u username'],
        category: 'system',
        difficulty: 'intermediate',
        related: ['top', 'htop', 'kill'],
      },
      kill: {
        explanation: 'Terminates processes by process ID (PID).',
        examples: ['kill 1234', 'kill -9 1234', 'killall processname'],
        category: 'system',
        difficulty: 'intermediate',
        related: ['ps', 'top', 'pkill'],
        warning: 'Use with caution - can terminate important processes!',
      },
      ping: {
        explanation:
          'Tests network connectivity to a host by sending ICMP packets.',
        examples: [
          'ping google.com',
          'ping -c 4 8.8.8.8',
          'ping -i 2 example.com',
        ],
        category: 'network',
        difficulty: 'beginner',
        related: ['traceroute', 'nslookup', 'curl'],
      },
      curl: {
        explanation:
          'Transfers data to or from a server using various protocols (HTTP, FTP, etc.).',
        examples: [
          'curl https://api.example.com',
          'curl -O https://example.com/file.zip',
          'curl -X POST -d "data" https://api.example.com',
        ],
        category: 'network',
        difficulty: 'intermediate',
        related: ['wget', 'ping', 'telnet'],
      },
      grep: {
        explanation: 'Searches for patterns in text files or input streams.',
        examples: [
          'grep "pattern" file.txt',
          'grep -r "pattern" directory/',
          'grep -i "pattern" file.txt',
          'grep -n "pattern" file.txt',
        ],
        category: 'text',
        difficulty: 'intermediate',
        related: ['awk', 'sed', 'find'],
      },
      awk: {
        explanation:
          'Powerful text processing tool for pattern scanning and data extraction.',
        examples: [
          'awk \'{print $1}\' file.txt',
          'awk -F: \'{print $1}\' /etc/passwd',
          'awk \'NR>1 {print $2}\' data.csv',
        ],
        category: 'text',
        difficulty: 'advanced',
        related: ['grep', 'sed', 'cut'],
      },
      sed: {
        explanation: 'Stream editor for filtering and transforming text.',
        examples: [
          'sed \'s/old/new/g\' file.txt',
          'sed -n \'1,10p\' file.txt',
          'sed -i \'s/old/new/g\' file.txt',
        ],
        category: 'text',
        difficulty: 'advanced',
        related: ['awk', 'grep', 'tr'],
      },
    }).forEach(([r, i]) => {
      this.explanations.set(r, i);
    });
  }
  async explainCommand(t, r = {}) {
    const i = this.cleanCommand(t);
    if (this.explanations.has(i))
      return this.formatExplanation(this.explanations.get(i), r);
    try {
      return await this.getAIExplanation(t, r);
    } catch (h) {
      return (
        console.error('AI explanation failed:', h),
        this.getGenericExplanation(t)
      );
    }
  }
  cleanCommand(t) {
    return t.trim().toLowerCase().replace(/\s+/g, ' ');
  }
  async getAIExplanation(t, r) {
    const i = `
Explain this terminal command in detail: "${t}"

Provide:
1. What the command does
2. Common usage examples
3. Important flags/options
4. Potential risks or warnings
5. Related commands
6. Difficulty level (beginner/intermediate/advanced)

Format as JSON:
{
  "explanation": "Detailed explanation",
  "examples": ["example1", "example2"],
  "flags": ["-flag: description"],
  "warnings": ["potential risks"],
  "related": ["related commands"],
  "difficulty": "beginner|intermediate|advanced",
  "category": "command category"
}
`;
    try {
      const m = await (
        await fetch('https://api.rinawarptech.com/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: i,
            provider: 'groq',
            enableVoice: !1,
          }),
        })
      ).json();
      return this.parseAIExplanation(m.response);
    } catch {
      throw new Error('AI explanation unavailable');
    }
  }
  parseAIExplanation(t) {
    try {
      const r = t.match(/\{[\s\S]*\}/);
      if (r) {
        const i = JSON.parse(r[0]);
        return this.formatExplanation(i);
      }
    } catch (r) {
      console.error('Failed to parse AI explanation:', r);
    }
    return this.getGenericExplanation(command);
  }
  formatExplanation(t, r = {}) {
    return {
      command: t.command || 'Unknown command',
      explanation: t.explanation || 'No explanation available',
      examples: t.examples || [],
      flags: t.flags || [],
      warnings: t.warnings || [],
      related: t.related || [],
      difficulty: t.difficulty || 'unknown',
      category: t.category || 'general',
      confidence: t.confidence || 5,
      timestamp: new Date().toISOString(),
    };
  }
  getGenericExplanation(t) {
    const i = t.trim().split(' ')[0];
    return {
      command: t,
      explanation: `This appears to be a ${i} command. For detailed help, try: ${i} --help or man ${i}`,
      examples: [`${i} --help`, `man ${i}`],
      flags: [],
      warnings: ['Command explanation not available - use built-in help'],
      related: ['help', 'man'],
      difficulty: 'unknown',
      category: 'general',
      confidence: 2,
      timestamp: new Date().toISOString(),
    };
  }
  getContextualSuggestions(t) {
    const r = [];
    return (
      t.currentDirectory &&
        t.currentDirectory.includes('.git') &&
        r.push(
          'git status',
          'git log --oneline',
          'git branch',
          'git remote -v'
        ),
      t.currentDirectory &&
        (t.currentDirectory.includes('node_modules') ||
          t.currentDirectory.includes('package.json')) &&
        r.push('npm install', 'npm run dev', 'npm test', 'npm run build'),
      t.systemLoad &&
        t.systemLoad > 0.8 &&
        r.push('top', 'htop', 'ps aux', 'df -h'),
      r
    );
  }
  searchCommands(t) {
    const r = [],
      i = t.toLowerCase();
    for (const [h, m] of this.explanations)
      (h.includes(i) ||
        m.explanation.toLowerCase().includes(i) ||
        m.category.toLowerCase().includes(i)) &&
        r.push({ command: h, ...m });
    return r.sort((h, m) => h.command.localeCompare(m.command));
  }
  getCommandsByDifficulty(t) {
    const r = [];
    for (const [i, h] of this.explanations)
      h.difficulty === t && r.push({ command: i, ...h });
    return r;
  }
  getCommandsByCategory(t) {
    const r = [];
    for (const [i, h] of this.explanations)
      h.category === t && r.push({ command: i, ...h });
    return r;
  }
}
var Bh = { exports: {} };
(function (e, t) {
  (function (r, i) {
    e.exports = i();
  })(globalThis, () =>
    (() => {
      var r = {
          4567: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (s, o, _, C) {
                  var b,
                    x = arguments.length,
                    S =
                      x < 3
                        ? o
                        : C === null
                          ? (C = Object.getOwnPropertyDescriptor(o, _))
                          : C;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    S = Reflect.decorate(s, o, _, C);
                  else
                    for (var k = s.length - 1; k >= 0; k--)
                      (b = s[k]) &&
                        (S =
                          (x < 3 ? b(S) : x > 3 ? b(o, _, S) : b(o, _)) || S);
                  return (x > 3 && S && Object.defineProperty(o, _, S), S);
                },
              g =
                (this && this.__param) ||
                function (s, o) {
                  return function (_, C) {
                    o(_, C, s);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.AccessibilityManager = void 0));
            const u = l(9042),
              d = l(9924),
              v = l(844),
              w = l(4725),
              p = l(2585),
              c = l(3656);
            let n = (a.AccessibilityManager = class extends v.Disposable {
              constructor(s, o, _, C) {
                (super(),
                (this._terminal = s),
                (this._coreBrowserService = _),
                (this._renderService = C),
                (this._rowColumns = new WeakMap()),
                (this._liveRegionLineCount = 0),
                (this._charsToConsume = []),
                (this._charsToAnnounce = ''),
                (this._accessibilityContainer =
                    this._coreBrowserService.mainDocument.createElement('div')),
                this._accessibilityContainer.classList.add(
                  'xterm-accessibility'
                ),
                (this._rowContainer =
                    this._coreBrowserService.mainDocument.createElement('div')),
                this._rowContainer.setAttribute('role', 'list'),
                this._rowContainer.classList.add('xterm-accessibility-tree'),
                (this._rowElements = []));
                for (let b = 0; b < this._terminal.rows; b++)
                  ((this._rowElements[b] = this._createAccessibilityTreeNode()),
                  this._rowContainer.appendChild(this._rowElements[b]));
                if (
                  ((this._topBoundaryFocusListener = (b) =>
                    this._handleBoundaryFocus(b, 0)),
                  (this._bottomBoundaryFocusListener = (b) =>
                    this._handleBoundaryFocus(b, 1)),
                  this._rowElements[0].addEventListener(
                    'focus',
                    this._topBoundaryFocusListener
                  ),
                  this._rowElements[
                    this._rowElements.length - 1
                  ].addEventListener(
                    'focus',
                    this._bottomBoundaryFocusListener
                  ),
                  this._refreshRowsDimensions(),
                  this._accessibilityContainer.appendChild(this._rowContainer),
                  (this._liveRegion =
                    this._coreBrowserService.mainDocument.createElement('div')),
                  this._liveRegion.classList.add('live-region'),
                  this._liveRegion.setAttribute('aria-live', 'assertive'),
                  this._accessibilityContainer.appendChild(this._liveRegion),
                  (this._liveRegionDebouncer = this.register(
                    new d.TimeBasedDebouncer(this._renderRows.bind(this))
                  )),
                  !this._terminal.element)
                )
                  throw new Error(
                    'Cannot enable accessibility before Terminal.open'
                  );
                (this._terminal.element.insertAdjacentElement(
                  'afterbegin',
                  this._accessibilityContainer
                ),
                this.register(
                  this._terminal.onResize((b) => this._handleResize(b.rows))
                ),
                this.register(
                  this._terminal.onRender((b) =>
                    this._refreshRows(b.start, b.end)
                  )
                ),
                this.register(
                  this._terminal.onScroll(() => this._refreshRows())
                ),
                this.register(
                  this._terminal.onA11yChar((b) => this._handleChar(b))
                ),
                this.register(
                  this._terminal.onLineFeed(() =>
                    this._handleChar(`
`)
                  )
                ),
                this.register(
                  this._terminal.onA11yTab((b) => this._handleTab(b))
                ),
                this.register(
                  this._terminal.onKey((b) => this._handleKey(b.key))
                ),
                this.register(
                  this._terminal.onBlur(() => this._clearLiveRegion())
                ),
                this.register(
                  this._renderService.onDimensionsChange(() =>
                    this._refreshRowsDimensions()
                  )
                ),
                this.register(
                  (0, c.addDisposableDomListener)(
                    document,
                    'selectionchange',
                    () => this._handleSelectionChange()
                  )
                ),
                this.register(
                  this._coreBrowserService.onDprChange(() =>
                    this._refreshRowsDimensions()
                  )
                ),
                this._refreshRows(),
                this.register(
                  (0, v.toDisposable)(() => {
                    (this._accessibilityContainer.remove(),
                    (this._rowElements.length = 0));
                  })
                ));
              }
              _handleTab(s) {
                for (let o = 0; o < s; o++) this._handleChar(' ');
              }
              _handleChar(s) {
                this._liveRegionLineCount < 21 &&
                  (this._charsToConsume.length > 0
                    ? this._charsToConsume.shift() !== s &&
                      (this._charsToAnnounce += s)
                    : (this._charsToAnnounce += s),
                  s ===
                    `
` &&
                    (this._liveRegionLineCount++,
                    this._liveRegionLineCount === 21 &&
                      (this._liveRegion.textContent += u.tooMuchOutput)));
              }
              _clearLiveRegion() {
                ((this._liveRegion.textContent = ''),
                (this._liveRegionLineCount = 0));
              }
              _handleKey(s) {
                (this._clearLiveRegion(),
                new RegExp('\\p{Control}', 'u').test(s) ||
                    this._charsToConsume.push(s));
              }
              _refreshRows(s, o) {
                this._liveRegionDebouncer.refresh(s, o, this._terminal.rows);
              }
              _renderRows(s, o) {
                const _ = this._terminal.buffer,
                  C = _.lines.length.toString();
                for (let b = s; b <= o; b++) {
                  const x = _.lines.get(_.ydisp + b),
                    S = [],
                    k =
                      (x == null
                        ? void 0
                        : x.translateToString(!0, void 0, void 0, S)) || '',
                    T = (_.ydisp + b + 1).toString(),
                    B = this._rowElements[b];
                  B &&
                    (k.length === 0
                      ? ((B.innerText = ' '), this._rowColumns.set(B, [0, 1]))
                      : ((B.textContent = k), this._rowColumns.set(B, S)),
                    B.setAttribute('aria-posinset', T),
                    B.setAttribute('aria-setsize', C));
                }
                this._announceCharacters();
              }
              _announceCharacters() {
                this._charsToAnnounce.length !== 0 &&
                  ((this._liveRegion.textContent += this._charsToAnnounce),
                  (this._charsToAnnounce = ''));
              }
              _handleBoundaryFocus(s, o) {
                const _ = s.target,
                  C =
                    this._rowElements[
                      o === 0 ? 1 : this._rowElements.length - 2
                    ];
                if (
                  _.getAttribute('aria-posinset') ===
                    (o === 0 ? '1' : `${this._terminal.buffer.lines.length}`) ||
                  s.relatedTarget !== C
                )
                  return;
                let b, x;
                if (
                  (o === 0
                    ? ((b = _),
                    (x = this._rowElements.pop()),
                    this._rowContainer.removeChild(x))
                    : ((b = this._rowElements.shift()),
                    (x = _),
                    this._rowContainer.removeChild(b)),
                  b.removeEventListener(
                    'focus',
                    this._topBoundaryFocusListener
                  ),
                  x.removeEventListener(
                    'focus',
                    this._bottomBoundaryFocusListener
                  ),
                  o === 0)
                ) {
                  const S = this._createAccessibilityTreeNode();
                  (this._rowElements.unshift(S),
                  this._rowContainer.insertAdjacentElement('afterbegin', S));
                } else {
                  const S = this._createAccessibilityTreeNode();
                  (this._rowElements.push(S),
                  this._rowContainer.appendChild(S));
                }
                (this._rowElements[0].addEventListener(
                  'focus',
                  this._topBoundaryFocusListener
                ),
                this._rowElements[
                  this._rowElements.length - 1
                ].addEventListener(
                  'focus',
                  this._bottomBoundaryFocusListener
                ),
                this._terminal.scrollLines(o === 0 ? -1 : 1),
                this._rowElements[
                  o === 0 ? 1 : this._rowElements.length - 2
                ].focus(),
                s.preventDefault(),
                s.stopImmediatePropagation());
              }
              _handleSelectionChange() {
                var k;
                if (this._rowElements.length === 0) return;
                const s = document.getSelection();
                if (!s) return;
                if (s.isCollapsed)
                  return void (
                    this._rowContainer.contains(s.anchorNode) &&
                    this._terminal.clearSelection()
                  );
                if (!s.anchorNode || !s.focusNode)
                  return void console.error(
                    'anchorNode and/or focusNode are null'
                  );
                let o = { node: s.anchorNode, offset: s.anchorOffset },
                  _ = { node: s.focusNode, offset: s.focusOffset };
                if (
                  ((o.node.compareDocumentPosition(_.node) &
                    Node.DOCUMENT_POSITION_PRECEDING ||
                    (o.node === _.node && o.offset > _.offset)) &&
                    ([o, _] = [_, o]),
                  o.node.compareDocumentPosition(this._rowElements[0]) &
                    (Node.DOCUMENT_POSITION_CONTAINED_BY |
                      Node.DOCUMENT_POSITION_FOLLOWING) &&
                    (o = {
                      node: this._rowElements[0].childNodes[0],
                      offset: 0,
                    }),
                  !this._rowContainer.contains(o.node))
                )
                  return;
                const C = this._rowElements.slice(-1)[0];
                if (
                  (_.node.compareDocumentPosition(C) &
                    (Node.DOCUMENT_POSITION_CONTAINED_BY |
                      Node.DOCUMENT_POSITION_PRECEDING) &&
                    (_ = {
                      node: C,
                      offset:
                        ((k = C.textContent) == null ? void 0 : k.length) ?? 0,
                    }),
                  !this._rowContainer.contains(_.node))
                )
                  return;
                const b = ({ node: T, offset: B }) => {
                    const O = T instanceof Text ? T.parentNode : T;
                    let A =
                      parseInt(
                        O == null ? void 0 : O.getAttribute('aria-posinset'),
                        10
                      ) - 1;
                    if (isNaN(A))
                      return (
                        console.warn('row is invalid. Race condition?'),
                        null
                      );
                    const H = this._rowColumns.get(O);
                    if (!H)
                      return (
                        console.warn('columns is null. Race condition?'),
                        null
                      );
                    let W = B < H.length ? H[B] : H.slice(-1)[0] + 1;
                    return (
                      W >= this._terminal.cols && (++A, (W = 0)),
                      { row: A, column: W }
                    );
                  },
                  x = b(o),
                  S = b(_);
                if (x && S) {
                  if (
                    x.row > S.row ||
                    (x.row === S.row && x.column >= S.column)
                  )
                    throw new Error('invalid range');
                  this._terminal.select(
                    x.column,
                    x.row,
                    (S.row - x.row) * this._terminal.cols - x.column + S.column
                  );
                }
              }
              _handleResize(s) {
                this._rowElements[
                  this._rowElements.length - 1
                ].removeEventListener(
                  'focus',
                  this._bottomBoundaryFocusListener
                );
                for (
                  let o = this._rowContainer.children.length;
                  o < this._terminal.rows;
                  o++
                )
                  ((this._rowElements[o] = this._createAccessibilityTreeNode()),
                  this._rowContainer.appendChild(this._rowElements[o]));
                for (; this._rowElements.length > s; )
                  this._rowContainer.removeChild(this._rowElements.pop());
                (this._rowElements[
                  this._rowElements.length - 1
                ].addEventListener('focus', this._bottomBoundaryFocusListener),
                this._refreshRowsDimensions());
              }
              _createAccessibilityTreeNode() {
                const s =
                  this._coreBrowserService.mainDocument.createElement('div');
                return (
                  s.setAttribute('role', 'listitem'),
                  (s.tabIndex = -1),
                  this._refreshRowDimensions(s),
                  s
                );
              }
              _refreshRowsDimensions() {
                if (this._renderService.dimensions.css.cell.height) {
                  ((this._accessibilityContainer.style.width = `${this._renderService.dimensions.css.canvas.width}px`),
                  this._rowElements.length !== this._terminal.rows &&
                      this._handleResize(this._terminal.rows));
                  for (let s = 0; s < this._terminal.rows; s++)
                    this._refreshRowDimensions(this._rowElements[s]);
                }
              }
              _refreshRowDimensions(s) {
                s.style.height = `${this._renderService.dimensions.css.cell.height}px`;
              }
            });
            a.AccessibilityManager = n = f(
              [
                g(1, p.IInstantiationService),
                g(2, w.ICoreBrowserService),
                g(3, w.IRenderService),
              ],
              n
            );
          },
          3614: (y, a) => {
            function l(d) {
              return d.replace(/\r?\n/g, '\r');
            }
            function f(d, v) {
              return v ? '\x1B[200~' + d + '\x1B[201~' : d;
            }
            function g(d, v, w, p) {
              ((d = f(
                (d = l(d)),
                w.decPrivateModes.bracketedPasteMode &&
                  p.rawOptions.ignoreBracketedPasteMode !== !0
              )),
              w.triggerDataEvent(d, !0),
              (v.value = ''));
            }
            function u(d, v, w) {
              const p = w.getBoundingClientRect(),
                c = d.clientX - p.left - 10,
                n = d.clientY - p.top - 10;
              ((v.style.width = '20px'),
              (v.style.height = '20px'),
              (v.style.left = `${c}px`),
              (v.style.top = `${n}px`),
              (v.style.zIndex = '1000'),
              v.focus());
            }
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.rightClickHandler =
                a.moveTextAreaUnderMouseCursor =
                a.paste =
                a.handlePasteEvent =
                a.copyHandler =
                a.bracketTextForPaste =
                a.prepareTextForTerminal =
                  void 0),
            (a.prepareTextForTerminal = l),
            (a.bracketTextForPaste = f),
            (a.copyHandler = function (d, v) {
              (d.clipboardData &&
                  d.clipboardData.setData('text/plain', v.selectionText),
              d.preventDefault());
            }),
            (a.handlePasteEvent = function (d, v, w, p) {
              (d.stopPropagation(),
              d.clipboardData &&
                    g(d.clipboardData.getData('text/plain'), v, w, p));
            }),
            (a.paste = g),
            (a.moveTextAreaUnderMouseCursor = u),
            (a.rightClickHandler = function (d, v, w, p, c) {
              (u(d, v, w),
              c && p.rightClickSelect(d),
              (v.value = p.selectionText),
              v.select());
            }));
          },
          7239: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.ColorContrastCache = void 0));
            const f = l(1505);
            a.ColorContrastCache = class {
              constructor() {
                ((this._color = new f.TwoKeyMap()),
                (this._css = new f.TwoKeyMap()));
              }
              setCss(g, u, d) {
                this._css.set(g, u, d);
              }
              getCss(g, u) {
                return this._css.get(g, u);
              }
              setColor(g, u, d) {
                this._color.set(g, u, d);
              }
              getColor(g, u) {
                return this._color.get(g, u);
              }
              clear() {
                (this._color.clear(), this._css.clear());
              }
            };
          },
          3656: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.addDisposableDomListener = void 0),
            (a.addDisposableDomListener = function (l, f, g, u) {
              l.addEventListener(f, g, u);
              let d = !1;
              return {
                dispose: () => {
                  d || ((d = !0), l.removeEventListener(f, g, u));
                },
              };
            }));
          },
          3551: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (n, s, o, _) {
                  var C,
                    b = arguments.length,
                    x =
                      b < 3
                        ? s
                        : _ === null
                          ? (_ = Object.getOwnPropertyDescriptor(s, o))
                          : _;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    x = Reflect.decorate(n, s, o, _);
                  else
                    for (var S = n.length - 1; S >= 0; S--)
                      (C = n[S]) &&
                        (x =
                          (b < 3 ? C(x) : b > 3 ? C(s, o, x) : C(s, o)) || x);
                  return (b > 3 && x && Object.defineProperty(s, o, x), x);
                },
              g =
                (this && this.__param) ||
                function (n, s) {
                  return function (o, _) {
                    s(o, _, n);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.Linkifier = void 0));
            const u = l(3656),
              d = l(8460),
              v = l(844),
              w = l(2585),
              p = l(4725);
            let c = (a.Linkifier = class extends v.Disposable {
              get currentLink() {
                return this._currentLink;
              }
              constructor(n, s, o, _, C) {
                (super(),
                (this._element = n),
                (this._mouseService = s),
                (this._renderService = o),
                (this._bufferService = _),
                (this._linkProviderService = C),
                (this._linkCacheDisposables = []),
                (this._isMouseOut = !0),
                (this._wasResized = !1),
                (this._activeLine = -1),
                (this._onShowLinkUnderline = this.register(
                  new d.EventEmitter()
                )),
                (this.onShowLinkUnderline = this._onShowLinkUnderline.event),
                (this._onHideLinkUnderline = this.register(
                  new d.EventEmitter()
                )),
                (this.onHideLinkUnderline = this._onHideLinkUnderline.event),
                this.register(
                  (0, v.getDisposeArrayDisposable)(this._linkCacheDisposables)
                ),
                this.register(
                  (0, v.toDisposable)(() => {
                    var b;
                    ((this._lastMouseEvent = void 0),
                    (b = this._activeProviderReplies) == null || b.clear());
                  })
                ),
                this.register(
                  this._bufferService.onResize(() => {
                    (this._clearCurrentLink(), (this._wasResized = !0));
                  })
                ),
                this.register(
                  (0, u.addDisposableDomListener)(
                    this._element,
                    'mouseleave',
                    () => {
                      ((this._isMouseOut = !0), this._clearCurrentLink());
                    }
                  )
                ),
                this.register(
                  (0, u.addDisposableDomListener)(
                    this._element,
                    'mousemove',
                    this._handleMouseMove.bind(this)
                  )
                ),
                this.register(
                  (0, u.addDisposableDomListener)(
                    this._element,
                    'mousedown',
                    this._handleMouseDown.bind(this)
                  )
                ),
                this.register(
                  (0, u.addDisposableDomListener)(
                    this._element,
                    'mouseup',
                    this._handleMouseUp.bind(this)
                  )
                ));
              }
              _handleMouseMove(n) {
                this._lastMouseEvent = n;
                const s = this._positionFromMouseEvent(
                  n,
                  this._element,
                  this._mouseService
                );
                if (!s) return;
                this._isMouseOut = !1;
                const o = n.composedPath();
                for (let _ = 0; _ < o.length; _++) {
                  const C = o[_];
                  if (C.classList.contains('xterm')) break;
                  if (C.classList.contains('xterm-hover')) return;
                }
                (this._lastBufferCell &&
                  s.x === this._lastBufferCell.x &&
                  s.y === this._lastBufferCell.y) ||
                  (this._handleHover(s), (this._lastBufferCell = s));
              }
              _handleHover(n) {
                if (this._activeLine !== n.y || this._wasResized)
                  return (
                    this._clearCurrentLink(),
                    this._askForLink(n, !1),
                    void (this._wasResized = !1)
                  );
                (this._currentLink &&
                  this._linkAtPosition(this._currentLink.link, n)) ||
                  (this._clearCurrentLink(), this._askForLink(n, !0));
              }
              _askForLink(n, s) {
                var _, C;
                (this._activeProviderReplies && s) ||
                  ((_ = this._activeProviderReplies) == null ||
                    _.forEach((b) => {
                      b == null ||
                        b.forEach((x) => {
                          x.link.dispose && x.link.dispose();
                        });
                    }),
                  (this._activeProviderReplies = new Map()),
                  (this._activeLine = n.y));
                let o = !1;
                for (const [
                  b,
                  x,
                ] of this._linkProviderService.linkProviders.entries())
                  s
                    ? (C = this._activeProviderReplies) != null &&
                      C.get(b) &&
                      (o = this._checkLinkProviderResult(b, n, o))
                    : x.provideLinks(n.y, (S) => {
                      var T, B;
                      if (this._isMouseOut) return;
                      const k =
                          S == null ? void 0 : S.map((O) => ({ link: O }));
                      ((T = this._activeProviderReplies) == null ||
                          T.set(b, k),
                      (o = this._checkLinkProviderResult(b, n, o)),
                      ((B = this._activeProviderReplies) == null
                        ? void 0
                        : B.size) ===
                            this._linkProviderService.linkProviders.length &&
                            this._removeIntersectingLinks(
                              n.y,
                              this._activeProviderReplies
                            ));
                    });
              }
              _removeIntersectingLinks(n, s) {
                const o = new Set();
                for (let _ = 0; _ < s.size; _++) {
                  const C = s.get(_);
                  if (C)
                    for (let b = 0; b < C.length; b++) {
                      const x = C[b],
                        S = x.link.range.start.y < n ? 0 : x.link.range.start.x,
                        k =
                          x.link.range.end.y > n
                            ? this._bufferService.cols
                            : x.link.range.end.x;
                      for (let T = S; T <= k; T++) {
                        if (o.has(T)) {
                          C.splice(b--, 1);
                          break;
                        }
                        o.add(T);
                      }
                    }
                }
              }
              _checkLinkProviderResult(n, s, o) {
                var b;
                if (!this._activeProviderReplies) return o;
                const _ = this._activeProviderReplies.get(n);
                let C = !1;
                for (let x = 0; x < n; x++)
                  (this._activeProviderReplies.has(x) &&
                    !this._activeProviderReplies.get(x)) ||
                    (C = !0);
                if (!C && _) {
                  const x = _.find((S) => this._linkAtPosition(S.link, s));
                  x && ((o = !0), this._handleNewLink(x));
                }
                if (
                  this._activeProviderReplies.size ===
                    this._linkProviderService.linkProviders.length &&
                  !o
                )
                  for (let x = 0; x < this._activeProviderReplies.size; x++) {
                    const S =
                      (b = this._activeProviderReplies.get(x)) == null
                        ? void 0
                        : b.find((k) => this._linkAtPosition(k.link, s));
                    if (S) {
                      ((o = !0), this._handleNewLink(S));
                      break;
                    }
                  }
                return o;
              }
              _handleMouseDown() {
                this._mouseDownLink = this._currentLink;
              }
              _handleMouseUp(n) {
                if (!this._currentLink) return;
                const s = this._positionFromMouseEvent(
                  n,
                  this._element,
                  this._mouseService
                );
                s &&
                  this._mouseDownLink === this._currentLink &&
                  this._linkAtPosition(this._currentLink.link, s) &&
                  this._currentLink.link.activate(
                    n,
                    this._currentLink.link.text
                  );
              }
              _clearCurrentLink(n, s) {
                this._currentLink &&
                  this._lastMouseEvent &&
                  (!n ||
                    !s ||
                    (this._currentLink.link.range.start.y >= n &&
                      this._currentLink.link.range.end.y <= s)) &&
                  (this._linkLeave(
                    this._element,
                    this._currentLink.link,
                    this._lastMouseEvent
                  ),
                  (this._currentLink = void 0),
                  (0, v.disposeArray)(this._linkCacheDisposables));
              }
              _handleNewLink(n) {
                if (!this._lastMouseEvent) return;
                const s = this._positionFromMouseEvent(
                  this._lastMouseEvent,
                  this._element,
                  this._mouseService
                );
                s &&
                  this._linkAtPosition(n.link, s) &&
                  ((this._currentLink = n),
                  (this._currentLink.state = {
                    decorations: {
                      underline:
                        n.link.decorations === void 0 ||
                        n.link.decorations.underline,
                      pointerCursor:
                        n.link.decorations === void 0 ||
                        n.link.decorations.pointerCursor,
                    },
                    isHovered: !0,
                  }),
                  this._linkHover(this._element, n.link, this._lastMouseEvent),
                  (n.link.decorations = {}),
                  Object.defineProperties(n.link.decorations, {
                    pointerCursor: {
                      get: () => {
                        var o, _;
                        return (_ =
                          (o = this._currentLink) == null ? void 0 : o.state) ==
                          null
                          ? void 0
                          : _.decorations.pointerCursor;
                      },
                      set: (o) => {
                        var _;
                        (_ = this._currentLink) != null &&
                          _.state &&
                          this._currentLink.state.decorations.pointerCursor !==
                            o &&
                          ((this._currentLink.state.decorations.pointerCursor =
                            o),
                          this._currentLink.state.isHovered &&
                            this._element.classList.toggle(
                              'xterm-cursor-pointer',
                              o
                            ));
                      },
                    },
                    underline: {
                      get: () => {
                        var o, _;
                        return (_ =
                          (o = this._currentLink) == null ? void 0 : o.state) ==
                          null
                          ? void 0
                          : _.decorations.underline;
                      },
                      set: (o) => {
                        var _, C, b;
                        (_ = this._currentLink) != null &&
                          _.state &&
                          ((b =
                            (C = this._currentLink) == null
                              ? void 0
                              : C.state) == null
                            ? void 0
                            : b.decorations.underline) !== o &&
                          ((this._currentLink.state.decorations.underline = o),
                          this._currentLink.state.isHovered &&
                            this._fireUnderlineEvent(n.link, o));
                      },
                    },
                  }),
                  this._linkCacheDisposables.push(
                    this._renderService.onRenderedViewportChange((o) => {
                      if (!this._currentLink) return;
                      const _ =
                          o.start === 0
                            ? 0
                            : o.start + 1 + this._bufferService.buffer.ydisp,
                        C = this._bufferService.buffer.ydisp + 1 + o.end;
                      if (
                        this._currentLink.link.range.start.y >= _ &&
                        this._currentLink.link.range.end.y <= C &&
                        (this._clearCurrentLink(_, C), this._lastMouseEvent)
                      ) {
                        const b = this._positionFromMouseEvent(
                          this._lastMouseEvent,
                          this._element,
                          this._mouseService
                        );
                        b && this._askForLink(b, !1);
                      }
                    })
                  ));
              }
              _linkHover(n, s, o) {
                var _;
                ((_ = this._currentLink) != null &&
                  _.state &&
                  ((this._currentLink.state.isHovered = !0),
                  this._currentLink.state.decorations.underline &&
                    this._fireUnderlineEvent(s, !0),
                  this._currentLink.state.decorations.pointerCursor &&
                    n.classList.add('xterm-cursor-pointer')),
                s.hover && s.hover(o, s.text));
              }
              _fireUnderlineEvent(n, s) {
                const o = n.range,
                  _ = this._bufferService.buffer.ydisp,
                  C = this._createLinkUnderlineEvent(
                    o.start.x - 1,
                    o.start.y - _ - 1,
                    o.end.x,
                    o.end.y - _ - 1,
                    void 0
                  );
                (s
                  ? this._onShowLinkUnderline
                  : this._onHideLinkUnderline
                ).fire(C);
              }
              _linkLeave(n, s, o) {
                var _;
                ((_ = this._currentLink) != null &&
                  _.state &&
                  ((this._currentLink.state.isHovered = !1),
                  this._currentLink.state.decorations.underline &&
                    this._fireUnderlineEvent(s, !1),
                  this._currentLink.state.decorations.pointerCursor &&
                    n.classList.remove('xterm-cursor-pointer')),
                s.leave && s.leave(o, s.text));
              }
              _linkAtPosition(n, s) {
                const o =
                    n.range.start.y * this._bufferService.cols +
                    n.range.start.x,
                  _ = n.range.end.y * this._bufferService.cols + n.range.end.x,
                  C = s.y * this._bufferService.cols + s.x;
                return o <= C && C <= _;
              }
              _positionFromMouseEvent(n, s, o) {
                const _ = o.getCoords(
                  n,
                  s,
                  this._bufferService.cols,
                  this._bufferService.rows
                );
                if (_)
                  return {
                    x: _[0],
                    y: _[1] + this._bufferService.buffer.ydisp,
                  };
              }
              _createLinkUnderlineEvent(n, s, o, _, C) {
                return {
                  x1: n,
                  y1: s,
                  x2: o,
                  y2: _,
                  cols: this._bufferService.cols,
                  fg: C,
                };
              }
            });
            a.Linkifier = c = f(
              [
                g(1, p.IMouseService),
                g(2, p.IRenderService),
                g(3, w.IBufferService),
                g(4, p.ILinkProviderService),
              ],
              c
            );
          },
          9042: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.tooMuchOutput = a.promptLabel = void 0),
            (a.promptLabel = 'Terminal input'),
            (a.tooMuchOutput =
                'Too much output to announce, navigate to rows manually to read'));
          },
          3730: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (p, c, n, s) {
                  var o,
                    _ = arguments.length,
                    C =
                      _ < 3
                        ? c
                        : s === null
                          ? (s = Object.getOwnPropertyDescriptor(c, n))
                          : s;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    C = Reflect.decorate(p, c, n, s);
                  else
                    for (var b = p.length - 1; b >= 0; b--)
                      (o = p[b]) &&
                        (C =
                          (_ < 3 ? o(C) : _ > 3 ? o(c, n, C) : o(c, n)) || C);
                  return (_ > 3 && C && Object.defineProperty(c, n, C), C);
                },
              g =
                (this && this.__param) ||
                function (p, c) {
                  return function (n, s) {
                    c(n, s, p);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.OscLinkProvider = void 0));
            const u = l(511),
              d = l(2585);
            let v = (a.OscLinkProvider = class {
              constructor(p, c, n) {
                ((this._bufferService = p),
                (this._optionsService = c),
                (this._oscLinkService = n));
              }
              provideLinks(p, c) {
                var k;
                const n = this._bufferService.buffer.lines.get(p - 1);
                if (!n) return void c(void 0);
                const s = [],
                  o = this._optionsService.rawOptions.linkHandler,
                  _ = new u.CellData(),
                  C = n.getTrimmedLength();
                let b = -1,
                  x = -1,
                  S = !1;
                for (let T = 0; T < C; T++)
                  if (x !== -1 || n.hasContent(T)) {
                    if (
                      (n.loadCell(T, _),
                      _.hasExtendedAttrs() && _.extended.urlId)
                    ) {
                      if (x === -1) {
                        ((x = T), (b = _.extended.urlId));
                        continue;
                      }
                      S = _.extended.urlId !== b;
                    } else x !== -1 && (S = !0);
                    if (S || (x !== -1 && T === C - 1)) {
                      const B =
                        (k = this._oscLinkService.getLinkData(b)) == null
                          ? void 0
                          : k.uri;
                      if (B) {
                        const O = {
                          start: { x: x + 1, y: p },
                          end: { x: T + (S || T !== C - 1 ? 0 : 1), y: p },
                        };
                        let A = !1;
                        if (!(o != null && o.allowNonHttpProtocols))
                          try {
                            const H = new URL(B);
                            ['http:', 'https:'].includes(H.protocol) ||
                              (A = !0);
                          } catch {
                            A = !0;
                          }
                        A ||
                          s.push({
                            text: B,
                            range: O,
                            activate: (H, W) =>
                              o ? o.activate(H, W, O) : w(0, W),
                            hover: (H, W) => {
                              var $;
                              return ($ = o == null ? void 0 : o.hover) == null
                                ? void 0
                                : $.call(o, H, W, O);
                            },
                            leave: (H, W) => {
                              var $;
                              return ($ = o == null ? void 0 : o.leave) == null
                                ? void 0
                                : $.call(o, H, W, O);
                            },
                          });
                      }
                      ((S = !1),
                      _.hasExtendedAttrs() && _.extended.urlId
                        ? ((x = T), (b = _.extended.urlId))
                        : ((x = -1), (b = -1)));
                    }
                  }
                c(s);
              }
            });
            function w(p, c) {
              if (
                confirm(`Do you want to navigate to ${c}?

WARNING: This link could potentially be dangerous`)
              ) {
                const n = window.open();
                if (n) {
                  try {
                    n.opener = null;
                  } catch {}
                  n.location.href = c;
                } else
                  console.warn(
                    'Opening link blocked as opener could not be cleared'
                  );
              }
            }
            a.OscLinkProvider = v = f(
              [
                g(0, d.IBufferService),
                g(1, d.IOptionsService),
                g(2, d.IOscLinkService),
              ],
              v
            );
          },
          6193: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.RenderDebouncer = void 0),
            (a.RenderDebouncer = class {
              constructor(l, f) {
                ((this._renderCallback = l),
                (this._coreBrowserService = f),
                (this._refreshCallbacks = []));
              }
              dispose() {
                this._animationFrame &&
                    (this._coreBrowserService.window.cancelAnimationFrame(
                      this._animationFrame
                    ),
                    (this._animationFrame = void 0));
              }
              addRefreshCallback(l) {
                return (
                  this._refreshCallbacks.push(l),
                  this._animationFrame ||
                      (this._animationFrame =
                        this._coreBrowserService.window.requestAnimationFrame(
                          () => this._innerRefresh()
                        )),
                  this._animationFrame
                );
              }
              refresh(l, f, g) {
                ((this._rowCount = g),
                (l = l !== void 0 ? l : 0),
                (f = f !== void 0 ? f : this._rowCount - 1),
                (this._rowStart =
                      this._rowStart !== void 0
                        ? Math.min(this._rowStart, l)
                        : l),
                (this._rowEnd =
                      this._rowEnd !== void 0 ? Math.max(this._rowEnd, f) : f),
                this._animationFrame ||
                      (this._animationFrame =
                        this._coreBrowserService.window.requestAnimationFrame(
                          () => this._innerRefresh()
                        )));
              }
              _innerRefresh() {
                if (
                  ((this._animationFrame = void 0),
                  this._rowStart === void 0 ||
                      this._rowEnd === void 0 ||
                      this._rowCount === void 0)
                )
                  return void this._runRefreshCallbacks();
                const l = Math.max(this._rowStart, 0),
                  f = Math.min(this._rowEnd, this._rowCount - 1);
                ((this._rowStart = void 0),
                (this._rowEnd = void 0),
                this._renderCallback(l, f),
                this._runRefreshCallbacks());
              }
              _runRefreshCallbacks() {
                for (const l of this._refreshCallbacks) l(0);
                this._refreshCallbacks = [];
              }
            }));
          },
          3236: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.Terminal = void 0));
            const f = l(3614),
              g = l(3656),
              u = l(3551),
              d = l(9042),
              v = l(3730),
              w = l(1680),
              p = l(3107),
              c = l(5744),
              n = l(2950),
              s = l(1296),
              o = l(428),
              _ = l(4269),
              C = l(5114),
              b = l(8934),
              x = l(3230),
              S = l(9312),
              k = l(4725),
              T = l(6731),
              B = l(8055),
              O = l(8969),
              A = l(8460),
              H = l(844),
              W = l(6114),
              $ = l(8437),
              G = l(2584),
              I = l(7399),
              E = l(5941),
              R = l(9074),
              D = l(2585),
              P = l(5435),
              F = l(4567),
              U = l(779);
            class Y extends O.CoreTerminal {
              get onFocus() {
                return this._onFocus.event;
              }
              get onBlur() {
                return this._onBlur.event;
              }
              get onA11yChar() {
                return this._onA11yCharEmitter.event;
              }
              get onA11yTab() {
                return this._onA11yTabEmitter.event;
              }
              get onWillOpen() {
                return this._onWillOpen.event;
              }
              constructor(M = {}) {
                (super(M),
                (this.browser = W),
                (this._keyDownHandled = !1),
                (this._keyDownSeen = !1),
                (this._keyPressHandled = !1),
                (this._unprocessedDeadKey = !1),
                (this._accessibilityManager = this.register(
                  new H.MutableDisposable()
                )),
                (this._onCursorMove = this.register(new A.EventEmitter())),
                (this.onCursorMove = this._onCursorMove.event),
                (this._onKey = this.register(new A.EventEmitter())),
                (this.onKey = this._onKey.event),
                (this._onRender = this.register(new A.EventEmitter())),
                (this.onRender = this._onRender.event),
                (this._onSelectionChange = this.register(
                  new A.EventEmitter()
                )),
                (this.onSelectionChange = this._onSelectionChange.event),
                (this._onTitleChange = this.register(new A.EventEmitter())),
                (this.onTitleChange = this._onTitleChange.event),
                (this._onBell = this.register(new A.EventEmitter())),
                (this.onBell = this._onBell.event),
                (this._onFocus = this.register(new A.EventEmitter())),
                (this._onBlur = this.register(new A.EventEmitter())),
                (this._onA11yCharEmitter = this.register(
                  new A.EventEmitter()
                )),
                (this._onA11yTabEmitter = this.register(
                  new A.EventEmitter()
                )),
                (this._onWillOpen = this.register(new A.EventEmitter())),
                this._setup(),
                (this._decorationService =
                    this._instantiationService.createInstance(
                      R.DecorationService
                    )),
                this._instantiationService.setService(
                  D.IDecorationService,
                  this._decorationService
                ),
                (this._linkProviderService =
                    this._instantiationService.createInstance(
                      U.LinkProviderService
                    )),
                this._instantiationService.setService(
                  k.ILinkProviderService,
                  this._linkProviderService
                ),
                this._linkProviderService.registerLinkProvider(
                  this._instantiationService.createInstance(v.OscLinkProvider)
                ),
                this.register(
                  this._inputHandler.onRequestBell(() => this._onBell.fire())
                ),
                this.register(
                  this._inputHandler.onRequestRefreshRows((L, j) =>
                    this.refresh(L, j)
                  )
                ),
                this.register(
                  this._inputHandler.onRequestSendFocus(() =>
                    this._reportFocus()
                  )
                ),
                this.register(
                  this._inputHandler.onRequestReset(() => this.reset())
                ),
                this.register(
                  this._inputHandler.onRequestWindowsOptionsReport((L) =>
                    this._reportWindowsOptions(L)
                  )
                ),
                this.register(
                  this._inputHandler.onColor((L) => this._handleColorEvent(L))
                ),
                this.register(
                  (0, A.forwardEvent)(
                    this._inputHandler.onCursorMove,
                    this._onCursorMove
                  )
                ),
                this.register(
                  (0, A.forwardEvent)(
                    this._inputHandler.onTitleChange,
                    this._onTitleChange
                  )
                ),
                this.register(
                  (0, A.forwardEvent)(
                    this._inputHandler.onA11yChar,
                    this._onA11yCharEmitter
                  )
                ),
                this.register(
                  (0, A.forwardEvent)(
                    this._inputHandler.onA11yTab,
                    this._onA11yTabEmitter
                  )
                ),
                this.register(
                  this._bufferService.onResize((L) =>
                    this._afterResize(L.cols, L.rows)
                  )
                ),
                this.register(
                  (0, H.toDisposable)(() => {
                    var L, j;
                    ((this._customKeyEventHandler = void 0),
                    (j =
                          (L = this.element) == null ? void 0 : L.parentNode) ==
                          null || j.removeChild(this.element));
                  })
                ));
              }
              _handleColorEvent(M) {
                if (this._themeService)
                  for (const L of M) {
                    let j,
                      N = '';
                    switch (L.index) {
                    case 256:
                      ((j = 'foreground'), (N = '10'));
                      break;
                    case 257:
                      ((j = 'background'), (N = '11'));
                      break;
                    case 258:
                      ((j = 'cursor'), (N = '12'));
                      break;
                    default:
                      ((j = 'ansi'), (N = '4;' + L.index));
                    }
                    switch (L.type) {
                    case 0:
                      const X = B.color.toColorRGB(
                        j === 'ansi'
                          ? this._themeService.colors.ansi[L.index]
                          : this._themeService.colors[j]
                      );
                      this.coreService.triggerDataEvent(
                        `${G.C0.ESC}]${N};${(0, E.toRgbString)(X)}${G.C1_ESCAPED.ST}`
                      );
                      break;
                    case 1:
                      if (j === 'ansi')
                        this._themeService.modifyColors(
                          (q) =>
                            (q.ansi[L.index] = B.channels.toColor(...L.color))
                        );
                      else {
                        const q = j;
                        this._themeService.modifyColors(
                          (ee) => (ee[q] = B.channels.toColor(...L.color))
                        );
                      }
                      break;
                    case 2:
                      this._themeService.restoreColor(L.index);
                    }
                  }
              }
              _setup() {
                (super._setup(), (this._customKeyEventHandler = void 0));
              }
              get buffer() {
                return this.buffers.active;
              }
              focus() {
                this.textarea && this.textarea.focus({ preventScroll: !0 });
              }
              _handleScreenReaderModeOptionChange(M) {
                M
                  ? !this._accessibilityManager.value &&
                    this._renderService &&
                    (this._accessibilityManager.value =
                      this._instantiationService.createInstance(
                        F.AccessibilityManager,
                        this
                      ))
                  : this._accessibilityManager.clear();
              }
              _handleTextAreaFocus(M) {
                (this.coreService.decPrivateModes.sendFocus &&
                  this.coreService.triggerDataEvent(G.C0.ESC + '[I'),
                this.element.classList.add('focus'),
                this._showCursor(),
                this._onFocus.fire());
              }
              blur() {
                var M;
                return (M = this.textarea) == null ? void 0 : M.blur();
              }
              _handleTextAreaBlur() {
                ((this.textarea.value = ''),
                this.refresh(this.buffer.y, this.buffer.y),
                this.coreService.decPrivateModes.sendFocus &&
                    this.coreService.triggerDataEvent(G.C0.ESC + '[O'),
                this.element.classList.remove('focus'),
                this._onBlur.fire());
              }
              _syncTextArea() {
                if (
                  !this.textarea ||
                  !this.buffer.isCursorInViewport ||
                  this._compositionHelper.isComposing ||
                  !this._renderService
                )
                  return;
                const M = this.buffer.ybase + this.buffer.y,
                  L = this.buffer.lines.get(M);
                if (!L) return;
                const j = Math.min(this.buffer.x, this.cols - 1),
                  N = this._renderService.dimensions.css.cell.height,
                  X = L.getWidth(j),
                  q = this._renderService.dimensions.css.cell.width * X,
                  ee =
                    this.buffer.y *
                    this._renderService.dimensions.css.cell.height,
                  de = j * this._renderService.dimensions.css.cell.width;
                ((this.textarea.style.left = de + 'px'),
                (this.textarea.style.top = ee + 'px'),
                (this.textarea.style.width = q + 'px'),
                (this.textarea.style.height = N + 'px'),
                (this.textarea.style.lineHeight = N + 'px'),
                (this.textarea.style.zIndex = '-5'));
              }
              _initGlobal() {
                (this._bindKeys(),
                this.register(
                  (0, g.addDisposableDomListener)(
                    this.element,
                    'copy',
                    (L) => {
                      this.hasSelection() &&
                          (0, f.copyHandler)(L, this._selectionService);
                    }
                  )
                ));
                const M = (L) =>
                  (0, f.handlePasteEvent)(
                    L,
                    this.textarea,
                    this.coreService,
                    this.optionsService
                  );
                (this.register(
                  (0, g.addDisposableDomListener)(this.textarea, 'paste', M)
                ),
                this.register(
                  (0, g.addDisposableDomListener)(this.element, 'paste', M)
                ),
                W.isFirefox
                  ? this.register(
                    (0, g.addDisposableDomListener)(
                      this.element,
                      'mousedown',
                      (L) => {
                        L.button === 2 &&
                              (0, f.rightClickHandler)(
                                L,
                                this.textarea,
                                this.screenElement,
                                this._selectionService,
                                this.options.rightClickSelectsWord
                              );
                      }
                    )
                  )
                  : this.register(
                    (0, g.addDisposableDomListener)(
                      this.element,
                      'contextmenu',
                      (L) => {
                        (0, f.rightClickHandler)(
                          L,
                          this.textarea,
                          this.screenElement,
                          this._selectionService,
                          this.options.rightClickSelectsWord
                        );
                      }
                    )
                  ),
                W.isLinux &&
                    this.register(
                      (0, g.addDisposableDomListener)(
                        this.element,
                        'auxclick',
                        (L) => {
                          L.button === 1 &&
                            (0, f.moveTextAreaUnderMouseCursor)(
                              L,
                              this.textarea,
                              this.screenElement
                            );
                        }
                      )
                    ));
              }
              _bindKeys() {
                (this.register(
                  (0, g.addDisposableDomListener)(
                    this.textarea,
                    'keyup',
                    (M) => this._keyUp(M),
                    !0
                  )
                ),
                this.register(
                  (0, g.addDisposableDomListener)(
                    this.textarea,
                    'keydown',
                    (M) => this._keyDown(M),
                    !0
                  )
                ),
                this.register(
                  (0, g.addDisposableDomListener)(
                    this.textarea,
                    'keypress',
                    (M) => this._keyPress(M),
                    !0
                  )
                ),
                this.register(
                  (0, g.addDisposableDomListener)(
                    this.textarea,
                    'compositionstart',
                    () => this._compositionHelper.compositionstart()
                  )
                ),
                this.register(
                  (0, g.addDisposableDomListener)(
                    this.textarea,
                    'compositionupdate',
                    (M) => this._compositionHelper.compositionupdate(M)
                  )
                ),
                this.register(
                  (0, g.addDisposableDomListener)(
                    this.textarea,
                    'compositionend',
                    () => this._compositionHelper.compositionend()
                  )
                ),
                this.register(
                  (0, g.addDisposableDomListener)(
                    this.textarea,
                    'input',
                    (M) => this._inputEvent(M),
                    !0
                  )
                ),
                this.register(
                  this.onRender(() =>
                    this._compositionHelper.updateCompositionElements()
                  )
                ));
              }
              open(M) {
                var j;
                if (!M) throw new Error('Terminal requires a parent element.');
                if (
                  (M.isConnected ||
                    this._logService.debug(
                      'Terminal.open was called on an element that was not attached to the DOM'
                    ),
                  ((j = this.element) == null
                    ? void 0
                    : j.ownerDocument.defaultView) && this._coreBrowserService)
                )
                  return void (
                    this.element.ownerDocument.defaultView !==
                      this._coreBrowserService.window &&
                    (this._coreBrowserService.window =
                      this.element.ownerDocument.defaultView)
                  );
                ((this._document = M.ownerDocument),
                this.options.documentOverride &&
                    this.options.documentOverride instanceof Document &&
                    (this._document =
                      this.optionsService.rawOptions.documentOverride),
                (this.element = this._document.createElement('div')),
                (this.element.dir = 'ltr'),
                this.element.classList.add('terminal'),
                this.element.classList.add('xterm'),
                M.appendChild(this.element));
                const L = this._document.createDocumentFragment();
                ((this._viewportElement = this._document.createElement('div')),
                this._viewportElement.classList.add('xterm-viewport'),
                L.appendChild(this._viewportElement),
                (this._viewportScrollArea =
                    this._document.createElement('div')),
                this._viewportScrollArea.classList.add('xterm-scroll-area'),
                this._viewportElement.appendChild(this._viewportScrollArea),
                (this.screenElement = this._document.createElement('div')),
                this.screenElement.classList.add('xterm-screen'),
                this.register(
                  (0, g.addDisposableDomListener)(
                    this.screenElement,
                    'mousemove',
                    (N) => this.updateCursorStyle(N)
                  )
                ),
                (this._helperContainer = this._document.createElement('div')),
                this._helperContainer.classList.add('xterm-helpers'),
                this.screenElement.appendChild(this._helperContainer),
                L.appendChild(this.screenElement),
                (this.textarea = this._document.createElement('textarea')),
                this.textarea.classList.add('xterm-helper-textarea'),
                this.textarea.setAttribute('aria-label', d.promptLabel),
                W.isChromeOS ||
                    this.textarea.setAttribute('aria-multiline', 'false'),
                this.textarea.setAttribute('autocorrect', 'off'),
                this.textarea.setAttribute('autocapitalize', 'off'),
                this.textarea.setAttribute('spellcheck', 'false'),
                (this.textarea.tabIndex = 0),
                (this._coreBrowserService = this.register(
                  this._instantiationService.createInstance(
                    C.CoreBrowserService,
                    this.textarea,
                    M.ownerDocument.defaultView ?? window,
                    (this._document ?? typeof window < 'u')
                      ? window.document
                      : null
                  )
                )),
                this._instantiationService.setService(
                  k.ICoreBrowserService,
                  this._coreBrowserService
                ),
                this.register(
                  (0, g.addDisposableDomListener)(
                    this.textarea,
                    'focus',
                    (N) => this._handleTextAreaFocus(N)
                  )
                ),
                this.register(
                  (0, g.addDisposableDomListener)(this.textarea, 'blur', () =>
                    this._handleTextAreaBlur()
                  )
                ),
                this._helperContainer.appendChild(this.textarea),
                (this._charSizeService =
                    this._instantiationService.createInstance(
                      o.CharSizeService,
                      this._document,
                      this._helperContainer
                    )),
                this._instantiationService.setService(
                  k.ICharSizeService,
                  this._charSizeService
                ),
                (this._themeService =
                    this._instantiationService.createInstance(T.ThemeService)),
                this._instantiationService.setService(
                  k.IThemeService,
                  this._themeService
                ),
                (this._characterJoinerService =
                    this._instantiationService.createInstance(
                      _.CharacterJoinerService
                    )),
                this._instantiationService.setService(
                  k.ICharacterJoinerService,
                  this._characterJoinerService
                ),
                (this._renderService = this.register(
                  this._instantiationService.createInstance(
                    x.RenderService,
                    this.rows,
                    this.screenElement
                  )
                )),
                this._instantiationService.setService(
                  k.IRenderService,
                  this._renderService
                ),
                this.register(
                  this._renderService.onRenderedViewportChange((N) =>
                    this._onRender.fire(N)
                  )
                ),
                this.onResize((N) =>
                  this._renderService.resize(N.cols, N.rows)
                ),
                (this._compositionView = this._document.createElement('div')),
                this._compositionView.classList.add('composition-view'),
                (this._compositionHelper =
                    this._instantiationService.createInstance(
                      n.CompositionHelper,
                      this.textarea,
                      this._compositionView
                    )),
                this._helperContainer.appendChild(this._compositionView),
                (this._mouseService =
                    this._instantiationService.createInstance(b.MouseService)),
                this._instantiationService.setService(
                  k.IMouseService,
                  this._mouseService
                ),
                (this.linkifier = this.register(
                  this._instantiationService.createInstance(
                    u.Linkifier,
                    this.screenElement
                  )
                )),
                this.element.appendChild(L));
                try {
                  this._onWillOpen.fire(this.element);
                } catch {}
                (this._renderService.hasRenderer() ||
                  this._renderService.setRenderer(this._createRenderer()),
                (this.viewport = this._instantiationService.createInstance(
                  w.Viewport,
                  this._viewportElement,
                  this._viewportScrollArea
                )),
                this.viewport.onRequestScrollLines((N) =>
                  this.scrollLines(N.amount, N.suppressScrollEvent, 1)
                ),
                this.register(
                  this._inputHandler.onRequestSyncScrollBar(() =>
                    this.viewport.syncScrollArea()
                  )
                ),
                this.register(this.viewport),
                this.register(
                  this.onCursorMove(() => {
                    (this._renderService.handleCursorMove(),
                    this._syncTextArea());
                  })
                ),
                this.register(
                  this.onResize(() =>
                    this._renderService.handleResize(this.cols, this.rows)
                  )
                ),
                this.register(
                  this.onBlur(() => this._renderService.handleBlur())
                ),
                this.register(
                  this.onFocus(() => this._renderService.handleFocus())
                ),
                this.register(
                  this._renderService.onDimensionsChange(() =>
                    this.viewport.syncScrollArea()
                  )
                ),
                (this._selectionService = this.register(
                  this._instantiationService.createInstance(
                    S.SelectionService,
                    this.element,
                    this.screenElement,
                    this.linkifier
                  )
                )),
                this._instantiationService.setService(
                  k.ISelectionService,
                  this._selectionService
                ),
                this.register(
                  this._selectionService.onRequestScrollLines((N) =>
                    this.scrollLines(N.amount, N.suppressScrollEvent)
                  )
                ),
                this.register(
                  this._selectionService.onSelectionChange(() =>
                    this._onSelectionChange.fire()
                  )
                ),
                this.register(
                  this._selectionService.onRequestRedraw((N) =>
                    this._renderService.handleSelectionChanged(
                      N.start,
                      N.end,
                      N.columnSelectMode
                    )
                  )
                ),
                this.register(
                  this._selectionService.onLinuxMouseSelection((N) => {
                    ((this.textarea.value = N),
                    this.textarea.focus(),
                    this.textarea.select());
                  })
                ),
                this.register(
                  this._onScroll.event((N) => {
                    (this.viewport.syncScrollArea(),
                    this._selectionService.refresh());
                  })
                ),
                this.register(
                  (0, g.addDisposableDomListener)(
                    this._viewportElement,
                    'scroll',
                    () => this._selectionService.refresh()
                  )
                ),
                this.register(
                  this._instantiationService.createInstance(
                    p.BufferDecorationRenderer,
                    this.screenElement
                  )
                ),
                this.register(
                  (0, g.addDisposableDomListener)(
                    this.element,
                    'mousedown',
                    (N) => this._selectionService.handleMouseDown(N)
                  )
                ),
                this.coreMouseService.areMouseEventsActive
                  ? (this._selectionService.disable(),
                  this.element.classList.add('enable-mouse-events'))
                  : this._selectionService.enable(),
                this.options.screenReaderMode &&
                    (this._accessibilityManager.value =
                      this._instantiationService.createInstance(
                        F.AccessibilityManager,
                        this
                      )),
                this.register(
                  this.optionsService.onSpecificOptionChange(
                    'screenReaderMode',
                    (N) => this._handleScreenReaderModeOptionChange(N)
                  )
                ),
                this.options.overviewRulerWidth &&
                    (this._overviewRulerRenderer = this.register(
                      this._instantiationService.createInstance(
                        c.OverviewRulerRenderer,
                        this._viewportElement,
                        this.screenElement
                      )
                    )),
                this.optionsService.onSpecificOptionChange(
                  'overviewRulerWidth',
                  (N) => {
                    !this._overviewRulerRenderer &&
                        N &&
                        this._viewportElement &&
                        this.screenElement &&
                        (this._overviewRulerRenderer = this.register(
                          this._instantiationService.createInstance(
                            c.OverviewRulerRenderer,
                            this._viewportElement,
                            this.screenElement
                          )
                        ));
                  }
                ),
                this._charSizeService.measure(),
                this.refresh(0, this.rows - 1),
                this._initGlobal(),
                this.bindMouse());
              }
              _createRenderer() {
                return this._instantiationService.createInstance(
                  s.DomRenderer,
                  this,
                  this._document,
                  this.element,
                  this.screenElement,
                  this._viewportElement,
                  this._helperContainer,
                  this.linkifier
                );
              }
              bindMouse() {
                const M = this,
                  L = this.element;
                function j(q) {
                  const ee = M._mouseService.getMouseReportCoords(
                    q,
                    M.screenElement
                  );
                  if (!ee) return !1;
                  let de, fe;
                  switch (q.overrideType || q.type) {
                  case 'mousemove':
                    ((fe = 32),
                    q.buttons === void 0
                      ? ((de = 3),
                      q.button !== void 0 &&
                              (de = q.button < 3 ? q.button : 3))
                      : (de =
                              1 & q.buttons
                                ? 0
                                : 4 & q.buttons
                                  ? 1
                                  : 2 & q.buttons
                                    ? 2
                                    : 3));
                    break;
                  case 'mouseup':
                    ((fe = 0), (de = q.button < 3 ? q.button : 3));
                    break;
                  case 'mousedown':
                    ((fe = 1), (de = q.button < 3 ? q.button : 3));
                    break;
                  case 'wheel':
                    if (
                      (M._customWheelEventHandler &&
                          M._customWheelEventHandler(q) === !1) ||
                        M.viewport.getLinesScrolled(q) === 0
                    )
                      return !1;
                    ((fe = q.deltaY < 0 ? 0 : 1), (de = 4));
                    break;
                  default:
                    return !1;
                  }
                  return (
                    !(fe === void 0 || de === void 0 || de > 4) &&
                    M.coreMouseService.triggerMouseEvent({
                      col: ee.col,
                      row: ee.row,
                      x: ee.x,
                      y: ee.y,
                      button: de,
                      action: fe,
                      ctrl: q.ctrlKey,
                      alt: q.altKey,
                      shift: q.shiftKey,
                    })
                  );
                }
                const N = {
                    mouseup: null,
                    wheel: null,
                    mousedrag: null,
                    mousemove: null,
                  },
                  X = {
                    mouseup: (q) => (
                      j(q),
                      q.buttons ||
                        (this._document.removeEventListener(
                          'mouseup',
                          N.mouseup
                        ),
                        N.mousedrag &&
                          this._document.removeEventListener(
                            'mousemove',
                            N.mousedrag
                          )),
                      this.cancel(q)
                    ),
                    wheel: (q) => (j(q), this.cancel(q, !0)),
                    mousedrag: (q) => {
                      q.buttons && j(q);
                    },
                    mousemove: (q) => {
                      q.buttons || j(q);
                    },
                  };
                (this.register(
                  this.coreMouseService.onProtocolChange((q) => {
                    (q
                      ? (this.optionsService.rawOptions.logLevel === 'debug' &&
                          this._logService.debug(
                            'Binding to mouse events:',
                            this.coreMouseService.explainEvents(q)
                          ),
                      this.element.classList.add('enable-mouse-events'),
                      this._selectionService.disable())
                      : (this._logService.debug('Unbinding from mouse events.'),
                      this.element.classList.remove('enable-mouse-events'),
                      this._selectionService.enable()),
                    8 & q
                      ? N.mousemove ||
                          (L.addEventListener('mousemove', X.mousemove),
                          (N.mousemove = X.mousemove))
                      : (L.removeEventListener('mousemove', N.mousemove),
                      (N.mousemove = null)),
                    16 & q
                      ? N.wheel ||
                          (L.addEventListener('wheel', X.wheel, {
                            passive: !1,
                          }),
                          (N.wheel = X.wheel))
                      : (L.removeEventListener('wheel', N.wheel),
                      (N.wheel = null)),
                    2 & q
                      ? N.mouseup || (N.mouseup = X.mouseup)
                      : (this._document.removeEventListener(
                        'mouseup',
                        N.mouseup
                      ),
                      (N.mouseup = null)),
                    4 & q
                      ? N.mousedrag || (N.mousedrag = X.mousedrag)
                      : (this._document.removeEventListener(
                        'mousemove',
                        N.mousedrag
                      ),
                      (N.mousedrag = null)));
                  })
                ),
                (this.coreMouseService.activeProtocol =
                    this.coreMouseService.activeProtocol),
                this.register(
                  (0, g.addDisposableDomListener)(L, 'mousedown', (q) => {
                    if (
                      (q.preventDefault(),
                      this.focus(),
                      this.coreMouseService.areMouseEventsActive &&
                          !this._selectionService.shouldForceSelection(q))
                    )
                      return (
                        j(q),
                        N.mouseup &&
                            this._document.addEventListener(
                              'mouseup',
                              N.mouseup
                            ),
                        N.mousedrag &&
                            this._document.addEventListener(
                              'mousemove',
                              N.mousedrag
                            ),
                        this.cancel(q)
                      );
                  })
                ),
                this.register(
                  (0, g.addDisposableDomListener)(
                    L,
                    'wheel',
                    (q) => {
                      if (!N.wheel) {
                        if (
                          this._customWheelEventHandler &&
                            this._customWheelEventHandler(q) === !1
                        )
                          return !1;
                        if (!this.buffer.hasScrollback) {
                          const ee = this.viewport.getLinesScrolled(q);
                          if (ee === 0) return;
                          const de =
                              G.C0.ESC +
                              (this.coreService.decPrivateModes
                                .applicationCursorKeys
                                ? 'O'
                                : '[') +
                              (q.deltaY < 0 ? 'A' : 'B');
                          let fe = '';
                          for (let Pe = 0; Pe < Math.abs(ee); Pe++) fe += de;
                          return (
                            this.coreService.triggerDataEvent(fe, !0),
                            this.cancel(q, !0)
                          );
                        }
                        return this.viewport.handleWheel(q)
                          ? this.cancel(q)
                          : void 0;
                      }
                    },
                    { passive: !1 }
                  )
                ),
                this.register(
                  (0, g.addDisposableDomListener)(
                    L,
                    'touchstart',
                    (q) => {
                      if (!this.coreMouseService.areMouseEventsActive)
                        return (
                          this.viewport.handleTouchStart(q),
                          this.cancel(q)
                        );
                    },
                    { passive: !0 }
                  )
                ),
                this.register(
                  (0, g.addDisposableDomListener)(
                    L,
                    'touchmove',
                    (q) => {
                      if (!this.coreMouseService.areMouseEventsActive)
                        return this.viewport.handleTouchMove(q)
                          ? void 0
                          : this.cancel(q);
                    },
                    { passive: !1 }
                  )
                ));
              }
              refresh(M, L) {
                var j;
                (j = this._renderService) == null || j.refreshRows(M, L);
              }
              updateCursorStyle(M) {
                var L;
                (L = this._selectionService) != null && L.shouldColumnSelect(M)
                  ? this.element.classList.add('column-select')
                  : this.element.classList.remove('column-select');
              }
              _showCursor() {
                this.coreService.isCursorInitialized ||
                  ((this.coreService.isCursorInitialized = !0),
                  this.refresh(this.buffer.y, this.buffer.y));
              }
              scrollLines(M, L, j = 0) {
                var N;
                j === 1
                  ? (super.scrollLines(M, L, j), this.refresh(0, this.rows - 1))
                  : (N = this.viewport) == null || N.scrollLines(M);
              }
              paste(M) {
                (0, f.paste)(
                  M,
                  this.textarea,
                  this.coreService,
                  this.optionsService
                );
              }
              attachCustomKeyEventHandler(M) {
                this._customKeyEventHandler = M;
              }
              attachCustomWheelEventHandler(M) {
                this._customWheelEventHandler = M;
              }
              registerLinkProvider(M) {
                return this._linkProviderService.registerLinkProvider(M);
              }
              registerCharacterJoiner(M) {
                if (!this._characterJoinerService)
                  throw new Error('Terminal must be opened first');
                const L = this._characterJoinerService.register(M);
                return (this.refresh(0, this.rows - 1), L);
              }
              deregisterCharacterJoiner(M) {
                if (!this._characterJoinerService)
                  throw new Error('Terminal must be opened first');
                this._characterJoinerService.deregister(M) &&
                  this.refresh(0, this.rows - 1);
              }
              get markers() {
                return this.buffer.markers;
              }
              registerMarker(M) {
                return this.buffer.addMarker(
                  this.buffer.ybase + this.buffer.y + M
                );
              }
              registerDecoration(M) {
                return this._decorationService.registerDecoration(M);
              }
              hasSelection() {
                return (
                  !!this._selectionService &&
                  this._selectionService.hasSelection
                );
              }
              select(M, L, j) {
                this._selectionService.setSelection(M, L, j);
              }
              getSelection() {
                return this._selectionService
                  ? this._selectionService.selectionText
                  : '';
              }
              getSelectionPosition() {
                if (
                  this._selectionService &&
                  this._selectionService.hasSelection
                )
                  return {
                    start: {
                      x: this._selectionService.selectionStart[0],
                      y: this._selectionService.selectionStart[1],
                    },
                    end: {
                      x: this._selectionService.selectionEnd[0],
                      y: this._selectionService.selectionEnd[1],
                    },
                  };
              }
              clearSelection() {
                var M;
                (M = this._selectionService) == null || M.clearSelection();
              }
              selectAll() {
                var M;
                (M = this._selectionService) == null || M.selectAll();
              }
              selectLines(M, L) {
                var j;
                (j = this._selectionService) == null || j.selectLines(M, L);
              }
              _keyDown(M) {
                if (
                  ((this._keyDownHandled = !1),
                  (this._keyDownSeen = !0),
                  this._customKeyEventHandler &&
                    this._customKeyEventHandler(M) === !1)
                )
                  return !1;
                const L =
                  this.browser.isMac &&
                  this.options.macOptionIsMeta &&
                  M.altKey;
                if (!L && !this._compositionHelper.keydown(M))
                  return (
                    this.options.scrollOnUserInput &&
                      this.buffer.ybase !== this.buffer.ydisp &&
                      this.scrollToBottom(),
                    !1
                  );
                L ||
                  (M.key !== 'Dead' && M.key !== 'AltGraph') ||
                  (this._unprocessedDeadKey = !0);
                const j = (0, I.evaluateKeyboardEvent)(
                  M,
                  this.coreService.decPrivateModes.applicationCursorKeys,
                  this.browser.isMac,
                  this.options.macOptionIsMeta
                );
                if ((this.updateCursorStyle(M), j.type === 3 || j.type === 2)) {
                  const N = this.rows - 1;
                  return (
                    this.scrollLines(j.type === 2 ? -N : N),
                    this.cancel(M, !0)
                  );
                }
                return (
                  j.type === 1 && this.selectAll(),
                  !!this._isThirdLevelShift(this.browser, M) ||
                    (j.cancel && this.cancel(M, !0),
                    !j.key ||
                      !!(
                        M.key &&
                        !M.ctrlKey &&
                        !M.altKey &&
                        !M.metaKey &&
                        M.key.length === 1 &&
                        M.key.charCodeAt(0) >= 65 &&
                        M.key.charCodeAt(0) <= 90
                      ) ||
                      (this._unprocessedDeadKey
                        ? ((this._unprocessedDeadKey = !1), !0)
                        : ((j.key !== G.C0.ETX && j.key !== G.C0.CR) ||
                            (this.textarea.value = ''),
                        this._onKey.fire({ key: j.key, domEvent: M }),
                        this._showCursor(),
                        this.coreService.triggerDataEvent(j.key, !0),
                        !this.optionsService.rawOptions.screenReaderMode ||
                          M.altKey ||
                          M.ctrlKey
                          ? this.cancel(M, !0)
                          : void (this._keyDownHandled = !0))))
                );
              }
              _isThirdLevelShift(M, L) {
                const j =
                  (M.isMac &&
                    !this.options.macOptionIsMeta &&
                    L.altKey &&
                    !L.ctrlKey &&
                    !L.metaKey) ||
                  (M.isWindows && L.altKey && L.ctrlKey && !L.metaKey) ||
                  (M.isWindows && L.getModifierState('AltGraph'));
                return L.type === 'keypress'
                  ? j
                  : j && (!L.keyCode || L.keyCode > 47);
              }
              _keyUp(M) {
                ((this._keyDownSeen = !1),
                (this._customKeyEventHandler &&
                    this._customKeyEventHandler(M) === !1) ||
                    ((function (L) {
                      return (
                        L.keyCode === 16 || L.keyCode === 17 || L.keyCode === 18
                      );
                    })(M) || this.focus(),
                    this.updateCursorStyle(M),
                    (this._keyPressHandled = !1)));
              }
              _keyPress(M) {
                let L;
                if (
                  ((this._keyPressHandled = !1),
                  this._keyDownHandled ||
                    (this._customKeyEventHandler &&
                      this._customKeyEventHandler(M) === !1))
                )
                  return !1;
                if ((this.cancel(M), M.charCode)) L = M.charCode;
                else if (M.which === null || M.which === void 0) L = M.keyCode;
                else {
                  if (M.which === 0 || M.charCode === 0) return !1;
                  L = M.which;
                }
                return !(
                  !L ||
                  ((M.altKey || M.ctrlKey || M.metaKey) &&
                    !this._isThirdLevelShift(this.browser, M)) ||
                  ((L = String.fromCharCode(L)),
                  this._onKey.fire({ key: L, domEvent: M }),
                  this._showCursor(),
                  this.coreService.triggerDataEvent(L, !0),
                  (this._keyPressHandled = !0),
                  (this._unprocessedDeadKey = !1),
                  0)
                );
              }
              _inputEvent(M) {
                if (
                  M.data &&
                  M.inputType === 'insertText' &&
                  (!M.composed || !this._keyDownSeen) &&
                  !this.optionsService.rawOptions.screenReaderMode
                ) {
                  if (this._keyPressHandled) return !1;
                  this._unprocessedDeadKey = !1;
                  const L = M.data;
                  return (
                    this.coreService.triggerDataEvent(L, !0),
                    this.cancel(M),
                    !0
                  );
                }
                return !1;
              }
              resize(M, L) {
                M !== this.cols || L !== this.rows
                  ? super.resize(M, L)
                  : this._charSizeService &&
                    !this._charSizeService.hasValidSize &&
                    this._charSizeService.measure();
              }
              _afterResize(M, L) {
                var j, N;
                ((j = this._charSizeService) == null || j.measure(),
                (N = this.viewport) == null || N.syncScrollArea(!0));
              }
              clear() {
                var M;
                if (this.buffer.ybase !== 0 || this.buffer.y !== 0) {
                  (this.buffer.clearAllMarkers(),
                  this.buffer.lines.set(
                    0,
                    this.buffer.lines.get(this.buffer.ybase + this.buffer.y)
                  ),
                  (this.buffer.lines.length = 1),
                  (this.buffer.ydisp = 0),
                  (this.buffer.ybase = 0),
                  (this.buffer.y = 0));
                  for (let L = 1; L < this.rows; L++)
                    this.buffer.lines.push(
                      this.buffer.getBlankLine($.DEFAULT_ATTR_DATA)
                    );
                  (this._onScroll.fire({
                    position: this.buffer.ydisp,
                    source: 0,
                  }),
                  (M = this.viewport) == null || M.reset(),
                  this.refresh(0, this.rows - 1));
                }
              }
              reset() {
                var L, j;
                ((this.options.rows = this.rows),
                (this.options.cols = this.cols));
                const M = this._customKeyEventHandler;
                (this._setup(),
                super.reset(),
                (L = this._selectionService) == null || L.reset(),
                this._decorationService.reset(),
                (j = this.viewport) == null || j.reset(),
                (this._customKeyEventHandler = M),
                this.refresh(0, this.rows - 1));
              }
              clearTextureAtlas() {
                var M;
                (M = this._renderService) == null || M.clearTextureAtlas();
              }
              _reportFocus() {
                var M;
                (M = this.element) != null && M.classList.contains('focus')
                  ? this.coreService.triggerDataEvent(G.C0.ESC + '[I')
                  : this.coreService.triggerDataEvent(G.C0.ESC + '[O');
              }
              _reportWindowsOptions(M) {
                if (this._renderService)
                  switch (M) {
                  case P.WindowsOptionsReportType.GET_WIN_SIZE_PIXELS:
                    const L =
                          this._renderService.dimensions.css.canvas.width.toFixed(
                            0
                          ),
                      j =
                          this._renderService.dimensions.css.canvas.height.toFixed(
                            0
                          );
                    this.coreService.triggerDataEvent(
                      `${G.C0.ESC}[4;${j};${L}t`
                    );
                    break;
                  case P.WindowsOptionsReportType.GET_CELL_SIZE_PIXELS:
                    const N =
                          this._renderService.dimensions.css.cell.width.toFixed(
                            0
                          ),
                      X =
                          this._renderService.dimensions.css.cell.height.toFixed(
                            0
                          );
                    this.coreService.triggerDataEvent(
                      `${G.C0.ESC}[6;${X};${N}t`
                    );
                  }
              }
              cancel(M, L) {
                if (this.options.cancelEvents || L)
                  return (M.preventDefault(), M.stopPropagation(), !1);
              }
            }
            a.Terminal = Y;
          },
          9924: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.TimeBasedDebouncer = void 0),
            (a.TimeBasedDebouncer = class {
              constructor(l, f = 1e3) {
                ((this._renderCallback = l),
                (this._debounceThresholdMS = f),
                (this._lastRefreshMs = 0),
                (this._additionalRefreshRequested = !1));
              }
              dispose() {
                this._refreshTimeoutID &&
                    clearTimeout(this._refreshTimeoutID);
              }
              refresh(l, f, g) {
                ((this._rowCount = g),
                (l = l !== void 0 ? l : 0),
                (f = f !== void 0 ? f : this._rowCount - 1),
                (this._rowStart =
                      this._rowStart !== void 0
                        ? Math.min(this._rowStart, l)
                        : l),
                (this._rowEnd =
                      this._rowEnd !== void 0 ? Math.max(this._rowEnd, f) : f));
                const u = Date.now();
                if (u - this._lastRefreshMs >= this._debounceThresholdMS)
                  ((this._lastRefreshMs = u), this._innerRefresh());
                else if (!this._additionalRefreshRequested) {
                  const d = u - this._lastRefreshMs,
                    v = this._debounceThresholdMS - d;
                  ((this._additionalRefreshRequested = !0),
                  (this._refreshTimeoutID = window.setTimeout(() => {
                    ((this._lastRefreshMs = Date.now()),
                    this._innerRefresh(),
                    (this._additionalRefreshRequested = !1),
                    (this._refreshTimeoutID = void 0));
                  }, v)));
                }
              }
              _innerRefresh() {
                if (
                  this._rowStart === void 0 ||
                    this._rowEnd === void 0 ||
                    this._rowCount === void 0
                )
                  return;
                const l = Math.max(this._rowStart, 0),
                  f = Math.min(this._rowEnd, this._rowCount - 1);
                ((this._rowStart = void 0),
                (this._rowEnd = void 0),
                this._renderCallback(l, f));
              }
            }));
          },
          1680: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (n, s, o, _) {
                  var C,
                    b = arguments.length,
                    x =
                      b < 3
                        ? s
                        : _ === null
                          ? (_ = Object.getOwnPropertyDescriptor(s, o))
                          : _;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    x = Reflect.decorate(n, s, o, _);
                  else
                    for (var S = n.length - 1; S >= 0; S--)
                      (C = n[S]) &&
                        (x =
                          (b < 3 ? C(x) : b > 3 ? C(s, o, x) : C(s, o)) || x);
                  return (b > 3 && x && Object.defineProperty(s, o, x), x);
                },
              g =
                (this && this.__param) ||
                function (n, s) {
                  return function (o, _) {
                    s(o, _, n);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.Viewport = void 0));
            const u = l(3656),
              d = l(4725),
              v = l(8460),
              w = l(844),
              p = l(2585);
            let c = (a.Viewport = class extends w.Disposable {
              constructor(n, s, o, _, C, b, x, S) {
                (super(),
                (this._viewportElement = n),
                (this._scrollArea = s),
                (this._bufferService = o),
                (this._optionsService = _),
                (this._charSizeService = C),
                (this._renderService = b),
                (this._coreBrowserService = x),
                (this.scrollBarWidth = 0),
                (this._currentRowHeight = 0),
                (this._currentDeviceCellHeight = 0),
                (this._lastRecordedBufferLength = 0),
                (this._lastRecordedViewportHeight = 0),
                (this._lastRecordedBufferHeight = 0),
                (this._lastTouchY = 0),
                (this._lastScrollTop = 0),
                (this._wheelPartialScroll = 0),
                (this._refreshAnimationFrame = null),
                (this._ignoreNextScrollEvent = !1),
                (this._smoothScrollState = {
                  startTime: 0,
                  origin: -1,
                  target: -1,
                }),
                (this._onRequestScrollLines = this.register(
                  new v.EventEmitter()
                )),
                (this.onRequestScrollLines =
                    this._onRequestScrollLines.event),
                (this.scrollBarWidth =
                    this._viewportElement.offsetWidth -
                      this._scrollArea.offsetWidth || 15),
                this.register(
                  (0, u.addDisposableDomListener)(
                    this._viewportElement,
                    'scroll',
                    this._handleScroll.bind(this)
                  )
                ),
                (this._activeBuffer = this._bufferService.buffer),
                this.register(
                  this._bufferService.buffers.onBufferActivate(
                    (k) => (this._activeBuffer = k.activeBuffer)
                  )
                ),
                (this._renderDimensions = this._renderService.dimensions),
                this.register(
                  this._renderService.onDimensionsChange(
                    (k) => (this._renderDimensions = k)
                  )
                ),
                this._handleThemeChange(S.colors),
                this.register(
                  S.onChangeColors((k) => this._handleThemeChange(k))
                ),
                this.register(
                  this._optionsService.onSpecificOptionChange(
                    'scrollback',
                    () => this.syncScrollArea()
                  )
                ),
                setTimeout(() => this.syncScrollArea()));
              }
              _handleThemeChange(n) {
                this._viewportElement.style.backgroundColor = n.background.css;
              }
              reset() {
                ((this._currentRowHeight = 0),
                (this._currentDeviceCellHeight = 0),
                (this._lastRecordedBufferLength = 0),
                (this._lastRecordedViewportHeight = 0),
                (this._lastRecordedBufferHeight = 0),
                (this._lastTouchY = 0),
                (this._lastScrollTop = 0),
                this._coreBrowserService.window.requestAnimationFrame(() =>
                  this.syncScrollArea()
                ));
              }
              _refresh(n) {
                if (n)
                  return (
                    this._innerRefresh(),
                    void (
                      this._refreshAnimationFrame !== null &&
                      this._coreBrowserService.window.cancelAnimationFrame(
                        this._refreshAnimationFrame
                      )
                    )
                  );
                this._refreshAnimationFrame === null &&
                  (this._refreshAnimationFrame =
                    this._coreBrowserService.window.requestAnimationFrame(() =>
                      this._innerRefresh()
                    ));
              }
              _innerRefresh() {
                if (this._charSizeService.height > 0) {
                  ((this._currentRowHeight =
                    this._renderDimensions.device.cell.height /
                    this._coreBrowserService.dpr),
                  (this._currentDeviceCellHeight =
                      this._renderDimensions.device.cell.height),
                  (this._lastRecordedViewportHeight =
                      this._viewportElement.offsetHeight));
                  const s =
                    Math.round(
                      this._currentRowHeight * this._lastRecordedBufferLength
                    ) +
                    (this._lastRecordedViewportHeight -
                      this._renderDimensions.css.canvas.height);
                  this._lastRecordedBufferHeight !== s &&
                    ((this._lastRecordedBufferHeight = s),
                    (this._scrollArea.style.height =
                      this._lastRecordedBufferHeight + 'px'));
                }
                const n =
                  this._bufferService.buffer.ydisp * this._currentRowHeight;
                (this._viewportElement.scrollTop !== n &&
                  ((this._ignoreNextScrollEvent = !0),
                  (this._viewportElement.scrollTop = n)),
                (this._refreshAnimationFrame = null));
              }
              syncScrollArea(n = !1) {
                if (
                  this._lastRecordedBufferLength !==
                  this._bufferService.buffer.lines.length
                )
                  return (
                    (this._lastRecordedBufferLength =
                      this._bufferService.buffer.lines.length),
                    void this._refresh(n)
                  );
                (this._lastRecordedViewportHeight ===
                  this._renderService.dimensions.css.canvas.height &&
                  this._lastScrollTop ===
                    this._activeBuffer.ydisp * this._currentRowHeight &&
                  this._renderDimensions.device.cell.height ===
                    this._currentDeviceCellHeight) ||
                  this._refresh(n);
              }
              _handleScroll(n) {
                if (
                  ((this._lastScrollTop = this._viewportElement.scrollTop),
                  !this._viewportElement.offsetParent)
                )
                  return;
                if (this._ignoreNextScrollEvent)
                  return (
                    (this._ignoreNextScrollEvent = !1),
                    void this._onRequestScrollLines.fire({
                      amount: 0,
                      suppressScrollEvent: !0,
                    })
                  );
                const s =
                  Math.round(this._lastScrollTop / this._currentRowHeight) -
                  this._bufferService.buffer.ydisp;
                this._onRequestScrollLines.fire({
                  amount: s,
                  suppressScrollEvent: !0,
                });
              }
              _smoothScroll() {
                if (
                  this._isDisposed ||
                  this._smoothScrollState.origin === -1 ||
                  this._smoothScrollState.target === -1
                )
                  return;
                const n = this._smoothScrollPercent();
                ((this._viewportElement.scrollTop =
                  this._smoothScrollState.origin +
                  Math.round(
                    n *
                      (this._smoothScrollState.target -
                        this._smoothScrollState.origin)
                  )),
                n < 1
                  ? this._coreBrowserService.window.requestAnimationFrame(
                    () => this._smoothScroll()
                  )
                  : this._clearSmoothScrollState());
              }
              _smoothScrollPercent() {
                return this._optionsService.rawOptions.smoothScrollDuration &&
                  this._smoothScrollState.startTime
                  ? Math.max(
                    Math.min(
                      (Date.now() - this._smoothScrollState.startTime) /
                          this._optionsService.rawOptions.smoothScrollDuration,
                      1
                    ),
                    0
                  )
                  : 1;
              }
              _clearSmoothScrollState() {
                ((this._smoothScrollState.startTime = 0),
                (this._smoothScrollState.origin = -1),
                (this._smoothScrollState.target = -1));
              }
              _bubbleScroll(n, s) {
                const o =
                  this._viewportElement.scrollTop +
                  this._lastRecordedViewportHeight;
                return (
                  !(
                    (s < 0 && this._viewportElement.scrollTop !== 0) ||
                    (s > 0 && o < this._lastRecordedBufferHeight)
                  ) || (n.cancelable && n.preventDefault(), !1)
                );
              }
              handleWheel(n) {
                const s = this._getPixelsScrolled(n);
                return (
                  s !== 0 &&
                  (this._optionsService.rawOptions.smoothScrollDuration
                    ? ((this._smoothScrollState.startTime = Date.now()),
                    this._smoothScrollPercent() < 1
                      ? ((this._smoothScrollState.origin =
                            this._viewportElement.scrollTop),
                      this._smoothScrollState.target === -1
                        ? (this._smoothScrollState.target =
                                this._viewportElement.scrollTop + s)
                        : (this._smoothScrollState.target += s),
                      (this._smoothScrollState.target = Math.max(
                        Math.min(
                          this._smoothScrollState.target,
                          this._viewportElement.scrollHeight
                        ),
                        0
                      )),
                      this._smoothScroll())
                      : this._clearSmoothScrollState())
                    : (this._viewportElement.scrollTop += s),
                  this._bubbleScroll(n, s))
                );
              }
              scrollLines(n) {
                if (n !== 0)
                  if (this._optionsService.rawOptions.smoothScrollDuration) {
                    const s = n * this._currentRowHeight;
                    ((this._smoothScrollState.startTime = Date.now()),
                    this._smoothScrollPercent() < 1
                      ? ((this._smoothScrollState.origin =
                            this._viewportElement.scrollTop),
                      (this._smoothScrollState.target =
                            this._smoothScrollState.origin + s),
                      (this._smoothScrollState.target = Math.max(
                        Math.min(
                          this._smoothScrollState.target,
                          this._viewportElement.scrollHeight
                        ),
                        0
                      )),
                      this._smoothScroll())
                      : this._clearSmoothScrollState());
                  } else
                    this._onRequestScrollLines.fire({
                      amount: n,
                      suppressScrollEvent: !1,
                    });
              }
              _getPixelsScrolled(n) {
                if (n.deltaY === 0 || n.shiftKey) return 0;
                let s = this._applyScrollModifier(n.deltaY, n);
                return (
                  n.deltaMode === WheelEvent.DOM_DELTA_LINE
                    ? (s *= this._currentRowHeight)
                    : n.deltaMode === WheelEvent.DOM_DELTA_PAGE &&
                      (s *= this._currentRowHeight * this._bufferService.rows),
                  s
                );
              }
              getBufferElements(n, s) {
                var S;
                let o,
                  _ = '';
                const C = [],
                  b = s ?? this._bufferService.buffer.lines.length,
                  x = this._bufferService.buffer.lines;
                for (let k = n; k < b; k++) {
                  const T = x.get(k);
                  if (!T) continue;
                  const B = (S = x.get(k + 1)) == null ? void 0 : S.isWrapped;
                  if (
                    ((_ += T.translateToString(!B)), !B || k === x.length - 1)
                  ) {
                    const O = document.createElement('div');
                    ((O.textContent = _),
                    C.push(O),
                    _.length > 0 && (o = O),
                    (_ = ''));
                  }
                }
                return { bufferElements: C, cursorElement: o };
              }
              getLinesScrolled(n) {
                if (n.deltaY === 0 || n.shiftKey) return 0;
                let s = this._applyScrollModifier(n.deltaY, n);
                return (
                  n.deltaMode === WheelEvent.DOM_DELTA_PIXEL
                    ? ((s /= this._currentRowHeight + 0),
                    (this._wheelPartialScroll += s),
                    (s =
                        Math.floor(Math.abs(this._wheelPartialScroll)) *
                        (this._wheelPartialScroll > 0 ? 1 : -1)),
                    (this._wheelPartialScroll %= 1))
                    : n.deltaMode === WheelEvent.DOM_DELTA_PAGE &&
                      (s *= this._bufferService.rows),
                  s
                );
              }
              _applyScrollModifier(n, s) {
                const o = this._optionsService.rawOptions.fastScrollModifier;
                return (o === 'alt' && s.altKey) ||
                  (o === 'ctrl' && s.ctrlKey) ||
                  (o === 'shift' && s.shiftKey)
                  ? n *
                      this._optionsService.rawOptions.fastScrollSensitivity *
                      this._optionsService.rawOptions.scrollSensitivity
                  : n * this._optionsService.rawOptions.scrollSensitivity;
              }
              handleTouchStart(n) {
                this._lastTouchY = n.touches[0].pageY;
              }
              handleTouchMove(n) {
                const s = this._lastTouchY - n.touches[0].pageY;
                return (
                  (this._lastTouchY = n.touches[0].pageY),
                  s !== 0 &&
                    ((this._viewportElement.scrollTop += s),
                    this._bubbleScroll(n, s))
                );
              }
            });
            a.Viewport = c = f(
              [
                g(2, p.IBufferService),
                g(3, p.IOptionsService),
                g(4, d.ICharSizeService),
                g(5, d.IRenderService),
                g(6, d.ICoreBrowserService),
                g(7, d.IThemeService),
              ],
              c
            );
          },
          3107: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (p, c, n, s) {
                  var o,
                    _ = arguments.length,
                    C =
                      _ < 3
                        ? c
                        : s === null
                          ? (s = Object.getOwnPropertyDescriptor(c, n))
                          : s;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    C = Reflect.decorate(p, c, n, s);
                  else
                    for (var b = p.length - 1; b >= 0; b--)
                      (o = p[b]) &&
                        (C =
                          (_ < 3 ? o(C) : _ > 3 ? o(c, n, C) : o(c, n)) || C);
                  return (_ > 3 && C && Object.defineProperty(c, n, C), C);
                },
              g =
                (this && this.__param) ||
                function (p, c) {
                  return function (n, s) {
                    c(n, s, p);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.BufferDecorationRenderer = void 0));
            const u = l(4725),
              d = l(844),
              v = l(2585);
            let w = (a.BufferDecorationRenderer = class extends d.Disposable {
              constructor(p, c, n, s, o) {
                (super(),
                (this._screenElement = p),
                (this._bufferService = c),
                (this._coreBrowserService = n),
                (this._decorationService = s),
                (this._renderService = o),
                (this._decorationElements = new Map()),
                (this._altBufferIsActive = !1),
                (this._dimensionsChanged = !1),
                (this._container = document.createElement('div')),
                this._container.classList.add('xterm-decoration-container'),
                this._screenElement.appendChild(this._container),
                this.register(
                  this._renderService.onRenderedViewportChange(() =>
                    this._doRefreshDecorations()
                  )
                ),
                this.register(
                  this._renderService.onDimensionsChange(() => {
                    ((this._dimensionsChanged = !0), this._queueRefresh());
                  })
                ),
                this.register(
                  this._coreBrowserService.onDprChange(() =>
                    this._queueRefresh()
                  )
                ),
                this.register(
                  this._bufferService.buffers.onBufferActivate(() => {
                    this._altBufferIsActive =
                        this._bufferService.buffer ===
                        this._bufferService.buffers.alt;
                  })
                ),
                this.register(
                  this._decorationService.onDecorationRegistered(() =>
                    this._queueRefresh()
                  )
                ),
                this.register(
                  this._decorationService.onDecorationRemoved((_) =>
                    this._removeDecoration(_)
                  )
                ),
                this.register(
                  (0, d.toDisposable)(() => {
                    (this._container.remove(),
                    this._decorationElements.clear());
                  })
                ));
              }
              _queueRefresh() {
                this._animationFrame === void 0 &&
                  (this._animationFrame =
                    this._renderService.addRefreshCallback(() => {
                      (this._doRefreshDecorations(),
                      (this._animationFrame = void 0));
                    }));
              }
              _doRefreshDecorations() {
                for (const p of this._decorationService.decorations)
                  this._renderDecoration(p);
                this._dimensionsChanged = !1;
              }
              _renderDecoration(p) {
                (this._refreshStyle(p),
                this._dimensionsChanged && this._refreshXPosition(p));
              }
              _createElement(p) {
                var s;
                const c =
                  this._coreBrowserService.mainDocument.createElement('div');
                (c.classList.add('xterm-decoration'),
                c.classList.toggle(
                  'xterm-decoration-top-layer',
                  ((s = p == null ? void 0 : p.options) == null
                    ? void 0
                    : s.layer) === 'top'
                ),
                (c.style.width = `${Math.round((p.options.width || 1) * this._renderService.dimensions.css.cell.width)}px`),
                (c.style.height =
                    (p.options.height || 1) *
                      this._renderService.dimensions.css.cell.height +
                    'px'),
                (c.style.top =
                    (p.marker.line - this._bufferService.buffers.active.ydisp) *
                      this._renderService.dimensions.css.cell.height +
                    'px'),
                (c.style.lineHeight = `${this._renderService.dimensions.css.cell.height}px`));
                const n = p.options.x ?? 0;
                return (
                  n &&
                    n > this._bufferService.cols &&
                    (c.style.display = 'none'),
                  this._refreshXPosition(p, c),
                  c
                );
              }
              _refreshStyle(p) {
                const c =
                  p.marker.line - this._bufferService.buffers.active.ydisp;
                if (c < 0 || c >= this._bufferService.rows)
                  p.element &&
                    ((p.element.style.display = 'none'),
                    p.onRenderEmitter.fire(p.element));
                else {
                  let n = this._decorationElements.get(p);
                  (n ||
                    ((n = this._createElement(p)),
                    (p.element = n),
                    this._decorationElements.set(p, n),
                    this._container.appendChild(n),
                    p.onDispose(() => {
                      (this._decorationElements.delete(p), n.remove());
                    })),
                  (n.style.top =
                      c * this._renderService.dimensions.css.cell.height +
                      'px'),
                  (n.style.display = this._altBufferIsActive
                    ? 'none'
                    : 'block'),
                  p.onRenderEmitter.fire(n));
                }
              }
              _refreshXPosition(p, c = p.element) {
                if (!c) return;
                const n = p.options.x ?? 0;
                (p.options.anchor || 'left') === 'right'
                  ? (c.style.right = n
                    ? n * this._renderService.dimensions.css.cell.width + 'px'
                    : '')
                  : (c.style.left = n
                    ? n * this._renderService.dimensions.css.cell.width + 'px'
                    : '');
              }
              _removeDecoration(p) {
                var c;
                ((c = this._decorationElements.get(p)) == null || c.remove(),
                this._decorationElements.delete(p),
                p.dispose());
              }
            });
            a.BufferDecorationRenderer = w = f(
              [
                g(1, v.IBufferService),
                g(2, u.ICoreBrowserService),
                g(3, v.IDecorationService),
                g(4, u.IRenderService),
              ],
              w
            );
          },
          5871: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.ColorZoneStore = void 0),
            (a.ColorZoneStore = class {
              constructor() {
                ((this._zones = []),
                (this._zonePool = []),
                (this._zonePoolIndex = 0),
                (this._linePadding = {
                  full: 0,
                  left: 0,
                  center: 0,
                  right: 0,
                }));
              }
              get zones() {
                return (
                  (this._zonePool.length = Math.min(
                    this._zonePool.length,
                    this._zones.length
                  )),
                  this._zones
                );
              }
              clear() {
                ((this._zones.length = 0), (this._zonePoolIndex = 0));
              }
              addDecoration(l) {
                if (l.options.overviewRulerOptions) {
                  for (const f of this._zones)
                    if (
                      f.color === l.options.overviewRulerOptions.color &&
                        f.position === l.options.overviewRulerOptions.position
                    ) {
                      if (this._lineIntersectsZone(f, l.marker.line)) return;
                      if (
                        this._lineAdjacentToZone(
                          f,
                          l.marker.line,
                          l.options.overviewRulerOptions.position
                        )
                      )
                        return void this._addLineToZone(f, l.marker.line);
                    }
                  if (this._zonePoolIndex < this._zonePool.length)
                    return (
                      (this._zonePool[this._zonePoolIndex].color =
                          l.options.overviewRulerOptions.color),
                      (this._zonePool[this._zonePoolIndex].position =
                          l.options.overviewRulerOptions.position),
                      (this._zonePool[this._zonePoolIndex].startBufferLine =
                          l.marker.line),
                      (this._zonePool[this._zonePoolIndex].endBufferLine =
                          l.marker.line),
                      void this._zones.push(
                        this._zonePool[this._zonePoolIndex++]
                      )
                    );
                  (this._zones.push({
                    color: l.options.overviewRulerOptions.color,
                    position: l.options.overviewRulerOptions.position,
                    startBufferLine: l.marker.line,
                    endBufferLine: l.marker.line,
                  }),
                  this._zonePool.push(this._zones[this._zones.length - 1]),
                  this._zonePoolIndex++);
                }
              }
              setPadding(l) {
                this._linePadding = l;
              }
              _lineIntersectsZone(l, f) {
                return f >= l.startBufferLine && f <= l.endBufferLine;
              }
              _lineAdjacentToZone(l, f, g) {
                return (
                  f >= l.startBufferLine - this._linePadding[g || 'full'] &&
                    f <= l.endBufferLine + this._linePadding[g || 'full']
                );
              }
              _addLineToZone(l, f) {
                ((l.startBufferLine = Math.min(l.startBufferLine, f)),
                (l.endBufferLine = Math.max(l.endBufferLine, f)));
              }
            }));
          },
          5744: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (o, _, C, b) {
                  var x,
                    S = arguments.length,
                    k =
                      S < 3
                        ? _
                        : b === null
                          ? (b = Object.getOwnPropertyDescriptor(_, C))
                          : b;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    k = Reflect.decorate(o, _, C, b);
                  else
                    for (var T = o.length - 1; T >= 0; T--)
                      (x = o[T]) &&
                        (k =
                          (S < 3 ? x(k) : S > 3 ? x(_, C, k) : x(_, C)) || k);
                  return (S > 3 && k && Object.defineProperty(_, C, k), k);
                },
              g =
                (this && this.__param) ||
                function (o, _) {
                  return function (C, b) {
                    _(C, b, o);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.OverviewRulerRenderer = void 0));
            const u = l(5871),
              d = l(4725),
              v = l(844),
              w = l(2585),
              p = { full: 0, left: 0, center: 0, right: 0 },
              c = { full: 0, left: 0, center: 0, right: 0 },
              n = { full: 0, left: 0, center: 0, right: 0 };
            let s = (a.OverviewRulerRenderer = class extends v.Disposable {
              get _width() {
                return this._optionsService.options.overviewRulerWidth || 0;
              }
              constructor(o, _, C, b, x, S, k) {
                var B;
                (super(),
                (this._viewportElement = o),
                (this._screenElement = _),
                (this._bufferService = C),
                (this._decorationService = b),
                (this._renderService = x),
                (this._optionsService = S),
                (this._coreBrowserService = k),
                (this._colorZoneStore = new u.ColorZoneStore()),
                (this._shouldUpdateDimensions = !0),
                (this._shouldUpdateAnchor = !0),
                (this._lastKnownBufferLength = 0),
                (this._canvas =
                    this._coreBrowserService.mainDocument.createElement(
                      'canvas'
                    )),
                this._canvas.classList.add('xterm-decoration-overview-ruler'),
                this._refreshCanvasDimensions(),
                (B = this._viewportElement.parentElement) == null ||
                    B.insertBefore(this._canvas, this._viewportElement));
                const T = this._canvas.getContext('2d');
                if (!T) throw new Error('Ctx cannot be null');
                ((this._ctx = T),
                this._registerDecorationListeners(),
                this._registerBufferChangeListeners(),
                this._registerDimensionChangeListeners(),
                this.register(
                  (0, v.toDisposable)(() => {
                    var O;
                    (O = this._canvas) == null || O.remove();
                  })
                ));
              }
              _registerDecorationListeners() {
                (this.register(
                  this._decorationService.onDecorationRegistered(() =>
                    this._queueRefresh(void 0, !0)
                  )
                ),
                this.register(
                  this._decorationService.onDecorationRemoved(() =>
                    this._queueRefresh(void 0, !0)
                  )
                ));
              }
              _registerBufferChangeListeners() {
                (this.register(
                  this._renderService.onRenderedViewportChange(() =>
                    this._queueRefresh()
                  )
                ),
                this.register(
                  this._bufferService.buffers.onBufferActivate(() => {
                    this._canvas.style.display =
                        this._bufferService.buffer ===
                        this._bufferService.buffers.alt
                          ? 'none'
                          : 'block';
                  })
                ),
                this.register(
                  this._bufferService.onScroll(() => {
                    this._lastKnownBufferLength !==
                        this._bufferService.buffers.normal.lines.length &&
                        (this._refreshDrawHeightConstants(),
                        this._refreshColorZonePadding());
                  })
                ));
              }
              _registerDimensionChangeListeners() {
                (this.register(
                  this._renderService.onRender(() => {
                    (this._containerHeight &&
                      this._containerHeight ===
                        this._screenElement.clientHeight) ||
                      (this._queueRefresh(!0),
                      (this._containerHeight =
                        this._screenElement.clientHeight));
                  })
                ),
                this.register(
                  this._optionsService.onSpecificOptionChange(
                    'overviewRulerWidth',
                    () => this._queueRefresh(!0)
                  )
                ),
                this.register(
                  this._coreBrowserService.onDprChange(() =>
                    this._queueRefresh(!0)
                  )
                ),
                this._queueRefresh(!0));
              }
              _refreshDrawConstants() {
                const o = Math.floor(this._canvas.width / 3),
                  _ = Math.ceil(this._canvas.width / 3);
                ((c.full = this._canvas.width),
                (c.left = o),
                (c.center = _),
                (c.right = o),
                this._refreshDrawHeightConstants(),
                (n.full = 0),
                (n.left = 0),
                (n.center = c.left),
                (n.right = c.left + c.center));
              }
              _refreshDrawHeightConstants() {
                p.full = Math.round(2 * this._coreBrowserService.dpr);
                const o =
                    this._canvas.height /
                    this._bufferService.buffer.lines.length,
                  _ = Math.round(
                    Math.max(Math.min(o, 12), 6) * this._coreBrowserService.dpr
                  );
                ((p.left = _), (p.center = _), (p.right = _));
              }
              _refreshColorZonePadding() {
                (this._colorZoneStore.setPadding({
                  full: Math.floor(
                    (this._bufferService.buffers.active.lines.length /
                      (this._canvas.height - 1)) *
                      p.full
                  ),
                  left: Math.floor(
                    (this._bufferService.buffers.active.lines.length /
                      (this._canvas.height - 1)) *
                      p.left
                  ),
                  center: Math.floor(
                    (this._bufferService.buffers.active.lines.length /
                      (this._canvas.height - 1)) *
                      p.center
                  ),
                  right: Math.floor(
                    (this._bufferService.buffers.active.lines.length /
                      (this._canvas.height - 1)) *
                      p.right
                  ),
                }),
                (this._lastKnownBufferLength =
                    this._bufferService.buffers.normal.lines.length));
              }
              _refreshCanvasDimensions() {
                ((this._canvas.style.width = `${this._width}px`),
                (this._canvas.width = Math.round(
                  this._width * this._coreBrowserService.dpr
                )),
                (this._canvas.style.height = `${this._screenElement.clientHeight}px`),
                (this._canvas.height = Math.round(
                  this._screenElement.clientHeight *
                      this._coreBrowserService.dpr
                )),
                this._refreshDrawConstants(),
                this._refreshColorZonePadding());
              }
              _refreshDecorations() {
                (this._shouldUpdateDimensions &&
                  this._refreshCanvasDimensions(),
                this._ctx.clearRect(
                  0,
                  0,
                  this._canvas.width,
                  this._canvas.height
                ),
                this._colorZoneStore.clear());
                for (const _ of this._decorationService.decorations)
                  this._colorZoneStore.addDecoration(_);
                this._ctx.lineWidth = 1;
                const o = this._colorZoneStore.zones;
                for (const _ of o)
                  _.position !== 'full' && this._renderColorZone(_);
                for (const _ of o)
                  _.position === 'full' && this._renderColorZone(_);
                ((this._shouldUpdateDimensions = !1),
                (this._shouldUpdateAnchor = !1));
              }
              _renderColorZone(o) {
                ((this._ctx.fillStyle = o.color),
                this._ctx.fillRect(
                  n[o.position || 'full'],
                  Math.round(
                    (this._canvas.height - 1) *
                        (o.startBufferLine /
                          this._bufferService.buffers.active.lines.length) -
                        p[o.position || 'full'] / 2
                  ),
                  c[o.position || 'full'],
                  Math.round(
                    (this._canvas.height - 1) *
                        ((o.endBufferLine - o.startBufferLine) /
                          this._bufferService.buffers.active.lines.length) +
                        p[o.position || 'full']
                  )
                ));
              }
              _queueRefresh(o, _) {
                ((this._shouldUpdateDimensions =
                  o || this._shouldUpdateDimensions),
                (this._shouldUpdateAnchor = _ || this._shouldUpdateAnchor),
                this._animationFrame === void 0 &&
                    (this._animationFrame =
                      this._coreBrowserService.window.requestAnimationFrame(
                        () => {
                          (this._refreshDecorations(),
                          (this._animationFrame = void 0));
                        }
                      )));
              }
            });
            a.OverviewRulerRenderer = s = f(
              [
                g(2, w.IBufferService),
                g(3, w.IDecorationService),
                g(4, d.IRenderService),
                g(5, w.IOptionsService),
                g(6, d.ICoreBrowserService),
              ],
              s
            );
          },
          2950: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (p, c, n, s) {
                  var o,
                    _ = arguments.length,
                    C =
                      _ < 3
                        ? c
                        : s === null
                          ? (s = Object.getOwnPropertyDescriptor(c, n))
                          : s;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    C = Reflect.decorate(p, c, n, s);
                  else
                    for (var b = p.length - 1; b >= 0; b--)
                      (o = p[b]) &&
                        (C =
                          (_ < 3 ? o(C) : _ > 3 ? o(c, n, C) : o(c, n)) || C);
                  return (_ > 3 && C && Object.defineProperty(c, n, C), C);
                },
              g =
                (this && this.__param) ||
                function (p, c) {
                  return function (n, s) {
                    c(n, s, p);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.CompositionHelper = void 0));
            const u = l(4725),
              d = l(2585),
              v = l(2584);
            let w = (a.CompositionHelper = class {
              get isComposing() {
                return this._isComposing;
              }
              constructor(p, c, n, s, o, _) {
                ((this._textarea = p),
                (this._compositionView = c),
                (this._bufferService = n),
                (this._optionsService = s),
                (this._coreService = o),
                (this._renderService = _),
                (this._isComposing = !1),
                (this._isSendingComposition = !1),
                (this._compositionPosition = { start: 0, end: 0 }),
                (this._dataAlreadySent = ''));
              }
              compositionstart() {
                ((this._isComposing = !0),
                (this._compositionPosition.start =
                    this._textarea.value.length),
                (this._compositionView.textContent = ''),
                (this._dataAlreadySent = ''),
                this._compositionView.classList.add('active'));
              }
              compositionupdate(p) {
                ((this._compositionView.textContent = p.data),
                this.updateCompositionElements(),
                setTimeout(() => {
                  this._compositionPosition.end = this._textarea.value.length;
                }, 0));
              }
              compositionend() {
                this._finalizeComposition(!0);
              }
              keydown(p) {
                if (this._isComposing || this._isSendingComposition) {
                  if (
                    p.keyCode === 229 ||
                    p.keyCode === 16 ||
                    p.keyCode === 17 ||
                    p.keyCode === 18
                  )
                    return !1;
                  this._finalizeComposition(!1);
                }
                return (
                  p.keyCode !== 229 || (this._handleAnyTextareaChanges(), !1)
                );
              }
              _finalizeComposition(p) {
                if (
                  (this._compositionView.classList.remove('active'),
                  (this._isComposing = !1),
                  p)
                ) {
                  const c = {
                    start: this._compositionPosition.start,
                    end: this._compositionPosition.end,
                  };
                  ((this._isSendingComposition = !0),
                  setTimeout(() => {
                    if (this._isSendingComposition) {
                      let n;
                      ((this._isSendingComposition = !1),
                      (c.start += this._dataAlreadySent.length),
                      (n = this._isComposing
                        ? this._textarea.value.substring(c.start, c.end)
                        : this._textarea.value.substring(c.start)),
                      n.length > 0 &&
                            this._coreService.triggerDataEvent(n, !0));
                    }
                  }, 0));
                } else {
                  this._isSendingComposition = !1;
                  const c = this._textarea.value.substring(
                    this._compositionPosition.start,
                    this._compositionPosition.end
                  );
                  this._coreService.triggerDataEvent(c, !0);
                }
              }
              _handleAnyTextareaChanges() {
                const p = this._textarea.value;
                setTimeout(() => {
                  if (!this._isComposing) {
                    const c = this._textarea.value,
                      n = c.replace(p, '');
                    ((this._dataAlreadySent = n),
                    c.length > p.length
                      ? this._coreService.triggerDataEvent(n, !0)
                      : c.length < p.length
                        ? this._coreService.triggerDataEvent(
                          `${v.C0.DEL}`,
                          !0
                        )
                        : c.length === p.length &&
                            c !== p &&
                            this._coreService.triggerDataEvent(c, !0));
                  }
                }, 0);
              }
              updateCompositionElements(p) {
                if (this._isComposing) {
                  if (this._bufferService.buffer.isCursorInViewport) {
                    const c = Math.min(
                        this._bufferService.buffer.x,
                        this._bufferService.cols - 1
                      ),
                      n = this._renderService.dimensions.css.cell.height,
                      s =
                        this._bufferService.buffer.y *
                        this._renderService.dimensions.css.cell.height,
                      o = c * this._renderService.dimensions.css.cell.width;
                    ((this._compositionView.style.left = o + 'px'),
                    (this._compositionView.style.top = s + 'px'),
                    (this._compositionView.style.height = n + 'px'),
                    (this._compositionView.style.lineHeight = n + 'px'),
                    (this._compositionView.style.fontFamily =
                        this._optionsService.rawOptions.fontFamily),
                    (this._compositionView.style.fontSize =
                        this._optionsService.rawOptions.fontSize + 'px'));
                    const _ = this._compositionView.getBoundingClientRect();
                    ((this._textarea.style.left = o + 'px'),
                    (this._textarea.style.top = s + 'px'),
                    (this._textarea.style.width =
                        Math.max(_.width, 1) + 'px'),
                    (this._textarea.style.height =
                        Math.max(_.height, 1) + 'px'),
                    (this._textarea.style.lineHeight = _.height + 'px'));
                  }
                  p || setTimeout(() => this.updateCompositionElements(!0), 0);
                }
              }
            });
            a.CompositionHelper = w = f(
              [
                g(2, d.IBufferService),
                g(3, d.IOptionsService),
                g(4, d.ICoreService),
                g(5, u.IRenderService),
              ],
              w
            );
          },
          9806: (y, a) => {
            function l(f, g, u) {
              const d = u.getBoundingClientRect(),
                v = f.getComputedStyle(u),
                w = parseInt(v.getPropertyValue('padding-left')),
                p = parseInt(v.getPropertyValue('padding-top'));
              return [g.clientX - d.left - w, g.clientY - d.top - p];
            }
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.getCoords = a.getCoordsRelativeToElement = void 0),
            (a.getCoordsRelativeToElement = l),
            (a.getCoords = function (f, g, u, d, v, w, p, c, n) {
              if (!w) return;
              const s = l(f, g, u);
              return s
                ? ((s[0] = Math.ceil((s[0] + (n ? p / 2 : 0)) / p)),
                (s[1] = Math.ceil(s[1] / c)),
                (s[0] = Math.min(Math.max(s[0], 1), d + (n ? 1 : 0))),
                (s[1] = Math.min(Math.max(s[1], 1), v)),
                s)
                : void 0;
            }));
          },
          9504: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.moveToCellSequence = void 0));
            const f = l(2584);
            function g(c, n, s, o) {
              const _ = c - u(c, s),
                C = n - u(n, s),
                b =
                  Math.abs(_ - C) -
                  (function (x, S, k) {
                    let T = 0;
                    const B = x - u(x, k),
                      O = S - u(S, k);
                    for (let A = 0; A < Math.abs(B - O); A++) {
                      const H = d(x, S) === 'A' ? -1 : 1,
                        W = k.buffer.lines.get(B + H * A);
                      W != null && W.isWrapped && T++;
                    }
                    return T;
                  })(c, n, s);
              return p(b, w(d(c, n), o));
            }
            function u(c, n) {
              let s = 0,
                o = n.buffer.lines.get(c),
                _ = o == null ? void 0 : o.isWrapped;
              for (; _ && c >= 0 && c < n.rows; )
                (s++,
                (o = n.buffer.lines.get(--c)),
                (_ = o == null ? void 0 : o.isWrapped));
              return s;
            }
            function d(c, n) {
              return c > n ? 'A' : 'B';
            }
            function v(c, n, s, o, _, C) {
              let b = c,
                x = n,
                S = '';
              for (; b !== s || x !== o; )
                ((b += _ ? 1 : -1),
                _ && b > C.cols - 1
                  ? ((S += C.buffer.translateBufferLineToString(x, !1, c, b)),
                  (b = 0),
                  (c = 0),
                  x++)
                  : !_ &&
                      b < 0 &&
                      ((S += C.buffer.translateBufferLineToString(
                        x,
                        !1,
                        0,
                        c + 1
                      )),
                      (b = C.cols - 1),
                      (c = b),
                      x--));
              return S + C.buffer.translateBufferLineToString(x, !1, c, b);
            }
            function w(c, n) {
              const s = n ? 'O' : '[';
              return f.C0.ESC + s + c;
            }
            function p(c, n) {
              c = Math.floor(c);
              let s = '';
              for (let o = 0; o < c; o++) s += n;
              return s;
            }
            a.moveToCellSequence = function (c, n, s, o) {
              const _ = s.buffer.x,
                C = s.buffer.y;
              if (!s.buffer.hasScrollback)
                return (
                  (function (S, k, T, B, O, A) {
                    return g(k, B, O, A).length === 0
                      ? ''
                      : p(v(S, k, S, k - u(k, O), !1, O).length, w('D', A));
                  })(_, C, 0, n, s, o) +
                  g(C, n, s, o) +
                  (function (S, k, T, B, O, A) {
                    let H;
                    H = g(k, B, O, A).length > 0 ? B - u(B, O) : k;
                    const W = B,
                      $ = (function (G, I, E, R, D, P) {
                        let F;
                        return (
                          (F = g(E, R, D, P).length > 0 ? R - u(R, D) : I),
                          (G < E && F <= R) || (G >= E && F < R) ? 'C' : 'D'
                        );
                      })(S, k, T, B, O, A);
                    return p(v(S, H, T, W, $ === 'C', O).length, w($, A));
                  })(_, C, c, n, s, o)
                );
              let b;
              if (C === n)
                return ((b = _ > c ? 'D' : 'C'), p(Math.abs(_ - c), w(b, o)));
              b = C > n ? 'D' : 'C';
              const x = Math.abs(C - n);
              return p(
                (function (S, k) {
                  return k.cols - S;
                })(C > n ? c : _, s) +
                  (x - 1) * s.cols +
                  1 +
                  ((C > n ? _ : c) - 1),
                w(b, o)
              );
            };
          },
          1296: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (A, H, W, $) {
                  var G,
                    I = arguments.length,
                    E =
                      I < 3
                        ? H
                        : $ === null
                          ? ($ = Object.getOwnPropertyDescriptor(H, W))
                          : $;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    E = Reflect.decorate(A, H, W, $);
                  else
                    for (var R = A.length - 1; R >= 0; R--)
                      (G = A[R]) &&
                        (E =
                          (I < 3 ? G(E) : I > 3 ? G(H, W, E) : G(H, W)) || E);
                  return (I > 3 && E && Object.defineProperty(H, W, E), E);
                },
              g =
                (this && this.__param) ||
                function (A, H) {
                  return function (W, $) {
                    H(W, $, A);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.DomRenderer = void 0));
            const u = l(3787),
              d = l(2550),
              v = l(2223),
              w = l(6171),
              p = l(6052),
              c = l(4725),
              n = l(8055),
              s = l(8460),
              o = l(844),
              _ = l(2585),
              C = 'xterm-dom-renderer-owner-',
              b = 'xterm-rows',
              x = 'xterm-fg-',
              S = 'xterm-bg-',
              k = 'xterm-focus',
              T = 'xterm-selection';
            let B = 1,
              O = (a.DomRenderer = class extends o.Disposable {
                constructor(A, H, W, $, G, I, E, R, D, P, F, U, Y) {
                  (super(),
                  (this._terminal = A),
                  (this._document = H),
                  (this._element = W),
                  (this._screenElement = $),
                  (this._viewportElement = G),
                  (this._helperContainer = I),
                  (this._linkifier2 = E),
                  (this._charSizeService = D),
                  (this._optionsService = P),
                  (this._bufferService = F),
                  (this._coreBrowserService = U),
                  (this._themeService = Y),
                  (this._terminalClass = B++),
                  (this._rowElements = []),
                  (this._selectionRenderModel = (0,
                  p.createSelectionRenderModel)()),
                  (this.onRequestRedraw = this.register(
                    new s.EventEmitter()
                  ).event),
                  (this._rowContainer = this._document.createElement('div')),
                  this._rowContainer.classList.add(b),
                  (this._rowContainer.style.lineHeight = 'normal'),
                  this._rowContainer.setAttribute('aria-hidden', 'true'),
                  this._refreshRowElements(
                    this._bufferService.cols,
                    this._bufferService.rows
                  ),
                  (this._selectionContainer =
                      this._document.createElement('div')),
                  this._selectionContainer.classList.add(T),
                  this._selectionContainer.setAttribute(
                    'aria-hidden',
                    'true'
                  ),
                  (this.dimensions = (0, w.createRenderDimensions)()),
                  this._updateDimensions(),
                  this.register(
                    this._optionsService.onOptionChange(() =>
                      this._handleOptionsChanged()
                    )
                  ),
                  this.register(
                    this._themeService.onChangeColors((z) =>
                      this._injectCss(z)
                    )
                  ),
                  this._injectCss(this._themeService.colors),
                  (this._rowFactory = R.createInstance(
                    u.DomRendererRowFactory,
                    document
                  )),
                  this._element.classList.add(C + this._terminalClass),
                  this._screenElement.appendChild(this._rowContainer),
                  this._screenElement.appendChild(this._selectionContainer),
                  this.register(
                    this._linkifier2.onShowLinkUnderline((z) =>
                      this._handleLinkHover(z)
                    )
                  ),
                  this.register(
                    this._linkifier2.onHideLinkUnderline((z) =>
                      this._handleLinkLeave(z)
                    )
                  ),
                  this.register(
                    (0, o.toDisposable)(() => {
                      (this._element.classList.remove(
                        C + this._terminalClass
                      ),
                      this._rowContainer.remove(),
                      this._selectionContainer.remove(),
                      this._widthCache.dispose(),
                      this._themeStyleElement.remove(),
                      this._dimensionsStyleElement.remove());
                    })
                  ),
                  (this._widthCache = new d.WidthCache(
                    this._document,
                    this._helperContainer
                  )),
                  this._widthCache.setFont(
                    this._optionsService.rawOptions.fontFamily,
                    this._optionsService.rawOptions.fontSize,
                    this._optionsService.rawOptions.fontWeight,
                    this._optionsService.rawOptions.fontWeightBold
                  ),
                  this._setDefaultSpacing());
                }
                _updateDimensions() {
                  const A = this._coreBrowserService.dpr;
                  ((this.dimensions.device.char.width =
                    this._charSizeService.width * A),
                  (this.dimensions.device.char.height = Math.ceil(
                    this._charSizeService.height * A
                  )),
                  (this.dimensions.device.cell.width =
                      this.dimensions.device.char.width +
                      Math.round(
                        this._optionsService.rawOptions.letterSpacing
                      )),
                  (this.dimensions.device.cell.height = Math.floor(
                    this.dimensions.device.char.height *
                        this._optionsService.rawOptions.lineHeight
                  )),
                  (this.dimensions.device.char.left = 0),
                  (this.dimensions.device.char.top = 0),
                  (this.dimensions.device.canvas.width =
                      this.dimensions.device.cell.width *
                      this._bufferService.cols),
                  (this.dimensions.device.canvas.height =
                      this.dimensions.device.cell.height *
                      this._bufferService.rows),
                  (this.dimensions.css.canvas.width = Math.round(
                    this.dimensions.device.canvas.width / A
                  )),
                  (this.dimensions.css.canvas.height = Math.round(
                    this.dimensions.device.canvas.height / A
                  )),
                  (this.dimensions.css.cell.width =
                      this.dimensions.css.canvas.width /
                      this._bufferService.cols),
                  (this.dimensions.css.cell.height =
                      this.dimensions.css.canvas.height /
                      this._bufferService.rows));
                  for (const W of this._rowElements)
                    ((W.style.width = `${this.dimensions.css.canvas.width}px`),
                    (W.style.height = `${this.dimensions.css.cell.height}px`),
                    (W.style.lineHeight = `${this.dimensions.css.cell.height}px`),
                    (W.style.overflow = 'hidden'));
                  this._dimensionsStyleElement ||
                    ((this._dimensionsStyleElement =
                      this._document.createElement('style')),
                    this._screenElement.appendChild(
                      this._dimensionsStyleElement
                    ));
                  const H = `${this._terminalSelector} .${b} span { display: inline-block; height: 100%; vertical-align: top;}`;
                  ((this._dimensionsStyleElement.textContent = H),
                  (this._selectionContainer.style.height =
                      this._viewportElement.style.height),
                  (this._screenElement.style.width = `${this.dimensions.css.canvas.width}px`),
                  (this._screenElement.style.height = `${this.dimensions.css.canvas.height}px`));
                }
                _injectCss(A) {
                  this._themeStyleElement ||
                    ((this._themeStyleElement =
                      this._document.createElement('style')),
                    this._screenElement.appendChild(this._themeStyleElement));
                  let H = `${this._terminalSelector} .${b} { color: ${A.foreground.css}; font-family: ${this._optionsService.rawOptions.fontFamily}; font-size: ${this._optionsService.rawOptions.fontSize}px; font-kerning: none; white-space: pre}`;
                  ((H += `${this._terminalSelector} .${b} .xterm-dim { color: ${n.color.multiplyOpacity(A.foreground, 0.5).css};}`),
                  (H += `${this._terminalSelector} span:not(.xterm-bold) { font-weight: ${this._optionsService.rawOptions.fontWeight};}${this._terminalSelector} span.xterm-bold { font-weight: ${this._optionsService.rawOptions.fontWeightBold};}${this._terminalSelector} span.xterm-italic { font-style: italic;}`));
                  const W = `blink_underline_${this._terminalClass}`,
                    $ = `blink_bar_${this._terminalClass}`,
                    G = `blink_block_${this._terminalClass}`;
                  ((H += `@keyframes ${W} { 50% {  border-bottom-style: hidden; }}`),
                  (H += `@keyframes ${$} { 50% {  box-shadow: none; }}`),
                  (H += `@keyframes ${G} { 0% {  background-color: ${A.cursor.css};  color: ${A.cursorAccent.css}; } 50% {  background-color: inherit;  color: ${A.cursor.css}; }}`),
                  (H += `${this._terminalSelector} .${b}.${k} .xterm-cursor.xterm-cursor-blink.xterm-cursor-underline { animation: ${W} 1s step-end infinite;}${this._terminalSelector} .${b}.${k} .xterm-cursor.xterm-cursor-blink.xterm-cursor-bar { animation: ${$} 1s step-end infinite;}${this._terminalSelector} .${b}.${k} .xterm-cursor.xterm-cursor-blink.xterm-cursor-block { animation: ${G} 1s step-end infinite;}${this._terminalSelector} .${b} .xterm-cursor.xterm-cursor-block { background-color: ${A.cursor.css}; color: ${A.cursorAccent.css};}${this._terminalSelector} .${b} .xterm-cursor.xterm-cursor-block:not(.xterm-cursor-blink) { background-color: ${A.cursor.css} !important; color: ${A.cursorAccent.css} !important;}${this._terminalSelector} .${b} .xterm-cursor.xterm-cursor-outline { outline: 1px solid ${A.cursor.css}; outline-offset: -1px;}${this._terminalSelector} .${b} .xterm-cursor.xterm-cursor-bar { box-shadow: ${this._optionsService.rawOptions.cursorWidth}px 0 0 ${A.cursor.css} inset;}${this._terminalSelector} .${b} .xterm-cursor.xterm-cursor-underline { border-bottom: 1px ${A.cursor.css}; border-bottom-style: solid; height: calc(100% - 1px);}`),
                  (H += `${this._terminalSelector} .${T} { position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none;}${this._terminalSelector}.focus .${T} div { position: absolute; background-color: ${A.selectionBackgroundOpaque.css};}${this._terminalSelector} .${T} div { position: absolute; background-color: ${A.selectionInactiveBackgroundOpaque.css};}`));
                  for (const [I, E] of A.ansi.entries())
                    H += `${this._terminalSelector} .${x}${I} { color: ${E.css}; }${this._terminalSelector} .${x}${I}.xterm-dim { color: ${n.color.multiplyOpacity(E, 0.5).css}; }${this._terminalSelector} .${S}${I} { background-color: ${E.css}; }`;
                  ((H += `${this._terminalSelector} .${x}${v.INVERTED_DEFAULT_COLOR} { color: ${n.color.opaque(A.background).css}; }${this._terminalSelector} .${x}${v.INVERTED_DEFAULT_COLOR}.xterm-dim { color: ${n.color.multiplyOpacity(n.color.opaque(A.background), 0.5).css}; }${this._terminalSelector} .${S}${v.INVERTED_DEFAULT_COLOR} { background-color: ${A.foreground.css}; }`),
                  (this._themeStyleElement.textContent = H));
                }
                _setDefaultSpacing() {
                  const A =
                    this.dimensions.css.cell.width -
                    this._widthCache.get('W', !1, !1);
                  ((this._rowContainer.style.letterSpacing = `${A}px`),
                  (this._rowFactory.defaultSpacing = A));
                }
                handleDevicePixelRatioChange() {
                  (this._updateDimensions(),
                  this._widthCache.clear(),
                  this._setDefaultSpacing());
                }
                _refreshRowElements(A, H) {
                  for (let W = this._rowElements.length; W <= H; W++) {
                    const $ = this._document.createElement('div');
                    (this._rowContainer.appendChild($),
                    this._rowElements.push($));
                  }
                  for (; this._rowElements.length > H; )
                    this._rowContainer.removeChild(this._rowElements.pop());
                }
                handleResize(A, H) {
                  (this._refreshRowElements(A, H),
                  this._updateDimensions(),
                  this.handleSelectionChanged(
                    this._selectionRenderModel.selectionStart,
                    this._selectionRenderModel.selectionEnd,
                    this._selectionRenderModel.columnSelectMode
                  ));
                }
                handleCharSizeChanged() {
                  (this._updateDimensions(),
                  this._widthCache.clear(),
                  this._setDefaultSpacing());
                }
                handleBlur() {
                  (this._rowContainer.classList.remove(k),
                  this.renderRows(0, this._bufferService.rows - 1));
                }
                handleFocus() {
                  (this._rowContainer.classList.add(k),
                  this.renderRows(
                    this._bufferService.buffer.y,
                    this._bufferService.buffer.y
                  ));
                }
                handleSelectionChanged(A, H, W) {
                  if (
                    (this._selectionContainer.replaceChildren(),
                    this._rowFactory.handleSelectionChanged(A, H, W),
                    this.renderRows(0, this._bufferService.rows - 1),
                    !A || !H)
                  )
                    return;
                  this._selectionRenderModel.update(this._terminal, A, H, W);
                  const $ = this._selectionRenderModel.viewportStartRow,
                    G = this._selectionRenderModel.viewportEndRow,
                    I = this._selectionRenderModel.viewportCappedStartRow,
                    E = this._selectionRenderModel.viewportCappedEndRow;
                  if (I >= this._bufferService.rows || E < 0) return;
                  const R = this._document.createDocumentFragment();
                  if (W) {
                    const D = A[0] > H[0];
                    R.appendChild(
                      this._createSelectionElement(
                        I,
                        D ? H[0] : A[0],
                        D ? A[0] : H[0],
                        E - I + 1
                      )
                    );
                  } else {
                    const D = $ === I ? A[0] : 0,
                      P = I === G ? H[0] : this._bufferService.cols;
                    R.appendChild(this._createSelectionElement(I, D, P));
                    const F = E - I - 1;
                    if (
                      (R.appendChild(
                        this._createSelectionElement(
                          I + 1,
                          0,
                          this._bufferService.cols,
                          F
                        )
                      ),
                      I !== E)
                    ) {
                      const U = G === E ? H[0] : this._bufferService.cols;
                      R.appendChild(this._createSelectionElement(E, 0, U));
                    }
                  }
                  this._selectionContainer.appendChild(R);
                }
                _createSelectionElement(A, H, W, $ = 1) {
                  const G = this._document.createElement('div'),
                    I = H * this.dimensions.css.cell.width;
                  let E = this.dimensions.css.cell.width * (W - H);
                  return (
                    I + E > this.dimensions.css.canvas.width &&
                      (E = this.dimensions.css.canvas.width - I),
                    (G.style.height =
                      $ * this.dimensions.css.cell.height + 'px'),
                    (G.style.top = A * this.dimensions.css.cell.height + 'px'),
                    (G.style.left = `${I}px`),
                    (G.style.width = `${E}px`),
                    G
                  );
                }
                handleCursorMove() {}
                _handleOptionsChanged() {
                  (this._updateDimensions(),
                  this._injectCss(this._themeService.colors),
                  this._widthCache.setFont(
                    this._optionsService.rawOptions.fontFamily,
                    this._optionsService.rawOptions.fontSize,
                    this._optionsService.rawOptions.fontWeight,
                    this._optionsService.rawOptions.fontWeightBold
                  ),
                  this._setDefaultSpacing());
                }
                clear() {
                  for (const A of this._rowElements) A.replaceChildren();
                }
                renderRows(A, H) {
                  const W = this._bufferService.buffer,
                    $ = W.ybase + W.y,
                    G = Math.min(W.x, this._bufferService.cols - 1),
                    I = this._optionsService.rawOptions.cursorBlink,
                    E = this._optionsService.rawOptions.cursorStyle,
                    R = this._optionsService.rawOptions.cursorInactiveStyle;
                  for (let D = A; D <= H; D++) {
                    const P = D + W.ydisp,
                      F = this._rowElements[D],
                      U = W.lines.get(P);
                    if (!F || !U) break;
                    F.replaceChildren(
                      ...this._rowFactory.createRow(
                        U,
                        P,
                        P === $,
                        E,
                        R,
                        G,
                        I,
                        this.dimensions.css.cell.width,
                        this._widthCache,
                        -1,
                        -1
                      )
                    );
                  }
                }
                get _terminalSelector() {
                  return `.${C}${this._terminalClass}`;
                }
                _handleLinkHover(A) {
                  this._setCellUnderline(A.x1, A.x2, A.y1, A.y2, A.cols, !0);
                }
                _handleLinkLeave(A) {
                  this._setCellUnderline(A.x1, A.x2, A.y1, A.y2, A.cols, !1);
                }
                _setCellUnderline(A, H, W, $, G, I) {
                  (W < 0 && (A = 0), $ < 0 && (H = 0));
                  const E = this._bufferService.rows - 1;
                  ((W = Math.max(Math.min(W, E), 0)),
                  ($ = Math.max(Math.min($, E), 0)),
                  (G = Math.min(G, this._bufferService.cols)));
                  const R = this._bufferService.buffer,
                    D = R.ybase + R.y,
                    P = Math.min(R.x, G - 1),
                    F = this._optionsService.rawOptions.cursorBlink,
                    U = this._optionsService.rawOptions.cursorStyle,
                    Y = this._optionsService.rawOptions.cursorInactiveStyle;
                  for (let z = W; z <= $; ++z) {
                    const M = z + R.ydisp,
                      L = this._rowElements[z],
                      j = R.lines.get(M);
                    if (!L || !j) break;
                    L.replaceChildren(
                      ...this._rowFactory.createRow(
                        j,
                        M,
                        M === D,
                        U,
                        Y,
                        P,
                        F,
                        this.dimensions.css.cell.width,
                        this._widthCache,
                        I ? (z === W ? A : 0) : -1,
                        I ? (z === $ ? H : G) - 1 : -1
                      )
                    );
                  }
                }
              });
            a.DomRenderer = O = f(
              [
                g(7, _.IInstantiationService),
                g(8, c.ICharSizeService),
                g(9, _.IOptionsService),
                g(10, _.IBufferService),
                g(11, c.ICoreBrowserService),
                g(12, c.IThemeService),
              ],
              O
            );
          },
          3787: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (b, x, S, k) {
                  var T,
                    B = arguments.length,
                    O =
                      B < 3
                        ? x
                        : k === null
                          ? (k = Object.getOwnPropertyDescriptor(x, S))
                          : k;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    O = Reflect.decorate(b, x, S, k);
                  else
                    for (var A = b.length - 1; A >= 0; A--)
                      (T = b[A]) &&
                        (O =
                          (B < 3 ? T(O) : B > 3 ? T(x, S, O) : T(x, S)) || O);
                  return (B > 3 && O && Object.defineProperty(x, S, O), O);
                },
              g =
                (this && this.__param) ||
                function (b, x) {
                  return function (S, k) {
                    x(S, k, b);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.DomRendererRowFactory = void 0));
            const u = l(2223),
              d = l(643),
              v = l(511),
              w = l(2585),
              p = l(8055),
              c = l(4725),
              n = l(4269),
              s = l(6171),
              o = l(3734);
            let _ = (a.DomRendererRowFactory = class {
              constructor(b, x, S, k, T, B, O) {
                ((this._document = b),
                (this._characterJoinerService = x),
                (this._optionsService = S),
                (this._coreBrowserService = k),
                (this._coreService = T),
                (this._decorationService = B),
                (this._themeService = O),
                (this._workCell = new v.CellData()),
                (this._columnSelectMode = !1),
                (this.defaultSpacing = 0));
              }
              handleSelectionChanged(b, x, S) {
                ((this._selectionStart = b),
                (this._selectionEnd = x),
                (this._columnSelectMode = S));
              }
              createRow(b, x, S, k, T, B, O, A, H, W, $) {
                const G = [],
                  I = this._characterJoinerService.getJoinedCharacters(x),
                  E = this._themeService.colors;
                let R,
                  D = b.getNoBgTrimmedLength();
                S && D < B + 1 && (D = B + 1);
                let P = 0,
                  F = '',
                  U = 0,
                  Y = 0,
                  z = 0,
                  M = !1,
                  L = 0,
                  j = !1,
                  N = 0;
                const X = [],
                  q = W !== -1 && $ !== -1;
                for (let ee = 0; ee < D; ee++) {
                  b.loadCell(ee, this._workCell);
                  let de = this._workCell.getWidth();
                  if (de === 0) continue;
                  let fe = !1,
                    Pe = ee,
                    J = this._workCell;
                  if (I.length > 0 && ee === I[0][0]) {
                    fe = !0;
                    const le = I.shift();
                    ((J = new n.JoinedCellData(
                      this._workCell,
                      b.translateToString(!0, le[0], le[1]),
                      le[1] - le[0]
                    )),
                    (Pe = le[1] - 1),
                    (de = J.getWidth()));
                  }
                  const Br = this._isCellInSelection(ee, x),
                    Vs = S && ee === B,
                    Ks = q && ee >= W && ee <= $;
                  let qs = !1;
                  this._decorationService.forEachDecorationAtCell(
                    ee,
                    x,
                    void 0,
                    (le) => {
                      qs = !0;
                    }
                  );
                  let Di = J.getChars() || d.WHITESPACE_CELL_CHAR;
                  if (
                    (Di === ' ' &&
                      (J.isUnderline() || J.isOverline()) &&
                      (Di = ' '),
                    (N = de * A - H.get(Di, J.isBold(), J.isItalic())),
                    R)
                  ) {
                    if (
                      P &&
                      ((Br && j) || (!Br && !j && J.bg === U)) &&
                      ((Br && j && E.selectionForeground) || J.fg === Y) &&
                      J.extended.ext === z &&
                      Ks === M &&
                      N === L &&
                      !Vs &&
                      !fe &&
                      !qs
                    ) {
                      (J.isInvisible()
                        ? (F += d.WHITESPACE_CELL_CHAR)
                        : (F += Di),
                      P++);
                      continue;
                    }
                    (P && (R.textContent = F),
                    (R = this._document.createElement('span')),
                    (P = 0),
                    (F = ''));
                  } else R = this._document.createElement('span');
                  if (
                    ((U = J.bg),
                    (Y = J.fg),
                    (z = J.extended.ext),
                    (M = Ks),
                    (L = N),
                    (j = Br),
                    fe && B >= ee && B <= Pe && (B = ee),
                    !this._coreService.isCursorHidden &&
                      Vs &&
                      this._coreService.isCursorInitialized)
                  ) {
                    if (
                      (X.push('xterm-cursor'),
                      this._coreBrowserService.isFocused)
                    )
                      (O && X.push('xterm-cursor-blink'),
                      X.push(
                        k === 'bar'
                          ? 'xterm-cursor-bar'
                          : k === 'underline'
                            ? 'xterm-cursor-underline'
                            : 'xterm-cursor-block'
                      ));
                    else if (T)
                      switch (T) {
                      case 'outline':
                        X.push('xterm-cursor-outline');
                        break;
                      case 'block':
                        X.push('xterm-cursor-block');
                        break;
                      case 'bar':
                        X.push('xterm-cursor-bar');
                        break;
                      case 'underline':
                        X.push('xterm-cursor-underline');
                      }
                  }
                  if (
                    (J.isBold() && X.push('xterm-bold'),
                    J.isItalic() && X.push('xterm-italic'),
                    J.isDim() && X.push('xterm-dim'),
                    (F = J.isInvisible()
                      ? d.WHITESPACE_CELL_CHAR
                      : J.getChars() || d.WHITESPACE_CELL_CHAR),
                    J.isUnderline() &&
                      (X.push(`xterm-underline-${J.extended.underlineStyle}`),
                      F === ' ' && (F = ' '),
                      !J.isUnderlineColorDefault()))
                  )
                    if (J.isUnderlineColorRGB())
                      R.style.textDecorationColor = `rgb(${o.AttributeData.toColorRGB(J.getUnderlineColor()).join(',')})`;
                    else {
                      let le = J.getUnderlineColor();
                      (this._optionsService.rawOptions
                        .drawBoldTextInBrightColors &&
                        J.isBold() &&
                        le < 8 &&
                        (le += 8),
                      (R.style.textDecorationColor = E.ansi[le].css));
                    }
                  (J.isOverline() &&
                    (X.push('xterm-overline'), F === ' ' && (F = ' ')),
                  J.isStrikethrough() && X.push('xterm-strikethrough'),
                  Ks && (R.style.textDecoration = 'underline'));
                  let Ve = J.getFgColor(),
                    Or = J.getFgColorMode(),
                    ot = J.getBgColor(),
                    Ir = J.getBgColorMode();
                  const Gs = !!J.isInverse();
                  if (Gs) {
                    const le = Ve;
                    ((Ve = ot), (ot = le));
                    const zh = Or;
                    ((Or = Ir), (Ir = zh));
                  }
                  let Ct,
                    Ri,
                    bt,
                    Hr = !1;
                  switch (
                    (this._decorationService.forEachDecorationAtCell(
                      ee,
                      x,
                      void 0,
                      (le) => {
                        (le.options.layer !== 'top' && Hr) ||
                          (le.backgroundColorRGB &&
                            ((Ir = 50331648),
                            (ot = (le.backgroundColorRGB.rgba >> 8) & 16777215),
                            (Ct = le.backgroundColorRGB)),
                          le.foregroundColorRGB &&
                            ((Or = 50331648),
                            (Ve = (le.foregroundColorRGB.rgba >> 8) & 16777215),
                            (Ri = le.foregroundColorRGB)),
                          (Hr = le.options.layer === 'top'));
                      }
                    ),
                    !Hr &&
                      Br &&
                      ((Ct = this._coreBrowserService.isFocused
                        ? E.selectionBackgroundOpaque
                        : E.selectionInactiveBackgroundOpaque),
                      (ot = (Ct.rgba >> 8) & 16777215),
                      (Ir = 50331648),
                      (Hr = !0),
                      E.selectionForeground &&
                        ((Or = 50331648),
                        (Ve = (E.selectionForeground.rgba >> 8) & 16777215),
                        (Ri = E.selectionForeground))),
                    Hr && X.push('xterm-decoration-top'),
                    Ir)
                  ) {
                  case 16777216:
                  case 33554432:
                    ((bt = E.ansi[ot]), X.push(`xterm-bg-${ot}`));
                    break;
                  case 50331648:
                    ((bt = p.channels.toColor(
                      ot >> 16,
                      (ot >> 8) & 255,
                      255 & ot
                    )),
                    this._addStyle(
                      R,
                      `background-color:#${C((ot >>> 0).toString(16), '0', 6)}`
                    ));
                    break;
                  default:
                    Gs
                      ? ((bt = E.foreground),
                      X.push(`xterm-bg-${u.INVERTED_DEFAULT_COLOR}`))
                      : (bt = E.background);
                  }
                  switch (
                    (Ct ||
                      (J.isDim() && (Ct = p.color.multiplyOpacity(bt, 0.5))),
                    Or)
                  ) {
                  case 16777216:
                  case 33554432:
                    (J.isBold() &&
                        Ve < 8 &&
                        this._optionsService.rawOptions
                          .drawBoldTextInBrightColors &&
                        (Ve += 8),
                    this._applyMinimumContrast(
                      R,
                      bt,
                      E.ansi[Ve],
                      J,
                      Ct,
                      void 0
                    ) || X.push(`xterm-fg-${Ve}`));
                    break;
                  case 50331648:
                    const le = p.channels.toColor(
                      (Ve >> 16) & 255,
                      (Ve >> 8) & 255,
                      255 & Ve
                    );
                    this._applyMinimumContrast(R, bt, le, J, Ct, Ri) ||
                        this._addStyle(
                          R,
                          `color:#${C(Ve.toString(16), '0', 6)}`
                        );
                    break;
                  default:
                    this._applyMinimumContrast(
                      R,
                      bt,
                      E.foreground,
                      J,
                      Ct,
                      Ri
                    ) ||
                        (Gs && X.push(`xterm-fg-${u.INVERTED_DEFAULT_COLOR}`));
                  }
                  (X.length && ((R.className = X.join(' ')), (X.length = 0)),
                  Vs || fe || qs ? (R.textContent = F) : P++,
                  N !== this.defaultSpacing &&
                      (R.style.letterSpacing = `${N}px`),
                  G.push(R),
                  (ee = Pe));
                }
                return (R && P && (R.textContent = F), G);
              }
              _applyMinimumContrast(b, x, S, k, T, B) {
                if (
                  this._optionsService.rawOptions.minimumContrastRatio === 1 ||
                  (0, s.treatGlyphAsBackgroundColor)(k.getCode())
                )
                  return !1;
                const O = this._getContrastCache(k);
                let A;
                if (
                  (T || B || (A = O.getColor(x.rgba, S.rgba)), A === void 0)
                ) {
                  const H =
                    this._optionsService.rawOptions.minimumContrastRatio /
                    (k.isDim() ? 2 : 1);
                  ((A = p.color.ensureContrastRatio(T || x, B || S, H)),
                  O.setColor((T || x).rgba, (B || S).rgba, A ?? null));
                }
                return !!A && (this._addStyle(b, `color:${A.css}`), !0);
              }
              _getContrastCache(b) {
                return b.isDim()
                  ? this._themeService.colors.halfContrastCache
                  : this._themeService.colors.contrastCache;
              }
              _addStyle(b, x) {
                b.setAttribute(
                  'style',
                  `${b.getAttribute('style') || ''}${x};`
                );
              }
              _isCellInSelection(b, x) {
                const S = this._selectionStart,
                  k = this._selectionEnd;
                return (
                  !(!S || !k) &&
                  (this._columnSelectMode
                    ? S[0] <= k[0]
                      ? b >= S[0] && x >= S[1] && b < k[0] && x <= k[1]
                      : b < S[0] && x >= S[1] && b >= k[0] && x <= k[1]
                    : (x > S[1] && x < k[1]) ||
                      (S[1] === k[1] && x === S[1] && b >= S[0] && b < k[0]) ||
                      (S[1] < k[1] && x === k[1] && b < k[0]) ||
                      (S[1] < k[1] && x === S[1] && b >= S[0]))
                );
              }
            });
            function C(b, x, S) {
              for (; b.length < S; ) b = x + b;
              return b;
            }
            a.DomRendererRowFactory = _ = f(
              [
                g(1, c.ICharacterJoinerService),
                g(2, w.IOptionsService),
                g(3, c.ICoreBrowserService),
                g(4, w.ICoreService),
                g(5, w.IDecorationService),
                g(6, c.IThemeService),
              ],
              _
            );
          },
          2550: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.WidthCache = void 0),
            (a.WidthCache = class {
              constructor(l, f) {
                ((this._flat = new Float32Array(256)),
                (this._font = ''),
                (this._fontSize = 0),
                (this._weight = 'normal'),
                (this._weightBold = 'bold'),
                (this._measureElements = []),
                (this._container = l.createElement('div')),
                this._container.classList.add(
                  'xterm-width-cache-measure-container'
                ),
                this._container.setAttribute('aria-hidden', 'true'),
                (this._container.style.whiteSpace = 'pre'),
                (this._container.style.fontKerning = 'none'));
                const g = l.createElement('span');
                g.classList.add('xterm-char-measure-element');
                const u = l.createElement('span');
                (u.classList.add('xterm-char-measure-element'),
                (u.style.fontWeight = 'bold'));
                const d = l.createElement('span');
                (d.classList.add('xterm-char-measure-element'),
                (d.style.fontStyle = 'italic'));
                const v = l.createElement('span');
                (v.classList.add('xterm-char-measure-element'),
                (v.style.fontWeight = 'bold'),
                (v.style.fontStyle = 'italic'),
                (this._measureElements = [g, u, d, v]),
                this._container.appendChild(g),
                this._container.appendChild(u),
                this._container.appendChild(d),
                this._container.appendChild(v),
                f.appendChild(this._container),
                this.clear());
              }
              dispose() {
                (this._container.remove(),
                (this._measureElements.length = 0),
                (this._holey = void 0));
              }
              clear() {
                (this._flat.fill(-9999), (this._holey = new Map()));
              }
              setFont(l, f, g, u) {
                (l === this._font &&
                    f === this._fontSize &&
                    g === this._weight &&
                    u === this._weightBold) ||
                    ((this._font = l),
                    (this._fontSize = f),
                    (this._weight = g),
                    (this._weightBold = u),
                    (this._container.style.fontFamily = this._font),
                    (this._container.style.fontSize = `${this._fontSize}px`),
                    (this._measureElements[0].style.fontWeight = `${g}`),
                    (this._measureElements[1].style.fontWeight = `${u}`),
                    (this._measureElements[2].style.fontWeight = `${g}`),
                    (this._measureElements[3].style.fontWeight = `${u}`),
                    this.clear());
              }
              get(l, f, g) {
                let u = 0;
                if (
                  !f &&
                    !g &&
                    l.length === 1 &&
                    (u = l.charCodeAt(0)) < 256
                ) {
                  if (this._flat[u] !== -9999) return this._flat[u];
                  const w = this._measure(l, 0);
                  return (w > 0 && (this._flat[u] = w), w);
                }
                let d = l;
                (f && (d += 'B'), g && (d += 'I'));
                let v = this._holey.get(d);
                if (v === void 0) {
                  let w = 0;
                  (f && (w |= 1),
                  g && (w |= 2),
                  (v = this._measure(l, w)),
                  v > 0 && this._holey.set(d, v));
                }
                return v;
              }
              _measure(l, f) {
                const g = this._measureElements[f];
                return ((g.textContent = l.repeat(32)), g.offsetWidth / 32);
              }
            }));
          },
          2223: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.TEXT_BASELINE =
                a.DIM_OPACITY =
                a.INVERTED_DEFAULT_COLOR =
                  void 0));
            const f = l(6114);
            ((a.INVERTED_DEFAULT_COLOR = 257),
            (a.DIM_OPACITY = 0.5),
            (a.TEXT_BASELINE =
                f.isFirefox || f.isLegacyEdge ? 'bottom' : 'ideographic'));
          },
          6171: (y, a) => {
            function l(g) {
              return 57508 <= g && g <= 57558;
            }
            function f(g) {
              return (
                (g >= 128512 && g <= 128591) ||
                (g >= 127744 && g <= 128511) ||
                (g >= 128640 && g <= 128767) ||
                (g >= 9728 && g <= 9983) ||
                (g >= 9984 && g <= 10175) ||
                (g >= 65024 && g <= 65039) ||
                (g >= 129280 && g <= 129535) ||
                (g >= 127462 && g <= 127487)
              );
            }
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.computeNextVariantOffset =
                a.createRenderDimensions =
                a.treatGlyphAsBackgroundColor =
                a.allowRescaling =
                a.isEmoji =
                a.isRestrictedPowerlineGlyph =
                a.isPowerlineGlyph =
                a.throwIfFalsy =
                  void 0),
            (a.throwIfFalsy = function (g) {
              if (!g) throw new Error('value must not be falsy');
              return g;
            }),
            (a.isPowerlineGlyph = l),
            (a.isRestrictedPowerlineGlyph = function (g) {
              return 57520 <= g && g <= 57527;
            }),
            (a.isEmoji = f),
            (a.allowRescaling = function (g, u, d, v) {
              return (
                u === 1 &&
                  d > Math.ceil(1.5 * v) &&
                  g !== void 0 &&
                  g > 255 &&
                  !f(g) &&
                  !l(g) &&
                  !(function (w) {
                    return 57344 <= w && w <= 63743;
                  })(g)
              );
            }),
            (a.treatGlyphAsBackgroundColor = function (g) {
              return (
                l(g) ||
                  (function (u) {
                    return 9472 <= u && u <= 9631;
                  })(g)
              );
            }),
            (a.createRenderDimensions = function () {
              return {
                css: {
                  canvas: { width: 0, height: 0 },
                  cell: { width: 0, height: 0 },
                },
                device: {
                  canvas: { width: 0, height: 0 },
                  cell: { width: 0, height: 0 },
                  char: { width: 0, height: 0, left: 0, top: 0 },
                },
              };
            }),
            (a.computeNextVariantOffset = function (g, u, d = 0) {
              return (g - (2 * Math.round(u) - d)) % (2 * Math.round(u));
            }));
          },
          6052: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.createSelectionRenderModel = void 0));
            class l {
              constructor() {
                this.clear();
              }
              clear() {
                ((this.hasSelection = !1),
                (this.columnSelectMode = !1),
                (this.viewportStartRow = 0),
                (this.viewportEndRow = 0),
                (this.viewportCappedStartRow = 0),
                (this.viewportCappedEndRow = 0),
                (this.startCol = 0),
                (this.endCol = 0),
                (this.selectionStart = void 0),
                (this.selectionEnd = void 0));
              }
              update(g, u, d, v = !1) {
                if (
                  ((this.selectionStart = u),
                  (this.selectionEnd = d),
                  !u || !d || (u[0] === d[0] && u[1] === d[1]))
                )
                  return void this.clear();
                const w = g.buffers.active.ydisp,
                  p = u[1] - w,
                  c = d[1] - w,
                  n = Math.max(p, 0),
                  s = Math.min(c, g.rows - 1);
                n >= g.rows || s < 0
                  ? this.clear()
                  : ((this.hasSelection = !0),
                  (this.columnSelectMode = v),
                  (this.viewportStartRow = p),
                  (this.viewportEndRow = c),
                  (this.viewportCappedStartRow = n),
                  (this.viewportCappedEndRow = s),
                  (this.startCol = u[0]),
                  (this.endCol = d[0]));
              }
              isCellSelected(g, u, d) {
                return (
                  !!this.hasSelection &&
                  ((d -= g.buffer.active.viewportY),
                  this.columnSelectMode
                    ? this.startCol <= this.endCol
                      ? u >= this.startCol &&
                        d >= this.viewportCappedStartRow &&
                        u < this.endCol &&
                        d <= this.viewportCappedEndRow
                      : u < this.startCol &&
                        d >= this.viewportCappedStartRow &&
                        u >= this.endCol &&
                        d <= this.viewportCappedEndRow
                    : (d > this.viewportStartRow && d < this.viewportEndRow) ||
                      (this.viewportStartRow === this.viewportEndRow &&
                        d === this.viewportStartRow &&
                        u >= this.startCol &&
                        u < this.endCol) ||
                      (this.viewportStartRow < this.viewportEndRow &&
                        d === this.viewportEndRow &&
                        u < this.endCol) ||
                      (this.viewportStartRow < this.viewportEndRow &&
                        d === this.viewportStartRow &&
                        u >= this.startCol))
                );
              }
            }
            a.createSelectionRenderModel = function () {
              return new l();
            };
          },
          456: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.SelectionModel = void 0),
            (a.SelectionModel = class {
              constructor(l) {
                ((this._bufferService = l),
                (this.isSelectAllActive = !1),
                (this.selectionStartLength = 0));
              }
              clearSelection() {
                ((this.selectionStart = void 0),
                (this.selectionEnd = void 0),
                (this.isSelectAllActive = !1),
                (this.selectionStartLength = 0));
              }
              get finalSelectionStart() {
                return this.isSelectAllActive
                  ? [0, 0]
                  : this.selectionEnd &&
                        this.selectionStart &&
                        this.areSelectionValuesReversed()
                    ? this.selectionEnd
                    : this.selectionStart;
              }
              get finalSelectionEnd() {
                if (this.isSelectAllActive)
                  return [
                    this._bufferService.cols,
                    this._bufferService.buffer.ybase +
                        this._bufferService.rows -
                        1,
                  ];
                if (this.selectionStart) {
                  if (
                    !this.selectionEnd ||
                      this.areSelectionValuesReversed()
                  ) {
                    const l =
                        this.selectionStart[0] + this.selectionStartLength;
                    return l > this._bufferService.cols
                      ? l % this._bufferService.cols == 0
                        ? [
                          this._bufferService.cols,
                          this.selectionStart[1] +
                                Math.floor(l / this._bufferService.cols) -
                                1,
                        ]
                        : [
                          l % this._bufferService.cols,
                          this.selectionStart[1] +
                                Math.floor(l / this._bufferService.cols),
                        ]
                      : [l, this.selectionStart[1]];
                  }
                  if (
                    this.selectionStartLength &&
                      this.selectionEnd[1] === this.selectionStart[1]
                  ) {
                    const l =
                        this.selectionStart[0] + this.selectionStartLength;
                    return l > this._bufferService.cols
                      ? [
                        l % this._bufferService.cols,
                        this.selectionStart[1] +
                              Math.floor(l / this._bufferService.cols),
                      ]
                      : [
                        Math.max(l, this.selectionEnd[0]),
                        this.selectionEnd[1],
                      ];
                  }
                  return this.selectionEnd;
                }
              }
              areSelectionValuesReversed() {
                const l = this.selectionStart,
                  f = this.selectionEnd;
                return (
                  !(!l || !f) &&
                    (l[1] > f[1] || (l[1] === f[1] && l[0] > f[0]))
                );
              }
              handleTrim(l) {
                return (
                  this.selectionStart && (this.selectionStart[1] -= l),
                  this.selectionEnd && (this.selectionEnd[1] -= l),
                  this.selectionEnd && this.selectionEnd[1] < 0
                    ? (this.clearSelection(), !0)
                    : (this.selectionStart &&
                          this.selectionStart[1] < 0 &&
                          (this.selectionStart[1] = 0),
                    !1)
                );
              }
            }));
          },
          428: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (s, o, _, C) {
                  var b,
                    x = arguments.length,
                    S =
                      x < 3
                        ? o
                        : C === null
                          ? (C = Object.getOwnPropertyDescriptor(o, _))
                          : C;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    S = Reflect.decorate(s, o, _, C);
                  else
                    for (var k = s.length - 1; k >= 0; k--)
                      (b = s[k]) &&
                        (S =
                          (x < 3 ? b(S) : x > 3 ? b(o, _, S) : b(o, _)) || S);
                  return (x > 3 && S && Object.defineProperty(o, _, S), S);
                },
              g =
                (this && this.__param) ||
                function (s, o) {
                  return function (_, C) {
                    o(_, C, s);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.CharSizeService = void 0));
            const u = l(2585),
              d = l(8460),
              v = l(844);
            let w = (a.CharSizeService = class extends v.Disposable {
              get hasValidSize() {
                return this.width > 0 && this.height > 0;
              }
              constructor(s, o, _) {
                (super(),
                (this._optionsService = _),
                (this.width = 0),
                (this.height = 0),
                (this._onCharSizeChange = this.register(
                  new d.EventEmitter()
                )),
                (this.onCharSizeChange = this._onCharSizeChange.event));
                try {
                  this._measureStrategy = this.register(
                    new n(this._optionsService)
                  );
                } catch {
                  this._measureStrategy = this.register(
                    new c(s, o, this._optionsService)
                  );
                }
                this.register(
                  this._optionsService.onMultipleOptionChange(
                    ['fontFamily', 'fontSize'],
                    () => this.measure()
                  )
                );
              }
              measure() {
                const s = this._measureStrategy.measure();
                (s.width === this.width && s.height === this.height) ||
                  ((this.width = s.width),
                  (this.height = s.height),
                  this._onCharSizeChange.fire());
              }
            });
            a.CharSizeService = w = f([g(2, u.IOptionsService)], w);
            class p extends v.Disposable {
              constructor() {
                (super(...arguments), (this._result = { width: 0, height: 0 }));
              }
              _validateAndSet(o, _) {
                o !== void 0 &&
                  o > 0 &&
                  _ !== void 0 &&
                  _ > 0 &&
                  ((this._result.width = o), (this._result.height = _));
              }
            }
            class c extends p {
              constructor(o, _, C) {
                (super(),
                (this._document = o),
                (this._parentElement = _),
                (this._optionsService = C),
                (this._measureElement = this._document.createElement('span')),
                this._measureElement.classList.add(
                  'xterm-char-measure-element'
                ),
                (this._measureElement.textContent = 'W'.repeat(32)),
                this._measureElement.setAttribute('aria-hidden', 'true'),
                (this._measureElement.style.whiteSpace = 'pre'),
                (this._measureElement.style.fontKerning = 'none'),
                this._parentElement.appendChild(this._measureElement));
              }
              measure() {
                return (
                  (this._measureElement.style.fontFamily =
                    this._optionsService.rawOptions.fontFamily),
                  (this._measureElement.style.fontSize = `${this._optionsService.rawOptions.fontSize}px`),
                  this._validateAndSet(
                    Number(this._measureElement.offsetWidth) / 32,
                    Number(this._measureElement.offsetHeight)
                  ),
                  this._result
                );
              }
            }
            class n extends p {
              constructor(o) {
                (super(),
                (this._optionsService = o),
                (this._canvas = new OffscreenCanvas(100, 100)),
                (this._ctx = this._canvas.getContext('2d')));
                const _ = this._ctx.measureText('W');
                if (
                  !(
                    'width' in _ &&
                    'fontBoundingBoxAscent' in _ &&
                    'fontBoundingBoxDescent' in _
                  )
                )
                  throw new Error('Required font metrics not supported');
              }
              measure() {
                this._ctx.font = `${this._optionsService.rawOptions.fontSize}px ${this._optionsService.rawOptions.fontFamily}`;
                const o = this._ctx.measureText('W');
                return (
                  this._validateAndSet(
                    o.width,
                    o.fontBoundingBoxAscent + o.fontBoundingBoxDescent
                  ),
                  this._result
                );
              }
            }
          },
          4269: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (n, s, o, _) {
                  var C,
                    b = arguments.length,
                    x =
                      b < 3
                        ? s
                        : _ === null
                          ? (_ = Object.getOwnPropertyDescriptor(s, o))
                          : _;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    x = Reflect.decorate(n, s, o, _);
                  else
                    for (var S = n.length - 1; S >= 0; S--)
                      (C = n[S]) &&
                        (x =
                          (b < 3 ? C(x) : b > 3 ? C(s, o, x) : C(s, o)) || x);
                  return (b > 3 && x && Object.defineProperty(s, o, x), x);
                },
              g =
                (this && this.__param) ||
                function (n, s) {
                  return function (o, _) {
                    s(o, _, n);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.CharacterJoinerService = a.JoinedCellData = void 0));
            const u = l(3734),
              d = l(643),
              v = l(511),
              w = l(2585);
            class p extends u.AttributeData {
              constructor(s, o, _) {
                (super(),
                (this.content = 0),
                (this.combinedData = ''),
                (this.fg = s.fg),
                (this.bg = s.bg),
                (this.combinedData = o),
                (this._width = _));
              }
              isCombined() {
                return 2097152;
              }
              getWidth() {
                return this._width;
              }
              getChars() {
                return this.combinedData;
              }
              getCode() {
                return 2097151;
              }
              setFromCharData(s) {
                throw new Error('not implemented');
              }
              getAsCharData() {
                return [
                  this.fg,
                  this.getChars(),
                  this.getWidth(),
                  this.getCode(),
                ];
              }
            }
            a.JoinedCellData = p;
            let c = (a.CharacterJoinerService = class Oh {
              constructor(s) {
                ((this._bufferService = s),
                (this._characterJoiners = []),
                (this._nextCharacterJoinerId = 0),
                (this._workCell = new v.CellData()));
              }
              register(s) {
                const o = { id: this._nextCharacterJoinerId++, handler: s };
                return (this._characterJoiners.push(o), o.id);
              }
              deregister(s) {
                for (let o = 0; o < this._characterJoiners.length; o++)
                  if (this._characterJoiners[o].id === s)
                    return (this._characterJoiners.splice(o, 1), !0);
                return !1;
              }
              getJoinedCharacters(s) {
                if (this._characterJoiners.length === 0) return [];
                const o = this._bufferService.buffer.lines.get(s);
                if (!o || o.length === 0) return [];
                const _ = [],
                  C = o.translateToString(!0);
                let b = 0,
                  x = 0,
                  S = 0,
                  k = o.getFg(0),
                  T = o.getBg(0);
                for (let B = 0; B < o.getTrimmedLength(); B++)
                  if (
                    (o.loadCell(B, this._workCell),
                    this._workCell.getWidth() !== 0)
                  ) {
                    if (this._workCell.fg !== k || this._workCell.bg !== T) {
                      if (B - b > 1) {
                        const O = this._getJoinedRanges(C, S, x, o, b);
                        for (let A = 0; A < O.length; A++) _.push(O[A]);
                      }
                      ((b = B),
                      (S = x),
                      (k = this._workCell.fg),
                      (T = this._workCell.bg));
                    }
                    x +=
                      this._workCell.getChars().length ||
                      d.WHITESPACE_CELL_CHAR.length;
                  }
                if (this._bufferService.cols - b > 1) {
                  const B = this._getJoinedRanges(C, S, x, o, b);
                  for (let O = 0; O < B.length; O++) _.push(B[O]);
                }
                return _;
              }
              _getJoinedRanges(s, o, _, C, b) {
                const x = s.substring(o, _);
                let S = [];
                try {
                  S = this._characterJoiners[0].handler(x);
                } catch (k) {
                  console.error(k);
                }
                for (let k = 1; k < this._characterJoiners.length; k++)
                  try {
                    const T = this._characterJoiners[k].handler(x);
                    for (let B = 0; B < T.length; B++) Oh._mergeRanges(S, T[B]);
                  } catch (T) {
                    console.error(T);
                  }
                return (this._stringRangesToCellRanges(S, C, b), S);
              }
              _stringRangesToCellRanges(s, o, _) {
                let C = 0,
                  b = !1,
                  x = 0,
                  S = s[C];
                if (S) {
                  for (let k = _; k < this._bufferService.cols; k++) {
                    const T = o.getWidth(k),
                      B =
                        o.getString(k).length || d.WHITESPACE_CELL_CHAR.length;
                    if (T !== 0) {
                      if (
                        (!b && S[0] <= x && ((S[0] = k), (b = !0)), S[1] <= x)
                      ) {
                        if (((S[1] = k), (S = s[++C]), !S)) break;
                        S[0] <= x ? ((S[0] = k), (b = !0)) : (b = !1);
                      }
                      x += B;
                    }
                  }
                  S && (S[1] = this._bufferService.cols);
                }
              }
              static _mergeRanges(s, o) {
                let _ = !1;
                for (let C = 0; C < s.length; C++) {
                  const b = s[C];
                  if (_) {
                    if (o[1] <= b[0]) return ((s[C - 1][1] = o[1]), s);
                    if (o[1] <= b[1])
                      return (
                        (s[C - 1][1] = Math.max(o[1], b[1])),
                        s.splice(C, 1),
                        s
                      );
                    (s.splice(C, 1), C--);
                  } else {
                    if (o[1] <= b[0]) return (s.splice(C, 0, o), s);
                    if (o[1] <= b[1]) return ((b[0] = Math.min(o[0], b[0])), s);
                    o[0] < b[1] && ((b[0] = Math.min(o[0], b[0])), (_ = !0));
                  }
                }
                return (_ ? (s[s.length - 1][1] = o[1]) : s.push(o), s);
              }
            });
            a.CharacterJoinerService = c = f([g(0, w.IBufferService)], c);
          },
          5114: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.CoreBrowserService = void 0));
            const f = l(844),
              g = l(8460),
              u = l(3656);
            class d extends f.Disposable {
              constructor(p, c, n) {
                (super(),
                (this._textarea = p),
                (this._window = c),
                (this.mainDocument = n),
                (this._isFocused = !1),
                (this._cachedIsFocused = void 0),
                (this._screenDprMonitor = new v(this._window)),
                (this._onDprChange = this.register(new g.EventEmitter())),
                (this.onDprChange = this._onDprChange.event),
                (this._onWindowChange = this.register(new g.EventEmitter())),
                (this.onWindowChange = this._onWindowChange.event),
                this.register(
                  this.onWindowChange((s) =>
                    this._screenDprMonitor.setWindow(s)
                  )
                ),
                this.register(
                  (0, g.forwardEvent)(
                    this._screenDprMonitor.onDprChange,
                    this._onDprChange
                  )
                ),
                this._textarea.addEventListener(
                  'focus',
                  () => (this._isFocused = !0)
                ),
                this._textarea.addEventListener(
                  'blur',
                  () => (this._isFocused = !1)
                ));
              }
              get window() {
                return this._window;
              }
              set window(p) {
                this._window !== p &&
                  ((this._window = p), this._onWindowChange.fire(this._window));
              }
              get dpr() {
                return this.window.devicePixelRatio;
              }
              get isFocused() {
                return (
                  this._cachedIsFocused === void 0 &&
                    ((this._cachedIsFocused =
                      this._isFocused &&
                      this._textarea.ownerDocument.hasFocus()),
                    queueMicrotask(() => (this._cachedIsFocused = void 0))),
                  this._cachedIsFocused
                );
              }
            }
            a.CoreBrowserService = d;
            class v extends f.Disposable {
              constructor(p) {
                (super(),
                (this._parentWindow = p),
                (this._windowResizeListener = this.register(
                  new f.MutableDisposable()
                )),
                (this._onDprChange = this.register(new g.EventEmitter())),
                (this.onDprChange = this._onDprChange.event),
                (this._outerListener = () => this._setDprAndFireIfDiffers()),
                (this._currentDevicePixelRatio =
                    this._parentWindow.devicePixelRatio),
                this._updateDpr(),
                this._setWindowResizeListener(),
                this.register(
                  (0, f.toDisposable)(() => this.clearListener())
                ));
              }
              setWindow(p) {
                ((this._parentWindow = p),
                this._setWindowResizeListener(),
                this._setDprAndFireIfDiffers());
              }
              _setWindowResizeListener() {
                this._windowResizeListener.value = (0,
                u.addDisposableDomListener)(this._parentWindow, 'resize', () =>
                  this._setDprAndFireIfDiffers()
                );
              }
              _setDprAndFireIfDiffers() {
                (this._parentWindow.devicePixelRatio !==
                  this._currentDevicePixelRatio &&
                  this._onDprChange.fire(this._parentWindow.devicePixelRatio),
                this._updateDpr());
              }
              _updateDpr() {
                var p;
                this._outerListener &&
                  ((p = this._resolutionMediaMatchList) == null ||
                    p.removeListener(this._outerListener),
                  (this._currentDevicePixelRatio =
                    this._parentWindow.devicePixelRatio),
                  (this._resolutionMediaMatchList =
                    this._parentWindow.matchMedia(
                      `screen and (resolution: ${this._parentWindow.devicePixelRatio}dppx)`
                    )),
                  this._resolutionMediaMatchList.addListener(
                    this._outerListener
                  ));
              }
              clearListener() {
                this._resolutionMediaMatchList &&
                  this._outerListener &&
                  (this._resolutionMediaMatchList.removeListener(
                    this._outerListener
                  ),
                  (this._resolutionMediaMatchList = void 0),
                  (this._outerListener = void 0));
              }
            }
          },
          779: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.LinkProviderService = void 0));
            const f = l(844);
            class g extends f.Disposable {
              constructor() {
                (super(),
                (this.linkProviders = []),
                this.register(
                  (0, f.toDisposable)(() => (this.linkProviders.length = 0))
                ));
              }
              registerLinkProvider(d) {
                return (
                  this.linkProviders.push(d),
                  {
                    dispose: () => {
                      const v = this.linkProviders.indexOf(d);
                      v !== -1 && this.linkProviders.splice(v, 1);
                    },
                  }
                );
              }
            }
            a.LinkProviderService = g;
          },
          8934: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (w, p, c, n) {
                  var s,
                    o = arguments.length,
                    _ =
                      o < 3
                        ? p
                        : n === null
                          ? (n = Object.getOwnPropertyDescriptor(p, c))
                          : n;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    _ = Reflect.decorate(w, p, c, n);
                  else
                    for (var C = w.length - 1; C >= 0; C--)
                      (s = w[C]) &&
                        (_ =
                          (o < 3 ? s(_) : o > 3 ? s(p, c, _) : s(p, c)) || _);
                  return (o > 3 && _ && Object.defineProperty(p, c, _), _);
                },
              g =
                (this && this.__param) ||
                function (w, p) {
                  return function (c, n) {
                    p(c, n, w);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.MouseService = void 0));
            const u = l(4725),
              d = l(9806);
            let v = (a.MouseService = class {
              constructor(w, p) {
                ((this._renderService = w), (this._charSizeService = p));
              }
              getCoords(w, p, c, n, s) {
                return (0, d.getCoords)(
                  window,
                  w,
                  p,
                  c,
                  n,
                  this._charSizeService.hasValidSize,
                  this._renderService.dimensions.css.cell.width,
                  this._renderService.dimensions.css.cell.height,
                  s
                );
              }
              getMouseReportCoords(w, p) {
                const c = (0, d.getCoordsRelativeToElement)(window, w, p);
                if (this._charSizeService.hasValidSize)
                  return (
                    (c[0] = Math.min(
                      Math.max(c[0], 0),
                      this._renderService.dimensions.css.canvas.width - 1
                    )),
                    (c[1] = Math.min(
                      Math.max(c[1], 0),
                      this._renderService.dimensions.css.canvas.height - 1
                    )),
                    {
                      col: Math.floor(
                        c[0] / this._renderService.dimensions.css.cell.width
                      ),
                      row: Math.floor(
                        c[1] / this._renderService.dimensions.css.cell.height
                      ),
                      x: Math.floor(c[0]),
                      y: Math.floor(c[1]),
                    }
                  );
              }
            });
            a.MouseService = v = f(
              [g(0, u.IRenderService), g(1, u.ICharSizeService)],
              v
            );
          },
          3230: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (s, o, _, C) {
                  var b,
                    x = arguments.length,
                    S =
                      x < 3
                        ? o
                        : C === null
                          ? (C = Object.getOwnPropertyDescriptor(o, _))
                          : C;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    S = Reflect.decorate(s, o, _, C);
                  else
                    for (var k = s.length - 1; k >= 0; k--)
                      (b = s[k]) &&
                        (S =
                          (x < 3 ? b(S) : x > 3 ? b(o, _, S) : b(o, _)) || S);
                  return (x > 3 && S && Object.defineProperty(o, _, S), S);
                },
              g =
                (this && this.__param) ||
                function (s, o) {
                  return function (_, C) {
                    o(_, C, s);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.RenderService = void 0));
            const u = l(6193),
              d = l(4725),
              v = l(8460),
              w = l(844),
              p = l(7226),
              c = l(2585);
            let n = (a.RenderService = class extends w.Disposable {
              get dimensions() {
                return this._renderer.value.dimensions;
              }
              constructor(s, o, _, C, b, x, S, k) {
                (super(),
                (this._rowCount = s),
                (this._charSizeService = C),
                (this._renderer = this.register(new w.MutableDisposable())),
                (this._pausedResizeTask = new p.DebouncedIdleTask()),
                (this._observerDisposable = this.register(
                  new w.MutableDisposable()
                )),
                (this._isPaused = !1),
                (this._needsFullRefresh = !1),
                (this._isNextRenderRedrawOnly = !0),
                (this._needsSelectionRefresh = !1),
                (this._canvasWidth = 0),
                (this._canvasHeight = 0),
                (this._selectionState = {
                  start: void 0,
                  end: void 0,
                  columnSelectMode: !1,
                }),
                (this._onDimensionsChange = this.register(
                  new v.EventEmitter()
                )),
                (this.onDimensionsChange = this._onDimensionsChange.event),
                (this._onRenderedViewportChange = this.register(
                  new v.EventEmitter()
                )),
                (this.onRenderedViewportChange =
                    this._onRenderedViewportChange.event),
                (this._onRender = this.register(new v.EventEmitter())),
                (this.onRender = this._onRender.event),
                (this._onRefreshRequest = this.register(
                  new v.EventEmitter()
                )),
                (this.onRefreshRequest = this._onRefreshRequest.event),
                (this._renderDebouncer = new u.RenderDebouncer(
                  (T, B) => this._renderRows(T, B),
                  S
                )),
                this.register(this._renderDebouncer),
                this.register(
                  S.onDprChange(() => this.handleDevicePixelRatioChange())
                ),
                this.register(x.onResize(() => this._fullRefresh())),
                this.register(
                  x.buffers.onBufferActivate(() => {
                    var T;
                    return (T = this._renderer.value) == null
                      ? void 0
                      : T.clear();
                  })
                ),
                this.register(
                  _.onOptionChange(() => this._handleOptionsChanged())
                ),
                this.register(
                  this._charSizeService.onCharSizeChange(() =>
                    this.handleCharSizeChanged()
                  )
                ),
                this.register(
                  b.onDecorationRegistered(() => this._fullRefresh())
                ),
                this.register(
                  b.onDecorationRemoved(() => this._fullRefresh())
                ),
                this.register(
                  _.onMultipleOptionChange(
                    [
                      'customGlyphs',
                      'drawBoldTextInBrightColors',
                      'letterSpacing',
                      'lineHeight',
                      'fontFamily',
                      'fontSize',
                      'fontWeight',
                      'fontWeightBold',
                      'minimumContrastRatio',
                      'rescaleOverlappingGlyphs',
                    ],
                    () => {
                      (this.clear(),
                      this.handleResize(x.cols, x.rows),
                      this._fullRefresh());
                    }
                  )
                ),
                this.register(
                  _.onMultipleOptionChange(
                    ['cursorBlink', 'cursorStyle'],
                    () => this.refreshRows(x.buffer.y, x.buffer.y, !0)
                  )
                ),
                this.register(k.onChangeColors(() => this._fullRefresh())),
                this._registerIntersectionObserver(S.window, o),
                this.register(
                  S.onWindowChange((T) =>
                    this._registerIntersectionObserver(T, o)
                  )
                ));
              }
              _registerIntersectionObserver(s, o) {
                if ('IntersectionObserver' in s) {
                  const _ = new s.IntersectionObserver(
                    (C) => this._handleIntersectionChange(C[C.length - 1]),
                    { threshold: 0 }
                  );
                  (_.observe(o),
                  (this._observerDisposable.value = (0, w.toDisposable)(() =>
                    _.disconnect()
                  )));
                }
              }
              _handleIntersectionChange(s) {
                ((this._isPaused =
                  s.isIntersecting === void 0
                    ? s.intersectionRatio === 0
                    : !s.isIntersecting),
                this._isPaused ||
                    this._charSizeService.hasValidSize ||
                    this._charSizeService.measure(),
                !this._isPaused &&
                    this._needsFullRefresh &&
                    (this._pausedResizeTask.flush(),
                    this.refreshRows(0, this._rowCount - 1),
                    (this._needsFullRefresh = !1)));
              }
              refreshRows(s, o, _ = !1) {
                this._isPaused
                  ? (this._needsFullRefresh = !0)
                  : (_ || (this._isNextRenderRedrawOnly = !1),
                  this._renderDebouncer.refresh(s, o, this._rowCount));
              }
              _renderRows(s, o) {
                this._renderer.value &&
                  ((s = Math.min(s, this._rowCount - 1)),
                  (o = Math.min(o, this._rowCount - 1)),
                  this._renderer.value.renderRows(s, o),
                  this._needsSelectionRefresh &&
                    (this._renderer.value.handleSelectionChanged(
                      this._selectionState.start,
                      this._selectionState.end,
                      this._selectionState.columnSelectMode
                    ),
                    (this._needsSelectionRefresh = !1)),
                  this._isNextRenderRedrawOnly ||
                    this._onRenderedViewportChange.fire({ start: s, end: o }),
                  this._onRender.fire({ start: s, end: o }),
                  (this._isNextRenderRedrawOnly = !0));
              }
              resize(s, o) {
                ((this._rowCount = o), this._fireOnCanvasResize());
              }
              _handleOptionsChanged() {
                this._renderer.value &&
                  (this.refreshRows(0, this._rowCount - 1),
                  this._fireOnCanvasResize());
              }
              _fireOnCanvasResize() {
                this._renderer.value &&
                  ((this._renderer.value.dimensions.css.canvas.width ===
                    this._canvasWidth &&
                    this._renderer.value.dimensions.css.canvas.height ===
                      this._canvasHeight) ||
                    this._onDimensionsChange.fire(
                      this._renderer.value.dimensions
                    ));
              }
              hasRenderer() {
                return !!this._renderer.value;
              }
              setRenderer(s) {
                ((this._renderer.value = s),
                this._renderer.value &&
                    (this._renderer.value.onRequestRedraw((o) =>
                      this.refreshRows(o.start, o.end, !0)
                    ),
                    (this._needsSelectionRefresh = !0),
                    this._fullRefresh()));
              }
              addRefreshCallback(s) {
                return this._renderDebouncer.addRefreshCallback(s);
              }
              _fullRefresh() {
                this._isPaused
                  ? (this._needsFullRefresh = !0)
                  : this.refreshRows(0, this._rowCount - 1);
              }
              clearTextureAtlas() {
                var s, o;
                this._renderer.value &&
                  ((o = (s = this._renderer.value).clearTextureAtlas) == null ||
                    o.call(s),
                  this._fullRefresh());
              }
              handleDevicePixelRatioChange() {
                (this._charSizeService.measure(),
                this._renderer.value &&
                    (this._renderer.value.handleDevicePixelRatioChange(),
                    this.refreshRows(0, this._rowCount - 1)));
              }
              handleResize(s, o) {
                this._renderer.value &&
                  (this._isPaused
                    ? this._pausedResizeTask.set(() => {
                      var _;
                      return (_ = this._renderer.value) == null
                        ? void 0
                        : _.handleResize(s, o);
                    })
                    : this._renderer.value.handleResize(s, o),
                  this._fullRefresh());
              }
              handleCharSizeChanged() {
                var s;
                (s = this._renderer.value) == null || s.handleCharSizeChanged();
              }
              handleBlur() {
                var s;
                (s = this._renderer.value) == null || s.handleBlur();
              }
              handleFocus() {
                var s;
                (s = this._renderer.value) == null || s.handleFocus();
              }
              handleSelectionChanged(s, o, _) {
                var C;
                ((this._selectionState.start = s),
                (this._selectionState.end = o),
                (this._selectionState.columnSelectMode = _),
                (C = this._renderer.value) == null ||
                    C.handleSelectionChanged(s, o, _));
              }
              handleCursorMove() {
                var s;
                (s = this._renderer.value) == null || s.handleCursorMove();
              }
              clear() {
                var s;
                (s = this._renderer.value) == null || s.clear();
              }
            });
            a.RenderService = n = f(
              [
                g(2, c.IOptionsService),
                g(3, d.ICharSizeService),
                g(4, c.IDecorationService),
                g(5, c.IBufferService),
                g(6, d.ICoreBrowserService),
                g(7, d.IThemeService),
              ],
              n
            );
          },
          9312: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (S, k, T, B) {
                  var O,
                    A = arguments.length,
                    H =
                      A < 3
                        ? k
                        : B === null
                          ? (B = Object.getOwnPropertyDescriptor(k, T))
                          : B;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    H = Reflect.decorate(S, k, T, B);
                  else
                    for (var W = S.length - 1; W >= 0; W--)
                      (O = S[W]) &&
                        (H =
                          (A < 3 ? O(H) : A > 3 ? O(k, T, H) : O(k, T)) || H);
                  return (A > 3 && H && Object.defineProperty(k, T, H), H);
                },
              g =
                (this && this.__param) ||
                function (S, k) {
                  return function (T, B) {
                    k(T, B, S);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.SelectionService = void 0));
            const u = l(9806),
              d = l(9504),
              v = l(456),
              w = l(4725),
              p = l(8460),
              c = l(844),
              n = l(6114),
              s = l(4841),
              o = l(511),
              _ = l(2585),
              C = ' ',
              b = new RegExp(C, 'g');
            let x = (a.SelectionService = class extends c.Disposable {
              constructor(S, k, T, B, O, A, H, W, $) {
                (super(),
                (this._element = S),
                (this._screenElement = k),
                (this._linkifier = T),
                (this._bufferService = B),
                (this._coreService = O),
                (this._mouseService = A),
                (this._optionsService = H),
                (this._renderService = W),
                (this._coreBrowserService = $),
                (this._dragScrollAmount = 0),
                (this._enabled = !0),
                (this._workCell = new o.CellData()),
                (this._mouseDownTimeStamp = 0),
                (this._oldHasSelection = !1),
                (this._oldSelectionStart = void 0),
                (this._oldSelectionEnd = void 0),
                (this._onLinuxMouseSelection = this.register(
                  new p.EventEmitter()
                )),
                (this.onLinuxMouseSelection =
                    this._onLinuxMouseSelection.event),
                (this._onRedrawRequest = this.register(new p.EventEmitter())),
                (this.onRequestRedraw = this._onRedrawRequest.event),
                (this._onSelectionChange = this.register(
                  new p.EventEmitter()
                )),
                (this.onSelectionChange = this._onSelectionChange.event),
                (this._onRequestScrollLines = this.register(
                  new p.EventEmitter()
                )),
                (this.onRequestScrollLines =
                    this._onRequestScrollLines.event),
                (this._mouseMoveListener = (G) => this._handleMouseMove(G)),
                (this._mouseUpListener = (G) => this._handleMouseUp(G)),
                this._coreService.onUserInput(() => {
                  this.hasSelection && this.clearSelection();
                }),
                (this._trimListener = this._bufferService.buffer.lines.onTrim(
                  (G) => this._handleTrim(G)
                )),
                this.register(
                  this._bufferService.buffers.onBufferActivate((G) =>
                    this._handleBufferActivate(G)
                  )
                ),
                this.enable(),
                (this._model = new v.SelectionModel(this._bufferService)),
                (this._activeSelectionMode = 0),
                this.register(
                  (0, c.toDisposable)(() => {
                    this._removeMouseDownListeners();
                  })
                ));
              }
              reset() {
                this.clearSelection();
              }
              disable() {
                (this.clearSelection(), (this._enabled = !1));
              }
              enable() {
                this._enabled = !0;
              }
              get selectionStart() {
                return this._model.finalSelectionStart;
              }
              get selectionEnd() {
                return this._model.finalSelectionEnd;
              }
              get hasSelection() {
                const S = this._model.finalSelectionStart,
                  k = this._model.finalSelectionEnd;
                return !(!S || !k || (S[0] === k[0] && S[1] === k[1]));
              }
              get selectionText() {
                const S = this._model.finalSelectionStart,
                  k = this._model.finalSelectionEnd;
                if (!S || !k) return '';
                const T = this._bufferService.buffer,
                  B = [];
                if (this._activeSelectionMode === 3) {
                  if (S[0] === k[0]) return '';
                  const O = S[0] < k[0] ? S[0] : k[0],
                    A = S[0] < k[0] ? k[0] : S[0];
                  for (let H = S[1]; H <= k[1]; H++) {
                    const W = T.translateBufferLineToString(H, !0, O, A);
                    B.push(W);
                  }
                } else {
                  const O = S[1] === k[1] ? k[0] : void 0;
                  B.push(T.translateBufferLineToString(S[1], !0, S[0], O));
                  for (let A = S[1] + 1; A <= k[1] - 1; A++) {
                    const H = T.lines.get(A),
                      W = T.translateBufferLineToString(A, !0);
                    H != null && H.isWrapped
                      ? (B[B.length - 1] += W)
                      : B.push(W);
                  }
                  if (S[1] !== k[1]) {
                    const A = T.lines.get(k[1]),
                      H = T.translateBufferLineToString(k[1], !0, 0, k[0]);
                    A && A.isWrapped ? (B[B.length - 1] += H) : B.push(H);
                  }
                }
                return B.map((O) => O.replace(b, ' ')).join(
                  n.isWindows
                    ? `\r
`
                    : `
`
                );
              }
              clearSelection() {
                (this._model.clearSelection(),
                this._removeMouseDownListeners(),
                this.refresh(),
                this._onSelectionChange.fire());
              }
              refresh(S) {
                (this._refreshAnimationFrame ||
                  (this._refreshAnimationFrame =
                    this._coreBrowserService.window.requestAnimationFrame(() =>
                      this._refresh()
                    )),
                n.isLinux &&
                    S &&
                    this.selectionText.length &&
                    this._onLinuxMouseSelection.fire(this.selectionText));
              }
              _refresh() {
                ((this._refreshAnimationFrame = void 0),
                this._onRedrawRequest.fire({
                  start: this._model.finalSelectionStart,
                  end: this._model.finalSelectionEnd,
                  columnSelectMode: this._activeSelectionMode === 3,
                }));
              }
              _isClickInSelection(S) {
                const k = this._getMouseBufferCoords(S),
                  T = this._model.finalSelectionStart,
                  B = this._model.finalSelectionEnd;
                return !!(T && B && k) && this._areCoordsInSelection(k, T, B);
              }
              isCellInSelection(S, k) {
                const T = this._model.finalSelectionStart,
                  B = this._model.finalSelectionEnd;
                return !(!T || !B) && this._areCoordsInSelection([S, k], T, B);
              }
              _areCoordsInSelection(S, k, T) {
                return (
                  (S[1] > k[1] && S[1] < T[1]) ||
                  (k[1] === T[1] &&
                    S[1] === k[1] &&
                    S[0] >= k[0] &&
                    S[0] < T[0]) ||
                  (k[1] < T[1] && S[1] === T[1] && S[0] < T[0]) ||
                  (k[1] < T[1] && S[1] === k[1] && S[0] >= k[0])
                );
              }
              _selectWordAtCursor(S, k) {
                var O, A;
                const T =
                  (A =
                    (O = this._linkifier.currentLink) == null
                      ? void 0
                      : O.link) == null
                    ? void 0
                    : A.range;
                if (T)
                  return (
                    (this._model.selectionStart = [
                      T.start.x - 1,
                      T.start.y - 1,
                    ]),
                    (this._model.selectionStartLength = (0, s.getRangeLength)(
                      T,
                      this._bufferService.cols
                    )),
                    (this._model.selectionEnd = void 0),
                    !0
                  );
                const B = this._getMouseBufferCoords(S);
                return (
                  !!B &&
                  (this._selectWordAt(B, k),
                  (this._model.selectionEnd = void 0),
                  !0)
                );
              }
              selectAll() {
                ((this._model.isSelectAllActive = !0),
                this.refresh(),
                this._onSelectionChange.fire());
              }
              selectLines(S, k) {
                (this._model.clearSelection(),
                (S = Math.max(S, 0)),
                (k = Math.min(
                  k,
                  this._bufferService.buffer.lines.length - 1
                )),
                (this._model.selectionStart = [0, S]),
                (this._model.selectionEnd = [this._bufferService.cols, k]),
                this.refresh(),
                this._onSelectionChange.fire());
              }
              _handleTrim(S) {
                this._model.handleTrim(S) && this.refresh();
              }
              _getMouseBufferCoords(S) {
                const k = this._mouseService.getCoords(
                  S,
                  this._screenElement,
                  this._bufferService.cols,
                  this._bufferService.rows,
                  !0
                );
                if (k)
                  return (
                    k[0]--,
                    k[1]--,
                    (k[1] += this._bufferService.buffer.ydisp),
                    k
                  );
              }
              _getMouseEventScrollAmount(S) {
                let k = (0, u.getCoordsRelativeToElement)(
                  this._coreBrowserService.window,
                  S,
                  this._screenElement
                )[1];
                const T = this._renderService.dimensions.css.canvas.height;
                return k >= 0 && k <= T
                  ? 0
                  : (k > T && (k -= T),
                  (k = Math.min(Math.max(k, -50), 50)),
                  (k /= 50),
                  k / Math.abs(k) + Math.round(14 * k));
              }
              shouldForceSelection(S) {
                return n.isMac
                  ? S.altKey &&
                      this._optionsService.rawOptions
                        .macOptionClickForcesSelection
                  : S.shiftKey;
              }
              handleMouseDown(S) {
                if (
                  ((this._mouseDownTimeStamp = S.timeStamp),
                  (S.button !== 2 || !this.hasSelection) && S.button === 0)
                ) {
                  if (!this._enabled) {
                    if (!this.shouldForceSelection(S)) return;
                    S.stopPropagation();
                  }
                  (S.preventDefault(),
                  (this._dragScrollAmount = 0),
                  this._enabled && S.shiftKey
                    ? this._handleIncrementalClick(S)
                    : S.detail === 1
                      ? this._handleSingleClick(S)
                      : S.detail === 2
                        ? this._handleDoubleClick(S)
                        : S.detail === 3 && this._handleTripleClick(S),
                  this._addMouseDownListeners(),
                  this.refresh(!0));
                }
              }
              _addMouseDownListeners() {
                (this._screenElement.ownerDocument &&
                  (this._screenElement.ownerDocument.addEventListener(
                    'mousemove',
                    this._mouseMoveListener
                  ),
                  this._screenElement.ownerDocument.addEventListener(
                    'mouseup',
                    this._mouseUpListener
                  )),
                (this._dragScrollIntervalTimer =
                    this._coreBrowserService.window.setInterval(
                      () => this._dragScroll(),
                      50
                    )));
              }
              _removeMouseDownListeners() {
                (this._screenElement.ownerDocument &&
                  (this._screenElement.ownerDocument.removeEventListener(
                    'mousemove',
                    this._mouseMoveListener
                  ),
                  this._screenElement.ownerDocument.removeEventListener(
                    'mouseup',
                    this._mouseUpListener
                  )),
                this._coreBrowserService.window.clearInterval(
                  this._dragScrollIntervalTimer
                ),
                (this._dragScrollIntervalTimer = void 0));
              }
              _handleIncrementalClick(S) {
                this._model.selectionStart &&
                  (this._model.selectionEnd = this._getMouseBufferCoords(S));
              }
              _handleSingleClick(S) {
                if (
                  ((this._model.selectionStartLength = 0),
                  (this._model.isSelectAllActive = !1),
                  (this._activeSelectionMode = this.shouldColumnSelect(S)
                    ? 3
                    : 0),
                  (this._model.selectionStart = this._getMouseBufferCoords(S)),
                  !this._model.selectionStart)
                )
                  return;
                this._model.selectionEnd = void 0;
                const k = this._bufferService.buffer.lines.get(
                  this._model.selectionStart[1]
                );
                k &&
                  k.length !== this._model.selectionStart[0] &&
                  k.hasWidth(this._model.selectionStart[0]) === 0 &&
                  this._model.selectionStart[0]++;
              }
              _handleDoubleClick(S) {
                this._selectWordAtCursor(S, !0) &&
                  (this._activeSelectionMode = 1);
              }
              _handleTripleClick(S) {
                const k = this._getMouseBufferCoords(S);
                k &&
                  ((this._activeSelectionMode = 2), this._selectLineAt(k[1]));
              }
              shouldColumnSelect(S) {
                return (
                  S.altKey &&
                  !(
                    n.isMac &&
                    this._optionsService.rawOptions
                      .macOptionClickForcesSelection
                  )
                );
              }
              _handleMouseMove(S) {
                if ((S.stopImmediatePropagation(), !this._model.selectionStart))
                  return;
                const k = this._model.selectionEnd
                  ? [this._model.selectionEnd[0], this._model.selectionEnd[1]]
                  : null;
                if (
                  ((this._model.selectionEnd = this._getMouseBufferCoords(S)),
                  !this._model.selectionEnd)
                )
                  return void this.refresh(!0);
                (this._activeSelectionMode === 2
                  ? this._model.selectionEnd[1] < this._model.selectionStart[1]
                    ? (this._model.selectionEnd[0] = 0)
                    : (this._model.selectionEnd[0] = this._bufferService.cols)
                  : this._activeSelectionMode === 1 &&
                    this._selectToWordAt(this._model.selectionEnd),
                (this._dragScrollAmount = this._getMouseEventScrollAmount(S)),
                this._activeSelectionMode !== 3 &&
                    (this._dragScrollAmount > 0
                      ? (this._model.selectionEnd[0] = this._bufferService.cols)
                      : this._dragScrollAmount < 0 &&
                        (this._model.selectionEnd[0] = 0)));
                const T = this._bufferService.buffer;
                if (this._model.selectionEnd[1] < T.lines.length) {
                  const B = T.lines.get(this._model.selectionEnd[1]);
                  B &&
                    B.hasWidth(this._model.selectionEnd[0]) === 0 &&
                    this._model.selectionEnd[0] < this._bufferService.cols &&
                    this._model.selectionEnd[0]++;
                }
                (k &&
                  k[0] === this._model.selectionEnd[0] &&
                  k[1] === this._model.selectionEnd[1]) ||
                  this.refresh(!0);
              }
              _dragScroll() {
                if (
                  this._model.selectionEnd &&
                  this._model.selectionStart &&
                  this._dragScrollAmount
                ) {
                  this._onRequestScrollLines.fire({
                    amount: this._dragScrollAmount,
                    suppressScrollEvent: !1,
                  });
                  const S = this._bufferService.buffer;
                  (this._dragScrollAmount > 0
                    ? (this._activeSelectionMode !== 3 &&
                        (this._model.selectionEnd[0] =
                          this._bufferService.cols),
                    (this._model.selectionEnd[1] = Math.min(
                      S.ydisp + this._bufferService.rows,
                      S.lines.length - 1
                    )))
                    : (this._activeSelectionMode !== 3 &&
                        (this._model.selectionEnd[0] = 0),
                    (this._model.selectionEnd[1] = S.ydisp)),
                  this.refresh());
                }
              }
              _handleMouseUp(S) {
                const k = S.timeStamp - this._mouseDownTimeStamp;
                if (
                  (this._removeMouseDownListeners(),
                  this.selectionText.length <= 1 &&
                    k < 500 &&
                    S.altKey &&
                    this._optionsService.rawOptions.altClickMovesCursor)
                ) {
                  if (
                    this._bufferService.buffer.ybase ===
                    this._bufferService.buffer.ydisp
                  ) {
                    const T = this._mouseService.getCoords(
                      S,
                      this._element,
                      this._bufferService.cols,
                      this._bufferService.rows,
                      !1
                    );
                    if (T && T[0] !== void 0 && T[1] !== void 0) {
                      const B = (0, d.moveToCellSequence)(
                        T[0] - 1,
                        T[1] - 1,
                        this._bufferService,
                        this._coreService.decPrivateModes.applicationCursorKeys
                      );
                      this._coreService.triggerDataEvent(B, !0);
                    }
                  }
                } else this._fireEventIfSelectionChanged();
              }
              _fireEventIfSelectionChanged() {
                const S = this._model.finalSelectionStart,
                  k = this._model.finalSelectionEnd,
                  T = !(!S || !k || (S[0] === k[0] && S[1] === k[1]));
                T
                  ? S &&
                    k &&
                    ((this._oldSelectionStart &&
                      this._oldSelectionEnd &&
                      S[0] === this._oldSelectionStart[0] &&
                      S[1] === this._oldSelectionStart[1] &&
                      k[0] === this._oldSelectionEnd[0] &&
                      k[1] === this._oldSelectionEnd[1]) ||
                      this._fireOnSelectionChange(S, k, T))
                  : this._oldHasSelection &&
                    this._fireOnSelectionChange(S, k, T);
              }
              _fireOnSelectionChange(S, k, T) {
                ((this._oldSelectionStart = S),
                (this._oldSelectionEnd = k),
                (this._oldHasSelection = T),
                this._onSelectionChange.fire());
              }
              _handleBufferActivate(S) {
                (this.clearSelection(),
                this._trimListener.dispose(),
                (this._trimListener = S.activeBuffer.lines.onTrim((k) =>
                  this._handleTrim(k)
                )));
              }
              _convertViewportColToCharacterIndex(S, k) {
                let T = k;
                for (let B = 0; k >= B; B++) {
                  const O = S.loadCell(B, this._workCell).getChars().length;
                  this._workCell.getWidth() === 0
                    ? T--
                    : O > 1 && k !== B && (T += O - 1);
                }
                return T;
              }
              setSelection(S, k, T) {
                (this._model.clearSelection(),
                this._removeMouseDownListeners(),
                (this._model.selectionStart = [S, k]),
                (this._model.selectionStartLength = T),
                this.refresh(),
                this._fireEventIfSelectionChanged());
              }
              rightClickSelect(S) {
                this._isClickInSelection(S) ||
                  (this._selectWordAtCursor(S, !1) && this.refresh(!0),
                  this._fireEventIfSelectionChanged());
              }
              _getWordAt(S, k, T = !0, B = !0) {
                if (S[0] >= this._bufferService.cols) return;
                const O = this._bufferService.buffer,
                  A = O.lines.get(S[1]);
                if (!A) return;
                const H = O.translateBufferLineToString(S[1], !1);
                let W = this._convertViewportColToCharacterIndex(A, S[0]),
                  $ = W;
                const G = S[0] - W;
                let I = 0,
                  E = 0,
                  R = 0,
                  D = 0;
                if (H.charAt(W) === ' ') {
                  for (; W > 0 && H.charAt(W - 1) === ' '; ) W--;
                  for (; $ < H.length && H.charAt($ + 1) === ' '; ) $++;
                } else {
                  let U = S[0],
                    Y = S[0];
                  (A.getWidth(U) === 0 && (I++, U--),
                  A.getWidth(Y) === 2 && (E++, Y++));
                  const z = A.getString(Y).length;
                  for (
                    z > 1 && ((D += z - 1), ($ += z - 1));
                    U > 0 &&
                    W > 0 &&
                    !this._isCharWordSeparator(
                      A.loadCell(U - 1, this._workCell)
                    );

                  ) {
                    A.loadCell(U - 1, this._workCell);
                    const M = this._workCell.getChars().length;
                    (this._workCell.getWidth() === 0
                      ? (I++, U--)
                      : M > 1 && ((R += M - 1), (W -= M - 1)),
                    W--,
                    U--);
                  }
                  for (
                    ;
                    Y < A.length &&
                    $ + 1 < H.length &&
                    !this._isCharWordSeparator(
                      A.loadCell(Y + 1, this._workCell)
                    );

                  ) {
                    A.loadCell(Y + 1, this._workCell);
                    const M = this._workCell.getChars().length;
                    (this._workCell.getWidth() === 2
                      ? (E++, Y++)
                      : M > 1 && ((D += M - 1), ($ += M - 1)),
                    $++,
                    Y++);
                  }
                }
                $++;
                let P = W + G - I + R,
                  F = Math.min(this._bufferService.cols, $ - W + I + E - R - D);
                if (k || H.slice(W, $).trim() !== '') {
                  if (T && P === 0 && A.getCodePoint(0) !== 32) {
                    const U = O.lines.get(S[1] - 1);
                    if (
                      U &&
                      A.isWrapped &&
                      U.getCodePoint(this._bufferService.cols - 1) !== 32
                    ) {
                      const Y = this._getWordAt(
                        [this._bufferService.cols - 1, S[1] - 1],
                        !1,
                        !0,
                        !1
                      );
                      if (Y) {
                        const z = this._bufferService.cols - Y.start;
                        ((P -= z), (F += z));
                      }
                    }
                  }
                  if (
                    B &&
                    P + F === this._bufferService.cols &&
                    A.getCodePoint(this._bufferService.cols - 1) !== 32
                  ) {
                    const U = O.lines.get(S[1] + 1);
                    if (U != null && U.isWrapped && U.getCodePoint(0) !== 32) {
                      const Y = this._getWordAt([0, S[1] + 1], !1, !1, !0);
                      Y && (F += Y.length);
                    }
                  }
                  return { start: P, length: F };
                }
              }
              _selectWordAt(S, k) {
                const T = this._getWordAt(S, k);
                if (T) {
                  for (; T.start < 0; )
                    ((T.start += this._bufferService.cols), S[1]--);
                  ((this._model.selectionStart = [T.start, S[1]]),
                  (this._model.selectionStartLength = T.length));
                }
              }
              _selectToWordAt(S) {
                const k = this._getWordAt(S, !0);
                if (k) {
                  let T = S[1];
                  for (; k.start < 0; )
                    ((k.start += this._bufferService.cols), T--);
                  if (!this._model.areSelectionValuesReversed())
                    for (; k.start + k.length > this._bufferService.cols; )
                      ((k.length -= this._bufferService.cols), T++);
                  this._model.selectionEnd = [
                    this._model.areSelectionValuesReversed()
                      ? k.start
                      : k.start + k.length,
                    T,
                  ];
                }
              }
              _isCharWordSeparator(S) {
                return (
                  S.getWidth() !== 0 &&
                  this._optionsService.rawOptions.wordSeparator.indexOf(
                    S.getChars()
                  ) >= 0
                );
              }
              _selectLineAt(S) {
                const k = this._bufferService.buffer.getWrappedRangeForLine(S),
                  T = {
                    start: { x: 0, y: k.first },
                    end: { x: this._bufferService.cols - 1, y: k.last },
                  };
                ((this._model.selectionStart = [0, k.first]),
                (this._model.selectionEnd = void 0),
                (this._model.selectionStartLength = (0, s.getRangeLength)(
                  T,
                  this._bufferService.cols
                )));
              }
            });
            a.SelectionService = x = f(
              [
                g(3, _.IBufferService),
                g(4, _.ICoreService),
                g(5, w.IMouseService),
                g(6, _.IOptionsService),
                g(7, w.IRenderService),
                g(8, w.ICoreBrowserService),
              ],
              x
            );
          },
          4725: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.ILinkProviderService =
                a.IThemeService =
                a.ICharacterJoinerService =
                a.ISelectionService =
                a.IRenderService =
                a.IMouseService =
                a.ICoreBrowserService =
                a.ICharSizeService =
                  void 0));
            const f = l(8343);
            ((a.ICharSizeService = (0, f.createDecorator)('CharSizeService')),
            (a.ICoreBrowserService = (0, f.createDecorator)(
              'CoreBrowserService'
            )),
            (a.IMouseService = (0, f.createDecorator)('MouseService')),
            (a.IRenderService = (0, f.createDecorator)('RenderService')),
            (a.ISelectionService = (0, f.createDecorator)(
              'SelectionService'
            )),
            (a.ICharacterJoinerService = (0, f.createDecorator)(
              'CharacterJoinerService'
            )),
            (a.IThemeService = (0, f.createDecorator)('ThemeService')),
            (a.ILinkProviderService = (0, f.createDecorator)(
              'LinkProviderService'
            )));
          },
          6731: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (x, S, k, T) {
                  var B,
                    O = arguments.length,
                    A =
                      O < 3
                        ? S
                        : T === null
                          ? (T = Object.getOwnPropertyDescriptor(S, k))
                          : T;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    A = Reflect.decorate(x, S, k, T);
                  else
                    for (var H = x.length - 1; H >= 0; H--)
                      (B = x[H]) &&
                        (A =
                          (O < 3 ? B(A) : O > 3 ? B(S, k, A) : B(S, k)) || A);
                  return (O > 3 && A && Object.defineProperty(S, k, A), A);
                },
              g =
                (this && this.__param) ||
                function (x, S) {
                  return function (k, T) {
                    S(k, T, x);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.ThemeService = a.DEFAULT_ANSI_COLORS = void 0));
            const u = l(7239),
              d = l(8055),
              v = l(8460),
              w = l(844),
              p = l(2585),
              c = d.css.toColor('#ffffff'),
              n = d.css.toColor('#000000'),
              s = d.css.toColor('#ffffff'),
              o = d.css.toColor('#000000'),
              _ = { css: 'rgba(255, 255, 255, 0.3)', rgba: 4294967117 };
            a.DEFAULT_ANSI_COLORS = Object.freeze(
              (() => {
                const x = [
                    d.css.toColor('#2e3436'),
                    d.css.toColor('#cc0000'),
                    d.css.toColor('#4e9a06'),
                    d.css.toColor('#c4a000'),
                    d.css.toColor('#3465a4'),
                    d.css.toColor('#75507b'),
                    d.css.toColor('#06989a'),
                    d.css.toColor('#d3d7cf'),
                    d.css.toColor('#555753'),
                    d.css.toColor('#ef2929'),
                    d.css.toColor('#8ae234'),
                    d.css.toColor('#fce94f'),
                    d.css.toColor('#729fcf'),
                    d.css.toColor('#ad7fa8'),
                    d.css.toColor('#34e2e2'),
                    d.css.toColor('#eeeeec'),
                  ],
                  S = [0, 95, 135, 175, 215, 255];
                for (let k = 0; k < 216; k++) {
                  const T = S[(k / 36) % 6 | 0],
                    B = S[(k / 6) % 6 | 0],
                    O = S[k % 6];
                  x.push({
                    css: d.channels.toCss(T, B, O),
                    rgba: d.channels.toRgba(T, B, O),
                  });
                }
                for (let k = 0; k < 24; k++) {
                  const T = 8 + 10 * k;
                  x.push({
                    css: d.channels.toCss(T, T, T),
                    rgba: d.channels.toRgba(T, T, T),
                  });
                }
                return x;
              })()
            );
            let C = (a.ThemeService = class extends w.Disposable {
              get colors() {
                return this._colors;
              }
              constructor(x) {
                (super(),
                (this._optionsService = x),
                (this._contrastCache = new u.ColorContrastCache()),
                (this._halfContrastCache = new u.ColorContrastCache()),
                (this._onChangeColors = this.register(new v.EventEmitter())),
                (this.onChangeColors = this._onChangeColors.event),
                (this._colors = {
                  foreground: c,
                  background: n,
                  cursor: s,
                  cursorAccent: o,
                  selectionForeground: void 0,
                  selectionBackgroundTransparent: _,
                  selectionBackgroundOpaque: d.color.blend(n, _),
                  selectionInactiveBackgroundTransparent: _,
                  selectionInactiveBackgroundOpaque: d.color.blend(n, _),
                  ansi: a.DEFAULT_ANSI_COLORS.slice(),
                  contrastCache: this._contrastCache,
                  halfContrastCache: this._halfContrastCache,
                }),
                this._updateRestoreColors(),
                this._setTheme(this._optionsService.rawOptions.theme),
                this.register(
                  this._optionsService.onSpecificOptionChange(
                    'minimumContrastRatio',
                    () => this._contrastCache.clear()
                  )
                ),
                this.register(
                  this._optionsService.onSpecificOptionChange('theme', () =>
                    this._setTheme(this._optionsService.rawOptions.theme)
                  )
                ));
              }
              _setTheme(x = {}) {
                const S = this._colors;
                if (
                  ((S.foreground = b(x.foreground, c)),
                  (S.background = b(x.background, n)),
                  (S.cursor = b(x.cursor, s)),
                  (S.cursorAccent = b(x.cursorAccent, o)),
                  (S.selectionBackgroundTransparent = b(
                    x.selectionBackground,
                    _
                  )),
                  (S.selectionBackgroundOpaque = d.color.blend(
                    S.background,
                    S.selectionBackgroundTransparent
                  )),
                  (S.selectionInactiveBackgroundTransparent = b(
                    x.selectionInactiveBackground,
                    S.selectionBackgroundTransparent
                  )),
                  (S.selectionInactiveBackgroundOpaque = d.color.blend(
                    S.background,
                    S.selectionInactiveBackgroundTransparent
                  )),
                  (S.selectionForeground = x.selectionForeground
                    ? b(x.selectionForeground, d.NULL_COLOR)
                    : void 0),
                  S.selectionForeground === d.NULL_COLOR &&
                    (S.selectionForeground = void 0),
                  d.color.isOpaque(S.selectionBackgroundTransparent) &&
                    (S.selectionBackgroundTransparent = d.color.opacity(
                      S.selectionBackgroundTransparent,
                      0.3
                    )),
                  d.color.isOpaque(S.selectionInactiveBackgroundTransparent) &&
                    (S.selectionInactiveBackgroundTransparent = d.color.opacity(
                      S.selectionInactiveBackgroundTransparent,
                      0.3
                    )),
                  (S.ansi = a.DEFAULT_ANSI_COLORS.slice()),
                  (S.ansi[0] = b(x.black, a.DEFAULT_ANSI_COLORS[0])),
                  (S.ansi[1] = b(x.red, a.DEFAULT_ANSI_COLORS[1])),
                  (S.ansi[2] = b(x.green, a.DEFAULT_ANSI_COLORS[2])),
                  (S.ansi[3] = b(x.yellow, a.DEFAULT_ANSI_COLORS[3])),
                  (S.ansi[4] = b(x.blue, a.DEFAULT_ANSI_COLORS[4])),
                  (S.ansi[5] = b(x.magenta, a.DEFAULT_ANSI_COLORS[5])),
                  (S.ansi[6] = b(x.cyan, a.DEFAULT_ANSI_COLORS[6])),
                  (S.ansi[7] = b(x.white, a.DEFAULT_ANSI_COLORS[7])),
                  (S.ansi[8] = b(x.brightBlack, a.DEFAULT_ANSI_COLORS[8])),
                  (S.ansi[9] = b(x.brightRed, a.DEFAULT_ANSI_COLORS[9])),
                  (S.ansi[10] = b(x.brightGreen, a.DEFAULT_ANSI_COLORS[10])),
                  (S.ansi[11] = b(x.brightYellow, a.DEFAULT_ANSI_COLORS[11])),
                  (S.ansi[12] = b(x.brightBlue, a.DEFAULT_ANSI_COLORS[12])),
                  (S.ansi[13] = b(x.brightMagenta, a.DEFAULT_ANSI_COLORS[13])),
                  (S.ansi[14] = b(x.brightCyan, a.DEFAULT_ANSI_COLORS[14])),
                  (S.ansi[15] = b(x.brightWhite, a.DEFAULT_ANSI_COLORS[15])),
                  x.extendedAnsi)
                ) {
                  const k = Math.min(S.ansi.length - 16, x.extendedAnsi.length);
                  for (let T = 0; T < k; T++)
                    S.ansi[T + 16] = b(
                      x.extendedAnsi[T],
                      a.DEFAULT_ANSI_COLORS[T + 16]
                    );
                }
                (this._contrastCache.clear(),
                this._halfContrastCache.clear(),
                this._updateRestoreColors(),
                this._onChangeColors.fire(this.colors));
              }
              restoreColor(x) {
                (this._restoreColor(x), this._onChangeColors.fire(this.colors));
              }
              _restoreColor(x) {
                if (x !== void 0)
                  switch (x) {
                  case 256:
                    this._colors.foreground = this._restoreColors.foreground;
                    break;
                  case 257:
                    this._colors.background = this._restoreColors.background;
                    break;
                  case 258:
                    this._colors.cursor = this._restoreColors.cursor;
                    break;
                  default:
                    this._colors.ansi[x] = this._restoreColors.ansi[x];
                  }
                else
                  for (let S = 0; S < this._restoreColors.ansi.length; ++S)
                    this._colors.ansi[S] = this._restoreColors.ansi[S];
              }
              modifyColors(x) {
                (x(this._colors), this._onChangeColors.fire(this.colors));
              }
              _updateRestoreColors() {
                this._restoreColors = {
                  foreground: this._colors.foreground,
                  background: this._colors.background,
                  cursor: this._colors.cursor,
                  ansi: this._colors.ansi.slice(),
                };
              }
            });
            function b(x, S) {
              if (x !== void 0)
                try {
                  return d.css.toColor(x);
                } catch {}
              return S;
            }
            a.ThemeService = C = f([g(0, p.IOptionsService)], C);
          },
          6349: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.CircularList = void 0));
            const f = l(8460),
              g = l(844);
            class u extends g.Disposable {
              constructor(v) {
                (super(),
                (this._maxLength = v),
                (this.onDeleteEmitter = this.register(new f.EventEmitter())),
                (this.onDelete = this.onDeleteEmitter.event),
                (this.onInsertEmitter = this.register(new f.EventEmitter())),
                (this.onInsert = this.onInsertEmitter.event),
                (this.onTrimEmitter = this.register(new f.EventEmitter())),
                (this.onTrim = this.onTrimEmitter.event),
                (this._array = new Array(this._maxLength)),
                (this._startIndex = 0),
                (this._length = 0));
              }
              get maxLength() {
                return this._maxLength;
              }
              set maxLength(v) {
                if (this._maxLength === v) return;
                const w = new Array(v);
                for (let p = 0; p < Math.min(v, this.length); p++)
                  w[p] = this._array[this._getCyclicIndex(p)];
                ((this._array = w),
                (this._maxLength = v),
                (this._startIndex = 0));
              }
              get length() {
                return this._length;
              }
              set length(v) {
                if (v > this._length)
                  for (let w = this._length; w < v; w++)
                    this._array[w] = void 0;
                this._length = v;
              }
              get(v) {
                return this._array[this._getCyclicIndex(v)];
              }
              set(v, w) {
                this._array[this._getCyclicIndex(v)] = w;
              }
              push(v) {
                ((this._array[this._getCyclicIndex(this._length)] = v),
                this._length === this._maxLength
                  ? ((this._startIndex =
                        ++this._startIndex % this._maxLength),
                  this.onTrimEmitter.fire(1))
                  : this._length++);
              }
              recycle() {
                if (this._length !== this._maxLength)
                  throw new Error('Can only recycle when the buffer is full');
                return (
                  (this._startIndex = ++this._startIndex % this._maxLength),
                  this.onTrimEmitter.fire(1),
                  this._array[this._getCyclicIndex(this._length - 1)]
                );
              }
              get isFull() {
                return this._length === this._maxLength;
              }
              pop() {
                return this._array[this._getCyclicIndex(this._length-- - 1)];
              }
              splice(v, w, ...p) {
                if (w) {
                  for (let c = v; c < this._length - w; c++)
                    this._array[this._getCyclicIndex(c)] =
                      this._array[this._getCyclicIndex(c + w)];
                  ((this._length -= w),
                  this.onDeleteEmitter.fire({ index: v, amount: w }));
                }
                for (let c = this._length - 1; c >= v; c--)
                  this._array[this._getCyclicIndex(c + p.length)] =
                    this._array[this._getCyclicIndex(c)];
                for (let c = 0; c < p.length; c++)
                  this._array[this._getCyclicIndex(v + c)] = p[c];
                if (
                  (p.length &&
                    this.onInsertEmitter.fire({ index: v, amount: p.length }),
                  this._length + p.length > this._maxLength)
                ) {
                  const c = this._length + p.length - this._maxLength;
                  ((this._startIndex += c),
                  (this._length = this._maxLength),
                  this.onTrimEmitter.fire(c));
                } else this._length += p.length;
              }
              trimStart(v) {
                (v > this._length && (v = this._length),
                (this._startIndex += v),
                (this._length -= v),
                this.onTrimEmitter.fire(v));
              }
              shiftElements(v, w, p) {
                if (!(w <= 0)) {
                  if (v < 0 || v >= this._length)
                    throw new Error('start argument out of range');
                  if (v + p < 0)
                    throw new Error(
                      'Cannot shift elements in list beyond index 0'
                    );
                  if (p > 0) {
                    for (let n = w - 1; n >= 0; n--)
                      this.set(v + n + p, this.get(v + n));
                    const c = v + w + p - this._length;
                    if (c > 0)
                      for (this._length += c; this._length > this._maxLength; )
                        (this._length--,
                        this._startIndex++,
                        this.onTrimEmitter.fire(1));
                  } else
                    for (let c = 0; c < w; c++)
                      this.set(v + c + p, this.get(v + c));
                }
              }
              _getCyclicIndex(v) {
                return (this._startIndex + v) % this._maxLength;
              }
            }
            a.CircularList = u;
          },
          1439: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.clone = void 0),
            (a.clone = function l(f, g = 5) {
              if (typeof f != 'object') return f;
              const u = Array.isArray(f) ? [] : {};
              for (const d in f)
                u[d] = g <= 1 ? f[d] : f[d] && l(f[d], g - 1);
              return u;
            }));
          },
          8055: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.contrastRatio =
                a.toPaddedHex =
                a.rgba =
                a.rgb =
                a.css =
                a.color =
                a.channels =
                a.NULL_COLOR =
                  void 0));
            let l = 0,
              f = 0,
              g = 0,
              u = 0;
            var d, v, w, p, c;
            function n(o) {
              const _ = o.toString(16);
              return _.length < 2 ? '0' + _ : _;
            }
            function s(o, _) {
              return o < _ ? (_ + 0.05) / (o + 0.05) : (o + 0.05) / (_ + 0.05);
            }
            ((a.NULL_COLOR = { css: '#00000000', rgba: 0 }),
            (function (o) {
              ((o.toCss = function (_, C, b, x) {
                return x !== void 0
                  ? `#${n(_)}${n(C)}${n(b)}${n(x)}`
                  : `#${n(_)}${n(C)}${n(b)}`;
              }),
              (o.toRgba = function (_, C, b, x = 255) {
                return ((_ << 24) | (C << 16) | (b << 8) | x) >>> 0;
              }),
              (o.toColor = function (_, C, b, x) {
                return {
                  css: o.toCss(_, C, b, x),
                  rgba: o.toRgba(_, C, b, x),
                };
              }));
            })(d || (a.channels = d = {})),
            (function (o) {
              function _(C, b) {
                return (
                  (u = Math.round(255 * b)),
                  ([l, f, g] = c.toChannels(C.rgba)),
                  { css: d.toCss(l, f, g, u), rgba: d.toRgba(l, f, g, u) }
                );
              }
              ((o.blend = function (C, b) {
                if (((u = (255 & b.rgba) / 255), u === 1))
                  return { css: b.css, rgba: b.rgba };
                const x = (b.rgba >> 24) & 255,
                  S = (b.rgba >> 16) & 255,
                  k = (b.rgba >> 8) & 255,
                  T = (C.rgba >> 24) & 255,
                  B = (C.rgba >> 16) & 255,
                  O = (C.rgba >> 8) & 255;
                return (
                  (l = T + Math.round((x - T) * u)),
                  (f = B + Math.round((S - B) * u)),
                  (g = O + Math.round((k - O) * u)),
                  { css: d.toCss(l, f, g), rgba: d.toRgba(l, f, g) }
                );
              }),
              (o.isOpaque = function (C) {
                return (255 & C.rgba) == 255;
              }),
              (o.ensureContrastRatio = function (C, b, x) {
                const S = c.ensureContrastRatio(C.rgba, b.rgba, x);
                if (S)
                  return d.toColor(
                    (S >> 24) & 255,
                    (S >> 16) & 255,
                    (S >> 8) & 255
                  );
              }),
              (o.opaque = function (C) {
                const b = (255 | C.rgba) >>> 0;
                return (
                  ([l, f, g] = c.toChannels(b)),
                  { css: d.toCss(l, f, g), rgba: b }
                );
              }),
              (o.opacity = _),
              (o.multiplyOpacity = function (C, b) {
                return ((u = 255 & C.rgba), _(C, (u * b) / 255));
              }),
              (o.toColorRGB = function (C) {
                return [
                  (C.rgba >> 24) & 255,
                  (C.rgba >> 16) & 255,
                  (C.rgba >> 8) & 255,
                ];
              }));
            })(v || (a.color = v = {})),
            (function (o) {
              let _, C;
              try {
                const b = document.createElement('canvas');
                ((b.width = 1), (b.height = 1));
                const x = b.getContext('2d', { willReadFrequently: !0 });
                x &&
                    ((_ = x),
                    (_.globalCompositeOperation = 'copy'),
                    (C = _.createLinearGradient(0, 0, 1, 1)));
              } catch {}
              o.toColor = function (b) {
                if (b.match(/#[\da-f]{3,8}/i))
                  switch (b.length) {
                  case 4:
                    return (
                      (l = parseInt(b.slice(1, 2).repeat(2), 16)),
                      (f = parseInt(b.slice(2, 3).repeat(2), 16)),
                      (g = parseInt(b.slice(3, 4).repeat(2), 16)),
                      d.toColor(l, f, g)
                    );
                  case 5:
                    return (
                      (l = parseInt(b.slice(1, 2).repeat(2), 16)),
                      (f = parseInt(b.slice(2, 3).repeat(2), 16)),
                      (g = parseInt(b.slice(3, 4).repeat(2), 16)),
                      (u = parseInt(b.slice(4, 5).repeat(2), 16)),
                      d.toColor(l, f, g, u)
                    );
                  case 7:
                    return {
                      css: b,
                      rgba: ((parseInt(b.slice(1), 16) << 8) | 255) >>> 0,
                    };
                  case 9:
                    return { css: b, rgba: parseInt(b.slice(1), 16) >>> 0 };
                  }
                const x = b.match(
                  /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(0|1|\d?\.(\d+))\s*)?\)/
                );
                if (x)
                  return (
                    (l = parseInt(x[1])),
                    (f = parseInt(x[2])),
                    (g = parseInt(x[3])),
                    (u = Math.round(
                      255 * (x[5] === void 0 ? 1 : parseFloat(x[5]))
                    )),
                    d.toColor(l, f, g, u)
                  );
                if (!_ || !C)
                  throw new Error('css.toColor: Unsupported css format');
                if (
                  ((_.fillStyle = C),
                  (_.fillStyle = b),
                  typeof _.fillStyle != 'string')
                )
                  throw new Error('css.toColor: Unsupported css format');
                if (
                  (_.fillRect(0, 0, 1, 1),
                  ([l, f, g, u] = _.getImageData(0, 0, 1, 1).data),
                  u !== 255)
                )
                  throw new Error('css.toColor: Unsupported css format');
                return { rgba: d.toRgba(l, f, g, u), css: b };
              };
            })(w || (a.css = w = {})),
            (function (o) {
              function _(C, b, x) {
                const S = C / 255,
                  k = b / 255,
                  T = x / 255;
                return (
                  0.2126 *
                      (S <= 0.03928
                        ? S / 12.92
                        : Math.pow((S + 0.055) / 1.055, 2.4)) +
                    0.7152 *
                      (k <= 0.03928
                        ? k / 12.92
                        : Math.pow((k + 0.055) / 1.055, 2.4)) +
                    0.0722 *
                      (T <= 0.03928
                        ? T / 12.92
                        : Math.pow((T + 0.055) / 1.055, 2.4))
                );
              }
              ((o.relativeLuminance = function (C) {
                return _((C >> 16) & 255, (C >> 8) & 255, 255 & C);
              }),
              (o.relativeLuminance2 = _));
            })(p || (a.rgb = p = {})),
            (function (o) {
              function _(b, x, S) {
                const k = (b >> 24) & 255,
                  T = (b >> 16) & 255,
                  B = (b >> 8) & 255;
                let O = (x >> 24) & 255,
                  A = (x >> 16) & 255,
                  H = (x >> 8) & 255,
                  W = s(
                    p.relativeLuminance2(O, A, H),
                    p.relativeLuminance2(k, T, B)
                  );
                for (; W < S && (O > 0 || A > 0 || H > 0); )
                  ((O -= Math.max(0, Math.ceil(0.1 * O))),
                  (A -= Math.max(0, Math.ceil(0.1 * A))),
                  (H -= Math.max(0, Math.ceil(0.1 * H))),
                  (W = s(
                    p.relativeLuminance2(O, A, H),
                    p.relativeLuminance2(k, T, B)
                  )));
                return ((O << 24) | (A << 16) | (H << 8) | 255) >>> 0;
              }
              function C(b, x, S) {
                const k = (b >> 24) & 255,
                  T = (b >> 16) & 255,
                  B = (b >> 8) & 255;
                let O = (x >> 24) & 255,
                  A = (x >> 16) & 255,
                  H = (x >> 8) & 255,
                  W = s(
                    p.relativeLuminance2(O, A, H),
                    p.relativeLuminance2(k, T, B)
                  );
                for (; W < S && (O < 255 || A < 255 || H < 255); )
                  ((O = Math.min(255, O + Math.ceil(0.1 * (255 - O)))),
                  (A = Math.min(255, A + Math.ceil(0.1 * (255 - A)))),
                  (H = Math.min(255, H + Math.ceil(0.1 * (255 - H)))),
                  (W = s(
                    p.relativeLuminance2(O, A, H),
                    p.relativeLuminance2(k, T, B)
                  )));
                return ((O << 24) | (A << 16) | (H << 8) | 255) >>> 0;
              }
              ((o.blend = function (b, x) {
                if (((u = (255 & x) / 255), u === 1)) return x;
                const S = (x >> 24) & 255,
                  k = (x >> 16) & 255,
                  T = (x >> 8) & 255,
                  B = (b >> 24) & 255,
                  O = (b >> 16) & 255,
                  A = (b >> 8) & 255;
                return (
                  (l = B + Math.round((S - B) * u)),
                  (f = O + Math.round((k - O) * u)),
                  (g = A + Math.round((T - A) * u)),
                  d.toRgba(l, f, g)
                );
              }),
              (o.ensureContrastRatio = function (b, x, S) {
                const k = p.relativeLuminance(b >> 8),
                  T = p.relativeLuminance(x >> 8);
                if (s(k, T) < S) {
                  if (T < k) {
                    const A = _(b, x, S),
                      H = s(k, p.relativeLuminance(A >> 8));
                    if (H < S) {
                      const W = C(b, x, S);
                      return H > s(k, p.relativeLuminance(W >> 8)) ? A : W;
                    }
                    return A;
                  }
                  const B = C(b, x, S),
                    O = s(k, p.relativeLuminance(B >> 8));
                  if (O < S) {
                    const A = _(b, x, S);
                    return O > s(k, p.relativeLuminance(A >> 8)) ? B : A;
                  }
                  return B;
                }
              }),
              (o.reduceLuminance = _),
              (o.increaseLuminance = C),
              (o.toChannels = function (b) {
                return [
                  (b >> 24) & 255,
                  (b >> 16) & 255,
                  (b >> 8) & 255,
                  255 & b,
                ];
              }));
            })(c || (a.rgba = c = {})),
            (a.toPaddedHex = n),
            (a.contrastRatio = s));
          },
          8969: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.CoreTerminal = void 0));
            const f = l(844),
              g = l(2585),
              u = l(4348),
              d = l(7866),
              v = l(744),
              w = l(7302),
              p = l(6975),
              c = l(8460),
              n = l(1753),
              s = l(1480),
              o = l(7994),
              _ = l(9282),
              C = l(5435),
              b = l(5981),
              x = l(2660);
            let S = !1;
            class k extends f.Disposable {
              get onScroll() {
                return (
                  this._onScrollApi ||
                    ((this._onScrollApi = this.register(new c.EventEmitter())),
                    this._onScroll.event((B) => {
                      var O;
                      (O = this._onScrollApi) == null || O.fire(B.position);
                    })),
                  this._onScrollApi.event
                );
              }
              get cols() {
                return this._bufferService.cols;
              }
              get rows() {
                return this._bufferService.rows;
              }
              get buffers() {
                return this._bufferService.buffers;
              }
              get options() {
                return this.optionsService.options;
              }
              set options(B) {
                for (const O in B) this.optionsService.options[O] = B[O];
              }
              constructor(B) {
                (super(),
                (this._windowsWrappingHeuristics = this.register(
                  new f.MutableDisposable()
                )),
                (this._onBinary = this.register(new c.EventEmitter())),
                (this.onBinary = this._onBinary.event),
                (this._onData = this.register(new c.EventEmitter())),
                (this.onData = this._onData.event),
                (this._onLineFeed = this.register(new c.EventEmitter())),
                (this.onLineFeed = this._onLineFeed.event),
                (this._onResize = this.register(new c.EventEmitter())),
                (this.onResize = this._onResize.event),
                (this._onWriteParsed = this.register(new c.EventEmitter())),
                (this.onWriteParsed = this._onWriteParsed.event),
                (this._onScroll = this.register(new c.EventEmitter())),
                (this._instantiationService = new u.InstantiationService()),
                (this.optionsService = this.register(
                  new w.OptionsService(B)
                )),
                this._instantiationService.setService(
                  g.IOptionsService,
                  this.optionsService
                ),
                (this._bufferService = this.register(
                  this._instantiationService.createInstance(v.BufferService)
                )),
                this._instantiationService.setService(
                  g.IBufferService,
                  this._bufferService
                ),
                (this._logService = this.register(
                  this._instantiationService.createInstance(d.LogService)
                )),
                this._instantiationService.setService(
                  g.ILogService,
                  this._logService
                ),
                (this.coreService = this.register(
                  this._instantiationService.createInstance(p.CoreService)
                )),
                this._instantiationService.setService(
                  g.ICoreService,
                  this.coreService
                ),
                (this.coreMouseService = this.register(
                  this._instantiationService.createInstance(
                    n.CoreMouseService
                  )
                )),
                this._instantiationService.setService(
                  g.ICoreMouseService,
                  this.coreMouseService
                ),
                (this.unicodeService = this.register(
                  this._instantiationService.createInstance(s.UnicodeService)
                )),
                this._instantiationService.setService(
                  g.IUnicodeService,
                  this.unicodeService
                ),
                (this._charsetService =
                    this._instantiationService.createInstance(
                      o.CharsetService
                    )),
                this._instantiationService.setService(
                  g.ICharsetService,
                  this._charsetService
                ),
                (this._oscLinkService =
                    this._instantiationService.createInstance(
                      x.OscLinkService
                    )),
                this._instantiationService.setService(
                  g.IOscLinkService,
                  this._oscLinkService
                ),
                (this._inputHandler = this.register(
                  new C.InputHandler(
                    this._bufferService,
                    this._charsetService,
                    this.coreService,
                    this._logService,
                    this.optionsService,
                    this._oscLinkService,
                    this.coreMouseService,
                    this.unicodeService
                  )
                )),
                this.register(
                  (0, c.forwardEvent)(
                    this._inputHandler.onLineFeed,
                    this._onLineFeed
                  )
                ),
                this.register(this._inputHandler),
                this.register(
                  (0, c.forwardEvent)(
                    this._bufferService.onResize,
                    this._onResize
                  )
                ),
                this.register(
                  (0, c.forwardEvent)(this.coreService.onData, this._onData)
                ),
                this.register(
                  (0, c.forwardEvent)(
                    this.coreService.onBinary,
                    this._onBinary
                  )
                ),
                this.register(
                  this.coreService.onRequestScrollToBottom(() =>
                    this.scrollToBottom()
                  )
                ),
                this.register(
                  this.coreService.onUserInput(() =>
                    this._writeBuffer.handleUserInput()
                  )
                ),
                this.register(
                  this.optionsService.onMultipleOptionChange(
                    ['windowsMode', 'windowsPty'],
                    () => this._handleWindowsPtyOptionChange()
                  )
                ),
                this.register(
                  this._bufferService.onScroll((O) => {
                    (this._onScroll.fire({
                      position: this._bufferService.buffer.ydisp,
                      source: 0,
                    }),
                    this._inputHandler.markRangeDirty(
                      this._bufferService.buffer.scrollTop,
                      this._bufferService.buffer.scrollBottom
                    ));
                  })
                ),
                this.register(
                  this._inputHandler.onScroll((O) => {
                    (this._onScroll.fire({
                      position: this._bufferService.buffer.ydisp,
                      source: 0,
                    }),
                    this._inputHandler.markRangeDirty(
                      this._bufferService.buffer.scrollTop,
                      this._bufferService.buffer.scrollBottom
                    ));
                  })
                ),
                (this._writeBuffer = this.register(
                  new b.WriteBuffer((O, A) => this._inputHandler.parse(O, A))
                )),
                this.register(
                  (0, c.forwardEvent)(
                    this._writeBuffer.onWriteParsed,
                    this._onWriteParsed
                  )
                ));
              }
              write(B, O) {
                this._writeBuffer.write(B, O);
              }
              writeSync(B, O) {
                (this._logService.logLevel <= g.LogLevelEnum.WARN &&
                  !S &&
                  (this._logService.warn(
                    'writeSync is unreliable and will be removed soon.'
                  ),
                  (S = !0)),
                this._writeBuffer.writeSync(B, O));
              }
              input(B, O = !0) {
                this.coreService.triggerDataEvent(B, O);
              }
              resize(B, O) {
                isNaN(B) ||
                  isNaN(O) ||
                  ((B = Math.max(B, v.MINIMUM_COLS)),
                  (O = Math.max(O, v.MINIMUM_ROWS)),
                  this._bufferService.resize(B, O));
              }
              scroll(B, O = !1) {
                this._bufferService.scroll(B, O);
              }
              scrollLines(B, O, A) {
                this._bufferService.scrollLines(B, O, A);
              }
              scrollPages(B) {
                this.scrollLines(B * (this.rows - 1));
              }
              scrollToTop() {
                this.scrollLines(-this._bufferService.buffer.ydisp);
              }
              scrollToBottom() {
                this.scrollLines(
                  this._bufferService.buffer.ybase -
                    this._bufferService.buffer.ydisp
                );
              }
              scrollToLine(B) {
                const O = B - this._bufferService.buffer.ydisp;
                O !== 0 && this.scrollLines(O);
              }
              registerEscHandler(B, O) {
                return this._inputHandler.registerEscHandler(B, O);
              }
              registerDcsHandler(B, O) {
                return this._inputHandler.registerDcsHandler(B, O);
              }
              registerCsiHandler(B, O) {
                return this._inputHandler.registerCsiHandler(B, O);
              }
              registerOscHandler(B, O) {
                return this._inputHandler.registerOscHandler(B, O);
              }
              _setup() {
                this._handleWindowsPtyOptionChange();
              }
              reset() {
                (this._inputHandler.reset(),
                this._bufferService.reset(),
                this._charsetService.reset(),
                this.coreService.reset(),
                this.coreMouseService.reset());
              }
              _handleWindowsPtyOptionChange() {
                let B = !1;
                const O = this.optionsService.rawOptions.windowsPty;
                (O && O.buildNumber !== void 0 && O.buildNumber !== void 0
                  ? (B = O.backend === 'conpty' && O.buildNumber < 21376)
                  : this.optionsService.rawOptions.windowsMode && (B = !0),
                B
                  ? this._enableWindowsWrappingHeuristics()
                  : this._windowsWrappingHeuristics.clear());
              }
              _enableWindowsWrappingHeuristics() {
                if (!this._windowsWrappingHeuristics.value) {
                  const B = [];
                  (B.push(
                    this.onLineFeed(
                      _.updateWindowsModeWrappedState.bind(
                        null,
                        this._bufferService
                      )
                    )
                  ),
                  B.push(
                    this.registerCsiHandler(
                      { final: 'H' },
                      () => (
                        (0, _.updateWindowsModeWrappedState)(
                          this._bufferService
                        ),
                        !1
                      )
                    )
                  ),
                  (this._windowsWrappingHeuristics.value = (0,
                  f.toDisposable)(() => {
                    for (const O of B) O.dispose();
                  })));
                }
              }
            }
            a.CoreTerminal = k;
          },
          8460: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.runAndSubscribe = a.forwardEvent = a.EventEmitter = void 0),
            (a.EventEmitter = class {
              constructor() {
                ((this._listeners = []), (this._disposed = !1));
              }
              get event() {
                return (
                  this._event ||
                      (this._event = (l) => (
                        this._listeners.push(l),
                        {
                          dispose: () => {
                            if (!this._disposed) {
                              for (let f = 0; f < this._listeners.length; f++)
                                if (this._listeners[f] === l)
                                  return void this._listeners.splice(f, 1);
                            }
                          },
                        }
                      )),
                  this._event
                );
              }
              fire(l, f) {
                const g = [];
                for (let u = 0; u < this._listeners.length; u++)
                  g.push(this._listeners[u]);
                for (let u = 0; u < g.length; u++) g[u].call(void 0, l, f);
              }
              dispose() {
                (this.clearListeners(), (this._disposed = !0));
              }
              clearListeners() {
                this._listeners && (this._listeners.length = 0);
              }
            }),
            (a.forwardEvent = function (l, f) {
              return l((g) => f.fire(g));
            }),
            (a.runAndSubscribe = function (l, f) {
              return (f(void 0), l((g) => f(g)));
            }));
          },
          5435: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (I, E, R, D) {
                  var P,
                    F = arguments.length,
                    U =
                      F < 3
                        ? E
                        : D === null
                          ? (D = Object.getOwnPropertyDescriptor(E, R))
                          : D;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    U = Reflect.decorate(I, E, R, D);
                  else
                    for (var Y = I.length - 1; Y >= 0; Y--)
                      (P = I[Y]) &&
                        (U =
                          (F < 3 ? P(U) : F > 3 ? P(E, R, U) : P(E, R)) || U);
                  return (F > 3 && U && Object.defineProperty(E, R, U), U);
                },
              g =
                (this && this.__param) ||
                function (I, E) {
                  return function (R, D) {
                    E(R, D, I);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.InputHandler = a.WindowsOptionsReportType = void 0));
            const u = l(2584),
              d = l(7116),
              v = l(2015),
              w = l(844),
              p = l(482),
              c = l(8437),
              n = l(8460),
              s = l(643),
              o = l(511),
              _ = l(3734),
              C = l(2585),
              b = l(1480),
              x = l(6242),
              S = l(6351),
              k = l(5941),
              T = { '(': 0, ')': 1, '*': 2, '+': 3, '-': 1, '.': 2 },
              B = 131072;
            function O(I, E) {
              if (I > 24) return E.setWinLines || !1;
              switch (I) {
              case 1:
                return !!E.restoreWin;
              case 2:
                return !!E.minimizeWin;
              case 3:
                return !!E.setWinPosition;
              case 4:
                return !!E.setWinSizePixels;
              case 5:
                return !!E.raiseWin;
              case 6:
                return !!E.lowerWin;
              case 7:
                return !!E.refreshWin;
              case 8:
                return !!E.setWinSizeChars;
              case 9:
                return !!E.maximizeWin;
              case 10:
                return !!E.fullscreenWin;
              case 11:
                return !!E.getWinState;
              case 13:
                return !!E.getWinPosition;
              case 14:
                return !!E.getWinSizePixels;
              case 15:
                return !!E.getScreenSizePixels;
              case 16:
                return !!E.getCellSizePixels;
              case 18:
                return !!E.getWinSizeChars;
              case 19:
                return !!E.getScreenSizeChars;
              case 20:
                return !!E.getIconTitle;
              case 21:
                return !!E.getWinTitle;
              case 22:
                return !!E.pushTitle;
              case 23:
                return !!E.popTitle;
              case 24:
                return !!E.setWinLines;
              }
              return !1;
            }
            var A;
            (function (I) {
              ((I[(I.GET_WIN_SIZE_PIXELS = 0)] = 'GET_WIN_SIZE_PIXELS'),
              (I[(I.GET_CELL_SIZE_PIXELS = 1)] = 'GET_CELL_SIZE_PIXELS'));
            })(A || (a.WindowsOptionsReportType = A = {}));
            let H = 0;
            class W extends w.Disposable {
              getAttrData() {
                return this._curAttrData;
              }
              constructor(
                E,
                R,
                D,
                P,
                F,
                U,
                Y,
                z,
                M = new v.EscapeSequenceParser()
              ) {
                (super(),
                (this._bufferService = E),
                (this._charsetService = R),
                (this._coreService = D),
                (this._logService = P),
                (this._optionsService = F),
                (this._oscLinkService = U),
                (this._coreMouseService = Y),
                (this._unicodeService = z),
                (this._parser = M),
                (this._parseBuffer = new Uint32Array(4096)),
                (this._stringDecoder = new p.StringToUtf32()),
                (this._utf8Decoder = new p.Utf8ToUtf32()),
                (this._workCell = new o.CellData()),
                (this._windowTitle = ''),
                (this._iconName = ''),
                (this._windowTitleStack = []),
                (this._iconNameStack = []),
                (this._curAttrData = c.DEFAULT_ATTR_DATA.clone()),
                (this._eraseAttrDataInternal = c.DEFAULT_ATTR_DATA.clone()),
                (this._onRequestBell = this.register(new n.EventEmitter())),
                (this.onRequestBell = this._onRequestBell.event),
                (this._onRequestRefreshRows = this.register(
                  new n.EventEmitter()
                )),
                (this.onRequestRefreshRows =
                    this._onRequestRefreshRows.event),
                (this._onRequestReset = this.register(new n.EventEmitter())),
                (this.onRequestReset = this._onRequestReset.event),
                (this._onRequestSendFocus = this.register(
                  new n.EventEmitter()
                )),
                (this.onRequestSendFocus = this._onRequestSendFocus.event),
                (this._onRequestSyncScrollBar = this.register(
                  new n.EventEmitter()
                )),
                (this.onRequestSyncScrollBar =
                    this._onRequestSyncScrollBar.event),
                (this._onRequestWindowsOptionsReport = this.register(
                  new n.EventEmitter()
                )),
                (this.onRequestWindowsOptionsReport =
                    this._onRequestWindowsOptionsReport.event),
                (this._onA11yChar = this.register(new n.EventEmitter())),
                (this.onA11yChar = this._onA11yChar.event),
                (this._onA11yTab = this.register(new n.EventEmitter())),
                (this.onA11yTab = this._onA11yTab.event),
                (this._onCursorMove = this.register(new n.EventEmitter())),
                (this.onCursorMove = this._onCursorMove.event),
                (this._onLineFeed = this.register(new n.EventEmitter())),
                (this.onLineFeed = this._onLineFeed.event),
                (this._onScroll = this.register(new n.EventEmitter())),
                (this.onScroll = this._onScroll.event),
                (this._onTitleChange = this.register(new n.EventEmitter())),
                (this.onTitleChange = this._onTitleChange.event),
                (this._onColor = this.register(new n.EventEmitter())),
                (this.onColor = this._onColor.event),
                (this._parseStack = {
                  paused: !1,
                  cursorStartX: 0,
                  cursorStartY: 0,
                  decodedLength: 0,
                  position: 0,
                }),
                (this._specialColors = [256, 257, 258]),
                this.register(this._parser),
                (this._dirtyRowTracker = new $(this._bufferService)),
                (this._activeBuffer = this._bufferService.buffer),
                this.register(
                  this._bufferService.buffers.onBufferActivate(
                    (L) => (this._activeBuffer = L.activeBuffer)
                  )
                ),
                this._parser.setCsiHandlerFallback((L, j) => {
                  this._logService.debug('Unknown CSI code: ', {
                    identifier: this._parser.identToString(L),
                    params: j.toArray(),
                  });
                }),
                this._parser.setEscHandlerFallback((L) => {
                  this._logService.debug('Unknown ESC code: ', {
                    identifier: this._parser.identToString(L),
                  });
                }),
                this._parser.setExecuteHandlerFallback((L) => {
                  this._logService.debug('Unknown EXECUTE code: ', {
                    code: L,
                  });
                }),
                this._parser.setOscHandlerFallback((L, j, N) => {
                  this._logService.debug('Unknown OSC code: ', {
                    identifier: L,
                    action: j,
                    data: N,
                  });
                }),
                this._parser.setDcsHandlerFallback((L, j, N) => {
                  (j === 'HOOK' && (N = N.toArray()),
                  this._logService.debug('Unknown DCS code: ', {
                    identifier: this._parser.identToString(L),
                    action: j,
                    payload: N,
                  }));
                }),
                this._parser.setPrintHandler((L, j, N) =>
                  this.print(L, j, N)
                ),
                this._parser.registerCsiHandler({ final: '@' }, (L) =>
                  this.insertChars(L)
                ),
                this._parser.registerCsiHandler(
                  { intermediates: ' ', final: '@' },
                  (L) => this.scrollLeft(L)
                ),
                this._parser.registerCsiHandler({ final: 'A' }, (L) =>
                  this.cursorUp(L)
                ),
                this._parser.registerCsiHandler(
                  { intermediates: ' ', final: 'A' },
                  (L) => this.scrollRight(L)
                ),
                this._parser.registerCsiHandler({ final: 'B' }, (L) =>
                  this.cursorDown(L)
                ),
                this._parser.registerCsiHandler({ final: 'C' }, (L) =>
                  this.cursorForward(L)
                ),
                this._parser.registerCsiHandler({ final: 'D' }, (L) =>
                  this.cursorBackward(L)
                ),
                this._parser.registerCsiHandler({ final: 'E' }, (L) =>
                  this.cursorNextLine(L)
                ),
                this._parser.registerCsiHandler({ final: 'F' }, (L) =>
                  this.cursorPrecedingLine(L)
                ),
                this._parser.registerCsiHandler({ final: 'G' }, (L) =>
                  this.cursorCharAbsolute(L)
                ),
                this._parser.registerCsiHandler({ final: 'H' }, (L) =>
                  this.cursorPosition(L)
                ),
                this._parser.registerCsiHandler({ final: 'I' }, (L) =>
                  this.cursorForwardTab(L)
                ),
                this._parser.registerCsiHandler({ final: 'J' }, (L) =>
                  this.eraseInDisplay(L, !1)
                ),
                this._parser.registerCsiHandler(
                  { prefix: '?', final: 'J' },
                  (L) => this.eraseInDisplay(L, !0)
                ),
                this._parser.registerCsiHandler({ final: 'K' }, (L) =>
                  this.eraseInLine(L, !1)
                ),
                this._parser.registerCsiHandler(
                  { prefix: '?', final: 'K' },
                  (L) => this.eraseInLine(L, !0)
                ),
                this._parser.registerCsiHandler({ final: 'L' }, (L) =>
                  this.insertLines(L)
                ),
                this._parser.registerCsiHandler({ final: 'M' }, (L) =>
                  this.deleteLines(L)
                ),
                this._parser.registerCsiHandler({ final: 'P' }, (L) =>
                  this.deleteChars(L)
                ),
                this._parser.registerCsiHandler({ final: 'S' }, (L) =>
                  this.scrollUp(L)
                ),
                this._parser.registerCsiHandler({ final: 'T' }, (L) =>
                  this.scrollDown(L)
                ),
                this._parser.registerCsiHandler({ final: 'X' }, (L) =>
                  this.eraseChars(L)
                ),
                this._parser.registerCsiHandler({ final: 'Z' }, (L) =>
                  this.cursorBackwardTab(L)
                ),
                this._parser.registerCsiHandler({ final: '`' }, (L) =>
                  this.charPosAbsolute(L)
                ),
                this._parser.registerCsiHandler({ final: 'a' }, (L) =>
                  this.hPositionRelative(L)
                ),
                this._parser.registerCsiHandler({ final: 'b' }, (L) =>
                  this.repeatPrecedingCharacter(L)
                ),
                this._parser.registerCsiHandler({ final: 'c' }, (L) =>
                  this.sendDeviceAttributesPrimary(L)
                ),
                this._parser.registerCsiHandler(
                  { prefix: '>', final: 'c' },
                  (L) => this.sendDeviceAttributesSecondary(L)
                ),
                this._parser.registerCsiHandler({ final: 'd' }, (L) =>
                  this.linePosAbsolute(L)
                ),
                this._parser.registerCsiHandler({ final: 'e' }, (L) =>
                  this.vPositionRelative(L)
                ),
                this._parser.registerCsiHandler({ final: 'f' }, (L) =>
                  this.hVPosition(L)
                ),
                this._parser.registerCsiHandler({ final: 'g' }, (L) =>
                  this.tabClear(L)
                ),
                this._parser.registerCsiHandler({ final: 'h' }, (L) =>
                  this.setMode(L)
                ),
                this._parser.registerCsiHandler(
                  { prefix: '?', final: 'h' },
                  (L) => this.setModePrivate(L)
                ),
                this._parser.registerCsiHandler({ final: 'l' }, (L) =>
                  this.resetMode(L)
                ),
                this._parser.registerCsiHandler(
                  { prefix: '?', final: 'l' },
                  (L) => this.resetModePrivate(L)
                ),
                this._parser.registerCsiHandler({ final: 'm' }, (L) =>
                  this.charAttributes(L)
                ),
                this._parser.registerCsiHandler({ final: 'n' }, (L) =>
                  this.deviceStatus(L)
                ),
                this._parser.registerCsiHandler(
                  { prefix: '?', final: 'n' },
                  (L) => this.deviceStatusPrivate(L)
                ),
                this._parser.registerCsiHandler(
                  { intermediates: '!', final: 'p' },
                  (L) => this.softReset(L)
                ),
                this._parser.registerCsiHandler(
                  { intermediates: ' ', final: 'q' },
                  (L) => this.setCursorStyle(L)
                ),
                this._parser.registerCsiHandler({ final: 'r' }, (L) =>
                  this.setScrollRegion(L)
                ),
                this._parser.registerCsiHandler({ final: 's' }, (L) =>
                  this.saveCursor(L)
                ),
                this._parser.registerCsiHandler({ final: 't' }, (L) =>
                  this.windowOptions(L)
                ),
                this._parser.registerCsiHandler({ final: 'u' }, (L) =>
                  this.restoreCursor(L)
                ),
                this._parser.registerCsiHandler(
                  { intermediates: '\'', final: '}' },
                  (L) => this.insertColumns(L)
                ),
                this._parser.registerCsiHandler(
                  { intermediates: '\'', final: '~' },
                  (L) => this.deleteColumns(L)
                ),
                this._parser.registerCsiHandler(
                  { intermediates: '"', final: 'q' },
                  (L) => this.selectProtected(L)
                ),
                this._parser.registerCsiHandler(
                  { intermediates: '$', final: 'p' },
                  (L) => this.requestMode(L, !0)
                ),
                this._parser.registerCsiHandler(
                  { prefix: '?', intermediates: '$', final: 'p' },
                  (L) => this.requestMode(L, !1)
                ),
                this._parser.setExecuteHandler(u.C0.BEL, () => this.bell()),
                this._parser.setExecuteHandler(u.C0.LF, () =>
                  this.lineFeed()
                ),
                this._parser.setExecuteHandler(u.C0.VT, () =>
                  this.lineFeed()
                ),
                this._parser.setExecuteHandler(u.C0.FF, () =>
                  this.lineFeed()
                ),
                this._parser.setExecuteHandler(u.C0.CR, () =>
                  this.carriageReturn()
                ),
                this._parser.setExecuteHandler(u.C0.BS, () =>
                  this.backspace()
                ),
                this._parser.setExecuteHandler(u.C0.HT, () => this.tab()),
                this._parser.setExecuteHandler(u.C0.SO, () =>
                  this.shiftOut()
                ),
                this._parser.setExecuteHandler(u.C0.SI, () => this.shiftIn()),
                this._parser.setExecuteHandler(u.C1.IND, () => this.index()),
                this._parser.setExecuteHandler(u.C1.NEL, () =>
                  this.nextLine()
                ),
                this._parser.setExecuteHandler(u.C1.HTS, () => this.tabSet()),
                this._parser.registerOscHandler(
                  0,
                  new x.OscHandler(
                    (L) => (this.setTitle(L), this.setIconName(L), !0)
                  )
                ),
                this._parser.registerOscHandler(
                  1,
                  new x.OscHandler((L) => this.setIconName(L))
                ),
                this._parser.registerOscHandler(
                  2,
                  new x.OscHandler((L) => this.setTitle(L))
                ),
                this._parser.registerOscHandler(
                  4,
                  new x.OscHandler((L) => this.setOrReportIndexedColor(L))
                ),
                this._parser.registerOscHandler(
                  8,
                  new x.OscHandler((L) => this.setHyperlink(L))
                ),
                this._parser.registerOscHandler(
                  10,
                  new x.OscHandler((L) => this.setOrReportFgColor(L))
                ),
                this._parser.registerOscHandler(
                  11,
                  new x.OscHandler((L) => this.setOrReportBgColor(L))
                ),
                this._parser.registerOscHandler(
                  12,
                  new x.OscHandler((L) => this.setOrReportCursorColor(L))
                ),
                this._parser.registerOscHandler(
                  104,
                  new x.OscHandler((L) => this.restoreIndexedColor(L))
                ),
                this._parser.registerOscHandler(
                  110,
                  new x.OscHandler((L) => this.restoreFgColor(L))
                ),
                this._parser.registerOscHandler(
                  111,
                  new x.OscHandler((L) => this.restoreBgColor(L))
                ),
                this._parser.registerOscHandler(
                  112,
                  new x.OscHandler((L) => this.restoreCursorColor(L))
                ),
                this._parser.registerEscHandler({ final: '7' }, () =>
                  this.saveCursor()
                ),
                this._parser.registerEscHandler({ final: '8' }, () =>
                  this.restoreCursor()
                ),
                this._parser.registerEscHandler({ final: 'D' }, () =>
                  this.index()
                ),
                this._parser.registerEscHandler({ final: 'E' }, () =>
                  this.nextLine()
                ),
                this._parser.registerEscHandler({ final: 'H' }, () =>
                  this.tabSet()
                ),
                this._parser.registerEscHandler({ final: 'M' }, () =>
                  this.reverseIndex()
                ),
                this._parser.registerEscHandler({ final: '=' }, () =>
                  this.keypadApplicationMode()
                ),
                this._parser.registerEscHandler({ final: '>' }, () =>
                  this.keypadNumericMode()
                ),
                this._parser.registerEscHandler({ final: 'c' }, () =>
                  this.fullReset()
                ),
                this._parser.registerEscHandler({ final: 'n' }, () =>
                  this.setgLevel(2)
                ),
                this._parser.registerEscHandler({ final: 'o' }, () =>
                  this.setgLevel(3)
                ),
                this._parser.registerEscHandler({ final: '|' }, () =>
                  this.setgLevel(3)
                ),
                this._parser.registerEscHandler({ final: '}' }, () =>
                  this.setgLevel(2)
                ),
                this._parser.registerEscHandler({ final: '~' }, () =>
                  this.setgLevel(1)
                ),
                this._parser.registerEscHandler(
                  { intermediates: '%', final: '@' },
                  () => this.selectDefaultCharset()
                ),
                this._parser.registerEscHandler(
                  { intermediates: '%', final: 'G' },
                  () => this.selectDefaultCharset()
                ));
                for (const L in d.CHARSETS)
                  (this._parser.registerEscHandler(
                    { intermediates: '(', final: L },
                    () => this.selectCharset('(' + L)
                  ),
                  this._parser.registerEscHandler(
                    { intermediates: ')', final: L },
                    () => this.selectCharset(')' + L)
                  ),
                  this._parser.registerEscHandler(
                    { intermediates: '*', final: L },
                    () => this.selectCharset('*' + L)
                  ),
                  this._parser.registerEscHandler(
                    { intermediates: '+', final: L },
                    () => this.selectCharset('+' + L)
                  ),
                  this._parser.registerEscHandler(
                    { intermediates: '-', final: L },
                    () => this.selectCharset('-' + L)
                  ),
                  this._parser.registerEscHandler(
                    { intermediates: '.', final: L },
                    () => this.selectCharset('.' + L)
                  ),
                  this._parser.registerEscHandler(
                    { intermediates: '/', final: L },
                    () => this.selectCharset('/' + L)
                  ));
                (this._parser.registerEscHandler(
                  { intermediates: '#', final: '8' },
                  () => this.screenAlignmentPattern()
                ),
                this._parser.setErrorHandler(
                  (L) => (this._logService.error('Parsing error: ', L), L)
                ),
                this._parser.registerDcsHandler(
                  { intermediates: '$', final: 'q' },
                  new S.DcsHandler((L, j) => this.requestStatusString(L, j))
                ));
              }
              _preserveStack(E, R, D, P) {
                ((this._parseStack.paused = !0),
                (this._parseStack.cursorStartX = E),
                (this._parseStack.cursorStartY = R),
                (this._parseStack.decodedLength = D),
                (this._parseStack.position = P));
              }
              _logSlowResolvingAsync(E) {
                this._logService.logLevel <= C.LogLevelEnum.WARN &&
                  Promise.race([
                    E,
                    new Promise((R, D) =>
                      setTimeout(() => D('#SLOW_TIMEOUT'), 5e3)
                    ),
                  ]).catch((R) => {
                    if (R !== '#SLOW_TIMEOUT') throw R;
                    console.warn(
                      'async parser handler taking longer than 5000 ms'
                    );
                  });
              }
              _getCurrentLinkId() {
                return this._curAttrData.extended.urlId;
              }
              parse(E, R) {
                let D,
                  P = this._activeBuffer.x,
                  F = this._activeBuffer.y,
                  U = 0;
                const Y = this._parseStack.paused;
                if (Y) {
                  if (
                    (D = this._parser.parse(
                      this._parseBuffer,
                      this._parseStack.decodedLength,
                      R
                    ))
                  )
                    return (this._logSlowResolvingAsync(D), D);
                  ((P = this._parseStack.cursorStartX),
                  (F = this._parseStack.cursorStartY),
                  (this._parseStack.paused = !1),
                  E.length > B && (U = this._parseStack.position + B));
                }
                if (
                  (this._logService.logLevel <= C.LogLevelEnum.DEBUG &&
                    this._logService.debug(
                      'parsing data' +
                        (typeof E == 'string'
                          ? ` "${E}"`
                          : ` "${Array.prototype.map.call(E, (L) => String.fromCharCode(L)).join('')}"`),
                      typeof E == 'string'
                        ? E.split('').map((L) => L.charCodeAt(0))
                        : E
                    ),
                  this._parseBuffer.length < E.length &&
                    this._parseBuffer.length < B &&
                    (this._parseBuffer = new Uint32Array(
                      Math.min(E.length, B)
                    )),
                  Y || this._dirtyRowTracker.clearRange(),
                  E.length > B)
                )
                  for (let L = U; L < E.length; L += B) {
                    const j = L + B < E.length ? L + B : E.length,
                      N =
                        typeof E == 'string'
                          ? this._stringDecoder.decode(
                            E.substring(L, j),
                            this._parseBuffer
                          )
                          : this._utf8Decoder.decode(
                            E.subarray(L, j),
                            this._parseBuffer
                          );
                    if ((D = this._parser.parse(this._parseBuffer, N)))
                      return (
                        this._preserveStack(P, F, N, L),
                        this._logSlowResolvingAsync(D),
                        D
                      );
                  }
                else if (!Y) {
                  const L =
                    typeof E == 'string'
                      ? this._stringDecoder.decode(E, this._parseBuffer)
                      : this._utf8Decoder.decode(E, this._parseBuffer);
                  if ((D = this._parser.parse(this._parseBuffer, L)))
                    return (
                      this._preserveStack(P, F, L, 0),
                      this._logSlowResolvingAsync(D),
                      D
                    );
                }
                (this._activeBuffer.x === P && this._activeBuffer.y === F) ||
                  this._onCursorMove.fire();
                const z =
                    this._dirtyRowTracker.end +
                    (this._bufferService.buffer.ybase -
                      this._bufferService.buffer.ydisp),
                  M =
                    this._dirtyRowTracker.start +
                    (this._bufferService.buffer.ybase -
                      this._bufferService.buffer.ydisp);
                M < this._bufferService.rows &&
                  this._onRequestRefreshRows.fire(
                    Math.min(M, this._bufferService.rows - 1),
                    Math.min(z, this._bufferService.rows - 1)
                  );
              }
              print(E, R, D) {
                let P, F;
                const U = this._charsetService.charset,
                  Y = this._optionsService.rawOptions.screenReaderMode,
                  z = this._bufferService.cols,
                  M = this._coreService.decPrivateModes.wraparound,
                  L = this._coreService.modes.insertMode,
                  j = this._curAttrData;
                let N = this._activeBuffer.lines.get(
                  this._activeBuffer.ybase + this._activeBuffer.y
                );
                (this._dirtyRowTracker.markDirty(this._activeBuffer.y),
                this._activeBuffer.x &&
                    D - R > 0 &&
                    N.getWidth(this._activeBuffer.x - 1) === 2 &&
                    N.setCellFromCodepoint(this._activeBuffer.x - 1, 0, 1, j));
                let X = this._parser.precedingJoinState;
                for (let q = R; q < D; ++q) {
                  if (((P = E[q]), P < 127 && U)) {
                    const Pe = U[String.fromCharCode(P)];
                    Pe && (P = Pe.charCodeAt(0));
                  }
                  const ee = this._unicodeService.charProperties(P, X);
                  F = b.UnicodeService.extractWidth(ee);
                  const de = b.UnicodeService.extractShouldJoin(ee),
                    fe = de ? b.UnicodeService.extractWidth(X) : 0;
                  if (
                    ((X = ee),
                    Y && this._onA11yChar.fire((0, p.stringFromCodePoint)(P)),
                    this._getCurrentLinkId() &&
                      this._oscLinkService.addLineToLink(
                        this._getCurrentLinkId(),
                        this._activeBuffer.ybase + this._activeBuffer.y
                      ),
                    this._activeBuffer.x + F - fe > z)
                  ) {
                    if (M) {
                      const Pe = N;
                      let J = this._activeBuffer.x - fe;
                      for (
                        this._activeBuffer.x = fe,
                        this._activeBuffer.y++,
                        this._activeBuffer.y ===
                          this._activeBuffer.scrollBottom + 1
                          ? (this._activeBuffer.y--,
                          this._bufferService.scroll(
                            this._eraseAttrData(),
                            !0
                          ))
                          : (this._activeBuffer.y >=
                                this._bufferService.rows &&
                                (this._activeBuffer.y =
                                  this._bufferService.rows - 1),
                          (this._activeBuffer.lines.get(
                            this._activeBuffer.ybase + this._activeBuffer.y
                          ).isWrapped = !0)),
                        N = this._activeBuffer.lines.get(
                          this._activeBuffer.ybase + this._activeBuffer.y
                        ),
                        fe > 0 &&
                            N instanceof c.BufferLine &&
                            N.copyCellsFrom(Pe, J, 0, fe, !1);
                        J < z;

                      )
                        Pe.setCellFromCodepoint(J++, 0, 1, j);
                    } else if (((this._activeBuffer.x = z - 1), F === 2))
                      continue;
                  }
                  if (de && this._activeBuffer.x) {
                    const Pe = N.getWidth(this._activeBuffer.x - 1) ? 1 : 2;
                    N.addCodepointToCell(this._activeBuffer.x - Pe, P, F);
                    for (let J = F - fe; --J >= 0; )
                      N.setCellFromCodepoint(this._activeBuffer.x++, 0, 0, j);
                  } else if (
                    (L &&
                      (N.insertCells(
                        this._activeBuffer.x,
                        F - fe,
                        this._activeBuffer.getNullCell(j)
                      ),
                      N.getWidth(z - 1) === 2 &&
                        N.setCellFromCodepoint(
                          z - 1,
                          s.NULL_CELL_CODE,
                          s.NULL_CELL_WIDTH,
                          j
                        )),
                    N.setCellFromCodepoint(this._activeBuffer.x++, P, F, j),
                    F > 0)
                  )
                    for (; --F; )
                      N.setCellFromCodepoint(this._activeBuffer.x++, 0, 0, j);
                }
                ((this._parser.precedingJoinState = X),
                this._activeBuffer.x < z &&
                    D - R > 0 &&
                    N.getWidth(this._activeBuffer.x) === 0 &&
                    !N.hasContent(this._activeBuffer.x) &&
                    N.setCellFromCodepoint(this._activeBuffer.x, 0, 1, j),
                this._dirtyRowTracker.markDirty(this._activeBuffer.y));
              }
              registerCsiHandler(E, R) {
                return E.final !== 't' || E.prefix || E.intermediates
                  ? this._parser.registerCsiHandler(E, R)
                  : this._parser.registerCsiHandler(
                    E,
                    (D) =>
                      !O(
                        D.params[0],
                        this._optionsService.rawOptions.windowOptions
                      ) || R(D)
                  );
              }
              registerDcsHandler(E, R) {
                return this._parser.registerDcsHandler(E, new S.DcsHandler(R));
              }
              registerEscHandler(E, R) {
                return this._parser.registerEscHandler(E, R);
              }
              registerOscHandler(E, R) {
                return this._parser.registerOscHandler(E, new x.OscHandler(R));
              }
              bell() {
                return (this._onRequestBell.fire(), !0);
              }
              lineFeed() {
                return (
                  this._dirtyRowTracker.markDirty(this._activeBuffer.y),
                  this._optionsService.rawOptions.convertEol &&
                    (this._activeBuffer.x = 0),
                  this._activeBuffer.y++,
                  this._activeBuffer.y === this._activeBuffer.scrollBottom + 1
                    ? (this._activeBuffer.y--,
                    this._bufferService.scroll(this._eraseAttrData()))
                    : this._activeBuffer.y >= this._bufferService.rows
                      ? (this._activeBuffer.y = this._bufferService.rows - 1)
                      : (this._activeBuffer.lines.get(
                        this._activeBuffer.ybase + this._activeBuffer.y
                      ).isWrapped = !1),
                  this._activeBuffer.x >= this._bufferService.cols &&
                    this._activeBuffer.x--,
                  this._dirtyRowTracker.markDirty(this._activeBuffer.y),
                  this._onLineFeed.fire(),
                  !0
                );
              }
              carriageReturn() {
                return ((this._activeBuffer.x = 0), !0);
              }
              backspace() {
                var E;
                if (!this._coreService.decPrivateModes.reverseWraparound)
                  return (
                    this._restrictCursor(),
                    this._activeBuffer.x > 0 && this._activeBuffer.x--,
                    !0
                  );
                if (
                  (this._restrictCursor(this._bufferService.cols),
                  this._activeBuffer.x > 0)
                )
                  this._activeBuffer.x--;
                else if (
                  this._activeBuffer.x === 0 &&
                  this._activeBuffer.y > this._activeBuffer.scrollTop &&
                  this._activeBuffer.y <= this._activeBuffer.scrollBottom &&
                  (E = this._activeBuffer.lines.get(
                    this._activeBuffer.ybase + this._activeBuffer.y
                  )) != null &&
                  E.isWrapped
                ) {
                  ((this._activeBuffer.lines.get(
                    this._activeBuffer.ybase + this._activeBuffer.y
                  ).isWrapped = !1),
                  this._activeBuffer.y--,
                  (this._activeBuffer.x = this._bufferService.cols - 1));
                  const R = this._activeBuffer.lines.get(
                    this._activeBuffer.ybase + this._activeBuffer.y
                  );
                  R.hasWidth(this._activeBuffer.x) &&
                    !R.hasContent(this._activeBuffer.x) &&
                    this._activeBuffer.x--;
                }
                return (this._restrictCursor(), !0);
              }
              tab() {
                if (this._activeBuffer.x >= this._bufferService.cols) return !0;
                const E = this._activeBuffer.x;
                return (
                  (this._activeBuffer.x = this._activeBuffer.nextStop()),
                  this._optionsService.rawOptions.screenReaderMode &&
                    this._onA11yTab.fire(this._activeBuffer.x - E),
                  !0
                );
              }
              shiftOut() {
                return (this._charsetService.setgLevel(1), !0);
              }
              shiftIn() {
                return (this._charsetService.setgLevel(0), !0);
              }
              _restrictCursor(E = this._bufferService.cols - 1) {
                ((this._activeBuffer.x = Math.min(
                  E,
                  Math.max(0, this._activeBuffer.x)
                )),
                (this._activeBuffer.y = this._coreService.decPrivateModes
                  .origin
                  ? Math.min(
                    this._activeBuffer.scrollBottom,
                    Math.max(
                      this._activeBuffer.scrollTop,
                      this._activeBuffer.y
                    )
                  )
                  : Math.min(
                    this._bufferService.rows - 1,
                    Math.max(0, this._activeBuffer.y)
                  )),
                this._dirtyRowTracker.markDirty(this._activeBuffer.y));
              }
              _setCursor(E, R) {
                (this._dirtyRowTracker.markDirty(this._activeBuffer.y),
                this._coreService.decPrivateModes.origin
                  ? ((this._activeBuffer.x = E),
                  (this._activeBuffer.y = this._activeBuffer.scrollTop + R))
                  : ((this._activeBuffer.x = E), (this._activeBuffer.y = R)),
                this._restrictCursor(),
                this._dirtyRowTracker.markDirty(this._activeBuffer.y));
              }
              _moveCursor(E, R) {
                (this._restrictCursor(),
                this._setCursor(
                  this._activeBuffer.x + E,
                  this._activeBuffer.y + R
                ));
              }
              cursorUp(E) {
                const R = this._activeBuffer.y - this._activeBuffer.scrollTop;
                return (
                  R >= 0
                    ? this._moveCursor(0, -Math.min(R, E.params[0] || 1))
                    : this._moveCursor(0, -(E.params[0] || 1)),
                  !0
                );
              }
              cursorDown(E) {
                const R =
                  this._activeBuffer.scrollBottom - this._activeBuffer.y;
                return (
                  R >= 0
                    ? this._moveCursor(0, Math.min(R, E.params[0] || 1))
                    : this._moveCursor(0, E.params[0] || 1),
                  !0
                );
              }
              cursorForward(E) {
                return (this._moveCursor(E.params[0] || 1, 0), !0);
              }
              cursorBackward(E) {
                return (this._moveCursor(-(E.params[0] || 1), 0), !0);
              }
              cursorNextLine(E) {
                return (this.cursorDown(E), (this._activeBuffer.x = 0), !0);
              }
              cursorPrecedingLine(E) {
                return (this.cursorUp(E), (this._activeBuffer.x = 0), !0);
              }
              cursorCharAbsolute(E) {
                return (
                  this._setCursor((E.params[0] || 1) - 1, this._activeBuffer.y),
                  !0
                );
              }
              cursorPosition(E) {
                return (
                  this._setCursor(
                    E.length >= 2 ? (E.params[1] || 1) - 1 : 0,
                    (E.params[0] || 1) - 1
                  ),
                  !0
                );
              }
              charPosAbsolute(E) {
                return (
                  this._setCursor((E.params[0] || 1) - 1, this._activeBuffer.y),
                  !0
                );
              }
              hPositionRelative(E) {
                return (this._moveCursor(E.params[0] || 1, 0), !0);
              }
              linePosAbsolute(E) {
                return (
                  this._setCursor(this._activeBuffer.x, (E.params[0] || 1) - 1),
                  !0
                );
              }
              vPositionRelative(E) {
                return (this._moveCursor(0, E.params[0] || 1), !0);
              }
              hVPosition(E) {
                return (this.cursorPosition(E), !0);
              }
              tabClear(E) {
                const R = E.params[0];
                return (
                  R === 0
                    ? delete this._activeBuffer.tabs[this._activeBuffer.x]
                    : R === 3 && (this._activeBuffer.tabs = {}),
                  !0
                );
              }
              cursorForwardTab(E) {
                if (this._activeBuffer.x >= this._bufferService.cols) return !0;
                let R = E.params[0] || 1;
                for (; R--; )
                  this._activeBuffer.x = this._activeBuffer.nextStop();
                return !0;
              }
              cursorBackwardTab(E) {
                if (this._activeBuffer.x >= this._bufferService.cols) return !0;
                let R = E.params[0] || 1;
                for (; R--; )
                  this._activeBuffer.x = this._activeBuffer.prevStop();
                return !0;
              }
              selectProtected(E) {
                const R = E.params[0];
                return (
                  R === 1 && (this._curAttrData.bg |= 536870912),
                  (R !== 2 && R !== 0) || (this._curAttrData.bg &= -536870913),
                  !0
                );
              }
              _eraseInBufferLine(E, R, D, P = !1, F = !1) {
                const U = this._activeBuffer.lines.get(
                  this._activeBuffer.ybase + E
                );
                (U.replaceCells(
                  R,
                  D,
                  this._activeBuffer.getNullCell(this._eraseAttrData()),
                  F
                ),
                P && (U.isWrapped = !1));
              }
              _resetBufferLine(E, R = !1) {
                const D = this._activeBuffer.lines.get(
                  this._activeBuffer.ybase + E
                );
                D &&
                  (D.fill(
                    this._activeBuffer.getNullCell(this._eraseAttrData()),
                    R
                  ),
                  this._bufferService.buffer.clearMarkers(
                    this._activeBuffer.ybase + E
                  ),
                  (D.isWrapped = !1));
              }
              eraseInDisplay(E, R = !1) {
                let D;
                switch (
                  (this._restrictCursor(this._bufferService.cols), E.params[0])
                ) {
                case 0:
                  for (
                    D = this._activeBuffer.y,
                    this._dirtyRowTracker.markDirty(D),
                    this._eraseInBufferLine(
                      D++,
                      this._activeBuffer.x,
                      this._bufferService.cols,
                      this._activeBuffer.x === 0,
                      R
                    );
                    D < this._bufferService.rows;
                    D++
                  )
                    this._resetBufferLine(D, R);
                  this._dirtyRowTracker.markDirty(D);
                  break;
                case 1:
                  for (
                    D = this._activeBuffer.y,
                    this._dirtyRowTracker.markDirty(D),
                    this._eraseInBufferLine(
                      D,
                      0,
                      this._activeBuffer.x + 1,
                      !0,
                      R
                    ),
                    this._activeBuffer.x + 1 >= this._bufferService.cols &&
                          (this._activeBuffer.lines.get(D + 1).isWrapped = !1);
                    D--;

                  )
                    this._resetBufferLine(D, R);
                  this._dirtyRowTracker.markDirty(0);
                  break;
                case 2:
                  for (
                    D = this._bufferService.rows,
                    this._dirtyRowTracker.markDirty(D - 1);
                    D--;

                  )
                    this._resetBufferLine(D, R);
                  this._dirtyRowTracker.markDirty(0);
                  break;
                case 3:
                  const P =
                      this._activeBuffer.lines.length -
                      this._bufferService.rows;
                  P > 0 &&
                      (this._activeBuffer.lines.trimStart(P),
                      (this._activeBuffer.ybase = Math.max(
                        this._activeBuffer.ybase - P,
                        0
                      )),
                      (this._activeBuffer.ydisp = Math.max(
                        this._activeBuffer.ydisp - P,
                        0
                      )),
                      this._onScroll.fire(0));
                }
                return !0;
              }
              eraseInLine(E, R = !1) {
                switch (
                  (this._restrictCursor(this._bufferService.cols), E.params[0])
                ) {
                case 0:
                  this._eraseInBufferLine(
                    this._activeBuffer.y,
                    this._activeBuffer.x,
                    this._bufferService.cols,
                    this._activeBuffer.x === 0,
                    R
                  );
                  break;
                case 1:
                  this._eraseInBufferLine(
                    this._activeBuffer.y,
                    0,
                    this._activeBuffer.x + 1,
                    !1,
                    R
                  );
                  break;
                case 2:
                  this._eraseInBufferLine(
                    this._activeBuffer.y,
                    0,
                    this._bufferService.cols,
                    !0,
                    R
                  );
                }
                return (
                  this._dirtyRowTracker.markDirty(this._activeBuffer.y),
                  !0
                );
              }
              insertLines(E) {
                this._restrictCursor();
                let R = E.params[0] || 1;
                if (
                  this._activeBuffer.y > this._activeBuffer.scrollBottom ||
                  this._activeBuffer.y < this._activeBuffer.scrollTop
                )
                  return !0;
                const D = this._activeBuffer.ybase + this._activeBuffer.y,
                  P =
                    this._bufferService.rows -
                    1 -
                    this._activeBuffer.scrollBottom,
                  F =
                    this._bufferService.rows -
                    1 +
                    this._activeBuffer.ybase -
                    P +
                    1;
                for (; R--; )
                  (this._activeBuffer.lines.splice(F - 1, 1),
                  this._activeBuffer.lines.splice(
                    D,
                    0,
                    this._activeBuffer.getBlankLine(this._eraseAttrData())
                  ));
                return (
                  this._dirtyRowTracker.markRangeDirty(
                    this._activeBuffer.y,
                    this._activeBuffer.scrollBottom
                  ),
                  (this._activeBuffer.x = 0),
                  !0
                );
              }
              deleteLines(E) {
                this._restrictCursor();
                let R = E.params[0] || 1;
                if (
                  this._activeBuffer.y > this._activeBuffer.scrollBottom ||
                  this._activeBuffer.y < this._activeBuffer.scrollTop
                )
                  return !0;
                const D = this._activeBuffer.ybase + this._activeBuffer.y;
                let P;
                for (
                  P =
                    this._bufferService.rows -
                    1 -
                    this._activeBuffer.scrollBottom,
                  P =
                      this._bufferService.rows -
                      1 +
                      this._activeBuffer.ybase -
                      P;
                  R--;

                )
                  (this._activeBuffer.lines.splice(D, 1),
                  this._activeBuffer.lines.splice(
                    P,
                    0,
                    this._activeBuffer.getBlankLine(this._eraseAttrData())
                  ));
                return (
                  this._dirtyRowTracker.markRangeDirty(
                    this._activeBuffer.y,
                    this._activeBuffer.scrollBottom
                  ),
                  (this._activeBuffer.x = 0),
                  !0
                );
              }
              insertChars(E) {
                this._restrictCursor();
                const R = this._activeBuffer.lines.get(
                  this._activeBuffer.ybase + this._activeBuffer.y
                );
                return (
                  R &&
                    (R.insertCells(
                      this._activeBuffer.x,
                      E.params[0] || 1,
                      this._activeBuffer.getNullCell(this._eraseAttrData())
                    ),
                    this._dirtyRowTracker.markDirty(this._activeBuffer.y)),
                  !0
                );
              }
              deleteChars(E) {
                this._restrictCursor();
                const R = this._activeBuffer.lines.get(
                  this._activeBuffer.ybase + this._activeBuffer.y
                );
                return (
                  R &&
                    (R.deleteCells(
                      this._activeBuffer.x,
                      E.params[0] || 1,
                      this._activeBuffer.getNullCell(this._eraseAttrData())
                    ),
                    this._dirtyRowTracker.markDirty(this._activeBuffer.y)),
                  !0
                );
              }
              scrollUp(E) {
                let R = E.params[0] || 1;
                for (; R--; )
                  (this._activeBuffer.lines.splice(
                    this._activeBuffer.ybase + this._activeBuffer.scrollTop,
                    1
                  ),
                  this._activeBuffer.lines.splice(
                    this._activeBuffer.ybase +
                        this._activeBuffer.scrollBottom,
                    0,
                    this._activeBuffer.getBlankLine(this._eraseAttrData())
                  ));
                return (
                  this._dirtyRowTracker.markRangeDirty(
                    this._activeBuffer.scrollTop,
                    this._activeBuffer.scrollBottom
                  ),
                  !0
                );
              }
              scrollDown(E) {
                let R = E.params[0] || 1;
                for (; R--; )
                  (this._activeBuffer.lines.splice(
                    this._activeBuffer.ybase + this._activeBuffer.scrollBottom,
                    1
                  ),
                  this._activeBuffer.lines.splice(
                    this._activeBuffer.ybase + this._activeBuffer.scrollTop,
                    0,
                    this._activeBuffer.getBlankLine(c.DEFAULT_ATTR_DATA)
                  ));
                return (
                  this._dirtyRowTracker.markRangeDirty(
                    this._activeBuffer.scrollTop,
                    this._activeBuffer.scrollBottom
                  ),
                  !0
                );
              }
              scrollLeft(E) {
                if (
                  this._activeBuffer.y > this._activeBuffer.scrollBottom ||
                  this._activeBuffer.y < this._activeBuffer.scrollTop
                )
                  return !0;
                const R = E.params[0] || 1;
                for (
                  let D = this._activeBuffer.scrollTop;
                  D <= this._activeBuffer.scrollBottom;
                  ++D
                ) {
                  const P = this._activeBuffer.lines.get(
                    this._activeBuffer.ybase + D
                  );
                  (P.deleteCells(
                    0,
                    R,
                    this._activeBuffer.getNullCell(this._eraseAttrData())
                  ),
                  (P.isWrapped = !1));
                }
                return (
                  this._dirtyRowTracker.markRangeDirty(
                    this._activeBuffer.scrollTop,
                    this._activeBuffer.scrollBottom
                  ),
                  !0
                );
              }
              scrollRight(E) {
                if (
                  this._activeBuffer.y > this._activeBuffer.scrollBottom ||
                  this._activeBuffer.y < this._activeBuffer.scrollTop
                )
                  return !0;
                const R = E.params[0] || 1;
                for (
                  let D = this._activeBuffer.scrollTop;
                  D <= this._activeBuffer.scrollBottom;
                  ++D
                ) {
                  const P = this._activeBuffer.lines.get(
                    this._activeBuffer.ybase + D
                  );
                  (P.insertCells(
                    0,
                    R,
                    this._activeBuffer.getNullCell(this._eraseAttrData())
                  ),
                  (P.isWrapped = !1));
                }
                return (
                  this._dirtyRowTracker.markRangeDirty(
                    this._activeBuffer.scrollTop,
                    this._activeBuffer.scrollBottom
                  ),
                  !0
                );
              }
              insertColumns(E) {
                if (
                  this._activeBuffer.y > this._activeBuffer.scrollBottom ||
                  this._activeBuffer.y < this._activeBuffer.scrollTop
                )
                  return !0;
                const R = E.params[0] || 1;
                for (
                  let D = this._activeBuffer.scrollTop;
                  D <= this._activeBuffer.scrollBottom;
                  ++D
                ) {
                  const P = this._activeBuffer.lines.get(
                    this._activeBuffer.ybase + D
                  );
                  (P.insertCells(
                    this._activeBuffer.x,
                    R,
                    this._activeBuffer.getNullCell(this._eraseAttrData())
                  ),
                  (P.isWrapped = !1));
                }
                return (
                  this._dirtyRowTracker.markRangeDirty(
                    this._activeBuffer.scrollTop,
                    this._activeBuffer.scrollBottom
                  ),
                  !0
                );
              }
              deleteColumns(E) {
                if (
                  this._activeBuffer.y > this._activeBuffer.scrollBottom ||
                  this._activeBuffer.y < this._activeBuffer.scrollTop
                )
                  return !0;
                const R = E.params[0] || 1;
                for (
                  let D = this._activeBuffer.scrollTop;
                  D <= this._activeBuffer.scrollBottom;
                  ++D
                ) {
                  const P = this._activeBuffer.lines.get(
                    this._activeBuffer.ybase + D
                  );
                  (P.deleteCells(
                    this._activeBuffer.x,
                    R,
                    this._activeBuffer.getNullCell(this._eraseAttrData())
                  ),
                  (P.isWrapped = !1));
                }
                return (
                  this._dirtyRowTracker.markRangeDirty(
                    this._activeBuffer.scrollTop,
                    this._activeBuffer.scrollBottom
                  ),
                  !0
                );
              }
              eraseChars(E) {
                this._restrictCursor();
                const R = this._activeBuffer.lines.get(
                  this._activeBuffer.ybase + this._activeBuffer.y
                );
                return (
                  R &&
                    (R.replaceCells(
                      this._activeBuffer.x,
                      this._activeBuffer.x + (E.params[0] || 1),
                      this._activeBuffer.getNullCell(this._eraseAttrData())
                    ),
                    this._dirtyRowTracker.markDirty(this._activeBuffer.y)),
                  !0
                );
              }
              repeatPrecedingCharacter(E) {
                const R = this._parser.precedingJoinState;
                if (!R) return !0;
                const D = E.params[0] || 1,
                  P = b.UnicodeService.extractWidth(R),
                  F = this._activeBuffer.x - P,
                  U = this._activeBuffer.lines
                    .get(this._activeBuffer.ybase + this._activeBuffer.y)
                    .getString(F),
                  Y = new Uint32Array(U.length * D);
                let z = 0;
                for (let L = 0; L < U.length; ) {
                  const j = U.codePointAt(L) || 0;
                  ((Y[z++] = j), (L += j > 65535 ? 2 : 1));
                }
                let M = z;
                for (let L = 1; L < D; ++L) (Y.copyWithin(M, 0, z), (M += z));
                return (this.print(Y, 0, M), !0);
              }
              sendDeviceAttributesPrimary(E) {
                return (
                  E.params[0] > 0 ||
                    (this._is('xterm') ||
                    this._is('rxvt-unicode') ||
                    this._is('screen')
                      ? this._coreService.triggerDataEvent(u.C0.ESC + '[?1;2c')
                      : this._is('linux') &&
                        this._coreService.triggerDataEvent(u.C0.ESC + '[?6c')),
                  !0
                );
              }
              sendDeviceAttributesSecondary(E) {
                return (
                  E.params[0] > 0 ||
                    (this._is('xterm')
                      ? this._coreService.triggerDataEvent(
                        u.C0.ESC + '[>0;276;0c'
                      )
                      : this._is('rxvt-unicode')
                        ? this._coreService.triggerDataEvent(
                          u.C0.ESC + '[>85;95;0c'
                        )
                        : this._is('linux')
                          ? this._coreService.triggerDataEvent(
                            E.params[0] + 'c'
                          )
                          : this._is('screen') &&
                            this._coreService.triggerDataEvent(
                              u.C0.ESC + '[>83;40003;0c'
                            )),
                  !0
                );
              }
              _is(E) {
                return (
                  (this._optionsService.rawOptions.termName + '').indexOf(E) ===
                  0
                );
              }
              setMode(E) {
                for (let R = 0; R < E.length; R++)
                  switch (E.params[R]) {
                  case 4:
                    this._coreService.modes.insertMode = !0;
                    break;
                  case 20:
                    this._optionsService.options.convertEol = !0;
                  }
                return !0;
              }
              setModePrivate(E) {
                for (let R = 0; R < E.length; R++)
                  switch (E.params[R]) {
                  case 1:
                    this._coreService.decPrivateModes.applicationCursorKeys =
                        !0;
                    break;
                  case 2:
                    (this._charsetService.setgCharset(0, d.DEFAULT_CHARSET),
                    this._charsetService.setgCharset(1, d.DEFAULT_CHARSET),
                    this._charsetService.setgCharset(2, d.DEFAULT_CHARSET),
                    this._charsetService.setgCharset(3, d.DEFAULT_CHARSET));
                    break;
                  case 3:
                    this._optionsService.rawOptions.windowOptions
                      .setWinLines &&
                        (this._bufferService.resize(
                          132,
                          this._bufferService.rows
                        ),
                        this._onRequestReset.fire());
                    break;
                  case 6:
                    ((this._coreService.decPrivateModes.origin = !0),
                    this._setCursor(0, 0));
                    break;
                  case 7:
                    this._coreService.decPrivateModes.wraparound = !0;
                    break;
                  case 12:
                    this._optionsService.options.cursorBlink = !0;
                    break;
                  case 45:
                    this._coreService.decPrivateModes.reverseWraparound = !0;
                    break;
                  case 66:
                    (this._logService.debug(
                      'Serial port requested application keypad.'
                    ),
                    (this._coreService.decPrivateModes.applicationKeypad =
                          !0),
                    this._onRequestSyncScrollBar.fire());
                    break;
                  case 9:
                    this._coreMouseService.activeProtocol = 'X10';
                    break;
                  case 1e3:
                    this._coreMouseService.activeProtocol = 'VT200';
                    break;
                  case 1002:
                    this._coreMouseService.activeProtocol = 'DRAG';
                    break;
                  case 1003:
                    this._coreMouseService.activeProtocol = 'ANY';
                    break;
                  case 1004:
                    ((this._coreService.decPrivateModes.sendFocus = !0),
                    this._onRequestSendFocus.fire());
                    break;
                  case 1005:
                    this._logService.debug(
                      'DECSET 1005 not supported (see #2507)'
                    );
                    break;
                  case 1006:
                    this._coreMouseService.activeEncoding = 'SGR';
                    break;
                  case 1015:
                    this._logService.debug(
                      'DECSET 1015 not supported (see #2507)'
                    );
                    break;
                  case 1016:
                    this._coreMouseService.activeEncoding = 'SGR_PIXELS';
                    break;
                  case 25:
                    this._coreService.isCursorHidden = !1;
                    break;
                  case 1048:
                    this.saveCursor();
                    break;
                  case 1049:
                    this.saveCursor();
                  case 47:
                  case 1047:
                    (this._bufferService.buffers.activateAltBuffer(
                      this._eraseAttrData()
                    ),
                    (this._coreService.isCursorInitialized = !0),
                    this._onRequestRefreshRows.fire(
                      0,
                      this._bufferService.rows - 1
                    ),
                    this._onRequestSyncScrollBar.fire());
                    break;
                  case 2004:
                    this._coreService.decPrivateModes.bracketedPasteMode = !0;
                  }
                return !0;
              }
              resetMode(E) {
                for (let R = 0; R < E.length; R++)
                  switch (E.params[R]) {
                  case 4:
                    this._coreService.modes.insertMode = !1;
                    break;
                  case 20:
                    this._optionsService.options.convertEol = !1;
                  }
                return !0;
              }
              resetModePrivate(E) {
                for (let R = 0; R < E.length; R++)
                  switch (E.params[R]) {
                  case 1:
                    this._coreService.decPrivateModes.applicationCursorKeys =
                        !1;
                    break;
                  case 3:
                    this._optionsService.rawOptions.windowOptions
                      .setWinLines &&
                        (this._bufferService.resize(
                          80,
                          this._bufferService.rows
                        ),
                        this._onRequestReset.fire());
                    break;
                  case 6:
                    ((this._coreService.decPrivateModes.origin = !1),
                    this._setCursor(0, 0));
                    break;
                  case 7:
                    this._coreService.decPrivateModes.wraparound = !1;
                    break;
                  case 12:
                    this._optionsService.options.cursorBlink = !1;
                    break;
                  case 45:
                    this._coreService.decPrivateModes.reverseWraparound = !1;
                    break;
                  case 66:
                    (this._logService.debug(
                      'Switching back to normal keypad.'
                    ),
                    (this._coreService.decPrivateModes.applicationKeypad =
                          !1),
                    this._onRequestSyncScrollBar.fire());
                    break;
                  case 9:
                  case 1e3:
                  case 1002:
                  case 1003:
                    this._coreMouseService.activeProtocol = 'NONE';
                    break;
                  case 1004:
                    this._coreService.decPrivateModes.sendFocus = !1;
                    break;
                  case 1005:
                    this._logService.debug(
                      'DECRST 1005 not supported (see #2507)'
                    );
                    break;
                  case 1006:
                  case 1016:
                    this._coreMouseService.activeEncoding = 'DEFAULT';
                    break;
                  case 1015:
                    this._logService.debug(
                      'DECRST 1015 not supported (see #2507)'
                    );
                    break;
                  case 25:
                    this._coreService.isCursorHidden = !0;
                    break;
                  case 1048:
                    this.restoreCursor();
                    break;
                  case 1049:
                  case 47:
                  case 1047:
                    (this._bufferService.buffers.activateNormalBuffer(),
                    E.params[R] === 1049 && this.restoreCursor(),
                    (this._coreService.isCursorInitialized = !0),
                    this._onRequestRefreshRows.fire(
                      0,
                      this._bufferService.rows - 1
                    ),
                    this._onRequestSyncScrollBar.fire());
                    break;
                  case 2004:
                    this._coreService.decPrivateModes.bracketedPasteMode = !1;
                  }
                return !0;
              }
              requestMode(E, R) {
                const D = this._coreService.decPrivateModes,
                  { activeProtocol: P, activeEncoding: F } =
                    this._coreMouseService,
                  U = this._coreService,
                  { buffers: Y, cols: z } = this._bufferService,
                  { active: M, alt: L } = Y,
                  j = this._optionsService.rawOptions,
                  N = (de) => (de ? 1 : 2),
                  X = E.params[0];
                return (
                  (q = X),
                  (ee = R
                    ? X === 2
                      ? 4
                      : X === 4
                        ? N(U.modes.insertMode)
                        : X === 12
                          ? 3
                          : X === 20
                            ? N(j.convertEol)
                            : 0
                    : X === 1
                      ? N(D.applicationCursorKeys)
                      : X === 3
                        ? j.windowOptions.setWinLines
                          ? z === 80
                            ? 2
                            : z === 132
                              ? 1
                              : 0
                          : 0
                        : X === 6
                          ? N(D.origin)
                          : X === 7
                            ? N(D.wraparound)
                            : X === 8
                              ? 3
                              : X === 9
                                ? N(P === 'X10')
                                : X === 12
                                  ? N(j.cursorBlink)
                                  : X === 25
                                    ? N(!U.isCursorHidden)
                                    : X === 45
                                      ? N(D.reverseWraparound)
                                      : X === 66
                                        ? N(D.applicationKeypad)
                                        : X === 67
                                          ? 4
                                          : X === 1e3
                                            ? N(P === 'VT200')
                                            : X === 1002
                                              ? N(P === 'DRAG')
                                              : X === 1003
                                                ? N(P === 'ANY')
                                                : X === 1004
                                                  ? N(D.sendFocus)
                                                  : X === 1005
                                                    ? 4
                                                    : X === 1006
                                                      ? N(F === 'SGR')
                                                      : X === 1015
                                                        ? 4
                                                        : X === 1016
                                                          ? N(
                                                            F === 'SGR_PIXELS'
                                                          )
                                                          : X === 1048
                                                            ? 1
                                                            : X === 47 ||
                                                                X === 1047 ||
                                                                X === 1049
                                                              ? N(M === L)
                                                              : X === 2004
                                                                ? N(
                                                                  D.bracketedPasteMode
                                                                )
                                                                : 0),
                  U.triggerDataEvent(`${u.C0.ESC}[${R ? '' : '?'}${q};${ee}$y`),
                  !0
                );
                var q, ee;
              }
              _updateAttrColor(E, R, D, P, F) {
                return (
                  R === 2
                    ? ((E |= 50331648),
                    (E &= -16777216),
                    (E |= _.AttributeData.fromColorRGB([D, P, F])))
                    : R === 5 &&
                      ((E &= -50331904), (E |= 33554432 | (255 & D))),
                  E
                );
              }
              _extractColor(E, R, D) {
                const P = [0, 0, -1, 0, 0, 0];
                let F = 0,
                  U = 0;
                do {
                  if (((P[U + F] = E.params[R + U]), E.hasSubParams(R + U))) {
                    const Y = E.getSubParams(R + U);
                    let z = 0;
                    do (P[1] === 5 && (F = 1), (P[U + z + 1 + F] = Y[z]));
                    while (++z < Y.length && z + U + 1 + F < P.length);
                    break;
                  }
                  if ((P[1] === 5 && U + F >= 2) || (P[1] === 2 && U + F >= 5))
                    break;
                  P[1] && (F = 1);
                } while (++U + R < E.length && U + F < P.length);
                for (let Y = 2; Y < P.length; ++Y) P[Y] === -1 && (P[Y] = 0);
                switch (P[0]) {
                case 38:
                  D.fg = this._updateAttrColor(D.fg, P[1], P[3], P[4], P[5]);
                  break;
                case 48:
                  D.bg = this._updateAttrColor(D.bg, P[1], P[3], P[4], P[5]);
                  break;
                case 58:
                  ((D.extended = D.extended.clone()),
                  (D.extended.underlineColor = this._updateAttrColor(
                    D.extended.underlineColor,
                    P[1],
                    P[3],
                    P[4],
                    P[5]
                  )));
                }
                return U;
              }
              _processUnderline(E, R) {
                ((R.extended = R.extended.clone()),
                (!~E || E > 5) && (E = 1),
                (R.extended.underlineStyle = E),
                (R.fg |= 268435456),
                E === 0 && (R.fg &= -268435457),
                R.updateExtended());
              }
              _processSGR0(E) {
                ((E.fg = c.DEFAULT_ATTR_DATA.fg),
                (E.bg = c.DEFAULT_ATTR_DATA.bg),
                (E.extended = E.extended.clone()),
                (E.extended.underlineStyle = 0),
                (E.extended.underlineColor &= -67108864),
                E.updateExtended());
              }
              charAttributes(E) {
                if (E.length === 1 && E.params[0] === 0)
                  return (this._processSGR0(this._curAttrData), !0);
                const R = E.length;
                let D;
                const P = this._curAttrData;
                for (let F = 0; F < R; F++)
                  ((D = E.params[F]),
                  D >= 30 && D <= 37
                    ? ((P.fg &= -50331904), (P.fg |= 16777216 | (D - 30)))
                    : D >= 40 && D <= 47
                      ? ((P.bg &= -50331904), (P.bg |= 16777216 | (D - 40)))
                      : D >= 90 && D <= 97
                        ? ((P.fg &= -50331904), (P.fg |= 16777224 | (D - 90)))
                        : D >= 100 && D <= 107
                          ? ((P.bg &= -50331904),
                          (P.bg |= 16777224 | (D - 100)))
                          : D === 0
                            ? this._processSGR0(P)
                            : D === 1
                              ? (P.fg |= 134217728)
                              : D === 3
                                ? (P.bg |= 67108864)
                                : D === 4
                                  ? ((P.fg |= 268435456),
                                  this._processUnderline(
                                    E.hasSubParams(F)
                                      ? E.getSubParams(F)[0]
                                      : 1,
                                    P
                                  ))
                                  : D === 5
                                    ? (P.fg |= 536870912)
                                    : D === 7
                                      ? (P.fg |= 67108864)
                                      : D === 8
                                        ? (P.fg |= 1073741824)
                                        : D === 9
                                          ? (P.fg |= 2147483648)
                                          : D === 2
                                            ? (P.bg |= 134217728)
                                            : D === 21
                                              ? this._processUnderline(2, P)
                                              : D === 22
                                                ? ((P.fg &= -134217729),
                                                (P.bg &= -134217729))
                                                : D === 23
                                                  ? (P.bg &= -67108865)
                                                  : D === 24
                                                    ? ((P.fg &= -268435457),
                                                    this._processUnderline(
                                                      0,
                                                      P
                                                    ))
                                                    : D === 25
                                                      ? (P.fg &= -536870913)
                                                      : D === 27
                                                        ? (P.fg &= -67108865)
                                                        : D === 28
                                                          ? (P.fg &=
                                                                -1073741825)
                                                          : D === 29
                                                            ? (P.fg &= 2147483647)
                                                            : D === 39
                                                              ? ((P.fg &=
                                                                    -67108864),
                                                              (P.fg |=
                                                                    16777215 &
                                                                    c
                                                                      .DEFAULT_ATTR_DATA
                                                                      .fg))
                                                              : D === 49
                                                                ? ((P.bg &=
                                                                      -67108864),
                                                                (P.bg |=
                                                                      16777215 &
                                                                      c
                                                                        .DEFAULT_ATTR_DATA
                                                                        .bg))
                                                                : D === 38 ||
                                                                      D ===
                                                                        48 ||
                                                                      D === 58
                                                                  ? (F +=
                                                                        this._extractColor(
                                                                          E,
                                                                          F,
                                                                          P
                                                                        ))
                                                                  : D === 53
                                                                    ? (P.bg |= 1073741824)
                                                                    : D === 55
                                                                      ? (P.bg &=
                                                                            -1073741825)
                                                                      : D ===
                                                                            59
                                                                        ? ((P.extended =
                                                                              P.extended.clone()),
                                                                        (P.extended.underlineColor =
                                                                              -1),
                                                                        P.updateExtended())
                                                                        : D ===
                                                                              100
                                                                          ? ((P.fg &=
                                                                                -67108864),
                                                                          (P.fg |=
                                                                                16777215 &
                                                                                c
                                                                                  .DEFAULT_ATTR_DATA
                                                                                  .fg),
                                                                          (P.bg &=
                                                                                -67108864),
                                                                          (P.bg |=
                                                                                16777215 &
                                                                                c
                                                                                  .DEFAULT_ATTR_DATA
                                                                                  .bg))
                                                                          : this._logService.debug(
                                                                            'Unknown SGR attribute: %d.',
                                                                            D
                                                                          ));
                return !0;
              }
              deviceStatus(E) {
                switch (E.params[0]) {
                case 5:
                  this._coreService.triggerDataEvent(`${u.C0.ESC}[0n`);
                  break;
                case 6:
                  const R = this._activeBuffer.y + 1,
                    D = this._activeBuffer.x + 1;
                  this._coreService.triggerDataEvent(
                    `${u.C0.ESC}[${R};${D}R`
                  );
                }
                return !0;
              }
              deviceStatusPrivate(E) {
                if (E.params[0] === 6) {
                  const R = this._activeBuffer.y + 1,
                    D = this._activeBuffer.x + 1;
                  this._coreService.triggerDataEvent(`${u.C0.ESC}[?${R};${D}R`);
                }
                return !0;
              }
              softReset(E) {
                return (
                  (this._coreService.isCursorHidden = !1),
                  this._onRequestSyncScrollBar.fire(),
                  (this._activeBuffer.scrollTop = 0),
                  (this._activeBuffer.scrollBottom =
                    this._bufferService.rows - 1),
                  (this._curAttrData = c.DEFAULT_ATTR_DATA.clone()),
                  this._coreService.reset(),
                  this._charsetService.reset(),
                  (this._activeBuffer.savedX = 0),
                  (this._activeBuffer.savedY = this._activeBuffer.ybase),
                  (this._activeBuffer.savedCurAttrData.fg =
                    this._curAttrData.fg),
                  (this._activeBuffer.savedCurAttrData.bg =
                    this._curAttrData.bg),
                  (this._activeBuffer.savedCharset =
                    this._charsetService.charset),
                  (this._coreService.decPrivateModes.origin = !1),
                  !0
                );
              }
              setCursorStyle(E) {
                const R = E.params[0] || 1;
                switch (R) {
                case 1:
                case 2:
                  this._optionsService.options.cursorStyle = 'block';
                  break;
                case 3:
                case 4:
                  this._optionsService.options.cursorStyle = 'underline';
                  break;
                case 5:
                case 6:
                  this._optionsService.options.cursorStyle = 'bar';
                }
                const D = R % 2 == 1;
                return ((this._optionsService.options.cursorBlink = D), !0);
              }
              setScrollRegion(E) {
                const R = E.params[0] || 1;
                let D;
                return (
                  (E.length < 2 ||
                    (D = E.params[1]) > this._bufferService.rows ||
                    D === 0) &&
                    (D = this._bufferService.rows),
                  D > R &&
                    ((this._activeBuffer.scrollTop = R - 1),
                    (this._activeBuffer.scrollBottom = D - 1),
                    this._setCursor(0, 0)),
                  !0
                );
              }
              windowOptions(E) {
                if (
                  !O(E.params[0], this._optionsService.rawOptions.windowOptions)
                )
                  return !0;
                const R = E.length > 1 ? E.params[1] : 0;
                switch (E.params[0]) {
                case 14:
                  R !== 2 &&
                      this._onRequestWindowsOptionsReport.fire(
                        A.GET_WIN_SIZE_PIXELS
                      );
                  break;
                case 16:
                  this._onRequestWindowsOptionsReport.fire(
                    A.GET_CELL_SIZE_PIXELS
                  );
                  break;
                case 18:
                  this._bufferService &&
                      this._coreService.triggerDataEvent(
                        `${u.C0.ESC}[8;${this._bufferService.rows};${this._bufferService.cols}t`
                      );
                  break;
                case 22:
                  ((R !== 0 && R !== 2) ||
                      (this._windowTitleStack.push(this._windowTitle),
                      this._windowTitleStack.length > 10 &&
                        this._windowTitleStack.shift()),
                  (R !== 0 && R !== 1) ||
                        (this._iconNameStack.push(this._iconName),
                        this._iconNameStack.length > 10 &&
                          this._iconNameStack.shift()));
                  break;
                case 23:
                  ((R !== 0 && R !== 2) ||
                      (this._windowTitleStack.length &&
                        this.setTitle(this._windowTitleStack.pop())),
                  (R !== 0 && R !== 1) ||
                        (this._iconNameStack.length &&
                          this.setIconName(this._iconNameStack.pop())));
                }
                return !0;
              }
              saveCursor(E) {
                return (
                  (this._activeBuffer.savedX = this._activeBuffer.x),
                  (this._activeBuffer.savedY =
                    this._activeBuffer.ybase + this._activeBuffer.y),
                  (this._activeBuffer.savedCurAttrData.fg =
                    this._curAttrData.fg),
                  (this._activeBuffer.savedCurAttrData.bg =
                    this._curAttrData.bg),
                  (this._activeBuffer.savedCharset =
                    this._charsetService.charset),
                  !0
                );
              }
              restoreCursor(E) {
                return (
                  (this._activeBuffer.x = this._activeBuffer.savedX || 0),
                  (this._activeBuffer.y = Math.max(
                    this._activeBuffer.savedY - this._activeBuffer.ybase,
                    0
                  )),
                  (this._curAttrData.fg =
                    this._activeBuffer.savedCurAttrData.fg),
                  (this._curAttrData.bg =
                    this._activeBuffer.savedCurAttrData.bg),
                  (this._charsetService.charset = this._savedCharset),
                  this._activeBuffer.savedCharset &&
                    (this._charsetService.charset =
                      this._activeBuffer.savedCharset),
                  this._restrictCursor(),
                  !0
                );
              }
              setTitle(E) {
                return (
                  (this._windowTitle = E),
                  this._onTitleChange.fire(E),
                  !0
                );
              }
              setIconName(E) {
                return ((this._iconName = E), !0);
              }
              setOrReportIndexedColor(E) {
                const R = [],
                  D = E.split(';');
                for (; D.length > 1; ) {
                  const P = D.shift(),
                    F = D.shift();
                  if (/^\d+$/.exec(P)) {
                    const U = parseInt(P);
                    if (G(U))
                      if (F === '?') R.push({ type: 0, index: U });
                      else {
                        const Y = (0, k.parseColor)(F);
                        Y && R.push({ type: 1, index: U, color: Y });
                      }
                  }
                }
                return (R.length && this._onColor.fire(R), !0);
              }
              setHyperlink(E) {
                const R = E.split(';');
                return (
                  !(R.length < 2) &&
                  (R[1]
                    ? this._createHyperlink(R[0], R[1])
                    : !R[0] && this._finishHyperlink())
                );
              }
              _createHyperlink(E, R) {
                this._getCurrentLinkId() && this._finishHyperlink();
                const D = E.split(':');
                let P;
                const F = D.findIndex((U) => U.startsWith('id='));
                return (
                  F !== -1 && (P = D[F].slice(3) || void 0),
                  (this._curAttrData.extended =
                    this._curAttrData.extended.clone()),
                  (this._curAttrData.extended.urlId =
                    this._oscLinkService.registerLink({ id: P, uri: R })),
                  this._curAttrData.updateExtended(),
                  !0
                );
              }
              _finishHyperlink() {
                return (
                  (this._curAttrData.extended =
                    this._curAttrData.extended.clone()),
                  (this._curAttrData.extended.urlId = 0),
                  this._curAttrData.updateExtended(),
                  !0
                );
              }
              _setOrReportSpecialColor(E, R) {
                const D = E.split(';');
                for (
                  let P = 0;
                  P < D.length && !(R >= this._specialColors.length);
                  ++P, ++R
                )
                  if (D[P] === '?')
                    this._onColor.fire([
                      { type: 0, index: this._specialColors[R] },
                    ]);
                  else {
                    const F = (0, k.parseColor)(D[P]);
                    F &&
                      this._onColor.fire([
                        { type: 1, index: this._specialColors[R], color: F },
                      ]);
                  }
                return !0;
              }
              setOrReportFgColor(E) {
                return this._setOrReportSpecialColor(E, 0);
              }
              setOrReportBgColor(E) {
                return this._setOrReportSpecialColor(E, 1);
              }
              setOrReportCursorColor(E) {
                return this._setOrReportSpecialColor(E, 2);
              }
              restoreIndexedColor(E) {
                if (!E) return (this._onColor.fire([{ type: 2 }]), !0);
                const R = [],
                  D = E.split(';');
                for (let P = 0; P < D.length; ++P)
                  if (/^\d+$/.exec(D[P])) {
                    const F = parseInt(D[P]);
                    G(F) && R.push({ type: 2, index: F });
                  }
                return (R.length && this._onColor.fire(R), !0);
              }
              restoreFgColor(E) {
                return (this._onColor.fire([{ type: 2, index: 256 }]), !0);
              }
              restoreBgColor(E) {
                return (this._onColor.fire([{ type: 2, index: 257 }]), !0);
              }
              restoreCursorColor(E) {
                return (this._onColor.fire([{ type: 2, index: 258 }]), !0);
              }
              nextLine() {
                return ((this._activeBuffer.x = 0), this.index(), !0);
              }
              keypadApplicationMode() {
                return (
                  this._logService.debug(
                    'Serial port requested application keypad.'
                  ),
                  (this._coreService.decPrivateModes.applicationKeypad = !0),
                  this._onRequestSyncScrollBar.fire(),
                  !0
                );
              }
              keypadNumericMode() {
                return (
                  this._logService.debug('Switching back to normal keypad.'),
                  (this._coreService.decPrivateModes.applicationKeypad = !1),
                  this._onRequestSyncScrollBar.fire(),
                  !0
                );
              }
              selectDefaultCharset() {
                return (
                  this._charsetService.setgLevel(0),
                  this._charsetService.setgCharset(0, d.DEFAULT_CHARSET),
                  !0
                );
              }
              selectCharset(E) {
                return E.length !== 2
                  ? (this.selectDefaultCharset(), !0)
                  : (E[0] === '/' ||
                      this._charsetService.setgCharset(
                        T[E[0]],
                        d.CHARSETS[E[1]] || d.DEFAULT_CHARSET
                      ),
                  !0);
              }
              index() {
                return (
                  this._restrictCursor(),
                  this._activeBuffer.y++,
                  this._activeBuffer.y === this._activeBuffer.scrollBottom + 1
                    ? (this._activeBuffer.y--,
                    this._bufferService.scroll(this._eraseAttrData()))
                    : this._activeBuffer.y >= this._bufferService.rows &&
                      (this._activeBuffer.y = this._bufferService.rows - 1),
                  this._restrictCursor(),
                  !0
                );
              }
              tabSet() {
                return (
                  (this._activeBuffer.tabs[this._activeBuffer.x] = !0),
                  !0
                );
              }
              reverseIndex() {
                if (
                  (this._restrictCursor(),
                  this._activeBuffer.y === this._activeBuffer.scrollTop)
                ) {
                  const E =
                    this._activeBuffer.scrollBottom -
                    this._activeBuffer.scrollTop;
                  (this._activeBuffer.lines.shiftElements(
                    this._activeBuffer.ybase + this._activeBuffer.y,
                    E,
                    1
                  ),
                  this._activeBuffer.lines.set(
                    this._activeBuffer.ybase + this._activeBuffer.y,
                    this._activeBuffer.getBlankLine(this._eraseAttrData())
                  ),
                  this._dirtyRowTracker.markRangeDirty(
                    this._activeBuffer.scrollTop,
                    this._activeBuffer.scrollBottom
                  ));
                } else (this._activeBuffer.y--, this._restrictCursor());
                return !0;
              }
              fullReset() {
                return (this._parser.reset(), this._onRequestReset.fire(), !0);
              }
              reset() {
                ((this._curAttrData = c.DEFAULT_ATTR_DATA.clone()),
                (this._eraseAttrDataInternal = c.DEFAULT_ATTR_DATA.clone()));
              }
              _eraseAttrData() {
                return (
                  (this._eraseAttrDataInternal.bg &= -67108864),
                  (this._eraseAttrDataInternal.bg |=
                    67108863 & this._curAttrData.bg),
                  this._eraseAttrDataInternal
                );
              }
              setgLevel(E) {
                return (this._charsetService.setgLevel(E), !0);
              }
              screenAlignmentPattern() {
                const E = new o.CellData();
                ((E.content = 4194373),
                (E.fg = this._curAttrData.fg),
                (E.bg = this._curAttrData.bg),
                this._setCursor(0, 0));
                for (let R = 0; R < this._bufferService.rows; ++R) {
                  const D = this._activeBuffer.ybase + this._activeBuffer.y + R,
                    P = this._activeBuffer.lines.get(D);
                  P && (P.fill(E), (P.isWrapped = !1));
                }
                return (
                  this._dirtyRowTracker.markAllDirty(),
                  this._setCursor(0, 0),
                  !0
                );
              }
              requestStatusString(E, R) {
                const D = this._bufferService.buffer,
                  P = this._optionsService.rawOptions;
                return ((F) => (
                  this._coreService.triggerDataEvent(
                    `${u.C0.ESC}${F}${u.C0.ESC}\\`
                  ),
                  !0
                ))(
                  E === '"q'
                    ? `P1$r${this._curAttrData.isProtected() ? 1 : 0}"q`
                    : E === '"p'
                      ? 'P1$r61;1"p'
                      : E === 'r'
                        ? `P1$r${D.scrollTop + 1};${D.scrollBottom + 1}r`
                        : E === 'm'
                          ? 'P1$r0m'
                          : E === ' q'
                            ? `P1$r${{ block: 2, underline: 4, bar: 6 }[P.cursorStyle] - (P.cursorBlink ? 1 : 0)} q`
                            : 'P0$r'
                );
              }
              markRangeDirty(E, R) {
                this._dirtyRowTracker.markRangeDirty(E, R);
              }
            }
            a.InputHandler = W;
            let $ = class {
              constructor(I) {
                ((this._bufferService = I), this.clearRange());
              }
              clearRange() {
                ((this.start = this._bufferService.buffer.y),
                (this.end = this._bufferService.buffer.y));
              }
              markDirty(I) {
                I < this.start
                  ? (this.start = I)
                  : I > this.end && (this.end = I);
              }
              markRangeDirty(I, E) {
                (I > E && ((H = I), (I = E), (E = H)),
                I < this.start && (this.start = I),
                E > this.end && (this.end = E));
              }
              markAllDirty() {
                this.markRangeDirty(0, this._bufferService.rows - 1);
              }
            };
            function G(I) {
              return 0 <= I && I < 256;
            }
            $ = f([g(0, C.IBufferService)], $);
          },
          844: (y, a) => {
            function l(f) {
              for (const g of f) g.dispose();
              f.length = 0;
            }
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.getDisposeArrayDisposable =
                a.disposeArray =
                a.toDisposable =
                a.MutableDisposable =
                a.Disposable =
                  void 0),
            (a.Disposable = class {
              constructor() {
                ((this._disposables = []), (this._isDisposed = !1));
              }
              dispose() {
                this._isDisposed = !0;
                for (const f of this._disposables) f.dispose();
                this._disposables.length = 0;
              }
              register(f) {
                return (this._disposables.push(f), f);
              }
              unregister(f) {
                const g = this._disposables.indexOf(f);
                g !== -1 && this._disposables.splice(g, 1);
              }
            }),
            (a.MutableDisposable = class {
              constructor() {
                this._isDisposed = !1;
              }
              get value() {
                return this._isDisposed ? void 0 : this._value;
              }
              set value(f) {
                var g;
                this._isDisposed ||
                    f === this._value ||
                    ((g = this._value) == null || g.dispose(),
                    (this._value = f));
              }
              clear() {
                this.value = void 0;
              }
              dispose() {
                var f;
                ((this._isDisposed = !0),
                (f = this._value) == null || f.dispose(),
                (this._value = void 0));
              }
            }),
            (a.toDisposable = function (f) {
              return { dispose: f };
            }),
            (a.disposeArray = l),
            (a.getDisposeArrayDisposable = function (f) {
              return { dispose: () => l(f) };
            }));
          },
          1505: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.FourKeyMap = a.TwoKeyMap = void 0));
            class l {
              constructor() {
                this._data = {};
              }
              set(g, u, d) {
                (this._data[g] || (this._data[g] = {}), (this._data[g][u] = d));
              }
              get(g, u) {
                return this._data[g] ? this._data[g][u] : void 0;
              }
              clear() {
                this._data = {};
              }
            }
            ((a.TwoKeyMap = l),
            (a.FourKeyMap = class {
              constructor() {
                this._data = new l();
              }
              set(f, g, u, d, v) {
                (this._data.get(f, g) || this._data.set(f, g, new l()),
                this._data.get(f, g).set(u, d, v));
              }
              get(f, g, u, d) {
                var v;
                return (v = this._data.get(f, g)) == null
                  ? void 0
                  : v.get(u, d);
              }
              clear() {
                this._data.clear();
              }
            }));
          },
          6114: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.isChromeOS =
                a.isLinux =
                a.isWindows =
                a.isIphone =
                a.isIpad =
                a.isMac =
                a.getSafariVersion =
                a.isSafari =
                a.isLegacyEdge =
                a.isFirefox =
                a.isNode =
                  void 0),
            (a.isNode = typeof process < 'u' && 'title' in process));
            const l = a.isNode ? 'node' : navigator.userAgent,
              f = a.isNode ? 'node' : navigator.platform;
            ((a.isFirefox = l.includes('Firefox')),
            (a.isLegacyEdge = l.includes('Edge')),
            (a.isSafari = /^((?!chrome|android).)*safari/i.test(l)),
            (a.getSafariVersion = function () {
              if (!a.isSafari) return 0;
              const g = l.match(/Version\/(\d+)/);
              return g === null || g.length < 2 ? 0 : parseInt(g[1]);
            }),
            (a.isMac = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'].includes(
              f
            )),
            (a.isIpad = f === 'iPad'),
            (a.isIphone = f === 'iPhone'),
            (a.isWindows = ['Windows', 'Win16', 'Win32', 'WinCE'].includes(
              f
            )),
            (a.isLinux = f.indexOf('Linux') >= 0),
            (a.isChromeOS = /\bCrOS\b/.test(l)));
          },
          6106: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.SortedList = void 0));
            let l = 0;
            a.SortedList = class {
              constructor(f) {
                ((this._getKey = f), (this._array = []));
              }
              clear() {
                this._array.length = 0;
              }
              insert(f) {
                this._array.length !== 0
                  ? ((l = this._search(this._getKey(f))),
                  this._array.splice(l, 0, f))
                  : this._array.push(f);
              }
              delete(f) {
                if (this._array.length === 0) return !1;
                const g = this._getKey(f);
                if (
                  g === void 0 ||
                  ((l = this._search(g)), l === -1) ||
                  this._getKey(this._array[l]) !== g
                )
                  return !1;
                do
                  if (this._array[l] === f)
                    return (this._array.splice(l, 1), !0);
                while (
                  ++l < this._array.length &&
                  this._getKey(this._array[l]) === g
                );
                return !1;
              }
              *getKeyIterator(f) {
                if (
                  this._array.length !== 0 &&
                  ((l = this._search(f)),
                  !(l < 0 || l >= this._array.length) &&
                    this._getKey(this._array[l]) === f)
                )
                  do yield this._array[l];
                  while (
                    ++l < this._array.length &&
                    this._getKey(this._array[l]) === f
                  );
              }
              forEachByKey(f, g) {
                if (
                  this._array.length !== 0 &&
                  ((l = this._search(f)),
                  !(l < 0 || l >= this._array.length) &&
                    this._getKey(this._array[l]) === f)
                )
                  do g(this._array[l]);
                  while (
                    ++l < this._array.length &&
                    this._getKey(this._array[l]) === f
                  );
              }
              values() {
                return [...this._array].values();
              }
              _search(f) {
                let g = 0,
                  u = this._array.length - 1;
                for (; u >= g; ) {
                  let d = (g + u) >> 1;
                  const v = this._getKey(this._array[d]);
                  if (v > f) u = d - 1;
                  else {
                    if (!(v < f)) {
                      for (; d > 0 && this._getKey(this._array[d - 1]) === f; )
                        d--;
                      return d;
                    }
                    g = d + 1;
                  }
                }
                return g;
              }
            };
          },
          7226: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.DebouncedIdleTask =
                a.IdleTaskQueue =
                a.PriorityTaskQueue =
                  void 0));
            const f = l(6114);
            class g {
              constructor() {
                ((this._tasks = []), (this._i = 0));
              }
              enqueue(v) {
                (this._tasks.push(v), this._start());
              }
              flush() {
                for (; this._i < this._tasks.length; )
                  this._tasks[this._i]() || this._i++;
                this.clear();
              }
              clear() {
                (this._idleCallback &&
                  (this._cancelCallback(this._idleCallback),
                  (this._idleCallback = void 0)),
                (this._i = 0),
                (this._tasks.length = 0));
              }
              _start() {
                this._idleCallback ||
                  (this._idleCallback = this._requestCallback(
                    this._process.bind(this)
                  ));
              }
              _process(v) {
                this._idleCallback = void 0;
                let w = 0,
                  p = 0,
                  c = v.timeRemaining(),
                  n = 0;
                for (; this._i < this._tasks.length; ) {
                  if (
                    ((w = Date.now()),
                    this._tasks[this._i]() || this._i++,
                    (w = Math.max(1, Date.now() - w)),
                    (p = Math.max(w, p)),
                    (n = v.timeRemaining()),
                    1.5 * p > n)
                  )
                    return (
                      c - w < -20 &&
                        console.warn(
                          `task queue exceeded allotted deadline by ${Math.abs(Math.round(c - w))}ms`
                        ),
                      void this._start()
                    );
                  c = n;
                }
                this.clear();
              }
            }
            class u extends g {
              _requestCallback(v) {
                return setTimeout(() => v(this._createDeadline(16)));
              }
              _cancelCallback(v) {
                clearTimeout(v);
              }
              _createDeadline(v) {
                const w = Date.now() + v;
                return { timeRemaining: () => Math.max(0, w - Date.now()) };
              }
            }
            ((a.PriorityTaskQueue = u),
            (a.IdleTaskQueue =
                !f.isNode && 'requestIdleCallback' in window
                  ? class extends g {
                    _requestCallback(d) {
                      return requestIdleCallback(d);
                    }
                    _cancelCallback(d) {
                      cancelIdleCallback(d);
                    }
                  }
                  : u),
            (a.DebouncedIdleTask = class {
              constructor() {
                this._queue = new a.IdleTaskQueue();
              }
              set(d) {
                (this._queue.clear(), this._queue.enqueue(d));
              }
              flush() {
                this._queue.flush();
              }
            }));
          },
          9282: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.updateWindowsModeWrappedState = void 0));
            const f = l(643);
            a.updateWindowsModeWrappedState = function (g) {
              const u = g.buffer.lines.get(g.buffer.ybase + g.buffer.y - 1),
                d = u == null ? void 0 : u.get(g.cols - 1),
                v = g.buffer.lines.get(g.buffer.ybase + g.buffer.y);
              v &&
                d &&
                (v.isWrapped =
                  d[f.CHAR_DATA_CODE_INDEX] !== f.NULL_CELL_CODE &&
                  d[f.CHAR_DATA_CODE_INDEX] !== f.WHITESPACE_CELL_CODE);
            };
          },
          3734: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.ExtendedAttrs = a.AttributeData = void 0));
            class l {
              constructor() {
                ((this.fg = 0), (this.bg = 0), (this.extended = new f()));
              }
              static toColorRGB(u) {
                return [(u >>> 16) & 255, (u >>> 8) & 255, 255 & u];
              }
              static fromColorRGB(u) {
                return (
                  ((255 & u[0]) << 16) | ((255 & u[1]) << 8) | (255 & u[2])
                );
              }
              clone() {
                const u = new l();
                return (
                  (u.fg = this.fg),
                  (u.bg = this.bg),
                  (u.extended = this.extended.clone()),
                  u
                );
              }
              isInverse() {
                return 67108864 & this.fg;
              }
              isBold() {
                return 134217728 & this.fg;
              }
              isUnderline() {
                return this.hasExtendedAttrs() &&
                  this.extended.underlineStyle !== 0
                  ? 1
                  : 268435456 & this.fg;
              }
              isBlink() {
                return 536870912 & this.fg;
              }
              isInvisible() {
                return 1073741824 & this.fg;
              }
              isItalic() {
                return 67108864 & this.bg;
              }
              isDim() {
                return 134217728 & this.bg;
              }
              isStrikethrough() {
                return 2147483648 & this.fg;
              }
              isProtected() {
                return 536870912 & this.bg;
              }
              isOverline() {
                return 1073741824 & this.bg;
              }
              getFgColorMode() {
                return 50331648 & this.fg;
              }
              getBgColorMode() {
                return 50331648 & this.bg;
              }
              isFgRGB() {
                return (50331648 & this.fg) == 50331648;
              }
              isBgRGB() {
                return (50331648 & this.bg) == 50331648;
              }
              isFgPalette() {
                return (
                  (50331648 & this.fg) == 16777216 ||
                  (50331648 & this.fg) == 33554432
                );
              }
              isBgPalette() {
                return (
                  (50331648 & this.bg) == 16777216 ||
                  (50331648 & this.bg) == 33554432
                );
              }
              isFgDefault() {
                return (50331648 & this.fg) == 0;
              }
              isBgDefault() {
                return (50331648 & this.bg) == 0;
              }
              isAttributeDefault() {
                return this.fg === 0 && this.bg === 0;
              }
              getFgColor() {
                switch (50331648 & this.fg) {
                case 16777216:
                case 33554432:
                  return 255 & this.fg;
                case 50331648:
                  return 16777215 & this.fg;
                default:
                  return -1;
                }
              }
              getBgColor() {
                switch (50331648 & this.bg) {
                case 16777216:
                case 33554432:
                  return 255 & this.bg;
                case 50331648:
                  return 16777215 & this.bg;
                default:
                  return -1;
                }
              }
              hasExtendedAttrs() {
                return 268435456 & this.bg;
              }
              updateExtended() {
                this.extended.isEmpty()
                  ? (this.bg &= -268435457)
                  : (this.bg |= 268435456);
              }
              getUnderlineColor() {
                if (268435456 & this.bg && ~this.extended.underlineColor)
                  switch (50331648 & this.extended.underlineColor) {
                  case 16777216:
                  case 33554432:
                    return 255 & this.extended.underlineColor;
                  case 50331648:
                    return 16777215 & this.extended.underlineColor;
                  default:
                    return this.getFgColor();
                  }
                return this.getFgColor();
              }
              getUnderlineColorMode() {
                return 268435456 & this.bg && ~this.extended.underlineColor
                  ? 50331648 & this.extended.underlineColor
                  : this.getFgColorMode();
              }
              isUnderlineColorRGB() {
                return 268435456 & this.bg && ~this.extended.underlineColor
                  ? (50331648 & this.extended.underlineColor) == 50331648
                  : this.isFgRGB();
              }
              isUnderlineColorPalette() {
                return 268435456 & this.bg && ~this.extended.underlineColor
                  ? (50331648 & this.extended.underlineColor) == 16777216 ||
                      (50331648 & this.extended.underlineColor) == 33554432
                  : this.isFgPalette();
              }
              isUnderlineColorDefault() {
                return 268435456 & this.bg && ~this.extended.underlineColor
                  ? (50331648 & this.extended.underlineColor) == 0
                  : this.isFgDefault();
              }
              getUnderlineStyle() {
                return 268435456 & this.fg
                  ? 268435456 & this.bg
                    ? this.extended.underlineStyle
                    : 1
                  : 0;
              }
              getUnderlineVariantOffset() {
                return this.extended.underlineVariantOffset;
              }
            }
            a.AttributeData = l;
            class f {
              get ext() {
                return this._urlId
                  ? (-469762049 & this._ext) | (this.underlineStyle << 26)
                  : this._ext;
              }
              set ext(u) {
                this._ext = u;
              }
              get underlineStyle() {
                return this._urlId ? 5 : (469762048 & this._ext) >> 26;
              }
              set underlineStyle(u) {
                ((this._ext &= -469762049),
                (this._ext |= (u << 26) & 469762048));
              }
              get underlineColor() {
                return 67108863 & this._ext;
              }
              set underlineColor(u) {
                ((this._ext &= -67108864), (this._ext |= 67108863 & u));
              }
              get urlId() {
                return this._urlId;
              }
              set urlId(u) {
                this._urlId = u;
              }
              get underlineVariantOffset() {
                const u = (3758096384 & this._ext) >> 29;
                return u < 0 ? 4294967288 ^ u : u;
              }
              set underlineVariantOffset(u) {
                ((this._ext &= 536870911),
                (this._ext |= (u << 29) & 3758096384));
              }
              constructor(u = 0, d = 0) {
                ((this._ext = 0),
                (this._urlId = 0),
                (this._ext = u),
                (this._urlId = d));
              }
              clone() {
                return new f(this._ext, this._urlId);
              }
              isEmpty() {
                return this.underlineStyle === 0 && this._urlId === 0;
              }
            }
            a.ExtendedAttrs = f;
          },
          9092: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.Buffer = a.MAX_BUFFER_SIZE = void 0));
            const f = l(6349),
              g = l(7226),
              u = l(3734),
              d = l(8437),
              v = l(4634),
              w = l(511),
              p = l(643),
              c = l(4863),
              n = l(7116);
            ((a.MAX_BUFFER_SIZE = 4294967295),
            (a.Buffer = class {
              constructor(s, o, _) {
                ((this._hasScrollback = s),
                (this._optionsService = o),
                (this._bufferService = _),
                (this.ydisp = 0),
                (this.ybase = 0),
                (this.y = 0),
                (this.x = 0),
                (this.tabs = {}),
                (this.savedY = 0),
                (this.savedX = 0),
                (this.savedCurAttrData = d.DEFAULT_ATTR_DATA.clone()),
                (this.savedCharset = n.DEFAULT_CHARSET),
                (this.markers = []),
                (this._nullCell = w.CellData.fromCharData([
                  0,
                  p.NULL_CELL_CHAR,
                  p.NULL_CELL_WIDTH,
                  p.NULL_CELL_CODE,
                ])),
                (this._whitespaceCell = w.CellData.fromCharData([
                  0,
                  p.WHITESPACE_CELL_CHAR,
                  p.WHITESPACE_CELL_WIDTH,
                  p.WHITESPACE_CELL_CODE,
                ])),
                (this._isClearing = !1),
                (this._memoryCleanupQueue = new g.IdleTaskQueue()),
                (this._memoryCleanupPosition = 0),
                (this._cols = this._bufferService.cols),
                (this._rows = this._bufferService.rows),
                (this.lines = new f.CircularList(
                  this._getCorrectBufferLength(this._rows)
                )),
                (this.scrollTop = 0),
                (this.scrollBottom = this._rows - 1),
                this.setupTabStops());
              }
              getNullCell(s) {
                return (
                  s
                    ? ((this._nullCell.fg = s.fg),
                    (this._nullCell.bg = s.bg),
                    (this._nullCell.extended = s.extended))
                    : ((this._nullCell.fg = 0),
                    (this._nullCell.bg = 0),
                    (this._nullCell.extended = new u.ExtendedAttrs())),
                  this._nullCell
                );
              }
              getWhitespaceCell(s) {
                return (
                  s
                    ? ((this._whitespaceCell.fg = s.fg),
                    (this._whitespaceCell.bg = s.bg),
                    (this._whitespaceCell.extended = s.extended))
                    : ((this._whitespaceCell.fg = 0),
                    (this._whitespaceCell.bg = 0),
                    (this._whitespaceCell.extended =
                          new u.ExtendedAttrs())),
                  this._whitespaceCell
                );
              }
              getBlankLine(s, o) {
                return new d.BufferLine(
                  this._bufferService.cols,
                  this.getNullCell(s),
                  o
                );
              }
              get hasScrollback() {
                return (
                  this._hasScrollback && this.lines.maxLength > this._rows
                );
              }
              get isCursorInViewport() {
                const s = this.ybase + this.y - this.ydisp;
                return s >= 0 && s < this._rows;
              }
              _getCorrectBufferLength(s) {
                if (!this._hasScrollback) return s;
                const o = s + this._optionsService.rawOptions.scrollback;
                return o > a.MAX_BUFFER_SIZE ? a.MAX_BUFFER_SIZE : o;
              }
              fillViewportRows(s) {
                if (this.lines.length === 0) {
                  s === void 0 && (s = d.DEFAULT_ATTR_DATA);
                  let o = this._rows;
                  for (; o--; ) this.lines.push(this.getBlankLine(s));
                }
              }
              clear() {
                ((this.ydisp = 0),
                (this.ybase = 0),
                (this.y = 0),
                (this.x = 0),
                (this.lines = new f.CircularList(
                  this._getCorrectBufferLength(this._rows)
                )),
                (this.scrollTop = 0),
                (this.scrollBottom = this._rows - 1),
                this.setupTabStops());
              }
              resize(s, o) {
                const _ = this.getNullCell(d.DEFAULT_ATTR_DATA);
                let C = 0;
                const b = this._getCorrectBufferLength(o);
                if (
                  (b > this.lines.maxLength && (this.lines.maxLength = b),
                  this.lines.length > 0)
                ) {
                  if (this._cols < s)
                    for (let S = 0; S < this.lines.length; S++)
                      C += +this.lines.get(S).resize(s, _);
                  let x = 0;
                  if (this._rows < o)
                    for (let S = this._rows; S < o; S++)
                      this.lines.length < o + this.ybase &&
                          (this._optionsService.rawOptions.windowsMode ||
                          this._optionsService.rawOptions.windowsPty.backend !==
                            void 0 ||
                          this._optionsService.rawOptions.windowsPty
                            .buildNumber !== void 0
                            ? this.lines.push(new d.BufferLine(s, _))
                            : this.ybase > 0 &&
                                this.lines.length <= this.ybase + this.y + x + 1
                              ? (this.ybase--,
                              x++,
                              this.ydisp > 0 && this.ydisp--)
                              : this.lines.push(new d.BufferLine(s, _)));
                  else
                    for (let S = this._rows; S > o; S--)
                      this.lines.length > o + this.ybase &&
                          (this.lines.length > this.ybase + this.y + 1
                            ? this.lines.pop()
                            : (this.ybase++, this.ydisp++));
                  if (b < this.lines.maxLength) {
                    const S = this.lines.length - b;
                    (S > 0 &&
                        (this.lines.trimStart(S),
                        (this.ybase = Math.max(this.ybase - S, 0)),
                        (this.ydisp = Math.max(this.ydisp - S, 0)),
                        (this.savedY = Math.max(this.savedY - S, 0))),
                    (this.lines.maxLength = b));
                  }
                  ((this.x = Math.min(this.x, s - 1)),
                  (this.y = Math.min(this.y, o - 1)),
                  x && (this.y += x),
                  (this.savedX = Math.min(this.savedX, s - 1)),
                  (this.scrollTop = 0));
                }
                if (
                  ((this.scrollBottom = o - 1),
                  this._isReflowEnabled &&
                      (this._reflow(s, o), this._cols > s))
                )
                  for (let x = 0; x < this.lines.length; x++)
                    C += +this.lines.get(x).resize(s, _);
                ((this._cols = s),
                (this._rows = o),
                this._memoryCleanupQueue.clear(),
                C > 0.1 * this.lines.length &&
                      ((this._memoryCleanupPosition = 0),
                      this._memoryCleanupQueue.enqueue(() =>
                        this._batchedMemoryCleanup()
                      )));
              }
              _batchedMemoryCleanup() {
                let s = !0;
                this._memoryCleanupPosition >= this.lines.length &&
                    ((this._memoryCleanupPosition = 0), (s = !1));
                let o = 0;
                for (; this._memoryCleanupPosition < this.lines.length; )
                  if (
                    ((o += this.lines
                      .get(this._memoryCleanupPosition++)
                      .cleanupMemory()),
                    o > 100)
                  )
                    return !0;
                return s;
              }
              get _isReflowEnabled() {
                const s = this._optionsService.rawOptions.windowsPty;
                return s && s.buildNumber
                  ? this._hasScrollback &&
                        s.backend === 'conpty' &&
                        s.buildNumber >= 21376
                  : this._hasScrollback &&
                        !this._optionsService.rawOptions.windowsMode;
              }
              _reflow(s, o) {
                this._cols !== s &&
                    (s > this._cols
                      ? this._reflowLarger(s, o)
                      : this._reflowSmaller(s, o));
              }
              _reflowLarger(s, o) {
                const _ = (0, v.reflowLargerGetLinesToRemove)(
                  this.lines,
                  this._cols,
                  s,
                  this.ybase + this.y,
                  this.getNullCell(d.DEFAULT_ATTR_DATA)
                );
                if (_.length > 0) {
                  const C = (0, v.reflowLargerCreateNewLayout)(this.lines, _);
                  ((0, v.reflowLargerApplyNewLayout)(this.lines, C.layout),
                  this._reflowLargerAdjustViewport(s, o, C.countRemoved));
                }
              }
              _reflowLargerAdjustViewport(s, o, _) {
                const C = this.getNullCell(d.DEFAULT_ATTR_DATA);
                let b = _;
                for (; b-- > 0; )
                  this.ybase === 0
                    ? (this.y > 0 && this.y--,
                    this.lines.length < o &&
                          this.lines.push(new d.BufferLine(s, C)))
                    : (this.ydisp === this.ybase && this.ydisp--,
                    this.ybase--);
                this.savedY = Math.max(this.savedY - _, 0);
              }
              _reflowSmaller(s, o) {
                const _ = this.getNullCell(d.DEFAULT_ATTR_DATA),
                  C = [];
                let b = 0;
                for (let x = this.lines.length - 1; x >= 0; x--) {
                  let S = this.lines.get(x);
                  if (!S || (!S.isWrapped && S.getTrimmedLength() <= s))
                    continue;
                  const k = [S];
                  for (; S.isWrapped && x > 0; )
                    ((S = this.lines.get(--x)), k.unshift(S));
                  const T = this.ybase + this.y;
                  if (T >= x && T < x + k.length) continue;
                  const B = k[k.length - 1].getTrimmedLength(),
                    O = (0, v.reflowSmallerGetNewLineLengths)(
                      k,
                      this._cols,
                      s
                    ),
                    A = O.length - k.length;
                  let H;
                  H =
                      this.ybase === 0 && this.y !== this.lines.length - 1
                        ? Math.max(0, this.y - this.lines.maxLength + A)
                        : Math.max(
                          0,
                          this.lines.length - this.lines.maxLength + A
                        );
                  const W = [];
                  for (let D = 0; D < A; D++) {
                    const P = this.getBlankLine(d.DEFAULT_ATTR_DATA, !0);
                    W.push(P);
                  }
                  (W.length > 0 &&
                      (C.push({ start: x + k.length + b, newLines: W }),
                      (b += W.length)),
                  k.push(...W));
                  let $ = O.length - 1,
                    G = O[$];
                  G === 0 && ($--, (G = O[$]));
                  let I = k.length - A - 1,
                    E = B;
                  for (; I >= 0; ) {
                    const D = Math.min(E, G);
                    if (k[$] === void 0) break;
                    if (
                      (k[$].copyCellsFrom(k[I], E - D, G - D, D, !0),
                      (G -= D),
                      G === 0 && ($--, (G = O[$])),
                      (E -= D),
                      E === 0)
                    ) {
                      I--;
                      const P = Math.max(I, 0);
                      E = (0, v.getWrappedLineTrimmedLength)(
                        k,
                        P,
                        this._cols
                      );
                    }
                  }
                  for (let D = 0; D < k.length; D++)
                    O[D] < s && k[D].setCell(O[D], _);
                  let R = A - H;
                  for (; R-- > 0; )
                    this.ybase === 0
                      ? this.y < o - 1
                        ? (this.y++, this.lines.pop())
                        : (this.ybase++, this.ydisp++)
                      : this.ybase <
                            Math.min(
                              this.lines.maxLength,
                              this.lines.length + b
                            ) -
                              o &&
                          (this.ybase === this.ydisp && this.ydisp++,
                          this.ybase++);
                  this.savedY = Math.min(this.savedY + A, this.ybase + o - 1);
                }
                if (C.length > 0) {
                  const x = [],
                    S = [];
                  for (let $ = 0; $ < this.lines.length; $++)
                    S.push(this.lines.get($));
                  const k = this.lines.length;
                  let T = k - 1,
                    B = 0,
                    O = C[B];
                  this.lines.length = Math.min(
                    this.lines.maxLength,
                    this.lines.length + b
                  );
                  let A = 0;
                  for (
                    let $ = Math.min(this.lines.maxLength - 1, k + b - 1);
                    $ >= 0;
                    $--
                  )
                    if (O && O.start > T + A) {
                      for (let G = O.newLines.length - 1; G >= 0; G--)
                        this.lines.set($--, O.newLines[G]);
                      ($++,
                      x.push({ index: T + 1, amount: O.newLines.length }),
                      (A += O.newLines.length),
                      (O = C[++B]));
                    } else this.lines.set($, S[T--]);
                  let H = 0;
                  for (let $ = x.length - 1; $ >= 0; $--)
                    ((x[$].index += H),
                    this.lines.onInsertEmitter.fire(x[$]),
                    (H += x[$].amount));
                  const W = Math.max(0, k + b - this.lines.maxLength);
                  W > 0 && this.lines.onTrimEmitter.fire(W);
                }
              }
              translateBufferLineToString(s, o, _ = 0, C) {
                const b = this.lines.get(s);
                return b ? b.translateToString(o, _, C) : '';
              }
              getWrappedRangeForLine(s) {
                let o = s,
                  _ = s;
                for (; o > 0 && this.lines.get(o).isWrapped; ) o--;
                for (
                  ;
                  _ + 1 < this.lines.length &&
                    this.lines.get(_ + 1).isWrapped;

                )
                  _++;
                return { first: o, last: _ };
              }
              setupTabStops(s) {
                for (
                  s != null
                    ? this.tabs[s] || (s = this.prevStop(s))
                    : ((this.tabs = {}), (s = 0));
                  s < this._cols;
                  s += this._optionsService.rawOptions.tabStopWidth
                )
                  this.tabs[s] = !0;
              }
              prevStop(s) {
                for (s == null && (s = this.x); !this.tabs[--s] && s > 0; );
                return s >= this._cols ? this._cols - 1 : s < 0 ? 0 : s;
              }
              nextStop(s) {
                for (
                  s == null && (s = this.x);
                  !this.tabs[++s] && s < this._cols;

                );
                return s >= this._cols ? this._cols - 1 : s < 0 ? 0 : s;
              }
              clearMarkers(s) {
                this._isClearing = !0;
                for (let o = 0; o < this.markers.length; o++)
                  this.markers[o].line === s &&
                      (this.markers[o].dispose(), this.markers.splice(o--, 1));
                this._isClearing = !1;
              }
              clearAllMarkers() {
                this._isClearing = !0;
                for (let s = 0; s < this.markers.length; s++)
                  (this.markers[s].dispose(), this.markers.splice(s--, 1));
                this._isClearing = !1;
              }
              addMarker(s) {
                const o = new c.Marker(s);
                return (
                  this.markers.push(o),
                  o.register(
                    this.lines.onTrim((_) => {
                      ((o.line -= _), o.line < 0 && o.dispose());
                    })
                  ),
                  o.register(
                    this.lines.onInsert((_) => {
                      o.line >= _.index && (o.line += _.amount);
                    })
                  ),
                  o.register(
                    this.lines.onDelete((_) => {
                      (o.line >= _.index &&
                          o.line < _.index + _.amount &&
                          o.dispose(),
                      o.line > _.index && (o.line -= _.amount));
                    })
                  ),
                  o.register(o.onDispose(() => this._removeMarker(o))),
                  o
                );
              }
              _removeMarker(s) {
                this._isClearing ||
                    this.markers.splice(this.markers.indexOf(s), 1);
              }
            }));
          },
          8437: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.BufferLine = a.DEFAULT_ATTR_DATA = void 0));
            const f = l(3734),
              g = l(511),
              u = l(643),
              d = l(482);
            a.DEFAULT_ATTR_DATA = Object.freeze(new f.AttributeData());
            let v = 0;
            class w {
              constructor(c, n, s = !1) {
                ((this.isWrapped = s),
                (this._combined = {}),
                (this._extendedAttrs = {}),
                (this._data = new Uint32Array(3 * c)));
                const o =
                  n ||
                  g.CellData.fromCharData([
                    0,
                    u.NULL_CELL_CHAR,
                    u.NULL_CELL_WIDTH,
                    u.NULL_CELL_CODE,
                  ]);
                for (let _ = 0; _ < c; ++_) this.setCell(_, o);
                this.length = c;
              }
              get(c) {
                const n = this._data[3 * c + 0],
                  s = 2097151 & n;
                return [
                  this._data[3 * c + 1],
                  2097152 & n
                    ? this._combined[c]
                    : s
                      ? (0, d.stringFromCodePoint)(s)
                      : '',
                  n >> 22,
                  2097152 & n
                    ? this._combined[c].charCodeAt(this._combined[c].length - 1)
                    : s,
                ];
              }
              set(c, n) {
                ((this._data[3 * c + 1] = n[u.CHAR_DATA_ATTR_INDEX]),
                n[u.CHAR_DATA_CHAR_INDEX].length > 1
                  ? ((this._combined[c] = n[1]),
                  (this._data[3 * c + 0] =
                        2097152 | c | (n[u.CHAR_DATA_WIDTH_INDEX] << 22)))
                  : (this._data[3 * c + 0] =
                        n[u.CHAR_DATA_CHAR_INDEX].charCodeAt(0) |
                        (n[u.CHAR_DATA_WIDTH_INDEX] << 22)));
              }
              getWidth(c) {
                return this._data[3 * c + 0] >> 22;
              }
              hasWidth(c) {
                return 12582912 & this._data[3 * c + 0];
              }
              getFg(c) {
                return this._data[3 * c + 1];
              }
              getBg(c) {
                return this._data[3 * c + 2];
              }
              hasContent(c) {
                return 4194303 & this._data[3 * c + 0];
              }
              getCodePoint(c) {
                const n = this._data[3 * c + 0];
                return 2097152 & n
                  ? this._combined[c].charCodeAt(this._combined[c].length - 1)
                  : 2097151 & n;
              }
              isCombined(c) {
                return 2097152 & this._data[3 * c + 0];
              }
              getString(c) {
                const n = this._data[3 * c + 0];
                return 2097152 & n
                  ? this._combined[c]
                  : 2097151 & n
                    ? (0, d.stringFromCodePoint)(2097151 & n)
                    : '';
              }
              isProtected(c) {
                return 536870912 & this._data[3 * c + 2];
              }
              loadCell(c, n) {
                return (
                  (v = 3 * c),
                  (n.content = this._data[v + 0]),
                  (n.fg = this._data[v + 1]),
                  (n.bg = this._data[v + 2]),
                  2097152 & n.content && (n.combinedData = this._combined[c]),
                  268435456 & n.bg && (n.extended = this._extendedAttrs[c]),
                  n
                );
              }
              setCell(c, n) {
                (2097152 & n.content && (this._combined[c] = n.combinedData),
                268435456 & n.bg && (this._extendedAttrs[c] = n.extended),
                (this._data[3 * c + 0] = n.content),
                (this._data[3 * c + 1] = n.fg),
                (this._data[3 * c + 2] = n.bg));
              }
              setCellFromCodepoint(c, n, s, o) {
                (268435456 & o.bg && (this._extendedAttrs[c] = o.extended),
                (this._data[3 * c + 0] = n | (s << 22)),
                (this._data[3 * c + 1] = o.fg),
                (this._data[3 * c + 2] = o.bg));
              }
              addCodepointToCell(c, n, s) {
                let o = this._data[3 * c + 0];
                (2097152 & o
                  ? (this._combined[c] += (0, d.stringFromCodePoint)(n))
                  : 2097151 & o
                    ? ((this._combined[c] =
                        (0, d.stringFromCodePoint)(2097151 & o) +
                        (0, d.stringFromCodePoint)(n)),
                    (o &= -2097152),
                    (o |= 2097152))
                    : (o = n | 4194304),
                s && ((o &= -12582913), (o |= s << 22)),
                (this._data[3 * c + 0] = o));
              }
              insertCells(c, n, s) {
                if (
                  ((c %= this.length) &&
                    this.getWidth(c - 1) === 2 &&
                    this.setCellFromCodepoint(c - 1, 0, 1, s),
                  n < this.length - c)
                ) {
                  const o = new g.CellData();
                  for (let _ = this.length - c - n - 1; _ >= 0; --_)
                    this.setCell(c + n + _, this.loadCell(c + _, o));
                  for (let _ = 0; _ < n; ++_) this.setCell(c + _, s);
                } else for (let o = c; o < this.length; ++o) this.setCell(o, s);
                this.getWidth(this.length - 1) === 2 &&
                  this.setCellFromCodepoint(this.length - 1, 0, 1, s);
              }
              deleteCells(c, n, s) {
                if (((c %= this.length), n < this.length - c)) {
                  const o = new g.CellData();
                  for (let _ = 0; _ < this.length - c - n; ++_)
                    this.setCell(c + _, this.loadCell(c + n + _, o));
                  for (let _ = this.length - n; _ < this.length; ++_)
                    this.setCell(_, s);
                } else for (let o = c; o < this.length; ++o) this.setCell(o, s);
                (c &&
                  this.getWidth(c - 1) === 2 &&
                  this.setCellFromCodepoint(c - 1, 0, 1, s),
                this.getWidth(c) !== 0 ||
                    this.hasContent(c) ||
                    this.setCellFromCodepoint(c, 0, 1, s));
              }
              replaceCells(c, n, s, o = !1) {
                if (o)
                  for (
                    c &&
                      this.getWidth(c - 1) === 2 &&
                      !this.isProtected(c - 1) &&
                      this.setCellFromCodepoint(c - 1, 0, 1, s),
                    n < this.length &&
                        this.getWidth(n - 1) === 2 &&
                        !this.isProtected(n) &&
                        this.setCellFromCodepoint(n, 0, 1, s);
                    c < n && c < this.length;

                  )
                    (this.isProtected(c) || this.setCell(c, s), c++);
                else
                  for (
                    c &&
                      this.getWidth(c - 1) === 2 &&
                      this.setCellFromCodepoint(c - 1, 0, 1, s),
                    n < this.length &&
                        this.getWidth(n - 1) === 2 &&
                        this.setCellFromCodepoint(n, 0, 1, s);
                    c < n && c < this.length;

                  )
                    this.setCell(c++, s);
              }
              resize(c, n) {
                if (c === this.length)
                  return (
                    4 * this._data.length * 2 < this._data.buffer.byteLength
                  );
                const s = 3 * c;
                if (c > this.length) {
                  if (this._data.buffer.byteLength >= 4 * s)
                    this._data = new Uint32Array(this._data.buffer, 0, s);
                  else {
                    const o = new Uint32Array(s);
                    (o.set(this._data), (this._data = o));
                  }
                  for (let o = this.length; o < c; ++o) this.setCell(o, n);
                } else {
                  this._data = this._data.subarray(0, s);
                  const o = Object.keys(this._combined);
                  for (let C = 0; C < o.length; C++) {
                    const b = parseInt(o[C], 10);
                    b >= c && delete this._combined[b];
                  }
                  const _ = Object.keys(this._extendedAttrs);
                  for (let C = 0; C < _.length; C++) {
                    const b = parseInt(_[C], 10);
                    b >= c && delete this._extendedAttrs[b];
                  }
                }
                return (
                  (this.length = c),
                  4 * s * 2 < this._data.buffer.byteLength
                );
              }
              cleanupMemory() {
                if (4 * this._data.length * 2 < this._data.buffer.byteLength) {
                  const c = new Uint32Array(this._data.length);
                  return (c.set(this._data), (this._data = c), 1);
                }
                return 0;
              }
              fill(c, n = !1) {
                if (n)
                  for (let s = 0; s < this.length; ++s)
                    this.isProtected(s) || this.setCell(s, c);
                else {
                  ((this._combined = {}), (this._extendedAttrs = {}));
                  for (let s = 0; s < this.length; ++s) this.setCell(s, c);
                }
              }
              copyFrom(c) {
                (this.length !== c.length
                  ? (this._data = new Uint32Array(c._data))
                  : this._data.set(c._data),
                (this.length = c.length),
                (this._combined = {}));
                for (const n in c._combined) this._combined[n] = c._combined[n];
                this._extendedAttrs = {};
                for (const n in c._extendedAttrs)
                  this._extendedAttrs[n] = c._extendedAttrs[n];
                this.isWrapped = c.isWrapped;
              }
              clone() {
                const c = new w(0);
                ((c._data = new Uint32Array(this._data)),
                (c.length = this.length));
                for (const n in this._combined)
                  c._combined[n] = this._combined[n];
                for (const n in this._extendedAttrs)
                  c._extendedAttrs[n] = this._extendedAttrs[n];
                return ((c.isWrapped = this.isWrapped), c);
              }
              getTrimmedLength() {
                for (let c = this.length - 1; c >= 0; --c)
                  if (4194303 & this._data[3 * c + 0])
                    return c + (this._data[3 * c + 0] >> 22);
                return 0;
              }
              getNoBgTrimmedLength() {
                for (let c = this.length - 1; c >= 0; --c)
                  if (
                    4194303 & this._data[3 * c + 0] ||
                    50331648 & this._data[3 * c + 2]
                  )
                    return c + (this._data[3 * c + 0] >> 22);
                return 0;
              }
              copyCellsFrom(c, n, s, o, _) {
                const C = c._data;
                if (_)
                  for (let x = o - 1; x >= 0; x--) {
                    for (let S = 0; S < 3; S++)
                      this._data[3 * (s + x) + S] = C[3 * (n + x) + S];
                    268435456 & C[3 * (n + x) + 2] &&
                      (this._extendedAttrs[s + x] = c._extendedAttrs[n + x]);
                  }
                else
                  for (let x = 0; x < o; x++) {
                    for (let S = 0; S < 3; S++)
                      this._data[3 * (s + x) + S] = C[3 * (n + x) + S];
                    268435456 & C[3 * (n + x) + 2] &&
                      (this._extendedAttrs[s + x] = c._extendedAttrs[n + x]);
                  }
                const b = Object.keys(c._combined);
                for (let x = 0; x < b.length; x++) {
                  const S = parseInt(b[x], 10);
                  S >= n && (this._combined[S - n + s] = c._combined[S]);
                }
              }
              translateToString(c, n, s, o) {
                ((n = n ?? 0),
                (s = s ?? this.length),
                c && (s = Math.min(s, this.getTrimmedLength())),
                o && (o.length = 0));
                let _ = '';
                for (; n < s; ) {
                  const C = this._data[3 * n + 0],
                    b = 2097151 & C,
                    x =
                      2097152 & C
                        ? this._combined[n]
                        : b
                          ? (0, d.stringFromCodePoint)(b)
                          : u.WHITESPACE_CELL_CHAR;
                  if (((_ += x), o))
                    for (let S = 0; S < x.length; ++S) o.push(n);
                  n += C >> 22 || 1;
                }
                return (o && o.push(n), _);
              }
            }
            a.BufferLine = w;
          },
          4841: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.getRangeLength = void 0),
            (a.getRangeLength = function (l, f) {
              if (l.start.y > l.end.y)
                throw new Error(
                  `Buffer range end (${l.end.x}, ${l.end.y}) cannot be before start (${l.start.x}, ${l.start.y})`
                );
              return f * (l.end.y - l.start.y) + (l.end.x - l.start.x + 1);
            }));
          },
          4634: (y, a) => {
            function l(f, g, u) {
              if (g === f.length - 1) return f[g].getTrimmedLength();
              const d = !f[g].hasContent(u - 1) && f[g].getWidth(u - 1) === 1,
                v = f[g + 1].getWidth(0) === 2;
              return d && v ? u - 1 : u;
            }
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.getWrappedLineTrimmedLength =
                a.reflowSmallerGetNewLineLengths =
                a.reflowLargerApplyNewLayout =
                a.reflowLargerCreateNewLayout =
                a.reflowLargerGetLinesToRemove =
                  void 0),
            (a.reflowLargerGetLinesToRemove = function (f, g, u, d, v) {
              const w = [];
              for (let p = 0; p < f.length - 1; p++) {
                let c = p,
                  n = f.get(++c);
                if (!n.isWrapped) continue;
                const s = [f.get(p)];
                for (; c < f.length && n.isWrapped; )
                  (s.push(n), (n = f.get(++c)));
                if (d >= p && d < c) {
                  p += s.length - 1;
                  continue;
                }
                let o = 0,
                  _ = l(s, o, g),
                  C = 1,
                  b = 0;
                for (; C < s.length; ) {
                  const S = l(s, C, g),
                    k = S - b,
                    T = u - _,
                    B = Math.min(k, T);
                  (s[o].copyCellsFrom(s[C], b, _, B, !1),
                  (_ += B),
                  _ === u && (o++, (_ = 0)),
                  (b += B),
                  b === S && (C++, (b = 0)),
                  _ === 0 &&
                        o !== 0 &&
                        s[o - 1].getWidth(u - 1) === 2 &&
                        (s[o].copyCellsFrom(s[o - 1], u - 1, _++, 1, !1),
                        s[o - 1].setCell(u - 1, v)));
                }
                s[o].replaceCells(_, u, v);
                let x = 0;
                for (
                  let S = s.length - 1;
                  S > 0 && (S > o || s[S].getTrimmedLength() === 0);
                  S--
                )
                  x++;
                (x > 0 && (w.push(p + s.length - x), w.push(x)),
                (p += s.length - 1));
              }
              return w;
            }),
            (a.reflowLargerCreateNewLayout = function (f, g) {
              const u = [];
              let d = 0,
                v = g[d],
                w = 0;
              for (let p = 0; p < f.length; p++)
                if (v === p) {
                  const c = g[++d];
                  (f.onDeleteEmitter.fire({ index: p - w, amount: c }),
                  (p += c - 1),
                  (w += c),
                  (v = g[++d]));
                } else u.push(p);
              return { layout: u, countRemoved: w };
            }),
            (a.reflowLargerApplyNewLayout = function (f, g) {
              const u = [];
              for (let d = 0; d < g.length; d++) u.push(f.get(g[d]));
              for (let d = 0; d < u.length; d++) f.set(d, u[d]);
              f.length = g.length;
            }),
            (a.reflowSmallerGetNewLineLengths = function (f, g, u) {
              const d = [],
                v = f.map((n, s) => l(f, s, g)).reduce((n, s) => n + s);
              let w = 0,
                p = 0,
                c = 0;
              for (; c < v; ) {
                if (v - c < u) {
                  d.push(v - c);
                  break;
                }
                w += u;
                const n = l(f, p, g);
                w > n && ((w -= n), p++);
                const s = f[p].getWidth(w - 1) === 2;
                s && w--;
                const o = s ? u - 1 : u;
                (d.push(o), (c += o));
              }
              return d;
            }),
            (a.getWrappedLineTrimmedLength = l));
          },
          5295: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.BufferSet = void 0));
            const f = l(8460),
              g = l(844),
              u = l(9092);
            class d extends g.Disposable {
              constructor(w, p) {
                (super(),
                (this._optionsService = w),
                (this._bufferService = p),
                (this._onBufferActivate = this.register(
                  new f.EventEmitter()
                )),
                (this.onBufferActivate = this._onBufferActivate.event),
                this.reset(),
                this.register(
                  this._optionsService.onSpecificOptionChange(
                    'scrollback',
                    () =>
                      this.resize(
                        this._bufferService.cols,
                        this._bufferService.rows
                      )
                  )
                ),
                this.register(
                  this._optionsService.onSpecificOptionChange(
                    'tabStopWidth',
                    () => this.setupTabStops()
                  )
                ));
              }
              reset() {
                ((this._normal = new u.Buffer(
                  !0,
                  this._optionsService,
                  this._bufferService
                )),
                this._normal.fillViewportRows(),
                (this._alt = new u.Buffer(
                  !1,
                  this._optionsService,
                  this._bufferService
                )),
                (this._activeBuffer = this._normal),
                this._onBufferActivate.fire({
                  activeBuffer: this._normal,
                  inactiveBuffer: this._alt,
                }),
                this.setupTabStops());
              }
              get alt() {
                return this._alt;
              }
              get active() {
                return this._activeBuffer;
              }
              get normal() {
                return this._normal;
              }
              activateNormalBuffer() {
                this._activeBuffer !== this._normal &&
                  ((this._normal.x = this._alt.x),
                  (this._normal.y = this._alt.y),
                  this._alt.clearAllMarkers(),
                  this._alt.clear(),
                  (this._activeBuffer = this._normal),
                  this._onBufferActivate.fire({
                    activeBuffer: this._normal,
                    inactiveBuffer: this._alt,
                  }));
              }
              activateAltBuffer(w) {
                this._activeBuffer !== this._alt &&
                  (this._alt.fillViewportRows(w),
                  (this._alt.x = this._normal.x),
                  (this._alt.y = this._normal.y),
                  (this._activeBuffer = this._alt),
                  this._onBufferActivate.fire({
                    activeBuffer: this._alt,
                    inactiveBuffer: this._normal,
                  }));
              }
              resize(w, p) {
                (this._normal.resize(w, p),
                this._alt.resize(w, p),
                this.setupTabStops(w));
              }
              setupTabStops(w) {
                (this._normal.setupTabStops(w), this._alt.setupTabStops(w));
              }
            }
            a.BufferSet = d;
          },
          511: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.CellData = void 0));
            const f = l(482),
              g = l(643),
              u = l(3734);
            class d extends u.AttributeData {
              constructor() {
                (super(...arguments),
                (this.content = 0),
                (this.fg = 0),
                (this.bg = 0),
                (this.extended = new u.ExtendedAttrs()),
                (this.combinedData = ''));
              }
              static fromCharData(w) {
                const p = new d();
                return (p.setFromCharData(w), p);
              }
              isCombined() {
                return 2097152 & this.content;
              }
              getWidth() {
                return this.content >> 22;
              }
              getChars() {
                return 2097152 & this.content
                  ? this.combinedData
                  : 2097151 & this.content
                    ? (0, f.stringFromCodePoint)(2097151 & this.content)
                    : '';
              }
              getCode() {
                return this.isCombined()
                  ? this.combinedData.charCodeAt(this.combinedData.length - 1)
                  : 2097151 & this.content;
              }
              setFromCharData(w) {
                ((this.fg = w[g.CHAR_DATA_ATTR_INDEX]), (this.bg = 0));
                let p = !1;
                if (w[g.CHAR_DATA_CHAR_INDEX].length > 2) p = !0;
                else if (w[g.CHAR_DATA_CHAR_INDEX].length === 2) {
                  const c = w[g.CHAR_DATA_CHAR_INDEX].charCodeAt(0);
                  if (55296 <= c && c <= 56319) {
                    const n = w[g.CHAR_DATA_CHAR_INDEX].charCodeAt(1);
                    56320 <= n && n <= 57343
                      ? (this.content =
                          (1024 * (c - 55296) + n - 56320 + 65536) |
                          (w[g.CHAR_DATA_WIDTH_INDEX] << 22))
                      : (p = !0);
                  } else p = !0;
                } else
                  this.content =
                    w[g.CHAR_DATA_CHAR_INDEX].charCodeAt(0) |
                    (w[g.CHAR_DATA_WIDTH_INDEX] << 22);
                p &&
                  ((this.combinedData = w[g.CHAR_DATA_CHAR_INDEX]),
                  (this.content =
                    2097152 | (w[g.CHAR_DATA_WIDTH_INDEX] << 22)));
              }
              getAsCharData() {
                return [
                  this.fg,
                  this.getChars(),
                  this.getWidth(),
                  this.getCode(),
                ];
              }
            }
            a.CellData = d;
          },
          643: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.WHITESPACE_CELL_CODE =
                a.WHITESPACE_CELL_WIDTH =
                a.WHITESPACE_CELL_CHAR =
                a.NULL_CELL_CODE =
                a.NULL_CELL_WIDTH =
                a.NULL_CELL_CHAR =
                a.CHAR_DATA_CODE_INDEX =
                a.CHAR_DATA_WIDTH_INDEX =
                a.CHAR_DATA_CHAR_INDEX =
                a.CHAR_DATA_ATTR_INDEX =
                a.DEFAULT_EXT =
                a.DEFAULT_ATTR =
                a.DEFAULT_COLOR =
                  void 0),
            (a.DEFAULT_COLOR = 0),
            (a.DEFAULT_ATTR = 256 | (a.DEFAULT_COLOR << 9)),
            (a.DEFAULT_EXT = 0),
            (a.CHAR_DATA_ATTR_INDEX = 0),
            (a.CHAR_DATA_CHAR_INDEX = 1),
            (a.CHAR_DATA_WIDTH_INDEX = 2),
            (a.CHAR_DATA_CODE_INDEX = 3),
            (a.NULL_CELL_CHAR = ''),
            (a.NULL_CELL_WIDTH = 1),
            (a.NULL_CELL_CODE = 0),
            (a.WHITESPACE_CELL_CHAR = ' '),
            (a.WHITESPACE_CELL_WIDTH = 1),
            (a.WHITESPACE_CELL_CODE = 32));
          },
          4863: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.Marker = void 0));
            const f = l(8460),
              g = l(844);
            class u {
              get id() {
                return this._id;
              }
              constructor(v) {
                ((this.line = v),
                (this.isDisposed = !1),
                (this._disposables = []),
                (this._id = u._nextId++),
                (this._onDispose = this.register(new f.EventEmitter())),
                (this.onDispose = this._onDispose.event));
              }
              dispose() {
                this.isDisposed ||
                  ((this.isDisposed = !0),
                  (this.line = -1),
                  this._onDispose.fire(),
                  (0, g.disposeArray)(this._disposables),
                  (this._disposables.length = 0));
              }
              register(v) {
                return (this._disposables.push(v), v);
              }
            }
            ((a.Marker = u), (u._nextId = 1));
          },
          7116: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.DEFAULT_CHARSET = a.CHARSETS = void 0),
            (a.CHARSETS = {}),
            (a.DEFAULT_CHARSET = a.CHARSETS.B),
            (a.CHARSETS[0] = {
              '`': '◆',
              a: '▒',
              b: '␉',
              c: '␌',
              d: '␍',
              e: '␊',
              f: '°',
              g: '±',
              h: '␤',
              i: '␋',
              j: '┘',
              k: '┐',
              l: '┌',
              m: '└',
              n: '┼',
              o: '⎺',
              p: '⎻',
              q: '─',
              r: '⎼',
              s: '⎽',
              t: '├',
              u: '┤',
              v: '┴',
              w: '┬',
              x: '│',
              y: '≤',
              z: '≥',
              '{': 'π',
              '|': '≠',
              '}': '£',
              '~': '·',
            }),
            (a.CHARSETS.A = { '#': '£' }),
            (a.CHARSETS.B = void 0),
            (a.CHARSETS[4] = {
              '#': '£',
              '@': '¾',
              '[': 'ij',
              '\\': '½',
              ']': '|',
              '{': '¨',
              '|': 'f',
              '}': '¼',
              '~': '´',
            }),
            (a.CHARSETS.C = a.CHARSETS[5] =
                {
                  '[': 'Ä',
                  '\\': 'Ö',
                  ']': 'Å',
                  '^': 'Ü',
                  '`': 'é',
                  '{': 'ä',
                  '|': 'ö',
                  '}': 'å',
                  '~': 'ü',
                }),
            (a.CHARSETS.R = {
              '#': '£',
              '@': 'à',
              '[': '°',
              '\\': 'ç',
              ']': '§',
              '{': 'é',
              '|': 'ù',
              '}': 'è',
              '~': '¨',
            }),
            (a.CHARSETS.Q = {
              '@': 'à',
              '[': 'â',
              '\\': 'ç',
              ']': 'ê',
              '^': 'î',
              '`': 'ô',
              '{': 'é',
              '|': 'ù',
              '}': 'è',
              '~': 'û',
            }),
            (a.CHARSETS.K = {
              '@': '§',
              '[': 'Ä',
              '\\': 'Ö',
              ']': 'Ü',
              '{': 'ä',
              '|': 'ö',
              '}': 'ü',
              '~': 'ß',
            }),
            (a.CHARSETS.Y = {
              '#': '£',
              '@': '§',
              '[': '°',
              '\\': 'ç',
              ']': 'é',
              '`': 'ù',
              '{': 'à',
              '|': 'ò',
              '}': 'è',
              '~': 'ì',
            }),
            (a.CHARSETS.E = a.CHARSETS[6] =
                {
                  '@': 'Ä',
                  '[': 'Æ',
                  '\\': 'Ø',
                  ']': 'Å',
                  '^': 'Ü',
                  '`': 'ä',
                  '{': 'æ',
                  '|': 'ø',
                  '}': 'å',
                  '~': 'ü',
                }),
            (a.CHARSETS.Z = {
              '#': '£',
              '@': '§',
              '[': '¡',
              '\\': 'Ñ',
              ']': '¿',
              '{': '°',
              '|': 'ñ',
              '}': 'ç',
            }),
            (a.CHARSETS.H = a.CHARSETS[7] =
                {
                  '@': 'É',
                  '[': 'Ä',
                  '\\': 'Ö',
                  ']': 'Å',
                  '^': 'Ü',
                  '`': 'é',
                  '{': 'ä',
                  '|': 'ö',
                  '}': 'å',
                  '~': 'ü',
                }),
            (a.CHARSETS['='] = {
              '#': 'ù',
              '@': 'à',
              '[': 'é',
              '\\': 'ç',
              ']': 'ê',
              '^': 'î',
              _: 'è',
              '`': 'ô',
              '{': 'ä',
              '|': 'ö',
              '}': 'ü',
              '~': 'û',
            }));
          },
          2584: (y, a) => {
            var l, f, g;
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.C1_ESCAPED = a.C1 = a.C0 = void 0),
            (function (u) {
              ((u.NUL = '\0'),
              (u.SOH = ''),
              (u.STX = ''),
              (u.ETX = ''),
              (u.EOT = ''),
              (u.ENQ = ''),
              (u.ACK = ''),
              (u.BEL = '\x07'),
              (u.BS = '\b'),
              (u.HT = '	'),
              (u.LF = `
`),
              (u.VT = '\v'),
              (u.FF = '\f'),
              (u.CR = '\r'),
              (u.SO = ''),
              (u.SI = ''),
              (u.DLE = ''),
              (u.DC1 = ''),
              (u.DC2 = ''),
              (u.DC3 = ''),
              (u.DC4 = ''),
              (u.NAK = ''),
              (u.SYN = ''),
              (u.ETB = ''),
              (u.CAN = ''),
              (u.EM = ''),
              (u.SUB = ''),
              (u.ESC = '\x1B'),
              (u.FS = ''),
              (u.GS = ''),
              (u.RS = ''),
              (u.US = ''),
              (u.SP = ' '),
              (u.DEL = ''));
            })(l || (a.C0 = l = {})),
            (function (u) {
              ((u.PAD = ''),
              (u.HOP = ''),
              (u.BPH = ''),
              (u.NBH = ''),
              (u.IND = ''),
              (u.NEL = ''),
              (u.SSA = ''),
              (u.ESA = ''),
              (u.HTS = ''),
              (u.HTJ = ''),
              (u.VTS = ''),
              (u.PLD = ''),
              (u.PLU = ''),
              (u.RI = ''),
              (u.SS2 = ''),
              (u.SS3 = ''),
              (u.DCS = ''),
              (u.PU1 = ''),
              (u.PU2 = ''),
              (u.STS = ''),
              (u.CCH = ''),
              (u.MW = ''),
              (u.SPA = ''),
              (u.EPA = ''),
              (u.SOS = ''),
              (u.SGCI = ''),
              (u.SCI = ''),
              (u.CSI = ''),
              (u.ST = ''),
              (u.OSC = ''),
              (u.PM = ''),
              (u.APC = ''));
            })(f || (a.C1 = f = {})),
            (function (u) {
              u.ST = `${l.ESC}\\`;
            })(g || (a.C1_ESCAPED = g = {})));
          },
          7399: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.evaluateKeyboardEvent = void 0));
            const f = l(2584),
              g = {
                48: ['0', ')'],
                49: ['1', '!'],
                50: ['2', '@'],
                51: ['3', '#'],
                52: ['4', '$'],
                53: ['5', '%'],
                54: ['6', '^'],
                55: ['7', '&'],
                56: ['8', '*'],
                57: ['9', '('],
                186: [';', ':'],
                187: ['=', '+'],
                188: [',', '<'],
                189: ['-', '_'],
                190: ['.', '>'],
                191: ['/', '?'],
                192: ['`', '~'],
                219: ['[', '{'],
                220: ['\\', '|'],
                221: [']', '}'],
                222: ['\'', '"'],
              };
            a.evaluateKeyboardEvent = function (u, d, v, w) {
              const p = { type: 0, cancel: !1, key: void 0 },
                c =
                  (u.shiftKey ? 1 : 0) |
                  (u.altKey ? 2 : 0) |
                  (u.ctrlKey ? 4 : 0) |
                  (u.metaKey ? 8 : 0);
              switch (u.keyCode) {
              case 0:
                u.key === 'UIKeyInputUpArrow'
                  ? (p.key = d ? f.C0.ESC + 'OA' : f.C0.ESC + '[A')
                  : u.key === 'UIKeyInputLeftArrow'
                    ? (p.key = d ? f.C0.ESC + 'OD' : f.C0.ESC + '[D')
                    : u.key === 'UIKeyInputRightArrow'
                      ? (p.key = d ? f.C0.ESC + 'OC' : f.C0.ESC + '[C')
                      : u.key === 'UIKeyInputDownArrow' &&
                          (p.key = d ? f.C0.ESC + 'OB' : f.C0.ESC + '[B');
                break;
              case 8:
                ((p.key = u.ctrlKey ? '\b' : f.C0.DEL),
                u.altKey && (p.key = f.C0.ESC + p.key));
                break;
              case 9:
                if (u.shiftKey) {
                  p.key = f.C0.ESC + '[Z';
                  break;
                }
                ((p.key = f.C0.HT), (p.cancel = !0));
                break;
              case 13:
                ((p.key = u.altKey ? f.C0.ESC + f.C0.CR : f.C0.CR),
                (p.cancel = !0));
                break;
              case 27:
                ((p.key = f.C0.ESC),
                u.altKey && (p.key = f.C0.ESC + f.C0.ESC),
                (p.cancel = !0));
                break;
              case 37:
                if (u.metaKey) break;
                c
                  ? ((p.key = f.C0.ESC + '[1;' + (c + 1) + 'D'),
                  p.key === f.C0.ESC + '[1;3D' &&
                        (p.key = f.C0.ESC + (v ? 'b' : '[1;5D')))
                  : (p.key = d ? f.C0.ESC + 'OD' : f.C0.ESC + '[D');
                break;
              case 39:
                if (u.metaKey) break;
                c
                  ? ((p.key = f.C0.ESC + '[1;' + (c + 1) + 'C'),
                  p.key === f.C0.ESC + '[1;3C' &&
                        (p.key = f.C0.ESC + (v ? 'f' : '[1;5C')))
                  : (p.key = d ? f.C0.ESC + 'OC' : f.C0.ESC + '[C');
                break;
              case 38:
                if (u.metaKey) break;
                c
                  ? ((p.key = f.C0.ESC + '[1;' + (c + 1) + 'A'),
                  v ||
                        p.key !== f.C0.ESC + '[1;3A' ||
                        (p.key = f.C0.ESC + '[1;5A'))
                  : (p.key = d ? f.C0.ESC + 'OA' : f.C0.ESC + '[A');
                break;
              case 40:
                if (u.metaKey) break;
                c
                  ? ((p.key = f.C0.ESC + '[1;' + (c + 1) + 'B'),
                  v ||
                        p.key !== f.C0.ESC + '[1;3B' ||
                        (p.key = f.C0.ESC + '[1;5B'))
                  : (p.key = d ? f.C0.ESC + 'OB' : f.C0.ESC + '[B');
                break;
              case 45:
                u.shiftKey || u.ctrlKey || (p.key = f.C0.ESC + '[2~');
                break;
              case 46:
                p.key = c
                  ? f.C0.ESC + '[3;' + (c + 1) + '~'
                  : f.C0.ESC + '[3~';
                break;
              case 36:
                p.key = c
                  ? f.C0.ESC + '[1;' + (c + 1) + 'H'
                  : d
                    ? f.C0.ESC + 'OH'
                    : f.C0.ESC + '[H';
                break;
              case 35:
                p.key = c
                  ? f.C0.ESC + '[1;' + (c + 1) + 'F'
                  : d
                    ? f.C0.ESC + 'OF'
                    : f.C0.ESC + '[F';
                break;
              case 33:
                u.shiftKey
                  ? (p.type = 2)
                  : u.ctrlKey
                    ? (p.key = f.C0.ESC + '[5;' + (c + 1) + '~')
                    : (p.key = f.C0.ESC + '[5~');
                break;
              case 34:
                u.shiftKey
                  ? (p.type = 3)
                  : u.ctrlKey
                    ? (p.key = f.C0.ESC + '[6;' + (c + 1) + '~')
                    : (p.key = f.C0.ESC + '[6~');
                break;
              case 112:
                p.key = c
                  ? f.C0.ESC + '[1;' + (c + 1) + 'P'
                  : f.C0.ESC + 'OP';
                break;
              case 113:
                p.key = c
                  ? f.C0.ESC + '[1;' + (c + 1) + 'Q'
                  : f.C0.ESC + 'OQ';
                break;
              case 114:
                p.key = c
                  ? f.C0.ESC + '[1;' + (c + 1) + 'R'
                  : f.C0.ESC + 'OR';
                break;
              case 115:
                p.key = c
                  ? f.C0.ESC + '[1;' + (c + 1) + 'S'
                  : f.C0.ESC + 'OS';
                break;
              case 116:
                p.key = c
                  ? f.C0.ESC + '[15;' + (c + 1) + '~'
                  : f.C0.ESC + '[15~';
                break;
              case 117:
                p.key = c
                  ? f.C0.ESC + '[17;' + (c + 1) + '~'
                  : f.C0.ESC + '[17~';
                break;
              case 118:
                p.key = c
                  ? f.C0.ESC + '[18;' + (c + 1) + '~'
                  : f.C0.ESC + '[18~';
                break;
              case 119:
                p.key = c
                  ? f.C0.ESC + '[19;' + (c + 1) + '~'
                  : f.C0.ESC + '[19~';
                break;
              case 120:
                p.key = c
                  ? f.C0.ESC + '[20;' + (c + 1) + '~'
                  : f.C0.ESC + '[20~';
                break;
              case 121:
                p.key = c
                  ? f.C0.ESC + '[21;' + (c + 1) + '~'
                  : f.C0.ESC + '[21~';
                break;
              case 122:
                p.key = c
                  ? f.C0.ESC + '[23;' + (c + 1) + '~'
                  : f.C0.ESC + '[23~';
                break;
              case 123:
                p.key = c
                  ? f.C0.ESC + '[24;' + (c + 1) + '~'
                  : f.C0.ESC + '[24~';
                break;
              default:
                if (!u.ctrlKey || u.shiftKey || u.altKey || u.metaKey)
                  if ((v && !w) || !u.altKey || u.metaKey)
                    !v || u.altKey || u.ctrlKey || u.shiftKey || !u.metaKey
                      ? u.key &&
                          !u.ctrlKey &&
                          !u.altKey &&
                          !u.metaKey &&
                          u.keyCode >= 48 &&
                          u.key.length === 1
                        ? (p.key = u.key)
                        : u.key &&
                            u.ctrlKey &&
                            (u.key === '_' && (p.key = f.C0.US),
                            u.key === '@' && (p.key = f.C0.NUL))
                      : u.keyCode === 65 && (p.type = 1);
                  else {
                    const n = g[u.keyCode],
                      s = n == null ? void 0 : n[u.shiftKey ? 1 : 0];
                    if (s) p.key = f.C0.ESC + s;
                    else if (u.keyCode >= 65 && u.keyCode <= 90) {
                      const o = u.ctrlKey ? u.keyCode - 64 : u.keyCode + 32;
                      let _ = String.fromCharCode(o);
                      (u.shiftKey && (_ = _.toUpperCase()),
                      (p.key = f.C0.ESC + _));
                    } else if (u.keyCode === 32)
                      p.key = f.C0.ESC + (u.ctrlKey ? f.C0.NUL : ' ');
                    else if (u.key === 'Dead' && u.code.startsWith('Key')) {
                      let o = u.code.slice(3, 4);
                      (u.shiftKey || (o = o.toLowerCase()),
                      (p.key = f.C0.ESC + o),
                      (p.cancel = !0));
                    }
                  }
                else
                  u.keyCode >= 65 && u.keyCode <= 90
                    ? (p.key = String.fromCharCode(u.keyCode - 64))
                    : u.keyCode === 32
                      ? (p.key = f.C0.NUL)
                      : u.keyCode >= 51 && u.keyCode <= 55
                        ? (p.key = String.fromCharCode(u.keyCode - 51 + 27))
                        : u.keyCode === 56
                          ? (p.key = f.C0.DEL)
                          : u.keyCode === 219
                            ? (p.key = f.C0.ESC)
                            : u.keyCode === 220
                              ? (p.key = f.C0.FS)
                              : u.keyCode === 221 && (p.key = f.C0.GS);
              }
              return p;
            };
          },
          482: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.Utf8ToUtf32 =
                a.StringToUtf32 =
                a.utf32ToString =
                a.stringFromCodePoint =
                  void 0),
            (a.stringFromCodePoint = function (l) {
              return l > 65535
                ? ((l -= 65536),
                String.fromCharCode(55296 + (l >> 10)) +
                      String.fromCharCode((l % 1024) + 56320))
                : String.fromCharCode(l);
            }),
            (a.utf32ToString = function (l, f = 0, g = l.length) {
              let u = '';
              for (let d = f; d < g; ++d) {
                let v = l[d];
                v > 65535
                  ? ((v -= 65536),
                  (u +=
                        String.fromCharCode(55296 + (v >> 10)) +
                        String.fromCharCode((v % 1024) + 56320)))
                  : (u += String.fromCharCode(v));
              }
              return u;
            }),
            (a.StringToUtf32 = class {
              constructor() {
                this._interim = 0;
              }
              clear() {
                this._interim = 0;
              }
              decode(l, f) {
                const g = l.length;
                if (!g) return 0;
                let u = 0,
                  d = 0;
                if (this._interim) {
                  const v = l.charCodeAt(d++);
                  (56320 <= v && v <= 57343
                    ? (f[u++] =
                          1024 * (this._interim - 55296) + v - 56320 + 65536)
                    : ((f[u++] = this._interim), (f[u++] = v)),
                  (this._interim = 0));
                }
                for (let v = d; v < g; ++v) {
                  const w = l.charCodeAt(v);
                  if (55296 <= w && w <= 56319) {
                    if (++v >= g) return ((this._interim = w), u);
                    const p = l.charCodeAt(v);
                    56320 <= p && p <= 57343
                      ? (f[u++] = 1024 * (w - 55296) + p - 56320 + 65536)
                      : ((f[u++] = w), (f[u++] = p));
                  } else w !== 65279 && (f[u++] = w);
                }
                return u;
              }
            }),
            (a.Utf8ToUtf32 = class {
              constructor() {
                this.interim = new Uint8Array(3);
              }
              clear() {
                this.interim.fill(0);
              }
              decode(l, f) {
                const g = l.length;
                if (!g) return 0;
                let u,
                  d,
                  v,
                  w,
                  p = 0,
                  c = 0,
                  n = 0;
                if (this.interim[0]) {
                  let _ = !1,
                    C = this.interim[0];
                  C &= (224 & C) == 192 ? 31 : (240 & C) == 224 ? 15 : 7;
                  let b,
                    x = 0;
                  for (; (b = 63 & this.interim[++x]) && x < 4; )
                    ((C <<= 6), (C |= b));
                  const S =
                        (224 & this.interim[0]) == 192
                          ? 2
                          : (240 & this.interim[0]) == 224
                            ? 3
                            : 4,
                    k = S - x;
                  for (; n < k; ) {
                    if (n >= g) return 0;
                    if (((b = l[n++]), (192 & b) != 128)) {
                      (n--, (_ = !0));
                      break;
                    }
                    ((this.interim[x++] = b), (C <<= 6), (C |= 63 & b));
                  }
                  (_ ||
                      (S === 2
                        ? C < 128
                          ? n--
                          : (f[p++] = C)
                        : S === 3
                          ? C < 2048 ||
                            (C >= 55296 && C <= 57343) ||
                            C === 65279 ||
                            (f[p++] = C)
                          : C < 65536 || C > 1114111 || (f[p++] = C)),
                  this.interim.fill(0));
                }
                const s = g - 4;
                let o = n;
                for (; o < g; ) {
                  for (
                    ;
                    !(
                      !(o < s) ||
                        128 & (u = l[o]) ||
                        128 & (d = l[o + 1]) ||
                        128 & (v = l[o + 2]) ||
                        128 & (w = l[o + 3])
                    );

                  )
                    ((f[p++] = u),
                    (f[p++] = d),
                    (f[p++] = v),
                    (f[p++] = w),
                    (o += 4));
                  if (((u = l[o++]), u < 128)) f[p++] = u;
                  else if ((224 & u) == 192) {
                    if (o >= g) return ((this.interim[0] = u), p);
                    if (((d = l[o++]), (192 & d) != 128)) {
                      o--;
                      continue;
                    }
                    if (((c = ((31 & u) << 6) | (63 & d)), c < 128)) {
                      o--;
                      continue;
                    }
                    f[p++] = c;
                  } else if ((240 & u) == 224) {
                    if (o >= g) return ((this.interim[0] = u), p);
                    if (((d = l[o++]), (192 & d) != 128)) {
                      o--;
                      continue;
                    }
                    if (o >= g)
                      return (
                        (this.interim[0] = u),
                        (this.interim[1] = d),
                        p
                      );
                    if (((v = l[o++]), (192 & v) != 128)) {
                      o--;
                      continue;
                    }
                    if (
                      ((c = ((15 & u) << 12) | ((63 & d) << 6) | (63 & v)),
                      c < 2048 || (c >= 55296 && c <= 57343) || c === 65279)
                    )
                      continue;
                    f[p++] = c;
                  } else if ((248 & u) == 240) {
                    if (o >= g) return ((this.interim[0] = u), p);
                    if (((d = l[o++]), (192 & d) != 128)) {
                      o--;
                      continue;
                    }
                    if (o >= g)
                      return (
                        (this.interim[0] = u),
                        (this.interim[1] = d),
                        p
                      );
                    if (((v = l[o++]), (192 & v) != 128)) {
                      o--;
                      continue;
                    }
                    if (o >= g)
                      return (
                        (this.interim[0] = u),
                        (this.interim[1] = d),
                        (this.interim[2] = v),
                        p
                      );
                    if (((w = l[o++]), (192 & w) != 128)) {
                      o--;
                      continue;
                    }
                    if (
                      ((c =
                          ((7 & u) << 18) |
                          ((63 & d) << 12) |
                          ((63 & v) << 6) |
                          (63 & w)),
                      c < 65536 || c > 1114111)
                    )
                      continue;
                    f[p++] = c;
                  }
                }
                return p;
              }
            }));
          },
          225: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.UnicodeV6 = void 0));
            const f = l(1480),
              g = [
                [768, 879],
                [1155, 1158],
                [1160, 1161],
                [1425, 1469],
                [1471, 1471],
                [1473, 1474],
                [1476, 1477],
                [1479, 1479],
                [1536, 1539],
                [1552, 1557],
                [1611, 1630],
                [1648, 1648],
                [1750, 1764],
                [1767, 1768],
                [1770, 1773],
                [1807, 1807],
                [1809, 1809],
                [1840, 1866],
                [1958, 1968],
                [2027, 2035],
                [2305, 2306],
                [2364, 2364],
                [2369, 2376],
                [2381, 2381],
                [2385, 2388],
                [2402, 2403],
                [2433, 2433],
                [2492, 2492],
                [2497, 2500],
                [2509, 2509],
                [2530, 2531],
                [2561, 2562],
                [2620, 2620],
                [2625, 2626],
                [2631, 2632],
                [2635, 2637],
                [2672, 2673],
                [2689, 2690],
                [2748, 2748],
                [2753, 2757],
                [2759, 2760],
                [2765, 2765],
                [2786, 2787],
                [2817, 2817],
                [2876, 2876],
                [2879, 2879],
                [2881, 2883],
                [2893, 2893],
                [2902, 2902],
                [2946, 2946],
                [3008, 3008],
                [3021, 3021],
                [3134, 3136],
                [3142, 3144],
                [3146, 3149],
                [3157, 3158],
                [3260, 3260],
                [3263, 3263],
                [3270, 3270],
                [3276, 3277],
                [3298, 3299],
                [3393, 3395],
                [3405, 3405],
                [3530, 3530],
                [3538, 3540],
                [3542, 3542],
                [3633, 3633],
                [3636, 3642],
                [3655, 3662],
                [3761, 3761],
                [3764, 3769],
                [3771, 3772],
                [3784, 3789],
                [3864, 3865],
                [3893, 3893],
                [3895, 3895],
                [3897, 3897],
                [3953, 3966],
                [3968, 3972],
                [3974, 3975],
                [3984, 3991],
                [3993, 4028],
                [4038, 4038],
                [4141, 4144],
                [4146, 4146],
                [4150, 4151],
                [4153, 4153],
                [4184, 4185],
                [4448, 4607],
                [4959, 4959],
                [5906, 5908],
                [5938, 5940],
                [5970, 5971],
                [6002, 6003],
                [6068, 6069],
                [6071, 6077],
                [6086, 6086],
                [6089, 6099],
                [6109, 6109],
                [6155, 6157],
                [6313, 6313],
                [6432, 6434],
                [6439, 6440],
                [6450, 6450],
                [6457, 6459],
                [6679, 6680],
                [6912, 6915],
                [6964, 6964],
                [6966, 6970],
                [6972, 6972],
                [6978, 6978],
                [7019, 7027],
                [7616, 7626],
                [7678, 7679],
                [8203, 8207],
                [8234, 8238],
                [8288, 8291],
                [8298, 8303],
                [8400, 8431],
                [12330, 12335],
                [12441, 12442],
                [43014, 43014],
                [43019, 43019],
                [43045, 43046],
                [64286, 64286],
                [65024, 65039],
                [65056, 65059],
                [65279, 65279],
                [65529, 65531],
              ],
              u = [
                [68097, 68099],
                [68101, 68102],
                [68108, 68111],
                [68152, 68154],
                [68159, 68159],
                [119143, 119145],
                [119155, 119170],
                [119173, 119179],
                [119210, 119213],
                [119362, 119364],
                [917505, 917505],
                [917536, 917631],
                [917760, 917999],
              ];
            let d;
            a.UnicodeV6 = class {
              constructor() {
                if (((this.version = '6'), !d)) {
                  ((d = new Uint8Array(65536)),
                  d.fill(1),
                  (d[0] = 0),
                  d.fill(0, 1, 32),
                  d.fill(0, 127, 160),
                  d.fill(2, 4352, 4448),
                  (d[9001] = 2),
                  (d[9002] = 2),
                  d.fill(2, 11904, 42192),
                  (d[12351] = 1),
                  d.fill(2, 44032, 55204),
                  d.fill(2, 63744, 64256),
                  d.fill(2, 65040, 65050),
                  d.fill(2, 65072, 65136),
                  d.fill(2, 65280, 65377),
                  d.fill(2, 65504, 65511));
                  for (let v = 0; v < g.length; ++v)
                    d.fill(0, g[v][0], g[v][1] + 1);
                }
              }
              wcwidth(v) {
                return v < 32
                  ? 0
                  : v < 127
                    ? 1
                    : v < 65536
                      ? d[v]
                      : (function (w, p) {
                        let c,
                          n = 0,
                          s = p.length - 1;
                        if (w < p[0][0] || w > p[s][1]) return !1;
                        for (; s >= n; )
                          if (((c = (n + s) >> 1), w > p[c][1])) n = c + 1;
                          else {
                            if (!(w < p[c][0])) return !0;
                            s = c - 1;
                          }
                        return !1;
                      })(v, u)
                        ? 0
                        : (v >= 131072 && v <= 196605) ||
                            (v >= 196608 && v <= 262141)
                          ? 2
                          : 1;
              }
              charProperties(v, w) {
                let p = this.wcwidth(v),
                  c = p === 0 && w !== 0;
                if (c) {
                  const n = f.UnicodeService.extractWidth(w);
                  n === 0 ? (c = !1) : n > p && (p = n);
                }
                return f.UnicodeService.createPropertyValue(0, p, c);
              }
            };
          },
          5981: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.WriteBuffer = void 0));
            const f = l(8460),
              g = l(844);
            class u extends g.Disposable {
              constructor(v) {
                (super(),
                (this._action = v),
                (this._writeBuffer = []),
                (this._callbacks = []),
                (this._pendingData = 0),
                (this._bufferOffset = 0),
                (this._isSyncWriting = !1),
                (this._syncCalls = 0),
                (this._didUserInput = !1),
                (this._onWriteParsed = this.register(new f.EventEmitter())),
                (this.onWriteParsed = this._onWriteParsed.event));
              }
              handleUserInput() {
                this._didUserInput = !0;
              }
              writeSync(v, w) {
                if (w !== void 0 && this._syncCalls > w)
                  return void (this._syncCalls = 0);
                if (
                  ((this._pendingData += v.length),
                  this._writeBuffer.push(v),
                  this._callbacks.push(void 0),
                  this._syncCalls++,
                  this._isSyncWriting)
                )
                  return;
                let p;
                for (
                  this._isSyncWriting = !0;
                  (p = this._writeBuffer.shift());

                ) {
                  this._action(p);
                  const c = this._callbacks.shift();
                  c && c();
                }
                ((this._pendingData = 0),
                (this._bufferOffset = 2147483647),
                (this._isSyncWriting = !1),
                (this._syncCalls = 0));
              }
              write(v, w) {
                if (this._pendingData > 5e7)
                  throw new Error(
                    'write data discarded, use flow control to avoid losing data'
                  );
                if (!this._writeBuffer.length) {
                  if (((this._bufferOffset = 0), this._didUserInput))
                    return (
                      (this._didUserInput = !1),
                      (this._pendingData += v.length),
                      this._writeBuffer.push(v),
                      this._callbacks.push(w),
                      void this._innerWrite()
                    );
                  setTimeout(() => this._innerWrite());
                }
                ((this._pendingData += v.length),
                this._writeBuffer.push(v),
                this._callbacks.push(w));
              }
              _innerWrite(v = 0, w = !0) {
                const p = v || Date.now();
                for (; this._writeBuffer.length > this._bufferOffset; ) {
                  const c = this._writeBuffer[this._bufferOffset],
                    n = this._action(c, w);
                  if (n) {
                    const o = (_) =>
                      Date.now() - p >= 12
                        ? setTimeout(() => this._innerWrite(0, _))
                        : this._innerWrite(p, _);
                    return void n
                      .catch(
                        (_) => (
                          queueMicrotask(() => {
                            throw _;
                          }),
                          Promise.resolve(!1)
                        )
                      )
                      .then(o);
                  }
                  const s = this._callbacks[this._bufferOffset];
                  if (
                    (s && s(),
                    this._bufferOffset++,
                    (this._pendingData -= c.length),
                    Date.now() - p >= 12)
                  )
                    break;
                }
                (this._writeBuffer.length > this._bufferOffset
                  ? (this._bufferOffset > 50 &&
                      ((this._writeBuffer = this._writeBuffer.slice(
                        this._bufferOffset
                      )),
                      (this._callbacks = this._callbacks.slice(
                        this._bufferOffset
                      )),
                      (this._bufferOffset = 0)),
                  setTimeout(() => this._innerWrite()))
                  : ((this._writeBuffer.length = 0),
                  (this._callbacks.length = 0),
                  (this._pendingData = 0),
                  (this._bufferOffset = 0)),
                this._onWriteParsed.fire());
              }
            }
            a.WriteBuffer = u;
          },
          5941: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.toRgbString = a.parseColor = void 0));
            const l =
                /^([\da-f])\/([\da-f])\/([\da-f])$|^([\da-f]{2})\/([\da-f]{2})\/([\da-f]{2})$|^([\da-f]{3})\/([\da-f]{3})\/([\da-f]{3})$|^([\da-f]{4})\/([\da-f]{4})\/([\da-f]{4})$/,
              f = /^[\da-f]+$/;
            function g(u, d) {
              const v = u.toString(16),
                w = v.length < 2 ? '0' + v : v;
              switch (d) {
              case 4:
                return v[0];
              case 8:
                return w;
              case 12:
                return (w + w).slice(0, 3);
              default:
                return w + w;
              }
            }
            ((a.parseColor = function (u) {
              if (!u) return;
              let d = u.toLowerCase();
              if (d.indexOf('rgb:') === 0) {
                d = d.slice(4);
                const v = l.exec(d);
                if (v) {
                  const w = v[1] ? 15 : v[4] ? 255 : v[7] ? 4095 : 65535;
                  return [
                    Math.round(
                      (parseInt(v[1] || v[4] || v[7] || v[10], 16) / w) * 255
                    ),
                    Math.round(
                      (parseInt(v[2] || v[5] || v[8] || v[11], 16) / w) * 255
                    ),
                    Math.round(
                      (parseInt(v[3] || v[6] || v[9] || v[12], 16) / w) * 255
                    ),
                  ];
                }
              } else if (
                d.indexOf('#') === 0 &&
                ((d = d.slice(1)),
                f.exec(d) && [3, 6, 9, 12].includes(d.length))
              ) {
                const v = d.length / 3,
                  w = [0, 0, 0];
                for (let p = 0; p < 3; ++p) {
                  const c = parseInt(d.slice(v * p, v * p + v), 16);
                  w[p] =
                    v === 1 ? c << 4 : v === 2 ? c : v === 3 ? c >> 4 : c >> 8;
                }
                return w;
              }
            }),
            (a.toRgbString = function (u, d = 16) {
              const [v, w, p] = u;
              return `rgb:${g(v, d)}/${g(w, d)}/${g(p, d)}`;
            }));
          },
          5770: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.PAYLOAD_LIMIT = void 0),
            (a.PAYLOAD_LIMIT = 1e7));
          },
          6351: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.DcsHandler = a.DcsParser = void 0));
            const f = l(482),
              g = l(8742),
              u = l(5770),
              d = [];
            a.DcsParser = class {
              constructor() {
                ((this._handlers = Object.create(null)),
                (this._active = d),
                (this._ident = 0),
                (this._handlerFb = () => {}),
                (this._stack = {
                  paused: !1,
                  loopPosition: 0,
                  fallThrough: !1,
                }));
              }
              dispose() {
                ((this._handlers = Object.create(null)),
                (this._handlerFb = () => {}),
                (this._active = d));
              }
              registerHandler(w, p) {
                this._handlers[w] === void 0 && (this._handlers[w] = []);
                const c = this._handlers[w];
                return (
                  c.push(p),
                  {
                    dispose: () => {
                      const n = c.indexOf(p);
                      n !== -1 && c.splice(n, 1);
                    },
                  }
                );
              }
              clearHandler(w) {
                this._handlers[w] && delete this._handlers[w];
              }
              setHandlerFallback(w) {
                this._handlerFb = w;
              }
              reset() {
                if (this._active.length)
                  for (
                    let w = this._stack.paused
                      ? this._stack.loopPosition - 1
                      : this._active.length - 1;
                    w >= 0;
                    --w
                  )
                    this._active[w].unhook(!1);
                ((this._stack.paused = !1),
                (this._active = d),
                (this._ident = 0));
              }
              hook(w, p) {
                if (
                  (this.reset(),
                  (this._ident = w),
                  (this._active = this._handlers[w] || d),
                  this._active.length)
                )
                  for (let c = this._active.length - 1; c >= 0; c--)
                    this._active[c].hook(p);
                else this._handlerFb(this._ident, 'HOOK', p);
              }
              put(w, p, c) {
                if (this._active.length)
                  for (let n = this._active.length - 1; n >= 0; n--)
                    this._active[n].put(w, p, c);
                else
                  this._handlerFb(
                    this._ident,
                    'PUT',
                    (0, f.utf32ToString)(w, p, c)
                  );
              }
              unhook(w, p = !0) {
                if (this._active.length) {
                  let c = !1,
                    n = this._active.length - 1,
                    s = !1;
                  if (
                    (this._stack.paused &&
                      ((n = this._stack.loopPosition - 1),
                      (c = p),
                      (s = this._stack.fallThrough),
                      (this._stack.paused = !1)),
                    !s && c === !1)
                  ) {
                    for (
                      ;
                      n >= 0 && ((c = this._active[n].unhook(w)), c !== !0);
                      n--
                    )
                      if (c instanceof Promise)
                        return (
                          (this._stack.paused = !0),
                          (this._stack.loopPosition = n),
                          (this._stack.fallThrough = !1),
                          c
                        );
                    n--;
                  }
                  for (; n >= 0; n--)
                    if (
                      ((c = this._active[n].unhook(!1)), c instanceof Promise)
                    )
                      return (
                        (this._stack.paused = !0),
                        (this._stack.loopPosition = n),
                        (this._stack.fallThrough = !0),
                        c
                      );
                } else this._handlerFb(this._ident, 'UNHOOK', w);
                ((this._active = d), (this._ident = 0));
              }
            };
            const v = new g.Params();
            (v.addParam(0),
            (a.DcsHandler = class {
              constructor(w) {
                ((this._handler = w),
                (this._data = ''),
                (this._params = v),
                (this._hitLimit = !1));
              }
              hook(w) {
                ((this._params = w.length > 1 || w.params[0] ? w.clone() : v),
                (this._data = ''),
                (this._hitLimit = !1));
              }
              put(w, p, c) {
                this._hitLimit ||
                    ((this._data += (0, f.utf32ToString)(w, p, c)),
                    this._data.length > u.PAYLOAD_LIMIT &&
                      ((this._data = ''), (this._hitLimit = !0)));
              }
              unhook(w) {
                let p = !1;
                if (this._hitLimit) p = !1;
                else if (
                  w &&
                    ((p = this._handler(this._data, this._params)),
                    p instanceof Promise)
                )
                  return p.then(
                    (c) => (
                      (this._params = v),
                      (this._data = ''),
                      (this._hitLimit = !1),
                      c
                    )
                  );
                return (
                  (this._params = v),
                  (this._data = ''),
                  (this._hitLimit = !1),
                  p
                );
              }
            }));
          },
          2015: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.EscapeSequenceParser =
                a.VT500_TRANSITION_TABLE =
                a.TransitionTable =
                  void 0));
            const f = l(844),
              g = l(8742),
              u = l(6242),
              d = l(6351);
            class v {
              constructor(n) {
                this.table = new Uint8Array(n);
              }
              setDefault(n, s) {
                this.table.fill((n << 4) | s);
              }
              add(n, s, o, _) {
                this.table[(s << 8) | n] = (o << 4) | _;
              }
              addMany(n, s, o, _) {
                for (let C = 0; C < n.length; C++)
                  this.table[(s << 8) | n[C]] = (o << 4) | _;
              }
            }
            a.TransitionTable = v;
            const w = 160;
            a.VT500_TRANSITION_TABLE = (function () {
              const c = new v(4095),
                n = Array.apply(null, Array(256)).map((x, S) => S),
                s = (x, S) => n.slice(x, S),
                o = s(32, 127),
                _ = s(0, 24);
              (_.push(25), _.push.apply(_, s(28, 32)));
              const C = s(0, 14);
              let b;
              for (b in (c.setDefault(1, 0), c.addMany(o, 0, 2, 0), C))
                (c.addMany([24, 26, 153, 154], b, 3, 0),
                c.addMany(s(128, 144), b, 3, 0),
                c.addMany(s(144, 152), b, 3, 0),
                c.add(156, b, 0, 0),
                c.add(27, b, 11, 1),
                c.add(157, b, 4, 8),
                c.addMany([152, 158, 159], b, 0, 7),
                c.add(155, b, 11, 3),
                c.add(144, b, 11, 9));
              return (
                c.addMany(_, 0, 3, 0),
                c.addMany(_, 1, 3, 1),
                c.add(127, 1, 0, 1),
                c.addMany(_, 8, 0, 8),
                c.addMany(_, 3, 3, 3),
                c.add(127, 3, 0, 3),
                c.addMany(_, 4, 3, 4),
                c.add(127, 4, 0, 4),
                c.addMany(_, 6, 3, 6),
                c.addMany(_, 5, 3, 5),
                c.add(127, 5, 0, 5),
                c.addMany(_, 2, 3, 2),
                c.add(127, 2, 0, 2),
                c.add(93, 1, 4, 8),
                c.addMany(o, 8, 5, 8),
                c.add(127, 8, 5, 8),
                c.addMany([156, 27, 24, 26, 7], 8, 6, 0),
                c.addMany(s(28, 32), 8, 0, 8),
                c.addMany([88, 94, 95], 1, 0, 7),
                c.addMany(o, 7, 0, 7),
                c.addMany(_, 7, 0, 7),
                c.add(156, 7, 0, 0),
                c.add(127, 7, 0, 7),
                c.add(91, 1, 11, 3),
                c.addMany(s(64, 127), 3, 7, 0),
                c.addMany(s(48, 60), 3, 8, 4),
                c.addMany([60, 61, 62, 63], 3, 9, 4),
                c.addMany(s(48, 60), 4, 8, 4),
                c.addMany(s(64, 127), 4, 7, 0),
                c.addMany([60, 61, 62, 63], 4, 0, 6),
                c.addMany(s(32, 64), 6, 0, 6),
                c.add(127, 6, 0, 6),
                c.addMany(s(64, 127), 6, 0, 0),
                c.addMany(s(32, 48), 3, 9, 5),
                c.addMany(s(32, 48), 5, 9, 5),
                c.addMany(s(48, 64), 5, 0, 6),
                c.addMany(s(64, 127), 5, 7, 0),
                c.addMany(s(32, 48), 4, 9, 5),
                c.addMany(s(32, 48), 1, 9, 2),
                c.addMany(s(32, 48), 2, 9, 2),
                c.addMany(s(48, 127), 2, 10, 0),
                c.addMany(s(48, 80), 1, 10, 0),
                c.addMany(s(81, 88), 1, 10, 0),
                c.addMany([89, 90, 92], 1, 10, 0),
                c.addMany(s(96, 127), 1, 10, 0),
                c.add(80, 1, 11, 9),
                c.addMany(_, 9, 0, 9),
                c.add(127, 9, 0, 9),
                c.addMany(s(28, 32), 9, 0, 9),
                c.addMany(s(32, 48), 9, 9, 12),
                c.addMany(s(48, 60), 9, 8, 10),
                c.addMany([60, 61, 62, 63], 9, 9, 10),
                c.addMany(_, 11, 0, 11),
                c.addMany(s(32, 128), 11, 0, 11),
                c.addMany(s(28, 32), 11, 0, 11),
                c.addMany(_, 10, 0, 10),
                c.add(127, 10, 0, 10),
                c.addMany(s(28, 32), 10, 0, 10),
                c.addMany(s(48, 60), 10, 8, 10),
                c.addMany([60, 61, 62, 63], 10, 0, 11),
                c.addMany(s(32, 48), 10, 9, 12),
                c.addMany(_, 12, 0, 12),
                c.add(127, 12, 0, 12),
                c.addMany(s(28, 32), 12, 0, 12),
                c.addMany(s(32, 48), 12, 9, 12),
                c.addMany(s(48, 64), 12, 0, 11),
                c.addMany(s(64, 127), 12, 12, 13),
                c.addMany(s(64, 127), 10, 12, 13),
                c.addMany(s(64, 127), 9, 12, 13),
                c.addMany(_, 13, 13, 13),
                c.addMany(o, 13, 13, 13),
                c.add(127, 13, 0, 13),
                c.addMany([27, 156, 24, 26], 13, 14, 0),
                c.add(w, 0, 2, 0),
                c.add(w, 8, 5, 8),
                c.add(w, 6, 0, 6),
                c.add(w, 11, 0, 11),
                c.add(w, 13, 13, 13),
                c
              );
            })();
            class p extends f.Disposable {
              constructor(n = a.VT500_TRANSITION_TABLE) {
                (super(),
                (this._transitions = n),
                (this._parseStack = {
                  state: 0,
                  handlers: [],
                  handlerPos: 0,
                  transition: 0,
                  chunkPos: 0,
                }),
                (this.initialState = 0),
                (this.currentState = this.initialState),
                (this._params = new g.Params()),
                this._params.addParam(0),
                (this._collect = 0),
                (this.precedingJoinState = 0),
                (this._printHandlerFb = (s, o, _) => {}),
                (this._executeHandlerFb = (s) => {}),
                (this._csiHandlerFb = (s, o) => {}),
                (this._escHandlerFb = (s) => {}),
                (this._errorHandlerFb = (s) => s),
                (this._printHandler = this._printHandlerFb),
                (this._executeHandlers = Object.create(null)),
                (this._csiHandlers = Object.create(null)),
                (this._escHandlers = Object.create(null)),
                this.register(
                  (0, f.toDisposable)(() => {
                    ((this._csiHandlers = Object.create(null)),
                    (this._executeHandlers = Object.create(null)),
                    (this._escHandlers = Object.create(null)));
                  })
                ),
                (this._oscParser = this.register(new u.OscParser())),
                (this._dcsParser = this.register(new d.DcsParser())),
                (this._errorHandler = this._errorHandlerFb),
                this.registerEscHandler({ final: '\\' }, () => !0));
              }
              _identifier(n, s = [64, 126]) {
                let o = 0;
                if (n.prefix) {
                  if (n.prefix.length > 1)
                    throw new Error('only one byte as prefix supported');
                  if (((o = n.prefix.charCodeAt(0)), (o && 60 > o) || o > 63))
                    throw new Error('prefix must be in range 0x3c .. 0x3f');
                }
                if (n.intermediates) {
                  if (n.intermediates.length > 2)
                    throw new Error(
                      'only two bytes as intermediates are supported'
                    );
                  for (let C = 0; C < n.intermediates.length; ++C) {
                    const b = n.intermediates.charCodeAt(C);
                    if (32 > b || b > 47)
                      throw new Error(
                        'intermediate must be in range 0x20 .. 0x2f'
                      );
                    ((o <<= 8), (o |= b));
                  }
                }
                if (n.final.length !== 1)
                  throw new Error('final must be a single byte');
                const _ = n.final.charCodeAt(0);
                if (s[0] > _ || _ > s[1])
                  throw new Error(`final must be in range ${s[0]} .. ${s[1]}`);
                return ((o <<= 8), (o |= _), o);
              }
              identToString(n) {
                const s = [];
                for (; n; ) (s.push(String.fromCharCode(255 & n)), (n >>= 8));
                return s.reverse().join('');
              }
              setPrintHandler(n) {
                this._printHandler = n;
              }
              clearPrintHandler() {
                this._printHandler = this._printHandlerFb;
              }
              registerEscHandler(n, s) {
                const o = this._identifier(n, [48, 126]);
                this._escHandlers[o] === void 0 && (this._escHandlers[o] = []);
                const _ = this._escHandlers[o];
                return (
                  _.push(s),
                  {
                    dispose: () => {
                      const C = _.indexOf(s);
                      C !== -1 && _.splice(C, 1);
                    },
                  }
                );
              }
              clearEscHandler(n) {
                this._escHandlers[this._identifier(n, [48, 126])] &&
                  delete this._escHandlers[this._identifier(n, [48, 126])];
              }
              setEscHandlerFallback(n) {
                this._escHandlerFb = n;
              }
              setExecuteHandler(n, s) {
                this._executeHandlers[n.charCodeAt(0)] = s;
              }
              clearExecuteHandler(n) {
                this._executeHandlers[n.charCodeAt(0)] &&
                  delete this._executeHandlers[n.charCodeAt(0)];
              }
              setExecuteHandlerFallback(n) {
                this._executeHandlerFb = n;
              }
              registerCsiHandler(n, s) {
                const o = this._identifier(n);
                this._csiHandlers[o] === void 0 && (this._csiHandlers[o] = []);
                const _ = this._csiHandlers[o];
                return (
                  _.push(s),
                  {
                    dispose: () => {
                      const C = _.indexOf(s);
                      C !== -1 && _.splice(C, 1);
                    },
                  }
                );
              }
              clearCsiHandler(n) {
                this._csiHandlers[this._identifier(n)] &&
                  delete this._csiHandlers[this._identifier(n)];
              }
              setCsiHandlerFallback(n) {
                this._csiHandlerFb = n;
              }
              registerDcsHandler(n, s) {
                return this._dcsParser.registerHandler(this._identifier(n), s);
              }
              clearDcsHandler(n) {
                this._dcsParser.clearHandler(this._identifier(n));
              }
              setDcsHandlerFallback(n) {
                this._dcsParser.setHandlerFallback(n);
              }
              registerOscHandler(n, s) {
                return this._oscParser.registerHandler(n, s);
              }
              clearOscHandler(n) {
                this._oscParser.clearHandler(n);
              }
              setOscHandlerFallback(n) {
                this._oscParser.setHandlerFallback(n);
              }
              setErrorHandler(n) {
                this._errorHandler = n;
              }
              clearErrorHandler() {
                this._errorHandler = this._errorHandlerFb;
              }
              reset() {
                ((this.currentState = this.initialState),
                this._oscParser.reset(),
                this._dcsParser.reset(),
                this._params.reset(),
                this._params.addParam(0),
                (this._collect = 0),
                (this.precedingJoinState = 0),
                this._parseStack.state !== 0 &&
                    ((this._parseStack.state = 2),
                    (this._parseStack.handlers = [])));
              }
              _preserveStack(n, s, o, _, C) {
                ((this._parseStack.state = n),
                (this._parseStack.handlers = s),
                (this._parseStack.handlerPos = o),
                (this._parseStack.transition = _),
                (this._parseStack.chunkPos = C));
              }
              parse(n, s, o) {
                let _,
                  C = 0,
                  b = 0,
                  x = 0;
                if (this._parseStack.state)
                  if (this._parseStack.state === 2)
                    ((this._parseStack.state = 0),
                    (x = this._parseStack.chunkPos + 1));
                  else {
                    if (o === void 0 || this._parseStack.state === 1)
                      throw (
                        (this._parseStack.state = 1),
                        new Error(
                          'improper continuation due to previous async handler, giving up parsing'
                        )
                      );
                    const S = this._parseStack.handlers;
                    let k = this._parseStack.handlerPos - 1;
                    switch (this._parseStack.state) {
                    case 3:
                      if (o === !1 && k > -1) {
                        for (
                          ;
                          k >= 0 && ((_ = S[k](this._params)), _ !== !0);
                          k--
                        )
                          if (_ instanceof Promise)
                            return ((this._parseStack.handlerPos = k), _);
                      }
                      this._parseStack.handlers = [];
                      break;
                    case 4:
                      if (o === !1 && k > -1) {
                        for (; k >= 0 && ((_ = S[k]()), _ !== !0); k--)
                          if (_ instanceof Promise)
                            return ((this._parseStack.handlerPos = k), _);
                      }
                      this._parseStack.handlers = [];
                      break;
                    case 6:
                      if (
                        ((C = n[this._parseStack.chunkPos]),
                        (_ = this._dcsParser.unhook(C !== 24 && C !== 26, o)),
                        _)
                      )
                        return _;
                      (C === 27 && (this._parseStack.transition |= 1),
                      this._params.reset(),
                      this._params.addParam(0),
                      (this._collect = 0));
                      break;
                    case 5:
                      if (
                        ((C = n[this._parseStack.chunkPos]),
                        (_ = this._oscParser.end(C !== 24 && C !== 26, o)),
                        _)
                      )
                        return _;
                      (C === 27 && (this._parseStack.transition |= 1),
                      this._params.reset(),
                      this._params.addParam(0),
                      (this._collect = 0));
                    }
                    ((this._parseStack.state = 0),
                    (x = this._parseStack.chunkPos + 1),
                    (this.precedingJoinState = 0),
                    (this.currentState = 15 & this._parseStack.transition));
                  }
                for (let S = x; S < s; ++S) {
                  switch (
                    ((C = n[S]),
                    (b =
                      this._transitions.table[
                        (this.currentState << 8) | (C < 160 ? C : w)
                      ]),
                    b >> 4)
                  ) {
                  case 2:
                    for (let A = S + 1; ; ++A) {
                      if (A >= s || (C = n[A]) < 32 || (C > 126 && C < w)) {
                        (this._printHandler(n, S, A), (S = A - 1));
                        break;
                      }
                      if (++A >= s || (C = n[A]) < 32 || (C > 126 && C < w)) {
                        (this._printHandler(n, S, A), (S = A - 1));
                        break;
                      }
                      if (++A >= s || (C = n[A]) < 32 || (C > 126 && C < w)) {
                        (this._printHandler(n, S, A), (S = A - 1));
                        break;
                      }
                      if (++A >= s || (C = n[A]) < 32 || (C > 126 && C < w)) {
                        (this._printHandler(n, S, A), (S = A - 1));
                        break;
                      }
                    }
                    break;
                  case 3:
                    (this._executeHandlers[C]
                      ? this._executeHandlers[C]()
                      : this._executeHandlerFb(C),
                    (this.precedingJoinState = 0));
                    break;
                  case 0:
                    break;
                  case 1:
                    if (
                      this._errorHandler({
                        position: S,
                        code: C,
                        currentState: this.currentState,
                        collect: this._collect,
                        params: this._params,
                        abort: !1,
                      }).abort
                    )
                      return;
                    break;
                  case 7:
                    const k = this._csiHandlers[(this._collect << 8) | C];
                    let T = k ? k.length - 1 : -1;
                    for (
                      ;
                      T >= 0 && ((_ = k[T](this._params)), _ !== !0);
                      T--
                    )
                      if (_ instanceof Promise)
                        return (this._preserveStack(3, k, T, b, S), _);
                    (T < 0 &&
                        this._csiHandlerFb(
                          (this._collect << 8) | C,
                          this._params
                        ),
                    (this.precedingJoinState = 0));
                    break;
                  case 8:
                    do
                      switch (C) {
                      case 59:
                        this._params.addParam(0);
                        break;
                      case 58:
                        this._params.addSubParam(-1);
                        break;
                      default:
                        this._params.addDigit(C - 48);
                      }
                    while (++S < s && (C = n[S]) > 47 && C < 60);
                    S--;
                    break;
                  case 9:
                    ((this._collect <<= 8), (this._collect |= C));
                    break;
                  case 10:
                    const B = this._escHandlers[(this._collect << 8) | C];
                    let O = B ? B.length - 1 : -1;
                    for (; O >= 0 && ((_ = B[O]()), _ !== !0); O--)
                      if (_ instanceof Promise)
                        return (this._preserveStack(4, B, O, b, S), _);
                    (O < 0 && this._escHandlerFb((this._collect << 8) | C),
                    (this.precedingJoinState = 0));
                    break;
                  case 11:
                    (this._params.reset(),
                    this._params.addParam(0),
                    (this._collect = 0));
                    break;
                  case 12:
                    this._dcsParser.hook(
                      (this._collect << 8) | C,
                      this._params
                    );
                    break;
                  case 13:
                    for (let A = S + 1; ; ++A)
                      if (
                        A >= s ||
                          (C = n[A]) === 24 ||
                          C === 26 ||
                          C === 27 ||
                          (C > 127 && C < w)
                      ) {
                        (this._dcsParser.put(n, S, A), (S = A - 1));
                        break;
                      }
                    break;
                  case 14:
                    if (
                      ((_ = this._dcsParser.unhook(C !== 24 && C !== 26)), _)
                    )
                      return (this._preserveStack(6, [], 0, b, S), _);
                    (C === 27 && (b |= 1),
                    this._params.reset(),
                    this._params.addParam(0),
                    (this._collect = 0),
                    (this.precedingJoinState = 0));
                    break;
                  case 4:
                    this._oscParser.start();
                    break;
                  case 5:
                    for (let A = S + 1; ; A++)
                      if (A >= s || (C = n[A]) < 32 || (C > 127 && C < w)) {
                        (this._oscParser.put(n, S, A), (S = A - 1));
                        break;
                      }
                    break;
                  case 6:
                    if (((_ = this._oscParser.end(C !== 24 && C !== 26)), _))
                      return (this._preserveStack(5, [], 0, b, S), _);
                    (C === 27 && (b |= 1),
                    this._params.reset(),
                    this._params.addParam(0),
                    (this._collect = 0),
                    (this.precedingJoinState = 0));
                  }
                  this.currentState = 15 & b;
                }
              }
            }
            a.EscapeSequenceParser = p;
          },
          6242: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.OscHandler = a.OscParser = void 0));
            const f = l(5770),
              g = l(482),
              u = [];
            ((a.OscParser = class {
              constructor() {
                ((this._state = 0),
                (this._active = u),
                (this._id = -1),
                (this._handlers = Object.create(null)),
                (this._handlerFb = () => {}),
                (this._stack = {
                  paused: !1,
                  loopPosition: 0,
                  fallThrough: !1,
                }));
              }
              registerHandler(d, v) {
                this._handlers[d] === void 0 && (this._handlers[d] = []);
                const w = this._handlers[d];
                return (
                  w.push(v),
                  {
                    dispose: () => {
                      const p = w.indexOf(v);
                      p !== -1 && w.splice(p, 1);
                    },
                  }
                );
              }
              clearHandler(d) {
                this._handlers[d] && delete this._handlers[d];
              }
              setHandlerFallback(d) {
                this._handlerFb = d;
              }
              dispose() {
                ((this._handlers = Object.create(null)),
                (this._handlerFb = () => {}),
                (this._active = u));
              }
              reset() {
                if (this._state === 2)
                  for (
                    let d = this._stack.paused
                      ? this._stack.loopPosition - 1
                      : this._active.length - 1;
                    d >= 0;
                    --d
                  )
                    this._active[d].end(!1);
                ((this._stack.paused = !1),
                (this._active = u),
                (this._id = -1),
                (this._state = 0));
              }
              _start() {
                if (
                  ((this._active = this._handlers[this._id] || u),
                  this._active.length)
                )
                  for (let d = this._active.length - 1; d >= 0; d--)
                    this._active[d].start();
                else this._handlerFb(this._id, 'START');
              }
              _put(d, v, w) {
                if (this._active.length)
                  for (let p = this._active.length - 1; p >= 0; p--)
                    this._active[p].put(d, v, w);
                else
                  this._handlerFb(
                    this._id,
                    'PUT',
                    (0, g.utf32ToString)(d, v, w)
                  );
              }
              start() {
                (this.reset(), (this._state = 1));
              }
              put(d, v, w) {
                if (this._state !== 3) {
                  if (this._state === 1)
                    for (; v < w; ) {
                      const p = d[v++];
                      if (p === 59) {
                        ((this._state = 2), this._start());
                        break;
                      }
                      if (p < 48 || 57 < p) return void (this._state = 3);
                      (this._id === -1 && (this._id = 0),
                      (this._id = 10 * this._id + p - 48));
                    }
                  this._state === 2 && w - v > 0 && this._put(d, v, w);
                }
              }
              end(d, v = !0) {
                if (this._state !== 0) {
                  if (this._state !== 3)
                    if (
                      (this._state === 1 && this._start(), this._active.length)
                    ) {
                      let w = !1,
                        p = this._active.length - 1,
                        c = !1;
                      if (
                        (this._stack.paused &&
                          ((p = this._stack.loopPosition - 1),
                          (w = v),
                          (c = this._stack.fallThrough),
                          (this._stack.paused = !1)),
                        !c && w === !1)
                      ) {
                        for (
                          ;
                          p >= 0 && ((w = this._active[p].end(d)), w !== !0);
                          p--
                        )
                          if (w instanceof Promise)
                            return (
                              (this._stack.paused = !0),
                              (this._stack.loopPosition = p),
                              (this._stack.fallThrough = !1),
                              w
                            );
                        p--;
                      }
                      for (; p >= 0; p--)
                        if (
                          ((w = this._active[p].end(!1)), w instanceof Promise)
                        )
                          return (
                            (this._stack.paused = !0),
                            (this._stack.loopPosition = p),
                            (this._stack.fallThrough = !0),
                            w
                          );
                    } else this._handlerFb(this._id, 'END', d);
                  ((this._active = u), (this._id = -1), (this._state = 0));
                }
              }
            }),
            (a.OscHandler = class {
              constructor(d) {
                ((this._handler = d),
                (this._data = ''),
                (this._hitLimit = !1));
              }
              start() {
                ((this._data = ''), (this._hitLimit = !1));
              }
              put(d, v, w) {
                this._hitLimit ||
                    ((this._data += (0, g.utf32ToString)(d, v, w)),
                    this._data.length > f.PAYLOAD_LIMIT &&
                      ((this._data = ''), (this._hitLimit = !0)));
              }
              end(d) {
                let v = !1;
                if (this._hitLimit) v = !1;
                else if (
                  d &&
                    ((v = this._handler(this._data)), v instanceof Promise)
                )
                  return v.then(
                    (w) => ((this._data = ''), (this._hitLimit = !1), w)
                  );
                return ((this._data = ''), (this._hitLimit = !1), v);
              }
            }));
          },
          8742: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.Params = void 0));
            const l = 2147483647;
            class f {
              static fromArray(u) {
                const d = new f();
                if (!u.length) return d;
                for (let v = Array.isArray(u[0]) ? 1 : 0; v < u.length; ++v) {
                  const w = u[v];
                  if (Array.isArray(w))
                    for (let p = 0; p < w.length; ++p) d.addSubParam(w[p]);
                  else d.addParam(w);
                }
                return d;
              }
              constructor(u = 32, d = 32) {
                if (
                  ((this.maxLength = u), (this.maxSubParamsLength = d), d > 256)
                )
                  throw new Error(
                    'maxSubParamsLength must not be greater than 256'
                  );
                ((this.params = new Int32Array(u)),
                (this.length = 0),
                (this._subParams = new Int32Array(d)),
                (this._subParamsLength = 0),
                (this._subParamsIdx = new Uint16Array(u)),
                (this._rejectDigits = !1),
                (this._rejectSubDigits = !1),
                (this._digitIsSub = !1));
              }
              clone() {
                const u = new f(this.maxLength, this.maxSubParamsLength);
                return (
                  u.params.set(this.params),
                  (u.length = this.length),
                  u._subParams.set(this._subParams),
                  (u._subParamsLength = this._subParamsLength),
                  u._subParamsIdx.set(this._subParamsIdx),
                  (u._rejectDigits = this._rejectDigits),
                  (u._rejectSubDigits = this._rejectSubDigits),
                  (u._digitIsSub = this._digitIsSub),
                  u
                );
              }
              toArray() {
                const u = [];
                for (let d = 0; d < this.length; ++d) {
                  u.push(this.params[d]);
                  const v = this._subParamsIdx[d] >> 8,
                    w = 255 & this._subParamsIdx[d];
                  w - v > 0 &&
                    u.push(Array.prototype.slice.call(this._subParams, v, w));
                }
                return u;
              }
              reset() {
                ((this.length = 0),
                (this._subParamsLength = 0),
                (this._rejectDigits = !1),
                (this._rejectSubDigits = !1),
                (this._digitIsSub = !1));
              }
              addParam(u) {
                if (((this._digitIsSub = !1), this.length >= this.maxLength))
                  this._rejectDigits = !0;
                else {
                  if (u < -1)
                    throw new Error('values lesser than -1 are not allowed');
                  ((this._subParamsIdx[this.length] =
                    (this._subParamsLength << 8) | this._subParamsLength),
                  (this.params[this.length++] = u > l ? l : u));
                }
              }
              addSubParam(u) {
                if (((this._digitIsSub = !0), this.length))
                  if (
                    this._rejectDigits ||
                    this._subParamsLength >= this.maxSubParamsLength
                  )
                    this._rejectSubDigits = !0;
                  else {
                    if (u < -1)
                      throw new Error('values lesser than -1 are not allowed');
                    ((this._subParams[this._subParamsLength++] = u > l ? l : u),
                    this._subParamsIdx[this.length - 1]++);
                  }
              }
              hasSubParams(u) {
                return (
                  (255 & this._subParamsIdx[u]) - (this._subParamsIdx[u] >> 8) >
                  0
                );
              }
              getSubParams(u) {
                const d = this._subParamsIdx[u] >> 8,
                  v = 255 & this._subParamsIdx[u];
                return v - d > 0 ? this._subParams.subarray(d, v) : null;
              }
              getSubParamsAll() {
                const u = {};
                for (let d = 0; d < this.length; ++d) {
                  const v = this._subParamsIdx[d] >> 8,
                    w = 255 & this._subParamsIdx[d];
                  w - v > 0 && (u[d] = this._subParams.slice(v, w));
                }
                return u;
              }
              addDigit(u) {
                let d;
                if (
                  this._rejectDigits ||
                  !(d = this._digitIsSub
                    ? this._subParamsLength
                    : this.length) ||
                  (this._digitIsSub && this._rejectSubDigits)
                )
                  return;
                const v = this._digitIsSub ? this._subParams : this.params,
                  w = v[d - 1];
                v[d - 1] = ~w ? Math.min(10 * w + u, l) : u;
              }
            }
            a.Params = f;
          },
          5741: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.AddonManager = void 0),
            (a.AddonManager = class {
              constructor() {
                this._addons = [];
              }
              dispose() {
                for (let l = this._addons.length - 1; l >= 0; l--)
                  this._addons[l].instance.dispose();
              }
              loadAddon(l, f) {
                const g = { instance: f, dispose: f.dispose, isDisposed: !1 };
                (this._addons.push(g),
                (f.dispose = () => this._wrappedAddonDispose(g)),
                f.activate(l));
              }
              _wrappedAddonDispose(l) {
                if (l.isDisposed) return;
                let f = -1;
                for (let g = 0; g < this._addons.length; g++)
                  if (this._addons[g] === l) {
                    f = g;
                    break;
                  }
                if (f === -1)
                  throw new Error(
                    'Could not dispose an addon that has not been loaded'
                  );
                ((l.isDisposed = !0),
                l.dispose.apply(l.instance),
                this._addons.splice(f, 1));
              }
            }));
          },
          8771: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.BufferApiView = void 0));
            const f = l(3785),
              g = l(511);
            a.BufferApiView = class {
              constructor(u, d) {
                ((this._buffer = u), (this.type = d));
              }
              init(u) {
                return ((this._buffer = u), this);
              }
              get cursorY() {
                return this._buffer.y;
              }
              get cursorX() {
                return this._buffer.x;
              }
              get viewportY() {
                return this._buffer.ydisp;
              }
              get baseY() {
                return this._buffer.ybase;
              }
              get length() {
                return this._buffer.lines.length;
              }
              getLine(u) {
                const d = this._buffer.lines.get(u);
                if (d) return new f.BufferLineApiView(d);
              }
              getNullCell() {
                return new g.CellData();
              }
            };
          },
          3785: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.BufferLineApiView = void 0));
            const f = l(511);
            a.BufferLineApiView = class {
              constructor(g) {
                this._line = g;
              }
              get isWrapped() {
                return this._line.isWrapped;
              }
              get length() {
                return this._line.length;
              }
              getCell(g, u) {
                if (!(g < 0 || g >= this._line.length))
                  return u
                    ? (this._line.loadCell(g, u), u)
                    : this._line.loadCell(g, new f.CellData());
              }
              translateToString(g, u, d) {
                return this._line.translateToString(g, u, d);
              }
            };
          },
          8285: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.BufferNamespaceApi = void 0));
            const f = l(8771),
              g = l(8460),
              u = l(844);
            class d extends u.Disposable {
              constructor(w) {
                (super(),
                (this._core = w),
                (this._onBufferChange = this.register(new g.EventEmitter())),
                (this.onBufferChange = this._onBufferChange.event),
                (this._normal = new f.BufferApiView(
                  this._core.buffers.normal,
                  'normal'
                )),
                (this._alternate = new f.BufferApiView(
                  this._core.buffers.alt,
                  'alternate'
                )),
                this._core.buffers.onBufferActivate(() =>
                  this._onBufferChange.fire(this.active)
                ));
              }
              get active() {
                if (this._core.buffers.active === this._core.buffers.normal)
                  return this.normal;
                if (this._core.buffers.active === this._core.buffers.alt)
                  return this.alternate;
                throw new Error(
                  'Active buffer is neither normal nor alternate'
                );
              }
              get normal() {
                return this._normal.init(this._core.buffers.normal);
              }
              get alternate() {
                return this._alternate.init(this._core.buffers.alt);
              }
            }
            a.BufferNamespaceApi = d;
          },
          7975: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.ParserApi = void 0),
            (a.ParserApi = class {
              constructor(l) {
                this._core = l;
              }
              registerCsiHandler(l, f) {
                return this._core.registerCsiHandler(l, (g) =>
                  f(g.toArray())
                );
              }
              addCsiHandler(l, f) {
                return this.registerCsiHandler(l, f);
              }
              registerDcsHandler(l, f) {
                return this._core.registerDcsHandler(l, (g, u) =>
                  f(g, u.toArray())
                );
              }
              addDcsHandler(l, f) {
                return this.registerDcsHandler(l, f);
              }
              registerEscHandler(l, f) {
                return this._core.registerEscHandler(l, f);
              }
              addEscHandler(l, f) {
                return this.registerEscHandler(l, f);
              }
              registerOscHandler(l, f) {
                return this._core.registerOscHandler(l, f);
              }
              addOscHandler(l, f) {
                return this.registerOscHandler(l, f);
              }
            }));
          },
          7090: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.UnicodeApi = void 0),
            (a.UnicodeApi = class {
              constructor(l) {
                this._core = l;
              }
              register(l) {
                this._core.unicodeService.register(l);
              }
              get versions() {
                return this._core.unicodeService.versions;
              }
              get activeVersion() {
                return this._core.unicodeService.activeVersion;
              }
              set activeVersion(l) {
                this._core.unicodeService.activeVersion = l;
              }
            }));
          },
          744: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (c, n, s, o) {
                  var _,
                    C = arguments.length,
                    b =
                      C < 3
                        ? n
                        : o === null
                          ? (o = Object.getOwnPropertyDescriptor(n, s))
                          : o;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    b = Reflect.decorate(c, n, s, o);
                  else
                    for (var x = c.length - 1; x >= 0; x--)
                      (_ = c[x]) &&
                        (b =
                          (C < 3 ? _(b) : C > 3 ? _(n, s, b) : _(n, s)) || b);
                  return (C > 3 && b && Object.defineProperty(n, s, b), b);
                },
              g =
                (this && this.__param) ||
                function (c, n) {
                  return function (s, o) {
                    n(s, o, c);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.BufferService = a.MINIMUM_ROWS = a.MINIMUM_COLS = void 0));
            const u = l(8460),
              d = l(844),
              v = l(5295),
              w = l(2585);
            ((a.MINIMUM_COLS = 2), (a.MINIMUM_ROWS = 1));
            let p = (a.BufferService = class extends d.Disposable {
              get buffer() {
                return this.buffers.active;
              }
              constructor(c) {
                (super(),
                (this.isUserScrolling = !1),
                (this._onResize = this.register(new u.EventEmitter())),
                (this.onResize = this._onResize.event),
                (this._onScroll = this.register(new u.EventEmitter())),
                (this.onScroll = this._onScroll.event),
                (this.cols = Math.max(
                  c.rawOptions.cols || 0,
                  a.MINIMUM_COLS
                )),
                (this.rows = Math.max(
                  c.rawOptions.rows || 0,
                  a.MINIMUM_ROWS
                )),
                (this.buffers = this.register(new v.BufferSet(c, this))));
              }
              resize(c, n) {
                ((this.cols = c),
                (this.rows = n),
                this.buffers.resize(c, n),
                this._onResize.fire({ cols: c, rows: n }));
              }
              reset() {
                (this.buffers.reset(), (this.isUserScrolling = !1));
              }
              scroll(c, n = !1) {
                const s = this.buffer;
                let o;
                ((o = this._cachedBlankLine),
                (o &&
                    o.length === this.cols &&
                    o.getFg(0) === c.fg &&
                    o.getBg(0) === c.bg) ||
                    ((o = s.getBlankLine(c, n)), (this._cachedBlankLine = o)),
                (o.isWrapped = n));
                const _ = s.ybase + s.scrollTop,
                  C = s.ybase + s.scrollBottom;
                if (s.scrollTop === 0) {
                  const b = s.lines.isFull;
                  (C === s.lines.length - 1
                    ? b
                      ? s.lines.recycle().copyFrom(o)
                      : s.lines.push(o.clone())
                    : s.lines.splice(C + 1, 0, o.clone()),
                  b
                    ? this.isUserScrolling &&
                        (s.ydisp = Math.max(s.ydisp - 1, 0))
                    : (s.ybase++, this.isUserScrolling || s.ydisp++));
                } else {
                  const b = C - _ + 1;
                  (s.lines.shiftElements(_ + 1, b - 1, -1),
                  s.lines.set(C, o.clone()));
                }
                (this.isUserScrolling || (s.ydisp = s.ybase),
                this._onScroll.fire(s.ydisp));
              }
              scrollLines(c, n, s) {
                const o = this.buffer;
                if (c < 0) {
                  if (o.ydisp === 0) return;
                  this.isUserScrolling = !0;
                } else c + o.ydisp >= o.ybase && (this.isUserScrolling = !1);
                const _ = o.ydisp;
                ((o.ydisp = Math.max(Math.min(o.ydisp + c, o.ybase), 0)),
                _ !== o.ydisp && (n || this._onScroll.fire(o.ydisp)));
              }
            });
            a.BufferService = p = f([g(0, w.IOptionsService)], p);
          },
          7994: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.CharsetService = void 0),
            (a.CharsetService = class {
              constructor() {
                ((this.glevel = 0), (this._charsets = []));
              }
              reset() {
                ((this.charset = void 0),
                (this._charsets = []),
                (this.glevel = 0));
              }
              setgLevel(l) {
                ((this.glevel = l), (this.charset = this._charsets[l]));
              }
              setgCharset(l, f) {
                ((this._charsets[l] = f),
                this.glevel === l && (this.charset = f));
              }
            }));
          },
          1753: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (o, _, C, b) {
                  var x,
                    S = arguments.length,
                    k =
                      S < 3
                        ? _
                        : b === null
                          ? (b = Object.getOwnPropertyDescriptor(_, C))
                          : b;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    k = Reflect.decorate(o, _, C, b);
                  else
                    for (var T = o.length - 1; T >= 0; T--)
                      (x = o[T]) &&
                        (k =
                          (S < 3 ? x(k) : S > 3 ? x(_, C, k) : x(_, C)) || k);
                  return (S > 3 && k && Object.defineProperty(_, C, k), k);
                },
              g =
                (this && this.__param) ||
                function (o, _) {
                  return function (C, b) {
                    _(C, b, o);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.CoreMouseService = void 0));
            const u = l(2585),
              d = l(8460),
              v = l(844),
              w = {
                NONE: { events: 0, restrict: () => !1 },
                X10: {
                  events: 1,
                  restrict: (o) =>
                    o.button !== 4 &&
                    o.action === 1 &&
                    ((o.ctrl = !1), (o.alt = !1), (o.shift = !1), !0),
                },
                VT200: { events: 19, restrict: (o) => o.action !== 32 },
                DRAG: {
                  events: 23,
                  restrict: (o) => o.action !== 32 || o.button !== 3,
                },
                ANY: { events: 31, restrict: (o) => !0 },
              };
            function p(o, _) {
              let C = (o.ctrl ? 16 : 0) | (o.shift ? 4 : 0) | (o.alt ? 8 : 0);
              return (
                o.button === 4
                  ? ((C |= 64), (C |= o.action))
                  : ((C |= 3 & o.button),
                  4 & o.button && (C |= 64),
                  8 & o.button && (C |= 128),
                  o.action === 32
                    ? (C |= 32)
                    : o.action !== 0 || _ || (C |= 3)),
                C
              );
            }
            const c = String.fromCharCode,
              n = {
                DEFAULT: (o) => {
                  const _ = [p(o, !1) + 32, o.col + 32, o.row + 32];
                  return _[0] > 255 || _[1] > 255 || _[2] > 255
                    ? ''
                    : `\x1B[M${c(_[0])}${c(_[1])}${c(_[2])}`;
                },
                SGR: (o) => {
                  const _ = o.action === 0 && o.button !== 4 ? 'm' : 'M';
                  return `\x1B[<${p(o, !0)};${o.col};${o.row}${_}`;
                },
                SGR_PIXELS: (o) => {
                  const _ = o.action === 0 && o.button !== 4 ? 'm' : 'M';
                  return `\x1B[<${p(o, !0)};${o.x};${o.y}${_}`;
                },
              };
            let s = (a.CoreMouseService = class extends v.Disposable {
              constructor(o, _) {
                (super(),
                (this._bufferService = o),
                (this._coreService = _),
                (this._protocols = {}),
                (this._encodings = {}),
                (this._activeProtocol = ''),
                (this._activeEncoding = ''),
                (this._lastEvent = null),
                (this._onProtocolChange = this.register(
                  new d.EventEmitter()
                )),
                (this.onProtocolChange = this._onProtocolChange.event));
                for (const C of Object.keys(w)) this.addProtocol(C, w[C]);
                for (const C of Object.keys(n)) this.addEncoding(C, n[C]);
                this.reset();
              }
              addProtocol(o, _) {
                this._protocols[o] = _;
              }
              addEncoding(o, _) {
                this._encodings[o] = _;
              }
              get activeProtocol() {
                return this._activeProtocol;
              }
              get areMouseEventsActive() {
                return this._protocols[this._activeProtocol].events !== 0;
              }
              set activeProtocol(o) {
                if (!this._protocols[o])
                  throw new Error(`unknown protocol "${o}"`);
                ((this._activeProtocol = o),
                this._onProtocolChange.fire(this._protocols[o].events));
              }
              get activeEncoding() {
                return this._activeEncoding;
              }
              set activeEncoding(o) {
                if (!this._encodings[o])
                  throw new Error(`unknown encoding "${o}"`);
                this._activeEncoding = o;
              }
              reset() {
                ((this.activeProtocol = 'NONE'),
                (this.activeEncoding = 'DEFAULT'),
                (this._lastEvent = null));
              }
              triggerMouseEvent(o) {
                if (
                  o.col < 0 ||
                  o.col >= this._bufferService.cols ||
                  o.row < 0 ||
                  o.row >= this._bufferService.rows ||
                  (o.button === 4 && o.action === 32) ||
                  (o.button === 3 && o.action !== 32) ||
                  (o.button !== 4 && (o.action === 2 || o.action === 3)) ||
                  (o.col++,
                  o.row++,
                  o.action === 32 &&
                    this._lastEvent &&
                    this._equalEvents(
                      this._lastEvent,
                      o,
                      this._activeEncoding === 'SGR_PIXELS'
                    )) ||
                  !this._protocols[this._activeProtocol].restrict(o)
                )
                  return !1;
                const _ = this._encodings[this._activeEncoding](o);
                return (
                  _ &&
                    (this._activeEncoding === 'DEFAULT'
                      ? this._coreService.triggerBinaryEvent(_)
                      : this._coreService.triggerDataEvent(_, !0)),
                  (this._lastEvent = o),
                  !0
                );
              }
              explainEvents(o) {
                return {
                  down: !!(1 & o),
                  up: !!(2 & o),
                  drag: !!(4 & o),
                  move: !!(8 & o),
                  wheel: !!(16 & o),
                };
              }
              _equalEvents(o, _, C) {
                if (C) {
                  if (o.x !== _.x || o.y !== _.y) return !1;
                } else if (o.col !== _.col || o.row !== _.row) return !1;
                return (
                  o.button === _.button &&
                  o.action === _.action &&
                  o.ctrl === _.ctrl &&
                  o.alt === _.alt &&
                  o.shift === _.shift
                );
              }
            });
            a.CoreMouseService = s = f(
              [g(0, u.IBufferService), g(1, u.ICoreService)],
              s
            );
          },
          6975: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (s, o, _, C) {
                  var b,
                    x = arguments.length,
                    S =
                      x < 3
                        ? o
                        : C === null
                          ? (C = Object.getOwnPropertyDescriptor(o, _))
                          : C;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    S = Reflect.decorate(s, o, _, C);
                  else
                    for (var k = s.length - 1; k >= 0; k--)
                      (b = s[k]) &&
                        (S =
                          (x < 3 ? b(S) : x > 3 ? b(o, _, S) : b(o, _)) || S);
                  return (x > 3 && S && Object.defineProperty(o, _, S), S);
                },
              g =
                (this && this.__param) ||
                function (s, o) {
                  return function (_, C) {
                    o(_, C, s);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.CoreService = void 0));
            const u = l(1439),
              d = l(8460),
              v = l(844),
              w = l(2585),
              p = Object.freeze({ insertMode: !1 }),
              c = Object.freeze({
                applicationCursorKeys: !1,
                applicationKeypad: !1,
                bracketedPasteMode: !1,
                origin: !1,
                reverseWraparound: !1,
                sendFocus: !1,
                wraparound: !0,
              });
            let n = (a.CoreService = class extends v.Disposable {
              constructor(s, o, _) {
                (super(),
                (this._bufferService = s),
                (this._logService = o),
                (this._optionsService = _),
                (this.isCursorInitialized = !1),
                (this.isCursorHidden = !1),
                (this._onData = this.register(new d.EventEmitter())),
                (this.onData = this._onData.event),
                (this._onUserInput = this.register(new d.EventEmitter())),
                (this.onUserInput = this._onUserInput.event),
                (this._onBinary = this.register(new d.EventEmitter())),
                (this.onBinary = this._onBinary.event),
                (this._onRequestScrollToBottom = this.register(
                  new d.EventEmitter()
                )),
                (this.onRequestScrollToBottom =
                    this._onRequestScrollToBottom.event),
                (this.modes = (0, u.clone)(p)),
                (this.decPrivateModes = (0, u.clone)(c)));
              }
              reset() {
                ((this.modes = (0, u.clone)(p)),
                (this.decPrivateModes = (0, u.clone)(c)));
              }
              triggerDataEvent(s, o = !1) {
                if (this._optionsService.rawOptions.disableStdin) return;
                const _ = this._bufferService.buffer;
                (o &&
                  this._optionsService.rawOptions.scrollOnUserInput &&
                  _.ybase !== _.ydisp &&
                  this._onRequestScrollToBottom.fire(),
                o && this._onUserInput.fire(),
                this._logService.debug(`sending data "${s}"`, () =>
                  s.split('').map((C) => C.charCodeAt(0))
                ),
                this._onData.fire(s));
              }
              triggerBinaryEvent(s) {
                this._optionsService.rawOptions.disableStdin ||
                  (this._logService.debug(`sending binary "${s}"`, () =>
                    s.split('').map((o) => o.charCodeAt(0))
                  ),
                  this._onBinary.fire(s));
              }
            });
            a.CoreService = n = f(
              [
                g(0, w.IBufferService),
                g(1, w.ILogService),
                g(2, w.IOptionsService),
              ],
              n
            );
          },
          9074: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.DecorationService = void 0));
            const f = l(8055),
              g = l(8460),
              u = l(844),
              d = l(6106);
            let v = 0,
              w = 0;
            class p extends u.Disposable {
              get decorations() {
                return this._decorations.values();
              }
              constructor() {
                (super(),
                (this._decorations = new d.SortedList((s) =>
                  s == null ? void 0 : s.marker.line
                )),
                (this._onDecorationRegistered = this.register(
                  new g.EventEmitter()
                )),
                (this.onDecorationRegistered =
                    this._onDecorationRegistered.event),
                (this._onDecorationRemoved = this.register(
                  new g.EventEmitter()
                )),
                (this.onDecorationRemoved = this._onDecorationRemoved.event),
                this.register((0, u.toDisposable)(() => this.reset())));
              }
              registerDecoration(s) {
                if (s.marker.isDisposed) return;
                const o = new c(s);
                if (o) {
                  const _ = o.marker.onDispose(() => o.dispose());
                  (o.onDispose(() => {
                    o &&
                      (this._decorations.delete(o) &&
                        this._onDecorationRemoved.fire(o),
                      _.dispose());
                  }),
                  this._decorations.insert(o),
                  this._onDecorationRegistered.fire(o));
                }
                return o;
              }
              reset() {
                for (const s of this._decorations.values()) s.dispose();
                this._decorations.clear();
              }
              *getDecorationsAtCell(s, o, _) {
                let C = 0,
                  b = 0;
                for (const x of this._decorations.getKeyIterator(o))
                  ((C = x.options.x ?? 0),
                  (b = C + (x.options.width ?? 1)),
                  s >= C &&
                      s < b &&
                      (!_ || (x.options.layer ?? 'bottom') === _) &&
                      (yield x));
              }
              forEachDecorationAtCell(s, o, _, C) {
                this._decorations.forEachByKey(o, (b) => {
                  ((v = b.options.x ?? 0),
                  (w = v + (b.options.width ?? 1)),
                  s >= v &&
                      s < w &&
                      (!_ || (b.options.layer ?? 'bottom') === _) &&
                      C(b));
                });
              }
            }
            a.DecorationService = p;
            class c extends u.Disposable {
              get isDisposed() {
                return this._isDisposed;
              }
              get backgroundColorRGB() {
                return (
                  this._cachedBg === null &&
                    (this.options.backgroundColor
                      ? (this._cachedBg = f.css.toColor(
                        this.options.backgroundColor
                      ))
                      : (this._cachedBg = void 0)),
                  this._cachedBg
                );
              }
              get foregroundColorRGB() {
                return (
                  this._cachedFg === null &&
                    (this.options.foregroundColor
                      ? (this._cachedFg = f.css.toColor(
                        this.options.foregroundColor
                      ))
                      : (this._cachedFg = void 0)),
                  this._cachedFg
                );
              }
              constructor(s) {
                (super(),
                (this.options = s),
                (this.onRenderEmitter = this.register(new g.EventEmitter())),
                (this.onRender = this.onRenderEmitter.event),
                (this._onDispose = this.register(new g.EventEmitter())),
                (this.onDispose = this._onDispose.event),
                (this._cachedBg = null),
                (this._cachedFg = null),
                (this.marker = s.marker),
                this.options.overviewRulerOptions &&
                    !this.options.overviewRulerOptions.position &&
                    (this.options.overviewRulerOptions.position = 'full'));
              }
              dispose() {
                (this._onDispose.fire(), super.dispose());
              }
            }
          },
          4348: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.InstantiationService = a.ServiceCollection = void 0));
            const f = l(2585),
              g = l(8343);
            class u {
              constructor(...v) {
                this._entries = new Map();
                for (const [w, p] of v) this.set(w, p);
              }
              set(v, w) {
                const p = this._entries.get(v);
                return (this._entries.set(v, w), p);
              }
              forEach(v) {
                for (const [w, p] of this._entries.entries()) v(w, p);
              }
              has(v) {
                return this._entries.has(v);
              }
              get(v) {
                return this._entries.get(v);
              }
            }
            ((a.ServiceCollection = u),
            (a.InstantiationService = class {
              constructor() {
                ((this._services = new u()),
                this._services.set(f.IInstantiationService, this));
              }
              setService(d, v) {
                this._services.set(d, v);
              }
              getService(d) {
                return this._services.get(d);
              }
              createInstance(d, ...v) {
                const w = (0, g.getServiceDependencies)(d).sort(
                    (n, s) => n.index - s.index
                  ),
                  p = [];
                for (const n of w) {
                  const s = this._services.get(n.id);
                  if (!s)
                    throw new Error(
                      `[createInstance] ${d.name} depends on UNKNOWN service ${n.id}.`
                    );
                  p.push(s);
                }
                const c = w.length > 0 ? w[0].index : v.length;
                if (v.length !== c)
                  throw new Error(
                    `[createInstance] First service dependency of ${d.name} at position ${c + 1} conflicts with ${v.length} static arguments`
                  );
                return new d(...v, ...p);
              }
            }));
          },
          7866: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (c, n, s, o) {
                  var _,
                    C = arguments.length,
                    b =
                      C < 3
                        ? n
                        : o === null
                          ? (o = Object.getOwnPropertyDescriptor(n, s))
                          : o;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    b = Reflect.decorate(c, n, s, o);
                  else
                    for (var x = c.length - 1; x >= 0; x--)
                      (_ = c[x]) &&
                        (b =
                          (C < 3 ? _(b) : C > 3 ? _(n, s, b) : _(n, s)) || b);
                  return (C > 3 && b && Object.defineProperty(n, s, b), b);
                },
              g =
                (this && this.__param) ||
                function (c, n) {
                  return function (s, o) {
                    n(s, o, c);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.traceCall = a.setTraceLogger = a.LogService = void 0));
            const u = l(844),
              d = l(2585),
              v = {
                trace: d.LogLevelEnum.TRACE,
                debug: d.LogLevelEnum.DEBUG,
                info: d.LogLevelEnum.INFO,
                warn: d.LogLevelEnum.WARN,
                error: d.LogLevelEnum.ERROR,
                off: d.LogLevelEnum.OFF,
              };
            let w,
              p = (a.LogService = class extends u.Disposable {
                get logLevel() {
                  return this._logLevel;
                }
                constructor(c) {
                  (super(),
                  (this._optionsService = c),
                  (this._logLevel = d.LogLevelEnum.OFF),
                  this._updateLogLevel(),
                  this.register(
                    this._optionsService.onSpecificOptionChange(
                      'logLevel',
                      () => this._updateLogLevel()
                    )
                  ),
                  (w = this));
                }
                _updateLogLevel() {
                  this._logLevel = v[this._optionsService.rawOptions.logLevel];
                }
                _evalLazyOptionalParams(c) {
                  for (let n = 0; n < c.length; n++)
                    typeof c[n] == 'function' && (c[n] = c[n]());
                }
                _log(c, n, s) {
                  (this._evalLazyOptionalParams(s),
                  c.call(
                    console,
                    (this._optionsService.options.logger
                      ? ''
                      : 'xterm.js: ') + n,
                    ...s
                  ));
                }
                trace(c, ...n) {
                  var s;
                  this._logLevel <= d.LogLevelEnum.TRACE &&
                    this._log(
                      ((s = this._optionsService.options.logger) == null
                        ? void 0
                        : s.trace.bind(this._optionsService.options.logger)) ??
                        console.log,
                      c,
                      n
                    );
                }
                debug(c, ...n) {
                  var s;
                  this._logLevel <= d.LogLevelEnum.DEBUG &&
                    this._log(
                      ((s = this._optionsService.options.logger) == null
                        ? void 0
                        : s.debug.bind(this._optionsService.options.logger)) ??
                        console.log,
                      c,
                      n
                    );
                }
                info(c, ...n) {
                  var s;
                  this._logLevel <= d.LogLevelEnum.INFO &&
                    this._log(
                      ((s = this._optionsService.options.logger) == null
                        ? void 0
                        : s.info.bind(this._optionsService.options.logger)) ??
                        console.info,
                      c,
                      n
                    );
                }
                warn(c, ...n) {
                  var s;
                  this._logLevel <= d.LogLevelEnum.WARN &&
                    this._log(
                      ((s = this._optionsService.options.logger) == null
                        ? void 0
                        : s.warn.bind(this._optionsService.options.logger)) ??
                        console.warn,
                      c,
                      n
                    );
                }
                error(c, ...n) {
                  var s;
                  this._logLevel <= d.LogLevelEnum.ERROR &&
                    this._log(
                      ((s = this._optionsService.options.logger) == null
                        ? void 0
                        : s.error.bind(this._optionsService.options.logger)) ??
                        console.error,
                      c,
                      n
                    );
                }
              });
            ((a.LogService = p = f([g(0, d.IOptionsService)], p)),
            (a.setTraceLogger = function (c) {
              w = c;
            }),
            (a.traceCall = function (c, n, s) {
              if (typeof s.value != 'function')
                throw new Error('not supported');
              const o = s.value;
              s.value = function (..._) {
                if (w.logLevel !== d.LogLevelEnum.TRACE)
                  return o.apply(this, _);
                w.trace(
                  `GlyphRenderer#${o.name}(${_.map((b) => JSON.stringify(b)).join(', ')})`
                );
                const C = o.apply(this, _);
                return (w.trace(`GlyphRenderer#${o.name} return`, C), C);
              };
            }));
          },
          7302: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.OptionsService = a.DEFAULT_OPTIONS = void 0));
            const f = l(8460),
              g = l(844),
              u = l(6114);
            a.DEFAULT_OPTIONS = {
              cols: 80,
              rows: 24,
              cursorBlink: !1,
              cursorStyle: 'block',
              cursorWidth: 1,
              cursorInactiveStyle: 'outline',
              customGlyphs: !0,
              drawBoldTextInBrightColors: !0,
              documentOverride: null,
              fastScrollModifier: 'alt',
              fastScrollSensitivity: 5,
              fontFamily: 'courier-new, courier, monospace',
              fontSize: 15,
              fontWeight: 'normal',
              fontWeightBold: 'bold',
              ignoreBracketedPasteMode: !1,
              lineHeight: 1,
              letterSpacing: 0,
              linkHandler: null,
              logLevel: 'info',
              logger: null,
              scrollback: 1e3,
              scrollOnUserInput: !0,
              scrollSensitivity: 1,
              screenReaderMode: !1,
              smoothScrollDuration: 0,
              macOptionIsMeta: !1,
              macOptionClickForcesSelection: !1,
              minimumContrastRatio: 1,
              disableStdin: !1,
              allowProposedApi: !1,
              allowTransparency: !1,
              tabStopWidth: 8,
              theme: {},
              rescaleOverlappingGlyphs: !1,
              rightClickSelectsWord: u.isMac,
              windowOptions: {},
              windowsMode: !1,
              windowsPty: {},
              wordSeparator: ' ()[]{}\',"`',
              altClickMovesCursor: !0,
              convertEol: !1,
              termName: 'xterm',
              cancelEvents: !1,
              overviewRulerWidth: 0,
            };
            const d = [
              'normal',
              'bold',
              '100',
              '200',
              '300',
              '400',
              '500',
              '600',
              '700',
              '800',
              '900',
            ];
            class v extends g.Disposable {
              constructor(p) {
                (super(),
                (this._onOptionChange = this.register(new f.EventEmitter())),
                (this.onOptionChange = this._onOptionChange.event));
                const c = { ...a.DEFAULT_OPTIONS };
                for (const n in p)
                  if (n in c)
                    try {
                      const s = p[n];
                      c[n] = this._sanitizeAndValidateOption(n, s);
                    } catch (s) {
                      console.error(s);
                    }
                ((this.rawOptions = c),
                (this.options = { ...c }),
                this._setupOptions(),
                this.register(
                  (0, g.toDisposable)(() => {
                    ((this.rawOptions.linkHandler = null),
                    (this.rawOptions.documentOverride = null));
                  })
                ));
              }
              onSpecificOptionChange(p, c) {
                return this.onOptionChange((n) => {
                  n === p && c(this.rawOptions[p]);
                });
              }
              onMultipleOptionChange(p, c) {
                return this.onOptionChange((n) => {
                  p.indexOf(n) !== -1 && c();
                });
              }
              _setupOptions() {
                const p = (n) => {
                    if (!(n in a.DEFAULT_OPTIONS))
                      throw new Error(`No option with key "${n}"`);
                    return this.rawOptions[n];
                  },
                  c = (n, s) => {
                    if (!(n in a.DEFAULT_OPTIONS))
                      throw new Error(`No option with key "${n}"`);
                    ((s = this._sanitizeAndValidateOption(n, s)),
                    this.rawOptions[n] !== s &&
                        ((this.rawOptions[n] = s),
                        this._onOptionChange.fire(n)));
                  };
                for (const n in this.rawOptions) {
                  const s = { get: p.bind(this, n), set: c.bind(this, n) };
                  Object.defineProperty(this.options, n, s);
                }
              }
              _sanitizeAndValidateOption(p, c) {
                switch (p) {
                case 'cursorStyle':
                  if (
                    (c || (c = a.DEFAULT_OPTIONS[p]),
                    !(function (n) {
                      return (
                        n === 'block' || n === 'underline' || n === 'bar'
                      );
                    })(c))
                  )
                    throw new Error(`"${c}" is not a valid value for ${p}`);
                  break;
                case 'wordSeparator':
                  c || (c = a.DEFAULT_OPTIONS[p]);
                  break;
                case 'fontWeight':
                case 'fontWeightBold':
                  if (typeof c == 'number' && 1 <= c && c <= 1e3) break;
                  c = d.includes(c) ? c : a.DEFAULT_OPTIONS[p];
                  break;
                case 'cursorWidth':
                  c = Math.floor(c);
                case 'lineHeight':
                case 'tabStopWidth':
                  if (c < 1)
                    throw new Error(
                      `${p} cannot be less than 1, value: ${c}`
                    );
                  break;
                case 'minimumContrastRatio':
                  c = Math.max(1, Math.min(21, Math.round(10 * c) / 10));
                  break;
                case 'scrollback':
                  if ((c = Math.min(c, 4294967295)) < 0)
                    throw new Error(
                      `${p} cannot be less than 0, value: ${c}`
                    );
                  break;
                case 'fastScrollSensitivity':
                case 'scrollSensitivity':
                  if (c <= 0)
                    throw new Error(
                      `${p} cannot be less than or equal to 0, value: ${c}`
                    );
                  break;
                case 'rows':
                case 'cols':
                  if (!c && c !== 0)
                    throw new Error(`${p} must be numeric, value: ${c}`);
                  break;
                case 'windowsPty':
                  c = c ?? {};
                }
                return c;
              }
            }
            a.OptionsService = v;
          },
          2660: function (y, a, l) {
            var f =
                (this && this.__decorate) ||
                function (v, w, p, c) {
                  var n,
                    s = arguments.length,
                    o =
                      s < 3
                        ? w
                        : c === null
                          ? (c = Object.getOwnPropertyDescriptor(w, p))
                          : c;
                  if (
                    typeof Reflect == 'object' &&
                    typeof Reflect.decorate == 'function'
                  )
                    o = Reflect.decorate(v, w, p, c);
                  else
                    for (var _ = v.length - 1; _ >= 0; _--)
                      (n = v[_]) &&
                        (o =
                          (s < 3 ? n(o) : s > 3 ? n(w, p, o) : n(w, p)) || o);
                  return (s > 3 && o && Object.defineProperty(w, p, o), o);
                },
              g =
                (this && this.__param) ||
                function (v, w) {
                  return function (p, c) {
                    w(p, c, v);
                  };
                };
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.OscLinkService = void 0));
            const u = l(2585);
            let d = (a.OscLinkService = class {
              constructor(v) {
                ((this._bufferService = v),
                (this._nextId = 1),
                (this._entriesWithId = new Map()),
                (this._dataByLinkId = new Map()));
              }
              registerLink(v) {
                const w = this._bufferService.buffer;
                if (v.id === void 0) {
                  const _ = w.addMarker(w.ybase + w.y),
                    C = { data: v, id: this._nextId++, lines: [_] };
                  return (
                    _.onDispose(() => this._removeMarkerFromLink(C, _)),
                    this._dataByLinkId.set(C.id, C),
                    C.id
                  );
                }
                const p = v,
                  c = this._getEntryIdKey(p),
                  n = this._entriesWithId.get(c);
                if (n) return (this.addLineToLink(n.id, w.ybase + w.y), n.id);
                const s = w.addMarker(w.ybase + w.y),
                  o = {
                    id: this._nextId++,
                    key: this._getEntryIdKey(p),
                    data: p,
                    lines: [s],
                  };
                return (
                  s.onDispose(() => this._removeMarkerFromLink(o, s)),
                  this._entriesWithId.set(o.key, o),
                  this._dataByLinkId.set(o.id, o),
                  o.id
                );
              }
              addLineToLink(v, w) {
                const p = this._dataByLinkId.get(v);
                if (p && p.lines.every((c) => c.line !== w)) {
                  const c = this._bufferService.buffer.addMarker(w);
                  (p.lines.push(c),
                  c.onDispose(() => this._removeMarkerFromLink(p, c)));
                }
              }
              getLinkData(v) {
                var w;
                return (w = this._dataByLinkId.get(v)) == null
                  ? void 0
                  : w.data;
              }
              _getEntryIdKey(v) {
                return `${v.id};;${v.uri}`;
              }
              _removeMarkerFromLink(v, w) {
                const p = v.lines.indexOf(w);
                p !== -1 &&
                  (v.lines.splice(p, 1),
                  v.lines.length === 0 &&
                    (v.data.id !== void 0 && this._entriesWithId.delete(v.key),
                    this._dataByLinkId.delete(v.id)));
              }
            });
            a.OscLinkService = d = f([g(0, u.IBufferService)], d);
          },
          8343: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.createDecorator =
                a.getServiceDependencies =
                a.serviceRegistry =
                  void 0));
            const l = 'di$target',
              f = 'di$dependencies';
            ((a.serviceRegistry = new Map()),
            (a.getServiceDependencies = function (g) {
              return g[f] || [];
            }),
            (a.createDecorator = function (g) {
              if (a.serviceRegistry.has(g)) return a.serviceRegistry.get(g);
              const u = function (d, v, w) {
                if (arguments.length !== 3)
                  throw new Error(
                    '@IServiceName-decorator can only be used to decorate a parameter'
                  );
                (function (p, c, n) {
                  c[l] === c
                    ? c[f].push({ id: p, index: n })
                    : ((c[f] = [{ id: p, index: n }]), (c[l] = c));
                })(u, d, w);
              };
              return ((u.toString = () => g), a.serviceRegistry.set(g, u), u);
            }));
          },
          2585: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.IDecorationService =
                a.IUnicodeService =
                a.IOscLinkService =
                a.IOptionsService =
                a.ILogService =
                a.LogLevelEnum =
                a.IInstantiationService =
                a.ICharsetService =
                a.ICoreService =
                a.ICoreMouseService =
                a.IBufferService =
                  void 0));
            const f = l(8343);
            var g;
            ((a.IBufferService = (0, f.createDecorator)('BufferService')),
            (a.ICoreMouseService = (0, f.createDecorator)(
              'CoreMouseService'
            )),
            (a.ICoreService = (0, f.createDecorator)('CoreService')),
            (a.ICharsetService = (0, f.createDecorator)('CharsetService')),
            (a.IInstantiationService = (0, f.createDecorator)(
              'InstantiationService'
            )),
            (function (u) {
              ((u[(u.TRACE = 0)] = 'TRACE'),
              (u[(u.DEBUG = 1)] = 'DEBUG'),
              (u[(u.INFO = 2)] = 'INFO'),
              (u[(u.WARN = 3)] = 'WARN'),
              (u[(u.ERROR = 4)] = 'ERROR'),
              (u[(u.OFF = 5)] = 'OFF'));
            })(g || (a.LogLevelEnum = g = {})),
            (a.ILogService = (0, f.createDecorator)('LogService')),
            (a.IOptionsService = (0, f.createDecorator)('OptionsService')),
            (a.IOscLinkService = (0, f.createDecorator)('OscLinkService')),
            (a.IUnicodeService = (0, f.createDecorator)('UnicodeService')),
            (a.IDecorationService = (0, f.createDecorator)(
              'DecorationService'
            )));
          },
          1480: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.UnicodeService = void 0));
            const f = l(8460),
              g = l(225);
            class u {
              static extractShouldJoin(v) {
                return (1 & v) != 0;
              }
              static extractWidth(v) {
                return (v >> 1) & 3;
              }
              static extractCharKind(v) {
                return v >> 3;
              }
              static createPropertyValue(v, w, p = !1) {
                return ((16777215 & v) << 3) | ((3 & w) << 1) | (p ? 1 : 0);
              }
              constructor() {
                ((this._providers = Object.create(null)),
                (this._active = ''),
                (this._onChange = new f.EventEmitter()),
                (this.onChange = this._onChange.event));
                const v = new g.UnicodeV6();
                (this.register(v),
                (this._active = v.version),
                (this._activeProvider = v));
              }
              dispose() {
                this._onChange.dispose();
              }
              get versions() {
                return Object.keys(this._providers);
              }
              get activeVersion() {
                return this._active;
              }
              set activeVersion(v) {
                if (!this._providers[v])
                  throw new Error(`unknown Unicode version "${v}"`);
                ((this._active = v),
                (this._activeProvider = this._providers[v]),
                this._onChange.fire(v));
              }
              register(v) {
                this._providers[v.version] = v;
              }
              wcwidth(v) {
                return this._activeProvider.wcwidth(v);
              }
              getStringCellWidth(v) {
                let w = 0,
                  p = 0;
                const c = v.length;
                for (let n = 0; n < c; ++n) {
                  let s = v.charCodeAt(n);
                  if (55296 <= s && s <= 56319) {
                    if (++n >= c) return w + this.wcwidth(s);
                    const C = v.charCodeAt(n);
                    56320 <= C && C <= 57343
                      ? (s = 1024 * (s - 55296) + C - 56320 + 65536)
                      : (w += this.wcwidth(C));
                  }
                  const o = this.charProperties(s, p);
                  let _ = u.extractWidth(o);
                  (u.extractShouldJoin(o) && (_ -= u.extractWidth(p)),
                  (w += _),
                  (p = o));
                }
                return w;
              }
              charProperties(v, w) {
                return this._activeProvider.charProperties(v, w);
              }
            }
            a.UnicodeService = u;
          },
        },
        i = {};
      function h(y) {
        var a = i[y];
        if (a !== void 0) return a.exports;
        var l = (i[y] = { exports: {} });
        return (r[y].call(l.exports, l, l.exports, h), l.exports);
      }
      var m = {};
      return (
        (() => {
          var y = m;
          (Object.defineProperty(y, '__esModule', { value: !0 }),
          (y.Terminal = void 0));
          const a = h(9042),
            l = h(3236),
            f = h(844),
            g = h(5741),
            u = h(8285),
            d = h(7975),
            v = h(7090),
            w = ['cols', 'rows'];
          class p extends f.Disposable {
            constructor(n) {
              (super(),
              (this._core = this.register(new l.Terminal(n))),
              (this._addonManager = this.register(new g.AddonManager())),
              (this._publicOptions = { ...this._core.options }));
              const s = (_) => this._core.options[_],
                o = (_, C) => {
                  (this._checkReadonlyOptions(_), (this._core.options[_] = C));
                };
              for (const _ in this._core.options) {
                const C = { get: s.bind(this, _), set: o.bind(this, _) };
                Object.defineProperty(this._publicOptions, _, C);
              }
            }
            _checkReadonlyOptions(n) {
              if (w.includes(n))
                throw new Error(
                  `Option "${n}" can only be set in the constructor`
                );
            }
            _checkProposedApi() {
              if (!this._core.optionsService.rawOptions.allowProposedApi)
                throw new Error(
                  'You must set the allowProposedApi option to true to use proposed API'
                );
            }
            get onBell() {
              return this._core.onBell;
            }
            get onBinary() {
              return this._core.onBinary;
            }
            get onCursorMove() {
              return this._core.onCursorMove;
            }
            get onData() {
              return this._core.onData;
            }
            get onKey() {
              return this._core.onKey;
            }
            get onLineFeed() {
              return this._core.onLineFeed;
            }
            get onRender() {
              return this._core.onRender;
            }
            get onResize() {
              return this._core.onResize;
            }
            get onScroll() {
              return this._core.onScroll;
            }
            get onSelectionChange() {
              return this._core.onSelectionChange;
            }
            get onTitleChange() {
              return this._core.onTitleChange;
            }
            get onWriteParsed() {
              return this._core.onWriteParsed;
            }
            get element() {
              return this._core.element;
            }
            get parser() {
              return (
                this._parser || (this._parser = new d.ParserApi(this._core)),
                this._parser
              );
            }
            get unicode() {
              return (this._checkProposedApi(), new v.UnicodeApi(this._core));
            }
            get textarea() {
              return this._core.textarea;
            }
            get rows() {
              return this._core.rows;
            }
            get cols() {
              return this._core.cols;
            }
            get buffer() {
              return (
                this._buffer ||
                  (this._buffer = this.register(
                    new u.BufferNamespaceApi(this._core)
                  )),
                this._buffer
              );
            }
            get markers() {
              return (this._checkProposedApi(), this._core.markers);
            }
            get modes() {
              const n = this._core.coreService.decPrivateModes;
              let s = 'none';
              switch (this._core.coreMouseService.activeProtocol) {
              case 'X10':
                s = 'x10';
                break;
              case 'VT200':
                s = 'vt200';
                break;
              case 'DRAG':
                s = 'drag';
                break;
              case 'ANY':
                s = 'any';
              }
              return {
                applicationCursorKeysMode: n.applicationCursorKeys,
                applicationKeypadMode: n.applicationKeypad,
                bracketedPasteMode: n.bracketedPasteMode,
                insertMode: this._core.coreService.modes.insertMode,
                mouseTrackingMode: s,
                originMode: n.origin,
                reverseWraparoundMode: n.reverseWraparound,
                sendFocusMode: n.sendFocus,
                wraparoundMode: n.wraparound,
              };
            }
            get options() {
              return this._publicOptions;
            }
            set options(n) {
              for (const s in n) this._publicOptions[s] = n[s];
            }
            blur() {
              this._core.blur();
            }
            focus() {
              this._core.focus();
            }
            input(n, s = !0) {
              this._core.input(n, s);
            }
            resize(n, s) {
              (this._verifyIntegers(n, s), this._core.resize(n, s));
            }
            open(n) {
              this._core.open(n);
            }
            attachCustomKeyEventHandler(n) {
              this._core.attachCustomKeyEventHandler(n);
            }
            attachCustomWheelEventHandler(n) {
              this._core.attachCustomWheelEventHandler(n);
            }
            registerLinkProvider(n) {
              return this._core.registerLinkProvider(n);
            }
            registerCharacterJoiner(n) {
              return (
                this._checkProposedApi(),
                this._core.registerCharacterJoiner(n)
              );
            }
            deregisterCharacterJoiner(n) {
              (this._checkProposedApi(),
              this._core.deregisterCharacterJoiner(n));
            }
            registerMarker(n = 0) {
              return (this._verifyIntegers(n), this._core.registerMarker(n));
            }
            registerDecoration(n) {
              return (
                this._checkProposedApi(),
                this._verifyPositiveIntegers(
                  n.x ?? 0,
                  n.width ?? 0,
                  n.height ?? 0
                ),
                this._core.registerDecoration(n)
              );
            }
            hasSelection() {
              return this._core.hasSelection();
            }
            select(n, s, o) {
              (this._verifyIntegers(n, s, o), this._core.select(n, s, o));
            }
            getSelection() {
              return this._core.getSelection();
            }
            getSelectionPosition() {
              return this._core.getSelectionPosition();
            }
            clearSelection() {
              this._core.clearSelection();
            }
            selectAll() {
              this._core.selectAll();
            }
            selectLines(n, s) {
              (this._verifyIntegers(n, s), this._core.selectLines(n, s));
            }
            dispose() {
              super.dispose();
            }
            scrollLines(n) {
              (this._verifyIntegers(n), this._core.scrollLines(n));
            }
            scrollPages(n) {
              (this._verifyIntegers(n), this._core.scrollPages(n));
            }
            scrollToTop() {
              this._core.scrollToTop();
            }
            scrollToBottom() {
              this._core.scrollToBottom();
            }
            scrollToLine(n) {
              (this._verifyIntegers(n), this._core.scrollToLine(n));
            }
            clear() {
              this._core.clear();
            }
            write(n, s) {
              this._core.write(n, s);
            }
            writeln(n, s) {
              (this._core.write(n),
              this._core.write(
                `\r
`,
                s
              ));
            }
            paste(n) {
              this._core.paste(n);
            }
            refresh(n, s) {
              (this._verifyIntegers(n, s), this._core.refresh(n, s));
            }
            reset() {
              this._core.reset();
            }
            clearTextureAtlas() {
              this._core.clearTextureAtlas();
            }
            loadAddon(n) {
              this._addonManager.loadAddon(this, n);
            }
            static get strings() {
              return a;
            }
            _verifyIntegers(...n) {
              for (const s of n)
                if (s === 1 / 0 || isNaN(s) || s % 1 != 0)
                  throw new Error('This API only accepts integers');
            }
            _verifyPositiveIntegers(...n) {
              for (const s of n)
                if (s && (s === 1 / 0 || isNaN(s) || s % 1 != 0 || s < 0))
                  throw new Error('This API only accepts positive integers');
            }
          }
          y.Terminal = p;
        })(),
        m
      );
    })()
  );
})(Bh);
var Cf = Bh.exports,
  Ih = { exports: {} };
(function (e, t) {
  (function (r, i) {
    e.exports = i();
  })(self, () =>
    (() => {
      var r = {};
      return (
        (() => {
          var i = r;
          (Object.defineProperty(i, '__esModule', { value: !0 }),
          (i.FitAddon = void 0),
          (i.FitAddon = class {
            activate(h) {
              this._terminal = h;
            }
            dispose() {}
            fit() {
              const h = this.proposeDimensions();
              if (!h || !this._terminal || isNaN(h.cols) || isNaN(h.rows))
                return;
              const m = this._terminal._core;
              (this._terminal.rows === h.rows &&
                  this._terminal.cols === h.cols) ||
                  (m._renderService.clear(),
                  this._terminal.resize(h.cols, h.rows));
            }
            proposeDimensions() {
              if (
                !this._terminal ||
                  !this._terminal.element ||
                  !this._terminal.element.parentElement
              )
                return;
              const h = this._terminal._core,
                m = h._renderService.dimensions;
              if (m.css.cell.width === 0 || m.css.cell.height === 0) return;
              const y =
                    this._terminal.options.scrollback === 0
                      ? 0
                      : h.viewport.scrollBarWidth,
                a = window.getComputedStyle(
                  this._terminal.element.parentElement
                ),
                l = parseInt(a.getPropertyValue('height')),
                f = Math.max(0, parseInt(a.getPropertyValue('width'))),
                g = window.getComputedStyle(this._terminal.element),
                u =
                    l -
                    (parseInt(g.getPropertyValue('padding-top')) +
                      parseInt(g.getPropertyValue('padding-bottom'))),
                d =
                    f -
                    (parseInt(g.getPropertyValue('padding-right')) +
                      parseInt(g.getPropertyValue('padding-left'))) -
                    y;
              return {
                cols: Math.max(2, Math.floor(d / m.css.cell.width)),
                rows: Math.max(1, Math.floor(u / m.css.cell.height)),
              };
            }
          }));
        })(),
        r
      );
    })()
  );
})(Ih);
var bf = Ih.exports,
  Hh = { exports: {} };
(function (e, t) {
  (function (r, i) {
    e.exports = i();
  })(self, () =>
    (() => {
      var r = {
          6: (y, a) => {
            function l(g) {
              try {
                const u = new URL(g),
                  d =
                    u.password && u.username
                      ? `${u.protocol}//${u.username}:${u.password}@${u.host}`
                      : u.username
                        ? `${u.protocol}//${u.username}@${u.host}`
                        : `${u.protocol}//${u.host}`;
                return g.toLocaleLowerCase().startsWith(d.toLocaleLowerCase());
              } catch {
                return !1;
              }
            }
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.LinkComputer = a.WebLinkProvider = void 0),
            (a.WebLinkProvider = class {
              constructor(g, u, d, v = {}) {
                ((this._terminal = g),
                (this._regex = u),
                (this._handler = d),
                (this._options = v));
              }
              provideLinks(g, u) {
                const d = f.computeLink(
                  g,
                  this._regex,
                  this._terminal,
                  this._handler
                );
                u(this._addCallbacks(d));
              }
              _addCallbacks(g) {
                return g.map(
                  (u) => (
                    (u.leave = this._options.leave),
                    (u.hover = (d, v) => {
                      if (this._options.hover) {
                        const { range: w } = u;
                        this._options.hover(d, v, w);
                      }
                    }),
                    u
                  )
                );
              }
            }));
            class f {
              static computeLink(u, d, v, w) {
                const p = new RegExp(d.source, (d.flags || '') + 'g'),
                  [c, n] = f._getWindowedLineStrings(u - 1, v),
                  s = c.join('');
                let o;
                const _ = [];
                for (; (o = p.exec(s)); ) {
                  const C = o[0];
                  if (!l(C)) continue;
                  const [b, x] = f._mapStrIdx(v, n, 0, o.index),
                    [S, k] = f._mapStrIdx(v, b, x, C.length);
                  if (b === -1 || x === -1 || S === -1 || k === -1) continue;
                  const T = {
                    start: { x: x + 1, y: b + 1 },
                    end: { x: k, y: S + 1 },
                  };
                  _.push({ range: T, text: C, activate: w });
                }
                return _;
              }
              static _getWindowedLineStrings(u, d) {
                let v,
                  w = u,
                  p = u,
                  c = 0,
                  n = '';
                const s = [];
                if ((v = d.buffer.active.getLine(u))) {
                  const o = v.translateToString(!0);
                  if (v.isWrapped && o[0] !== ' ') {
                    for (
                      c = 0;
                      (v = d.buffer.active.getLine(--w)) &&
                      c < 2048 &&
                      ((n = v.translateToString(!0)),
                      (c += n.length),
                      s.push(n),
                      v.isWrapped && n.indexOf(' ') === -1);

                    );
                    s.reverse();
                  }
                  for (
                    s.push(o), c = 0;
                    (v = d.buffer.active.getLine(++p)) &&
                    v.isWrapped &&
                    c < 2048 &&
                    ((n = v.translateToString(!0)),
                    (c += n.length),
                    s.push(n),
                    n.indexOf(' ') === -1);

                  );
                }
                return [s, w];
              }
              static _mapStrIdx(u, d, v, w) {
                const p = u.buffer.active,
                  c = p.getNullCell();
                let n = v;
                for (; w; ) {
                  const s = p.getLine(d);
                  if (!s) return [-1, -1];
                  for (let o = n; o < s.length; ++o) {
                    s.getCell(o, c);
                    const _ = c.getChars();
                    if (
                      c.getWidth() &&
                      ((w -= _.length || 1), o === s.length - 1 && _ === '')
                    ) {
                      const C = p.getLine(d + 1);
                      C &&
                        C.isWrapped &&
                        (C.getCell(0, c), c.getWidth() === 2 && (w += 1));
                    }
                    if (w < 0) return [d, o];
                  }
                  (d++, (n = 0));
                }
                return [d, n];
              }
            }
            a.LinkComputer = f;
          },
        },
        i = {};
      function h(y) {
        var a = i[y];
        if (a !== void 0) return a.exports;
        var l = (i[y] = { exports: {} });
        return (r[y](l, l.exports, h), l.exports);
      }
      var m = {};
      return (
        (() => {
          var y = m;
          (Object.defineProperty(y, '__esModule', { value: !0 }),
          (y.WebLinksAddon = void 0));
          const a = h(6),
            l =
              /(https?|HTTPS?):[/]{2}[^\s"'!*(){}|\\\^<>`]*[^\s"':,.!?{}|\\\^~\[\]`()<>]/;
          function f(g, u) {
            const d = window.open();
            if (d) {
              try {
                d.opener = null;
              } catch {}
              d.location.href = u;
            } else
              console.warn(
                'Opening link blocked as opener could not be cleared'
              );
          }
          y.WebLinksAddon = class {
            constructor(g = f, u = {}) {
              ((this._handler = g), (this._options = u));
            }
            activate(g) {
              this._terminal = g;
              const u = this._options,
                d = u.urlRegex || l;
              this._linkProvider = this._terminal.registerLinkProvider(
                new a.WebLinkProvider(this._terminal, d, this._handler, u)
              );
            }
            dispose() {
              var g;
              (g = this._linkProvider) == null || g.dispose();
            }
          };
        })(),
        m
      );
    })()
  );
})(Hh);
var xf = Hh.exports,
  Nh = { exports: {} };
(function (e, t) {
  (function (r, i) {
    e.exports = i();
  })(self, () =>
    (() => {
      var r = {
          345: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.runAndSubscribe = a.forwardEvent = a.EventEmitter = void 0),
            (a.EventEmitter = class {
              constructor() {
                ((this._listeners = []), (this._disposed = !1));
              }
              get event() {
                return (
                  this._event ||
                      (this._event = (l) => (
                        this._listeners.push(l),
                        {
                          dispose: () => {
                            if (!this._disposed) {
                              for (let f = 0; f < this._listeners.length; f++)
                                if (this._listeners[f] === l)
                                  return void this._listeners.splice(f, 1);
                            }
                          },
                        }
                      )),
                  this._event
                );
              }
              fire(l, f) {
                const g = [];
                for (let u = 0; u < this._listeners.length; u++)
                  g.push(this._listeners[u]);
                for (let u = 0; u < g.length; u++) g[u].call(void 0, l, f);
              }
              dispose() {
                (this.clearListeners(), (this._disposed = !0));
              }
              clearListeners() {
                this._listeners && (this._listeners.length = 0);
              }
            }),
            (a.forwardEvent = function (l, f) {
              return l((g) => f.fire(g));
            }),
            (a.runAndSubscribe = function (l, f) {
              return (f(void 0), l((g) => f(g)));
            }));
          },
          859: (y, a) => {
            function l(f) {
              for (const g of f) g.dispose();
              f.length = 0;
            }
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.getDisposeArrayDisposable =
                a.disposeArray =
                a.toDisposable =
                a.MutableDisposable =
                a.Disposable =
                  void 0),
            (a.Disposable = class {
              constructor() {
                ((this._disposables = []), (this._isDisposed = !1));
              }
              dispose() {
                this._isDisposed = !0;
                for (const f of this._disposables) f.dispose();
                this._disposables.length = 0;
              }
              register(f) {
                return (this._disposables.push(f), f);
              }
              unregister(f) {
                const g = this._disposables.indexOf(f);
                g !== -1 && this._disposables.splice(g, 1);
              }
            }),
            (a.MutableDisposable = class {
              constructor() {
                this._isDisposed = !1;
              }
              get value() {
                return this._isDisposed ? void 0 : this._value;
              }
              set value(f) {
                var g;
                this._isDisposed ||
                    f === this._value ||
                    ((g = this._value) == null || g.dispose(),
                    (this._value = f));
              }
              clear() {
                this.value = void 0;
              }
              dispose() {
                var f;
                ((this._isDisposed = !0),
                (f = this._value) == null || f.dispose(),
                (this._value = void 0));
              }
            }),
            (a.toDisposable = function (f) {
              return { dispose: f };
            }),
            (a.disposeArray = l),
            (a.getDisposeArrayDisposable = function (f) {
              return { dispose: () => l(f) };
            }));
          },
        },
        i = {};
      function h(y) {
        var a = i[y];
        if (a !== void 0) return a.exports;
        var l = (i[y] = { exports: {} });
        return (r[y](l, l.exports, h), l.exports);
      }
      var m = {};
      return (
        (() => {
          var y = m;
          (Object.defineProperty(y, '__esModule', { value: !0 }),
          (y.SearchAddon = void 0));
          const a = h(345),
            l = h(859),
            f = ' ~!@#$%^&*()+`-=[]{}|\\;:"\',./<>?';
          class g extends l.Disposable {
            constructor(d) {
              (super(),
              (this._highlightedLines = new Set()),
              (this._highlightDecorations = []),
              (this._selectedDecoration = this.register(
                new l.MutableDisposable()
              )),
              (this._linesCacheTimeoutId = 0),
              (this._linesCacheDisposables = new l.MutableDisposable()),
              (this._onDidChangeResults = this.register(
                new a.EventEmitter()
              )),
              (this.onDidChangeResults = this._onDidChangeResults.event),
              (this._highlightLimit =
                  (d == null ? void 0 : d.highlightLimit) ?? 1e3));
            }
            activate(d) {
              ((this._terminal = d),
              this.register(
                this._terminal.onWriteParsed(() => this._updateMatches())
              ),
              this.register(
                this._terminal.onResize(() => this._updateMatches())
              ),
              this.register(
                (0, l.toDisposable)(() => this.clearDecorations())
              ));
            }
            _updateMatches() {
              var d;
              (this._highlightTimeout &&
                window.clearTimeout(this._highlightTimeout),
              this._cachedSearchTerm &&
                  (d = this._lastSearchOptions) != null &&
                  d.decorations &&
                  (this._highlightTimeout = setTimeout(() => {
                    const v = this._cachedSearchTerm;
                    ((this._cachedSearchTerm = void 0),
                    this.findPrevious(v, {
                      ...this._lastSearchOptions,
                      incremental: !0,
                      noScroll: !0,
                    }));
                  }, 200)));
            }
            clearDecorations(d) {
              (this._selectedDecoration.clear(),
              (0, l.disposeArray)(this._highlightDecorations),
              (this._highlightDecorations = []),
              this._highlightedLines.clear(),
              d || (this._cachedSearchTerm = void 0));
            }
            clearActiveDecoration() {
              this._selectedDecoration.clear();
            }
            findNext(d, v) {
              if (!this._terminal)
                throw new Error('Cannot use addon until it has been loaded');
              const w =
                !this._lastSearchOptions ||
                this._didOptionsChange(this._lastSearchOptions, v);
              ((this._lastSearchOptions = v),
              v != null &&
                  v.decorations &&
                  (this._cachedSearchTerm === void 0 ||
                    d !== this._cachedSearchTerm ||
                    w) &&
                  this._highlightAllMatches(d, v));
              const p = this._findNextAndSelect(d, v);
              return (this._fireResults(v), (this._cachedSearchTerm = d), p);
            }
            _highlightAllMatches(d, v) {
              if (!this._terminal)
                throw new Error('Cannot use addon until it has been loaded');
              if (!d || d.length === 0) return void this.clearDecorations();
              ((v = v || {}), this.clearDecorations(!0));
              const w = [];
              let p,
                c = this._find(d, 0, 0, v);
              for (
                ;
                c &&
                ((p == null ? void 0 : p.row) !== c.row ||
                  (p == null ? void 0 : p.col) !== c.col) &&
                !(w.length >= this._highlightLimit);

              )
                ((p = c),
                w.push(p),
                (c = this._find(
                  d,
                  p.col + p.term.length >= this._terminal.cols
                    ? p.row + 1
                    : p.row,
                  p.col + p.term.length >= this._terminal.cols
                    ? 0
                    : p.col + 1,
                  v
                )));
              for (const n of w) {
                const s = this._createResultDecoration(n, v.decorations);
                s &&
                  (this._highlightedLines.add(s.marker.line),
                  this._highlightDecorations.push({
                    decoration: s,
                    match: n,
                    dispose() {
                      s.dispose();
                    },
                  }));
              }
            }
            _find(d, v, w, p) {
              var s;
              if (!this._terminal || !d || d.length === 0)
                return (
                  (s = this._terminal) == null || s.clearSelection(),
                  void this.clearDecorations()
                );
              if (w > this._terminal.cols)
                throw new Error(
                  `Invalid col: ${w} to search in terminal of ${this._terminal.cols} cols`
                );
              let c;
              this._initLinesCache();
              const n = { startRow: v, startCol: w };
              if (((c = this._findInLine(d, n, p)), !c))
                for (
                  let o = v + 1;
                  o <
                    this._terminal.buffer.active.baseY + this._terminal.rows &&
                  ((n.startRow = o),
                  (n.startCol = 0),
                  (c = this._findInLine(d, n, p)),
                  !c);
                  o++
                );
              return c;
            }
            _findNextAndSelect(d, v) {
              var o;
              if (!this._terminal || !d || d.length === 0)
                return (
                  (o = this._terminal) == null || o.clearSelection(),
                  this.clearDecorations(),
                  !1
                );
              const w = this._terminal.getSelectionPosition();
              this._terminal.clearSelection();
              let p = 0,
                c = 0;
              (w &&
                (this._cachedSearchTerm === d
                  ? ((p = w.end.x), (c = w.end.y))
                  : ((p = w.start.x), (c = w.start.y))),
              this._initLinesCache());
              const n = { startRow: c, startCol: p };
              let s = this._findInLine(d, n, v);
              if (!s)
                for (
                  let _ = c + 1;
                  _ <
                    this._terminal.buffer.active.baseY + this._terminal.rows &&
                  ((n.startRow = _),
                  (n.startCol = 0),
                  (s = this._findInLine(d, n, v)),
                  !s);
                  _++
                );
              if (!s && c !== 0)
                for (
                  let _ = 0;
                  _ < c &&
                  ((n.startRow = _),
                  (n.startCol = 0),
                  (s = this._findInLine(d, n, v)),
                  !s);
                  _++
                );
              return (
                !s &&
                  w &&
                  ((n.startRow = w.start.y),
                  (n.startCol = 0),
                  (s = this._findInLine(d, n, v))),
                this._selectResult(
                  s,
                  v == null ? void 0 : v.decorations,
                  v == null ? void 0 : v.noScroll
                )
              );
            }
            findPrevious(d, v) {
              if (!this._terminal)
                throw new Error('Cannot use addon until it has been loaded');
              const w =
                !this._lastSearchOptions ||
                this._didOptionsChange(this._lastSearchOptions, v);
              ((this._lastSearchOptions = v),
              v != null &&
                  v.decorations &&
                  (this._cachedSearchTerm === void 0 ||
                    d !== this._cachedSearchTerm ||
                    w) &&
                  this._highlightAllMatches(d, v));
              const p = this._findPreviousAndSelect(d, v);
              return (this._fireResults(v), (this._cachedSearchTerm = d), p);
            }
            _didOptionsChange(d, v) {
              return (
                !!v &&
                (d.caseSensitive !== v.caseSensitive ||
                  d.regex !== v.regex ||
                  d.wholeWord !== v.wholeWord)
              );
            }
            _fireResults(d) {
              if (d != null && d.decorations) {
                let v = -1;
                if (this._selectedDecoration.value) {
                  const w = this._selectedDecoration.value.match;
                  for (let p = 0; p < this._highlightDecorations.length; p++) {
                    const c = this._highlightDecorations[p].match;
                    if (
                      c.row === w.row &&
                      c.col === w.col &&
                      c.size === w.size
                    ) {
                      v = p;
                      break;
                    }
                  }
                }
                this._onDidChangeResults.fire({
                  resultIndex: v,
                  resultCount: this._highlightDecorations.length,
                });
              }
            }
            _findPreviousAndSelect(d, v) {
              var _;
              if (!this._terminal)
                throw new Error('Cannot use addon until it has been loaded');
              if (!this._terminal || !d || d.length === 0)
                return (
                  (_ = this._terminal) == null || _.clearSelection(),
                  this.clearDecorations(),
                  !1
                );
              const w = this._terminal.getSelectionPosition();
              this._terminal.clearSelection();
              let p =
                  this._terminal.buffer.active.baseY + this._terminal.rows - 1,
                c = this._terminal.cols;
              const n = !0;
              this._initLinesCache();
              const s = { startRow: p, startCol: c };
              let o;
              if (
                (w &&
                  ((s.startRow = p = w.start.y),
                  (s.startCol = c = w.start.x),
                  this._cachedSearchTerm !== d &&
                    ((o = this._findInLine(d, s, v, !1)),
                    o ||
                      ((s.startRow = p = w.end.y),
                      (s.startCol = c = w.end.x)))),
                o || (o = this._findInLine(d, s, v, n)),
                !o)
              ) {
                s.startCol = Math.max(s.startCol, this._terminal.cols);
                for (
                  let C = p - 1;
                  C >= 0 &&
                  ((s.startRow = C), (o = this._findInLine(d, s, v, n)), !o);
                  C--
                );
              }
              if (
                !o &&
                p !==
                  this._terminal.buffer.active.baseY + this._terminal.rows - 1
              )
                for (
                  let C =
                    this._terminal.buffer.active.baseY +
                    this._terminal.rows -
                    1;
                  C >= p &&
                  ((s.startRow = C), (o = this._findInLine(d, s, v, n)), !o);
                  C--
                );
              return this._selectResult(
                o,
                v == null ? void 0 : v.decorations,
                v == null ? void 0 : v.noScroll
              );
            }
            _initLinesCache() {
              const d = this._terminal;
              (this._linesCache ||
                ((this._linesCache = new Array(d.buffer.active.length)),
                (this._linesCacheDisposables.value = (0,
                l.getDisposeArrayDisposable)([
                  d.onLineFeed(() => this._destroyLinesCache()),
                  d.onCursorMove(() => this._destroyLinesCache()),
                  d.onResize(() => this._destroyLinesCache()),
                ]))),
              window.clearTimeout(this._linesCacheTimeoutId),
              (this._linesCacheTimeoutId = window.setTimeout(
                () => this._destroyLinesCache(),
                15e3
              )));
            }
            _destroyLinesCache() {
              ((this._linesCache = void 0),
              this._linesCacheDisposables.clear(),
              this._linesCacheTimeoutId &&
                  (window.clearTimeout(this._linesCacheTimeoutId),
                  (this._linesCacheTimeoutId = 0)));
            }
            _isWholeWord(d, v, w) {
              return (
                (d === 0 || f.includes(v[d - 1])) &&
                (d + w.length === v.length || f.includes(v[d + w.length]))
              );
            }
            _findInLine(d, v, w = {}, p = !1) {
              var B;
              const c = this._terminal,
                n = v.startRow,
                s = v.startCol,
                o = c.buffer.active.getLine(n);
              if (o != null && o.isWrapped)
                return p
                  ? void (v.startCol += c.cols)
                  : (v.startRow--,
                  (v.startCol += c.cols),
                  this._findInLine(d, v, w));
              let _ = (B = this._linesCache) == null ? void 0 : B[n];
              _ ||
                ((_ = this._translateBufferLineToStringWithWrap(n, !0)),
                this._linesCache && (this._linesCache[n] = _));
              const [C, b] = _,
                x = this._bufferColsToStringOffset(n, s),
                S = w.caseSensitive ? d : d.toLowerCase(),
                k = w.caseSensitive ? C : C.toLowerCase();
              let T = -1;
              if (w.regex) {
                const O = RegExp(S, 'g');
                let A;
                if (p)
                  for (; (A = O.exec(k.slice(0, x))); )
                    ((T = O.lastIndex - A[0].length),
                    (d = A[0]),
                    (O.lastIndex -= d.length - 1));
                else
                  ((A = O.exec(k.slice(x))),
                  A &&
                      A[0].length > 0 &&
                      ((T = x + (O.lastIndex - A[0].length)), (d = A[0])));
              } else
                p
                  ? x - S.length >= 0 && (T = k.lastIndexOf(S, x - S.length))
                  : (T = k.indexOf(S, x));
              if (T >= 0) {
                if (w.wholeWord && !this._isWholeWord(T, k, d)) return;
                let O = 0;
                for (; O < b.length - 1 && T >= b[O + 1]; ) O++;
                let A = O;
                for (; A < b.length - 1 && T + d.length >= b[A + 1]; ) A++;
                const H = T - b[O],
                  W = T + d.length - b[A],
                  $ = this._stringLengthToBufferSize(n + O, H);
                return {
                  term: d,
                  col: $,
                  row: n + O,
                  size:
                    this._stringLengthToBufferSize(n + A, W) -
                    $ +
                    c.cols * (A - O),
                };
              }
            }
            _stringLengthToBufferSize(d, v) {
              const w = this._terminal.buffer.active.getLine(d);
              if (!w) return 0;
              for (let p = 0; p < v; p++) {
                const c = w.getCell(p);
                if (!c) break;
                const n = c.getChars();
                n.length > 1 && (v -= n.length - 1);
                const s = w.getCell(p + 1);
                s && s.getWidth() === 0 && v++;
              }
              return v;
            }
            _bufferColsToStringOffset(d, v) {
              const w = this._terminal;
              let p = d,
                c = 0,
                n = w.buffer.active.getLine(p);
              for (; v > 0 && n; ) {
                for (let s = 0; s < v && s < w.cols; s++) {
                  const o = n.getCell(s);
                  if (!o) break;
                  o.getWidth() &&
                    (c += o.getCode() === 0 ? 1 : o.getChars().length);
                }
                if ((p++, (n = w.buffer.active.getLine(p)), n && !n.isWrapped))
                  break;
                v -= w.cols;
              }
              return c;
            }
            _translateBufferLineToStringWithWrap(d, v) {
              var s;
              const w = this._terminal,
                p = [],
                c = [0];
              let n = w.buffer.active.getLine(d);
              for (; n; ) {
                const o = w.buffer.active.getLine(d + 1),
                  _ = !!o && o.isWrapped;
                let C = n.translateToString(!_ && v);
                if (_ && o) {
                  const b = n.getCell(n.length - 1);
                  b &&
                    b.getCode() === 0 &&
                    b.getWidth() === 1 &&
                    ((s = o.getCell(0)) == null ? void 0 : s.getWidth()) ===
                      2 &&
                    (C = C.slice(0, -1));
                }
                if ((p.push(C), !_)) break;
                (c.push(c[c.length - 1] + C.length), d++, (n = o));
              }
              return [p.join(''), c];
            }
            _selectResult(d, v, w) {
              const p = this._terminal;
              if ((this._selectedDecoration.clear(), !d))
                return (p.clearSelection(), !1);
              if ((p.select(d.col, d.row, d.size), v)) {
                const c = p.registerMarker(
                  -p.buffer.active.baseY - p.buffer.active.cursorY + d.row
                );
                if (c) {
                  const n = p.registerDecoration({
                    marker: c,
                    x: d.col,
                    width: d.size,
                    backgroundColor: v.activeMatchBackground,
                    layer: 'top',
                    overviewRulerOptions: {
                      color: v.activeMatchColorOverviewRuler,
                    },
                  });
                  if (n) {
                    const s = [];
                    (s.push(c),
                    s.push(
                      n.onRender((o) =>
                        this._applyStyles(o, v.activeMatchBorder, !0)
                      )
                    ),
                    s.push(n.onDispose(() => (0, l.disposeArray)(s))),
                    (this._selectedDecoration.value = {
                      decoration: n,
                      match: d,
                      dispose() {
                        n.dispose();
                      },
                    }));
                  }
                }
              }
              if (
                !w &&
                (d.row >= p.buffer.active.viewportY + p.rows ||
                  d.row < p.buffer.active.viewportY)
              ) {
                let c = d.row - p.buffer.active.viewportY;
                ((c -= Math.floor(p.rows / 2)), p.scrollLines(c));
              }
              return !0;
            }
            _applyStyles(d, v, w) {
              (d.classList.contains('xterm-find-result-decoration') ||
                (d.classList.add('xterm-find-result-decoration'),
                v && (d.style.outline = `1px solid ${v}`)),
              w && d.classList.add('xterm-find-active-result-decoration'));
            }
            _createResultDecoration(d, v) {
              const w = this._terminal,
                p = w.registerMarker(
                  -w.buffer.active.baseY - w.buffer.active.cursorY + d.row
                );
              if (!p) return;
              const c = w.registerDecoration({
                marker: p,
                x: d.col,
                width: d.size,
                backgroundColor: v.matchBackground,
                overviewRulerOptions: this._highlightedLines.has(p.line)
                  ? void 0
                  : { color: v.matchOverviewRuler, position: 'center' },
              });
              if (c) {
                const n = [];
                (n.push(p),
                n.push(
                  c.onRender((s) => this._applyStyles(s, v.matchBorder, !1))
                ),
                n.push(c.onDispose(() => (0, l.disposeArray)(n))));
              }
              return c;
            }
          }
          y.SearchAddon = g;
        })(),
        m
      );
    })()
  );
})(Nh);
var Ef = Nh.exports,
  Fh = { exports: {} };
(function (e, t) {
  (function (r, i) {
    e.exports = i();
  })(Wh, () =>
    (() => {
      var r = {
          433: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.UnicodeV11 = void 0));
            const f = l(938),
              g = [
                [768, 879],
                [1155, 1161],
                [1425, 1469],
                [1471, 1471],
                [1473, 1474],
                [1476, 1477],
                [1479, 1479],
                [1536, 1541],
                [1552, 1562],
                [1564, 1564],
                [1611, 1631],
                [1648, 1648],
                [1750, 1757],
                [1759, 1764],
                [1767, 1768],
                [1770, 1773],
                [1807, 1807],
                [1809, 1809],
                [1840, 1866],
                [1958, 1968],
                [2027, 2035],
                [2045, 2045],
                [2070, 2073],
                [2075, 2083],
                [2085, 2087],
                [2089, 2093],
                [2137, 2139],
                [2259, 2306],
                [2362, 2362],
                [2364, 2364],
                [2369, 2376],
                [2381, 2381],
                [2385, 2391],
                [2402, 2403],
                [2433, 2433],
                [2492, 2492],
                [2497, 2500],
                [2509, 2509],
                [2530, 2531],
                [2558, 2558],
                [2561, 2562],
                [2620, 2620],
                [2625, 2626],
                [2631, 2632],
                [2635, 2637],
                [2641, 2641],
                [2672, 2673],
                [2677, 2677],
                [2689, 2690],
                [2748, 2748],
                [2753, 2757],
                [2759, 2760],
                [2765, 2765],
                [2786, 2787],
                [2810, 2815],
                [2817, 2817],
                [2876, 2876],
                [2879, 2879],
                [2881, 2884],
                [2893, 2893],
                [2902, 2902],
                [2914, 2915],
                [2946, 2946],
                [3008, 3008],
                [3021, 3021],
                [3072, 3072],
                [3076, 3076],
                [3134, 3136],
                [3142, 3144],
                [3146, 3149],
                [3157, 3158],
                [3170, 3171],
                [3201, 3201],
                [3260, 3260],
                [3263, 3263],
                [3270, 3270],
                [3276, 3277],
                [3298, 3299],
                [3328, 3329],
                [3387, 3388],
                [3393, 3396],
                [3405, 3405],
                [3426, 3427],
                [3530, 3530],
                [3538, 3540],
                [3542, 3542],
                [3633, 3633],
                [3636, 3642],
                [3655, 3662],
                [3761, 3761],
                [3764, 3772],
                [3784, 3789],
                [3864, 3865],
                [3893, 3893],
                [3895, 3895],
                [3897, 3897],
                [3953, 3966],
                [3968, 3972],
                [3974, 3975],
                [3981, 3991],
                [3993, 4028],
                [4038, 4038],
                [4141, 4144],
                [4146, 4151],
                [4153, 4154],
                [4157, 4158],
                [4184, 4185],
                [4190, 4192],
                [4209, 4212],
                [4226, 4226],
                [4229, 4230],
                [4237, 4237],
                [4253, 4253],
                [4448, 4607],
                [4957, 4959],
                [5906, 5908],
                [5938, 5940],
                [5970, 5971],
                [6002, 6003],
                [6068, 6069],
                [6071, 6077],
                [6086, 6086],
                [6089, 6099],
                [6109, 6109],
                [6155, 6158],
                [6277, 6278],
                [6313, 6313],
                [6432, 6434],
                [6439, 6440],
                [6450, 6450],
                [6457, 6459],
                [6679, 6680],
                [6683, 6683],
                [6742, 6742],
                [6744, 6750],
                [6752, 6752],
                [6754, 6754],
                [6757, 6764],
                [6771, 6780],
                [6783, 6783],
                [6832, 6846],
                [6912, 6915],
                [6964, 6964],
                [6966, 6970],
                [6972, 6972],
                [6978, 6978],
                [7019, 7027],
                [7040, 7041],
                [7074, 7077],
                [7080, 7081],
                [7083, 7085],
                [7142, 7142],
                [7144, 7145],
                [7149, 7149],
                [7151, 7153],
                [7212, 7219],
                [7222, 7223],
                [7376, 7378],
                [7380, 7392],
                [7394, 7400],
                [7405, 7405],
                [7412, 7412],
                [7416, 7417],
                [7616, 7673],
                [7675, 7679],
                [8203, 8207],
                [8234, 8238],
                [8288, 8292],
                [8294, 8303],
                [8400, 8432],
                [11503, 11505],
                [11647, 11647],
                [11744, 11775],
                [12330, 12333],
                [12441, 12442],
                [42607, 42610],
                [42612, 42621],
                [42654, 42655],
                [42736, 42737],
                [43010, 43010],
                [43014, 43014],
                [43019, 43019],
                [43045, 43046],
                [43204, 43205],
                [43232, 43249],
                [43263, 43263],
                [43302, 43309],
                [43335, 43345],
                [43392, 43394],
                [43443, 43443],
                [43446, 43449],
                [43452, 43453],
                [43493, 43493],
                [43561, 43566],
                [43569, 43570],
                [43573, 43574],
                [43587, 43587],
                [43596, 43596],
                [43644, 43644],
                [43696, 43696],
                [43698, 43700],
                [43703, 43704],
                [43710, 43711],
                [43713, 43713],
                [43756, 43757],
                [43766, 43766],
                [44005, 44005],
                [44008, 44008],
                [44013, 44013],
                [64286, 64286],
                [65024, 65039],
                [65056, 65071],
                [65279, 65279],
                [65529, 65531],
              ],
              u = [
                [66045, 66045],
                [66272, 66272],
                [66422, 66426],
                [68097, 68099],
                [68101, 68102],
                [68108, 68111],
                [68152, 68154],
                [68159, 68159],
                [68325, 68326],
                [68900, 68903],
                [69446, 69456],
                [69633, 69633],
                [69688, 69702],
                [69759, 69761],
                [69811, 69814],
                [69817, 69818],
                [69821, 69821],
                [69837, 69837],
                [69888, 69890],
                [69927, 69931],
                [69933, 69940],
                [70003, 70003],
                [70016, 70017],
                [70070, 70078],
                [70089, 70092],
                [70191, 70193],
                [70196, 70196],
                [70198, 70199],
                [70206, 70206],
                [70367, 70367],
                [70371, 70378],
                [70400, 70401],
                [70459, 70460],
                [70464, 70464],
                [70502, 70508],
                [70512, 70516],
                [70712, 70719],
                [70722, 70724],
                [70726, 70726],
                [70750, 70750],
                [70835, 70840],
                [70842, 70842],
                [70847, 70848],
                [70850, 70851],
                [71090, 71093],
                [71100, 71101],
                [71103, 71104],
                [71132, 71133],
                [71219, 71226],
                [71229, 71229],
                [71231, 71232],
                [71339, 71339],
                [71341, 71341],
                [71344, 71349],
                [71351, 71351],
                [71453, 71455],
                [71458, 71461],
                [71463, 71467],
                [71727, 71735],
                [71737, 71738],
                [72148, 72151],
                [72154, 72155],
                [72160, 72160],
                [72193, 72202],
                [72243, 72248],
                [72251, 72254],
                [72263, 72263],
                [72273, 72278],
                [72281, 72283],
                [72330, 72342],
                [72344, 72345],
                [72752, 72758],
                [72760, 72765],
                [72767, 72767],
                [72850, 72871],
                [72874, 72880],
                [72882, 72883],
                [72885, 72886],
                [73009, 73014],
                [73018, 73018],
                [73020, 73021],
                [73023, 73029],
                [73031, 73031],
                [73104, 73105],
                [73109, 73109],
                [73111, 73111],
                [73459, 73460],
                [78896, 78904],
                [92912, 92916],
                [92976, 92982],
                [94031, 94031],
                [94095, 94098],
                [113821, 113822],
                [113824, 113827],
                [119143, 119145],
                [119155, 119170],
                [119173, 119179],
                [119210, 119213],
                [119362, 119364],
                [121344, 121398],
                [121403, 121452],
                [121461, 121461],
                [121476, 121476],
                [121499, 121503],
                [121505, 121519],
                [122880, 122886],
                [122888, 122904],
                [122907, 122913],
                [122915, 122916],
                [122918, 122922],
                [123184, 123190],
                [123628, 123631],
                [125136, 125142],
                [125252, 125258],
                [917505, 917505],
                [917536, 917631],
                [917760, 917999],
              ],
              d = [
                [4352, 4447],
                [8986, 8987],
                [9001, 9002],
                [9193, 9196],
                [9200, 9200],
                [9203, 9203],
                [9725, 9726],
                [9748, 9749],
                [9800, 9811],
                [9855, 9855],
                [9875, 9875],
                [9889, 9889],
                [9898, 9899],
                [9917, 9918],
                [9924, 9925],
                [9934, 9934],
                [9940, 9940],
                [9962, 9962],
                [9970, 9971],
                [9973, 9973],
                [9978, 9978],
                [9981, 9981],
                [9989, 9989],
                [9994, 9995],
                [10024, 10024],
                [10060, 10060],
                [10062, 10062],
                [10067, 10069],
                [10071, 10071],
                [10133, 10135],
                [10160, 10160],
                [10175, 10175],
                [11035, 11036],
                [11088, 11088],
                [11093, 11093],
                [11904, 11929],
                [11931, 12019],
                [12032, 12245],
                [12272, 12283],
                [12288, 12329],
                [12334, 12350],
                [12353, 12438],
                [12443, 12543],
                [12549, 12591],
                [12593, 12686],
                [12688, 12730],
                [12736, 12771],
                [12784, 12830],
                [12832, 12871],
                [12880, 19903],
                [19968, 42124],
                [42128, 42182],
                [43360, 43388],
                [44032, 55203],
                [63744, 64255],
                [65040, 65049],
                [65072, 65106],
                [65108, 65126],
                [65128, 65131],
                [65281, 65376],
                [65504, 65510],
              ],
              v = [
                [94176, 94179],
                [94208, 100343],
                [100352, 101106],
                [110592, 110878],
                [110928, 110930],
                [110948, 110951],
                [110960, 111355],
                [126980, 126980],
                [127183, 127183],
                [127374, 127374],
                [127377, 127386],
                [127488, 127490],
                [127504, 127547],
                [127552, 127560],
                [127568, 127569],
                [127584, 127589],
                [127744, 127776],
                [127789, 127797],
                [127799, 127868],
                [127870, 127891],
                [127904, 127946],
                [127951, 127955],
                [127968, 127984],
                [127988, 127988],
                [127992, 128062],
                [128064, 128064],
                [128066, 128252],
                [128255, 128317],
                [128331, 128334],
                [128336, 128359],
                [128378, 128378],
                [128405, 128406],
                [128420, 128420],
                [128507, 128591],
                [128640, 128709],
                [128716, 128716],
                [128720, 128722],
                [128725, 128725],
                [128747, 128748],
                [128756, 128762],
                [128992, 129003],
                [129293, 129393],
                [129395, 129398],
                [129402, 129442],
                [129445, 129450],
                [129454, 129482],
                [129485, 129535],
                [129648, 129651],
                [129656, 129658],
                [129664, 129666],
                [129680, 129685],
                [131072, 196605],
                [196608, 262141],
              ];
            let w;
            function p(c, n) {
              let s,
                o = 0,
                _ = n.length - 1;
              if (c < n[0][0] || c > n[_][1]) return !1;
              for (; _ >= o; )
                if (((s = (o + _) >> 1), c > n[s][1])) o = s + 1;
                else {
                  if (!(c < n[s][0])) return !0;
                  _ = s - 1;
                }
              return !1;
            }
            a.UnicodeV11 = class {
              constructor() {
                if (((this.version = '11'), !w)) {
                  ((w = new Uint8Array(65536)),
                  w.fill(1),
                  (w[0] = 0),
                  w.fill(0, 1, 32),
                  w.fill(0, 127, 160));
                  for (let c = 0; c < g.length; ++c)
                    w.fill(0, g[c][0], g[c][1] + 1);
                  for (let c = 0; c < d.length; ++c)
                    w.fill(2, d[c][0], d[c][1] + 1);
                }
              }
              wcwidth(c) {
                return c < 32
                  ? 0
                  : c < 127
                    ? 1
                    : c < 65536
                      ? w[c]
                      : p(c, u)
                        ? 0
                        : p(c, v)
                          ? 2
                          : 1;
              }
              charProperties(c, n) {
                let s = this.wcwidth(c),
                  o = s === 0 && n !== 0;
                if (o) {
                  const _ = f.UnicodeService.extractWidth(n);
                  _ === 0 ? (o = !1) : _ > s && (s = _);
                }
                return f.UnicodeService.createPropertyValue(0, s, o);
              }
            };
          },
          345: (y, a) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.runAndSubscribe = a.forwardEvent = a.EventEmitter = void 0),
            (a.EventEmitter = class {
              constructor() {
                ((this._listeners = []), (this._disposed = !1));
              }
              get event() {
                return (
                  this._event ||
                      (this._event = (l) => (
                        this._listeners.push(l),
                        {
                          dispose: () => {
                            if (!this._disposed) {
                              for (let f = 0; f < this._listeners.length; f++)
                                if (this._listeners[f] === l)
                                  return void this._listeners.splice(f, 1);
                            }
                          },
                        }
                      )),
                  this._event
                );
              }
              fire(l, f) {
                const g = [];
                for (let u = 0; u < this._listeners.length; u++)
                  g.push(this._listeners[u]);
                for (let u = 0; u < g.length; u++) g[u].call(void 0, l, f);
              }
              dispose() {
                (this.clearListeners(), (this._disposed = !0));
              }
              clearListeners() {
                this._listeners && (this._listeners.length = 0);
              }
            }),
            (a.forwardEvent = function (l, f) {
              return l((g) => f.fire(g));
            }),
            (a.runAndSubscribe = function (l, f) {
              return (f(void 0), l((g) => f(g)));
            }));
          },
          490: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.UnicodeV6 = void 0));
            const f = l(938),
              g = [
                [768, 879],
                [1155, 1158],
                [1160, 1161],
                [1425, 1469],
                [1471, 1471],
                [1473, 1474],
                [1476, 1477],
                [1479, 1479],
                [1536, 1539],
                [1552, 1557],
                [1611, 1630],
                [1648, 1648],
                [1750, 1764],
                [1767, 1768],
                [1770, 1773],
                [1807, 1807],
                [1809, 1809],
                [1840, 1866],
                [1958, 1968],
                [2027, 2035],
                [2305, 2306],
                [2364, 2364],
                [2369, 2376],
                [2381, 2381],
                [2385, 2388],
                [2402, 2403],
                [2433, 2433],
                [2492, 2492],
                [2497, 2500],
                [2509, 2509],
                [2530, 2531],
                [2561, 2562],
                [2620, 2620],
                [2625, 2626],
                [2631, 2632],
                [2635, 2637],
                [2672, 2673],
                [2689, 2690],
                [2748, 2748],
                [2753, 2757],
                [2759, 2760],
                [2765, 2765],
                [2786, 2787],
                [2817, 2817],
                [2876, 2876],
                [2879, 2879],
                [2881, 2883],
                [2893, 2893],
                [2902, 2902],
                [2946, 2946],
                [3008, 3008],
                [3021, 3021],
                [3134, 3136],
                [3142, 3144],
                [3146, 3149],
                [3157, 3158],
                [3260, 3260],
                [3263, 3263],
                [3270, 3270],
                [3276, 3277],
                [3298, 3299],
                [3393, 3395],
                [3405, 3405],
                [3530, 3530],
                [3538, 3540],
                [3542, 3542],
                [3633, 3633],
                [3636, 3642],
                [3655, 3662],
                [3761, 3761],
                [3764, 3769],
                [3771, 3772],
                [3784, 3789],
                [3864, 3865],
                [3893, 3893],
                [3895, 3895],
                [3897, 3897],
                [3953, 3966],
                [3968, 3972],
                [3974, 3975],
                [3984, 3991],
                [3993, 4028],
                [4038, 4038],
                [4141, 4144],
                [4146, 4146],
                [4150, 4151],
                [4153, 4153],
                [4184, 4185],
                [4448, 4607],
                [4959, 4959],
                [5906, 5908],
                [5938, 5940],
                [5970, 5971],
                [6002, 6003],
                [6068, 6069],
                [6071, 6077],
                [6086, 6086],
                [6089, 6099],
                [6109, 6109],
                [6155, 6157],
                [6313, 6313],
                [6432, 6434],
                [6439, 6440],
                [6450, 6450],
                [6457, 6459],
                [6679, 6680],
                [6912, 6915],
                [6964, 6964],
                [6966, 6970],
                [6972, 6972],
                [6978, 6978],
                [7019, 7027],
                [7616, 7626],
                [7678, 7679],
                [8203, 8207],
                [8234, 8238],
                [8288, 8291],
                [8298, 8303],
                [8400, 8431],
                [12330, 12335],
                [12441, 12442],
                [43014, 43014],
                [43019, 43019],
                [43045, 43046],
                [64286, 64286],
                [65024, 65039],
                [65056, 65059],
                [65279, 65279],
                [65529, 65531],
              ],
              u = [
                [68097, 68099],
                [68101, 68102],
                [68108, 68111],
                [68152, 68154],
                [68159, 68159],
                [119143, 119145],
                [119155, 119170],
                [119173, 119179],
                [119210, 119213],
                [119362, 119364],
                [917505, 917505],
                [917536, 917631],
                [917760, 917999],
              ];
            let d;
            a.UnicodeV6 = class {
              constructor() {
                if (((this.version = '6'), !d)) {
                  ((d = new Uint8Array(65536)),
                  d.fill(1),
                  (d[0] = 0),
                  d.fill(0, 1, 32),
                  d.fill(0, 127, 160),
                  d.fill(2, 4352, 4448),
                  (d[9001] = 2),
                  (d[9002] = 2),
                  d.fill(2, 11904, 42192),
                  (d[12351] = 1),
                  d.fill(2, 44032, 55204),
                  d.fill(2, 63744, 64256),
                  d.fill(2, 65040, 65050),
                  d.fill(2, 65072, 65136),
                  d.fill(2, 65280, 65377),
                  d.fill(2, 65504, 65511));
                  for (let v = 0; v < g.length; ++v)
                    d.fill(0, g[v][0], g[v][1] + 1);
                }
              }
              wcwidth(v) {
                return v < 32
                  ? 0
                  : v < 127
                    ? 1
                    : v < 65536
                      ? d[v]
                      : (function (w, p) {
                        let c,
                          n = 0,
                          s = p.length - 1;
                        if (w < p[0][0] || w > p[s][1]) return !1;
                        for (; s >= n; )
                          if (((c = (n + s) >> 1), w > p[c][1])) n = c + 1;
                          else {
                            if (!(w < p[c][0])) return !0;
                            s = c - 1;
                          }
                        return !1;
                      })(v, u)
                        ? 0
                        : (v >= 131072 && v <= 196605) ||
                            (v >= 196608 && v <= 262141)
                          ? 2
                          : 1;
              }
              charProperties(v, w) {
                let p = this.wcwidth(v),
                  c = p === 0 && w !== 0;
                if (c) {
                  const n = f.UnicodeService.extractWidth(w);
                  n === 0 ? (c = !1) : n > p && (p = n);
                }
                return f.UnicodeService.createPropertyValue(0, p, c);
              }
            };
          },
          938: (y, a, l) => {
            (Object.defineProperty(a, '__esModule', { value: !0 }),
            (a.UnicodeService = void 0));
            const f = l(345),
              g = l(490);
            class u {
              static extractShouldJoin(v) {
                return (1 & v) != 0;
              }
              static extractWidth(v) {
                return (v >> 1) & 3;
              }
              static extractCharKind(v) {
                return v >> 3;
              }
              static createPropertyValue(v, w, p = !1) {
                return ((16777215 & v) << 3) | ((3 & w) << 1) | (p ? 1 : 0);
              }
              constructor() {
                ((this._providers = Object.create(null)),
                (this._active = ''),
                (this._onChange = new f.EventEmitter()),
                (this.onChange = this._onChange.event));
                const v = new g.UnicodeV6();
                (this.register(v),
                (this._active = v.version),
                (this._activeProvider = v));
              }
              dispose() {
                this._onChange.dispose();
              }
              get versions() {
                return Object.keys(this._providers);
              }
              get activeVersion() {
                return this._active;
              }
              set activeVersion(v) {
                if (!this._providers[v])
                  throw new Error(`unknown Unicode version "${v}"`);
                ((this._active = v),
                (this._activeProvider = this._providers[v]),
                this._onChange.fire(v));
              }
              register(v) {
                this._providers[v.version] = v;
              }
              wcwidth(v) {
                return this._activeProvider.wcwidth(v);
              }
              getStringCellWidth(v) {
                let w = 0,
                  p = 0;
                const c = v.length;
                for (let n = 0; n < c; ++n) {
                  let s = v.charCodeAt(n);
                  if (55296 <= s && s <= 56319) {
                    if (++n >= c) return w + this.wcwidth(s);
                    const C = v.charCodeAt(n);
                    56320 <= C && C <= 57343
                      ? (s = 1024 * (s - 55296) + C - 56320 + 65536)
                      : (w += this.wcwidth(C));
                  }
                  const o = this.charProperties(s, p);
                  let _ = u.extractWidth(o);
                  (u.extractShouldJoin(o) && (_ -= u.extractWidth(p)),
                  (w += _),
                  (p = o));
                }
                return w;
              }
              charProperties(v, w) {
                return this._activeProvider.charProperties(v, w);
              }
            }
            a.UnicodeService = u;
          },
        },
        i = {};
      function h(y) {
        var a = i[y];
        if (a !== void 0) return a.exports;
        var l = (i[y] = { exports: {} });
        return (r[y](l, l.exports, h), l.exports);
      }
      var m = {};
      return (
        (() => {
          var y = m;
          (Object.defineProperty(y, '__esModule', { value: !0 }),
          (y.Unicode11Addon = void 0));
          const a = h(433);
          y.Unicode11Addon = class {
            activate(l) {
              l.unicode.register(new a.UnicodeV11());
            }
            dispose() {}
          };
        })(),
        m
      );
    })()
  );
})(Fh);
var kf = Fh.exports;
function Lf({
  onCommand: e,
  onData: t,
  className: r = '',
  theme: i = 'mermaid',
  enableWebLinks: h = !0,
  enableSearch: m = !0,
  enableUnicode: y = !0,
}) {
  const a = ie.useRef(null),
    l = ie.useRef(null),
    f = ie.useRef(null),
    [g, u] = ie.useState(!1),
    [d, v] = ie.useState([]),
    [w, p] = ie.useState(-1),
    [c, n] = ie.useState(''),
    s = {
      mermaid: {
        background: '#001122',
        foreground: '#e0f7ff',
        cursor: '#00d4ff',
        selection: '#00d4ff33',
        black: '#000000',
        red: '#ff6b9d',
        green: '#00ff88',
        yellow: '#ffd700',
        blue: '#00d4ff',
        magenta: '#ff6b9d',
        cyan: '#00d4ff',
        white: '#e0f7ff',
        brightBlack: '#4a4a4a',
        brightRed: '#ff8a80',
        brightGreen: '#4caf50',
        brightYellow: '#ffeb3b',
        brightBlue: '#2196f3',
        brightMagenta: '#e91e63',
        brightCyan: '#00bcd4',
        brightWhite: '#ffffff',
      },
      racecar: {
        background: '#1a1a1a',
        foreground: '#ffffff',
        cursor: '#ff0000',
        selection: '#ff000033',
        black: '#000000',
        red: '#ff0000',
        green: '#00ff00',
        yellow: '#ffff00',
        blue: '#0000ff',
        magenta: '#ff00ff',
        cyan: '#00ffff',
        white: '#ffffff',
        brightBlack: '#4a4a4a',
        brightRed: '#ff6666',
        brightGreen: '#66ff66',
        brightYellow: '#ffff66',
        brightBlue: '#6666ff',
        brightMagenta: '#ff66ff',
        brightCyan: '#66ffff',
        brightWhite: '#ffffff',
      },
    };
  ie.useEffect(() => {
    if (!a.current) return;
    const z = new Cf.Terminal({
        theme: s[i] || s.mermaid,
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
        cursorBlink: !0,
        cursorStyle: 'block',
        scrollback: 1e3,
        tabStopWidth: 4,
        bellStyle: 'none',
        allowTransparency: !0,
        allowProposedApi: !0,
      }),
      M = new bf.FitAddon();
    if ((z.loadAddon(M), (f.current = M), h)) {
      const j = new xf.WebLinksAddon();
      z.loadAddon(j);
    }
    if (m) {
      const j = new Ef.SearchAddon();
      z.loadAddon(j);
    }
    if (y) {
      const j = new kf.Unicode11Addon();
      (z.loadAddon(j), (z.unicode.activeVersion = '11'));
    }
    (z.open(a.current),
    f.current.fit(),
    z.onData(o),
    z.onKey(_),
    (l.current = z),
    u(!0),
    z.writeln('\x1B[36m🧜\x1B[0m Welcome to RinaWarp Terminal Pro!'),
    z.writeln(
      '\x1B[33mType "help" for available commands or start typing to chat with Rina!\x1B[0m'
    ),
    z.write(`\r
$ `));
    const L = () => {
      f.current && f.current.fit();
    };
    return (
      window.addEventListener('resize', L),
      () => {
        (window.removeEventListener('resize', L), z.dispose());
      }
    );
  }, [i, h, m, y]);
  const o = (z) => {
      if (!l.current) return;
      l.current;
      const M = z.charCodeAt(0);
      M === 13
        ? C()
        : M === 127
          ? b()
          : M === 9
            ? x()
            : M === 27
              ? S()
              : M === 3
                ? k()
                : M === 12
                  ? T()
                  : M >= 32 && M <= 126
                    ? H(z)
                    : M === 27 && z.length > 1 && W(z);
    },
    _ = (z, M) => {
      if (M.ctrlKey)
        switch (z.key) {
        case 'c':
          (M.preventDefault(), k());
          break;
        case 'l':
          (M.preventDefault(), T());
          break;
        case 'u':
          (M.preventDefault(), B());
          break;
        case 'k':
          (M.preventDefault(), O());
          break;
        case 'r':
          (M.preventDefault(), A());
          break;
        }
    },
    C = () => {
      if (!l.current) return;
      const z = l.current,
        M = c.trim();
      (M ? (v((L) => [...L, M]), p(-1), z.writeln(''), D(M)) : z.writeln(''),
      z.write('$ '),
      n(''));
    },
    b = () => {
      c.length > 0 && (n((z) => z.slice(0, -1)), l.current.write('\b \b'));
    },
    x = () => {
      const z = G(c);
      z.length === 1 ? I(z[0]) : z.length > 1 && E(z);
    },
    S = () => {
      c.length > 0 && (l.current.write('\r\x1B[K$ '), n(''));
    },
    k = () => {
      (l.current.write(`^C\r
$ `),
      n(''));
    },
    T = () => {
      (l.current.clear(), l.current.write('$ '));
    },
    B = () => {
      c.length > 0 && (l.current.write('\r\x1B[K$ '), n(''));
    },
    O = () => {
      c.length > 0 && (l.current.write('\x1B[K'), n(''));
    },
    A = () => {
      R();
    },
    H = (z) => {
      (n((M) => M + z), l.current.write(z));
    },
    W = (z) => {
      z === '\x1B[A' ? $(-1) : z === '\x1B[B' && $(1);
    },
    $ = (z) => {
      if (d.length === 0) return;
      let M = w + z;
      if (
        (M < 0 ? (M = d.length - 1) : M >= d.length && (M = -1),
        p(M),
        l.current.write('\r\x1B[K$ '),
        M >= 0)
      ) {
        const L = d[d.length - 1 - M];
        (n(L), l.current.write(L));
      } else n('');
    },
    G = (z) =>
      [
        'ls',
        'cd',
        'pwd',
        'mkdir',
        'rm',
        'cp',
        'mv',
        'git',
        'npm',
        'node',
        'python',
        'python3',
        'cat',
        'grep',
        'find',
        'ps',
        'top',
        'htop',
        'curl',
        'wget',
        'ssh',
        'scp',
        'rsync',
      ].filter((L) => L.toLowerCase().startsWith(z.toLowerCase())),
    I = (z) => {
      const M = z.slice(c.length);
      (n(z), l.current.write(M));
    },
    E = (z) => {
      (l.current.writeln(''),
      z.forEach((M) => {
        l.current.writeln(`  ${M}`);
      }),
      l.current.write('$ ' + c));
    },
    R = () => {
      l.current.writeln(`\r
Search history (type to search):`);
    },
    D = async (z) => {
      if (!l.current) return;
      const M = l.current;
      if (z === 'help') P();
      else if (z === 'clear') M.clear();
      else if (z === 'history') F();
      else if (z.startsWith('cd ')) U(z);
      else if (z.startsWith('ls')) Y();
      else if (e)
        try {
          const L = await e(z);
          L && M.writeln(L);
        } catch (L) {
          M.writeln(`\x1B[31mError: ${L.message}\x1B[0m`);
        }
    },
    P = () => {
      const z = l.current;
      (z.writeln('\x1B[36mAvailable commands:\x1B[0m'),
      z.writeln('  help     - Show this help message'),
      z.writeln('  clear    - Clear the terminal'),
      z.writeln('  history  - Show command history'),
      z.writeln('  cd <dir> - Change directory'),
      z.writeln('  ls       - List files'),
      z.writeln('  Type any other command to chat with Rina!'));
    },
    F = () => {
      const z = l.current;
      (z.writeln('\x1B[36mCommand History:\x1B[0m'),
      d.slice(-10).forEach((M, L) => {
        z.writeln(`  ${d.length - 10 + L + 1}: ${M}`);
      }));
    },
    U = (z) => {
      const M = l.current,
        L = z.split(' ')[1];
      M.writeln(`\x1B[33mChanging directory to: ${L || 'home'}\x1B[0m`);
    },
    Y = (z) => {
      const M = l.current;
      (M.writeln('\x1B[36mDirectory listing:\x1B[0m'),
      M.writeln('  📁 src/'),
      M.writeln('  📁 public/'),
      M.writeln('  📄 package.json'),
      M.writeln('  📄 README.md'));
    };
  return K.jsx('div', {
    className: `advanced-terminal ${r}`,
    children: K.jsx('div', {
      ref: a,
      className: 'w-full h-full',
      style: { minHeight: '400px', background: 'transparent' },
    }),
  });
}
function yl({ title: e, subtitle: t, children: r, className: i = '' }) {
  return K.jsxs('div', {
    className: `bg-gradient-to-r from-mermaid-cyan/10 via-mermaid-coral/10 to-mermaid-seaweed/10 
                     border-2 border-mermaid-cyan rounded-2xl shadow-glow animate-glow 
                     relative overflow-hidden ${i}`,
    children: [
      K.jsx('div', {
        className:
          'absolute top-0 left-0 w-full h-full bg-shimmer animate-shimmer opacity-20',
      }),
      K.jsxs('div', {
        className: 'relative z-10 p-6',
        children: [
          K.jsx('h2', {
            className: `text-3xl font-bold bg-gradient-to-r from-mermaid-cyan via-mermaid-coral to-mermaid-seaweed 
                       bg-clip-text text-transparent animate-shimmer text-shadow-glow`,
            children: e,
          }),
          t &&
            K.jsx('p', {
              className: 'text-mermaid-cyan/80 mt-2 text-lg',
              children: t,
            }),
          r,
        ],
      }),
    ],
  });
}
function Df({ logs: e, className: t = '' }) {
  return K.jsx('div', {
    className: `bg-mermaid-ocean/80 backdrop-blur-md border border-mermaid-cyan/30 
                     rounded-xl shadow-glow overflow-y-auto max-h-96 ${t}`,
    children: K.jsx('div', {
      className: 'p-4 space-y-1',
      children: e.map((r, i) =>
        K.jsx(
          'div',
          {
            className: 'text-mermaid-text font-mono text-sm leading-relaxed',
            children: r,
          },
          i
        )
      ),
    }),
  });
}
function Rf({
  value: e,
  onChange: t,
  onKeyDown: r,
  placeholder: i = 'Type a command...',
  suggestions: h = [],
  showSuggestions: m = !1,
  selectedSuggestion: y = 0,
  onSuggestionSelect: a,
  className: l = '',
}) {
  return K.jsxs('div', {
    className: `relative ${l}`,
    children: [
      K.jsxs('div', {
        className: `bg-gradient-to-r from-mermaid-coral/10 to-mermaid-seaweed/10 
                      border-2 border-mermaid-coral rounded-full shadow-coral-glow 
                      animate-breathe flex items-center px-6 py-3`,
        children: [
          K.jsx('span', {
            className: 'text-mermaid-cyan mr-3 text-lg font-bold',
            children: '>',
          }),
          K.jsx('input', {
            value: e,
            onChange: t,
            onKeyDown: r,
            className: `flex-1 bg-transparent text-mermaid-text font-mono 
                     placeholder-mermaid-cyan/60 focus:outline-none text-shadow-glow`,
            placeholder: i,
            autoFocus: !0,
          }),
        ],
      }),
      m &&
        h.length > 0 &&
        K.jsx('div', {
          className: `absolute top-full left-6 right-0 mt-2 bg-mermaid-ocean/95 
                        border-2 border-mermaid-seaweed rounded-2xl shadow-seaweed-glow 
                        backdrop-blur-lg max-h-48 overflow-y-auto z-50`,
          children: h.map((f, g) =>
            K.jsxs(
              'div',
              {
                onClick: () => (a == null ? void 0 : a(g)),
                className: `p-4 cursor-pointer transition-all duration-300 rounded-xl mx-2 my-1
                         ${g === y ? 'bg-gradient-to-r from-mermaid-seaweed to-mermaid-cyan text-mermaid-ocean scale-105 shadow-seaweed-glow' : 'hover:bg-mermaid-seaweed/20 hover:translate-x-2 hover:shadow-seaweed-glow/30'}`,
                children: [
                  K.jsx('div', {
                    className: 'font-bold text-sm mb-1',
                    children: f.command,
                  }),
                  K.jsx('div', {
                    className: 'text-xs opacity-80',
                    children: f.explanation,
                  }),
                  K.jsxs('div', {
                    className: 'text-xs opacity-60 mt-1',
                    children: [
                      'Confidence: ',
                      f.confidence,
                      '/10 • ',
                      f.category,
                    ],
                  }),
                ],
              },
              g
            )
          ),
        }),
    ],
  });
}
function nr({
  title: e,
  value: t,
  unit: r,
  icon: i,
  color: h = 'cyan',
  className: m = '',
}) {
  const y = {
    cyan: 'border-mermaid-cyan shadow-glow',
    coral: 'border-mermaid-coral shadow-coral-glow',
    seaweed: 'border-mermaid-seaweed shadow-seaweed-glow',
    gold: 'border-mermaid-gold shadow-glow',
  };
  return K.jsxs('div', {
    className: `bg-mermaid-ocean/80 backdrop-blur-md border-2 ${y[h]} 
                     rounded-2xl p-6 text-center transition-all duration-300 
                     hover:scale-105 hover:shadow-glow-lg animate-float ${m}`,
    children: [
      K.jsx('div', { className: 'text-2xl mb-2', children: i }),
      K.jsx('h3', {
        className: 'text-mermaid-cyan font-bold text-lg mb-2',
        children: e,
      }),
      K.jsxs('div', {
        className: 'text-4xl font-bold text-mermaid-gold mb-1',
        children: [
          t,
          r &&
            K.jsx('span', {
              className: 'text-xl text-mermaid-text/80',
              children: r,
            }),
        ],
      }),
    ],
  });
}
function Ze({
  children: e,
  onClick: t,
  variant: r = 'primary',
  size: i = 'md',
  disabled: h = !1,
  className: m = '',
}) {
  const y = {
      primary:
        'bg-gradient-to-r from-mermaid-cyan to-mermaid-coral text-mermaid-ocean',
      secondary:
        'bg-gradient-to-r from-mermaid-seaweed to-mermaid-cyan text-mermaid-ocean',
      accent:
        'bg-gradient-to-r from-mermaid-gold to-mermaid-coral text-mermaid-ocean',
      ghost:
        'bg-transparent border-2 border-mermaid-cyan text-mermaid-cyan hover:bg-mermaid-cyan/10',
    },
    a = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };
  return K.jsxs('button', {
    onClick: t,
    disabled: h,
    className: `${y[r]} ${a[i]} font-bold rounded-2xl 
                  shadow-glow hover:shadow-glow-lg transition-all duration-300 
                  hover:scale-105 active:scale-95 relative overflow-hidden
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  ${m}`,
    children: [
      K.jsx('div', {
        className: `absolute top-0 left-0 w-full h-full bg-shimmer animate-shimmer opacity-0 
                      hover:opacity-30 transition-opacity duration-300`,
      }),
      K.jsx('span', { className: 'relative z-10', children: e }),
    ],
  });
}
function wl({ currentTheme: e, onThemeChange: t, className: r = '' }) {
  const i = [
    { id: 'mermaid', name: 'Mermaid', icon: '🧜‍♀️' },
    { id: 'mermaid-enhanced', name: '🌊 Mermaid Enhanced', icon: '🌊' },
    { id: 'racecar', name: 'Racecar', icon: '🏎️' },
  ];
  return K.jsxs('div', {
    className: `bg-gradient-to-br from-mermaid-coral/10 to-mermaid-seaweed/10 
                     border-2 border-mermaid-coral rounded-2xl p-6 shadow-coral-glow ${r}`,
    children: [
      K.jsx('h3', {
        className: 'text-mermaid-text text-xl font-bold text-center mb-4',
        children: 'Choose Your Theme',
      }),
      K.jsx('div', {
        className: 'flex gap-4 justify-center flex-wrap',
        children: i.map((h) =>
          K.jsxs(
            Ze,
            {
              onClick: () => t(h.id),
              variant: e === h.id ? 'accent' : 'ghost',
              size: 'md',
              className: 'min-w-32',
              children: [
                K.jsx('span', { className: 'mr-2', children: h.icon }),
                h.name,
              ],
            },
            h.id
          )
        ),
      }),
    ],
  });
}
function Tf({ count: e = 15, className: t = '' }) {
  return K.jsx('div', {
    className: `absolute top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden z-0 ${t}`,
    children: Array.from({ length: e }).map((r, i) =>
      K.jsx(
        'div',
        {
          className: 'absolute text-mermaid-bubble animate-float',
          style: {
            left: `${Math.random() * 100}%`,
            bottom: '-50px',
            fontSize: `${Math.random() * 20 + 10}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 10}s`,
            opacity: Math.random() * 0.5 + 0.3,
          },
          children: '🫧',
        },
        i
      )
    ),
  });
}
function Af() {
  const [e, t] = ie.useState([
      '🤖 Enhanced Agent Mode enabled',
      'Type !help to see all available commands',
      'Try typing a command for AI suggestions!',
    ]),
    [r, i] = ie.useState(''),
    [h, m] = ie.useState({ cpu: 0, ram: 0, net: 0 }),
    [y, a] = ie.useState(!0),
    [l, f] = ie.useState('groq'),
    [g, u] = ie.useState([]),
    [d, v] = ie.useState(!1),
    [w, p] = ie.useState(!1),
    [c, n] = ie.useState(''),
    [s, o] = ie.useState([]),
    [_, C] = ie.useState(!1),
    [b, x] = ie.useState(0),
    [S, k] = ie.useState('mermaid-enhanced'),
    [T, B] = ie.useState(!1),
    [O, A] = ie.useState([]),
    H = new yf(),
    W = new wf();
  ie.useEffect(() => {
    (Sf(),
    Yr(S),
    (async () => {
      try {
        const U = await (
          await fetch('https://api.rinawarptech.com/api/providers')
        ).json();
        (u(U.providers), U.providers.length > 0 && f(U.providers[0].id));
      } catch (F) {
        console.log('Could not load AI providers:', F);
      }
    })());
    const P = setInterval(() => {
      m({
        cpu: Math.random() * 100,
        ram: Math.random() * 100,
        net: Math.floor(Math.random() * 1e4),
      });
    }, 2e3);
    return () => clearInterval(P);
  }, [S]);
  const $ = async (D) => {
      const P = D.target.value;
      if ((i(P), P.trim().length > 2))
        try {
          const F = await H.predictCommand(P, {
            currentDirectory: window.location.pathname,
            recentCommands: e.filter((U) => U.startsWith('>')).slice(-5),
            systemInfo: h,
          });
          (o(F.suggestions || []), C(!0), x(0));
        } catch (F) {
          (console.log('Prediction error:', F), C(!1));
        }
      else C(!1);
    },
    G = async () => {
      if (!r.trim()) return;
      const D = r;
      if (
        (t((P) => [...P, `> ${D}`]),
        i(''),
        C(!1),
        H.learnFromCommand(D, !0, { category: 'user' }),
        D.startsWith('!help'))
      ) {
        t((P) => [
          ...P,
          '📋 Enhanced Commands Available:',
          '  !help - Show this help',
          '  !memory - Show memory summary',
          '  !recent - Show recent memory entries',
          '  !clear-memory - Clear Rina\'s memory',
          '  !explain <command> - Get detailed command explanation',
          '  !suggest - Get command suggestions',
          '  !theme <name> - Change theme',
          '  !terminal - Toggle advanced terminal mode',
          '  check cpu/ram - Show system stats',
          '  Type anything else to chat with Rina!',
        ]);
        return;
      }
      if (D.startsWith('!explain')) {
        const P = D.replace('!explain', '').trim();
        if (P)
          try {
            const F = await W.explainCommand(P);
            t((U) => [
              ...U,
              `📖 Command Explanation: ${F.command}`,
              `   ${F.explanation}`,
              ...F.examples.map((Y) => `   Example: ${Y}`),
              ...F.warnings.map((Y) => `   ⚠️ ${Y}`),
            ]);
          } catch {
            t((U) => [...U, '⚠️ Failed to get command explanation']);
          }
        else t((F) => [...F, 'Usage: !explain <command>']);
        return;
      }
      if (D.startsWith('!theme')) {
        const P = D.replace('!theme', '').trim() || 'mermaid-enhanced';
        (k(P), Yr(P), t((F) => [...F, `🎨 Theme changed to: ${P}`]));
        return;
      }
      if (D.startsWith('!terminal')) {
        (B(!T),
        t((P) => [
          ...P,
          `🖥️ Advanced terminal mode: ${T ? 'disabled' : 'enabled'}`,
        ]));
        return;
      }
      if (D.startsWith('!suggest')) {
        try {
          const P = W.getContextualSuggestions({
            currentDirectory: window.location.pathname,
            systemLoad: h.cpu / 100,
          });
          t((F) => [
            ...F,
            '💡 Command Suggestions:',
            ...P.map((U) => `   ${U}`),
          ]);
        } catch {
          t((F) => [...F, '⚠️ Failed to get suggestions']);
        }
        return;
      }
      if (D.toLowerCase().includes('cpu') || D.toLowerCase().includes('ram')) {
        t((P) => [
          ...P,
          '📊 System Stats:',
          `   CPU: ${h.cpu.toFixed(1)}%`,
          `   RAM: ${h.ram.toFixed(1)}%`,
          `   Network: ${(h.net / 1024).toFixed(1)} KB/s`,
        ]);
        return;
      }
      (p(!0), n(''), t((P) => [...P, '🤖 Rina: ']));
      try {
        const P = await fetch('https://api.rinawarptech.com/api/ai-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: D, provider: l, enableVoice: d }),
        });
        if (!P.ok) throw new Error(`HTTP error! status: ${P.status}`);
        const F = P.body.getReader(),
          U = new TextDecoder();
        let Y = '';
        for (;;) {
          const { done: z, value: M } = await F.read();
          if (z) break;
          Y += U.decode(M, { stream: !0 });
          const L = Y.split(`
`);
          Y = L.pop();
          for (const j of L)
            if (j.startsWith('data: ')) {
              const N = j.slice(6);
              N.trim() &&
                (n((X) => X + N),
                t((X) => {
                  const q = [...X];
                  return (
                    (q[q.length - 1] =
                      `🤖 Rina: ${X[X.length - 1].replace('🤖 Rina: ', '') + N}`),
                    q
                  );
                }));
            }
        }
      } catch {
        t((F) => [...F, '⚠️ Failed to reach Agent']);
      } finally {
        (p(!1), n(''));
      }
    },
    I = (D) => {
      s[D] && (i(s[D].command), C(!1));
    },
    E = (D) => {
      _ && s.length > 0
        ? D.key === 'ArrowDown'
          ? (D.preventDefault(), x((P) => (P < s.length - 1 ? P + 1 : 0)))
          : D.key === 'ArrowUp'
            ? (D.preventDefault(), x((P) => (P > 0 ? P - 1 : s.length - 1)))
            : D.key === 'Tab'
              ? (D.preventDefault(), I(b))
              : D.key === 'Escape' && C(!1)
        : D.key === 'Enter' && G();
    },
    R = async (D) => {
      if (D === 'help')
        return 'Available commands: help, clear, history, ls, cd, and more!';
      try {
        return (
          (
            await (
              await fetch('https://api.rinawarptech.com/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  prompt: D,
                  provider: l,
                  enableVoice: !1,
                }),
              })
            ).json()
          ).response || 'Command processed'
        );
      } catch (P) {
        return `Error: ${P.message}`;
      }
    };
  return y
    ? K.jsxs('div', {
      className:
          'terminal bg-ocean-gradient min-h-screen p-4 font-mono relative overflow-hidden',
      children: [
        K.jsx(Tf, { count: 20 }),
        K.jsx(yl, {
          title: '🧜‍♀️ RinaWarp Terminal Pro - Enhanced',
          subtitle: w
            ? '⚡ Streaming AI Response...'
            : 'AI-Powered Terminal with Advanced Features',
          className: 'mb-6',
          children: K.jsxs('div', {
            className: 'flex gap-4 items-center mt-4 flex-wrap',
            children: [
              g.length > 1 &&
                  K.jsx('select', {
                    value: l,
                    onChange: (D) => f(D.target.value),
                    className:
                      'bg-mermaid-ocean/80 text-mermaid-text border border-mermaid-cyan rounded-lg px-3 py-2 text-sm',
                    children: g.map((D) =>
                      K.jsx('option', { value: D.id, children: D.name }, D.id)
                    ),
                  }),
              K.jsx(Ze, {
                onClick: () => v(!d),
                variant: d ? 'accent' : 'ghost',
                size: 'sm',
                children: d ? '🎤 Voice ON' : '🔇 Voice OFF',
              }),
              K.jsx(Ze, {
                onClick: () => B(!T),
                variant: T ? 'accent' : 'ghost',
                size: 'sm',
                children: T ? '🖥️ Advanced Terminal' : '💬 Chat Mode',
              }),
              K.jsx(Ze, {
                onClick: () => a(!1),
                variant: 'secondary',
                size: 'sm',
                children: '📊 Dashboard',
              }),
            ],
          }),
        }),
        K.jsxs('div', {
          className: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
          children: [
            K.jsxs('div', {
              className: 'lg:col-span-2',
              children: [
                T
                  ? K.jsx('div', {
                    className:
                          'bg-mermaid-ocean/80 backdrop-blur-md border border-mermaid-cyan/30 rounded-xl shadow-glow h-96',
                    children: K.jsx(Lf, {
                      onCommand: R,
                      theme: S,
                      className: 'h-full',
                    }),
                  })
                  : K.jsx(Df, { logs: e, className: 'h-96' }),
                !T &&
                    K.jsx('div', {
                      className: 'mt-4',
                      children: K.jsx(Rf, {
                        value: r,
                        onChange: $,
                        onKeyDown: E,
                        placeholder: 'Ask the AI agent or type a command...',
                        suggestions: s,
                        showSuggestions: _,
                        selectedSuggestion: b,
                        onSuggestionSelect: I,
                      }),
                    }),
              ],
            }),
            K.jsxs('div', {
              className: 'space-y-6',
              children: [
                K.jsxs('div', {
                  className: 'grid grid-cols-1 gap-4',
                  children: [
                    K.jsx(nr, {
                      title: 'CPU Usage',
                      value: h.cpu.toFixed(1),
                      unit: '%',
                      icon: '⚡',
                      color: 'cyan',
                    }),
                    K.jsx(nr, {
                      title: 'RAM Usage',
                      value: h.ram.toFixed(1),
                      unit: '%',
                      icon: '🧠',
                      color: 'coral',
                    }),
                    K.jsx(nr, {
                      title: 'Network',
                      value: (h.net / 1024).toFixed(1),
                      unit: 'KB/s',
                      icon: '🌐',
                      color: 'seaweed',
                    }),
                  ],
                }),
                K.jsx(wl, {
                  currentTheme: S,
                  onThemeChange: (D) => {
                    (k(D), Yr(D));
                  },
                }),
                K.jsxs('div', {
                  className:
                      'bg-mermaid-ocean/80 backdrop-blur-md border border-mermaid-seaweed/30 rounded-xl p-4 shadow-seaweed-glow',
                  children: [
                    K.jsx('h3', {
                      className: 'text-mermaid-text font-bold mb-3',
                      children: 'Quick Actions',
                    }),
                    K.jsxs('div', {
                      className: 'space-y-2',
                      children: [
                        K.jsx(Ze, {
                          onClick: () =>
                            t((D) => [...D, '🧠 Memory cleared!']),
                          variant: 'ghost',
                          size: 'sm',
                          className: 'w-full',
                          children: '🧠 Clear Memory',
                        }),
                        K.jsx(Ze, {
                          onClick: () =>
                            t((D) => [...D, '📊 System stats updated']),
                          variant: 'ghost',
                          size: 'sm',
                          className: 'w-full',
                          children: '📊 Refresh Stats',
                        }),
                        K.jsx(Ze, {
                          onClick: () =>
                            t((D) => [...D, '🎨 Theme refreshed']),
                          variant: 'ghost',
                          size: 'sm',
                          className: 'w-full',
                          children: '🎨 Refresh Theme',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    })
    : K.jsx('div', {
      className: 'app bg-ocean-gradient min-h-screen p-6',
      children: K.jsxs('div', {
        className: 'max-w-7xl mx-auto',
        children: [
          K.jsx(yl, {
            title: 'RinaWarp Terminal Pro - Dashboard',
            subtitle: 'System Monitoring & Control Center',
            className: 'mb-8',
            children: K.jsx(Ze, {
              onClick: () => a(!0),
              variant: 'primary',
              size: 'lg',
              children: '🚀 Launch Agent Mode',
            }),
          }),
          K.jsxs('div', {
            className: 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-8',
            children: [
              K.jsx(nr, {
                title: 'CPU Usage',
                value: h.cpu.toFixed(1),
                unit: '%',
                icon: '⚡',
                color: 'cyan',
              }),
              K.jsx(nr, {
                title: 'RAM Usage',
                value: h.ram.toFixed(1),
                unit: '%',
                icon: '🧠',
                color: 'coral',
              }),
              K.jsx(nr, {
                title: 'Network',
                value: (h.net / 1024).toFixed(1),
                unit: 'KB/s',
                icon: '🌐',
                color: 'seaweed',
              }),
            ],
          }),
          K.jsx(wl, {
            currentTheme: S,
            onThemeChange: (D) => {
              (k(D), Yr(D));
            },
            className: 'mb-8',
          }),
          K.jsxs('div', {
            className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
            children: [
              K.jsxs('div', {
                className:
                    'bg-mermaid-ocean/80 backdrop-blur-md border border-mermaid-cyan/30 rounded-xl p-6 shadow-glow',
                children: [
                  K.jsx('h3', {
                    className: 'text-xl font-bold text-mermaid-cyan mb-3',
                    children: '🤖 AI Features',
                  }),
                  K.jsx('p', {
                    className: 'text-mermaid-text/80 mb-4',
                    children:
                        'Advanced AI integration with predictive completion and command explanation.',
                  }),
                  K.jsx(Ze, {
                    variant: 'primary',
                    size: 'sm',
                    children: 'Explore AI',
                  }),
                ],
              }),
              K.jsxs('div', {
                className:
                    'bg-mermaid-ocean/80 backdrop-blur-md border border-mermaid-coral/30 rounded-xl p-6 shadow-coral-glow',
                children: [
                  K.jsx('h3', {
                    className: 'text-xl font-bold text-mermaid-coral mb-3',
                    children: '🎨 Themes',
                  }),
                  K.jsx('p', {
                    className: 'text-mermaid-text/80 mb-4',
                    children:
                        'Beautiful underwater themes with glowing effects and animations.',
                  }),
                  K.jsx(Ze, {
                    variant: 'secondary',
                    size: 'sm',
                    children: 'View Themes',
                  }),
                ],
              }),
              K.jsxs('div', {
                className:
                    'bg-mermaid-ocean/80 backdrop-blur-md border border-mermaid-seaweed/30 rounded-xl p-6 shadow-seaweed-glow',
                children: [
                  K.jsx('h3', {
                    className: 'text-xl font-bold text-mermaid-seaweed mb-3',
                    children: '⚡ Terminal',
                  }),
                  K.jsx('p', {
                    className: 'text-mermaid-text/80 mb-4',
                    children:
                        'Advanced terminal features with XTerm integration and shortcuts.',
                  }),
                  K.jsx(Ze, {
                    variant: 'accent',
                    size: 'sm',
                    children: 'Open Terminal',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    });
}
function Pf() {
  return K.jsx(Af, {});
}
Cn.createRoot(document.getElementById('root')).render(
  K.jsx(su.StrictMode, { children: K.jsx(Pf, {}) })
);

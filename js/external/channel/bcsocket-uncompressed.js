(function(){
function e() {
  return function() {
  }
}
function m(a) {
  return function(b) {
    this[a] = b
  }
}
function aa(a) {
  return function() {
    return this[a]
  }
}
function ba(a) {
  return function() {
    return a
  }
}
var p, ca = ca || {}, q = this;
function da(a) {
  a = a.split(".");
  for(var b = q, c;c = a.shift();) {
    if(null != b[c]) {
      b = b[c]
    }else {
      return null
    }
  }
  return b
}
function ea() {
}
function fa(a) {
  var b = typeof a;
  if("object" == b) {
    if(a) {
      if(a instanceof Array) {
        return"array"
      }
      if(a instanceof Object) {
        return b
      }
      var c = Object.prototype.toString.call(a);
      if("[object Window]" == c) {
        return"object"
      }
      if("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) {
        return"array"
      }
      if("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) {
        return"function"
      }
    }else {
      return"null"
    }
  }else {
    if("function" == b && "undefined" == typeof a.call) {
      return"object"
    }
  }
  return b
}
function s(a) {
  return"array" == fa(a)
}
function ga(a) {
  var b = fa(a);
  return"array" == b || "object" == b && "number" == typeof a.length
}
function u(a) {
  return"string" == typeof a
}
function ha(a) {
  return"function" == fa(a)
}
function v(a) {
  return a[ia] || (a[ia] = ++ja)
}
var ia = "closure_uid_" + (1E9 * Math.random() >>> 0), ja = 0;
function ka(a, b, c) {
  return a.call.apply(a.bind, arguments)
}
function la(a, b, c) {
  if(!a) {
    throw Error();
  }
  if(2 < arguments.length) {
    var d = Array.prototype.slice.call(arguments, 2);
    return function() {
      var c = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(c, d);
      return a.apply(b, c)
    }
  }
  return function() {
    return a.apply(b, arguments)
  }
}
function w(a, b, c) {
  w = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? ka : la;
  return w.apply(null, arguments)
}
var x = Date.now || function() {
  return+new Date
};
function y(a, b) {
  function c() {
  }
  c.prototype = b.prototype;
  a.ra = b.prototype;
  a.prototype = new c
}
;function ma(a, b) {
  for(var c = 1;c < arguments.length;c++) {
    var d = String(arguments[c]).replace(/\$/g, "$$$$");
    a = a.replace(/\%s/, d)
  }
  return a
}
function na(a) {
  if(!oa.test(a)) {
    return a
  }
  -1 != a.indexOf("&") && (a = a.replace(pa, "&amp;"));
  -1 != a.indexOf("<") && (a = a.replace(qa, "&lt;"));
  -1 != a.indexOf(">") && (a = a.replace(ra, "&gt;"));
  -1 != a.indexOf('"') && (a = a.replace(sa, "&quot;"));
  return a
}
var pa = /&/g, qa = /</g, ra = />/g, sa = /\"/g, oa = /[&<>\"]/;
var z, ta, ua, va;
function wa() {
  return q.navigator ? q.navigator.userAgent : null
}
va = ua = ta = z = !1;
var xa;
if(xa = wa()) {
  var ya = q.navigator;
  z = 0 == xa.indexOf("Opera");
  ta = !z && -1 != xa.indexOf("MSIE");
  ua = !z && -1 != xa.indexOf("WebKit");
  va = !z && !ua && "Gecko" == ya.product
}
var za = z, A = ta, Aa = va, B = ua, Ba = q.navigator, Ca = -1 != (Ba && Ba.platform || "").indexOf("Mac");
function Da() {
  var a = q.document;
  return a ? a.documentMode : void 0
}
var Ea;
a: {
  var Fa = "", Ga;
  if(za && q.opera) {
    var Ha = q.opera.version, Fa = "function" == typeof Ha ? Ha() : Ha
  }else {
    if(Aa ? Ga = /rv\:([^\);]+)(\)|;)/ : A ? Ga = /MSIE\s+([^\);]+)(\)|;)/ : B && (Ga = /WebKit\/(\S+)/), Ga) {
      var Ia = Ga.exec(wa()), Fa = Ia ? Ia[1] : ""
    }
  }
  if(A) {
    var Ja = Da();
    if(Ja > parseFloat(Fa)) {
      Ea = String(Ja);
      break a
    }
  }
  Ea = Fa
}
var Ka = {};
function C(a) {
  var b;
  if(!(b = Ka[a])) {
    b = 0;
    for(var c = String(Ea).replace(/^[\s\xa0]+|[\s\xa0]+$/g, "").split("."), d = String(a).replace(/^[\s\xa0]+|[\s\xa0]+$/g, "").split("."), f = Math.max(c.length, d.length), g = 0;0 == b && g < f;g++) {
      var h = c[g] || "", n = d[g] || "", k = RegExp("(\\d*)(\\D*)", "g"), t = RegExp("(\\d*)(\\D*)", "g");
      do {
        var l = k.exec(h) || ["", "", ""], r = t.exec(n) || ["", "", ""];
        if(0 == l[0].length && 0 == r[0].length) {
          break
        }
        b = ((0 == l[1].length ? 0 : parseInt(l[1], 10)) < (0 == r[1].length ? 0 : parseInt(r[1], 10)) ? -1 : (0 == l[1].length ? 0 : parseInt(l[1], 10)) > (0 == r[1].length ? 0 : parseInt(r[1], 10)) ? 1 : 0) || ((0 == l[2].length) < (0 == r[2].length) ? -1 : (0 == l[2].length) > (0 == r[2].length) ? 1 : 0) || (l[2] < r[2] ? -1 : l[2] > r[2] ? 1 : 0)
      }while(0 == b)
    }
    b = Ka[a] = 0 <= b
  }
  return b
}
var La = q.document, Ma = La && A ? Da() || ("CSS1Compat" == La.compatMode ? parseInt(Ea, 10) : 5) : void 0;
function Na(a) {
  Error.captureStackTrace ? Error.captureStackTrace(this, Na) : this.stack = Error().stack || "";
  a && (this.message = String(a))
}
y(Na, Error);
Na.prototype.name = "CustomError";
function Oa(a, b) {
  b.unshift(a);
  Na.call(this, ma.apply(null, b));
  b.shift();
  this.Jc = a
}
y(Oa, Na);
Oa.prototype.name = "AssertionError";
function Pa(a, b) {
  throw new Oa("Failure" + (a ? ": " + a : ""), Array.prototype.slice.call(arguments, 1));
}
;var Qa = RegExp("^(?:([^:/?#.]+):)?(?://(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#(.*))?$");
function Ra(a) {
  var b = Sa, c;
  for(c in b) {
    a.call(void 0, b[c], c, b)
  }
}
function Ta(a) {
  var b = [], c = 0, d;
  for(d in a) {
    b[c++] = a[d]
  }
  return b
}
function Ua(a) {
  var b = [], c = 0, d;
  for(d in a) {
    b[c++] = d
  }
  return b
}
var Va = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
function Wa(a, b) {
  for(var c, d, f = 1;f < arguments.length;f++) {
    d = arguments[f];
    for(c in d) {
      a[c] = d[c]
    }
    for(var g = 0;g < Va.length;g++) {
      c = Va[g], Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c])
    }
  }
}
;var D = Array.prototype, Xa = D.indexOf ? function(a, b, c) {
  return D.indexOf.call(a, b, c)
} : function(a, b, c) {
  c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
  if(u(a)) {
    return u(b) && 1 == b.length ? a.indexOf(b, c) : -1
  }
  for(;c < a.length;c++) {
    if(c in a && a[c] === b) {
      return c
    }
  }
  return-1
}, Ya = D.forEach ? function(a, b, c) {
  D.forEach.call(a, b, c)
} : function(a, b, c) {
  for(var d = a.length, f = u(a) ? a.split("") : a, g = 0;g < d;g++) {
    g in f && b.call(c, f[g], g, a)
  }
};
function Za(a) {
  return D.concat.apply(D, arguments)
}
function $a(a) {
  var b = a.length;
  if(0 < b) {
    for(var c = Array(b), d = 0;d < b;d++) {
      c[d] = a[d]
    }
    return c
  }
  return[]
}
;function ab(a) {
  if("function" == typeof a.N) {
    return a.N()
  }
  if(u(a)) {
    return a.split("")
  }
  if(ga(a)) {
    for(var b = [], c = a.length, d = 0;d < c;d++) {
      b.push(a[d])
    }
    return b
  }
  return Ta(a)
}
function E(a, b, c) {
  if("function" == typeof a.forEach) {
    a.forEach(b, c)
  }else {
    if(ga(a) || u(a)) {
      Ya(a, b, c)
    }else {
      var d;
      if("function" == typeof a.ka) {
        d = a.ka()
      }else {
        if("function" != typeof a.N) {
          if(ga(a) || u(a)) {
            d = [];
            for(var f = a.length, g = 0;g < f;g++) {
              d.push(g)
            }
          }else {
            d = Ua(a)
          }
        }else {
          d = void 0
        }
      }
      for(var f = ab(a), g = f.length, h = 0;h < g;h++) {
        b.call(c, f[h], d && d[h], a)
      }
    }
  }
}
;function bb(a, b) {
  this.O = {};
  this.j = [];
  var c = arguments.length;
  if(1 < c) {
    if(c % 2) {
      throw Error("Uneven number of arguments");
    }
    for(var d = 0;d < c;d += 2) {
      this.set(arguments[d], arguments[d + 1])
    }
  }else {
    if(a) {
      a instanceof bb ? (c = a.ka(), d = a.N()) : (c = Ua(a), d = Ta(a));
      for(var f = 0;f < c.length;f++) {
        this.set(c[f], d[f])
      }
    }
  }
}
p = bb.prototype;
p.f = 0;
p.bc = 0;
p.N = function() {
  cb(this);
  for(var a = [], b = 0;b < this.j.length;b++) {
    a.push(this.O[this.j[b]])
  }
  return a
};
p.ka = function() {
  cb(this);
  return this.j.concat()
};
p.ia = function(a) {
  return db(this.O, a)
};
p.remove = function(a) {
  return db(this.O, a) ? (delete this.O[a], this.f--, this.bc++, this.j.length > 2 * this.f && cb(this), !0) : !1
};
function cb(a) {
  if(a.f != a.j.length) {
    for(var b = 0, c = 0;b < a.j.length;) {
      var d = a.j[b];
      db(a.O, d) && (a.j[c++] = d);
      b++
    }
    a.j.length = c
  }
  if(a.f != a.j.length) {
    for(var f = {}, c = b = 0;b < a.j.length;) {
      d = a.j[b], db(f, d) || (a.j[c++] = d, f[d] = 1), b++
    }
    a.j.length = c
  }
}
p.get = function(a, b) {
  return db(this.O, a) ? this.O[a] : b
};
p.set = function(a, b) {
  db(this.O, a) || (this.f++, this.j.push(a), this.bc++);
  this.O[a] = b
};
p.n = function() {
  return new bb(this)
};
function db(a, b) {
  return Object.prototype.hasOwnProperty.call(a, b)
}
;function F(a, b) {
  var c;
  if(a instanceof F) {
    this.D = void 0 !== b ? b : a.D, eb(this, a.qa), c = a.ab, H(this), this.ab = c, fb(this, a.ja), gb(this, a.Ba), hb(this, a.H), ib(this, a.R.n()), c = a.Ma, H(this), this.Ma = c
  }else {
    if(a && (c = String(a).match(Qa))) {
      this.D = !!b;
      eb(this, c[1] || "", !0);
      var d = c[2] || "";
      H(this);
      this.ab = d ? decodeURIComponent(d) : "";
      fb(this, c[3] || "", !0);
      gb(this, c[4]);
      hb(this, c[5] || "", !0);
      ib(this, c[6] || "", !0);
      c = c[7] || "";
      H(this);
      this.Ma = c ? decodeURIComponent(c) : ""
    }else {
      this.D = !!b, this.R = new jb(null, 0, this.D)
    }
  }
}
p = F.prototype;
p.qa = "";
p.ab = "";
p.ja = "";
p.Ba = null;
p.H = "";
p.Ma = "";
p.mc = !1;
p.D = !1;
p.toString = function() {
  var a = [], b = this.qa;
  b && a.push(kb(b, lb), ":");
  if(b = this.ja) {
    a.push("//");
    var c = this.ab;
    c && a.push(kb(c, lb), "@");
    a.push(encodeURIComponent(String(b)));
    b = this.Ba;
    null != b && a.push(":", String(b))
  }
  if(b = this.H) {
    this.ja && "/" != b.charAt(0) && a.push("/"), a.push(kb(b, "/" == b.charAt(0) ? mb : nb))
  }
  (b = this.R.toString()) && a.push("?", b);
  (b = this.Ma) && a.push("#", kb(b, ob));
  return a.join("")
};
p.n = function() {
  return new F(this)
};
function eb(a, b, c) {
  H(a);
  a.qa = c ? b ? decodeURIComponent(b) : "" : b;
  a.qa && (a.qa = a.qa.replace(/:$/, ""))
}
function fb(a, b, c) {
  H(a);
  a.ja = c ? b ? decodeURIComponent(b) : "" : b
}
function gb(a, b) {
  H(a);
  if(b) {
    b = Number(b);
    if(isNaN(b) || 0 > b) {
      throw Error("Bad port number " + b);
    }
    a.Ba = b
  }else {
    a.Ba = null
  }
}
function hb(a, b, c) {
  H(a);
  a.H = c ? b ? decodeURIComponent(b) : "" : b
}
function ib(a, b, c) {
  H(a);
  b instanceof jb ? (a.R = b, a.R.qb(a.D)) : (c || (b = kb(b, pb)), a.R = new jb(b, 0, a.D))
}
function I(a, b, c) {
  H(a);
  a.R.set(b, c)
}
function qb(a, b, c) {
  H(a);
  s(c) || (c = [String(c)]);
  rb(a.R, b, c)
}
function J(a) {
  H(a);
  I(a, "zx", Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ x()).toString(36));
  return a
}
function H(a) {
  if(a.mc) {
    throw Error("Tried to modify a read-only Uri");
  }
}
p.qb = function(a) {
  this.D = a;
  this.R && this.R.qb(a);
  return this
};
function sb(a, b, c, d) {
  var f = new F(null, void 0);
  a && eb(f, a);
  b && fb(f, b);
  c && gb(f, c);
  d && hb(f, d);
  return f
}
function kb(a, b) {
  return u(a) ? encodeURI(a).replace(b, tb) : null
}
function tb(a) {
  a = a.charCodeAt(0);
  return"%" + (a >> 4 & 15).toString(16) + (a & 15).toString(16)
}
var lb = /[#\/\?@]/g, nb = /[\#\?:]/g, mb = /[\#\?]/g, pb = /[\#\?@]/g, ob = /#/g;
function jb(a, b, c) {
  this.C = a || null;
  this.D = !!c
}
function K(a) {
  if(!a.i && (a.i = new bb, a.f = 0, a.C)) {
    for(var b = a.C.split("&"), c = 0;c < b.length;c++) {
      var d = b[c].indexOf("="), f = null, g = null;
      0 <= d ? (f = b[c].substring(0, d), g = b[c].substring(d + 1)) : f = b[c];
      f = decodeURIComponent(f.replace(/\+/g, " "));
      f = L(a, f);
      a.add(f, g ? decodeURIComponent(g.replace(/\+/g, " ")) : "")
    }
  }
}
p = jb.prototype;
p.i = null;
p.f = null;
p.add = function(a, b) {
  K(this);
  this.C = null;
  a = L(this, a);
  var c = this.i.get(a);
  c || this.i.set(a, c = []);
  c.push(b);
  this.f++;
  return this
};
p.remove = function(a) {
  K(this);
  a = L(this, a);
  return this.i.ia(a) ? (this.C = null, this.f -= this.i.get(a).length, this.i.remove(a)) : !1
};
p.ia = function(a) {
  K(this);
  a = L(this, a);
  return this.i.ia(a)
};
p.ka = function() {
  K(this);
  for(var a = this.i.N(), b = this.i.ka(), c = [], d = 0;d < b.length;d++) {
    for(var f = a[d], g = 0;g < f.length;g++) {
      c.push(b[d])
    }
  }
  return c
};
p.N = function(a) {
  K(this);
  var b = [];
  if(a) {
    this.ia(a) && (b = Za(b, this.i.get(L(this, a))))
  }else {
    a = this.i.N();
    for(var c = 0;c < a.length;c++) {
      b = Za(b, a[c])
    }
  }
  return b
};
p.set = function(a, b) {
  K(this);
  this.C = null;
  a = L(this, a);
  this.ia(a) && (this.f -= this.i.get(a).length);
  this.i.set(a, [b]);
  this.f++;
  return this
};
p.get = function(a, b) {
  var c = a ? this.N(a) : [];
  return 0 < c.length ? String(c[0]) : b
};
function rb(a, b, c) {
  a.remove(b);
  0 < c.length && (a.C = null, a.i.set(L(a, b), $a(c)), a.f += c.length)
}
p.toString = function() {
  if(this.C) {
    return this.C
  }
  if(!this.i) {
    return""
  }
  for(var a = [], b = this.i.ka(), c = 0;c < b.length;c++) {
    for(var d = b[c], f = encodeURIComponent(String(d)), d = this.N(d), g = 0;g < d.length;g++) {
      var h = f;
      "" !== d[g] && (h += "=" + encodeURIComponent(String(d[g])));
      a.push(h)
    }
  }
  return this.C = a.join("&")
};
p.n = function() {
  var a = new jb;
  a.C = this.C;
  this.i && (a.i = this.i.n(), a.f = this.f);
  return a
};
function L(a, b) {
  var c = String(b);
  a.D && (c = c.toLowerCase());
  return c
}
p.qb = function(a) {
  a && !this.D && (K(this), this.C = null, E(this.i, function(a, c) {
    var d = c.toLowerCase();
    c != d && (this.remove(c), rb(this, d, a))
  }, this));
  this.D = a
};
function ub() {
}
ub.prototype.Ga = null;
var vb;
function wb() {
}
y(wb, ub);
function xb(a) {
  return(a = yb(a)) ? new ActiveXObject(a) : new XMLHttpRequest
}
function zb(a) {
  var b = {};
  yb(a) && (b[0] = !0, b[1] = !0);
  return b
}
function yb(a) {
  if(!a.Gb && "undefined" == typeof XMLHttpRequest && "undefined" != typeof ActiveXObject) {
    for(var b = ["MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"], c = 0;c < b.length;c++) {
      var d = b[c];
      try {
        return new ActiveXObject(d), a.Gb = d
      }catch(f) {
      }
    }
    throw Error("Could not create ActiveXObject. ActiveX might be disabled, or MSXML might not be installed");
  }
  return a.Gb
}
vb = new wb;
function M() {
  0 != Ab && (this.Gc = Error().stack, Bb[v(this)] = this)
}
var Ab = 0, Bb = {};
M.prototype.yb = !1;
M.prototype.Ia = function() {
  if(!this.yb && (this.yb = !0, this.u(), 0 != Ab)) {
    var a = v(this);
    delete Bb[a]
  }
};
M.prototype.u = function() {
  if(this.Nb) {
    for(;this.Nb.length;) {
      this.Nb.shift()()
    }
  }
};
function N(a, b) {
  this.type = a;
  this.currentTarget = this.target = b
}
p = N.prototype;
p.u = e();
p.Ia = e();
p.na = !1;
p.defaultPrevented = !1;
p.Wa = !0;
p.preventDefault = function() {
  this.defaultPrevented = !0;
  this.Wa = !1
};
var Cb = 0;
function Db() {
}
p = Db.prototype;
p.key = 0;
p.ea = !1;
p.Ha = !1;
p.Oa = function(a, b, c, d, f, g) {
  if(ha(a)) {
    this.Ib = !0
  }else {
    if(a && a.handleEvent && ha(a.handleEvent)) {
      this.Ib = !1
    }else {
      throw Error("Invalid listener argument");
    }
  }
  this.W = a;
  this.Ub = b;
  this.src = c;
  this.type = d;
  this.capture = !!f;
  this.lb = g;
  this.Ha = !1;
  this.key = ++Cb;
  this.ea = !1
};
p.handleEvent = function(a) {
  return this.Ib ? this.W.call(this.lb || this.src, a) : this.W.handleEvent.call(this.W, a)
};
var Eb = !A || A && 9 <= Ma, Fb = A && !C("9");
!B || C("528");
Aa && C("1.9b") || A && C("8") || za && C("9.5") || B && C("528");
Aa && !C("8") || A && C("9");
function Gb(a) {
  Gb[" "](a);
  return a
}
Gb[" "] = ea;
function Hb(a, b) {
  a && this.Oa(a, b)
}
y(Hb, N);
p = Hb.prototype;
p.target = null;
p.relatedTarget = null;
p.offsetX = 0;
p.offsetY = 0;
p.clientX = 0;
p.clientY = 0;
p.screenX = 0;
p.screenY = 0;
p.button = 0;
p.keyCode = 0;
p.charCode = 0;
p.ctrlKey = !1;
p.altKey = !1;
p.shiftKey = !1;
p.metaKey = !1;
p.yc = !1;
p.zb = null;
p.Oa = function(a, b) {
  var c = this.type = a.type;
  N.call(this, c);
  this.target = a.target || a.srcElement;
  this.currentTarget = b;
  var d = a.relatedTarget;
  if(d) {
    if(Aa) {
      var f;
      a: {
        try {
          Gb(d.nodeName);
          f = !0;
          break a
        }catch(g) {
        }
        f = !1
      }
      f || (d = null)
    }
  }else {
    "mouseover" == c ? d = a.fromElement : "mouseout" == c && (d = a.toElement)
  }
  this.relatedTarget = d;
  this.offsetX = B || void 0 !== a.offsetX ? a.offsetX : a.layerX;
  this.offsetY = B || void 0 !== a.offsetY ? a.offsetY : a.layerY;
  this.clientX = void 0 !== a.clientX ? a.clientX : a.pageX;
  this.clientY = void 0 !== a.clientY ? a.clientY : a.pageY;
  this.screenX = a.screenX || 0;
  this.screenY = a.screenY || 0;
  this.button = a.button;
  this.keyCode = a.keyCode || 0;
  this.charCode = a.charCode || ("keypress" == c ? a.keyCode : 0);
  this.ctrlKey = a.ctrlKey;
  this.altKey = a.altKey;
  this.shiftKey = a.shiftKey;
  this.metaKey = a.metaKey;
  this.yc = Ca ? a.metaKey : a.ctrlKey;
  this.state = a.state;
  this.zb = a;
  a.defaultPrevented && this.preventDefault();
  delete this.na
};
p.preventDefault = function() {
  Hb.ra.preventDefault.call(this);
  var a = this.zb;
  if(a.preventDefault) {
    a.preventDefault()
  }else {
    if(a.returnValue = !1, Fb) {
      try {
        if(a.ctrlKey || 112 <= a.keyCode && 123 >= a.keyCode) {
          a.keyCode = -1
        }
      }catch(b) {
      }
    }
  }
};
p.u = e();
var Sa = {}, O = {}, P = {}, Ib = {};
function Jb(a, b, c, d, f) {
  if(s(b)) {
    for(var g = 0;g < b.length;g++) {
      Jb(a, b[g], c, d, f)
    }
    return null
  }
  a: {
    if(!b) {
      throw Error("Invalid event type");
    }
    d = !!d;
    var h = O;
    b in h || (h[b] = {f:0, t:0});
    h = h[b];
    d in h || (h[d] = {f:0, t:0}, h.f++);
    var h = h[d], g = v(a), n;
    h.t++;
    if(h[g]) {
      n = h[g];
      for(var k = 0;k < n.length;k++) {
        if(h = n[k], h.W == c && h.lb == f) {
          if(h.ea) {
            break
          }
          n[k].Ha = !1;
          a = n[k];
          break a
        }
      }
    }else {
      n = h[g] = [], h.f++
    }
    k = Kb();
    h = new Db;
    h.Oa(c, k, a, b, d, f);
    h.Ha = !1;
    k.src = a;
    k.W = h;
    n.push(h);
    P[g] || (P[g] = []);
    P[g].push(h);
    a.addEventListener ? a != q && a.wb || a.addEventListener(b, k, d) : a.attachEvent(b in Ib ? Ib[b] : Ib[b] = "on" + b, k);
    a = h
  }
  b = a.key;
  Sa[b] = a;
  return b
}
function Kb() {
  var a = Lb, b = Eb ? function(c) {
    return a.call(b.src, b.W, c)
  } : function(c) {
    c = a.call(b.src, b.W, c);
    if(!c) {
      return c
    }
  };
  return b
}
function Mb(a, b, c, d, f) {
  if(s(b)) {
    for(var g = 0;g < b.length;g++) {
      Mb(a, b[g], c, d, f)
    }
  }else {
    d = !!d;
    a: {
      g = O;
      if(b in g && (g = g[b], d in g && (g = g[d], a = v(a), g[a]))) {
        a = g[a];
        break a
      }
      a = null
    }
    if(a) {
      for(g = 0;g < a.length;g++) {
        if(a[g].W == c && a[g].capture == d && a[g].lb == f) {
          Nb(a[g].key);
          break
        }
      }
    }
  }
}
function Nb(a) {
  var b = Sa[a];
  if(!b || b.ea) {
    return!1
  }
  var c = b.src, d = b.type, f = b.Ub, g = b.capture;
  c.removeEventListener ? c != q && c.wb || c.removeEventListener(d, f, g) : c.detachEvent && c.detachEvent(d in Ib ? Ib[d] : Ib[d] = "on" + d, f);
  c = v(c);
  if(P[c]) {
    var f = P[c], h = Xa(f, b);
    0 <= h && D.splice.call(f, h, 1);
    0 == f.length && delete P[c]
  }
  b.ea = !0;
  if(b = O[d][g][c]) {
    b.Mb = !0, Ob(d, g, c, b)
  }
  delete Sa[a];
  return!0
}
function Ob(a, b, c, d) {
  if(!d.Qa && d.Mb) {
    for(var f = 0, g = 0;f < d.length;f++) {
      d[f].ea ? d[f].Ub.src = null : (f != g && (d[g] = d[f]), g++)
    }
    d.length = g;
    d.Mb = !1;
    0 == g && (delete O[a][b][c], O[a][b].f--, 0 == O[a][b].f && (delete O[a][b], O[a].f--), 0 == O[a].f && delete O[a])
  }
}
function Pb(a) {
  var b = 0;
  if(null != a) {
    if(a = v(a), P[a]) {
      a = P[a];
      for(var c = a.length - 1;0 <= c;c--) {
        Nb(a[c].key), b++
      }
    }
  }else {
    Ra(function(a, c) {
      Nb(c);
      b++
    })
  }
}
function Qb(a, b, c, d, f) {
  var g = 1;
  b = v(b);
  if(a[b]) {
    var h = --a.t, n = a[b];
    n.Qa ? n.Qa++ : n.Qa = 1;
    try {
      for(var k = n.length, t = 0;t < k;t++) {
        var l = n[t];
        l && !l.ea && (g &= !1 !== Rb(l, f))
      }
    }finally {
      a.t = Math.max(h, a.t), n.Qa--, Ob(c, d, b, n)
    }
  }
  return Boolean(g)
}
function Rb(a, b) {
  a.Ha && Nb(a.key);
  return a.handleEvent(b)
}
function Lb(a, b) {
  if(a.ea) {
    return!0
  }
  var c = a.type, d = O;
  if(!(c in d)) {
    return!0
  }
  var d = d[c], f, g;
  if(!Eb) {
    f = b || da("window.event");
    var h = !0 in d, n = !1 in d;
    if(h) {
      if(0 > f.keyCode || void 0 != f.returnValue) {
        return!0
      }
      a: {
        var k = !1;
        if(0 == f.keyCode) {
          try {
            f.keyCode = -1;
            break a
          }catch(t) {
            k = !0
          }
        }
        if(k || void 0 == f.returnValue) {
          f.returnValue = !0
        }
      }
    }
    k = new Hb;
    k.Oa(f, this);
    f = !0;
    try {
      if(h) {
        for(var l = [], r = k.currentTarget;r;r = r.parentNode) {
          l.push(r)
        }
        g = d[!0];
        g.t = g.f;
        for(var G = l.length - 1;!k.na && 0 <= G && g.t;G--) {
          k.currentTarget = l[G], f &= Qb(g, l[G], c, !0, k)
        }
        if(n) {
          for(g = d[!1], g.t = g.f, G = 0;!k.na && G < l.length && g.t;G++) {
            k.currentTarget = l[G], f &= Qb(g, l[G], c, !1, k)
          }
        }
      }else {
        f = Rb(a, k)
      }
    }finally {
      l && (l.length = 0)
    }
    return f
  }
  c = new Hb(b, this);
  return f = Rb(a, c)
}
;function Sb() {
  M.call(this)
}
y(Sb, M);
p = Sb.prototype;
p.wb = !0;
p.pb = null;
p.addEventListener = function(a, b, c, d) {
  Jb(this, a, b, c, d)
};
p.removeEventListener = function(a, b, c, d) {
  Mb(this, a, b, c, d)
};
p.dispatchEvent = function(a) {
  var b = a.type || a, c = O;
  if(b in c) {
    if(u(a)) {
      a = new N(a, this)
    }else {
      if(a instanceof N) {
        a.target = a.target || this
      }else {
        var d = a;
        a = new N(b, this);
        Wa(a, d)
      }
    }
    var d = 1, f, c = c[b], b = !0 in c, g;
    if(b) {
      f = [];
      for(g = this;g;g = g.pb) {
        f.push(g)
      }
      g = c[!0];
      g.t = g.f;
      for(var h = f.length - 1;!a.na && 0 <= h && g.t;h--) {
        a.currentTarget = f[h], d &= Qb(g, f[h], a.type, !0, a) && !1 != a.Wa
      }
    }
    if(!1 in c) {
      if(g = c[!1], g.t = g.f, b) {
        for(h = 0;!a.na && h < f.length && g.t;h++) {
          a.currentTarget = f[h], d &= Qb(g, f[h], a.type, !1, a) && !1 != a.Wa
        }
      }else {
        for(f = this;!a.na && f && g.t;f = f.pb) {
          a.currentTarget = f, d &= Qb(g, f, a.type, !1, a) && !1 != a.Wa
        }
      }
    }
    a = Boolean(d)
  }else {
    a = !0
  }
  return a
};
p.u = function() {
  Sb.ra.u.call(this);
  Pb(this);
  this.pb = null
};
function Tb(a, b) {
  M.call(this);
  this.da = a || 1;
  this.Ea = b || q;
  this.eb = w(this.Ec, this);
  this.ob = x()
}
y(Tb, Sb);
p = Tb.prototype;
p.enabled = !1;
p.r = null;
p.setInterval = function(a) {
  this.da = a;
  this.r && this.enabled ? (this.stop(), this.start()) : this.r && this.stop()
};
p.Ec = function() {
  if(this.enabled) {
    var a = x() - this.ob;
    0 < a && a < 0.8 * this.da ? this.r = this.Ea.setTimeout(this.eb, this.da - a) : (this.dispatchEvent(Ub), this.enabled && (this.r = this.Ea.setTimeout(this.eb, this.da), this.ob = x()))
  }
};
p.start = function() {
  this.enabled = !0;
  this.r || (this.r = this.Ea.setTimeout(this.eb, this.da), this.ob = x())
};
p.stop = function() {
  this.enabled = !1;
  this.r && (this.Ea.clearTimeout(this.r), this.r = null)
};
p.u = function() {
  Tb.ra.u.call(this);
  this.stop();
  delete this.Ea
};
var Ub = "tick";
function Vb(a) {
  M.call(this);
  this.e = a;
  this.j = []
}
y(Vb, M);
var Wb = [];
function Xb(a, b, c, d) {
  s(c) || (Wb[0] = c, c = Wb);
  for(var f = 0;f < c.length;f++) {
    var g = Jb(b, c[f], d || a, !1, a.e || a);
    a.j.push(g)
  }
}
Vb.prototype.u = function() {
  Vb.ra.u.call(this);
  Ya(this.j, Nb);
  this.j.length = 0
};
Vb.prototype.handleEvent = function() {
  throw Error("EventHandler.handleEvent not implemented");
};
function Yb(a, b, c) {
  M.call(this);
  this.nc = a;
  this.da = b;
  this.e = c;
  this.hc = w(this.tc, this)
}
y(Yb, M);
p = Yb.prototype;
p.Xa = !1;
p.Tb = 0;
p.r = null;
p.stop = function() {
  this.r && (q.clearTimeout(this.r), this.r = null, this.Xa = !1)
};
p.u = function() {
  Yb.ra.u.call(this);
  this.stop()
};
p.tc = function() {
  this.r = null;
  this.Xa && !this.Tb && (this.Xa = !1, Zb(this))
};
function Zb(a) {
  var b;
  b = a.hc;
  var c = a.da;
  if(!ha(b)) {
    if(b && "function" == typeof b.handleEvent) {
      b = w(b.handleEvent, b)
    }else {
      throw Error("Invalid listener argument");
    }
  }
  b = 2147483647 < c ? -1 : q.setTimeout(b, c || 0);
  a.r = b;
  a.nc.call(a.e)
}
;function Q(a, b, c, d, f) {
  this.b = a;
  this.a = b;
  this.Z = c;
  this.B = d;
  this.Ca = f || 1;
  this.Da = $b;
  this.jb = new Vb(this);
  this.Sa = new Tb;
  this.Sa.setInterval(ac)
}
p = Q.prototype;
p.v = null;
p.J = !1;
p.ua = null;
p.sb = null;
p.pa = null;
p.sa = null;
p.T = null;
p.w = null;
p.X = null;
p.l = null;
p.Fa = 0;
p.K = null;
p.ta = null;
p.p = null;
p.h = -1;
p.Xb = !0;
p.aa = !1;
p.oa = 0;
p.Ta = null;
var $b = 45E3, ac = 250;
function bc(a, b) {
  switch(a) {
    case 0:
      return"Non-200 return code (" + b + ")";
    case 1:
      return"XMLHTTP failure (no data)";
    case 2:
      return"HttpConnection timeout";
    default:
      return"Unknown error"
  }
}
var cc = {}, dc = {};
function ec() {
  return!A || A && 10 <= Ma
}
p = Q.prototype;
p.Y = m("v");
p.setTimeout = m("Da");
p.$b = m("oa");
function fc(a, b, c) {
  a.sa = 1;
  a.T = J(b.n());
  a.X = c;
  a.xb = !0;
  gc(a, null)
}
function hc(a, b, c, d, f) {
  a.sa = 1;
  a.T = J(b.n());
  a.X = null;
  a.xb = c;
  f && (a.Xb = !1);
  gc(a, d)
}
function gc(a, b) {
  a.pa = x();
  ic(a);
  a.w = a.T.n();
  qb(a.w, "t", a.Ca);
  a.Fa = 0;
  a.l = a.b.hb(a.b.Ya() ? b : null);
  0 < a.oa && (a.Ta = new Yb(w(a.dc, a, a.l), a.oa));
  Xb(a.jb, a.l, "readystatechange", a.Ac);
  var c;
  if(a.v) {
    c = a.v;
    var d = {}, f;
    for(f in c) {
      d[f] = c[f]
    }
    c = d
  }else {
    c = {}
  }
  a.X ? (a.ta = "POST", c["Content-Type"] = "application/x-www-form-urlencoded", a.l.send(a.w, a.ta, a.X, c)) : (a.ta = "GET", a.Xb && !B && (c.Connection = "close"), a.l.send(a.w, a.ta, null, c));
  a.b.G(jc);
  if(d = a.X) {
    for(c = "", d = d.split("&"), f = 0;f < d.length;f++) {
      var g = d[f].split("=");
      if(1 < g.length) {
        var h = g[0], g = g[1], n = h.split("_");
        c = 2 <= n.length && "type" == n[1] ? c + (h + "=" + g + "&") : c + (h + "=redacted&")
      }
    }
  }else {
    c = null
  }
  a.a.info("XMLHTTP REQ (" + a.B + ") [attempt " + a.Ca + "]: " + a.ta + "\n" + a.w + "\n" + c)
}
p.Ac = function(a) {
  a = a.target;
  var b = this.Ta;
  b && 3 == R(a) ? (this.a.debug("Throttling readystatechange."), b.r || b.Tb ? b.Xa = !0 : Zb(b)) : this.dc(a)
};
p.dc = function(a) {
  try {
    if(a == this.l) {
      a: {
        var b = R(this.l), c = this.l.la, d = kc(this.l);
        if(!ec() || B && !C("420+")) {
          if(4 > b) {
            break a
          }
        }else {
          if(3 > b || 3 == b && !za && !lc(this.l)) {
            break a
          }
        }
        this.aa || (4 != b || c == mc) || (c == nc || 0 >= d ? this.b.G(oc) : this.b.G(pc));
        qc(this);
        var f = kc(this.l);
        this.h = f;
        var g = lc(this.l);
        g || this.a.debug("No response text for uri " + this.w + " status " + f);
        this.J = 200 == f;
        this.a.info("XMLHTTP RESP (" + this.B + ") [ attempt " + this.Ca + "]: " + this.ta + "\n" + this.w + "\n" + b + " " + f);
        this.J ? (4 == b && S(this), this.xb ? (rc(this, b, g), za && 3 == b && (Xb(this.jb, this.Sa, Ub, this.zc), this.Sa.start())) : (sc(this.a, this.B, g, null), tc(this, g)), this.J && !this.aa && (4 == b ? this.b.ma(this) : (this.J = !1, ic(this)))) : (400 == f && 0 < g.indexOf("Unknown SID") ? (this.p = 3, T(uc), this.a.$("XMLHTTP Unknown SID (" + this.B + ")")) : (this.p = 0, T(vc), this.a.$("XMLHTTP Bad status " + f + " (" + this.B + ")")), S(this), wc(this))
      }
    }else {
      this.a.$("Called back with an unexpected xmlhttp")
    }
  }catch(h) {
    this.a.debug("Failed call to OnXmlHttpReadyStateChanged_"), this.l && lc(this.l) ? xc(this.a, h, "ResponseText: " + lc(this.l)) : xc(this.a, h, "No response text")
  }finally {
  }
};
function rc(a, b, c) {
  for(var d = !0;!a.aa && a.Fa < c.length;) {
    var f = yc(a, c);
    if(f == dc) {
      4 == b && (a.p = 4, T(zc), d = !1);
      sc(a.a, a.B, null, "[Incomplete Response]");
      break
    }else {
      if(f == cc) {
        a.p = 4;
        T(Ac);
        sc(a.a, a.B, c, "[Invalid Chunk]");
        d = !1;
        break
      }else {
        sc(a.a, a.B, f, null), tc(a, f)
      }
    }
  }
  4 == b && 0 == c.length && (a.p = 1, T(Bc), d = !1);
  a.J = a.J && d;
  d || (sc(a.a, a.B, c, "[Invalid Chunked Response]"), S(a), wc(a))
}
p.zc = function() {
  var a = R(this.l), b = lc(this.l);
  this.Fa < b.length && (qc(this), rc(this, a, b), this.J && 4 != a && ic(this))
};
function yc(a, b) {
  var c = a.Fa, d = b.indexOf("\n", c);
  if(-1 == d) {
    return dc
  }
  c = Number(b.substring(c, d));
  if(isNaN(c)) {
    return cc
  }
  d += 1;
  if(d + c > b.length) {
    return dc
  }
  var f = b.substr(d, c);
  a.Fa = d + c;
  return f
}
function Cc(a, b) {
  a.pa = x();
  ic(a);
  var c = b ? window.location.hostname : "";
  a.w = a.T.n();
  I(a.w, "DOMAIN", c);
  I(a.w, "t", a.Ca);
  try {
    a.K = new ActiveXObject("htmlfile")
  }catch(d) {
    a.a.I("ActiveX blocked");
    S(a);
    a.p = 7;
    T(Dc);
    wc(a);
    return
  }
  var f = "<html><body>";
  b && (f += '<script>document.domain="' + c + '"\x3c/script>');
  f += "</body></html>";
  a.K.open();
  a.K.write(f);
  a.K.close();
  a.K.parentWindow.m = w(a.wc, a);
  a.K.parentWindow.d = w(a.Sb, a, !0);
  a.K.parentWindow.rpcClose = w(a.Sb, a, !1);
  c = a.K.createElement("div");
  a.K.parentWindow.document.body.appendChild(c);
  c.innerHTML = '<iframe src="' + a.w + '"></iframe>';
  a.a.info("TRIDENT REQ (" + a.B + ") [ attempt " + a.Ca + "]: GET\n" + a.w);
  a.b.G(jc)
}
p.wc = function(a) {
  U(w(this.vc, this, a), 0)
};
p.vc = function(a) {
  if(!this.aa) {
    var b = this.a;
    b.info("TRIDENT TEXT (" + this.B + "): " + Ec(b, a));
    qc(this);
    tc(this, a);
    ic(this)
  }
};
p.Sb = function(a) {
  U(w(this.uc, this, a), 0)
};
p.uc = function(a) {
  this.aa || (this.a.info("TRIDENT TEXT (" + this.B + "): " + a ? "success" : "failure"), S(this), this.J = a, this.b.ma(this), this.b.G(Fc))
};
p.lc = function() {
  qc(this);
  this.b.ma(this)
};
p.cancel = function() {
  this.aa = !0;
  S(this)
};
function ic(a) {
  a.sb = x() + a.Da;
  Gc(a, a.Da)
}
function Gc(a, b) {
  if(null != a.ua) {
    throw Error("WatchDog timer not null");
  }
  a.ua = U(w(a.xc, a), b)
}
function qc(a) {
  a.ua && (q.clearTimeout(a.ua), a.ua = null)
}
p.xc = function() {
  this.ua = null;
  var a = x();
  0 <= a - this.sb ? (this.J && this.a.I("Received watchdog timeout even though request loaded successfully"), this.a.info("TIMEOUT: " + this.w), 2 != this.sa && this.b.G(oc), S(this), this.p = 2, T(Hc), wc(this)) : (this.a.$("WatchDog timer called too early"), Gc(this, this.sb - a))
};
function wc(a) {
  a.b.Hb() || a.aa || a.b.ma(a)
}
function S(a) {
  qc(a);
  var b = a.Ta;
  b && "function" == typeof b.Ia && b.Ia();
  a.Ta = null;
  a.Sa.stop();
  b = a.jb;
  Ya(b.j, Nb);
  b.j.length = 0;
  a.l && (b = a.l, a.l = null, b.abort(), b.Ia());
  a.K && (a.K = null)
}
p.Eb = aa("p");
function tc(a, b) {
  try {
    a.b.Pb(a, b), a.b.G(Fc)
  }catch(c) {
    xc(a.a, c, "Error in httprequest callback")
  }
}
;function Ic(a) {
  a = String(a);
  if(/^\s*$/.test(a) ? 0 : /^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g, "@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g, ""))) {
    try {
      return eval("(" + a + ")")
    }catch(b) {
    }
  }
  throw Error("Invalid JSON string: " + a);
}
function Jc(a) {
  return eval("(" + a + ")")
}
function Kc(a) {
  var b = [];
  Lc(new Mc(void 0), a, b);
  return b.join("")
}
function Mc(a) {
  this.Va = a
}
function Lc(a, b, c) {
  switch(typeof b) {
    case "string":
      Nc(b, c);
      break;
    case "number":
      c.push(isFinite(b) && !isNaN(b) ? b : "null");
      break;
    case "boolean":
      c.push(b);
      break;
    case "undefined":
      c.push("null");
      break;
    case "object":
      if(null == b) {
        c.push("null");
        break
      }
      if(s(b)) {
        var d = b.length;
        c.push("[");
        for(var f = "", g = 0;g < d;g++) {
          c.push(f), f = b[g], Lc(a, a.Va ? a.Va.call(b, String(g), f) : f, c), f = ","
        }
        c.push("]");
        break
      }
      c.push("{");
      d = "";
      for(g in b) {
        Object.prototype.hasOwnProperty.call(b, g) && (f = b[g], "function" != typeof f && (c.push(d), Nc(g, c), c.push(":"), Lc(a, a.Va ? a.Va.call(b, g, f) : f, c), d = ","))
      }
      c.push("}");
      break;
    case "function":
      break;
    default:
      throw Error("Unknown type: " + typeof b);
  }
}
var Oc = {'"':'\\"', "\\":"\\\\", "/":"\\/", "\b":"\\b", "\f":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\u000b"}, Pc = /\uffff/.test("\uffff") ? /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g;
function Nc(a, b) {
  b.push('"', a.replace(Pc, function(a) {
    if(a in Oc) {
      return Oc[a]
    }
    var b = a.charCodeAt(0), f = "\\u";
    16 > b ? f += "000" : 256 > b ? f += "00" : 4096 > b && (f += "0");
    return Oc[a] = f + b.toString(16)
  }), '"')
}
;function Qc(a) {
  return Rc(a || arguments.callee.caller, [])
}
function Rc(a, b) {
  var c = [];
  if(0 <= Xa(b, a)) {
    c.push("[...circular reference...]")
  }else {
    if(a && 50 > b.length) {
      c.push(Sc(a) + "(");
      for(var d = a.arguments, f = 0;f < d.length;f++) {
        0 < f && c.push(", ");
        var g;
        g = d[f];
        switch(typeof g) {
          case "object":
            g = g ? "object" : "null";
            break;
          case "string":
            break;
          case "number":
            g = String(g);
            break;
          case "boolean":
            g = g ? "true" : "false";
            break;
          case "function":
            g = (g = Sc(g)) ? g : "[fn]";
            break;
          default:
            g = typeof g
        }
        40 < g.length && (g = g.substr(0, 40) + "...");
        c.push(g)
      }
      b.push(a);
      c.push(")\n");
      try {
        c.push(Rc(a.caller, b))
      }catch(h) {
        c.push("[exception trying to get caller]\n")
      }
    }else {
      a ? c.push("[...long stack...]") : c.push("[end]")
    }
  }
  return c.join("")
}
function Sc(a) {
  if(Tc[a]) {
    return Tc[a]
  }
  a = String(a);
  if(!Tc[a]) {
    var b = /function ([^\(]+)/.exec(a);
    Tc[a] = b ? b[1] : "[Anonymous]"
  }
  return Tc[a]
}
var Tc = {};
function Uc(a, b, c, d, f) {
  this.reset(a, b, c, d, f)
}
Uc.prototype.Cc = 0;
Uc.prototype.Bb = null;
Uc.prototype.Ab = null;
var Vc = 0;
Uc.prototype.reset = function(a, b, c, d, f) {
  this.Cc = "number" == typeof f ? f : Vc++;
  this.Qc = d || x();
  this.za = a;
  this.oc = b;
  this.Ic = c;
  delete this.Bb;
  delete this.Ab
};
Uc.prototype.Yb = m("za");
function V(a) {
  this.pc = a
}
V.prototype.Ra = null;
V.prototype.za = null;
V.prototype.fb = null;
V.prototype.Fb = null;
function Wc(a, b) {
  this.name = a;
  this.value = b
}
Wc.prototype.toString = aa("name");
var Xc = new Wc("SEVERE", 1E3), Yc = new Wc("WARNING", 900), Zc = new Wc("INFO", 800), $c = new Wc("CONFIG", 700), ad = new Wc("FINE", 500);
p = V.prototype;
p.getParent = aa("Ra");
p.Yb = m("za");
function bd(a) {
  if(a.za) {
    return a.za
  }
  if(a.Ra) {
    return bd(a.Ra)
  }
  Pa("Root logger has no level set.");
  return null
}
p.log = function(a, b, c) {
  if(a.value >= bd(this).value) {
    for(a = this.kc(a, b, c), b = "log:" + a.oc, q.console && (q.console.timeStamp ? q.console.timeStamp(b) : q.console.markTimeline && q.console.markTimeline(b)), q.msWriteProfilerMark && q.msWriteProfilerMark(b), b = this;b;) {
      c = b;
      var d = a;
      if(c.Fb) {
        for(var f = 0, g = void 0;g = c.Fb[f];f++) {
          g(d)
        }
      }
      b = b.getParent()
    }
  }
};
p.kc = function(a, b, c) {
  var d = new Uc(a, String(b), this.pc);
  if(c) {
    d.Bb = c;
    var f;
    var g = arguments.callee.caller;
    try {
      var h;
      var n = da("window.location.href");
      if(u(c)) {
        h = {message:c, name:"Unknown error", lineNumber:"Not available", fileName:n, stack:"Not available"}
      }else {
        var k, t, l = !1;
        try {
          k = c.lineNumber || c.Hc || "Not available"
        }catch(r) {
          k = "Not available", l = !0
        }
        try {
          t = c.fileName || c.filename || c.sourceURL || q.$googDebugFname || n
        }catch(G) {
          t = "Not available", l = !0
        }
        h = !l && c.lineNumber && c.fileName && c.stack ? c : {message:c.message, name:c.name, lineNumber:k, fileName:t, stack:c.stack || "Not available"}
      }
      f = "Message: " + na(h.message) + '\nUrl: <a href="view-source:' + h.fileName + '" target="_new">' + h.fileName + "</a>\nLine: " + h.lineNumber + "\n\nBrowser stack:\n" + na(h.stack + "-> ") + "[end]\n\nJS stack traversal:\n" + na(Qc(g) + "-> ")
    }catch(Sd) {
      f = "Exception trying to expose exception! You win, we lose. " + Sd
    }
    d.Ab = f
  }
  return d
};
p.I = function(a, b) {
  this.log(Xc, a, b)
};
p.$ = function(a, b) {
  this.log(Yc, a, b)
};
p.info = function(a, b) {
  this.log(Zc, a, b)
};
function W(a, b) {
  a.log(ad, b, void 0)
}
var cd = {}, dd = null;
function ed(a) {
  dd || (dd = new V(""), cd[""] = dd, dd.Yb($c));
  var b;
  if(!(b = cd[a])) {
    b = new V(a);
    var c = a.lastIndexOf("."), d = a.substr(c + 1), c = ed(a.substr(0, c));
    c.fb || (c.fb = {});
    c.fb[d] = b;
    b.Ra = c;
    cd[a] = b
  }
  return b
}
;function X() {
  this.q = ed("goog.net.BrowserChannel")
}
function sc(a, b, c, d) {
  a.info("XMLHTTP TEXT (" + b + "): " + Ec(a, c) + (d ? " " + d : ""))
}
X.prototype.debug = function(a) {
  this.info(a)
};
function xc(a, b, c) {
  a.I((c || "Exception") + b)
}
X.prototype.info = function(a) {
  this.q.info(a)
};
X.prototype.$ = function(a) {
  this.q.$(a)
};
X.prototype.I = function(a) {
  this.q.I(a)
};
function Ec(a, b) {
  if(!b || b == fd) {
    return b
  }
  try {
    var c = Jc(b);
    if(c) {
      for(var d = 0;d < c.length;d++) {
        if(s(c[d])) {
          var f = c[d];
          if(!(2 > f.length)) {
            var g = f[1];
            if(s(g) && !(1 > g.length)) {
              var h = g[0];
              if("noop" != h && "stop" != h) {
                for(var n = 1;n < g.length;n++) {
                  g[n] = ""
                }
              }
            }
          }
        }
      }
    }
    return Kc(c)
  }catch(k) {
    return a.debug("Exception parsing expected JS array - probably was not JS"), b
  }
}
;function gd(a, b) {
  this.Oc = new Mc(a);
  this.P = b ? Jc : Ic
}
gd.prototype.parse = function(a) {
  return this.P(a)
};
var mc = 7, nc = 8;
function hd(a) {
  M.call(this);
  this.headers = new bb;
  this.va = a || null
}
y(hd, Sb);
hd.prototype.q = ed("goog.net.XhrIo");
var id = /^https?$/i;
p = hd.prototype;
p.S = !1;
p.g = null;
p.bb = null;
p.Pa = "";
p.Jb = "";
p.la = 0;
p.p = "";
p.ib = !1;
p.Na = !1;
p.mb = !1;
p.ca = !1;
p.$a = 0;
p.fa = null;
p.Wb = "";
p.cc = !1;
p.send = function(a, b, c, d) {
  if(this.g) {
    throw Error("[goog.net.XhrIo] Object is active with another request=" + this.Pa + "; newUri=" + a);
  }
  b = b ? b.toUpperCase() : "GET";
  this.Pa = a;
  this.p = "";
  this.la = 0;
  this.Jb = b;
  this.ib = !1;
  this.S = !0;
  this.g = this.va ? xb(this.va) : xb(vb);
  this.bb = this.va ? this.va.Ga || (this.va.Ga = zb(this.va)) : vb.Ga || (vb.Ga = zb(vb));
  this.g.onreadystatechange = w(this.Ob, this);
  try {
    W(this.q, Y(this, "Opening Xhr")), this.mb = !0, this.g.open(b, a, !0), this.mb = !1
  }catch(f) {
    W(this.q, Y(this, "Error opening Xhr: " + f.message));
    jd(this, f);
    return
  }
  a = c || "";
  var g = this.headers.n();
  d && E(d, function(a, b) {
    g.set(b, a)
  });
  d = q.FormData && a instanceof q.FormData;
  "POST" != b || (g.ia("Content-Type") || d) || g.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
  E(g, function(a, b) {
    this.g.setRequestHeader(b, a)
  }, this);
  this.Wb && (this.g.responseType = this.Wb);
  "withCredentials" in this.g && (this.g.withCredentials = this.cc);
  try {
    this.fa && (q.clearTimeout(this.fa), this.fa = null), 0 < this.$a && (W(this.q, Y(this, "Will abort after " + this.$a + "ms if incomplete")), this.fa = q.setTimeout(w(this.Da, this), this.$a)), W(this.q, Y(this, "Sending request")), this.Na = !0, this.g.send(a), this.Na = !1
  }catch(h) {
    W(this.q, Y(this, "Send error: " + h.message)), jd(this, h)
  }
};
p.Da = function() {
  "undefined" != typeof ca && this.g && (this.p = "Timed out after " + this.$a + "ms, aborting", this.la = nc, W(this.q, Y(this, this.p)), this.dispatchEvent("timeout"), this.abort(nc))
};
function jd(a, b) {
  a.S = !1;
  a.g && (a.ca = !0, a.g.abort(), a.ca = !1);
  a.p = b;
  a.la = 5;
  kd(a);
  ld(a)
}
function kd(a) {
  a.ib || (a.ib = !0, a.dispatchEvent("complete"), a.dispatchEvent("error"))
}
p.abort = function(a) {
  this.g && this.S && (W(this.q, Y(this, "Aborting")), this.S = !1, this.ca = !0, this.g.abort(), this.ca = !1, this.la = a || mc, this.dispatchEvent("complete"), this.dispatchEvent("abort"), ld(this))
};
p.u = function() {
  this.g && (this.S && (this.S = !1, this.ca = !0, this.g.abort(), this.ca = !1), ld(this, !0));
  hd.ra.u.call(this)
};
p.Ob = function() {
  this.mb || this.Na || this.ca ? md(this) : this.sc()
};
p.sc = function() {
  md(this)
};
function md(a) {
  if(a.S && "undefined" != typeof ca) {
    if(a.bb[1] && 4 == R(a) && 2 == kc(a)) {
      W(a.q, Y(a, "Local request error detected and ignored"))
    }else {
      if(a.Na && 4 == R(a)) {
        q.setTimeout(w(a.Ob, a), 0)
      }else {
        if(a.dispatchEvent("readystatechange"), 4 == R(a)) {
          W(a.q, Y(a, "Request complete"));
          a.S = !1;
          try {
            var b = kc(a), c, d;
            a: {
              switch(b) {
                case 200:
                ;
                case 201:
                ;
                case 202:
                ;
                case 204:
                ;
                case 206:
                ;
                case 304:
                ;
                case 1223:
                  d = !0;
                  break a;
                default:
                  d = !1
              }
            }
            if(!(c = d)) {
              var f;
              if(f = 0 === b) {
                var g = String(a.Pa).match(Qa)[1] || null;
                if(!g && self.location) {
                  var h = self.location.protocol, g = h.substr(0, h.length - 1)
                }
                f = !id.test(g ? g.toLowerCase() : "")
              }
              c = f
            }
            if(c) {
              a.dispatchEvent("complete"), a.dispatchEvent("success")
            }else {
              a.la = 6;
              var n;
              try {
                n = 2 < R(a) ? a.g.statusText : ""
              }catch(k) {
                W(a.q, "Can not get status: " + k.message), n = ""
              }
              a.p = n + " [" + kc(a) + "]";
              kd(a)
            }
          }finally {
            ld(a)
          }
        }
      }
    }
  }
}
function ld(a, b) {
  if(a.g) {
    var c = a.g, d = a.bb[0] ? ea : null;
    a.g = null;
    a.bb = null;
    a.fa && (q.clearTimeout(a.fa), a.fa = null);
    b || a.dispatchEvent("ready");
    try {
      c.onreadystatechange = d
    }catch(f) {
      a.q.I("Problem encountered resetting onreadystatechange: " + f.message)
    }
  }
}
p.isActive = function() {
  return!!this.g
};
function R(a) {
  return a.g ? a.g.readyState : 0
}
function kc(a) {
  try {
    return 2 < R(a) ? a.g.status : -1
  }catch(b) {
    return a.q.$("Can not get status: " + b.message), -1
  }
}
function lc(a) {
  try {
    return a.g ? a.g.responseText : ""
  }catch(b) {
    return W(a.q, "Can not get responseText: " + b.message), ""
  }
}
p.Eb = function() {
  return u(this.p) ? this.p : String(this.p)
};
function Y(a, b) {
  return b + " [" + a.Jb + " " + a.Pa + " " + kc(a) + "]"
}
;function nd() {
  this.Vb = x()
}
new nd;
nd.prototype.set = m("Vb");
nd.prototype.reset = function() {
  this.set(x())
};
nd.prototype.get = aa("Vb");
function od(a, b, c, d, f) {
  (new X).debug("TestLoadImageWithRetries: " + f);
  if(0 == d) {
    c(!1)
  }else {
    var g = f || 0;
    d--;
    pd(a, b, function(f) {
      f ? c(!0) : q.setTimeout(function() {
        od(a, b, c, d, g)
      }, g)
    })
  }
}
function pd(a, b, c) {
  function d(a, b) {
    return function() {
      try {
        f.debug("TestLoadImage: " + b), g.onload = null, g.onerror = null, g.onabort = null, g.ontimeout = null, q.clearTimeout(h), c(a)
      }catch(d) {
        xc(f, d)
      }
    }
  }
  var f = new X;
  f.debug("TestLoadImage: loading " + a);
  var g = new Image, h = null;
  g.onload = d(!0, "loaded");
  g.onerror = d(!1, "error");
  g.onabort = d(!1, "abort");
  g.ontimeout = d(!1, "timeout");
  h = q.setTimeout(function() {
    if(g.ontimeout) {
      g.ontimeout()
    }
  }, b);
  g.src = a
}
;function qd(a, b) {
  this.b = a;
  this.a = b;
  this.P = new gd(null, !0)
}
p = qd.prototype;
p.v = null;
p.A = null;
p.Ua = !1;
p.ac = null;
p.Ka = null;
p.nb = null;
p.H = null;
p.c = null;
p.h = -1;
p.L = null;
p.wa = null;
p.Y = m("v");
p.Zb = m("P");
p.gb = function(a) {
  this.H = a;
  a = rd(this.b, this.H);
  T(sd);
  this.ac = x();
  var b = this.b.Cb;
  null != b ? (this.L = this.b.correctHostPrefix(b[0]), (this.wa = b[1]) ? (this.c = 1, td(this)) : (this.c = 2, ud(this))) : (qb(a, "MODE", "init"), this.A = new Q(this, this.a, void 0, void 0, void 0), this.A.Y(this.v), hc(this.A, a, !1, null, !0), this.c = 0)
};
function td(a) {
  var b = vd(a.b, a.wa, "/mail/images/cleardot.gif");
  J(b);
  od(b.toString(), 5E3, w(a.ic, a), 3, 2E3);
  a.G(jc)
}
p.ic = function(a) {
  if(a) {
    this.c = 2, ud(this)
  }else {
    T(wd);
    var b = this.b;
    b.a.debug("Test Connection Blocked");
    b.h = b.U.h;
    Z(b, 9)
  }
  a && this.G(pc)
};
function ud(a) {
  a.a.debug("TestConnection: starting stage 2");
  a.A = new Q(a, a.a, void 0, void 0, void 0);
  a.A.Y(a.v);
  var b = xd(a.b, a.L, a.H);
  T(yd);
  if(ec()) {
    qb(b, "TYPE", "xmlhttp"), hc(a.A, b, !1, a.L, !1)
  }else {
    qb(b, "TYPE", "html");
    var c = a.A;
    a = Boolean(a.L);
    c.sa = 3;
    c.T = J(b.n());
    Cc(c, a)
  }
}
p.hb = function(a) {
  return this.b.hb(a)
};
p.abort = function() {
  this.A && (this.A.cancel(), this.A = null);
  this.h = -1
};
p.Hb = ba(!1);
p.Pb = function(a, b) {
  this.h = a.h;
  if(0 == this.c) {
    if(this.a.debug("TestConnection: Got data for stage 1"), b) {
      try {
        var c = this.P.parse(b)
      }catch(d) {
        xc(this.a, d);
        zd(this.b, this);
        return
      }
      this.L = this.b.correctHostPrefix(c[0]);
      this.wa = c[1]
    }else {
      this.a.debug("TestConnection: Null responseText"), zd(this.b, this)
    }
  }else {
    if(2 == this.c) {
      if(this.Ua) {
        T(Ad), this.nb = x()
      }else {
        if("11111" == b) {
          if(T(Bd), this.Ua = !0, this.Ka = x(), c = this.Ka - this.ac, ec() || 500 > c) {
            this.h = 200, this.A.cancel(), this.a.debug("Test connection succeeded; using streaming connection"), T(Cd), Dd(this.b, this, !0)
          }
        }else {
          T(Ed), this.Ka = this.nb = x(), this.Ua = !1
        }
      }
    }
  }
};
p.ma = function() {
  this.h = this.A.h;
  if(!this.A.J) {
    this.a.debug("TestConnection: request failed, in state " + this.c), 0 == this.c ? T(Fd) : 2 == this.c && T(Gd), zd(this.b, this)
  }else {
    if(0 == this.c) {
      this.a.debug("TestConnection: request complete for initial check"), this.wa ? (this.c = 1, td(this)) : (this.c = 2, ud(this))
    }else {
      if(2 == this.c) {
        this.a.debug("TestConnection: request complete for stage 2");
        var a = !1;
        (a = ec() ? this.Ua : 200 > this.nb - this.Ka ? !1 : !0) ? (this.a.debug("Test connection succeeded; using streaming connection"), T(Cd), Dd(this.b, this, !0)) : (this.a.debug("Test connection failed; not using streaming"), T(Hd), Dd(this.b, this, !1))
      }
    }
  }
};
p.Ya = function() {
  return this.b.Ya()
};
p.isActive = function() {
  return this.b.isActive()
};
p.G = function(a) {
  this.b.G(a)
};
function Id(a, b) {
  this.vb = a || null;
  this.c = Jd;
  this.s = [];
  this.Q = [];
  this.a = new X;
  this.P = new gd(null, !0);
  this.Cb = b || null
}
function Kd(a, b) {
  this.Lb = a;
  this.map = b;
  this.Fc = null
}
p = Id.prototype;
p.v = null;
p.xa = null;
p.o = null;
p.k = null;
p.H = null;
p.La = null;
p.ub = null;
p.L = null;
p.fc = !0;
p.Aa = 0;
p.qc = 0;
p.Ja = !1;
p.e = null;
p.F = null;
p.M = null;
p.ba = null;
p.U = null;
p.rb = null;
p.ec = !0;
p.ya = -1;
p.Kb = -1;
p.h = -1;
p.V = 0;
p.ga = 0;
p.gc = 5E3;
p.Bc = 1E4;
p.kb = 2;
p.Db = 2E4;
p.oa = 0;
p.Za = !1;
p.ha = 8;
var Jd = 1, Ld = new Sb;
function Md(a, b) {
  N.call(this, "statevent", a);
  this.Pc = b
}
y(Md, N);
function Nd(a, b, c, d) {
  N.call(this, "timingevent", a);
  this.size = b;
  this.Nc = c;
  this.Mc = d
}
y(Nd, N);
var jc = 1, pc = 2, oc = 3, Fc = 4;
function Od(a, b) {
  N.call(this, "serverreachability", a);
  this.Lc = b
}
y(Od, N);
var sd = 3, wd = 4, yd = 5, Bd = 6, Ad = 7, Ed = 8, Fd = 9, Gd = 10, Hd = 11, Cd = 12, uc = 13, vc = 14, zc = 15, Ac = 16, Bc = 17, Hc = 18, Dc = 22, fd = "y2f%";
p = Id.prototype;
p.gb = function(a, b, c, d, f) {
  this.a.debug("connect()");
  T(0);
  this.H = b;
  this.xa = c || {};
  d && void 0 !== f && (this.xa.OSID = d, this.xa.OAID = f);
  this.a.debug("connectTest_()");
  Pd(this) && (this.U = new qd(this, this.a), this.U.Y(this.v), this.U.Zb(this.P), this.U.gb(a))
};
p.disconnect = function() {
  this.a.debug("disconnect()");
  Qd(this);
  if(3 == this.c) {
    var a = this.Aa++, b = this.La.n();
    I(b, "SID", this.Z);
    I(b, "RID", a);
    I(b, "TYPE", "terminate");
    Rd(this, b);
    a = new Q(this, this.a, this.Z, a, void 0);
    a.sa = 2;
    a.T = J(b.n());
    b = new Image;
    b.src = a.T;
    b.onload = b.onerror = w(a.lc, a);
    a.pa = x();
    ic(a)
  }
  Td(this)
};
function Qd(a) {
  a.U && (a.U.abort(), a.U = null);
  a.k && (a.k.cancel(), a.k = null);
  a.M && (q.clearTimeout(a.M), a.M = null);
  Ud(a);
  a.o && (a.o.cancel(), a.o = null);
  a.F && (q.clearTimeout(a.F), a.F = null)
}
p.Y = m("v");
p.$b = m("oa");
p.Hb = function() {
  return 0 == this.c
};
p.Zb = m("P");
function Vd(a) {
  a.o || a.F || (a.F = U(w(a.Rb, a), 0), a.V = 0)
}
p.Rb = function(a) {
  this.F = null;
  this.a.debug("startForwardChannel_");
  if(Pd(this)) {
    if(this.c == Jd) {
      if(a) {
        this.a.I("Not supposed to retry the open")
      }else {
        this.a.debug("open_()");
        this.Aa = Math.floor(1E5 * Math.random());
        a = this.Aa++;
        var b = new Q(this, this.a, "", a, void 0);
        b.Y(this.v);
        var c = Wd(this), d = this.La.n();
        I(d, "RID", a);
        this.vb && I(d, "CVER", this.vb);
        Rd(this, d);
        fc(b, d, c);
        this.o = b;
        this.c = 2
      }
    }else {
      3 == this.c && (a ? Xd(this, a) : 0 == this.s.length ? this.a.debug("startForwardChannel_ returned: nothing to send") : this.o ? this.a.I("startForwardChannel_ returned: connection already in progress") : (Xd(this), this.a.debug("startForwardChannel_ finished, sent request")))
    }
  }
};
function Xd(a, b) {
  var c, d;
  b ? 6 < a.ha ? (a.s = a.Q.concat(a.s), a.Q.length = 0, c = a.Aa - 1, d = Wd(a)) : (c = b.B, d = b.X) : (c = a.Aa++, d = Wd(a));
  var f = a.La.n();
  I(f, "SID", a.Z);
  I(f, "RID", c);
  I(f, "AID", a.ya);
  Rd(a, f);
  c = new Q(a, a.a, a.Z, c, a.V + 1);
  c.Y(a.v);
  c.setTimeout(Math.round(0.5 * a.Db) + Math.round(0.5 * a.Db * Math.random()));
  a.o = c;
  fc(c, f, d)
}
function Rd(a, b) {
  if(a.e) {
    var c = a.e.getAdditionalParams(a);
    c && E(c, function(a, c) {
      I(b, c, a)
    })
  }
}
function Wd(a) {
  var b = Math.min(a.s.length, 1E3), c = ["count=" + b], d;
  6 < a.ha && 0 < b ? (d = a.s[0].Lb, c.push("ofs=" + d)) : d = 0;
  for(var f = 0;f < b;f++) {
    var g = a.s[f].Lb, h = a.s[f].map, g = 6 >= a.ha ? f : g - d;
    try {
      E(h, function(a, b) {
        c.push("req" + g + "_" + b + "=" + encodeURIComponent(a))
      })
    }catch(n) {
      c.push("req" + g + "_type=" + encodeURIComponent("_badmap")), a.e && a.e.badMapError(a, h)
    }
  }
  a.Q = a.Q.concat(a.s.splice(0, b));
  return c.join("&")
}
function Yd(a) {
  a.k || a.M || (a.tb = 1, a.M = U(w(a.Qb, a), 0), a.ga = 0)
}
function Zd(a) {
  if(a.k || a.M) {
    return a.a.I("Request already in progress"), !1
  }
  if(3 <= a.ga) {
    return!1
  }
  a.a.debug("Going to retry GET");
  a.tb++;
  a.M = U(w(a.Qb, a), $d(a, a.ga));
  a.ga++;
  return!0
}
p.Qb = function() {
  this.M = null;
  if(Pd(this)) {
    this.a.debug("Creating new HttpRequest");
    this.k = new Q(this, this.a, this.Z, "rpc", this.tb);
    this.k.Y(this.v);
    this.k.$b(this.oa);
    var a = this.ub.n();
    I(a, "RID", "rpc");
    I(a, "SID", this.Z);
    I(a, "CI", this.rb ? "0" : "1");
    I(a, "AID", this.ya);
    Rd(this, a);
    if(ec()) {
      I(a, "TYPE", "xmlhttp"), hc(this.k, a, !0, this.L, !1)
    }else {
      I(a, "TYPE", "html");
      var b = this.k, c = Boolean(this.L);
      b.sa = 3;
      b.T = J(a.n());
      Cc(b, c)
    }
    this.a.debug("New Request created")
  }
};
function Pd(a) {
  if(a.e) {
    var b = a.e.okToMakeRequest(a);
    if(0 != b) {
      return a.a.debug("Handler returned error code from okToMakeRequest"), Z(a, b), !1
    }
  }
  return!0
}
function Dd(a, b, c) {
  a.a.debug("Test Connection Finished");
  a.rb = a.ec && c;
  a.h = b.h;
  a.a.debug("connectChannel_()");
  a.jc(Jd, 0);
  a.La = rd(a, a.H);
  Vd(a)
}
function zd(a, b) {
  a.a.debug("Test Connection Failed");
  a.h = b.h;
  Z(a, 2)
}
p.Pb = function(a, b) {
  if(0 != this.c && (this.k == a || this.o == a)) {
    if(this.h = a.h, this.o == a && 3 == this.c) {
      if(7 < this.ha) {
        var c;
        try {
          c = this.P.parse(b)
        }catch(d) {
          c = null
        }
        if(s(c) && 3 == c.length) {
          var f = c;
          if(0 == f[0]) {
            a: {
              if(this.a.debug("Server claims our backchannel is missing."), this.M) {
                this.a.debug("But we are currently starting the request.")
              }else {
                if(this.k) {
                  if(this.k.pa + 3E3 < this.o.pa) {
                    Ud(this), this.k.cancel(), this.k = null
                  }else {
                    break a
                  }
                }else {
                  this.a.$("We do not have a BackChannel established")
                }
                Zd(this);
                T(19)
              }
            }
          }else {
            this.Kb = f[1], c = this.Kb - this.ya, 0 < c && (f = f[2], this.a.debug(f + " bytes (in " + c + " arrays) are outstanding on the BackChannel"), 37500 > f && (this.rb && 0 == this.ga) && !this.ba && (this.ba = U(w(this.rc, this), 6E3)))
          }
        }else {
          this.a.debug("Bad POST response data returned"), Z(this, 11)
        }
      }else {
        b != fd && (this.a.debug("Bad data returned - missing/invald magic cookie"), Z(this, 11))
      }
    }else {
      if(this.k == a && Ud(this), !/^[\s\xa0]*$/.test(b)) {
        c = this.P.parse(b);
        for(var f = this.e && this.e.channelHandleMultipleArrays ? [] : null, g = 0;g < c.length;g++) {
          var h = c[g];
          this.ya = h[0];
          h = h[1];
          2 == this.c ? "c" == h[0] ? (this.Z = h[1], this.L = this.correctHostPrefix(h[2]), h = h[3], this.ha = null != h ? h : 6, this.c = 3, this.e && this.e.channelOpened(this), this.ub = xd(this, this.L, this.H), Yd(this)) : "stop" == h[0] && Z(this, 7) : 3 == this.c && ("stop" == h[0] ? (f && f.length && (this.e.channelHandleMultipleArrays(this, f), f.length = 0), Z(this, 7)) : "noop" != h[0] && (f ? f.push(h) : this.e && this.e.channelHandleArray(this, h)), this.ga = 0)
        }
        f && f.length && this.e.channelHandleMultipleArrays(this, f)
      }
    }
  }
};
p.correctHostPrefix = function(a) {
  return this.fc ? this.e ? this.e.correctHostPrefix(a) : a : null
};
p.rc = function() {
  null != this.ba && (this.ba = null, this.k.cancel(), this.k = null, Zd(this), T(20))
};
function Ud(a) {
  null != a.ba && (q.clearTimeout(a.ba), a.ba = null)
}
p.ma = function(a) {
  this.a.debug("Request complete");
  var b;
  if(this.k == a) {
    Ud(this), this.k = null, b = 2
  }else {
    if(this.o == a) {
      this.o = null, b = 1
    }else {
      return
    }
  }
  this.h = a.h;
  if(0 != this.c) {
    if(a.J) {
      1 == b ? (b = x() - a.pa, Ld.dispatchEvent(new Nd(Ld, a.X ? a.X.length : 0, b, this.V)), Vd(this), this.Q.length = 0) : Yd(this)
    }else {
      var c = a.Eb();
      if(3 == c || 7 == c || 0 == c && 0 < this.h) {
        this.a.debug("Not retrying due to error type")
      }else {
        this.a.debug("Maybe retrying, last error: " + bc(c, this.h));
        var d;
        if(d = 1 == b) {
          this.o || this.F ? (this.a.I("Request already in progress"), d = !1) : this.c == Jd || this.V >= (this.Ja ? 0 : this.kb) ? d = !1 : (this.a.debug("Going to retry POST"), this.F = U(w(this.Rb, this, a), $d(this, this.V)), this.V++, d = !0)
        }
        if(d || 2 == b && Zd(this)) {
          return
        }
        this.a.debug("Exceeded max number of retries")
      }
      this.a.debug("Error: HTTP request failed");
      switch(c) {
        case 1:
          Z(this, 5);
          break;
        case 4:
          Z(this, 10);
          break;
        case 3:
          Z(this, 6);
          break;
        case 7:
          Z(this, 12);
          break;
        default:
          Z(this, 2)
      }
    }
  }
};
function $d(a, b) {
  var c = a.gc + Math.floor(Math.random() * a.Bc);
  a.isActive() || (a.a.debug("Inactive channel"), c *= 2);
  return c * b
}
p.jc = function(a) {
  if(!(0 <= Xa(arguments, this.c))) {
    throw Error("Unexpected channel state: " + this.c);
  }
};
function Z(a, b) {
  a.a.info("Error code " + b);
  if(2 == b || 9 == b) {
    var c = null;
    a.e && (c = a.e.getNetworkTestImageUri(a));
    var d = w(a.Dc, a);
    c || (c = new F("//www.google.com/images/cleardot.gif"), J(c));
    pd(c.toString(), 1E4, d)
  }else {
    T(2)
  }
  ae(a, b)
}
p.Dc = function(a) {
  a ? (this.a.info("Successfully pinged google.com"), T(2)) : (this.a.info("Failed to ping google.com"), T(1), ae(this, 8))
};
function ae(a, b) {
  a.a.debug("HttpChannel: error - " + b);
  a.c = 0;
  a.e && a.e.channelError(a, b);
  Td(a);
  Qd(a)
}
function Td(a) {
  a.c = 0;
  a.h = -1;
  if(a.e) {
    if(0 == a.Q.length && 0 == a.s.length) {
      a.e.channelClosed(a)
    }else {
      a.a.debug("Number of undelivered maps, pending: " + a.Q.length + ", outgoing: " + a.s.length);
      var b = $a(a.Q), c = $a(a.s);
      a.Q.length = 0;
      a.s.length = 0;
      a.e.channelClosed(a, b, c)
    }
  }
}
function rd(a, b) {
  var c = vd(a, null, b);
  a.a.debug("GetForwardChannelUri: " + c);
  return c
}
function xd(a, b, c) {
  b = vd(a, a.Ya() ? b : null, c);
  a.a.debug("GetBackChannelUri: " + b);
  return b
}
function vd(a, b, c) {
  var d = c instanceof F ? c.n() : new F(c, void 0);
  if("" != d.ja) {
    b && fb(d, b + "." + d.ja), gb(d, d.Ba)
  }else {
    var f = window.location, d = sb(f.protocol, b ? b + "." + f.hostname : f.hostname, f.port, c)
  }
  a.xa && E(a.xa, function(a, b) {
    I(d, b, a)
  });
  I(d, "VER", a.ha);
  Rd(a, d);
  return d
}
p.hb = function(a) {
  if(a && !this.Za) {
    throw Error("Can't create secondary domain capable XhrIo object.");
  }
  a = new hd;
  a.cc = this.Za;
  return a
};
p.isActive = function() {
  return!!this.e && this.e.isActive(this)
};
function U(a, b) {
  if(!ha(a)) {
    throw Error("Fn must not be null and must be a function");
  }
  return q.setTimeout(function() {
    a()
  }, b)
}
p.G = function(a) {
  Ld.dispatchEvent(new Od(Ld, a))
};
function T(a) {
  Ld.dispatchEvent(new Md(Ld, a))
}
p.Ya = function() {
  return this.Za || !ec()
};
function be() {
}
p = be.prototype;
p.channelHandleMultipleArrays = null;
p.okToMakeRequest = ba(0);
p.channelOpened = e();
p.channelHandleArray = e();
p.channelError = e();
p.channelClosed = e();
p.getAdditionalParams = function() {
  return{}
};
p.getNetworkTestImageUri = ba(null);
p.isActive = ba(!0);
p.badMapError = e();
p.correctHostPrefix = function(a) {
  return a
};
var $, ce, de = [].slice;
ce = {0:"Ok", 4:"User is logging out", 6:"Unknown session ID", 7:"Stopped by server", 8:"General network error", 2:"Request failed", 9:"Blocked by a network administrator", 5:"No data from server", 10:"Got bad data from the server", 11:"Got a bad response from the server"};
$ = function(a, b) {
  var c, d, f, g, h, n, k, t, l, r;
  t = this;
  a || (a = "channel");
  console.log( a )
  a.match(/:\/\//) && a.replace(/^ws/, "http");
  console.log( a )
  b || (b = {});
  s(b || "string" === typeof b) && (b = {});
  n = b.reconnectTime || 3E3;
  r = function(a) {
    t.readyState = t.readyState = a
  };
  r(this.CLOSED);
  l = null;
  g = b.Kc;
  c = function() {
    var a, b;
    b = arguments[0];
    a = 2 <= arguments.length ? de.call(arguments, 1) : [];
    try {
      return"function" === typeof t[b] ? t[b].apply(t, a) : void 0
    }catch(c) {
      throw a = c, "undefined" !== typeof console && null !== console && console.error(a.stack), a;
    }
  };
  d = new be;
  d.channelOpened = function() {
    g = l;
    r($.OPEN);
    return c("onopen")
  };
  f = null;
  d.channelError = function(a, b) {
    var d;
    d = ce[b];
    f = b;
    r($.cb);
    try {
      return c("onerror", d, b)
    }catch(g) {
    }
  };
  k = null;
  d.channelClosed = function(a, d, g) {
    if(t.readyState !== $.CLOSED) {
      l = null;
      a = f ? ce[f] : "Closed";
      r($.CLOSED);
      try {
        c("onclose", a, d, g)
      }catch(ee) {
      }
      b.reconnect && (7 !== f && 0 !== f) && (d = 6 === f ? 0 : n, clearTimeout(k), k = setTimeout(h, d));
      return f = null
    }
  };
  d.channelHandleArray = function(a, b) {
    return c("onmessage", b)
  };
  h = function() {
    if(l) {
      throw Error("Reconnect() called from invalid state");
    }
    r($.CONNECTING);
    c("onconnecting");
    clearTimeout(k);
    l = new Id(b.appVersion, null != g ? g.Cb : void 0);
    b.crossDomainXhr && (l.Za = !0);
    l.e = d;
    f = null;
    if(b.failFast) {
      var h = l;
      h.Ja = !0;
      h.a.info("setFailFast: true");
      (h.o || h.F) && h.V > (h.Ja ? 0 : h.kb) && (h.a.info("Retry count " + h.V + " > new maxRetries " + (h.Ja ? 0 : h.kb) + ". Fail immediately!"), h.o ? (h.o.cancel(), h.ma(h.o)) : (q.clearTimeout(h.F), h.F = null, Z(h, 2)))
    }
    return l.gb("" + a + "/test", "" + a + "/bind", b.extraParams, null != g ? g.Z : void 0, null != g ? g.ya : void 0)
  };
  this.open = function() {
    if(t.readyState !== t.CLOSED) {
      throw Error("Already open");
    }
    return h()
  };
  this.close = function() {
    clearTimeout(k);
    f = 0;
    if(t.readyState !== $.CLOSED) {
      return r($.cb), l.disconnect()
    }
  };
  this.sendMap = function(a) {
    var b;
    if((b = t.readyState) === $.cb || b === $.CLOSED) {
      throw Error("Cannot send to a closed connection");
    }
    b = l;
    if(0 == b.c) {
      throw Error("Invalid operation: sending map when state is closed");
    }
    1E3 == b.s.length && b.a.I("Already have 1000 queued maps upon queueing " + Kc(a));
    b.s.push(new Kd(b.qc++, a));
    2 != b.c && 3 != b.c || Vd(b)
  };
  this.send = function(a) {
    return this.sendMap({JSON:Kc(a)})
  };
  h();
  return this
};
$.prototype.CONNECTING = $.CONNECTING = $.CONNECTING = 0;
$.prototype.OPEN = $.OPEN = $.OPEN = 1;
$.prototype.CLOSING = $.CLOSING = $.cb = 2;
$.prototype.CLOSED = $.CLOSED = $.CLOSED = 3;
("undefined" !== typeof exports && null !== exports ? exports : window).BCSocket = $;

})();

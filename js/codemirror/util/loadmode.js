define(['codemirror/codemirror'], function(_CodeMirror) {
	//console.log("running loadmod?");
	//console.log("CODEMIRROR", _CodeMirror);
  if (!_CodeMirror.modeURL) _CodeMirror.modeURL = "../mode/%N/%N.js";

  var loading = {};
  function splitCallback(cont, n) {
    var countDown = n;
    return function() { if (--countDown == 0) cont(); }
  }
  function ensureDeps(mode, cont) {
    var deps = _CodeMirror.modes[mode].dependencies;
    if (!deps) return cont();
    var missing = [];
    for (var i = 0; i < deps.length; ++i) {
      if (!_CodeMirror.modes.hasOwnProperty(deps[i]))
        missing.push(deps[i]);
    }
    if (!missing.length) return cont();
    var split = splitCallback(cont, missing.length);
    for (var i = 0; i < missing.length; ++i)
      _CodeMirror.requireMode(missing[i], split);
  }

  _CodeMirror.requireMode = function(mode, cont) {
    if (_CodeMirror.modes.hasOwnProperty(mode)) return ensureDeps(mode, cont());
    if (loading.hasOwnProperty(mode)) return loading[mode].push(cont);

    var script = document.createElement("script");
    script.src = _CodeMirror.modeURL.replace(/%N/g, mode);
    var others = document.getElementsByTagName("script")[0];
    others.parentNode.insertBefore(script, others);
    var list = loading[mode] = [cont];
    var count = 0, poll = setInterval(function() {
      if (++count > 100) return clearInterval(poll);
      if (_CodeMirror.modes.hasOwnProperty(mode)) {
        clearInterval(poll);
        loading[mode] = null;
        ensureDeps(mode, function() {
          for (var i = 0; i < list.length; ++i) list[i]();
        });
      }
    }, 200);
  };

  _CodeMirror.autoLoadMode = function(instance, mode) {
    if (!_CodeMirror.modes.hasOwnProperty(mode))
      _CodeMirror.requireMode(mode, function() {
        instance.setOption("mode", instance.getOption("mode"));
      });
  };
  return true;
});

require( '../node_modules/tern/doc/demo/polyfill.js' )
require( '../node_modules/tern/lib/signal.js' )

// seemingly required as global by codemirror addon (sheesh)
window.tern = require( '../node_modules/tern/lib/tern.js' )

require( '../node_modules/tern/lib/def.js' )
require( '../node_modules/tern/lib/comment.js' )
require( '../node_modules/tern/lib/infer.js' )
require( '../node_modules/tern/plugin/doc_comment.js' )
require( '../node_modules/codemirror/addon/tern/tern.js' )

module.exports = function( Gibber, cm, environment ) {
  const CodeMirror = environment.CodeMirror
  const filter = function( doc, query, request,error,data ) {
    debugger
  } 

  let server
  fetch('./gibber.def.json')
    .then( r=>r.json() )
    .then( def => {
    environment.server = server = new CodeMirror.TernServer({defs: [def], options:{ hintDelay:5000, responseFilter:filter } })

    cm.setOption("extraKeys", {
      "Ctrl-Space": function(cm) { server.complete(cm) },
      "Ctrl-I"    : function(cm) { server.showType(cm) },
      "Ctrl-O"    : function(cm) { server.showDocs(cm) }
    })

    cm.on( 'cursorActivity', function( cm ) { 
      if( environment.showArgHints === true ) {
        server.updateArgHints( cm ) 
      }
    })

    cm.on( 'change', function( cm, change ) {
      if( environment.showCompletions === true ) {
        if( change.text[ change.text.length - 1 ] === '.' ) {
          //console.log( 'complete' )
          server.complete( cm )
        }
      }
    })
  })

  /*
  cm.getWrapperElement().addEventListener( 'click', e => {
    if( e.altKey === true ) {
      let obj
      let node = e.path[0]
      while( node.parentNode.className.indexOf( 'CodeMirror-line' ) === -1 ) {
        node = node.parentNode
      }
      const split = node.innerText.split( '=' )[0].split('.')
      let txt = null
      try {
        obj = window[  split[0].trim() ]
        for( let i = 1; i < split.length; i++ ) {
          obj = obj[ split[ i ].trim() ]
        }
        if( obj !== undefined )
          txt = obj.value !== undefined ? obj.value : obj
      } catch(e) {
        throw e
      }

      if( obj !== undefined ) {
        // XXX ideally this would return a promise that we could use to insert the current
        // value of the property into once the DOM node has been added. 
        // Instead we have to use a hacky setTimeout... to fix this we need to edit
        // the ternserver itself.
        server.showDocs( cm ) 

        setTimeout( ()=>{
          cm.state.ternTooltip.children[0].innerHTML = `value: ${txt} ${cm.state.ternTooltip.children[0].innerHTML}`
        }, 50 )
      }
    }
  })
  */

  var Pos = CodeMirror.Pos;
  var cls = "CodeMirror-Tern-";
  var bigDoc = 250;
  function elt(tagname, cls /*, ... elts*/) {
    var e = document.createElement(tagname);
    if (cls) e.className = cls;
    for (var i = 2; i < arguments.length; ++i) {
      var elt = arguments[i];
      if (typeof elt == "string") elt = document.createTextNode(elt);
      e.appendChild(elt);
    }
    return e;
  }
  function tempTooltip(cm, content, ts) {
    if (cm.state.ternTooltip) remove(cm.state.ternTooltip);
    var where = cm.cursorCoords();
    var tip = cm.state.ternTooltip = makeTooltip(where.right + 1, where.bottom, content);
    function maybeClear() {
      old = true;
      if (!mouseOnTip) clear();
    }
    function clear() {
      cm.state.ternTooltip = null;
      if (tip.parentNode) fadeOut(tip)
      clearActivity()
    }
    var mouseOnTip = false, old = false;
    CodeMirror.on(tip, "mousemove", function() { mouseOnTip = true; });
    CodeMirror.on(tip, "mouseout", function(e) {
      var related = e.relatedTarget || e.toElement
      if (!related || !CodeMirror.contains(tip, related)) {
        if (old) clear();
        else mouseOnTip = false;
      }
    });
    setTimeout(maybeClear, ts.options.hintDelay ? ts.options.hintDelay : 1700);
    var clearActivity = onEditorActivity(cm, clear)
  }

  function onEditorActivity(cm, f) {
    cm.on("cursorActivity", f)
    cm.on("blur", f)
    cm.on("scroll", f)
    cm.on("setDoc", f)
    return function() {
      cm.off("cursorActivity", f)
      cm.off("blur", f)
      cm.off("scroll", f)
      cm.off("setDoc", f)
    }
  }

  function makeTooltip(x, y, content) {
    var node = elt( "div", cls + "tooltip", content )
    node.style.left = x + "px"
    node.style.top = y + "px"
    document.body.appendChild( node )
    return node
  }

  function remove(node) {
    var p = node && node.parentNode;
    if (p) p.removeChild(node);
  }

  function fadeOut(tooltip) {
    tooltip.style.opacity = "0";
    setTimeout(function() { remove(tooltip); }, 1100);
  }


}

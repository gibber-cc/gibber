// need to set it up so a seq parameter with random attached to it highlights members of the array that are picked not the whole statement

define(['esprima'], function(esp) {
  Notation = {
    esprima : esp,
    flash: function(cm, pos) {
      if (typeof pos.line != 'undefined') {
        v = cm.getLine(pos.line);

        cm.setLineClass(pos.line, null, "highlightLine")

        var cb = (function() {
            cm.setLineClass(pos.line, null, null);
        });

        window.setTimeout(cb, 250);

      } else {
        var sel = cm.markText(cm.getCursor(true), cm.getCursor(false), "highlightLine");

        var cb = (function() {
            sel.clear();
        });

        window.setTimeout(cb, 250);
      }
    },
    init : function() {
      //Gibber.runScript = Notation.runScript;
      Gibber.Environment.flash = this.flash;
      
      CodeMirror.keyMap.gibber['Ctrl-Enter'] = function(cm) {
        var v = cm.getSelection();
        var pos = null;

        if (v === "") {
            pos = cm.getCursor();
            v = cm.getLine( pos.line );
        }else{
          pos = {
            start : cm.getCursor(true),
            end : cm.getCursor(false),
          }
        }
        
        Gibber.Environment.flash(cm, pos);
        Notation.runScript( v, pos, cm );
      }
      
      CodeMirror.keyMap.gibber['Shift-Ctrl-Enter'] = function(cm) {
          var v = cm.getSelection();
          var pos = null;
          
          if (v === "") {
              pos = cm.getCursor();
              v = cm.getLine( pos.line );
          }else{
            pos = {
              start : cm.getCursor(true),
              end : cm.getCursor(false),
            }
          }
          
          var func = function() {
            Notation.runScript( v, pos, cm );
          }

          Gibber.Environment.flash(cm, pos);
          Gibber.callback.addCallback(func, _1);
      }
    },
    
    processSeq : function( seq, _name, cm, pos ) {
      seq.locations = {}
      //for(var key in seq) {
      var props = seq.tree.expression.right.arguments[0].properties;
      
      if(props) {
        for(var i = 0; i < props.length; i++) {
          var prop = props[i];
          //console.log("PROP:", prop)
          var name = prop.key.name;
          if( seq.properties.indexOf(name) === -1 || name === 'durations') {
            seq.locations[name] = [];
          
            var values = prop.value.elements; 
            if(!values) {
              if(prop.value.callee) { // if it is an array with a random or weight method attached..
                if(prop.value.callee.object)
                  values = prop.value.callee.object.elements; // use the array that is calling the method
              }
            } 
            
            if(values) {
              for(var j = 0; j < values.length; j++) {
                var value = values[j];
              
                var start = {
                  line : value.loc.start.line + pos.start.line - 1,
                  ch : value.loc.start.column
                }
                var end = {
                  line : value.loc.end.line + pos.start.line - 1,
                  ch : value.loc.end.column
                }
                cm.markText(start, end, _name + "_" + name + "_" + j);
                seq.locations[name].push( _name + "_" + name + "_" + j )
              }
              //}else if(prop.value.callee){
              
            }else{
              if(name !== 'durations') console.log(prop)
              var __name = _name + "_" + name + "_0"
            
              var loc = prop.value.loc;
              var start = {
                line : loc.start.line + pos.start.line - 1,
                ch : loc.start.column
              }
              var end = {
                line : loc.end.line + pos.start.line - 1,
                ch : loc.end.column
              }
              //console.log('Location', start, end, loc)
              cm.markText(start, end, __name);
            
              seq.locations[name].push( __name )
            }
            //console.log("FOUND", key)
          }
        }
        seq.chose = function(key, index) {
          //console.log(key, index)
          if(seq.locations[key]) {
            var count = 0;
            if(seq.locations[key][index]) {
              $('.'+seq.locations[key][index]).css({ 
                background:'rgb(180,180,180)',
                transition: 'background-color 100ms linear'
              });
              $('.'+seq.locations[key][index]).on('webkitTransitionEnd', function(e) {
                count++;
                if(count === 1) {
                  $('.'+seq.locations[key][index]).css({ 
                    background:'rgb(150,150,150)',
                    transition: 'background-color 100ms linear'
                  });
                }
              })            
            }
          }
        }
      }
      //console.log(seq.locations)
    },
    
    processDrums : function( seq, _name, cm, pos ) {
      seq.locations = {}
      //for(var key in seq) {
      var prop = seq.tree.expression.right.arguments[0],
          name = 'note';
          
      console.log(seq.tree, prop)
      //if( seq.properties.indexOf(name) === -1 || name === 'durations') {
        seq.locations[name] = []; 
        var values = prop.value.split("");
        // if(!values) {
        //   if(prop.value.callee) { // if it is an array with a random or weight method attached..
        //     if(prop.value.callee.object)
        //       values = prop.value.callee.object.elements; // use the array that is calling the method
        //   }
        // } 
            
        if(values) {
          console.log("VALUES", values);
          for(var j = 0; j < values.length; j++) {
            var value = values[j],
                __name = _name + "_" + name + "_" + j;
          
            var start = {
              line : prop.loc.start.line + pos.start.line - 1,
              ch : prop.loc.start.column + j + 1 // +1 to accommodate beginning quote
            }
            var end = {
              line : prop.loc.end.line + pos.start.line - 1,
              ch : prop.loc.start.column + j + 2
            }
            
            console.log(start, end)
            cm.markText(start, end, __name);
            seq.locations[name].push( __name )
          }
         
        }      
        // }else{
        //   if(name !== 'durations') console.log(prop)
        //   var __name = _name + "_" + name + "_0"
        // 
        //   var loc = prop.value.loc;
        //   var start = {
        //     line : loc.start.line + pos.start.line - 1,
        //     ch : loc.start.column
        //   }
        //   var end = {
        //     line : loc.end.line + pos.start.line - 1,
        //     ch : loc.end.column
        //   }
        //   //console.log('Location', start, end, loc)
        //   cm.markText(start, end, __name);
        // 
        //   seq.locations[name].push( __name )
        // }
        // //console.log("FOUND", key)
        
        seq.seq.chose = function(key, index) {
          //console.log(key, index)
          if(seq.locations[key]) {
            var count = 0;
            if(seq.locations[key][index]) {
              //console.log("animating?", seq.locations[key][index])
              $('.'+seq.locations[key][index]).css({ 
                background:'rgb(180,180,180)',
                transition: 'background-color 100ms linear'
              });
              $('.'+seq.locations[key][index]).on('webkitTransitionEnd', function(e) {
                count++;
                if(count === 1) {
                  $('.'+seq.locations[key][index]).css({ 
                    background:'rgb(150,150,150)',
                    transition: 'background-color 100ms linear'
                  });
                }
              })            
            }
          }
        }
        //}
      //console.log(seq.locations)
    },
		runScript : function(script, pos, cm) {
      var tree = Notation.esprima.parse(script, {loc:true, range:true})
      
      Gibber.runScript(script); // must run script before parsing tree so ugens are present
      
      for(var i=0; i < tree.body.length; i++) {
        var obj = tree.body[i];
        if(obj.type === 'ExpressionStatement') {
          if(obj.expression.type === 'AssignmentExpression') {
            if(obj.expression.left.type === 'Identifier') { // assigning to global and not a property
              var lastChar, name;
              
              if(typeof pos.start === 'undefined') lastChar = cm.lineInfo(pos.line).text.length;
              name = obj.expression.left.name;
              
              //console.log(pos)              
              var marker = typeof pos.start !== 'undefined' 
                ? cm.markText(pos.start, pos.end, name)
                : cm.markText({line:pos.line,ch:0}, {line:pos.line,ch:lastChar}, name);
              
              //console.log(name, marker)
              window[name].marker = marker;
              window[name].tree = obj;
              
              //console.log("NAME", window[name].name)
              if(window[name].name === 'Seq' || window[name].name === 'ScaleSeq') {
                //console.log("SEQ PROCESS");
                Notation.processSeq( window[name], name, cm, pos );
              }else if(window[name].name === 'Drums') {
                Notation.processDrums( window[name], name, cm, pos );
              }

            }
          }
        }
      }
      
		},
  }
  
  return Notation;
})
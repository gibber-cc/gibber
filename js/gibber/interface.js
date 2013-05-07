var __widgetTypes = ['Slider', 'Button', 'XY', 'Knob', 'MultiButton', 'MultiSlider', 'Orientation', 'Accelerometer', 'Menu', 'Label', 'TextField'];

_Interface = {
  panel : null,
  useRemote : false,
  callbacks : {}, // used for live coding remote interfaces
  count : 0,
  Panel : function() {
    var args = arguments[0] || {};
    
    if(args === 'remote') {
      _Interface.useRemote = true;
      var p = {
        clear : function() {
          Gibber.Interface.OSC.send('/interface/clear', '', [] );
        }
      }
      return p;
    }else{
      var d = $("<div>");
      d.css({
        display:'block',
        width: args.width || '35%',
        height: args.height || '100%',
        position:'absolute',
        right:0,
        top:0,
      })
    
      $("#container").append(d);
  
      Gibber.Interface.panel = window.panel = new Interface.Panel({ container:d });
    
      return Gibber.Interface.panel;
    }
  },
  
  init : function( _gibber ) {
    this.OSC.socket = this.Socket;
    this.Socket.onmessage = function (event) {
      Gibber.Interface.OSC._receive( event.data );
    };
    for(var i = 0; i < __widgetTypes.length; i++) {
      (function(){
        var type = __widgetTypes[i];
      
        _gibber.Interface[ type ] = function( args ) {
          args = args || {};
          if(_Interface.useRemote) {
            //console.log("TRYING TO MAKE SLIDER");
            var json = { 'type':type, name:'Slider1' };
            Gibber.Interface.OSC.send('/interface/addWidget', 's', JSON.stringify(json) );
            var obj = {
              target : args.target,
              key: args.key,
            }
            Gibber.Interface.callbacks['/Slider1'] = function(parameters) { 
              obj.target[ obj.key ] = parameters[0];
            };
            
            var min = isNaN(args.min) ? 0 : args.min, max = isNaN(args.max) ? 1 : args.max;
            
            Object.defineProperties(obj, {
              min : {
                get : function() { return min; },
                set : function(val) { 
                  min = val;
                  Gibber.Interface.OSC.send('/interface/setRange', 'sff', [ 'Slider1', min, this.max ] );
                }
              },
              max : {
                get : function() { return max; },
                set : function(val) { 
                  max = val;
                  Gibber.Interface.OSC.send('/interface/setRange', 'sff', [ 'Slider1', this.min, max ] );
                }
              },
            });
            
            return obj;
          }else{
            var a = new Interface[ type ]( args );
          
            a.map = function(_target, _key, _min, _max) {
              a.target = _target;
              a.key = _key;
              if(typeof _min !== 'undefined') {
                a.min = _min;
              }
              if(typeof _max !== 'undefined') {
                a.max = _max;
              }
              return a;
            }
          
            Gibber.Interface.panel.add ( a );
          
            Gibber.Interface.autogui.placeWidget( a );
          }
          
          return a;
        };
      
        window[ type ] = _gibber.Interface[ type ];
      })();
    }
    
    window[ "Panel" ] = this.Panel;
    
    _Interface.OSC.receive = function(address, typetags, parameters) {
      if( typeof _Interface.callbacks[ address ] !== 'undefined' ) {
        _Interface.callbacks[ address ]( parameters );
      }
    };
  },
  
  Socket : new WebSocket('ws://127.0.0.1:8082'),
  
  OSC : {
    socket : null,
    send : function(_address, _typetags, _parameters) {
      if(typeof _address === 'string' && typeof _typetags === 'string') {
        var obj = {
          type : "osc",
          address: _address,
          typetags: _typetags,
          parameters: Array.isArray(_parameters) ? _parameters : [ _parameters ],
        }
        this.socket.send(JSON.stringify(obj));
      }else{
        console.log("INVALID OSC MESSAGE FORMATION", arguments);
      }
    },
    _receive : function( data ) {
      var msg = JSON.parse( data );
      //console.log( msg );
      for(var i = 0; i < Interface.panels.length; i++) {
        for( var j = 0; j < Interface.panels[i].children.length; j++) {
          var child = Interface.panels[i].children[j];
          
          if( child.key === msg.address ) {
            child.setValue( msg.parameters[ 0 ] );
            return;
          }
        }
      }
      this.receive( msg.address, msg.typetags, msg.parameters );
    
    },
    receive : function(address, typetags, parameters) { },
  },
  autogui : {
    hasPageButtons: false,
    children: [
      [{
        "bounds": [0, 0, 1, 1],
        "widget": null,
        "sacrosanct": false,
        "parent": null,
        "id": 0,
        "children": [], 
      },]
    ],

    getBestChildForNewWidget: function(page) {
      var _maxSize = 0;
      page = 0;
      if (typeof this.children[page] === "undefined") {
        this.children[page] = [{
          "bounds": [0, 0, 1, 1],
          "widget": null,
          "sacrosanct": false,
          "parent": null,
          "id": 0,
          "children": [],
        }, ];
      }
      var bestChild = this.children[page][0];

      // TODO include sacrosanct check

      function check(child) {
        if (child.children.length === 0) {
          if (child.widget === null) {
            if (child.bounds[2] + child.bounds[3] > _maxSize) {
              bestChild = child;
              _maxSize = child.bounds[2] + child.bounds[3];
            }
          } else {
            if ((child.bounds[2] + child.bounds[3]) / 2 > _maxSize) {
              bestChild = child;
              _maxSize = (child.bounds[2] + child.bounds[3]) / 2;
            }
          }
        } else {;
          for (var i = 0; i < child.children.length; i++) {
            var _child = child.children[i];
            check(_child, _maxSize);
          }
        }
      }

      check(bestChild);

      return bestChild;
    },

    placeWidget: function(_widget, sacrosanct) {
      if (_widget === null) console.log("ALERT ALERT ALERT ALERT ALERT ALERT ALERT ALERT ALERT ALERT ALERT ALERT");

      var maxSize = 0;
      var bestDiv = -1;
      var bestChild = null;

      bestChild = this.getBestChildForNewWidget(0);

      if (bestChild.widget === null) {
        bestChild.widget = _widget;
        _widget.bounds = bestChild.bounds;
        _widget.div = bestChild;
      } else {
        var w = bestChild.widget;

        var splitDir = (bestChild.bounds[2] > bestChild.bounds[3]) ? 0 : 1; // will the cell be split horizontally or vertically?

        var widgetWidth, widgetHeight;
        widgetWidth = (splitDir == 0) ? bestChild.bounds[2] / 2 : bestChild.bounds[2];
        widgetHeight = (splitDir == 1) ? bestChild.bounds[3] / 2 : bestChild.bounds[3];

        var div1 = {
          "bounds": [bestChild.bounds[0], bestChild.bounds[1], widgetWidth, widgetHeight],
          "widget": w,
          "sacrosanct": false,
          "parent": bestChild,
          "children": [],
        }

        var newDivX = (splitDir == 0) ? bestChild.bounds[0] + widgetWidth : bestChild.bounds[0];
        var newDivY = (splitDir == 1) ? bestChild.bounds[1] + widgetHeight : bestChild.bounds[1];

        var div2 = {
          "bounds": [newDivX, newDivY, widgetWidth, widgetHeight],
          "widget": _widget,
          "sacrosanct": sacrosanct,
          "parent": bestChild,
          "children": [],
        }

        div1.widget.div = div1;
        div1.widget.bounds = div1.bounds;

        div2.widget.bounds = div2.bounds;
        div2.widget.div = div2;

        bestChild.children.push(div1);
        bestChild.children.push(div2);
      }
    },

    removeWidget: function(_widget) {
      _widget.div.widget = null;
      var parent = _widget.div.parent;
      if (parent != null) {
        var childNumber = jQuery.inArray(_widget.div, parent.children);
        // determine if sibling is already empty, if so, remove sibling and self from parent array
        var siblingNumber = (childNumber === 1) ? 0 : 1;
        if (parent.children[siblingNumber].widget == null) {
          parent.children = [];
          parent.widget = null;
        }
      } else {
        _widget.div.children = [];
      }
    },

    reset: function() {
      this.children = [
        [{
          "bounds": [0, 0, 1, 1],
          "widget": null,
          "sacrosanct": false,
          "parent": null,
          "id": 0,
          "children": [],
        },]
      ];
    },

    redoLayout: function() {
      this.children = [
        [{
          "bounds": [0, 0, 1, 1],
          "widget": null,
          "sacrosanct": false,
          "parent": null,
          "id": 0,
          "children": [],
        },]
      ];

      for (var i = 0; i < panel.children.length; i++) {
        var w = panel.children[i];
        this.placeWidget(w);
      }
    },
  },
}

/*var expr, socketAndIPPort, socketString;

//socketIPAndPort = expr.exec( window.location.toString() )[0];
//socketIPAndPort = socketIPAndPort.split(":");

socketString = 'ws://127.0.0.1:8082'

Interface.Socket = new WebSocket( socketString );

Interface.OSC = {
  socket : Interface.Socket,
  send : function(_address, _typetags, _parameters) {
    if(typeof _address === 'string' && typeof _typetags === 'string') {
      var obj = {
        type : "osc",
        address: _address,
        typetags: _typetags,
        parameters: Array.isArray(_parameters) ? _parameters : [ _parameters ],
      }
      this.socket.send(JSON.stringify(obj));
    }else{
      console.log("INVALID OSC MESSAGE FORMATION", arguments);
    }
  },
  _receive : function( data ) {
    var msg = JSON.parse( data );
    console.log( msg );
    for(var i = 0; i < Interface.panels.length; i++) {
      for( var j = 0; j < Interface.panels[i].children.length; j++) {
        var child = Interface.panels[i].children[j];
          
        if( child.key === msg.address ) {
          child.setValue( msg.parameters[ 0 ] );
          return;
        }
      }
    }
    this.receive( msg.address, msg.typetags, msg.parameters );
    
  },
  receive : function(address, typetags, parameters) { },
};

Interface.MIDI = {
  socket: Interface.Socket,
  send : function(messageType, channel, number, value) {
    var obj = null;
    if(Array.isArray( arguments[0] )) {
      // fill in to allow stuff like [145,1,127]
    }else{
      obj = {
        type    : 'midi',
        midiType  : messageType,
        channel   : channel,
        number    : number,
      }
      if(typeof value !== 'undefined') {
        obj.value = value;
      }
      this.socket.send( JSON.stringify( obj ) );
    }
  }
};

Interface.autogui = {
  hasPageButtons: false,
  children: [
    [{
      "bounds": [0, 0, 1, 1],
      "widget": null,
      "sacrosanct": false,
      "parent": null,
      "id": 0,
      "children": [], 
    },]
  ],

  getBestChildForNewWidget: function(page) {
    var _maxSize = 0;
    page = 0;
    if (typeof this.children[page] === "undefined") {
      this.children[page] = [{
        "bounds": [0, 0, 1, 1],
        "widget": null,
        "sacrosanct": false,
        "parent": null,
        "id": 0,
        "children": [],
      }, ];
    }
    var bestChild = this.children[page][0];

    // TODO include sacrosanct check

    function check(child) {
      if (child.children.length === 0) {
        if (child.widget === null) {
          if (child.bounds[2] + child.bounds[3] > _maxSize) {
            bestChild = child;
            _maxSize = child.bounds[2] + child.bounds[3];
          }
        } else {
          if ((child.bounds[2] + child.bounds[3]) / 2 > _maxSize) {
            bestChild = child;
            _maxSize = (child.bounds[2] + child.bounds[3]) / 2;
          }
        }
      } else {;
        for (var i = 0; i < child.children.length; i++) {
          var _child = child.children[i];
          check(_child, _maxSize);
        }
      }
    }

    check(bestChild);

    return bestChild;
  },

  placeWidget: function(_widget, sacrosanct) {
    if (_widget === null) console.log("ALERT ALERT ALERT ALERT ALERT ALERT ALERT ALERT ALERT ALERT ALERT ALERT");

    var maxSize = 0;
    var bestDiv = -1;
    var bestChild = null;

    bestChild = this.getBestChildForNewWidget(0);

    if (bestChild.widget === null) {
      bestChild.widget = _widget;
      _widget.bounds = bestChild.bounds;
      _widget.div = bestChild;
    } else {
      var w = bestChild.widget;

      var splitDir = (bestChild.bounds[2] > bestChild.bounds[3]) ? 0 : 1; // will the cell be split horizontally or vertically?

      var widgetWidth, widgetHeight;
      widgetWidth = (splitDir == 0) ? bestChild.bounds[2] / 2 : bestChild.bounds[2];
      widgetHeight = (splitDir == 1) ? bestChild.bounds[3] / 2 : bestChild.bounds[3];

      var div1 = {
        "bounds": [bestChild.bounds[0], bestChild.bounds[1], widgetWidth, widgetHeight],
        "widget": w,
        "sacrosanct": false,
        "parent": bestChild,
        "children": [],
      }

      var newDivX = (splitDir == 0) ? bestChild.bounds[0] + widgetWidth : bestChild.bounds[0];
      var newDivY = (splitDir == 1) ? bestChild.bounds[1] + widgetHeight : bestChild.bounds[1];

      var div2 = {
        "bounds": [newDivX, newDivY, widgetWidth, widgetHeight],
        "widget": _widget,
        "sacrosanct": sacrosanct,
        "parent": bestChild,
        "children": [],
      }

      div1.widget.div = div1;
      div1.widget.bounds = div1.bounds;

      div2.widget.bounds = div2.bounds;
      div2.widget.div = div2;

      bestChild.children.push(div1);
      bestChild.children.push(div2);
    }
  },

  removeWidget: function(_widget) {
    _widget.div.widget = null;
    var parent = _widget.div.parent;
    if (parent != null) {
      var childNumber = jQuery.inArray(_widget.div, parent.children);
      // determine if sibling is already empty, if so, remove sibling and self from parent array
      var siblingNumber = (childNumber === 1) ? 0 : 1;
      if (parent.children[siblingNumber].widget == null) {
        parent.children = [];
        parent.widget = null;
      }
    } else {
      _widget.div.children = [];
    }
  },

  reset: function() {
    this.children = [
      [{
        "bounds": [0, 0, 1, 1],
        "widget": null,
        "sacrosanct": false,
        "parent": null,
        "id": 0,
        "children": [],
      },]
    ];
  },

  redoLayout: function() {
    this.children = [
      [{
        "bounds": [0, 0, 1, 1],
        "widget": null,
        "sacrosanct": false,
        "parent": null,
        "id": 0,
        "children": [],
      },]
    ];

    for (var i = 0; i < panel.children.length; i++) {
      var w = panel.children[i];
      this.placeWidget(w);
    }
  },
};
*/
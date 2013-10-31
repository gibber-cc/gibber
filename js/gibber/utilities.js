(function() {
"use strict"

var soloGroup = [];
var isSoloing = false;

Gibber.Utilities = {
  random :  function() {
    var dict = {},
        lastChosen = null;
    
    for(var i = 0; i < arguments.length; i+=2) {
      dict[ "" + arguments[i] ] = { repeat: arguments[i+1], count: 0 };
    }

    this.pick = function() {
      var value = 0, index, lastValue;
      if(this[lastChosen]) lastValue = this[lastChosen]

      if(lastChosen !== null && dict[ lastValue ].count++ <= dict[ lastValue ].repeat) {
        index = lastChosen;
        if( dict[ lastValue ].count >= dict[ lastValue ].repeat) {
          dict[ lastValue ].count = 0;
          lastChosen = null;
        };
      }else{
        index = rndi(0, this.length - 1);
        value = this[index];
        if( typeof dict[ ""+value ] !== 'undefined' ) {
          dict[ ""+value ].count = 1;
          lastChosen = index;
        }else{
          lastChosen = null;
        }
      }
      
    	return index; // return index, not value as required by secondary notation stuff
    };
    
    return this;
  },

  future : function(func, time) { 
    var seq = new Gibberish.Sequencer({
      values:[
        function(){},
        function() {
          func();
          seq.stop();
          seq.disconnect();
        }
      ],
      durations:[ Gibber.Clock.time( time ) ]
    }).start()
    
    return function(){ seq.stop(); seq.disconnect(); }
  },
  
  shuffle : function( arr ) {
  		for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
  },
  
  solo : function( ugen ) {
    var args = Array.prototype.slice.call( arguments, 0 );
    if( ugen ) {
      if( isSoloing ) { Gibber.Utilities.solo(); } // quick toggle on / off
      
      // console.log( Master.inputs, args )
      for(var i = 0; i < Master.inputs.length; i++) {
        var idx = args.indexOf( Master.inputs[i].value )
        if( idx === -1) {
          soloGroup.push( [ Master.inputs[i].value, Master.inputs[i].value.amp ] );
          Master.inputs[i].value.amp = 0;
        }
      }
      isSoloing = true;
    }else{
      for( var i = 0; i < soloGroup.length; i++ ) {
        soloGroup[i][0].amp = soloGroup[i][1];
      }
      soloGroup.length = 0
      isSoloing = false;
    }
  },
}

window.solo = Gibber.Utilities.solo
window.future = Gibber.Utilities.future // TODO: fix global reference
Array.prototype.random = Gibber.Utilities.random

})()
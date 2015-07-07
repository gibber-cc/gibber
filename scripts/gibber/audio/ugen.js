module.exports = function( Gibber ) {

var Ugen = function( desc ) {
  var ctor = function( props ) {
    var obj = {}
    $.extend( obj, {
      properties: $.extend( {}, desc.inputs ),
      callback: desc.callback.bind( obj ),
      _init: desc.init.bind( obj ),
      name: desc.name
    })

    obj.__proto__ = Gibber.Audio.Core._synth
    
    if( typeof props === 'object' ) {
      for( var key in props ) {
        obj[ key ] = props[ key ]
      }
    }
    
    var doNotCopy = ['name','inputs','callback','init'], methods = []

    for( var key in desc ) {
      if( doNotCopy.indexOf( key ) === -1 ) {
        obj[ key ] = desc[ key ].bind( obj )
        methods.push( key )
      }
    }

    obj.init.call( obj )
    obj.oscillatorInit.call( obj )

    Gibber.createProxyProperties( obj, obj.properties )
    Gibber.createProxyMethods( obj, methods )

    for( var key in desc.inputs ) {
      if( typeof props === 'object' && props[ key ] ) {
        obj[ key ] = props[ key ]
      }else{
        obj[ key ] = desc.inputs[ key ].default
      }
    }  

    obj._init()
    
    obj.connect( Gibber.Master )
	  
    if( arguments.length > 0 )
      Gibber.processArguments2( obj, Array.prototype.slice.call( arguments, 0), obj.name )
  
    $.extend( true, obj, Gibber.Audio.ugenTemplate )
    obj.fx.ugen = obj
  
    return obj
  }

  return ctor
}

return Ugen

}

/*

// create constructor for XXX object using ugen factory
// this code would be used by end-users to create new ugens
XXX = Ugen({
  name:'Vox',
  inputs:{ 
    frequency:{ min:50, max:3000, default:440 },
    amp: { min:0, max:1, default:.1 }
  },
  callback: function( frequency, amp ) {
    this.out = this.sin( this.PI2 * (this.phase++ * frequency / 44100) ) * amp
    
    // if stereo, make this.out an array an fill appropriately
    // do not create a new array for every sample
    return this.out
  },
  init: function() {
    this.sin = Math.sin
    this.PI2 = Math.PI * 2
    this.phase = 0
    this.out =  0
  }
})

// instantiate using constructor
// frequency and amp are set to arguments
a = XXX( 330, .25 )

// can also pass dictionary
b = XXX({ frequency:250, amp:.1 })

// automatic sequencing of properties
a.frequency.seq( [440,880], 1/2 )

*/
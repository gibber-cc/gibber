module.exports = function( Gibber ) {

"use strict"

var Environment = Gibber.Environment,
    Layout = Environment.Layout,
    Chat = Environment.Chat,
    CodeMirror = Environment.CodeMirror,
    Share = Environment.Share,
    Account = Environment.Account,
    TICKTOCKMODE = 0,
    PIDMODE = 1,
    CHRISTIANMODE = 2,
    LOCAL = 0,
    REMOTE = 1,
    Filters = require('./pid.js')

/*

If remote execution is not enabled, then we have to stream output envelope data to
each person; easy. However, if it is (every client is rendering every other client's audio)
then we need to do some trickery with the bus to make things work. Before executing client
code we substitute their individual bus for the master. For example:
    
    var tmp = Gibber.Audio.Master
    Gibber.Audio.Master = client.Master
    
    ... execute Code... 
    Gibber.Audio.Master = tmp
*/
var em = function (input) {
    var emSize = parseFloat($("body").css("font-size"));
    return (emSize * input);
}
    
var Gabber = {
  column: null,
  name: null,
  userShareName:null,
  occupants: null,
  userShareColumn: null, // the column used in the performance by this client
  enableRemoteExecution: false,
  performers: {},
  masterInitFlag: false,
  follower:null,
  localPhase: 0,
  headerSize:'1em',
  correctionBuffer:[],
  beforeCorrectionBuffer: [],
  correctionBufferSize:255,
  tabs:{},
  init: function( name, performanceMode ) {
    this.userShareColumn = Layout.columns[ Layout.focusedColumn ]
    
    if( Account.nick === null ) {
      Account.nick = 'anon' + rndi(0,8,3).join('')
    }
    
    this.userShareColumn.editor.shareName = Account.nick
    
    this.column = Layout.addColumn({ type:'gabber', header:'Gabber : ' + name })
    this.column.bodyElement.css( 'overflow', 'scroll' )

    this.name = name || null
    
    this.userShareName = this.name + ':' + Account.nick
    
    if( typeof performanceMode === 'undefined' ) performanceMode = LOCAL
    
    Gabber.performanceMode = performanceMode ? 1 : 0
    
    if( !Chat.initialized ) Chat.open()
    Chat.handlers.gabber = Gabber.onGabber
    Chat.handlers.tock = Gabber.onTock
    Chat.handlers['gabber.start'] = Gabber.onStart
    
    // Chat.handlers['gabber.Ki'] = function( msg ) { Gabber.PID.Ki = msg.value }
    // Chat.handlers['gabber.Kp'] = function( msg ) { Gabber.PID.Kp = msg.value }
    // Chat.handlers['gabber.KpMean'] = function( msg ) { Gabber.PID.KpMean = msg.value } 
    
    Chat.handlers['gabber.shared.add'] = function( msg ) {
      Gabber.shared.add( msg.name, msg.value, false )
    } 
    
    Gabber.shared.add( 'Ki', 0, false )
    Gabber.shared.add( 'Kp', .05, false ) 
    Gabber.shared.add( 'KpMean', .01, false )
    Gabber.shared.add( 'brutalityThreshold', .1 * Gibber.Audio.Core.context.sampleRate, false )
    
    if( this.name !== null ) Gabber.createPerformance( this.userShareName )
    
    $.subscribe( 'Chat.arrival', Gabber.onNewPerformerAdded )
    $.subscribe( 'Chat.departure', Gabber.onPerformerRemoved )
    
    Gabber.initializeKeyMap()
    
    Clock.seq.stop()

    Chat.onSocketConnect = Gabber.sendTick
    
    Gabber.follower = Follow( Master )
    
    for( var i = 0; i < Gabber.correctionBufferSize; i++ ) {
      Gabber.correctionBuffer[ i ] = 0
    }

  },
  
  shared: {
    add: function( name, value, shouldDistribute ) {
      var _value = value || 0
      
      if( typeof shouldDistribute === 'undefined' ) shouldDistribute = true
      
      Object.defineProperty( Gabber.shared, name, {
        get: function()  { return _value },
        set: function(v) { 
          _value = v
          var msg = { 
            cmd:  'gabber.shared',
            'name': name,
            gabberName:Gabber.name,      
            value: _value
          }
    
          Chat.socket.send( JSON.stringify( msg ) )
        }  
      })
      
      Chat.handlers[ 'gabber.shared.' + name ] = function( msg ) { _value = msg.value }
      
      if( shouldDistribute ) {
        var msg = { 
          cmd:  'gabber.shared.add',
          'name': name,
          gabberName:Gabber.name,      
          value: _value
        }

        Chat.socket.send( JSON.stringify( msg ) )
      }
    }
  },
  
  start: function() {
    Chat.socket.send( JSON.stringify({ cmd:'gabber.start', gabberName:Gabber.name }) )
  },
  
  sendTick: function() {
    //Gabber.phaseSnapshot = Gibber.Audio.Clock.getPhase()
    //Gabber.timeSnapshot  = Gibber.Audio.Core.context.currentTime
    Gabber.localPhase += 1024
    //Chat.socket.send( JSON.stringify({ cmd:'tick' }) )
  },
  correctionFlag: false,
  mode:0, // 0 for initialize, 1 for running
  correctPhase: function() { Gabber.correctionFlag = true },
  onTickTock: function( msg ) {
    // var localPhase = Gibber.Audio.Clock.getPhase(),
    //     localTime  = Gibber.Audio.Core.context.currentTime,
    //     roundtripTime = localTime - Gabber.timeSnapshot
    //     
    // Gabber.roundtrips.push( roundtripTime )
    // if( Gabber.roundtrips.length > 20 ) {
    //   Gabber.calculateRoundtripAverage()
    // }else{
    //   Gabber.sendTick()
    // }
  },
  calculateRoundtripAverage: function() {
    // var sum = 0
    var lowest = 100000000
    for( var i = 0; i < Gabber.roundtrips.length; i++ ) {
      //sum += Gabber.roundtrips[i]
      if( Gabber.roundtrips[i] < lowest ) lowest = Gabber.roundtrips[i]
    }
    //Gabber.rtt = sum / Gabber.roundtrips.length
    Gabber.rtt = lowest
    console.log( "ROUNDTRIPTIME AVG", Gabber.rtt )
  },
  onStart: function() {
    //future( Gabber.onPIDStart, ms(2000) + ( (Gabber.rtt / 2) * ms(1) ) )
    Gabber.onPIDStart()
  },
  onPIDStart : function() {
    if( !Gabber.initialized ) {
      var rate = parseFloat( Clock.rate ) // tmp storage
      Gibber.clear()
      Clock.rate = rate
      Gibber.Audio.Clock.shouldResetOnClear = false // never let time be reset during gabber performance
      Gabber.mode = PIDMODE
      Gibber.Audio.Core.onBlock = Gabber.sendTick
      Gabber.initialized = true
    }
  },
  showGraph: function() {
    if( Gabber.mode === PIDMODE ) {
      Gabber.canvas = Canvas()
    
      Gabber.canvas.draw = function() {
        var pixelsPerPoint = Gabber.canvas.width / Gabber.correctionBufferSize,
            originY = Gabber.canvas.height / 2,
            lastX = 0, lastY = originY
          
        Gabber.canvas.clear()
      
        Gabber.canvas.beginPath()
          Gabber.canvas.moveTo( lastX, lastY )
        
          for( var i = 0; i < Gabber.correctionBufferSize; i++ ) {
            var nextX = pixelsPerPoint * i, nextY = originY + Gabber.correctionBuffer[ i ] //* (originY / 20)
            
            Gabber.canvas.lineTo( nextX, nextY )
          }
        
        //Gabber.canvas.closePath()
        Gabber.canvas.stroke( 'red' )
        
        Gabber.canvas.beginPath()
          Gabber.canvas.moveTo( lastX, lastY )
        
          for( var i = 0; i < Gabber.beforeCorrectionBufferSize; i++ ) {
            var nextX = pixelsPerPoint * i, nextY = originY + (Gabber.beforeCorrectionBuffer[ i ] / 20) * originY
          
            Gabber.canvas.lineTo( nextX, nextY )
          }
        
        //Gabber.canvas.closePath()
        Gabber.canvas.stroke( 'blue' )
      }
    }
  },
  roundtrips: [],
  storing:[],
  'PID': Filters.PID(),
  onPID: function( msg ) { 
    Gabber.PID.run( msg ) 
  },
  onTock: function( msg ) {    
    //console.log("TOCK MESSAGE", msg )
    if( Gabber.mode === TICKTOCKMODE ) {
      Gabber.onTickTock( msg )
    }else if ( Gabber.mode === PIDMODE ){
      Gabber.onPID( msg )
    }else if ( Gabber.mode === CHRISTIANMODE ){
      Gabber.onChristian( msg )
    }
  },
  onChristian: function( msg ) {
    var diffPhase       = msg.masterAudioPhase - localPhase,
        correctPhase    = msg.masterAudioPhase + ( localPhase - Gabber.phaseSnapshot ) / 2,
        phaseCorrection = correctPhase - localPhase
    
      
    if( !Gabber.masterInitFlag ) {
      Gibber.Audio.Clock.setPhase( correctPhase )
      Gabber.masterInitFlag = true
    }
  
    var avg = Gabber.runningAverage( phaseCorrection )
  
    if( Gabber.correctionFlag ) {
      Gibber.Audio.Clock.setPhase( correctPhase - avg )
    
      Gabber.runningAverage.setN( 0 )
      Gabber.runningAverage.setSum( 0 )
    
      Gabber.correctionFlag = false
    }
  },
  createPerformance : function( name ) {
    var rooms = null, roomFunc = function( r ){ rooms = r }
    
    $.subscribe( 'Chat.roomsListed', roomFunc ) 
    
    Share.createDoc( this.userShareColumn.number, 
      function() { 
        if( rooms !== null ) {
          Gabber.onRoomsListed( rooms )
        }else{
          $.unsubscribe( 'Chat.roomsListed', roomFunc )
          $.subscribe( 'Chat.roomsListed', Gabber.onRoomsListed )
        }
      }, null, name 
    )
  },
  joinPerformance: function( name ) {
    this.name = name
    Chat.socket.send( JSON.stringify({ cmd:'joinRoom', room:Gabber.name }) )
    this.column.setHeader( 'Gabber: ' + name )
  },
  onRoomsListed: function( rooms ) {    
    $.unsubscribe( 'Chat.roomsListed', Gabber.onRoomsListed )
    
    if( !rooms || Gabber.name in rooms === false ) {
      $.subscribe( 'Chat.roomCreated', Gabber.onRoomCreated )
      Chat.createRoom( Gabber.name )
    }else{
      $.subscribe( 'Chat.roomJoined', Gabber.onRoomJoined )
      Chat.socket.send( JSON.stringify({ cmd:'joinRoom', room:Gabber.name }) )
    }
  },
  onRoomCreated: function() {
    $.unsubscribe( 'Chat.roomCreated', Gabber.onRoomCreated )
    Chat.socket.send( JSON.stringify({ cmd:'joinRoom', room:Gabber.name }) )
  },
  onRoomJoined: function( data ) {
    $.unsubscribe( 'Chat.roomJoined', Gabber.onRoomJoined )
    if( data.roomJoined !== Gabber.name ) {
      Environment.Message.Post( 'For some reason, the wrong performance was joined. Please try again.' )
    }else{
      for( var i = 0; i < data.occupants.length; i++ ) {
        Gabber.createSharedLayout( data.occupants[i] )
      }
      Gabber.layoutSharedPerformers()
    }
    Chat.socket.send( JSON.stringify({ cmd:'joinRoom', room:Gabber.name }) )
  },
  onNewPerformerAdded: function( data ) {
    if( ! Gabber.performers[ data.nick ] && data.nick !== Account.nick ) {
      Gabber.createSharedLayout( data.nick )
      Gabber.layoutSharedPerformers()
    }
  },
  onPerformerRemoved: function( data ) {
    if( Gibber.performers[ data.nick ] !== null ) {
      Gabber.performers[ data.nick ].remove() 
      Gabber.performers[ data.nick ] = null
    }
  },
  addTabButton: function( name, cb ) {
    var btn = $( '<button>' + name + '</button>' )
      .on( 'mousedown', cb )
      .css( 'margin-left', '1em' )
      .addClass( name )
    
    Gabber.column.header.append( btn )
    
    return btn
  },
  openTab: function() {
    if( Gabber.openTab !== this ) {
      for( var key in Gabber.tabs ) {
        var tab = Gabber.tabs[ key ]
        if( tab !== this ) {
          tab.performer.header.css({ background:'#222', color:'#ccc' })
          tab.hide()
        }
      }

      this.show()
      this.performer.header.css({ background:'#ccc', color:'black' })
      
      Gabber.openTab = this
    }
  },
  flashTab: function( name, color ) {
    var elem = $( '.' + name ),
        prevBackground = elem.css('background'), 
        prevColor = elem.css('color')
        
    elem.css({ background: 'white', color:'black' })
    
    setTimeout( function() { elem.css({ background:prevBackground,color:prevColor }) }, 150 )
  },
  createSharedLayout: function( name ) {
    var performer = {},
        element = $( '<div>' )
        
    performer.element = element
    performer.element.name = name
    performer.element.performer = performer
    
    Gabber.tabs[ name ] = element 
    
    performer.header = Gabber.addTabButton( name, Gabber.openTab.bind( element ) )
    
    performer.code = $( '<div class="editor">' )
    performer.code.css({ overflow:'scroll', height:'auto' })

    element.append( performer.code )
        
    Gabber.column.bodyElement.append( element )
    
    performer.editor = CodeMirror( performer.code[0], {
      theme:  'gibber',
      keyMap: 'gibber',
      mode:   'javascript',
      autoCloseBrackets: true,
      matchBrackets: true,
      value: 'testing 1 2 3',
      lineWrapping: false,
      tabSize: 2,
      lineNumbers:false,
      cursorBlinkRate: 530,
      styleActiveLine:true,
      autofocus: false,
    })
    
    performer.editor.setSize( null, 'auto' )
    performer.editor.shareName = name
    performer.editor.sharingWith = name
    
    //console.log("SHARED EDITOR WITH NAME", name )
    
    Share.openDocGabber( Gabber.name + ':' + name, performer.editor )
    
    Gabber.performers[ name ] = performer

    return performer
  },
  layoutSharedPerformers: function() {
    // var performers = Gabber.performers,
    //     colHeight = parseInt( Gabber.column.bodyElement.css( 'height' ) ),
    //     numPerformers = Object.keys( performers ).length,
    //     numberOfVisiblePerformers = 0,
    //     elemHeight = 0
    //     
    // for( var key in performers ) {
    //   if( performers[ key ].element.is(':visible') ) numberOfVisiblePerformers++
    // }
    // 
    // colHeight -= (numPerformers - 1) * em( parseFloat( Gabber.headerSize ) )
    // 
    // elemHeight = colHeight //numberOfVisiblePerformers < 4 ? colHeight / numberOfVisiblePerformers : 3
    // 
    // for( var key in performers ) {
    //   if( performers[key].element.is(':visible') )
    //     performers[ key ].code.css( 'height', '50%' ) //elemHeight )
    // }
  },
  onGabber: function( msg ) {
    var cm, owner = false
      
    // console.log( "GABBER", msg )
    if( msg.shareName === Account.nick && !msg.individualTarget ) {
      cm = Gabber.userShareColumn.editor
      owner = true
    }else if( msg.individualTarget ){
      cm = Gabber.userShareColumn.editor
    }else{
      cm = Gabber.performers[ msg.shareName ].editor
    }
    
    if( !owner && Gabber.blocked.indexOf( msg.shareName ) === -1 ) {
      
      if( Gabber.performanceMode === LOCAL ) {
        setTimeout( function() {
          cm.markText( msg.selectionRange.start, msg.selectionRange.end, { css:'background-color:rgba(255,0,0,.2);' })
        }, 50 )
      }
    
      Environment.Keymap.flash( cm, msg.selectionRange )

      Environment.modes.javascript.run( cm.column, msg.code, msg.selectionRange, cm, msg.shouldDelay )
    }
  },
  block: function( name ) {
    if( Gabber.blocked.indexOf( name ) === -1 ) Gabber.blocked.push( name )
  },
  unblock: function( name ) {
    var idx = Gabber.blocked.indexOf( name )
    if( idx > -1 ) Gabber.blocked.splice( idx, 1 )
  },
  blocked: [],
  
  createMessage: function( selection, shareName, cm, to ) {
    var tmp = selection.code.split('\n')
    if( Gabber.performanceMode === LOCAL ) {
      tmp[0] = tmp[0] + ' /* ' + Account.nick + ' */'
    }
    tmp = tmp.join('')

    if( typeof selection.selection.start === 'undefined' ) {
      var range = {
        start: { line:selection.selection.line, ch:0 },
        end: { line:selection.selection.line, ch:tmp.length }
      }
      selection.selection = range
    }
    
    cm.replaceRange( tmp, selection.selection.start, selection.selection.end )
    
    if( Gabber.performanceMode === LOCAL ) {
      cm.markText( selection.selection.start, selection.selection.end, { css:'background-color:rgba(0,0,255,.3);' })
    }
    
    var msg = { 
      cmd:            'gabber',
      gabberName:     Gabber.name,
      from:           Account.nick,
      'shareName':    shareName || Account.nick,        
      selectionRange: selection.selection, // range
      code:           tmp,
      shouldExecute:  Gabber.enableRemoteExecution,
    }
    
    if( to ) {
      msg.to = to
    }
    
    // if( typeof msg.selectionRange.start === 'undefined' ) {
    //   var range = {
    //     start: { line:msg.selectionRange.line, ch:0 },
    //     end: { line:msg.selectionRange.line, ch:msg.code.length - 1 }
    //   }
    //   msg.selectionRange = range
    // }
    
    return msg
  },
  initializeKeyMap: function() {
    CodeMirror.keyMap.gibber[ 'Ctrl-2' ] = function( cm ) {
			var obj = Environment.getSelectionCodeColumn( cm, false )
      
			Environment.modes[ obj.column.mode ].run( obj.column, obj.code, obj.selection, cm, false )
      
      var msg
      if( cm.shareName === Gabber.name ) { // send to all performers
        msg = Gabber.createMessage( obj, cm.shareName, cm )
      }else{ // send to a single perfomer (from executing in their shared column)
        msg = Gabber.createMessage( obj, cm.shareName, cm, cm.shareName )
      }
      
      msg.shouldDelay = false
      msg.shouldExecute = true
      
      //cm.markText( msg.selectionRange.start, msg.selectionRange.end, { css:'background-color:rgba(255,0,0,.2);' })

      Chat.socket.send( JSON.stringify( msg ) ) 
		}
    
    CodeMirror.keyMap.gibber[ 'Shift-Ctrl-2' ] = function( cm ) {
			var obj = Environment.getSelectionCodeColumn( cm, false )
      
			Environment.modes[ obj.column.mode ].run( obj.column, obj.code, obj.selection, cm, true )
      
      var msg = Gabber.createMessage( obj, cm.shareName, cm )
      msg.shouldDelay = true
            
      // if( cm.shareName !== Account.nick ) {
      //   cm.markText( msg.selectionRange.start, msg.selectionRange.end, { css:'background-color:rgba(255,0,0,.2);' })
      // }else{
      //   cm.markText( msg.selectionRange.start, msg.selectionRange.end, { css:'background-color:rgba(0,0,255,.2);' })
      // }
      
      Chat.socket.send( JSON.stringify( msg ) ) 
    }
    
    if( Gabber.performanceMode === REMOTE ) {
      CodeMirror.keyMap.gibber[ 'Ctrl-Enter' ] = function( cm ) {
  			var obj = Environment.getSelectionCodeColumn( cm, false )
      
  			Environment.modes[ obj.column.mode ].run( obj.column, obj.code, obj.selection, cm, false )
      
        var msg = Gabber.createMessage( obj, cm.shareName, cm )
      
        msg.shouldDelay = false
        msg.shouldExecute = true

        Chat.socket.send( JSON.stringify( msg ) )
        
        return false
      }
			
      CodeMirror.keyMap.gibber[ 'Shift-Ctrl-Enter' ] = function(cm) {
  			var obj = Environment.getSelectionCodeColumn( cm, false )
      
  			Environment.modes[ obj.column.mode ].run( obj.column, obj.code, obj.selection, cm, true )
      
        var msg = Gabber.createMessage( obj, cm.shareName, cm )
        msg.shouldDelay = true
      
        Chat.socket.send( JSON.stringify( msg ) ) 
      }
      
      /*"Alt-Enter": function(cm) {
			  var obj = GE.getSelectionCodeColumn( cm, true )
				GE.modes[ obj.column.mode ].run( obj.column, obj.code, obj.selection, cm, false )
      },*/
    }
    
  },
}

// Object.defineProperty( Gabber, 'Ki', {
//   get: function()  { return Gabber.PID.Ki },
//   set: function(v) {
//     Gabber.PID.Ki = v
//     var msg = {
//       cmd:  'gabber.Ki',
//       gabberName:Gabber.name,
//       value: v
//     }
//
//     Chat.socket.send( JSON.stringify( msg ) )
//   }
// })
//
// Object.defineProperty( Gabber, 'Kp', {
//   get: function()  { return Gabber.PID.Kp },
//   set: function(v) {
//     Gabber.PID.Kp = v
//     var msg = {
//       cmd:  'gabber.Kp',
//       gabberName:Gabber.name,
//       value: v
//     };
//
//     Chat.socket.send( JSON.stringify( msg ) )
//   }
// })
//
// Object.defineProperty( Gabber, 'KpMean', {
//   get: function()  { return Gabber.PID.KpMean },
//   set: function(v) {
//     Gabber.PID.KpMean = v
//     var msg = {
//       cmd:  'gabber.KpMean',
//       gabberName:Gabber.name,
//       value: v
//     };
//
//     Chat.socket.send( JSON.stringify( msg ) )
//   }
// })

return Gabber

}

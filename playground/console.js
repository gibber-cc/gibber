module.exports = function( environment ) {
  const Console = {
    detail:1,
    showTrace: false,
    __messageNames: ['new ugen', 'new sequence', 'new tidal'],

    // populated in init() based on message names
    __messages: {},

    // augmented in init() based on message names
    __notifications : {
      error( msg ) {
        Console.error( msg ) 
      }
    },

    __clearNotifications() {
      Object.entries( Console.__messages ).forEach( ([k,v]) => v.length = 0 )
    },

    __printNotifications() {
      const total = Console.__messageNames.reduce( (accum,v) => accum += Console.__messages[ v ].length, 0 )
      
      const entries = Object.entries( Console.__messages )
      if( total > Console.detail ) {
        let msg = ''
        entries.forEach( ([k,v], i ) => {
          if( v.length > 0 ) msg += `${msg !== '' ? ', ':''}${v.length} ${Console.__messageNames[i]}s`
        })
        msg += '.'

        console.groupCollapsed( msg )
        entries.forEach( ([k,v], i ) => {
          v.forEach( msg => console.log( `${msg}` ) )
        })
        console.groupEnd()
      }else if( total !== 0 ) {
        entries.forEach( ([k,v]) => {
          if( v.length ) v.forEach( __v => console.log( `${__v}` ) )
          //if( v.length ) console.log( `%c${v[0]}`, 'color:white; background:#000' )
        })
      }
    },

    clear() {
      window.console.clear()
    },

    init( Gibber ) {
      Console.__messageNames.forEach( n => {
        Console.__notifications[ n ] = v => {
          Console.__messages[ n ].push( v )
        }
        Console.__messages[ n ] = []
      })

      Gibber.Audio.subscribe( 'new ugen', this.__notifications['new ugen'] )
      Gibber.subscribe( 'new sequence', seq => {
        let msg = ''
        if( seq.target !== undefined ) {
          if( seq.target.__meta__ !== undefined ) {
            msg = `sequence controlling '${seq.key}' on ${seq.target.__meta__.name[1] || seq.target.__meta__.name[0] } now running.`
          }else{
            msg = `sequence controlling '${seq.key}' on ${seq.target.name} now running.`
          } 
        }else{
          msg = `standalone sequencer created and running.`
        }
        this.__notifications['new sequence']( msg )
      })

      Gibber.subscribe( 'new tidal', seq => {
        let msg = ''
        if( seq.target.__meta__ !== undefined ) {
          msg = `tidal pattern controlling '${seq.key}' on ${seq.target.__meta__.name[1] || seq.target.__meta__.name[0] } now running.`
        }else{
          msg = `tidal pattern controlling '${seq.key}' on ${seq.target.name} now running.`
        } 
        this.__notifications['new tidal']( msg )
      })

      Gibber.subscribe( 'error', this.__notifications.error )

      window.console.warn = Console.warn
      window.console.error = Console.error
    },

    error( msg, e ) {
      console.log( `%c${msg}`, 'color:white;background:#300;border:#900 solid 1px; padding:5px'  )
   
      if( e !== undefined ) {
        if( !Console.revealErrors ) console.groupCollapsed( 'error trace:' )
        console.log( e )
        if( !Console.revealErrors ) console.groupEnd() 
      }
    },

    warn( msg ) {
      console.log( `%c${msg}`, 'color:white;background:#330;border:#990 solid 1px; padding:5px' )
    },

    log( msg, css ) {
      console.log( msg, css )
    }
  }
  
  return Console
}

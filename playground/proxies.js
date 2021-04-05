const sounds = {}

const createProxies = function( pre, post, proxiedObj, environment, Gibber ) {
  const newProps = post.filter( prop => pre.indexOf( prop ) === -1 )

  for( let prop of newProps ) {
    let ugen = proxiedObj[ prop ]

    if( ugen.__wrapped__ !== undefined ) {
      if( ugen.__wrapped__.type === 'instrument' || ugen.__wrapped__.type === 'bus' ) {
        sounds[ prop ] = ugen
        environment.sounds = sounds
        ugen.__onclear = function() {
          delete sounds[ prop ] 
        }
      }
    }

    Object.defineProperty( proxiedObj, prop, {
      get() { return ugen },
      set( value ) {

        const member = ugen
        if( member !== undefined && value !== undefined) {

          if( typeof member === 'object' && member.__wrapped__ !== undefined ) {
            if( member.__wrapped__.connected !== undefined ) {
              // save copy of connections
              const connected = member.__wrapped__.connected.slice( 0 )
              if( member.disconnect !== undefined ) {
                for( let connection of connected ) {
                  // 0 index is connection target

                  if( connection[0].isProperty === true ) {
                    // if it's a modulation
                    let idx = connection[0].mods.indexOf( ugen )

                    connection[0].mods.splice( idx, 1 )
                  }else{
                    member.disconnect( connection[ 0 ] )
                  }

                  let shouldConnect = true
                  if( connection[0] !== Gibber.Audio.Gibberish.output || Gibber.Audio.autoConnect === false ) {
                    if( connection[0].isProperty !== true ) {
                      shouldConnect = false
                    }
                    // don't connect new ugen to old ugen's effects chain... new
                    // ugen should have its own chain.
                    if( member.fx.indexOf( connection[0] ) > -1 ) {
                      shouldConnect = false
                    }
                  }

                  if( shouldConnect === true ) {
                    value.connect( connection[ 0 ] )
                  } 
                }

                member.disconnect()
              }
              // check for effects input to copy.
              // XXX should we do this for busses with connected ugens as well???
              // right now we are only connecting new ugens to busses... should we
              // also connect new busses to their prior inputs if proxied?
              if( member.input !== undefined ) {
                value.input = member.input
              }
            }

            // XXX this is supposed to loop through the effecfs of the old ugen, compare them to the fx
            // in the new ugen, and then connect to any destination busses. unfortunately it seems buggy,
            // and I don't feel like fixing at the moment. This means that you have to reconnect effects
            // to busses that aren't the master (or the next effect in an effect chain).

            /*
            if( member.fx !== undefined && member.fx.length > 0 && value.fx !== undefined && value.fx.length > 0 ) {
              for( let i = 0; i < member.fx.length; i++ ) {
                const newEffect = value.fx[ i ]
                if( newEffect !== undefined ) {
                  const oldEffect = member.fx[ i ]

                  for( let j = 0; j < oldEffect.__wrapped__.connected.length; j++ ) {
                    let connection = oldEffect.__wrapped__.connected[ j ][ 0 ]
                    
                    // check to make sure connection is not simply in fx chain...
                    // if it is, it is probably recreatd in as part of a preset, so
                    // don't redo it here.
                    if( member.fx.indexOf( connection ) === -1 ) {
                      newEffect.connect( connection, oldEffect.__wrapped__.connected[ j ][ 1 ] )  
                    }
                  }
                }
              }
            }*/

            // make sure to disconnect any fx in the old ugen's fx chain
            member.fx.forEach( effect => { 
              effect.disconnect()
              effect.clear() 
            })
            member.fx.length = 0

          }else{ // end ugen conditional
            if( value.type === 'Steps' ) {
              //member.stop()
              member.clear() 
            }
          }
        }
        
        if( ugen !== undefined ) {
          if( ugen.clear !== undefined ) {
            // XXX this was commented out at some point for unknown reasons, but it demonstrably
            // corrects annotation errors in blocks of code like:
            // s = Synth('bleep')
            //   .note.seq( sine(5,3), Euclid(5,8) )
            // where re-executing both triggers proxy substitution and also
            // stops/starts a running sequence, so, including it again for now
            ugen.clear()
          }else if( ugen.__onclear !== undefined ) {
            // XXX does this condition ever happen?
            ugen.__onclear()     
          }
        }

        ugen = value
      }
    })

    environment.proxies.push( prop )
  }
}

module.exports = createProxies

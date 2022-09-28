 sounds = {}

// list of patterns for each array
// we can't place the patterns on the arrays themselves
// because these need to be serialized when they are sent
// to the worklet
window.__arrays = []

const handleConnections = function( member, newUgen ) {
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
          newUgen.connect( connection[ 0 ] )
        } 
      }

      member.disconnect()
    }
  } 
}

let uid = 0
Array.prototype.addPattern = function( pattern ) {
  const patterns = window.__arrays[ this.uid ]
  if( patterns !== undefined )
    patterns.push( pattern )
}
const proxyArray = function( arr, prop, proxiedObj, environment, Gibber ) {
  arr.uid = uid++
  window.__arrays[ arr.uid ] = [] 
  Object.defineProperty( proxiedObj, prop, {
    get() { return arr },
    set( newarr ) {
      newarr.uid = arr.uid

      if( newarr !== undefined) {
        // replace array in any patterns using it
        const patterns = window.__arrays[ arr.uid ]
        if( patterns !== undefined ) {
          patterns.forEach( pattern => {
            pattern.set( newarr )
          })
        }
        
        arr = newarr
      }
    }
  })
}

const proxyUgen = function( ugen, prop, proxiedObj, environment, Gibber ) {
  if( ugen.__wrapped__.type === 'instrument' || ugen.__wrapped__.type === 'bus' ) {
    sounds[ prop ] = ugen
    environment.sounds = sounds
    ugen.__onclear = function() {
      delete sounds[ prop ] 
    }

    Object.defineProperty( proxiedObj, prop, {
      get() { return ugen },
      set( value ) {
        const member = ugen
        if( value !== undefined) {
          handleConnections( member, value )
          // check for effects input to copy.
          // XXX should we do this for busses with connected ugens as well???
          // right now we are only connecting new ugens to busses... should we
          // also connect new busses to their prior inputs if proxied?
          if( member.input !== undefined ) {
            value.input = member.input
          }

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
  }
}

const createProxies = function( pre, post, proxiedObj, environment, Gibber ) {
  const newProps = post.filter( prop => pre.indexOf( prop ) === -1 )

  for( let prop of newProps ) {
    let obj = proxiedObj[ prop ]
    const isObject = obj !== undefined && typeof obj === 'object'
    if( !isObject ) return

    const shouldProxyUgen  = obj.__wrapped__ !== undefined
    const shouldProxyArray = !shouldProxyUgen && Array.isArray( obj )

    if( shouldProxyUgen ) {
      proxyUgen( obj, prop, proxiedObj, environment, Gibber )
    }else if( shouldProxyArray ) {
      proxyArray( obj, prop, proxiedObj, environment, Gibber )
    }

    environment.proxies.push( prop )
  }
}

module.exports = createProxies

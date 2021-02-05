module.exports = function( Marker ) {

  const strip = function( unstripped ) {
    const stripped   = unstripped[0] === '"' || unstripped[0] === "'" ? unstripped.slice(1,-1) : unstripped
    return stripped
  }

  const visitors = {
    Literal( node, state, cb ) {
      state.push( node.value )
    },
    Identifier( node, state, cb ) {
      state.push( strip( node.name ) )
    },
    AssignmentExpression( expression, state, cb ) {
      // first check to see if the right operand is a callexpression
      if( expression.right.type === 'CallExpression' ) {

                
        let name
        if( expression.right.callee.type === 'MemberExpression' ) {
          // check to see if this is a constructor followed by a call to .seq() or .connect()
          try {
            if( expression.right.callee.object.callee === undefined ) {
              if( expression.right.callee.object.object !== undefined ) {
                if( expression.right.callee.object.object.type === 'CallExpression' ) {
                  Marker.globalIdentifiers[ expression.left.name ] = expression.right 
                  visitors.CallExpression( expression.right, state, cb, window[ expression.left.name ], expression.left.name )
                  return
                }
              }
            }else{
              name = expression.right.callee.object.callee.name
            }
          }catch(e) {
            console.error( 'complex assignment / member expression:', e, expression.right )
          }
        }else{
          name = expression.right.callee.name
        }

        if( name !== undefined && Marker.standalone[ name ] ) {

          const obj = window[ expression.left.name ]
          if( obj.markup === undefined ) Marker.prepareObject( obj )

          Marker.standalone[ name ]( 
            expression.right, 
            state.cm,
            obj,
            expression.left.name,
            state,
            cb
          )            
        }else{
          // if it's a gen~ object we need to store a reference so that we can create wavepattern
          // annotations when appropriate.
          const left = expression.left
          const right= expression.right

          let leftName = left.name
          if( leftName === undefined ) {
            // XXX OMG fix this so it's not hard coded for a maximum depth of four
            // handles up to object.object.object.property
            if( left.type === 'MemberExpression' ) {
              if( left.object.object === undefined ) {
                leftName = left.object.name + '.' + (left.property.type === 'Literal' ? left.property.raw : left.property.name )
              }else if( left.object.object.object !== undefined ) {
                leftName = left.object.object.object.name + '.' + left.object.object.property.name + '.' + left.object.property.name + '.' + left.property.name
              }else{
                leftName = left.object.object.name + '.' + left.object.property.name + '.' + left.property.name
              }
            }
          }
          
          Marker.globalIdentifiers[ leftName ] = right

          let righthandName
          if( right.callee.object === undefined ) {
            // no calls to .connect() or to .seq()
            righthandName = right.callee.name
          }else{
            // ugen({}).connect()
            // XXX what about handling multiple chained calls to .seq()
            // hopefully this is handled in our earlier try/catch block...

            if( right.callee.object.callee !== undefined ) 
              righthandName = right.callee.object.callee.name 
          }

          if( righthandName !== undefined ) {
            state.containsGen = Marker.Gibber.Audio.Gen.names.indexOf( righthandName ) > -1

            // if assigning to a global variable...
            if( leftName.indexOf('.') === -1 ) {
              state.gen = window[ leftName ]
            }else{
              // else if assigning to a property... accommodates any depth
              let obj = window
              leftName.split('.').forEach( next => { obj = obj[ next ] })
              state.gen = obj.value
            }
            // XXX does this need a track object? passing null...
            if( state.containsGen ) {
              const w = Marker.processGen( expression, state.cm, null, null, null, 0, state )
              //w.target = leftName
            }
          }

          cb( right, state )

        }
      }
    },
    
    CallExpression( node, state, cb, obj, objName ) {
      if( state.nodes === undefined ) {
        state.nodes = [ node ]
      }else{
        state.nodes.push( node )
      }
      // this one is a doozy. The first thing to note is that this can either be called
      // during a recursive walk whenever a CallExpression is found, or it can be called
      // directly from the AssignmentExpression visitor, which will often have a
      // CallExpression on the righthand side (for example, ugen().connect()). 

      // If called from the AssignmentExpression visitor, the sequencer that is created
      // will be passed in to the argumenet obj. If this is not passed in, then we need
      // to update the state of the walk by calling the callback. 
      if( obj === undefined && state.containsGen !== true ) cb( node.callee, state )

      // check the state for a member .seq. We use two different techniques for this. 
      // the first finds things like "mysynth.note.seq( 0,0 )" while the second finds
      // calls to constructors that are chained with calls to .seq()
      // (e.g. "synth = Synth().note.seq( 0, 1/4 )"

      const endIdx = state.length - 1
      const end = state[ endIdx ]
      let foundSequence = end === 'seq'
      let foundTidal    = end === 'tidal'

      if( node.callee.property !== undefined ) {
        foundSequence = node.callee.property.name === 'seq'
        foundTidal    = node.callee.property.name === 'tidal'
      }

      if( foundTidal === true ) {
        const seqNumber = node.arguments.length > 1 ? node.arguments[1].raw : 0
          
        let count = 1
        obj = window[ state[0] ]
        while( state[ count ] !== 'tidal' ) {
          obj = obj[ state[ count++ ] ]
        }

        const tidal = obj.tidals[ seqNumber ]

        Marker.markPatternsForTidal( tidal, node.arguments, state, cb, node, 0 )

      } else if( foundSequence === true ){
        // check if a gen ugen is stored in the state variable, if so
        // use it as the obj varibale.
        if( state.containsGen === true ) obj = state.gen

        // If called via the AssignmentExpression visitor, built up a faux-AST
        // that gives us the object and all subsequenct method calls. For example,
        // there could be many chained calls to .seq() sequencing different
        // properties. 
        let tree
        if( obj !== undefined ) {
          tree = []
          let __node = node
          while( (__node =__node.callee || __node.object) !== undefined ) {
            if( __node.property )
              tree.unshift( __node.property.name )
            else if( __node.name )
              tree.unshift( __node.name )
          }
          // tree should be of form: ['Synth', 'note', 'seq', 'gain', 'seq'...]
        }

        let seq

        if( obj === undefined ) {
          // assume default sequencer ID of 0, but check for alternative argument value
          const seqNumber = node.arguments.length > 2 ? node.arguments[2].raw : 0
          
          // this nightmare is to account for calls to .seq that might be chained
          // e.g. syn.note.seq( 0, 1/4 ).pan.seq( Rndf() )
          // we isolate all callexpression nodes in the our state's .nodes array,
          // and then pass each call expression individually to be marked as a
          // sequencer. 
          
          // first, count the number of calls to .seq in this expression
          const seqCount = state.reduce( (count, value) => count + (value==='seq'? 1 : 0 ), 0 )

          // next, loop through our call expressions and pass in the appropriate note. the
          // nodes are added in reverse order to the listing of objects/properties/seq in state,
          // so we pop each node out of our node stack.
          let i = 0;
          const callNodes = state.nodes.filter( v => v.type === 'CallExpression' )
          while( i < seqCount ) {
            const nextSeqIdx = state.indexOf('seq')
            if( nextSeqIdx > -1 ) {
              // create a path like [ 'a', 'note', 'seq' ] by slicing to the next instance of .seq
              let tmp = [ state[0] ]
              tmp = tmp.concat( state.splice( 1, nextSeqIdx ) )
              seq = Marker.getObj( tmp, true, seqNumber )
              const callExpressionNode = callNodes.pop()
              tmp.cm = state.cm
              Marker.markPatternsForSeq( seq, callExpressionNode.arguments, tmp, cb, callExpressionNode, seqNumber )
            }

            i++
          }
        }else{
          // as top most level of AST is the last call to .seq, we must work our way
          // from the top on down. Here we look up the name of each property being
          // sequence from the faux-AST we created earlier. We then pass in the 
          // MemberExpression node that was used to sequence this property. 
          for( let i = tree.length - 2; i >= 1; i-=2 ) {
            if( node === undefined ) return
            let seqNumber = node.arguments.length > 2 ? node.arguments[2].raw : 0

            try{
              seq = obj[ tree[i] ][ seqNumber ]
            }catch( e ) {
              console.log( e )
              //debugger
              cb( node.callee, state )
              return
            }

            // check and see if the object name has been passed, if not we should be
            // able to get it from the first index of the tree
            if( objName === undefined ) objName = tree[ 0 ]

            // We need to fake a state variable so that annotations are created with
            // unique class names. We pass the name of the object being sequenced 
            // as well as the method and sequencer number used.
            let __state = [ objName, tree[ i ] ]
            __state.cm = state.cm
            Marker.markPatternsForSeq( seq, node.arguments, __state, cb, node, seqNumber )
            node = node.callee.object.object
          }

        }

        //console.log( 'marking pattern for seq:', seq )
      }else{
        // XXX need to fix this when we add gen~ expressions back in!!!
        if( node.callee.object !== undefined && node.callee.object.type !== 'Identifier' && node.callee.property ) {
          if( node.callee.property.name === 'fade' ) {
            Marker.processFade( state, node )
          }
        }
        cb( node.callee, state )
        //Marker.processGen( node, state.cm, null, null, null, state.indexOf('seq') > -1 ? 0 : -1, state )
      }

    },
    MemberExpression( node, state, cb ) {
      // XXX why was this here?
      //if( node.object.name === 'tracks' ) state.length = 0
      if( state.nodes === undefined ) {
        state.nodes = [ node ]
      }else{
        state.nodes.push( node )
      }
      // for any member name, make sure to get rid of potential quotes surrounding it using
      // the strip function.
      
      if( node.object.type !== 'Identifier' ) {
        if( node.property ) {
          const unstripped = node.property.type === 'Identifier' ? node.property.name : node.property.raw 
          state.unshift( strip( unstripped ) )
        }
        cb( node.object, state )
      }else{
        if( node.property !== undefined ) { // if the objects is an array member, e.g. tracks[0]
          state.unshift( strip( node.property.raw || node.property.name ) )
        }
        state.unshift( strip( node.object.name ) )

        cb( node.object, state )
      }
    },
  }

  return visitors
}

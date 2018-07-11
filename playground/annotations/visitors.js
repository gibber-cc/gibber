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
              if( expression.right.callee.object.object.type === 'CallExpression' ) {
                Marker.globalIdentifiers[ expression.left.name ] = expression.right 
                visitors.CallExpression( expression.right, state, cb, window[ expression.left.name ], expression.left.name )
                return
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
          
          Marker.globalIdentifiers[ left.name ] = right

          let righthandName
          if( right.callee.object === undefined ) {
            // no calls to .connect() or to .seq()
            righthandName = right.callee.name
          }else{
            // ugen({}).connect()
            // XXX what about handling multiple chained calls to .seq()
            // hopefully this is handled in our earlier try/catch block...
            righthandName = right.callee.object.callee.name 
          }

          state.containsGen = Marker.Gibber.Gen.names.indexOf( righthandName ) > -1
          state.gen = window[ left.name ]
          cb( right, state )

          // XXX does this need a track object? passing null...
          if( state.containsGen ) Marker.processGen( expression, state.cm, null )

        }
      }
    },
    
    CallExpression( node, state, cb, obj, objName ) {
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

      if( node.callee.property !== undefined ) {
        foundSequence = node.callee.property.name === 'seq'
      }

      if( foundSequence === true ){
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
          let seqNumber = node.arguments.length > 2 ? node.arguments[2].raw : 0

          seq = Marker.getObj( state.slice( 0, endIdx ), true, seqNumber )
          Marker.markPatternsForSeq( seq, node.arguments, state, cb, node, seqNumber )
        }else{
          // as top most level of AST is the last call to .seq, we must work our way
          // from the top on down. Here we look up the name of each property being
          // sequence from the faux-AST we created earlier. We then pass in the 
          // MemberExpression nod ethat was used to sequence this property. 
          for( let i = tree.length - 2; i >= 1; i-=2 ) {
            let seqNumber = node.arguments.length > 2 ? node.arguments[2].raw : 0

            seq = obj[ tree[i] ][ seqNumber ]

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
        //cb( node.callee, state )
        Marker.processGen( node, state.cm, null, null, null, state.indexOf('seq') > -1 ? 0 : -1, state )
      }

    },
    MemberExpression( node, state, cb ) {
      // XXX why was this here?
      //if( node.object.name === 'tracks' ) state.length = 0

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
      }

    },
  }

  return visitors
}

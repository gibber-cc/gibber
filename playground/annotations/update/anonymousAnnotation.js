module.exports = ( patternObject, marker, className, cm ) => {
  patternObject.commentMarker = marker
  let update = () => {

    if( !patternObject.commentMarker ) return
    let patternValue = '' + patternObject.update.value


    if( patternValue.length > 8 ) patternValue = patternValue.slice(0,8) 

    let val ='/* ' + patternValue + ' */',
      pos = patternObject.commentMarker.find(),
      end = Object.assign( {}, pos.to )

    //pos.from.ch += 1
    end.ch = pos.from.ch + val.length 
    //pos.from.ch += 1

    cm.replaceRange( val, pos.from, pos.to )

    if( patternObject.commentMarker ) patternObject.commentMarker.clear()

    patternObject.commentMarker = cm.markText( pos.from, end, { className, atomic:false })

  }

  patternObject.clear = () => {
    try{
      let commentPos = patternObject.commentMarker.find()
      //commentPos.to.ch -= 1 // XXX wish I didn't have to do this
      cm.replaceRange( '', commentPos.from, commentPos.to )
      patternObject.commentMarker.clear()
      delete patternObject.commentMarker
    } catch( e ) {} // yes, I just did that XXX 
  }

  return update
}



const fs = require('fs'),
      gibberDef = require( './gibber.js' )
      // only import if you want to print results in console
      // do not include in package.json!!!
      //prettyJS = require('pretty-js')
      
const def = {
  "!name": "gibber",
  "!define" : {}
}

const constructorStr = "fn(initializer?: properties|string, presetMods?: properties) -> "

const protoexcludes = ['method__sequencable', undefined ]
const NUMBER_SEQUENCABLE_INDEX = 0
const METHOD_SEQUENCABLE_INDEX = 1

const convertPropertyType = function( type ) {
  let val = type
  
  switch( type ) {
    case 'number(sequencable)':
      val = 'number__sequencable'
      break
    case 'array':
      val = '[]'
      break
    case 'boolean':
      val = 'bool'
      break
    default:
      break
  }
  
  return val
}


// needed because number_sequencable / method_sequencable were refactored
// into mixins, but Tern would consider them prototypes
gibberDef.prototypes = gibberDef.mixins.concat( gibberDef.prototypes.audio, gibberDef.prototypes.graphics )

// add additional Tern clarifications
gibberDef.prototypes.push(
  {
    name: "presetName",
    type: "string"
  },
  {
    name: "properties",
    type: "string"
  },
  {
    name: "duration", 
    type: "number(sequencable)" 
  }
)

for( let proto of gibberDef.prototypes ) {
  const protoJS = {}
  let name = proto.name

  if( protoexcludes.indexOf( name ) === -1 ) {
    // if proto is sequencable (either number or method)
    const __proto = proto.name.indexOf('sequencable') === -1
      ? gibberDef.prototypes.find( v=> v.name === proto.type )
      : proto.name.indexOf( 'number' ) > -1 
        ? gibberDef.prototypes[ NUMBER_SEQUENCABLE_INDEX ]
        : gibberDef.prototypes[ METHOD_SEQUENCABLE_INDEX ]

    if( proto.name === 'number(sequencable)' || proto.name === 'method(sequencable)' ) name = proto.ternName
    
    if( __proto !== undefined ) {
      
      // methods
      const methods = {}
      for( let methodName in __proto.methods ) {
        const method = {
          ['!doc']: __proto.methods[ methodName ].doc
        }
        
        // create Tern function signature
        let funcstr = 'fn(', count = 0
        for( let arg of __proto.methods[ methodName ].args ) {
          funcstr += `${arg.name}${arg.optional===true?'?':''}: ${arg.type}`
          if( count++ < __proto.methods[ methodName ].args.length - 1 ) funcstr += ', '
        }
        funcstr += ')'
        method['!type'] = funcstr
        
        // copy .seq / .tidal / .start etc.
        if( __proto.methods[ methodName ].isa === 'method(sequencable)' ) {
          Object.assign( method, def[ "!define" ][ 'method__sequencable' ] )
        }
        
        methods[ methodName ] = method
      }
      Object.assign( protoJS, methods )
      
      // properties... we do a bunch of copying to make sure we don't affect
      // other references
      const properties = {}
      for( let propName in __proto.properties ) {
        const property = properties[ propName ] = {
          '!type': convertPropertyType( __proto.properties[ propName ].type ),
          '!doc' : ''+__proto.properties[ propName ].doc,
        }
      }
      
      if( __proto.prototype !== undefined ) {
        protoJS['!proto'] = __proto.prototype
      }
      
      Object.assign( protoJS, properties )
    }else{
      protoJS.name = proto.type
    }
    
    if( protoJS.isa === 'number(sequencable)' ) {
      protoJS['!type'] = 'number__sequencable'
    }
    
    if( protoJS.type !== undefined ) {
      protoJS['!type'] = protoJS.type
      delete protoJS.type
    }
    if( protoJS.doc !== undefined ) {
      protoJS['!doc'] = protoJS.doc
      delete protoJS.doc
    }
    def[ "!define" ][ name ] = protoJS
  }
}

for( let effect of gibberDef.effects ) {
  const name = effect.name
  const e = {
    "!proto": "effect",
    "!doc"  : effect.doc
  }
  
  for( let propname in effect.properties ) {
    let prop = effect.properties[ propname ]
    e[ propname ] = {
      "!type" : prop.isa || convertPropertyType( prop.type ),
      "!doc"  : `default: ${prop.default}${prop.min !== undefined ? `, range:${prop.min}-${prop.max}`:''}. ${prop.doc}`
    }
  }
  def[ name.toLowerCase() ] = e

  def[ name ] = {
    ['!type']: constructorStr + name.toLowerCase(),
    ['!doc']: effect.constructorDoc
  }
}

for( let pp of gibberDef.postprocessing ) {
  const name = pp.name
  const e = {
    "!proto": "postprocessing",
    "!doc"  : pp.doc
  }
  
  for( let propname in pp.properties ) {
    let prop = pp.properties[ propname ]
    e[ propname ] = {
      "!type" : prop.isa || convertPropertyType( prop.type ),
      "!doc"  : `${prop.doc}`
    }
  }
  def[ name.toLowerCase() ] = e

  def[ name ] = {
    ['!type']: constructorStr + name.toLowerCase(),
    ['!doc']: pp.constructorDoc
  }
}
for( let pp of gibberDef.geometries ) {
  const name = pp.name
  const e = {
    "!proto": "geometry",
    "!doc"  : pp.doc
  }
  
  for( let propname in pp.properties ) {
    let prop = pp.properties[ propname ]
    e[ propname ] = {
      "!type" : prop.isa || convertPropertyType( prop.type ),
      "!doc"  : `${prop.doc}`
    }
  }
  def[ name.toLowerCase() ] = e

  def[ name ] = {
    ['!type']: constructorStr + name.toLowerCase(),
    ['!doc']: pp.constructorDoc
  }
}
for( let instrument of gibberDef.instruments ) {
  const name = instrument.name
  const e = {
    "!proto": "instrument",
    "!doc"  : instrument.doc
  }
  
  for( let propname in instrument.properties ) {
    let prop = instrument.properties[ propname ]
    const shouldUseDelimiter = prop.default || prop.min
    e[ propname ] = {
      "!type" : prop.isa || convertPropertyType( prop.type ),
      "!doc"  : `${prop.default !== undefined ? `default: ${prop.default}`:''}${prop.min !== undefined ? `, range:${prop.min}-${prop.max}`:''}${shouldUseDelimiter ? '. ':''}${prop.doc}`
    }
  }
  def[ name.toLowerCase() ] = e

  def[ name ] = {
    ['!type']: constructorStr + name.toLowerCase(),
    ['!doc']: instrument.constructorDoc
  }
}

//console.log( prettyJS( JSON.stringify(def) ) )

fs.writeFileSync( '../gibber.def.json', JSON.stringify( def ) )

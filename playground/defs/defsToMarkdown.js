const fs = require('fs'),
      gibberDef = require( './gibber.js' )
      
const displayHeader = function( obj, __text ) {
  const prototype = obj.prototype !== undefined 
    ? `*Prototype: [${obj.prototype}](#prototypes-${obj.prototype})*\n\n` 
    : ''
  
  const docs = obj.doc !== undefined ? `${obj.doc}\n` : ''
  
  const text = `${obj.name}
----
${prototype}${docs}
`

  return __text + text
}

const displayMethods = function( obj, __text ) {
  let text = ''
  if( obj.methods !== undefined ) {
    text = `
#### Methods ####
`
    for( let name in obj.methods ) {
      const method = obj.methods[ name ]
      text +=`### ${obj.name}.${name}( `
      let count = 0
      for( let arg of method.args ) {
        const optional = arg.optional ? '?' : ''
        text += ` *${arg.name}${optional}*`
        text += count++ < method.args.length -1 ? ', ' : ' ) ###\n'
      }
      for( let arg of method.args ) {
        const optional = arg.optional ? 'optional' : 'required'
        text += `**${arg.name}** *${arg.type}* (${optional}) - ${arg.doc||''}\n\n`
      } 
       
    }
  }
  
  return __text + text
}

const displayProperties = function( obj, __text, propertiesText='Properties' ) {
  let text = ''
  if( obj.properties !== undefined ) {
    text = `
#### ${propertiesText} ####
`
    const __name = propertiesText==='Properties' ? obj.name + '.' : ''
    for( let name in obj.properties ) {
      const property = obj.properties[ name ]
      const __default = property.default !== undefined ? `default: ${property.default}` : ''
      const range   = property.min !== undefined ? `range: ${property.min}-${property.max}` : ''
      const meta = property.default !== undefined
        ? property.min !== undefined
          ? `${__default}, ${range}. `
          : `${__default}. `
        : ''
      
      text +=`### ${__name}${name} ###\n`
      text += `*${property.type}* ${meta} ${property.doc}\n`
    }
  }
  
  return __text + text
}

let text = `# Gibber

# Prototypes
## Audio
`

for( let proto of gibberDef.prototypes.audio ) {
  text = displayHeader( proto, text )
  text = displayMethods( proto, text )
  text = displayProperties( proto, text )  
}

text += `## Graphics\n`

for( let proto of gibberDef.prototypes.graphics ) {
  text = displayHeader( proto, text )
  text = displayMethods( proto, text )
  text = displayProperties( proto, text )  
}

text += `
# Mixins
`
for( let proto of gibberDef.mixins ) {
  text = displayHeader( proto, text )
  text = displayMethods( proto, text )
  text = displayProperties( proto, text )  
}

text += `
# Misc
`

for( let misc of gibberDef.common ) {
  text += `## ${misc.name}\n ${misc.doc}\n `
  text = displayProperties( misc, text, 'Arguments' )
}

text += `
# Instruments
`

for( let instrument of gibberDef.instruments ) {
  text = displayHeader( instrument, text )
  text = displayMethods( instrument, text )
  text = displayProperties( instrument, text )  
}

text += `
# Audio Effects
`

for( let effect of gibberDef.effects ) {
  text = displayHeader( effect, text )
  text = displayMethods( effect, text )
  text = displayProperties( effect, text )  
}
text += `
# Audio Misc 
`

for( let misc of gibberDef.audioMisc ) {
  text = displayHeader( misc, text )
  text = displayMethods( misc, text )
  text = displayProperties( misc, text )  
}

text += `
# Geometries
`

for( let effect of gibberDef.geometries ) {
  text = displayHeader( effect, text )
  text = displayMethods( effect, text )
  text = displayProperties( effect, text )  
}


text += `
# Graphics Misc
`

for( let effect of gibberDef.misc ) {
  text = displayHeader( effect, text )
  text = displayMethods( effect, text )
  text = displayProperties( effect, text )  
}

text += `
# Postprocessing 
`

for( let effect of gibberDef.postprocessing ) {
  text = displayHeader( effect, text )
  text = displayMethods( effect, text )
  text = displayProperties( effect, text )  
}

fs.writeFileSync( '../docs/docs.md', text )

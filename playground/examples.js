const showdown = require('showdown')

module.exports = function() {
  const select = document.querySelector( 'select' )
  const files = [
    {
      name:'demos',
      options:[
        ['intro', 'newintro.js'],
        ['fractal fun', 'fractal_fun.js'],
        ['pick your sample', 'picksomesamples.js'],
        ['acid', 'acid.js'],
        ['moody', 'intro.js'],
        ['geometry melds', 'meld.js']
      ]
    },

    {
      name:'general tutorials',
      options:[
        ['1. running/stopping code', 'intro.tutorial.js'],
        ['2. using the console', 'console.js'],
        ['3. creating objects', 'creating.objects.js'],
        ['4. basic sequencing', 'sequencing.js'],
        ['5. key commands', 'keymappings.js' ],
        ['6. patterns', 'pattern.js'],
        ['7. randomness', 'random.js'],
        ['8. audiovisual mappings', 'mapping.js'],
        ['9. tidalcycles', 'tidal.js' ],
        ['10. modulation', 'modulation.js' ]
      ]
    },

    {
      name:'music tutorials',
      options:[
        ['scales/tunings', 'scales.tunings.js'],
        ['arpeggios and signals', 'arp.js' ], 
        ['polyphony', 'polyphony.js' ], 
        ['freesound', 'freesound.js' ], 
        ['samplers', 'sampler.js' ],
        ['step sequencing', 'steps.js' ],  
        ['using soundfonts', 'soundfont.js' ],  
      ]
    }, 

    {
      name:'sound design tutorials',
      options:[
        ['oscillators', 'sounddesign_oscillators.js'],
        ['envelopes', 'sounddesign_envelopes.js'],
        ['filters', 'sounddesign_filters.js'],
        ['effects and busses', 'effects.js'],
        ['understanding the monosynth', 'monosynth.js'],
        ['creating synths', 'make.js' ]
      ]
    }, 

    {
      name:'graphics tutorials',
      options:[
        ['intro to constructive solid geometry', 'graphics.intro.js' ],  
        ['lighting and materials', 'graphics.lighting.js' ], 
        ['textures', 'texture.js' ],
        ['hydra', 'hydra.js' ],
        ['p5.js', 'p5.js' ]
      ]
    },

    {
      name:'advanced prograaming tutorials',
      options:[
        ['pattern filters', 'patternfilters.js'], 
        ['multithreaded programming', 'multithreaded.js'], 
        ['temporal recursions', 'temporalrecursion.js'] 
      ]
    }
  ]

  for( let cat of files ) {
    const group = document.createElement('optgroup')
    group.setAttribute('label', cat.name )
    for( let file of cat.options ) {
      const opt = document.createElement('option')
      opt.innerText = file[0]
      opt.setAttribute( 'file', file[1] )
      group.appendChild( opt )
    }
    select.appendChild( group )
  }

  select.onchange = function( e ) {
    loadexample( select[ select.selectedIndex ].getAttribute( 'file' ) )
  }

  const loadexample = function( filename ) {
    const  req = new XMLHttpRequest()
    req.open( 'GET', './examples/'+filename, true )
    req.onload = function() {
      const js = req.responseText
      window.Environment.editor.setValue( js )
      parseMarkdown( window.Environment.editor )
    }

    req.send()
  }

  const processMarkdownBlock = function( cm, start, end, endLength, text ) {
    const div = document.createElement( 'div' )
    const converter = new showdown.Converter()
    const html = converter.makeHtml( text )
    div.innerHTML = html
    div.setAttribute( 'class', 'markdown' )
    div.style = `font-family: sans-serif;`

    const marker = cm.markText(
      { line:start, ch:0 },
      { line:end, ch:endLength },
      { replacedWith: div, atomic:true, selectLeft:false, selectRight:false }
    )
    marker.markdown = true
  }

  const parseMarkdown = function( cm ) {
    let start = null, end = null, text = '', number = 0

    cm.eachLine( line => {
      if( line.text.indexOf('/*--md') !== -1 ) {
        start = number
      }else if( line.text.indexOf('--*/') !== -1 ) {
        end = number
        if( start !== null ) {
          processMarkdownBlock( cm, start, end, line.text.length, text )
          start = null
          end = null
          text = ''
        }
      }else{
        // if we are inside a markdown block
        if( start !== null ) {
          text += line.text + '\n'
        }
      }
      number++
    })
  }
}

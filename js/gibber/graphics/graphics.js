( function() {

"use strict"

var Graphics = Gibber.Graphics = {
  canvas :  null,
  ctx:      null,
  width:    0,
  height:   0,
  running:  false,
  resolution: .5,
  
  load : function() {
    $script( [ 'external/three/three.min', 'external/three/stats.min', 'gibber/graphics/geometry'], 'graphics', function() {
      //
    })
  },
  
  init : function() {
    this.canvas = $( '<div>' )
      .css({
        left:0,
        position:'fixed',
      })
      .attr( 'id', 'three' )
    
    this.assignWidthAndHeight( true )
    
    $( '#contentCell' ).append( this.canvas )
    
    this.render = this.render.bind( this )
    
    this.createScene()
    
    $script([
      'external/three/postprocessing/EffectComposer',
      'external/three/postprocessing/RenderPass',
      'external/three/postprocessing/MaskPass',
      'external/three/postprocessing/ShaderPass',
      'external/three/postprocessing/CopyShader',
      'external/three/postprocessing/shaders/DotScreenShader',
      'external/three/postprocessing/DotScreenPass',
      'external/three/postprocessing/FilmPass',
      'external/three/postprocessing/shaders/FilmShader',      
      'external/three/postprocessing/shaders/KaleidoShader',
      'external/three/postprocessing/shaders/EdgeShader',
      'external/three/postprocessing/shaders/FocusShader',      
      'external/three/postprocessing/shaders/ShaderGodRays',      
      'external/three/postprocessing/shaders/BleachBypassShader',
      'external/three/postprocessing/shaders/ColorifyShader',
      ],
      'postprocessing', function() {
        $script(['gibber/graphics/postprocessing','gibber/graphics/shader'], function() {
          Graphics.PostProcessing.init()
        })
      }
    )
    this.start()
    
    var res = this.resolution, self = this
    Object.defineProperty(this, 'resolution', {
      get: function() { return res; },
      set: function(v) { res = v; self.assignWidthAndHeight() }
    });
  },
  
  createScene : function() {		
		// set some camera attributes
		var VIEW_ANGLE = 45,
		  	ASPECT = this.width / this.height,
		  	NEAR = 0.1,
		  	FAR = 10000;


		this.renderer = new THREE.WebGLRenderer();
		this.camera = new THREE.PerspectiveCamera(
		    VIEW_ANGLE,
		    ASPECT,
		    NEAR,
		    FAR
		);
		$( '#three' ).append( this.renderer.domElement )
    
    this.assignWidthAndHeight()
	
		this.scene = new THREE.Scene();
	
		// must wait until scene and renderer are created to initialize effect composer
		//that.shaders.init();
	
		this.graph = [];
	
		this.scene.add( this.camera );

		this.camera.position.z = 250;
		this.camera.lookAt( this.scene.position );
    
		//var ambientLight = new THREE.AmbientLight(0x666666);

		var pointLight = new THREE.PointLight( 0xFFFFFF )
		pointLight.position.x = 100
		pointLight.position.y = 100
		pointLight.position.z = -130

		//this.scene.add( ambientLight ); // doesn't seem like a good idea...
		this.scene.add( pointLight );

		var pointLight2 = new THREE.PointLight( 0x666666 )
		pointLight2.position.x = 0
		pointLight2.position.y = 0
		pointLight2.position.z = 260

		//that.scene.add(ambientLight); // doesn't seem like a good idea...
		this.scene.add( pointLight2 )
		this.lights = [ pointLight, pointLight2 ]
  },
  
  start : function() {
    this.running = true
		window.requestAnimationFrame( this.render );
  },
  
  render : function() {
   
    if( this.running ) {
  		for( var i = 0; i < this.graph.length; i++ ) {
  			this.graph[i]._update();
  			this.graph[i].update();
  		}

  		this.renderer.clear()
      
      if( this.PostProcessing && this.PostProcessing.fx.length ) {
        this.PostProcessing.composer.render()
      }else{
        this.renderer.render( this.scene, this.camera )
      }

  		if( this.stats ) this.stats.update()

  		window.requestAnimationFrame( this.render )
    }
  },
  
  test : function() {
    var cube = new THREE.CubeGeometry( 50, 50, 50 ),
        fill = new THREE.Color( 0x000000 ).setRGB( .5, 0, 0 ),
        mat  = new THREE.MeshPhongMaterial( { color: fill, shading: THREE.FlatShading, shininess: 50 } ),
        geo  = new THREE.Mesh( cube, mat );
				
    this.scene.add( geo )
    this.graph.push( geo )
    
    return geo
  },
  
	showStats : function() {
		this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.top = '0px';
		this.stats.domElement.style.right = '0px';			
		$( 'body' ).append( this.stats.domElement );	
	},
  
  assignWidthAndHeight : function( isInitialSetting ) { // don't run final lines before renderer is setup...
    this.width = $( window ).width()
    this.height = $( window ).height() - $( "thead" ).height() - $( "tfoot" ).height()

    this.canvas.css({
      top: $( '#header' ).height(),
      width: this.width,
      height: this.height,
      zIndex: -1
    })
    
    if( !isInitialSetting ) {
  		this.renderer.setSize( this.width * this.resolution, this.height * this.resolution );
      $( this.renderer.domElement ).css({ width: this.width, height: this.height })

  		this.camera.updateProjectionMatrix();
    }
  },
  
}

})()
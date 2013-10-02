(function() {
  
  Gibber.Graphics.makeFragmentShader = function( fragment ) {
    var gl = Gibber.Graphics.renderer.getContext()
    
    var shader = gl.createShader( gl.FRAGMENT_SHADER )
      // Set the shader source code.

    gl.shaderSource( shader, fragment )

    // Compile the shader
    gl.compileShader( shader )

      // Check if it compiled
    var success = gl.getShaderParameter( shader, gl.COMPILE_STATUS )
    if (!success) {
      // Something went wrong during compilation; get the error
      throw "could not compile shader:" + gl.getShaderInfoLog(shader);
      return null
    }

    var shader = {
    	uniforms: {
    		"tDiffuse": { type: "t", value: null },
        "amp": { type:"f", value:0 },
        "time": { type:"f", value:0 },
    	},

    	vertexShader: [

    		"varying vec2 p;",

    		"void main() {",

    			"p = uv;",
    			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    		"}"

    	].join("\n"),

    	fragmentShader: fragment

    };
    
    return shader;
  }
  
})();
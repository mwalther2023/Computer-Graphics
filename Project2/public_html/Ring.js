"use strict";

// The Cylinder class that defines and draws an open cylinder
// We take in the scale in the constructor to modify the vertex buffer points
//   by the scale on construction - so we never need to scale each point when rendering
function Ring(gl, shaderProgram, inner, outer) {
    var t = this;
    this.gl = gl;
    var inRad = inner;
    var outRad = outer;
    // Create a Vertex Array Object.  This remembers the buffer bindings and
    // vertexAttribPointer settings so that we can reinstate them all just using
    // bindVertexArray.
    this.vao = gl.createVertexArray();  // create and get identifier
    gl.bindVertexArray(this.vao);

    // A cylinder is just a triangle strip alternating top and bottom circle points
    var radius = 1.0;
    this.numSections = 100;
//   this.numSections = 10;
    // Create separate CPU arrays for vertex points and normals
    // Note we do not create colors as they will be computed in the shaderss
    var verts = [];
    var normals = [];
    radius = 1.0;

//    for(var j = 0; j<this.numSections; j++){
//        var lat = (90/this.numSections)*j;
//        var lat2 = (90/this.numSections)*(j+1);
//        var phi = lat*Math.PI/180.0;
//        var phi2 = lat2*Math.PI/180.0;
//        var h = inRad * Math.sin(phi);
//        var h2 = outRad * Math.sin(phi2);
//        var rP = inRad * Math.cos(phi);
//        var rP2 = outRad * Math.cos(phi2);
//        var size = (this.numSections-j)/this.numSections;
        for (var i=0; i<=this.numSections; i++) {  // we go <= to get the circle to close
           var angleDeg = (360.0 / this.numSections)*i;
           var angleRad = angleDeg*Math.PI/180.0;
           var x = inRad * Math.cos(angleRad);
           var z = inRad * Math.sin(angleRad);
           var x2 = outRad * Math.cos(angleRad);
           var z2 = outRad * Math.sin(angleRad);
           verts.push(vec3(x*(15/16), 0.05, z*(15/16)));
           normals.push(normalize(vec3(0, 1, 0)));  // unit vector

           verts.push(vec3(x2, 0, z2));  // bottom circle point
           normals.push(normalize(vec3(0, 1, 0)));  // unit vector
        }
//    }
//    console.log(verts.length);

    this.colors = [];
    for(let i = 0; i < verts.length; i++){
        this.colors.push([0, 0, 0]);
    }
    
    var floatBytes = 4;  // number of bytes in a float value
        
    // Create and load the vertex positions
    this.cylVertVB = gl.createBuffer();  // get unique buffer ID number
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cylVertVB );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verts), gl.STATIC_DRAW );
    this.vPosition = gl.getAttribLocation(shaderProgram, "vPosition");
    gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 3 * floatBytes, 0);
    gl.enableVertexAttribArray(this.vPosition);
     
    // Create and load the vertex colors
//    this.cubeColorVB = gl.createBuffer();  // get unique buffer ID number
//    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeColorVB);
//    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW);
//    this.vColor = gl.getAttribLocation(shaderProgram, "vColor");
//    gl.vertexAttribPointer(this.vColor, 3, gl.FLOAT, false, 3 * floatBytes, 0);
//    gl.enableVertexAttribArray(this.vColor);
 
    // Create and load the vertex normals
    this.cylNormalVB = gl.createBuffer();  // get unique buffer ID number
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cylNormalVB );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    this.vNormal = gl.getAttribLocation(shaderProgram, "vNormal");
    gl.vertexAttribPointer(this.vNormal, 3, gl.FLOAT, false, 3 * floatBytes, 0);
    gl.enableVertexAttribArray(this.vNormal);
    
    
    // Get uniform variable location for transform matrices
    // Reall they need to be separately due to lighting calculations
    this.projectionMat = gl.getUniformLocation(shaderProgram, "projectionMat");
    this.viewMat = gl.getUniformLocation(shaderProgram, "viewMat");
    this.modelMat = gl.getUniformLocation(shaderProgram, "modelMat");
    
        // At the moment, we only send one color and use it for ambient, diffuse and specular
    this.lightPosition = gl.getUniformLocation(shaderProgram, "lightPosition");
    this.lightColor = gl.getUniformLocation(shaderProgram, "lightColor");
    this.ambientFactor = gl.getUniformLocation(shaderProgram, "ambientFactor");
 
    // Texture uniform in frag shader
    this.fTexSampler = gl.getUniformLocation(shaderProgram, "fTexSampler");
    this.fShowTexture = gl.getUniformLocation(shaderProgram, "fShowTexture");
    this.fShowColor = gl.getUniformLocation(shaderProgram, "fShowColor");
    
    gl.bindVertexArray(null);  // un-bind our vao
}

// Render function that draws the cylinder
// We need the 3 transformations matrices as well as the light position
// We are also passed 4 booleans to control the redering details
Ring.prototype.Render = function(projectionMat, viewMat, modelMat) {
   var gl = this.gl; 
    
   // Set up buffer bindings and vertex attributes
   // We did this with the VAO so just use it
   gl.bindVertexArray(this.vao);
   // Set transformation matrices for shader
   gl.uniformMatrix4fv(this.projectionMat, false, flatten(projectionMat));
   gl.uniformMatrix4fv(this.viewMat, false, flatten(viewMat));
   gl.uniformMatrix4fv(this.modelMat, false, flatten(modelMat));
   
    // Light color - hard-coded here to be white
   // Note currently this color is used for ambent, diffuse and specular
   var lColor = vec3(0, 0, 1.0);
   var ambientFactor = 1;  // 30% ambient on everything
   // Pass in the light info
   // No false for these as 2nd parameter
   gl.uniform3fv(this.lightPosition, flatten(vec3(-1,0,0)));
   gl.uniform3fv(this.lightColor, flatten(lColor));
   gl.uniform1f(this.ambientFactor, ambientFactor);
    
   
   // Pass in the material color - hard-coded here to be semi-shiny blue
   // Note currently this color is used for ambent, diffuse and specular
   var mColor = vec3(0, 0, 1);
   var mShiny = 50.0;
   gl.uniform3fv(this.materialColor, flatten(mColor));
   gl.uniform1f(this.materialShiny, mShiny);
   
   
   // Pass in which components to use (booleans pass as 0/1 ints)
   gl.uniform1i(this.ambientOn, true);
//   gl.uniform1i(this.diffuseOn, false);
//   gl.uniform1i(this.specularOn, false);

    this.whiteTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);  // The white texture
    gl.uniform1i(this.fShowColor, false);
    gl.uniform1i(this.fShowTexture, 0);
   // Tell the pipeline to draw the triangles or wireframe
       for (var start = 0; start < (this.numSections*2+2)*this.numSections; start += this.numSections) {
           gl.drawArrays(gl.TRIANGLE_STRIP, start, this.numSections*2+2);
       }
//     gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.numSections*2+2);
 
  gl.bindVertexArray(null);  // un-bind our vao
 
};
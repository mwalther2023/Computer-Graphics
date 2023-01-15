"use strict";
this.plan = [];
//var plan = [];
this.rY = 0;
this.rX = 0;
this.rZ = 0;
this.s = 0;
this.day = 0;
this.year = 0;
this.orbitD = 0;
this.axis = 0;
this.orbitT = 0;
this.aY = 0;
this.oY = 0;
this.mM = mat4();
this.pM = mat4();
this.vM = mat4();
// The Cylinder class that defines and draws an open cylinder
// We take in the scale in the constructor to modify the vertex buffer points
//   by the scale on construction - so we never need to scale each point when rendering
function Planet(gl, shaderProgram, scale,dayPeriod,yearPeriod,orbitDist,axisTilt,orbitTilt,e,text) {
    var t = this;
    this.gl = gl;
//    console.log("TEST: "+yDeg);
    // Create a Vertex Array Object.  This remembers the buffer bindings and
    // vertexAttribPointer settings so that we can reinstate them all just using
    // bindVertexArray.
    this.vao = gl.createVertexArray();  // create and get identifier
    gl.bindVertexArray(this.vao);
    this.plan = [];
    this.s = scale;
    this.day = dayPeriod;
    this.year = yearPeriod;
    this.orbitD = orbitDist;
    this.axis = axisTilt;
    this.orbitT = orbitTilt;
    this.mM = mat4();
    this.pM = mat4();
    this.vM = mat4();
    this.rY = 0;
    this.oY = 0;
    this.rX = 0;
    this.rZ = 0;
    this.aY = 0;
    this.emissive = e;
    this.name = text;
   this.ring = null;
    // A cylinder is just a triangle strip alternating top and bottom circle points
    var radius = 1.0 * scale;
    this.numSections = 20;
    this.angle = 1000/dayPeriod;
//    console.log("Planet: "+ this.s+", "+this.day+", "+this.year);
    // Create separate CPU arrays for vertex points and normals
    // Note we do not create colors as they will be computed in the shaderss
    this.verts = [];
    var normals = [];
    var texCoords = [];
    this.numUSections = 60;
    this.numVSections = 50;
      for(var j = 0; j<this.numVSections; j++){
        var lat = (180.0 * ((j+1)/this.numVSections)) - 90.0;
        var lat2 = (180.0 * ((j)/this.numVSections)) - 90.0;
        
        var phi = lat*Math.PI/180.0;
        var phi2 = lat2*Math.PI/180.0;
        
        for (var i=0; i<=this.numUSections; i++) {  // we go <= to get the circle to close
           var angleDeg = (360.0 / this.numUSections)*i;
           var angleRad = angleDeg*Math.PI/180.0;
           
           var h = scale*Math.sin(phi);
           var rP = scale * Math.cos(phi);
           var x = rP * Math.cos(angleRad);
           var z = rP * Math.sin(angleRad);
           this.verts.push(vec3(x, h, z));  // top circle point
           normals.push(normalize(vec3(x, h, z)));  // unit vector
           var tu = (i/this.numUSections);
           var tv = ((j+1)/this.numVSections)
           texCoords.push(tu,tv);
           
           var h2 = scale * Math.sin(phi2);
           var rP2 = scale * Math.cos(phi2);
           var x2 = rP2 * Math.cos(angleRad);
           var z2 = rP2 * Math.sin(angleRad);
           this.verts.push(vec3(x2, h2, z2));  // bottom circle point
           normals.push(normalize(vec3(x2, h2, z2)));  // unit vector
           tu = (i/this.numUSections);
           tv = ((j+0)/this.numVSections)
           texCoords.push(tu,tv);
        }
    }  

//    console.log(texCoords.length+", "+this.verts.length);
    //colors
    this.colors = [];
    for(let i = 0; i < this.verts.length; i++){
        this.colors.push([i, i*scale, orbitDist]);
    }

    var floatBytes = 4;  // number of bytes in a float value
        
    // Create and load the vertex positions
    this.cubeVertVB = gl.createBuffer();  // get unique buffer ID number
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertVB);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.verts), gl.STATIC_DRAW);
    this.vPosition = gl.getAttribLocation(shaderProgram, "vPosition");
    gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 3 * floatBytes, 0);
    gl.enableVertexAttribArray(this.vPosition);
    
    // Create and load the vertex normals
    this.cylNormalVB = gl.createBuffer();  // get unique buffer ID number
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cylNormalVB );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    this.vNormal = gl.getAttribLocation(shaderProgram, "vNormal");
    gl.vertexAttribPointer(this.vNormal, 3, gl.FLOAT, false, 3 * floatBytes, 0);
    gl.enableVertexAttribArray(this.vNormal);
    
    // Create and load the vertex texture coords
    this.cubeTextureVB = gl.createBuffer();  // get unique buffer ID number
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeTextureVB);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);
    this.vTexCoord = gl.getAttribLocation(shaderProgram, "vTexCoord");
    gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 2 * floatBytes, 0);
    gl.enableVertexAttribArray(this.vTexCoord);
    
    // Get uniform variable location for transform matrices
    // Reall they need to be separately due to lighting calculations
    this.projectionMat = gl.getUniformLocation(shaderProgram, "projectionMat");
    this.viewMat = gl.getUniformLocation(shaderProgram, "viewMat");
    this.modelMat = gl.getUniformLocation(shaderProgram, "modelMat");
    this.transformMat = gl.getUniformLocation(shaderProgram, "transformMat");
    
    // At the moment, we only send one color and use it for ambient, diffuse and specular
    this.lightPosition = gl.getUniformLocation(shaderProgram, "lightPosition");
    this.lightColor = gl.getUniformLocation(shaderProgram, "lightColor");
    this.ambientFactor = gl.getUniformLocation(shaderProgram, "ambientFactor");
    
    // Get uniform variable locations for material properties (K)
    // At the moment, we only send one color and use it for ambient, diffuse and specular
    this.materialColor = gl.getUniformLocation(shaderProgram, "materialColor");
    this.materialShiny = gl.getUniformLocation(shaderProgram, "shiny");
    
    // Get uniform variable locations for Phong components to use
    // Basically these are booleans to control which components the shader uses
    // Note that we could have just created 3 different shaders and then
    //  selected the correct shader based on these boolens.  However, I feel this
    //  way is less code and a bit easier to understand.
    this.ambientOn = gl.getUniformLocation(shaderProgram, "ambientOn");
    this.diffuseOn = gl.getUniformLocation(shaderProgram, "diffuseOn");
    this.specularOn = gl.getUniformLocation(shaderProgram, "specularOn");
    
    // Texture uniform in frag shader
    this.fTexSampler = gl.getUniformLocation(shaderProgram, "fTexSampler");
    this.fShowTexture = gl.getUniformLocation(shaderProgram, "fShowTexture");
    this.fShowColor = gl.getUniformLocation(shaderProgram, "fShowColor");

    // Init the textureMap - this starts the loading and once loaded sets
    //   some initial paramters.  It also sets a variable to let us know
    //   when it is done loading since it loads asynch.
    this.InitTexture(this.name+".bmp");
    
    
    
    this.oPath = new Ring(gl, shaderProgram, 0+orbitDist, 0.01 + orbitDist);
    gl.bindVertexArray(null);  // un-bind our vao
//   requestAnimationFrame(animate);
}

// Render function that draws the cylinder
// We need the 3 transformations matrices as well as the light position
// We are also passed 4 booleans to control the redering details
//Planet.prototype.update = function(t){
//    t.rY += t.year360;
//    t.aY += t.day/1000;
//    console.log(t.rY);
//};
Planet.prototype.Render = function(projectionMat, viewMat, modelMat, path, move){

   var gl = this.gl; 
   var t = this;
//    console.log(r);
   // Set up buffer bindings and vertex attributes
   // We did this with the VAO so just use it
//   Planet.prototype.update(t);
    
    var update = function () {
     
    };
    var y = this.year;
    if(move){
        this.rY += this.year/360;
        this.aY += this.day/1000;
    }
//    console.log(t.year);
   gl.bindVertexArray(this.vao);
   // Set transformation matrices for shader
//modeMat is from parent planet

// build model mat
    var localMat = mat4();
//orbit tilt
    var orbMat = rotateZ(-this.orbitT);
    localMat = mult(localMat,orbMat);
//year
//    this.rY += this.year/360;
    var yearMat = rotateY(this.rY);
    localMat = mult(localMat, yearMat);
//trans
    var transMat = translate(this.orbitD,0,0);
    localMat = mult(localMat, transMat);
//axis tilt
    var axMat = rotateZ(this.axis);
    localMat = mult(localMat, axMat);
//day
//    this.aY += this.day/1000;
    var dayMat = rotateY(this.aY);
    localMat = mult(localMat, dayMat);
    
    localMat = mult(modelMat,localMat);
    this.mM = localMat;
//    console.log("Planet Render");
   
    gl.uniformMatrix4fv(this.projectionMat, false, flatten(projectionMat));
    gl.uniformMatrix4fv(this.viewMat, false, flatten(viewMat));
    gl.uniformMatrix4fv(this.modelMat, false, flatten(localMat));

       // Light color - hard-coded here to be white
   // Note currently this color is used for ambent, diffuse and specular
   var lColor = vec3(1.0, 1.0, 1.0);
   var ambientFactor = 0.3;  // 30% ambient on everything
   if(this.emissive){
       ambientFactor = 1;
   }
       
   // Pass in the light info
   // No false for these as 2nd parameter
   gl.uniform3fv(this.lightPosition, flatten(vec3(0,0,0)));
   gl.uniform3fv(this.lightColor, flatten(lColor));
   gl.uniform1f(this.ambientFactor, ambientFactor);
    
   
   // Pass in the material color - hard-coded here to be semi-shiny blue
   // Note currently this color is used for ambent, diffuse and specular
   var mColor = vec3(1, 1, 1);
    if(this.emissive){
       mColor = vec3(1, 1, 0);
   }
   var mShiny = 50.0;
   gl.uniform3fv(this.materialColor, flatten(mColor));
   gl.uniform1f(this.materialShiny, mShiny);
   
   
   // Pass in which components to use (booleans pass as 0/1 ints)
   if(this.emissive){
        gl.uniform1i(this.ambientOn, true);
        gl.uniform1i(this.diffuseOn, false);
        gl.uniform1i(this.specularOn, false);
   }
   else{
        gl.uniform1i(this.ambientOn, true);
        gl.uniform1i(this.diffuseOn, true);
        gl.uniform1i(this.specularOn, true);
   }
   
    gl.activeTexture(gl.TEXTURE0);  // which of the multiple texture units to use
    gl.uniform1i(this.fTexSampler, 0); // The texture unit to use
   
   if (this.textureLoaded) {
       
        gl.bindTexture(gl.TEXTURE_2D, this.texture);  // The image
        gl.uniform1i(this.fShowColor, false);
        gl.uniform1i(this.fShowTexture, 1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        
    } else {
        gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);  // The white texture
        gl.uniform1i(this.fShowColor, false);
        gl.uniform1i(this.fShowTexture, 0);
    }
   
    for (var start = 0; start < (this.numVSections*this.numUSections)*2+100; start += this.numUSections) {
           gl.drawArrays(gl.TRIANGLE_STRIP, start, this.numUSections*2+100);
       }

  gl.bindVertexArray(null);  // un-bind our vao
  

  
    if(this.ring !== null){
        this.ring.Render(projectionMat,viewMat, localMat);
    }
    if(path){
        var ringMat = mult(modelMat,orbMat);
        this.oPath.Render(projectionMat, viewMat, ringMat);
    }
    for(var i = 0; i< this.plan.length; i++){
      this.plan[i].Render(projectionMat, viewMat, localMat, path,move);
    }
    
};


Planet.prototype.InitTexture = function (textureURL) {
    var gl = this.gl;
    
    // First make a white texture for when we don't want to have a texture
    //   This prevents shader warnings even if we don't sample from it
    this.whiteTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

    // Load the texture from url (with generated mipmaps)
    this.textureLoaded = false;

    var texture = this.texture = gl.createTexture();
    var textureImage = new Image();
    var t = this;

    // Set up function to run asynchronously after texture image loads
    textureImage.onload = function () {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
      
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      
        gl.generateMipmap(gl.TEXTURE_2D);  // incase we need min mipmap
        
        t.textureLoaded = true;  // flag texture load complete
    };

    textureImage.src = textureURL;  // start load of texture image
    
};


Planet.prototype.attachMoon = function(p){
    p.addModel(mat4());
//    console.log("t "+ p.getModel());
    this.plan.push(p);
};
Planet.prototype.addModel = function(m){
//    models.push(m);
    this.mM = m;
//    console.log(plan);
};
Planet.prototype.getPlanets = function(){
    return this.plan;
};
Planet.prototype.getDay = function(){
    return this.day;
};
Planet.prototype.getYear = function(i){
    return this.year;
};
Planet.prototype.getOrbitD = function(){
    return this.orbitD;
};
Planet.prototype.getAxis = function(){
    return this.axis;
};
Planet.prototype.getOrbitT= function(){
    return this.orbitT;
};
Planet.prototype.getModel= function(){
//    console.log("Planet getModel: "+this.models);
    return this.mM;
};
Planet.prototype.getY= function(){
//    console.log("GetY: "+this.rY);
    return this.rY;
};
Planet.prototype.setY= function(y){
    this.rY = y;
};
Planet.prototype.updateOrbit= function(){
        var currentPlanet = this.year;
        this.oY = currentPlanet/360;
        var rYo = rotateY(this.oY);
        this.mM = mult(this.mM,rYo);
};
Planet.prototype.updateAxis= function(){
    var t = translate(this.orbitD,0,0);
            var currentPlanet = this.day;
         console.log("Axis");
        this.aY = currentPlanet/1000;
          
        var rXa = rotateX(0);
        var rYa = rotateY(this.aY);
        var rZa = rotateZ(this.axis);
    
        var rA = mult(rXa,mult(rYa,rZa));

        this.mM = mult(this.mM, mult(t,rYa));

};
Planet.prototype.updateMoon= function(p){
    var t = translate(this.orbitD,0,0);
    var currentPlanet = this.year;    
    this.rY = currentPlanet/360;

    var rXo = rotateX(0);
    var rYo = rotateY(this.rY);
    var rZo = rotateZ(0);
    var rO = mult(rXo,mult(rZo,rYo));
    this.mM = mult(rO, mult(this.mM,p.getModel()));
    this.Render(this.pM,this.vM,this.mM);
};
Planet.prototype.attachRing= function(gl, shader, inner,outter){
    this.ring = new Ring(gl, shader, inner, outter);
};
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
function Planet(gl, shaderProgram, scale,dayPeriod,yearPeriod,orbitDist,axisTilt,orbitTilt) {
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
    // A cylinder is just a triangle strip alternating top and bottom circle points
    var radius = 1.0 * scale;
    this.numSections = 4;
    this.angle = 1000/dayPeriod;
//    console.log("Planet: "+ this.s+", "+this.day+", "+this.year);
    // Create separate CPU arrays for vertex points and normals
    // Note we do not create colors as they will be computed in the shaderss
    var verts = [];
    var normals = [];
    for (var i=0; i<=this.numSections; i++) {  // we go <= to get the circle to close
       var angleDeg = (360.0 / this.numSections)*i;
       var angleRad = angleDeg*Math.PI/180.0;
       var x = radius * Math.cos(angleRad);
       var z = radius * Math.sin(angleRad);
       var y = 1.0 * scale;
//       console.log(x+", "+y+", "+z);
       verts.push(vec3(x, y, z));   // top circle point
       normals.push(normalize(vec3(x, 0.0, z)));  // unit vector
       
       verts.push(vec3(x, -y/2, z));  // bottom circle point
       normals.push(normalize(vec3(x, 0.0, z)));  // unit vector
       
    }
//    console.log(verts);
    verts = [0.5, -0.5, -0.5, // +x face
        0.5, 0.5, -0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,

        -0.5, -0.5, 0.5, // -x face
        -0.5, 0.5, 0.5,
        -0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5,

        -0.5, 0.5, -0.5, // +y face
        -0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,
        0.5, 0.5, 0.5,

        0.5, -0.5, -0.5, // -y face
        0.5, -0.5, 0.5,
        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,

        -0.5, -0.5, 0.5, // +z face
         0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,

        -0.5, 0.5, -0.5, // -z face
         0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5
    ];

    // Sets size of planet
    for(var i = 0; i<verts.length; i++){
        verts[i] = verts[i]*scale;
    }
    // Sets distance of planet from origin
//    for(var i = 0; i<verts.length; i+=3){
//        verts[i] = verts[i] + orbitDist;
//    }
//    for(var i = 2; i<verts.length; i+=3){
//        verts[i] = verts[i] - orbitDist; // need to do rotation first
//    }
    // Sets orbit height
//    for(var i = 1; i<verts.length; i+=3){
//        verts[i] = verts[i] + orbitTilt;
//    }
    
//    console.log(verts);

    var colors = [0, 1, 1,      // cyan
        0, 1, 1,
        0, 1, 1,
        0, 1, 1,
        
        1, 0, 0,   // red
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        1, 0, 1,      // magenta
        1, 0, 1,
        1, 0, 1,
        1, 0, 1,

        0, 1, 0,    // green
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        1, 1, 0,      // yellow
        1, 1, 0,
        1, 1, 0,
        1, 1, 0,

        0, 0, 1,     // blue
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
    ];
    
    var floatBytes = 4;  // number of bytes in a float value
        
    // Create and load the vertex positions
    this.cubeVertVB = gl.createBuffer();  // get unique buffer ID number
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertVB);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verts), gl.STATIC_DRAW);
    this.vPosition = gl.getAttribLocation(shaderProgram, "vPosition");
    gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 3 * floatBytes, 0);
    gl.enableVertexAttribArray(this.vPosition);
     
    // Create and load the vertex colors
    this.cubeColorVB = gl.createBuffer();  // get unique buffer ID number
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeColorVB);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    this.vColor = gl.getAttribLocation(shaderProgram, "vColor");
    gl.vertexAttribPointer(this.vColor, 3, gl.FLOAT, false, 3 * floatBytes, 0);
    gl.enableVertexAttribArray(this.vColor);
    
    // Get uniform variable location for transform matrices
    // Reall they need to be separately due to lighting calculations
    this.projectionMat = gl.getUniformLocation(shaderProgram, "projectionMat");
    this.viewMat = gl.getUniformLocation(shaderProgram, "viewMat");
    this.modelMat = gl.getUniformLocation(shaderProgram, "modelMat");
    this.transformMat = gl.getUniformLocation(shaderProgram, "transformMat");
    gl.bindVertexArray(null);  // un-bind our vao
//   requestAnimationFrame(animate);
}

// Render function that draws the cylinder
// We need the 3 transformations matrices as well as the light position
// We are also passed 4 booleans to control the redering details
Planet.prototype.Render = function(projectionMat, viewMat, modelMat){//, lightPosition, showEdges, ambientOn, diffuseOn, specularOn) {

   var gl = this.gl; 
    
   // Set up buffer bindings and vertex attributes
   // We did this with the VAO so just use it
   gl.bindVertexArray(this.vao);
   

//    console.log("Render: "+modelMat);
   // Set transformation matrices for shader

//modeMat is from parent planet
// build model mat
    var localMat = mat4();
//orbit tilt
    var orbMat = rotateZ(-this.orbitT);
    localMat = mult(localMat,orbMat);
//year
    this.rY += this.year/360;
    var yearMat = rotateY(this.rY);
    localMat = mult(localMat, yearMat);
//trans
    var transMat = translate(this.orbitD,0,0);
    localMat = mult(localMat, transMat);
//axis tilt
    var axMat = rotateZ(this.axis);
    localMat = mult(localMat, axMat);
    this.aY += this.day/1000;
//day
    var dayMat = rotateY(this.aY);
    localMat = mult(localMat, dayMat);
    
    localMat = mult(modelMat,localMat);
    this.mM = localMat;
//    console.log("Planet Render");
    gl.uniformMatrix4fv(this.projectionMat, false, flatten(projectionMat));
    gl.uniformMatrix4fv(this.viewMat, false, flatten(viewMat));
    gl.uniformMatrix4fv(this.modelMat, false, flatten(localMat));
   
//   viewMat = mult(projectionMat, viewMat);
//   var modelViewMat = mult(viewMat, modelMat);
//   console.log(modelViewMat);
//   gl.uniformMatrix4fv(this.transformMat, false, flatten(modelViewMat));
   // Tell the pipeline to draw the triangles or wireframe
   for (var start = 0; start < 24; start += this.numSections) {
        gl.drawArrays(gl.TRIANGLE_STRIP, start, this.numSections);
   }
 
          
  gl.bindVertexArray(null);  // un-bind our vao
// Planet.prototype.update(projectionMat, viewMat, modelMat,this.angle);
};

Planet.prototype.attachMoon = function(p){
    p.addModel(mat4());
//    console.log("t "+ p.getModel());
    this.plan.push(p);
//    var rXa = rotateX(0);
//    var rYa = rotateY(0);
//    var rZa = rotateZ(p.getAxis());
//    var rA = mult(rXa,mult(rZa,rYa));
//    
//    var rXo = rotateX(0);
//    var rYo = rotateY(0);
//    var rZo = rotateZ(-p.getOrbitT());
//    
//    var rO = mult(rXo,mult(rYo,rZo));
//    
//    
//    var t = translate(p.getOrbitD(),0,0);
//    console.log("attachMoon(): "+mult(rO,t));
//    console.log("Planet: "+this.year+" - attachMoon(): "+this.mM);
//     p.addModel(mult(this.mM, mult(rO,mult(t,rA)))); //rotate planet on orbit and axis (WORKS)
//     p.addModel(mult(this.mM,mult(rO,t)));
//    p.addModel(mult(this.mM,rP));
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
      
//    var m = mat4();
        var currentPlanet = this.year;
//            rotateXDegrees = Math.cos(rad) * Math.sin(rad);
//            rotateZDegrees = Math.sin(rad);// * Math.cos(rad);
        this.oY = currentPlanet/360;

//        var rXm = rotateX(this.rX);
//        var rYm = rotateY(this.aY);
//        var rZm = rotateZ(this.rZ);
//        var r = mult(rXm,mult(rZm,rYm));
        
        var rYo = rotateY(this.oY);
//        var m = this.p.getModel();
        this.mM = mult(this.mM,rYo);
//        Planet.prototype.updateAxis();
//        this.Render(this.pM,this.vM,this.mM);
        
//        console.log("Planet update() " + rYm);
//    requestAnimationFrame(render);
//    requestAnimationFrame(update);
//        this.update();
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
        
//                var rZo = rotateZ(this.orbitT);
//    
//        var rO = mult(rXo,mult(rYo,rZo));
//        console.log("updateAxis(): "+rA);
//        this.mM = mult(this.mM,mult(rO,t));
//        this.mM = mult(rO,this.mM);
        this.mM = mult(this.mM, mult(t,rYa));
//        Planet.prototype.updateOrbit();
//        this.Render(this.pM,this.vM,this.mM);
};
Planet.prototype.updateMoon= function(p){
    var t = translate(this.orbitD,0,0);
    var currentPlanet = this.year;    
    this.rY = currentPlanet/360;

    var rXo = rotateX(0);
    var rYo = rotateY(this.rY);
    var rZo = rotateZ(0);
//    console.log(this.orbitD);
    var rO = mult(rXo,mult(rZo,rYo));
//    this.mM = mult(rO,mult(t,mult(this.mM,modelM)));
    this.mM = mult(rO, mult(this.mM,p.getModel()));
    this.Render(this.pM,this.vM,this.mM);
};
/**
 * Lab 4 - COMP3801 Spring 2021
 *   ColorCube - draw a rotating cube with six different color faces
 */

"use strict";

/**
 * Constructor
 * 
 * @param canvasID - string containing name of canvas to render.
 */
this.shipViewMat = mat4();
var rotMat = mat4();
var modelMat = mat4();
var tranMat = mat4();
this.proj = mat4();
this.aspectScale = 0;
this.x = 0;
this.y = 0;
this.z = 0;
  this.lat = 0;
  this.long = -90;
  this.radius = 30;
  var rotY = 0;
  var moveX = 0;
  var moveY = 0;
  var moveZ = 0;
this.key = '';
var drawMat = mat4();
var verts =[];
var move = true;
function Ship(gl, shaderProgram, vM, a, sm, sY ) {
  var t = this;  // save reference to this object for callbacks
    this.shipViewMat = vM;
    rotMat = mat4();
    modelMat = mat4();
    tranMat = mat4();
    drawMat = mat4();
  // Find ratio of canvas width to height to correct stretching
  // that occurs when the viewport is not exactly square
  // (later this will be incorporated into the projection matrix).
  // Build a scale matrix to perform this correction (it is used in
  // the Render function).
  this.aspectScale = a;
  this.x = 0;
  this.y = 0;
  this.z = 0;
//  gl.clearColor(0.3, 0.1, 0.1, 1.0);
  this.proj = mat4();
  this.lat = 0;
  this.long = -90;
  this.radius = 35;
  rotY = 0;
  moveX = 0;
  moveY = sY;
  moveZ = 0;
  tranMat = translate(moveX,moveY,moveZ);
  this.key = '';
  move = sm;
  this.shade = shaderProgram;
//  console.log(this.move);

 
    var t = this;
    this.gl = gl;
    // Create a Vertex Array Object.  This remembers the buffer bindings and
    // vertexAttribPointer settings so that we can reinstate them all just using
    // bindVertexArray.
    this.vao = gl.createVertexArray();  // create and get identifier
    gl.bindVertexArray(this.vao);

//  console.log("Start: "+this.rotY);
  // Enable hidden-surface removal (draw pixel closest to viewer)
//  gl.enable(gl.DEPTH_TEST);

  // Compile and link shaders
//  this.shaderProgram = initShaders(gl, "vShader.glsl", "fShader.glsl");
//  if (this.shaderProgram === null) return;
//  gl.useProgram(this.shaderProgram);


     


  var screen = document.body.addEventListener("keydown", 
        function(e) {
//            console.log(e.key);
//            console.log(e.code);
        this.key = e.key;
//        this.rotY = 0;
//       console.log("Event1: "+this.move);
//       this.ship.setKeyPressed(k);
     
        if(this.key =='w'){
            Ship.prototype.moveUp(-1);
//            requestAnimationFrame(up);
        }
        else if(this.key =='a'){
            Ship.prototype.moveSideways(1);
        }
        else if(this.key =='s'){
            Ship.prototype.moveUp(1);
        }
        else if(this.key =='d'){
            Ship.prototype.moveSideways(-1);
        }
        else if(this.key =='q'){
//            if(!move){
//                Ship.prototype.setRotate();
//            }
            Ship.prototype.rotate(1);
        }
        else if(this.key =='e'){
//            console.log("Event2: "+rotY);
            Ship.prototype.rotate(-1);
        }
        else if(this.key =='z'){
            Ship.prototype.moveForward(1);
        }
        else if(this.key =='x'){
            Ship.prototype.moveForward(-1);
        }
    
   });

  
  // Get uniform variable location for transform matrix
//  this.transformMat = gl.getUniformLocation(this.shaderProgram, "transformMat");
  
  
  // Set up callback to render a frame
  var up = function () {
    moveY += -1;
    tranMat = translate(moveX,moveY,moveZ);
    if(move)
    console.log("up");
    t.Render();
  };
  var down = function () {
    moveY += 1;
    tranMat = translate(moveX,moveY,moveZ);
    t.Render();
  };
//  requestAnimationFrame(up);
  // Define callback for change of slider value

    gl.bindVertexArray(null);
  // Show the first frame
//  requestAnimationFrame(render);
};



/**
 * Render - draw the scene on the canvas
 * 
 */
Ship.prototype.Draw = function() {
    var gl = this.gl;
    gl.bindVertexArray(this.vao);
//  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    verts = [-0.5, 0.5, -0.5, // +y face
        -0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,
        0.5, 0.5, 0.5
    ];
    for(var i = 0; i<verts.length; i++){
        verts[i] = verts[i]*3;
    }
    for(var i = 2; i<verts.length; i+=3){
        verts[i] = verts[i] - this.radius+1 + moveZ;
    }
    for(var i = 0; i<verts.length; i+=3){
        verts[i] = verts[i] + moveX;
    }
    var colors = [0, 0, 0,      // black
        0, 0, 0,
        0, 0, 0,
        0, 0, 0
    ];
    var floatBytes = 4;  // number of bytes in a float value
    // Create and load the vertex positions
    this.cubeVertVB = gl.createBuffer();  // get unique buffer ID number
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertVB);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verts), gl.STATIC_DRAW);
    this.vPosition = gl.getAttribLocation(this.shade, "vPosition");
    gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 3 * floatBytes, 0);
    gl.enableVertexAttribArray(this.vPosition);
    // Create and load the vertex colors
    this.cubeColorVB = gl.createBuffer();  // get unique buffer ID number
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeColorVB);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    this.vColor = gl.getAttribLocation(this.shade, "vColor");
    gl.vertexAttribPointer(this.vColor, 3, gl.FLOAT, false, 3 * floatBytes, 0);
    gl.enableVertexAttribArray(this.vColor);
    
   var localMat = mat4();
   var vm = mult(this.shipViewMat,this.proj);
//   console.log(this.proj);
   localMat = mult(tranMat,localMat);
   localMat = mult(rotMat,localMat);
   localMat = mult(vm,localMat);
//      var projectionMat = this.proj;
    gl.uniformMatrix4fv(this.modelMat, false, flatten(localMat));
        this.numSections = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  
gl.bindVertexArray(null);
}
Ship.prototype.Render = function() {

  // Projection matrix is what is used to go from 3d to 2d                         
  // Adjusting the aspect ratio to match the canvas size is the last thing
  // we want to do.  It will be generalized in future work to include more
  // view information beside a simple aspect change.
  // And recall the default projection is orthogonal
//  var fov = this.sliders["sx"].valueAsNumber;
//  var near  = this.sliders["sy"].valueAsNumber;
//  var far = this.sliders["sz"].valueAsNumber;
    
//  var projectionMat = this.aspectRatio;
var projectionMat = this.proj;
//console.log(this.proj);
//  var a = this.canvas.width/this.canvas.height;
//  var projectionMat = perspective(fov,a,near,far);
//  var projectionMat = perspective(fov,0.625,near,far);
  // The view matrix is what positions the camera
  var viewMat = mat4();
  var up = vec3(0,1,0);
  var at = vec3(0,0,0);
  
//  console.log(this.radius);
  var cx = this.radius * Math.cos(this.lat*Math.PI/180) * Math.cos(this.long*Math.PI/180);
  var cz = this.radius * Math.cos(this.lat*Math.PI/180) * Math.sin(this.long*Math.PI/180);
//  var e = ((x*x) - (z*z))/(x*x);
  var cy = this.radius * Math.sin(this.lat*Math.PI/180);
  
  var eye = vec3(cx,cy,cz);
//  console.log("Ship Render(): "+cx+", "+cy+", "+cz);
//  viewMat = lookAt(eye,at,up);
  this.shipViewMat = lookAt(eye,at,up);
//  console.log(this.shipViewMat);
//  this.shipViewMat = mult(projectionMat, this.shipViewMat);
  
  
  // Combine the internal and external camera matrices together
//  this.modelViewMat = mult(projectionMat, this.modelViewMat);
//  var rX = rotateX(xIn);
//  var rY = rotateY(yIn);
//  var rZ = rotateZ(zIn);
//  var r = mult(rX,mult(rZ,rY));
    // Identity - no movement of the model
//    if(this.move){
//        tranMat = mult(tranMat, translate(moveX,moveY,-30))
//    }
    modelMat = mat4();

  modelMat = mult(tranMat,rotMat);
//  console.log(rotMat);
//  gl.uniformMatrix4fv(this.viewMat, false, flatten(mat4()));
//  gl.uniformMatrix4fv(this.MM, false, flatten(mat4()));
//    console.log(this.sliderIDs);
  // combine the model and view together
  this.shipViewMat = mult(modelMat, this.shipViewMat);
//  console.log(projectionMat);
//  this.shipViewMat = mult(projectionMat, this.shipViewMat);
//  console.log(this.move);
//console.log("Out");

  // Set transformation matrix for shader
//  gl.uniformMatrix4fv(this.transformMat, false, flatten(this.modelViewMat));
};
Ship.prototype.setKeyPressed = function(keyIn) {
    this.key = keyIn;
};
Ship.prototype.setProj = function(pM) {
    this.proj = pM;
};
Ship.prototype.setLong = function(l) {
    this.long = l;
};
Ship.prototype.setLat = function(l) {
    this.lat = l;
//    console.log(this.lat);
};
Ship.prototype.setRadius = function(r) {
    this.radius = r;
};
Ship.prototype.getView = function() {
    return this.shipViewMat;
};
Ship.prototype.moveForward = function(d) {
    moveZ += d;
    tranMat = translate(moveX,moveY,moveZ);
//    for(var i = 2; i<verts.length; i+=3){
//        verts[i] = verts[i] + d;
//    }
//    console.log(verts);
//    Ship.prototype.Draw();
};
Ship.prototype.moveSideways = function(d) {
    moveX += d;
    tranMat = translate(moveX,moveY,moveZ);
};
Ship.prototype.moveUp = function(d) {
    moveY += d;
    tranMat = translate(moveX,moveY,moveZ);
};
Ship.prototype.rotate = function(theta) {
    rotY += theta;
        var rX = rotateX(0);
        var rY = rotateY(rotY);
        var rZ = rotateZ(0);
        
//        rotMat = mult(rX,mult(rZ,rY));
        rotMat = rotateY(rotY);
        rotMat = mult(translate(-moveX,-moveY,-moveZ),mult(rotMat,tranMat));
//        console.log("rotate2(): "+this.rotMat);
};
Ship.prototype.setRotate = function() {
    rotY = 0;
    var rX = rotateX(0);
        var rY = rotateY(rotY);
        var rZ = rotateZ(0);
        
        rotMat = mult(rX,mult(rZ,rY));
};
Ship.prototype.setDraw = function(d) {
    drawMat = d;
}
Ship.prototype.getRadius = function() {
    return this.radius;
}

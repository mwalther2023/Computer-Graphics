"use strict";

//var modelMat = mat4();
// The main starting class for lab5.
// This class connects to the html interface and sets up the cylinder,
//   camera, and light
function Solar(canvasID) {
  var t = this;  // save reference to this object for callbacks
  this.canvasID = canvasID;
  var canvas = this.canvas = document.getElementById(canvasID);
  if (!canvas) {
      alert("Canvas ID '" + canvasID + "' not found.");
      return;
  }
  
  var gl = this.gl = WebGLUtils.setupWebGL(this.canvas);
  if (!gl) {
      alert("WebGL isn't available in this browser");
      return;
  }
    // Enable hidden-surface removal (draw pixel closest to viewer)
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.SCISSOR_TEST);
  // Make the entire canvas be the viewport and set a grey background

  this.height = canvas.height;
  this.width = canvas.width;
//  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  




  // Compile and link shaders
  this.shaderProgram = initShaders(gl, "vShader.glsl", "fShader.glsl");
  if (this.shaderProgram === null) return;
  gl.useProgram(this.shaderProgram);
  
  var vM = mat4();
  var a = this.canvas.width / this.canvas.height;
  this.ship = new Ship(gl, this.shaderProgram,vM,a,false, 0);

    this.ship.moveUp(-10);
  // scale, day, year, orbDist, axisTilt, orbTilt, emissive

  this.sun = new Planet(gl, this.shaderProgram, 7, 0, 0, 0, 0, 0, true,"sun");
  this.mercury = new Planet(gl, this.shaderProgram, 1, 10, 100, 8, 0, 7, false,"mercury");
  this.venus = new Planet(gl, this.shaderProgram, 2, 1, 50, 11, 2, 7, false,"venus");
  this.earth = new Planet(gl, this.shaderProgram, 2, 200, 15, 15, 24, 7, false,"earth");
     this.earthMoon = new Planet(gl, this.shaderProgram, .5, 100, 100, 3, 7, 80, false,"moon");
  this.mars = new Planet(gl, this.shaderProgram, 2, 210, 50, 20, 25, 7, false,"mars");
  this.jupiter = new Planet(gl, this.shaderProgram, 4, 500, 5, 30, 3, 7, false,"jupiter");
    this.jupiterEuropa = new Planet(gl, this.shaderProgram, .5, 100, 100, 4.5, 0, 10, false,"moon");
    this.jupiterIo = new Planet(gl, this.shaderProgram, .25, 100, 75, 5, 0, 40, false,"moon");
    this.jupiterGanymede = new Planet(gl, this.shaderProgram, .75, 100, 125, 5.5, 0, 90, false,"moon");
  this.saturn = new Planet(gl, this.shaderProgram, 4, 110, 6, 40, 27, 7, false,"saturn");
  this.uranus = new Planet(gl, this.shaderProgram, 3, 250, 2, 50, 82, 7, false,"uranus");
  this.neptune = new Planet(gl, this.shaderProgram, 3, 260, 1, 60, 28, 7, false,"neptune");
  


  this.sun.attachMoon(this.mercury);
  this.sun.attachMoon(this.venus);
  this.sun.attachMoon(this.earth);
  this.sun.attachMoon(this.mars);
  this.sun.attachMoon(this.jupiter);
    this.sun.attachMoon(this.saturn);
    this.sun.attachMoon(this.uranus);
    this.sun.attachMoon(this.neptune);

//    this.sun.attachRing(gl, this.shaderProgram,10,11);
    
    this.saturn.attachRing(gl, this.shaderProgram,5,7);
    
  this.earth.attachMoon(this.earthMoon);
  this.jupiter.attachMoon(this.jupiterEuropa);
  this.jupiter.attachMoon(this.jupiterIo);
  this.jupiter.attachMoon(this.jupiterGanymede);
//  this.sun.addModel(modelMat);

  // Set up callback to render a frame
  var render = function () {
    t.Render(path,viewType);
  };
    
  var update = function () {
      var p = t.sun.getPlanets();
      if(status){
        requestAnimationFrame(render);
      }
      
      requestAnimationFrame(update);
  };
  var button = document.getElementById(this.canvasID + "-button");
  var status = true;
  button.addEventListener("click",
           function () {
             status = !status;
  });
  var oButton = document.getElementById(this.canvasID + "-orbit");
  var path = true;
  oButton.addEventListener("click",
           function () {
             path = !path;
  });
  
  var vButton = document.getElementById(this.canvasID + "-view");
  var viewType = 1;
  vButton.addEventListener("click",
           function () {
             viewType +=1;
  });
  
  // Show the first frame
  requestAnimationFrame(update);
};


// The Render function that gets called each time we need to redraw the scene
Solar.prototype.Render = function(oPath,viewType) {
  var gl = this.gl;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
           
  // Setup a fixed perspective projection matrix
  var fov = 90.0;
  var aspect = this.canvas.width / this.canvas.height;
  var near = 0.1;
  var far = 200.0;
  var projectionMat = perspective(fov, aspect, near, far);
  var orthoProj = ortho(0,this.canvas.width,0,this.canvas.height/2,near,far);

  this.ship.setProj(projectionMat);
  // We want the camera to move in polar coords for this lab
  // We could just use rotation/trans matrix instead of lookAt
  // But since lookAt is used a lot, we will use lookAt here
  // We will need to take the polar info and turn it into lookAt info by hand
  

  // Note Math.cos/sin need rad so need to convert from degrees
 // Form the view matrix

  var viewMat = mat4();
  var modelMat = mat4();  // Identity - no movement of the model
//  modelMat = this.mM;
  var lPosition = vec3(0, 0, 0);
  
//  console.log("Solar viewMat: "+viewMat);
//this.ship.setLat(0);
  viewMat = this.ship.getView();
//  console.log("Top: "+viewMat);
//  console.log("Solar ShipViewMat: "+viewMat);
  // Tell the cylinder to draw itself
  // Need to send all three matrices separately due to how they will be used
  //   in the shader for lighting calculations
  if(viewType%3 === 1){
    gl.viewport(0, this.height/2, this.width, this.height);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    this.ship.Render();

    var mM = mat4();
    this.sun.Render(projectionMat, viewMat, mM, oPath, true);
//    this.mercury.Render(projectionMat, viewMat,  this.sun.getModel(), oPath);
//    this.venus.Render(projectionMat, viewMat,  mM, this.oPath);
//    this.earth.Render(projectionMat, viewMat,  this.sun.getModel(), oPath);
//    this.mars.Render(projectionMat, viewMat,  mM, oPath);
//    this.jupiter.Render(projectionMat, viewMat,  mM, oPath);
//    this.saturn.Render(projectionMat, viewMat,  mM, oPath);
//    this.uranus.Render(projectionMat, viewMat,  mM, oPath);
//    this.neptune.Render(projectionMat, viewMat,  mM, oPath);
//    this.earthMoon.Render(projectionMat, viewMat, this.earth.getModel(), oPath);
//    this.jupiterEuropa.Render(projectionMat, viewMat, this.jupiter.getModel(), oPath);
//    this.jupiterIo.Render(projectionMat, viewMat, this.jupiter.getModel(), oPath);
//    this.jupiterGanymede.Render(projectionMat, viewMat, this.jupiter.getModel(), oPath);



    gl.viewport(0, 0, this.width, this.height/2);
  //  gl.clearColor(0, 0, 0, 1.0);
    var cx = 35 * Math.cos(90*Math.PI/180) * Math.cos( -90*Math.PI/180);
    var cy = 35 * Math.sin(90*Math.PI/180);
    var cz = 35 * Math.cos(90*Math.PI/180) * Math.sin( -90*Math.PI/180);

    // Given the lat/long/rad in the Html file,
    //   the default position would be long of 0 which is on
    //   the positive x axis out 2.5 distance (i.e. (2.5, 0, 0) looking back at (0,0,0)

    var eye = vec3(cx,cy,cz);  // location of camera contolled by converted slider coods

    // Look at and up will always be the same for this lab
    var at = vec3(0,0,0);  // always looking at the center for this lab
    var up = vec3(0,1,0);  // this will work for everything except the poles
    var camlocMat = mat4();
    camlocMat = lookAt(eye, at, up); 

//    this.sun2.Render(projectionMat, camlocMat, mM, oPath,false);
    this.sun.Render(projectionMat, camlocMat, mM, oPath,false);

      this.ship.Draw();

//    this.mercury.Render(projectionMat, camlocMat,  this.sun.getModel(), oPath);
//    this.venus.Render(projectionMat, camlocMat,  mM, oPath);
//    this.earth.Render(projectionMat, camlocMat,  this.sun.getModel(), oPath);
//    this.mars.Render(projectionMat, camlocMat,  mM, oPath);
//    this.jupiter.Render(projectionMat, camlocMat,  mM, oPath);
//    this.saturn.Render(projectionMat, camlocMat,  mM, oPath);
//    this.uranus.Render(projectionMat, camlocMat,  mM, oPath);
//    this.neptune.Render(projectionMat, camlocMat,  mM, oPath);
//
//      this.earthMoon.Render(projectionMat, camlocMat, this.earth.getModel(), oPath);
//    this.jupiterEuropa.Render(projectionMat, camlocMat, this.jupiter.getModel(), oPath);
//    this.jupiterIo.Render(projectionMat, camlocMat, this.jupiter.getModel(), oPath);
//    this.jupiterGanymede.Render(projectionMat, camlocMat, this.jupiter.getModel(), oPath);
  }
  else if(viewType % 3 === 2){
      gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    this.ship.Render();

    var mM = mat4();
    this.sun.Render(projectionMat, viewMat, mM, oPath,true);
//    this.mercury.Render(projectionMat, viewMat,  this.sun.getModel(), oPath);
//    this.venus.Render(projectionMat, viewMat,  mM, this.oPath);
//    this.earth.Render(projectionMat, viewMat,  this.sun.getModel(), oPath);
//    this.mars.Render(projectionMat, viewMat,  mM, oPath);
//    this.jupiter.Render(projectionMat, viewMat,  mM, oPath);
//    this.saturn.Render(projectionMat, viewMat,  mM, oPath);
//    this.uranus.Render(projectionMat, viewMat,  mM, oPath);
//    this.neptune.Render(projectionMat, viewMat,  mM, oPath);
//    this.earthMoon.Render(projectionMat, viewMat, this.earth.getModel(), oPath);
//    this.jupiterEuropa.Render(projectionMat, viewMat, this.jupiter.getModel(), oPath);
//    this.jupiterIo.Render(projectionMat, viewMat, this.jupiter.getModel(), oPath);
//    this.jupiterGanymede.Render(projectionMat, viewMat, this.jupiter.getModel(), oPath);
  }
  else if(viewType % 3 === 0){
          gl.viewport(0, 0, this.width, this.height);
  //  gl.clearColor(0, 0, 0, 1.0);
    var cx = 35 * Math.cos(90*Math.PI/180) * Math.cos( -90*Math.PI/180);
    var cy = 35 * Math.sin(90*Math.PI/180);
    var cz = 35 * Math.cos(90*Math.PI/180) * Math.sin( -90*Math.PI/180);

    // Given the lat/long/rad in the Html file,
    //   the default position would be long of 0 which is on
    //   the positive x axis out 2.5 distance (i.e. (2.5, 0, 0) looking back at (0,0,0)

    var eye = vec3(cx,cy,cz);  // location of camera contolled by converted slider coods

    // Look at and up will always be the same for this lab
    var at = vec3(0,0,0);  // always looking at the center for this lab
    var up = vec3(0,1,0);  // this will work for everything except the poles
    var camlocMat = mat4();
    camlocMat = lookAt(eye, at, up); 
    var mM = mat4();
    this.sun.Render(projectionMat, camlocMat, mM, oPath,true);
      this.ship.Draw();

//    this.mercury.Render(projectionMat, camlocMat,  this.sun.getModel(), oPath);
//    this.venus.Render(projectionMat, camlocMat,  mM, oPath);
//    this.earth.Render(projectionMat, camlocMat,  this.sun.getModel(), oPath);
//    this.mars.Render(projectionMat, camlocMat,  mM, oPath);
//    this.jupiter.Render(projectionMat, camlocMat,  mM, oPath);
//    this.saturn.Render(projectionMat, camlocMat,  mM, oPath);
//    this.uranus.Render(projectionMat, camlocMat,  mM, oPath);
//    this.neptune.Render(projectionMat, camlocMat,  mM, oPath);
//
//      this.earthMoon.Render(projectionMat, camlocMat, this.earth.getModel(), oPath);
//    this.jupiterEuropa.Render(projectionMat, camlocMat, this.jupiter.getModel(), oPath);
//    this.jupiterIo.Render(projectionMat, camlocMat, this.jupiter.getModel(), oPath);
//    this.jupiterGanymede.Render(projectionMat, camlocMat, this.jupiter.getModel(), oPath);
  }

};

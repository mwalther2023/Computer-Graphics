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
//  this.Oship = new Ship(gl, this.shaderProgram,vM,a,true, -10);
//    this.Oship.setLat(90);
//    this.Oship.setRadius(60);
    this.ship.moveUp(-10);
  // scale, day, year, orbDist, axisTilt, orbTilt

  this.sun = new Planet(gl, this.shaderProgram, 7, 0, 0, 0, 0, 0);
  this.mercury = new Planet(gl, this.shaderProgram, 1, 10, 100, 5, 0, 7);
  this.venus = new Planet(gl, this.shaderProgram, 2, 1, 50, 10, 2, 7);
  this.earth = new Planet(gl, this.shaderProgram, 2, 200, 15, 15, 24, 7);
  this.earthMoon = new Planet(gl, this.shaderProgram, .5, 100, 100, 2, 7, 80);
  this.mars = new Planet(gl, this.shaderProgram, 2, 210, 50, 20, 25, 7);
  this.jupiter = new Planet(gl, this.shaderProgram, 4, 500, 5, 30, 3, 7);
  this.jupiterEuropa = new Planet(gl, this.shaderProgram, .5, 100, 100, 2.5, 0, 10);
  this.jupiterIo = new Planet(gl, this.shaderProgram, .25, 100, 75, 3, 0, 40);
  this.jupiterGanymede = new Planet(gl, this.shaderProgram, .75, 100, 125, 3.5, 0, 90);
  this.saturn = new Planet(gl, this.shaderProgram, 4, 110, 6, 40, 27, 7);
  this.uranus = new Planet(gl, this.shaderProgram, 3, 250, 2, 50, 82, 7);
  this.neptune = new Planet(gl, this.shaderProgram, 3, 260, 1, 60, 28, 7);
  
  this.sun.attachMoon(this.mercury);
  this.sun.attachMoon(this.venus);
  this.sun.attachMoon(this.earth);
  this.sun.attachMoon(this.mars);
  this.sun.attachMoon(this.jupiter);
this.sun.attachMoon(this.saturn);
this.sun.attachMoon(this.uranus);
this.sun.attachMoon(this.neptune);
 
  this.earth.attachMoon(this.earthMoon);
  this.jupiter.attachMoon(this.jupiterEuropa);
  this.jupiter.attachMoon(this.jupiterIo);
  this.jupiter.attachMoon(this.jupiterGanymede);
//  this.sun.addModel(modelMat);

  var test = this.sun.getPlanets();
  console.log(test);
//  test.forEach(element => console.log("Test: "+element.getYear()));
  var moons = this.earth.getPlanets();
  console.log(moons);
  // Set up callback to render a frame
  var render = function () {
    t.Render();
  };

    var rotateXDegrees = 0;
    var rotateYDegrees = 0;
    var rotateZDegrees = 0;
    
  var update = function () {
      var p = t.sun.getPlanets();
//      console.log(p.length);
      if(status){
//        for(var i = 0; i<p.length; i++){
////            p[i].updateAxis();
////            p[i].updateOrbit();
////            console.log("Solar update(): "+p[i].getYear());
//             // Doesnt account for orbit tilt in rotation just world Y from sun
//            var moons = p[i].getPlanets();
//            if(moons.length > 0){
//                for(var u = 0; u<moons.length; u++){
////                    moons[u].updateOrbit();
//  //                  console.log("Solar update(): "+moons[u].getYear());
////                    moons[u].updateAxis(); // Not rotating around planet its attached to just Sun
////                    moons[u].updateMoon(p[i]); // Completly dissapears
//                }
//            }
//        }
        requestAnimationFrame(render);
      }
      
      requestAnimationFrame(update);
  };
  var button = document.getElementById(this.canvasID + "-button");
  var status = true;
  button.addEventListener("click",
           function () {
             status = !status;
//             console.log(status);
//             requestAnimationFrame(animate);
  });

  
  // Show the first frame
  requestAnimationFrame(update);
//  gl.viewport(0, canvas.height/2, canvas.width, canvas.height);
 
//  gl.scissor(0, canvas.height/2, canvas.width, canvas.height/2);
//  gl.clearColor(0.5, 0.5, 0.5, 1.0);
//  requestAnimationFrame(update3);
  
};


// The Render function that gets called each time we need to redraw the scene
Solar.prototype.Render = function() {
  var gl = this.gl;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
                           
  // Setup a fixed perspective projection matrix
  var fov = 90.0;
  var aspect = this.canvas.width / this.canvas.height;
  var near = 0.1;
  var far = 200.0;
  var projectionMat = perspective(fov, aspect, near, far);
  var orthoProj = ortho(0,this.canvas.width,0,this.canvas.height/2,near,far);

//  console.log(orthoProj);  
  this.ship.setProj(projectionMat);
//  this.Oship.setProj(orthoProj);
  // We want the camera to move in polar coords for this lab
  // We could just use rotation/trans matrix instead of lookAt
  // But since lookAt is used a lot, we will use lookAt here
  // We will need to take the polar info and turn it into lookAt info by hand
  
  // Grab the polar coords from the sliders
//  var long  = this.sliders["long"].valueAsNumber;
//  var lat  = this.sliders["lat"].valueAsNumber;
//  var rad  = this.sliders["rad"].valueAsNumber;
//  this.ship.setLat(lat);
//  this.ship.setLong(long);
//  this.ship.setRadius(rad);
  // Note Math.cos/sin need rad so need to convert from degrees
 // Form the view matrix

  var viewMat = mat4();
  var modelMat = mat4();  // Identity - no movement of the model
//  modelMat = this.mM;
  
  
//  console.log("Solar viewMat: "+viewMat);
//this.ship.setLat(0);
  viewMat = this.ship.getView();
//  console.log("Top: "+viewMat);
//  console.log("Solar ShipViewMat: "+viewMat);
  // Tell the cylinder to draw itself
  // Need to send all three matrices separately due to how they will be used
  //   in the shader for lighting calculations
  gl.viewport(0, this.height/2, this.width, this.height);
  
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  this.ship.Render();

  var mM = mat4();
  this.sun.Render(projectionMat, viewMat, mM);
//this.ship.Draw();
  this.mercury.Render(projectionMat, viewMat,  this.sun.getModel());
  this.venus.Render(projectionMat, viewMat,  mM);
  this.earth.Render(projectionMat, viewMat,  this.sun.getModel());
  this.mars.Render(projectionMat, viewMat,  mM);
  this.jupiter.Render(projectionMat, viewMat,  mM);
  this.saturn.Render(projectionMat, viewMat,  mM);
  this.uranus.Render(projectionMat, viewMat,  mM);
  this.neptune.Render(projectionMat, viewMat,  mM);
//    console.log("Solar Rend Earth: "+ this.earth.getModel());
//  console.log("Solar Rend Moon: "+ this.earthMoon.getModel());
  this.earthMoon.Render(projectionMat, viewMat, this.earth.getModel());
  this.jupiterEuropa.Render(projectionMat, viewMat, this.jupiter.getModel());
  this.jupiterIo.Render(projectionMat, viewMat, this.jupiter.getModel());
  this.jupiterGanymede.Render(projectionMat, viewMat, this.jupiter.getModel());
//  var p = this.sun.getPlanets();
//  for(var i = 0; i<p.length; i++){
//      p[i].Render(projectionMat, viewMat, modelMat);
//  }
 

  gl.viewport(0, 0, this.width, this.height/2);
//  gl.clearColor(0, 0, 0, 1.0);
//    this.ship.Render();
//    this.ship.setLong(-90);
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
//    this.Oship.Render();
//    var dr = translate(0,this.ship.getRadius(),0);
//var dr = translate(0,1,0);
//    this.Oship.setDraw(dr);
//console.log(this.ship.getRadius());
    

//    viewMat = this.Oship.getView();
//    console.log("Bottom: "+viewMat);
    
    
    
  this.sun.Render(projectionMat, camlocMat, mM);
    this.ship.Draw();
  
  this.mercury.Render(projectionMat, camlocMat,  this.sun.getModel());
  this.venus.Render(projectionMat, camlocMat,  mM);
  this.earth.Render(projectionMat, camlocMat,  this.sun.getModel());
  this.mars.Render(projectionMat, camlocMat,  mM);
  this.jupiter.Render(projectionMat, camlocMat,  mM);
  this.saturn.Render(projectionMat, camlocMat,  mM);
  this.uranus.Render(projectionMat, camlocMat,  mM);
  this.neptune.Render(projectionMat, camlocMat,  mM);
  
    this.earthMoon.Render(projectionMat, camlocMat, this.earth.getModel());
  this.jupiterEuropa.Render(projectionMat, camlocMat, this.jupiter.getModel());
  this.jupiterIo.Render(projectionMat, camlocMat, this.jupiter.getModel());
  this.jupiterGanymede.Render(projectionMat, camlocMat, this.jupiter.getModel());
//  

};

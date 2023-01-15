"use strict";

// The main starting class for lab5.
// This class connects to the html interface and sets up the cylinder,
//   camera, and light
function Lighting(canvasID) {
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
  
  // Make the entire canvas be the viewport and set a grey background
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  
  // Enable hidden-surface removal (draw pixel closest to viewer)
  gl.enable(gl.DEPTH_TEST);


  // Compile and link shaders
  this.shaderProgram = initShaders(gl, "vShader.glsl", "fShader.glsl");
  if (this.shaderProgram === null) return;
  gl.useProgram(this.shaderProgram);



  // The main cylinder we are looking at with a scale of 1
  this.cyl1 = new Cylinder(gl, this.shaderProgram, 1.0);
  
  // Mini cylinder where the light is located with a scale of 1/10th
  this.lightCyl = new Cylinder(gl, this.shaderProgram, 0.1);
  
 
  
  // Set up callback to render a frame
  var render = function () {
    t.Render();
  };
  
  // Define callback for change of slider value
  var sliderCallback = function (e) {
    // Update text display for slider
    var v = e.target.valueAsNumber;
    e.target.valueDisplay.textContent = v.toFixed(2);
    
    // Draw the updated frame once a value has changed
    requestAnimationFrame(render);
  };
  
  // Set up sliders for user interface
  this.sliderIDs = ["long", "lat", "rad", "lx", "ly", "lz"];
  var sliders = [];         // array of slider HTML elements
  var sliderValues = [];    // array of slider value HTML elements
  var sliderDefaults = [];  // array of slider reser values

  // Set up an object with all the sliders
  for (var i in this.sliderIDs) {
    var id = this.sliderIDs[i];
    var sliderID = this.canvasID + "-" + id + "-slider";
    sliders[id] = document.getElementById(sliderID);
    if (sliders[id] === null) {
      alert("Slider ID not found: " + sliderID);
      return;
    }
    var valueID = this.canvasID + "-" + id + "-value";
    sliderValues[id] = document.getElementById(valueID);
    if (sliders[id] === null) {
      alert("Slider value ID not found: " + sliderID);
      return;
    }
    sliders[id].valueDisplay = sliderValues[id];  // attach to slider
    
    // Set callback on slider input
    sliders[id].addEventListener("input", sliderCallback);
    
    // Save initial value for reset
    sliderDefaults[id] = sliders[id].valueAsNumber;
  }
  this.sliders = sliders;
  
  
  // Callbacks for the checkboxes
  this.edges = false;
  var showEdgesCheckBox = document.getElementById(this.canvasID + "-show-edges");
  showEdgesCheckBox.addEventListener("change",
          function () {
            t.edges = !t.edges;
            requestAnimationFrame(render);  // redraw
          });
          
  this.ambient = false;
  var showEdgesCheckBox = document.getElementById(this.canvasID + "-ambient");
  showEdgesCheckBox.addEventListener("change",
          function () {
            t.ambient = !t.ambient;
            requestAnimationFrame(render);  // redraw
          });
          
  this.diffuse = false;
  var showEdgesCheckBox = document.getElementById(this.canvasID + "-diffuse");
  showEdgesCheckBox.addEventListener("change",
          function () {
            t.diffuse = !t.diffuse;
            requestAnimationFrame(render);  // redraw
          });

  this.specular = false;
  var showEdgesCheckBox = document.getElementById(this.canvasID + "-specular");
  showEdgesCheckBox.addEventListener("change",
          function () {
            t.specular = !t.specular;
            requestAnimationFrame(render);  // redraw
          });


  // Show the first frame
  requestAnimationFrame(render);
};



// The Render function that gets called each time we need to redraw the scene
Lighting.prototype.Render = function() {
  var gl = this.gl;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
                           
  // Setup a fixed perspective projection matrix
  var fov = 90.0;
  var aspect = this.canvas.width / this.canvas.height;
  var near = 0.1;
  var far = 20.0;
  var projectionMat = perspective(fov, aspect, near, far);
  
  
  // We want the camera to move in polar coords for this lab
  // We could just use rotation/trans matrix instead of lookAt
  // But since lookAt is used a lot, we will use lookAt here
  // We will need to take the polar info and turn it into lookAt info by hand
  
  // Grab the polar coords from the sliders
  var long  = this.sliders["long"].valueAsNumber;
  var lat  = this.sliders["lat"].valueAsNumber;
  var rad  = this.sliders["rad"].valueAsNumber;
 
  // Note Math.cos/sin need rad so need to convert from degrees
  var cx = rad * Math.cos(lat*Math.PI/180) * Math.cos(long*Math.PI/180);
  var cy = rad * Math.sin(lat*Math.PI/180);
  var cz = rad * Math.cos(lat*Math.PI/180) * Math.sin(long*Math.PI/180);
  
  // Given the lat/long/rad in the Html file,
  //   the default position would be long of 0 which is on
  //   the positive x axis out 2.5 distance (i.e. (2.5, 0, 0) looking back at (0,0,0)
  
  var eye = vec3(cx,cy,cz);  // location of camera contolled by converted slider coods
  
  // Look at and up will always be the same for this lab
  var at = vec3(0,0,0);  // always looking at the center for this lab
  var up = vec3(0,1,0);  // this will work for everything except the poles
  var viewMat = lookAt(eye, at, up);  // Form the view matrix
  
  // Get the light position from the sliders - already in world coords
  var lightX = this.sliders["lx"].valueAsNumber;
  var lightY = this.sliders["ly"].valueAsNumber;
  var lightZ = this.sliders["lz"].valueAsNumber;
  var lPosition = vec3(lightX, lightY, lightZ);
  
  
  var modelMat = mat4();  // Identity - no movement of the model
     
  
  // Tell the cylinder to draw itself
  // Need to send all three matrices separately due to how they will be used
  //   in the shader for lighting calculations
  // Also need to send the light position (again for lighting)
  // And finally send 4 booleans to control the drawing (edges, ambient, diffuse, specular)
  this.cyl1.Render(projectionMat, viewMat, modelMat, lPosition, this.edges, this.ambient, this.diffuse, this.specular);
  
  
  // Render a small cylinder at the light position
  // Obviously it can't light itself
  // If we light it from the point of view of the camera (eye) so it is always lit
  // Note we could just light with ambient and turn ambient way up as well
  // And always show without wireframe edgess
  var lightModelMat = translate(lightX, lightY, lightZ);
  this.lightCyl.Render(projectionMat, viewMat, lightModelMat, eye, false, true, true, false);
  
};

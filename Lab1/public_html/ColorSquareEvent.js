/** Matthew Walther
 * Lab 1 - COMP3801 Sping 2022
 * 
 * ColorSquareEvent - draw a square with UI elements to change color,
 *                    updating on events from slider or button.
 */

 "use strict";

 // Constructor
 //
 // @param canvasID - string containing name of canvas to render.
 //          A slider with ID (canvasID + "-red-slider") and a
 //          button with ID (canvasID + "-reset") should also have
 //          been defined in the HTML document.
 //
 function ColorSquareEvent(canvasID) {
   this.canvasID = canvasID;
   this.canvas = document.getElementById(canvasID);
   if (!this.canvas) {
     alert("Canvas ID '" + canvasID + "' not found.");
   }
   this.gl = WebGLUtils.setupWebGL(this.canvas);
   if (!this.gl) {
     alert("WebGL isn't available in this browser");
     return;
   }
 
   this.init();
 }
 
 // Define prototype values common to all ColorSquareEvent objects
 ColorSquareEvent.prototype.gl = null;
 
 ColorSquareEvent.prototype.toString = function () {
   return JSON.stringify(this);
 };
 
 // Initialization (called by constructor)
 ColorSquareEvent.prototype.init = function () {
   // For convenience, copy class variables to local variables
   var canvas = this.canvas;
   var gl = this.gl;
 
   // Set WebGL viewport to full canvas size
   gl.viewport(0, 0, canvas.width, canvas.height);
 
   // Use name of slider control to get data and interface elements.
   // Notice that we incorporate the canvas name into the control name
   // so that we can have multiple sets of controls with different canvases.
   var redSlider = document.getElementById(this.canvasID + "-red-slider");
   var redSliderNumber = document.getElementById(this.canvasID + "-red-value");
 
   var greenSlider = document.getElementById(this.canvasID + "-green-slider");
   var greenSliderNumber = document.getElementById(this.canvasID + "-green-value");
 
   var blueSlider = document.getElementById(this.canvasID + "-blue-slider");
   var blueSliderNumber = document.getElementById(this.canvasID + "-blue-value");
   
   var resetButton = document.getElementById(this.canvasID + "-reset-button");
   var no_touch_button = document.getElementById(this.canvasID + "-no_touch-button")


   // The render function is called whenever an event occurs which requires
   // the canvas to be redrawn (for example, when the slider value changes).
   // In this case we just clear the viewport to the value specified by the
   // slider.
   var render = function () {
     var redValue = redSlider.valueAsNumber;  // read slider value
     var greenValue = greenSlider.valueAsNumber;
     var blueValue = blueSlider.valueAsNumber;

     redSliderNumber.textContent = redValue;  // set text readout to new value
     greenSliderNumber.textContent = greenValue;
     blueSliderNumber.textContent = blueValue;
  
     gl.clearColor(redValue, greenValue, blueValue, 1.0);  // set color to be used by clear
     gl.clear(gl.COLOR_BUFFER_BIT);           // clear the color buffer
 
     console.log("RGB1: "+redValue+" "+greenValue+" "+blueValue);
   };
 
   // Add event handler for the slider. This is called whenever the slider
   // value changes.
   redSlider.addEventListener("input",
           function () {
             requestAnimationFrame(render);  // setup to render next frame
           });
   greenSlider.addEventListener("input",
           function () {
             requestAnimationFrame(render);
           });
   blueSlider.addEventListener("input",
           function () {
             requestAnimationFrame(render);
           });

   // Add event handler for reset button. This is called whenever the reset
   // button is clicked.

   resetButton.addEventListener("click",
           function () {
             redSlider.value = 0.5;
             greenSlider.value = 0.5;
             blueSlider.value = 0.5;

             requestAnimationFrame(render);
           });
    if(no_touch_button != null){
      no_touch_button.addEventListener("click",
        function () {
          window.confirm("The button said \'Do Not Touch\'");
        });
    }
   requestAnimationFrame(render);
 };
 
#version 300 es

precision highp float;     // required precision declaration

// Texture variables
uniform sampler2D fTexSampler;
uniform int fShowColor;
uniform int fShowTexture;

// Interpolated input values from vertex shader
in vec3 fColor;
in vec2 fTexCoord;

out vec4 final_color;      // output color to frame buffer


void main() {
    
  // Apply the texture  
  final_color = texture(fTexSampler, fTexCoord);
    if(fShowColor == 1)
   final_color = final_color * vec4(fColor, 1.0);

}

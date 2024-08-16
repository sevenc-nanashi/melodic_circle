precision highp float;

uniform vec2 u_resolution;
uniform sampler2D u_texture;
uniform vec2 u_texResolution;

float easeOutSine(float t) {
  return sin((t * 3.14159265) / 2.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv.y = 0.5 - uv.y;
  uv.x = (uv.x - 0.5) * (u_resolution.x / u_resolution.y);

  float angle = mod((atan(uv.y, uv.x) / 3.14159265 + 0.5), 2.0) / 2.0;
  float distance = 1.0 - length(uv * 2.0);

  gl_FragColor = texture2D(u_texture, vec2(angle, distance));
}

// vim: set ft=glsl:

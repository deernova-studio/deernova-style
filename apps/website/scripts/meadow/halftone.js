// The darkest tone prints solid. The middle tones share the same dot sizes
// between the WebGL renderer and the Canvas 2D fallback.
export const TONES = [[0.07, 0], [0.27, 0.16], [0.5, 0.36], [0.76, 0.6], [Infinity, 1]];
export const dotRadius = tone => 0.56 * Math.sqrt(tone);

const vertexSource = `#version 300 es
void main() {
  vec2 corner = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}`;

const sampleSource = `#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform int uSamples;
out vec4 color;

void main() {
  ivec2 origin = ivec2(gl_FragCoord.xy) * uSamples;
  float total = 0.0;
  for (int y = 0; y < uSamples; y++) {
    for (int x = 0; x < uSamples; x++) {
      total += texelFetch(uScene, origin + ivec2(x, y), 0).r;
    }
  }
  color = vec4(total / float(uSamples * uSamples), 0.0, 0.0, 1.0);
}`;

const fragmentSource = `#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform vec2 uBand;
uniform float uHeight;
uniform float uCell;
uniform bool uInvert;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec4 uThresholds;
uniform vec3 uRadii;
out vec4 color;

void main() {
  vec2 grid = vec2(gl_FragCoord.x, uHeight - gl_FragCoord.y) / uCell;
  ivec2 cell = min(ivec2(grid), textureSize(uScene, 0) - 1);
  float coverage = 0.0;
  if (float(cell.x) < uBand.x || float(cell.x) >= uBand.y) {
    float light = texelFetch(uScene, cell, 0).r;
    float tone = uInvert ? 1.0 - light : light;
    if (tone >= uThresholds.w) {
      coverage = 1.0;
    } else if (tone >= uThresholds.x) {
      float radius = tone < uThresholds.y ? uRadii.x : tone < uThresholds.z ? uRadii.y : uRadii.z;
      float distanceToEdge = (radius - length(fract(grid) - 0.5)) * uCell;
      coverage = clamp(distanceToEdge + 0.5, 0.0, 1.0);
    }
  }
  color = vec4(mix(uPaper, uInk, coverage), 1.0);
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl, source) {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, source);
  const program = vertex && fragment && gl.createProgram();
  if (program) {
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
  }
  if (vertex) gl.deleteShader(vertex);
  if (fragment) gl.deleteShader(fragment);
  if (!program) return null;
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
}

function rgb(hex) {
  if (!/^#[\da-f]{6}$/i.test(hex)) return null;
  const value = parseInt(hex.slice(1), 16);
  return [value >> 16, (value >> 8) & 255, value & 255].map(channel => channel / 255);
}

export function createHalftone() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', {
    alpha: false, antialias: false, depth: false, failIfMajorPerformanceCaveat: true
  });
  if (!gl?.createShader) return null;
  const sampler = createProgram(gl, sampleSource);
  const program = createProgram(gl, fragmentSource);
  const scene = gl.createTexture(), grid = gl.createTexture();
  const target = gl.createFramebuffer();
  if (!sampler || !program || !scene || !grid || !target) {
    gl.deleteProgram(sampler);
    gl.deleteProgram(program);
    gl.deleteTexture(scene);
    gl.deleteTexture(grid);
    gl.deleteFramebuffer(target);
    return null;
  }
  gl.useProgram(program);
  const uniforms = Object.fromEntries([
    'Scene', 'Band', 'Height', 'Cell', 'Invert', 'Paper', 'Ink', 'Thresholds', 'Radii'
  ].map(name => [name, gl.getUniformLocation(program, `u${name}`)]));
  for (const texture of [scene, grid]) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }
  gl.uniform1i(uniforms.Scene, 0);
  gl.uniform4fv(uniforms.Thresholds, TONES.slice(0, 4).map(([threshold]) => threshold));
  gl.uniform3fv(uniforms.Radii, TONES.slice(1, 4).map(([, tone]) => dotRadius(tone)));
  const samplesUniform = gl.getUniformLocation(sampler, 'uSamples');
  const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const maxViewport = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
  let sized = false, paletteReady = false, cols = 0, rows = 0;

  function resize(width, height, cell, columns, lines, samples) {
    cols = columns;
    rows = lines;
    sized = !gl.isContextLost() && cols * samples <= maxSize && rows * samples <= maxSize
      && width <= maxViewport[0] && height <= maxViewport[1];
    if (!sized) return;
    canvas.width = width;
    canvas.height = height;
    gl.useProgram(sampler);
    gl.uniform1i(samplesUniform, samples);
    gl.useProgram(program);
    gl.uniform1f(uniforms.Height, height);
    gl.uniform1f(uniforms.Cell, cell);
    gl.bindTexture(gl.TEXTURE_2D, scene);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cols * samples, rows * samples, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindTexture(gl.TEXTURE_2D, grid);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, cols, rows, 0, gl.RED, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, grid, 0);
    const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    sized = complete && gl.drawingBufferWidth === width && gl.drawingBufferHeight === height && gl.getError() === gl.NO_ERROR;
  }

  function setPalette({ paper, ink, mode }) {
    const paperRgb = rgb(paper), inkRgb = rgb(ink);
    paletteReady = !!paperRgb && !!inkRgb;
    if (!paletteReady || gl.isContextLost()) return;
    gl.useProgram(program);
    gl.uniform3fv(uniforms.Paper, paperRgb);
    gl.uniform3fv(uniforms.Ink, inkRgb);
    gl.uniform1i(uniforms.Invert, mode !== 'light');
  }

  function draw(field, bandStart, bandEnd) {
    if (!sized || !paletteReady || gl.isContextLost()) return false;
    // Reduce the scene to one brightness per cell before shading the screen.
    gl.useProgram(sampler);
    gl.bindTexture(gl.TEXTURE_2D, scene);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, field);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    gl.viewport(0, 0, cols, rows);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(program);
    gl.bindTexture(gl.TEXTURE_2D, grid);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uniforms.Band, bandStart, bandEnd);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return !gl.isContextLost();
  }

  return { canvas, resize, setPalette, draw };
}

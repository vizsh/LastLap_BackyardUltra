/* The film renderer: one full-screen WebGL2 pass over real photographs and footage.

   It does four things no stack of images can: parallax from a real depth map,
   a camera that flies into one shot's light and out of the next, a route that
   lives inside the photograph, and film grain, fog and lens flare on every frame. */

const VERT = `#version 300 es
in vec2 p; out vec2 vUv;
void main(){ vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;

const frag = (taps, octaves, close) => `#version 300 es
precision highp float;
#define TAPS ${taps}
#define OCT ${octaves}
#define CLOSE ${close ? 1 : 0}
in vec2 vUv; out vec4 outColor;
uniform sampler2D uA, uB, uDA, uDB, uR, uL;
uniform vec4 uCamA, uCamB, uPar;
uniform vec2 uHasD, uLA, uLB, uBlur, uFog, uLight, uHead;
uniform vec3 uTint, uRoute, uPtr;
uniform float uT, uTime, uAspect, uAmp, uFade, uShade, uHeadOn;

float hash(vec2 p){ p = fract(p * .3183099 + vec2(.71, .113)); p *= 17.; return fract(p.x * p.y * (p.x + p.y)); }
float grain(uvec2 q, uint f){
  uint n = q.x * 1973u + q.y * 9277u + f * 26699u;
  n = (n << 13u) ^ n; n = n * (n * n * 15731u + 789221u) + 1376312589u;
  return float(n & 0x00ffffffu) / 16777215.;
}
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < OCT; i++) { s += a * noise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= .5; } return s; }

vec2 warp(sampler2D d, vec2 uv, vec2 par){
  float z = texture(d, uv).r; vec2 q = uv + par * (z - .5);
  z = texture(d, q).r; return uv + par * (z - .5);
}

/* Blur toward the light. The taps are tinted, so speed also separates colour like a real lens. */
vec3 take(sampler2D t, vec2 uv, vec2 L, float blur){
  if (blur < .0008) return texture(t, uv).rgb;
  vec2 dir = (uv - L) * blur; vec3 acc = vec3(0.), w = vec3(0.);
  float jit = grain(uvec2(gl_FragCoord.xy), 7u);
  for (int i = 0; i < TAPS; i++) {
    float f = (float(i) + jit) / float(TAPS);
    vec3 c = mix(vec3(1., .6, .35), vec3(.35, .6, 1.), f);
    acc += texture(t, uv - dir * f).rgb * c; w += c;
  }
  return acc / w;
}

vec3 route(vec2 uv){
  vec3 r = textureLod(uR, uv, 0.).rgb;
  float u = (r.g * 65280. + r.b * 255.) / 65535.;
#if CLOSE
  /* a phone sits close to the road, so it gets sharper lamps and a tighter glow */
  r.r = textureLod(uL, uv, 0.).r;
  const float haze = .2, core = .000005, bloom = .00022;
#else
  const float haze = .34, core = .000012, bloom = .0007;
#endif
  float p = uRoute.y;
  float front = smoothstep(u - .0006, u + .0026, p);
  float age = max(p - u, 0.);
  float hot = exp(-age * age / .00009);
  float wide = textureLod(uR, uv, 3.).r;
  vec3 c = r.r * r.r * (vec3(1., .16, .08) * 2.6 + vec3(1., .78, .62) * hot * 7.);
  c += wide * vec3(1., .09, .05) * haze;
  vec2 d = (uv - uHead) * vec2(1.75, 1.);
  float q = dot(d, d);
  float lead = uHeadOn * step(.002, p) * step(p, .998);
  return c * front * uRoute.z + (vec3(1., .8, .68) * exp(-q / core) * 1.5 + vec3(1., .2, .1) * exp(-q / bloom) * .16) * uRoute.z * lead;
}

vec3 fogged(vec3 c, vec2 s, float amt, vec3 tint){
  if (amt < .01) return c;
  float n = fbm(s * vec2(uAspect, 1.) * 1.7 + vec2(uTime * .022, uTime * .007));
  float m = fbm(s * vec2(uAspect, 1.) * 3.1 - vec2(uTime * .013, 0.));
  n = smoothstep(.32, .82, n * .7 + m * .3);
  return c + (tint * .55 + vec3(.25)) * n * n * amt * .05;
}

void main(){
  vec2 s = vec2(vUv.x, 1. - vUv.y);
  vec2 aspect = vec2(uAspect, 1.);
  float rr = length((s - uLight) * aspect);
  vec3 c = vec3(0.);
  float m = 0.;

  if (uT > .24) {
    float n = fbm(s * aspect * 2.6 + uTime * .07);
    float grow = (uT - .3) / .4;
    m = clamp(grow * 2.1 - rr * .95 + (n - .5) * .7, 0., 1.);
    m = m * m * (3. - 2. * m);
  }

  if (m < .999) {
    vec2 uv = uCamA.xy + (s - .5) * uCamA.zw;
    if (uHasD.x > .5) uv = warp(uDA, uv, uPar.xy);
    vec3 a = take(uA, uv, uLA, uBlur.x); a *= a;
    if (uRoute.x == 1.) a += route(uv);
    a = fogged(a, s, uFog.x, uTint);
    c = a;
  }
  if (m > .001) {
    vec2 uv = uCamB.xy + (s - .5) * uCamB.zw;
    if (uHasD.y > .5) uv = warp(uDB, uv, uPar.zw);
    vec3 b = take(uB, uv, uLB, uBlur.y); b *= b;
    if (uRoute.x == 2.) b += route(uv);
    b = fogged(b, s, uFog.y, uTint);
    c = mix(c, b, m);
  }

  /* the light: a tight core, halo through haze, anamorphic streak, ghosts, a little veil at the peak */
  float a = uAmp;
  if (a > .004) {
    vec2 dv = (s - uLight) * aspect;
    float haze = a > .2 ? .55 + .9 * fbm(dv * 2.4 + vec2(uTime * .05, -uTime * .03)) : 1.;
    float core = exp(-rr * rr * (150. - 96. * a));
    float halo = exp(-rr * (7.4 - 3.6 * a));
    float wide = exp(-rr * 2.3);
    float streak = exp(-abs(dv.y) * (210. - 120. * a)) * exp(-abs(dv.x) * (3.8 - 1.9 * a));
    vec3 g = uTint * (core * 2.3 + halo * .62 * haze + wide * .1 * haze) + mix(uTint, vec3(1.), .3) * streak * .42;
    vec2 m1 = .5 + (.5 - uLight) * .62, m2 = .5 + (.5 - uLight) * 1.18;
    float gh = smoothstep(.1, .082, length((s - m1) * aspect)) * .022 + smoothstep(.05, .04, length((s - m2) * aspect)) * .03;
    g += uTint * gh;
    c += g * a;
    c = mix(c, uTint * .2 + .008, smoothstep(.55, 1., a) * .3 * haze * exp(-rr * 1.5));
  }

  /* the visitor's own headlamp: a faint lift where they look */
  if (uPtr.z > .001) {
    vec2 dp = (s - uPtr.xy) * aspect;
    c *= 1. + uPtr.z * exp(-dot(dp, dp) * 7.) * .34;
  }

  /* lens falloff and a darker foot for the words */
  vec2 vg = (s - .5) * vec2(1.1, 1.);
  c *= 1. - .62 * smoothstep(.28, .92, length(vg));
  c *= mix(1., smoothstep(-.06, .46, 1. - s.y) * .9 + .1, uShade);

  /* highlight shoulder, then back to display gamma */
  vec3 h = max(c - .8, 0.);
  c = min(c, vec3(.8)) + .2 * (1. - exp(-h / .2));
  c = sqrt(max(c, 0.)) * uFade;

  /* film grain, which also stops banding in fog and sky */
  float g = grain(uvec2(gl_FragCoord.xy), uint(uTime * 24.));
  g = (g + grain(uvec2(gl_FragCoord.xy) + 113u, uint(uTime * 24.) + 9u)) * .5;
  float lum = dot(c, vec3(.3, .6, .1));
  c += (g - .5) * (.075 - .04 * lum) * (uFade * .9 + .1);
  outColor = vec4(c, 1.);
}`;

export class Film {
  constructor(canvas, { phone, onLost }) {
    this.canvas = canvas; this.phone = phone; this.scale = 1;
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('webgl2');
    this.gl = gl;
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onLost?.(); });

    /* compile in the background where the browser allows it, so the page never freezes */
    const stage = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    const vs = stage(gl.VERTEX_SHADER, VERT), fs = stage(gl.FRAGMENT_SHADER, frag(phone ? 5 : 8, phone ? 3 : 4, phone));
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    this.compiled = this.link(prog, fs);

    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    this.black = this.blank([7, 3, 4, 255]);
    this.grey = this.blank([128, 128, 128, 255]);
    this.routeTex = this.blank([0, 0, 0, 255]);
    this.queue = [];
    this.frames = 0; this.acc = 0; this.last = 0;
  }

  async link(prog, fs) {
    const gl = this.gl, ext = gl.getExtension('KHR_parallel_shader_compile');
    if (ext) while (!gl.getProgramParameter(prog, ext.COMPLETION_STATUS_KHR)) await new Promise((r) => setTimeout(r, 30));
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getShaderInfoLog(fs) || gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.u = {};
    const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(prog, i); this.u[a.name] = gl.getUniformLocation(prog, a.name); }
    ['uA', 'uB', 'uDA', 'uDB', 'uR', 'uL'].forEach((k, i) => gl.uniform1i(this.u[k], i));
  }

  blank(px) {
    const gl = this.gl, t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(px));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    return t;
  }

  image(url) {
    return new Promise((resolve, reject) => {
      const i = new Image(); i.decoding = 'async'; i.src = url;
      i.onload = () => (i.decode ? i.decode().catch(() => {}).then(() => resolve(i)) : resolve(i));
      i.onerror = () => reject(new Error(`missing ${url}`));
    });
  }

  upload(img, mips) {
    const gl = this.gl, t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (mips) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
    else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    return t;
  }

  /* Downloads and decoding happen in the background. Uploads are spread out, one per frame. */
  async load(shot) {
    if (shot.loading) return shot.loading;
    const base = `/media/${this.phone ? (shot.phoneSrc || `${shot.src || shot.video}-m`) : (shot.src || shot.video)}`;
    const depth = shot.depth ? `/media/${this.phone ? (shot.phoneDepth || `${shot.src}-m-d`) : `${shot.src}-d`}.webp` : null;
    shot.loading = (async () => {
      const [img, dep] = await Promise.all([this.image(`${base}.webp`), depth ? this.image(depth) : null]);
      await new Promise((done) => this.queue.push({ shot, img, dep, done }));
    })();
    return shot.loading;
  }

  async loadRoute() {
    const [img, lamps] = await Promise.all([this.image('/media/route.png'), this.phone ? this.image('/media/lamps.webp') : null]);
    this.routeTex = this.upload(img, true);
    if (lamps) this.lampTex = this.upload(lamps, false);
  }

  pump(n = 1) {
    while (n-- > 0 && this.queue.length) {
      const { shot, img, dep, done } = this.queue.shift();
      shot.tex = this.upload(img, !shot.video);
      if (dep) shot.depthTex = this.upload(dep, false);
      done();
    }
  }

  /* Clips start as their first frame, so nothing changes visually when the video takes over. */
  video(shot, active, warm) {
    if (!shot.video) return;
    if (!shot.el && (active || warm)) {
      const v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.setAttribute('playsinline', ''); v.crossOrigin = 'anonymous';
      v.src = `/media/${shot.video}${this.phone ? '-m' : ''}.mp4`;
      v.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none';
      v.setAttribute('aria-hidden', 'true');
      document.body.append(v);
      shot.el = v; shot.fresh = false; shot.sized = false;
      if ('requestVideoFrameCallback' in v) {
        const mark = () => { shot.fresh = true; v.requestVideoFrameCallback(mark); };
        v.requestVideoFrameCallback(mark);
      }
    }
    const v = shot.el;
    if (!v) return;
    if (active && v.paused) v.play().catch(() => {});
    else if (!active && !v.paused) v.pause();
    if (active && shot.tex && v.readyState >= 2) {
      const usable = 'requestVideoFrameCallback' in v ? shot.fresh : v.currentTime !== shot.lastTime;
      if (usable) {
        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, shot.tex);
        if (shot.sized) gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, v);
        else { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v); shot.sized = true; }
        shot.fresh = false; shot.lastTime = v.currentTime;
      }
    }
  }

  resize(w, h) {
    const dpr = Math.min(window.devicePixelRatio || 1, this.phone ? 2 : 1.75);
    const budget = this.phone ? 1.5e6 : 3.4e6;
    let s = dpr * this.scale;
    if (w * h * s * s > budget) s = Math.sqrt(budget / (w * h));
    const W = Math.round(w * s), H = Math.round(h * s);
    if (this.canvas.width !== W || this.canvas.height !== H) { this.canvas.width = W; this.canvas.height = H; }
    this.gl.viewport(0, 0, W, H);
    this.w = w; this.h = h;
  }

  /* If a device can't hold the frame rate, render fewer pixels rather than drop frames.
     Resolution climbs back slowly, so a brief hitch never leaves the film soft. */
  govern(dt, now) {
    this.acc += dt; this.frames++;
    if (this.frames < 50) return;
    const ms = (this.acc / this.frames) * 1000;
    this.frames = 0; this.acc = 0;
    if (ms > 24 && this.scale > 0.55) { this.scale *= 0.86; this.changed = now; this.resize(this.w, this.h); }
    else if (ms < 17.8 && this.scale < 1 && now - (this.changed || 0) > 6000) { this.scale = Math.min(1, this.scale * 1.1); this.changed = now; this.resize(this.w, this.h); }
  }

  render(f) {
    const gl = this.gl, u = this.u;
    const bind = (unit, tex) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); };
    bind(0, f.a.tex || this.black); bind(1, (f.b || f.a).tex || this.black);
    bind(2, f.a.depthTex || this.grey); bind(3, (f.b || f.a).depthTex || this.grey); bind(4, this.routeTex); bind(5, this.lampTex || this.black);
    gl.uniform4fv(u.uCamA, f.camA); gl.uniform4fv(u.uCamB, f.camB); gl.uniform4fv(u.uPar, f.par);
    gl.uniform2f(u.uHasD, f.a.depthTex ? 1 : 0, f.b?.depthTex ? 1 : 0);
    gl.uniform2fv(u.uLA, f.lightA); gl.uniform2fv(u.uLB, f.lightB);
    gl.uniform2fv(u.uBlur, f.blur); gl.uniform2fv(u.uFog, f.fog);
    gl.uniform2fv(u.uLight, f.light); gl.uniform2fv(u.uHead, f.head);
    gl.uniform3fv(u.uTint, f.tint); gl.uniform3fv(u.uRoute, f.route); gl.uniform3fv(u.uPtr, f.ptr);
    gl.uniform1f(u.uT, f.t); gl.uniform1f(u.uTime, f.time); gl.uniform1f(u.uAspect, this.w / this.h);
    gl.uniform1f(u.uAmp, f.amp); gl.uniform1f(u.uFade, f.fade); gl.uniform1f(u.uShade, f.shade); gl.uniform1f(u.uHeadOn, f.headOn);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

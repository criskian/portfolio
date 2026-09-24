"use client";

/**
 * SplashCursor — WebGL fluid simulation from React Bits
 * (https://reactbits.dev/animations/splash-cursor, MIT + Commons Clause),
 * based on Pavel Dobryakov's WebGL-Fluid-Simulation.
 *
 * Changes for this portfolio:
 * - Ported to TypeScript.
 * - Zone-aware: splats are only injected while the pointer is over a section
 *   tagged `data-splash="on"` (see splash-store.ts). Crossing into an active
 *   zone resets the pointer delta so there is no "jump" splat.
 * - Sleeps: the render loop stops ~2.5 s after the last splat (the dye has
 *   fully dissipated by then) and wakes on the next valid input — zero GPU
 *   while reading or while the pointer is over the projects section.
 * - Palette-based colours (electric blues) instead of rainbow, theme-aware.
 * - Device pixel ratio cap per performance tier.
 * - Releases the WebGL context on unmount.
 */
import { useEffect, useRef } from "react";

import { splashStore, type Rgb } from "./splash-store";

export interface SplashCursorProps {
  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;
  CAPTURE_RESOLUTION?: number;
  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  PRESSURE_ITERATIONS?: number;
  CURL?: number;
  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;
  SHADING?: boolean;
  COLOR_UPDATE_SPEED?: number;
  /** Max device pixel ratio used for the canvas backing store. */
  MAX_DPR?: number;
  /** Milliseconds without splats before the loop sleeps. */
  SLEEP_AFTER?: number;
}

type GL = WebGL2RenderingContext | WebGLRenderingContext;

interface Format {
  internalFormat: number;
  format: number;
}

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
}

interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
}

interface Pointer {
  texcoordX: number;
  texcoordY: number;
  prevTexcoordX: number;
  prevTexcoordY: number;
  deltaX: number;
  deltaY: number;
  moved: boolean;
  color: Rgb;
}

type Uniforms = Record<string, WebGLUniformLocation | null>;

export default function SplashCursor({
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1440,
  CAPTURE_RESOLUTION = 512,
  DENSITY_DISSIPATION = 3.5,
  VELOCITY_DISSIPATION = 2,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 3,
  SPLAT_RADIUS = 0.2,
  SPLAT_FORCE = 6000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  MAX_DPR = 2,
  SLEEP_AFTER = 2500,
}: SplashCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // A fresh canvas per mount: a context released with loseContext() cannot be
    // re-acquired from the same element (matters for StrictMode's double mount).
    const canvas = document.createElement("canvas");
    canvas.className = "block size-full";
    container.appendChild(canvas);

    let isMounted = true;
    let rafId: number | null = null;
    let sleeping = true;
    let lastSplatAt = 0;

    const config = {
      SIM_RESOLUTION,
      DYE_RESOLUTION,
      CAPTURE_RESOLUTION,
      DENSITY_DISSIPATION,
      VELOCITY_DISSIPATION,
      PRESSURE,
      PRESSURE_ITERATIONS,
      CURL,
      SPLAT_RADIUS,
      SPLAT_FORCE,
      SHADING,
      COLOR_UPDATE_SPEED,
    };

    const pointer: Pointer = {
      texcoordX: 0,
      texcoordY: 0,
      prevTexcoordX: 0,
      prevTexcoordY: 0,
      deltaX: 0,
      deltaY: 0,
      moved: false,
      color: { r: 0, g: 0, b: 0 },
    };
    let pointerWasActive = false;

    // ------------------------------------------------------------------ //
    // WebGL context                                                        //
    // ------------------------------------------------------------------ //
    const params: WebGLContextAttributes = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    };
    let gl: GL | null = canvas.getContext("webgl2", params);
    const isWebGL2 = !!gl;
    if (!gl) gl = canvas.getContext("webgl", params);
    if (!gl) {
      canvas.remove();
      return; // No WebGL: silently skip the effect.
    }
    const ctx: GL = gl;

    let halfFloatTexType: number;
    let supportLinearFiltering: unknown;
    if (isWebGL2) {
      ctx.getExtension("EXT_color_buffer_float");
      supportLinearFiltering = ctx.getExtension("OES_texture_float_linear");
      halfFloatTexType = (ctx as WebGL2RenderingContext).HALF_FLOAT;
    } else {
      const halfFloat = ctx.getExtension("OES_texture_half_float");
      supportLinearFiltering = ctx.getExtension("OES_texture_half_float_linear");
      halfFloatTexType = halfFloat?.HALF_FLOAT_OES ?? ctx.UNSIGNED_BYTE;
    }
    ctx.clearColor(0, 0, 0, 1);

    const gl2 = ctx as WebGL2RenderingContext;
    const formatRGBA = isWebGL2
      ? getSupportedFormat(gl2.RGBA16F, gl2.RGBA, halfFloatTexType)
      : getSupportedFormat(ctx.RGBA, ctx.RGBA, halfFloatTexType);
    const formatRG = isWebGL2
      ? getSupportedFormat(gl2.RG16F, gl2.RG, halfFloatTexType)
      : getSupportedFormat(ctx.RGBA, ctx.RGBA, halfFloatTexType);
    const formatR = isWebGL2
      ? getSupportedFormat(gl2.R16F, gl2.RED, halfFloatTexType)
      : getSupportedFormat(ctx.RGBA, ctx.RGBA, halfFloatTexType);
    if (!formatRGBA || !formatRG || !formatR) return;

    if (!supportLinearFiltering) {
      config.DYE_RESOLUTION = 256;
      config.SHADING = false;
    }

    function getSupportedFormat(
      internalFormat: number,
      format: number,
      type: number,
    ): Format | null {
      if (!supportRenderTextureFormat(internalFormat, format, type)) {
        if (isWebGL2) {
          if (internalFormat === gl2.R16F) return getSupportedFormat(gl2.RG16F, gl2.RG, type);
          if (internalFormat === gl2.RG16F) return getSupportedFormat(gl2.RGBA16F, gl2.RGBA, type);
        }
        return null;
      }
      return { internalFormat, format };
    }

    function supportRenderTextureFormat(internalFormat: number, format: number, type: number) {
      const texture = ctx.createTexture();
      ctx.bindTexture(ctx.TEXTURE_2D, texture);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
      ctx.texImage2D(ctx.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
      const fbo = ctx.createFramebuffer();
      ctx.bindFramebuffer(ctx.FRAMEBUFFER, fbo);
      ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D, texture, 0);
      return ctx.checkFramebufferStatus(ctx.FRAMEBUFFER) === ctx.FRAMEBUFFER_COMPLETE;
    }

    // ------------------------------------------------------------------ //
    // Shaders & programs                                                   //
    // ------------------------------------------------------------------ //
    function compileShader(type: number, source: string, keywords?: string[] | null) {
      const src = keywords ? keywords.map((k) => `#define ${k}\n`).join("") + source : source;
      const shader = ctx.createShader(type)!;
      ctx.shaderSource(shader, src);
      ctx.compileShader(shader);
      if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
        console.warn(ctx.getShaderInfoLog(shader));
      }
      return shader;
    }

    function createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
      const program = ctx.createProgram()!;
      ctx.attachShader(program, vertexShader);
      ctx.attachShader(program, fragmentShader);
      ctx.linkProgram(program);
      if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
        console.warn(ctx.getProgramInfoLog(program));
      }
      return program;
    }

    function getUniforms(program: WebGLProgram): Uniforms {
      const uniforms: Uniforms = {};
      const count = ctx.getProgramParameter(program, ctx.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < count; i++) {
        const name = ctx.getActiveUniform(program, i)!.name;
        uniforms[name] = ctx.getUniformLocation(program, name);
      }
      return uniforms;
    }

    class Program {
      program: WebGLProgram;
      uniforms: Uniforms;
      constructor(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        this.program = createProgram(vertexShader, fragmentShader);
        this.uniforms = getUniforms(this.program);
      }
      bind() {
        ctx.useProgram(this.program);
      }
    }

    class Material {
      private programs = new Map<string, WebGLProgram>();
      private activeProgram: WebGLProgram | null = null;
      uniforms: Uniforms = {};
      constructor(
        private vertexShader: WebGLShader,
        private fragmentShaderSource: string,
      ) {}
      setKeywords(keywords: string[]) {
        const key = keywords.join("|");
        let program = this.programs.get(key);
        if (!program) {
          const fragment = compileShader(ctx.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
          program = createProgram(this.vertexShader, fragment);
          this.programs.set(key, program);
        }
        if (program === this.activeProgram) return;
        this.uniforms = getUniforms(program);
        this.activeProgram = program;
      }
      bind() {
        ctx.useProgram(this.activeProgram);
      }
    }

    const baseVertexShader = compileShader(
      ctx.VERTEX_SHADER,
      `
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;
        void main () {
          vUv = aPosition * 0.5 + 0.5;
          vL = vUv - vec2(texelSize.x, 0.0);
          vR = vUv + vec2(texelSize.x, 0.0);
          vT = vUv + vec2(0.0, texelSize.y);
          vB = vUv - vec2(0.0, texelSize.y);
          gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `,
    );

    const copyShader = compileShader(
      ctx.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        void main () { gl_FragColor = texture2D(uTexture, vUv); }
      `,
    );

    const clearShader = compileShader(
      ctx.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        uniform float value;
        void main () { gl_FragColor = value * texture2D(uTexture, vUv); }
      `,
    );

    const displayShaderSource = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform vec2 texelSize;
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        #ifdef SHADING
          vec3 lc = texture2D(uTexture, vL).rgb;
          vec3 rc = texture2D(uTexture, vR).rgb;
          vec3 tc = texture2D(uTexture, vT).rgb;
          vec3 bc = texture2D(uTexture, vB).rgb;
          float dx = length(rc) - length(lc);
          float dy = length(tc) - length(bc);
          vec3 n = normalize(vec3(dx, dy, length(texelSize)));
          vec3 l = vec3(0.0, 0.0, 1.0);
          float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
          c *= diffuse;
        #endif
        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
      }
    `;

    const splatShader = compileShader(
      ctx.FRAGMENT_SHADER,
      `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;
        void main () {
          vec2 p = vUv - point.xy;
          p.x *= aspectRatio;
          vec3 splat = exp(-dot(p, p) / radius) * color;
          vec3 base = texture2D(uTarget, vUv).xyz;
          gl_FragColor = vec4(base + splat, 1.0);
        }
      `,
    );

    const advectionShader = compileShader(
      ctx.FRAGMENT_SHADER,
      `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;
        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
          vec2 st = uv / tsize - 0.5;
          vec2 iuv = floor(st);
          vec2 fuv = fract(st);
          vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
          vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
          vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
          vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
          return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }
        void main () {
          #ifdef MANUAL_FILTERING
            vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
            vec4 result = bilerp(uSource, coord, dyeTexelSize);
          #else
            vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
            vec4 result = texture2D(uSource, coord);
          #endif
          float decay = 1.0 + dissipation * dt;
          gl_FragColor = result / decay;
        }
      `,
      supportLinearFiltering ? null : ["MANUAL_FILTERING"],
    );

    const divergenceShader = compileShader(
      ctx.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;
        void main () {
          float L = texture2D(uVelocity, vL).x;
          float R = texture2D(uVelocity, vR).x;
          float T = texture2D(uVelocity, vT).y;
          float B = texture2D(uVelocity, vB).y;
          vec2 C = texture2D(uVelocity, vUv).xy;
          if (vL.x < 0.0) { L = -C.x; }
          if (vR.x > 1.0) { R = -C.x; }
          if (vT.y > 1.0) { T = -C.y; }
          if (vB.y < 0.0) { B = -C.y; }
          float div = 0.5 * (R - L + T - B);
          gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `,
    );

    const curlShader = compileShader(
      ctx.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;
        void main () {
          float L = texture2D(uVelocity, vL).y;
          float R = texture2D(uVelocity, vR).y;
          float T = texture2D(uVelocity, vT).x;
          float B = texture2D(uVelocity, vB).x;
          float vorticity = R - L - T + B;
          gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
      `,
    );

    const vorticityShader = compileShader(
      ctx.FRAGMENT_SHADER,
      `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;
        void main () {
          float L = texture2D(uCurl, vL).x;
          float R = texture2D(uCurl, vR).x;
          float T = texture2D(uCurl, vT).x;
          float B = texture2D(uCurl, vB).x;
          float C = texture2D(uCurl, vUv).x;
          vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
          force /= length(force) + 0.0001;
          force *= curl * C;
          force.y *= -1.0;
          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity += force * dt;
          velocity = min(max(velocity, -1000.0), 1000.0);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `,
    );

    const pressureShader = compileShader(
      ctx.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;
        void main () {
          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x;
          float B = texture2D(uPressure, vB).x;
          float divergence = texture2D(uDivergence, vUv).x;
          float pressure = (L + R + B + T - divergence) * 0.25;
          gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
      `,
    );

    const gradientSubtractShader = compileShader(
      ctx.FRAGMENT_SHADER,
      `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;
        void main () {
          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x;
          float B = texture2D(uPressure, vB).x;
          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity.xy -= vec2(R - L, T - B);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `,
    );

    // Full-screen quad.
    ctx.bindBuffer(ctx.ARRAY_BUFFER, ctx.createBuffer());
    ctx.bufferData(
      ctx.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      ctx.STATIC_DRAW,
    );
    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, ctx.createBuffer());
    ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), ctx.STATIC_DRAW);
    ctx.vertexAttribPointer(0, 2, ctx.FLOAT, false, 0, 0);
    ctx.enableVertexAttribArray(0);

    function blit(target: FBO | null, clear = false) {
      if (target == null) {
        ctx.viewport(0, 0, ctx.drawingBufferWidth, ctx.drawingBufferHeight);
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
      } else {
        ctx.viewport(0, 0, target.width, target.height);
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, target.fbo);
      }
      if (clear) {
        ctx.clearColor(0, 0, 0, 1);
        ctx.clear(ctx.COLOR_BUFFER_BIT);
      }
      ctx.drawElements(ctx.TRIANGLES, 6, ctx.UNSIGNED_SHORT, 0);
    }

    const copyProgram = new Program(baseVertexShader, copyShader);
    const clearProgram = new Program(baseVertexShader, clearShader);
    const splatProgram = new Program(baseVertexShader, splatShader);
    const advectionProgram = new Program(baseVertexShader, advectionShader);
    const divergenceProgram = new Program(baseVertexShader, divergenceShader);
    const curlProgram = new Program(baseVertexShader, curlShader);
    const vorticityProgram = new Program(baseVertexShader, vorticityShader);
    const pressureProgram = new Program(baseVertexShader, pressureShader);
    const gradientSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);
    const displayMaterial = new Material(baseVertexShader, displayShaderSource);

    // ------------------------------------------------------------------ //
    // Framebuffers                                                         //
    // ------------------------------------------------------------------ //
    let dye: DoubleFBO;
    let velocity: DoubleFBO;
    let divergence: FBO;
    let curl: FBO;
    let pressure: DoubleFBO;

    function createFBO(
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number,
    ): FBO {
      ctx.activeTexture(ctx.TEXTURE0);
      const texture = ctx.createTexture()!;
      ctx.bindTexture(ctx.TEXTURE_2D, texture);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, param);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, param);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
      ctx.texImage2D(ctx.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
      const fbo = ctx.createFramebuffer()!;
      ctx.bindFramebuffer(ctx.FRAMEBUFFER, fbo);
      ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D, texture, 0);
      ctx.viewport(0, 0, w, h);
      ctx.clear(ctx.COLOR_BUFFER_BIT);
      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        attach(id: number) {
          ctx.activeTexture(ctx.TEXTURE0 + id);
          ctx.bindTexture(ctx.TEXTURE_2D, texture);
          return id;
        },
      };
    }

    function createDoubleFBO(
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number,
    ): DoubleFBO {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w,
        height: h,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        get read() {
          return fbo1;
        },
        set read(value) {
          fbo1 = value;
        },
        get write() {
          return fbo2;
        },
        set write(value) {
          fbo2 = value;
        },
        swap() {
          const temp = fbo1;
          fbo1 = fbo2;
          fbo2 = temp;
        },
      };
    }

    function resizeFBO(
      target: FBO,
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number,
    ) {
      const newFBO = createFBO(w, h, internalFormat, format, type, param);
      copyProgram.bind();
      ctx.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
      blit(newFBO);
      return newFBO;
    }

    function resizeDoubleFBO(
      target: DoubleFBO,
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number,
    ) {
      if (target.width === w && target.height === h) return target;
      target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
      target.write = createFBO(w, h, internalFormat, format, type, param);
      target.width = w;
      target.height = h;
      target.texelSizeX = 1 / w;
      target.texelSizeY = 1 / h;
      return target;
    }

    function getResolution(resolution: number) {
      let aspectRatio = ctx.drawingBufferWidth / ctx.drawingBufferHeight;
      if (aspectRatio < 1) aspectRatio = 1 / aspectRatio;
      const min = Math.round(resolution);
      const max = Math.round(resolution * aspectRatio);
      return ctx.drawingBufferWidth > ctx.drawingBufferHeight
        ? { width: max, height: min }
        : { width: min, height: max };
    }

    function initFramebuffers() {
      const simRes = getResolution(config.SIM_RESOLUTION);
      const dyeRes = getResolution(config.DYE_RESOLUTION);
      const texType = halfFloatTexType;
      const rgba = formatRGBA!;
      const rg = formatRG!;
      const r = formatR!;
      const filtering = supportLinearFiltering ? ctx.LINEAR : ctx.NEAREST;
      ctx.disable(ctx.BLEND);

      dye = dye
        ? resizeDoubleFBO(
            dye,
            dyeRes.width,
            dyeRes.height,
            rgba.internalFormat,
            rgba.format,
            texType,
            filtering,
          )
        : createDoubleFBO(
            dyeRes.width,
            dyeRes.height,
            rgba.internalFormat,
            rgba.format,
            texType,
            filtering,
          );

      velocity = velocity
        ? resizeDoubleFBO(
            velocity,
            simRes.width,
            simRes.height,
            rg.internalFormat,
            rg.format,
            texType,
            filtering,
          )
        : createDoubleFBO(
            simRes.width,
            simRes.height,
            rg.internalFormat,
            rg.format,
            texType,
            filtering,
          );

      divergence = createFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        ctx.NEAREST,
      );
      curl = createFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        ctx.NEAREST,
      );
      pressure = createDoubleFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        ctx.NEAREST,
      );
    }

    displayMaterial.setKeywords(config.SHADING ? ["SHADING"] : []);
    resizeCanvas();
    initFramebuffers();

    // ------------------------------------------------------------------ //
    // Simulation loop                                                      //
    // ------------------------------------------------------------------ //
    let lastUpdateTime = performance.now();
    let colorUpdateTimer = 0;

    function scaleByPixelRatio(input: number) {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      return Math.floor(input * pixelRatio);
    }

    function resizeCanvas() {
      const width = scaleByPixelRatio(canvas.clientWidth);
      const height = scaleByPixelRatio(canvas.clientHeight);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
      }
      return false;
    }

    function wake() {
      lastSplatAt = performance.now();
      if (!sleeping || !isMounted) return;
      sleeping = false;
      lastUpdateTime = performance.now();
      rafId = requestAnimationFrame(updateFrame);
    }

    function updateFrame() {
      if (!isMounted) return;
      const now = performance.now();
      if (now - lastSplatAt > SLEEP_AFTER) {
        // Dye has dissipated: clear the canvas and stop until the next input.
        sleeping = true;
        rafId = null;
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
        ctx.viewport(0, 0, ctx.drawingBufferWidth, ctx.drawingBufferHeight);
        ctx.clearColor(0, 0, 0, 0);
        ctx.clear(ctx.COLOR_BUFFER_BIT);
        return;
      }
      const dt = Math.min((now - lastUpdateTime) / 1000, 0.016666);
      lastUpdateTime = now;
      if (resizeCanvas()) initFramebuffers();
      updateColors(dt);
      if (pointer.moved) {
        pointer.moved = false;
        splatPointer();
      }
      step(dt);
      render();
      rafId = requestAnimationFrame(updateFrame);
    }

    function updateColors(dt: number) {
      colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
      if (colorUpdateTimer >= 1) {
        colorUpdateTimer = colorUpdateTimer % 1;
        pointer.color = generateColor();
      }
    }

    function step(dt: number) {
      ctx.disable(ctx.BLEND);

      curlProgram.bind();
      ctx.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      ctx.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(curl);

      vorticityProgram.bind();
      ctx.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      ctx.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
      ctx.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
      ctx.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
      ctx.uniform1f(vorticityProgram.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();

      divergenceProgram.bind();
      ctx.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      ctx.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergence);

      clearProgram.bind();
      ctx.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
      ctx.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
      blit(pressure.write);
      pressure.swap();

      pressureProgram.bind();
      ctx.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      ctx.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        ctx.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }

      gradientSubtractProgram.bind();
      ctx.uniform2f(
        gradientSubtractProgram.uniforms.texelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
      ctx.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
      ctx.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      advectionProgram.bind();
      ctx.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      if (!supportLinearFiltering) {
        ctx.uniform2f(
          advectionProgram.uniforms.dyeTexelSize,
          velocity.texelSizeX,
          velocity.texelSizeY,
        );
      }
      const velocityId = velocity.read.attach(0);
      ctx.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
      ctx.uniform1i(advectionProgram.uniforms.uSource, velocityId);
      ctx.uniform1f(advectionProgram.uniforms.dt, dt);
      ctx.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
      blit(velocity.write);
      velocity.swap();

      if (!supportLinearFiltering) {
        ctx.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      }
      ctx.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
      ctx.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
      ctx.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();
    }

    function render() {
      ctx.blendFunc(ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA);
      ctx.enable(ctx.BLEND);
      displayMaterial.bind();
      if (config.SHADING) {
        ctx.uniform2f(
          displayMaterial.uniforms.texelSize,
          1 / ctx.drawingBufferWidth,
          1 / ctx.drawingBufferHeight,
        );
      }
      ctx.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
      blit(null);
    }

    // ------------------------------------------------------------------ //
    // Splats                                                               //
    // ------------------------------------------------------------------ //
    function splatPointer() {
      const dx = pointer.deltaX * config.SPLAT_FORCE;
      const dy = pointer.deltaY * config.SPLAT_FORCE;
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
    }

    function clickSplat() {
      const color = generateColor();
      color.r *= 10;
      color.g *= 10;
      color.b *= 10;
      const dx = 10 * (Math.random() - 0.5);
      const dy = 30 * (Math.random() - 0.5);
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color);
    }

    function splat(x: number, y: number, dx: number, dy: number, color: Rgb) {
      splatProgram.bind();
      ctx.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
      ctx.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
      ctx.uniform2f(splatProgram.uniforms.point, x, y);
      ctx.uniform3f(splatProgram.uniforms.color, dx, dy, 0);
      ctx.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100));
      blit(velocity.write);
      velocity.swap();

      ctx.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
      ctx.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
      blit(dye.write);
      dye.swap();
    }

    function correctRadius(radius: number) {
      const aspectRatio = canvas.width / canvas.height;
      return aspectRatio > 1 ? radius * aspectRatio : radius;
    }

    function correctDeltaX(delta: number) {
      const aspectRatio = canvas.width / canvas.height;
      return aspectRatio < 1 ? delta * aspectRatio : delta;
    }

    function correctDeltaY(delta: number) {
      const aspectRatio = canvas.width / canvas.height;
      return aspectRatio > 1 ? delta / aspectRatio : delta;
    }

    function generateColor(): Rgb {
      const palette = splashStore.palette;
      const c = palette[Math.floor(Math.random() * palette.length)];
      return { r: c.r * 0.15, g: c.g * 0.15, b: c.b * 0.15 };
    }

    // ------------------------------------------------------------------ //
    // Input (gated by zone)                                                //
    // ------------------------------------------------------------------ //
    function setPointerPosition(clientX: number, clientY: number, resetDelta: boolean) {
      const posX = scaleByPixelRatio(clientX);
      const posY = scaleByPixelRatio(clientY);
      const x = posX / canvas.width;
      const y = 1 - posY / canvas.height;
      pointer.prevTexcoordX = resetDelta ? x : pointer.texcoordX;
      pointer.prevTexcoordY = resetDelta ? y : pointer.texcoordY;
      pointer.texcoordX = x;
      pointer.texcoordY = y;
      pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
      pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
      pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    }

    /** Returns true when the point is inside an active zone. */
    function track(clientX: number, clientY: number) {
      const active = splashStore.isActiveAt(clientY);
      if (!active) {
        pointerWasActive = false;
        return false;
      }
      const entering = !pointerWasActive;
      pointerWasActive = true;
      if (entering) pointer.color = generateColor();
      setPointerPosition(clientX, clientY, entering);
      if (pointer.moved) wake();
      return true;
    }

    function handleMouseMove(e: MouseEvent) {
      track(e.clientX, e.clientY);
    }

    function handleMouseDown(e: MouseEvent) {
      if (!splashStore.isActiveAt(e.clientY)) return;
      setPointerPosition(e.clientX, e.clientY, true);
      wake();
      clickSplat();
    }

    function handleTouchStart(e: TouchEvent) {
      const touch = e.targetTouches[0];
      if (!touch || !splashStore.isActiveAt(touch.clientY)) return;
      pointerWasActive = true;
      pointer.color = generateColor();
      setPointerPosition(touch.clientX, touch.clientY, true);
    }

    function handleTouchMove(e: TouchEvent) {
      const touch = e.targetTouches[0];
      if (touch) track(touch.clientX, touch.clientY);
    }

    function handleTouchEnd() {
      pointerWasActive = false;
    }

    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      isMounted = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      // Free GPU memory immediately (also avoids leaking a context in StrictMode).
      ctx.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [
    SIM_RESOLUTION,
    DYE_RESOLUTION,
    CAPTURE_RESOLUTION,
    DENSITY_DISSIPATION,
    VELOCITY_DISSIPATION,
    PRESSURE,
    PRESSURE_ITERATIONS,
    CURL,
    SPLAT_RADIUS,
    SPLAT_FORCE,
    SHADING,
    COLOR_UPDATE_SPEED,
    MAX_DPR,
    SLEEP_AFTER,
  ]);

  return <div ref={containerRef} aria-hidden className="size-full" />;
}

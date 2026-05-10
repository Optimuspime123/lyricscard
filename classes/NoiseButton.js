/**
 * NoiseButton — overlays an animated WebGL chaos-line shader on a button.
 * Designed for "main action" CTAs (the search button + the lyrics FAB).
 *
 * Four color channels (violet / amber / mint / azure) trace FBM-displaced
 * sine bands that thicken and accelerate on press. Output is premultiplied
 * RGBA so dark areas read as transparent — the AMOLED surface beneath shows
 * through and the colored bands paint over it.
 */

const VERT_SRC = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG_SRC = `
precision mediump float;

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_intensity;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash(i),                  hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y);
}

float fbm(vec2 p, vec3 freq) {
    return vnoise(p * freq.x) * 0.50
         + vnoise(p * freq.y) * 0.25
         + vnoise(p * freq.z) * 0.125;
}

vec3 chaosLines(vec2 uv, vec3 freq, float t) {
    vec3 cols[4];
    cols[0] = vec3(0.78, 0.18, 1.00); // violet
    cols[1] = vec3(1.00, 0.40, 0.10); // amber
    cols[2] = vec3(0.18, 1.00, 0.55); // mint
    cols[3] = vec3(0.20, 0.55, 1.00); // azure

    float amp   = mix(80.0, 16.0, u_intensity);
    float thick = mix(0.22, 0.40, u_intensity);

    vec3 acc = vec3(0.0);
    for (int i = 0; i < 4; i++) {
        float fi     = float(i);
        float period = 2.6 + fi * 1.2;
        float disp   = fbm(uv + t * period, freq);
        float wave   = sin(uv.y + disp * 1.4) * (amp + fi * 5.0);
        acc += abs(thick / wave) * cols[i];
    }
    return acc;
}

void main() {
    // Square-normalized so line density is independent of button aspect.
    vec2 uv = (gl_FragCoord.xy / u_resolution.xy - 0.5) * 3.0;

    float t = u_time * mix(0.10, 0.45, u_intensity);

    // Slow breathing pulse, scaled up when the button is engaged.
    float pulseT = sin(u_time * 0.5) * 0.5 + 0.5;
    float pulse  = mix(0.30, 0.95, pulseT) * mix(0.65, 1.30, u_intensity);

    vec3 col  = chaosLines(uv,                vec3(58.0, 36.0, 4.0), t      ) * pulse;
         col += chaosLines(uv * 1.3 + 0.4,    vec3(5.5,  2.4,  1.0), t * 0.8) * pulse * 0.45;

    col = clamp(col, 0.0, 1.0);

    // Premultiplied alpha: brightest channel drives opacity so dark areas
    // become transparent and the AMOLED surface shows through. Keeping
    // alpha = max(rgb) preserves the premul invariant (rgb <= alpha).
    float alpha = max(col.r, max(col.g, col.b));
    gl_FragColor = vec4(col, alpha);
}
`;

class NoiseButton {
    static initAll(selector = "[data-noise-button]") {
        document.querySelectorAll(selector).forEach((btn) => {
            try {
                new NoiseButton(btn);
            } catch (err) {
                console.warn("NoiseButton init failed:", err);
            }
        });
    }

    constructor(button) {
        this.button = button;
        this.canvas = document.createElement("canvas");
        this.canvas.className = "noise-canvas";
        this.canvas.setAttribute("aria-hidden", "true");
        button.insertBefore(this.canvas, button.firstChild);

        const gl = this.canvas.getContext("webgl", {
            alpha: true,
            antialias: false,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
        });
        if (!gl) {
            this.canvas.remove();
            return;
        }
        this.gl = gl;

        this.intensity = 0;
        this.targetIntensity = 0;
        this.startTime = performance.now();
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (!this.#setupShader()) {
            this.canvas.remove();
            return;
        }
        this.#resize();
        this.#bind();

        if (this.reducedMotion) {
            this.#draw();
        } else {
            this.rafId = requestAnimationFrame(this.#tick);
        }
    }

    destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        if (this.resizeObs) this.resizeObs.disconnect();
        this.canvas?.remove();
    }

    #setupShader() {
        const gl = this.gl;
        const compile = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                console.warn("Shader compile error:", gl.getShaderInfoLog(s));
                gl.deleteShader(s);
                return null;
            }
            return s;
        };
        const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
        const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
        if (!vs || !fs) return false;

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.warn("Program link error:", gl.getProgramInfoLog(program));
            return false;
        }
        gl.useProgram(program);
        this.program = program;

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            gl.STATIC_DRAW
        );
        const posLoc = gl.getAttribLocation(program, "a_pos");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        this.uniforms = {
            resolution: gl.getUniformLocation(program, "u_resolution"),
            time: gl.getUniformLocation(program, "u_time"),
            intensity: gl.getUniformLocation(program, "u_intensity"),
        };
        return true;
    }

    #resize() {
        const rect = this.button.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width * this.dpr));
        const h = Math.max(1, Math.floor(rect.height * this.dpr));
        if (this.canvas.width !== w || this.canvas.height !== h) {
            this.canvas.width = w;
            this.canvas.height = h;
            this.gl.viewport(0, 0, w, h);
            this.gl.uniform2f(this.uniforms.resolution, w, h);
        }
    }

    #bind() {
        const activate = () => {
            this.targetIntensity = 1;
        };
        const deactivate = () => {
            this.targetIntensity = 0;
        };
        this.button.addEventListener("mousedown", activate);
        this.button.addEventListener("touchstart", activate, { passive: true });
        this.button.addEventListener("mouseenter", () => {
            this.targetIntensity = Math.max(this.targetIntensity, 0.45);
        });
        this.button.addEventListener("mouseup", deactivate);
        this.button.addEventListener("mouseleave", deactivate);
        this.button.addEventListener("touchend", deactivate, { passive: true });
        this.button.addEventListener("touchcancel", deactivate, { passive: true });

        this.resizeObs = new ResizeObserver(() => this.#resize());
        this.resizeObs.observe(this.button);
    }

    #draw() {
        const t = (performance.now() - this.startTime) / 1000;
        this.gl.uniform1f(this.uniforms.time, t);
        this.gl.uniform1f(this.uniforms.intensity, this.intensity);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    #tick = () => {
        this.intensity += (this.targetIntensity - this.intensity) * 0.12;
        this.#draw();
        this.rafId = requestAnimationFrame(this.#tick);
    };
}

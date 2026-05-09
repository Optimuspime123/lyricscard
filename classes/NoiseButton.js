/**
 * NoiseButton — overlays an animated WebGL noise texture on a button.
 * Designed for "main action" CTAs (the search button + the lyrics FAB).
 *
 * The shader produces a slow flowing aurora at rest; on press/hover it
 * intensifies and speeds up. Blended via `mix-blend-mode: overlay` so the
 * button's M3 surface tone still dominates.
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
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.55;
    for (int i = 0; i < 4; i++) {
        v += a * vnoise(p);
        p *= 2.05;
        a *= 0.55;
    }
    return v;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

    float t = u_time * mix(0.35, 1.8, u_intensity);

    float n1 = fbm(p * 2.6 + vec2(t * 0.45, t * 0.10));
    float n2 = fbm(p * 4.2 + vec2(-t * 0.30, t * 0.55));
    float ribbon = smoothstep(0.42, 0.78, n1) * smoothstep(0.40, 0.74, n2);

    float lineCarve = abs(p.y * 1.8 + (n1 - 0.5) * 0.6 - sin(p.x * 1.6 + t) * 0.18);
    float line = smoothstep(0.06 - u_intensity * 0.02, 0.0, lineCarve);

    float grain = (hash(gl_FragCoord.xy + t * 60.0) - 0.5);

    float light = ribbon * mix(0.30, 0.95, u_intensity)
                + line   * mix(0.10, 0.55, u_intensity)
                + grain  * mix(0.05, 0.18, u_intensity);

    light = clamp(light, -0.4, 1.4);

    gl_FragColor = vec4(vec3(0.5 + light * 0.5), 1.0);
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
            premultipliedAlpha: false,
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

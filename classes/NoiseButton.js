/**
 * NoiseButton — overlays an animated WebGL chaos-line shader on a button.
 * Designed for "main action" CTAs (the search button + the lyrics FAB).
 *
 * Adapted from a Metal-style chaos-button shader (trigonometric FBM noise +
 * two-pass swirling lines). Four color channels (violet / red-orange / green
 * / blue) trace sine bands displaced by the FBM field. At rest the pulse
 * factor sits between 0.05–0.20 so the first pass nearly vanishes and only
 * a slow background swirl remains; on press, amplitude drops, speed climbs,
 * and the pulse window widens — the button erupts into vivid swirling lines.
 *
 * Output is premultiplied RGBA so dark areas are transparent and the AMOLED
 * surface beneath shows through.
 */

const VERT_SRC = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG_SRC = `
precision mediump float;

uniform vec2  u_resolution;
uniform float u_time;       // accumulated phase (smooth across speed changes)
uniform float u_intensity;  // 0 = resting, 1 = active

// Trigonometric "swirl" noise — periodic, gives the smooth flowing patterns.
float noise(vec2 p) {
    float n  = sin(p.x * 1.0 + sin(p.y * 1.3)) * 0.5;
          n += sin(p.y * 1.0 + sin(p.x * 1.1)) * 0.5;
          n += sin((p.x + p.y) * 0.5) * 0.25;
          n += sin((p.x - p.y) * 0.7) * 0.25;
    return n * 0.5 + 0.5;
}

float fbm(vec2 p, vec3 a) {
    float v  = noise(p * a.x) * 0.50;
          v += noise(p * a.y) * 1.50;
          v += noise(p * a.z) * 0.0125;
    return v;
}

vec3 drawLines(vec2 uv, vec3 fbmFreq, vec3 tint, float secs, float amplitude) {
    float timeVal = secs * 0.1;
    vec3  finalColor = vec3(0.0);

    vec3 cols[4];
    cols[0] = vec3(0.70, 0.05, 1.00); // violet
    cols[1] = vec3(1.00, 0.19, 0.00); // red-orange
    cols[2] = vec3(0.00, 1.00, 0.30); // green
    cols[3] = vec3(0.00, 0.38, 1.00); // blue

    // Pass A: base swirling lines, thicker, all four colors at full saturation.
    for (int i = 0; i < 4; i++) {
        float fi        = float(i);
        float period    = 2.0 + (fi + 2.0);
        float thickness = mix(0.4, 0.2, noise(uv * 2.0));
        float wave      = sin(uv.y + fbm(uv + timeVal * period, fbmFreq)) * amplitude;
        finalColor += abs(thickness / wave) * cols[i];
    }

    // Pass B: secondary thinner lines, multiplied by a tint so each outer
    // pass biases the palette differently.
    for (int i = 0; i < 4; i++) {
        float fi        = float(i);
        float amp       = (amplitude * 0.5) + (fi * 5.0);
        float period    = 9.0 + (fi + 2.0);
        float thickness = 0.1;
        float wave      = sin(uv.y + fbm(uv + timeVal * period, fbmFreq)) * amp;
        finalColor += abs(thickness / wave) * cols[i] * tint;
    }

    return finalColor;
}

void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution.x) * 2.0 - 1.0;
    uv *= 1.5;

    // Lerp resting <-> active state by intensity.
    float amplitude = mix(80.0, 10.0, u_intensity);
    float pulseMin  = 0.05;
    float pulseMax  = mix(0.20, 0.40, u_intensity);

    vec3 tintA = vec3(1.0, 0.0, 0.5); // pink-magenta tint for the dense pass
    vec3 tintB = vec3(0.3, 0.5, 1.5); // cyan-blue tint for the slow swirl

    float pulseT = sin(u_time) * 0.5 + 0.5;
    float pulse  = mix(pulseMin, pulseMax, pulseT);

    // Pass 1: dense, fast lines — only visible when pulse is high.
    vec3 col  = drawLines(uv, vec3(65.2, 40.0, 4.0), tintA, u_time, amplitude) * pulse;
    // Pass 2: large-scale slow swirl, always-on baseline motion.
         col += drawLines(uv, vec3(2.5,  2.1,  1.0), tintB, u_time, amplitude);

    col = clamp(col, 0.0, 1.0);

    // Edge mask — push the lines toward the top/bottom rims so they
    // frame the text rather than draw across it. `yEdge` is 0 at the
    // vertical center, 1 at the top/bottom rim. At rest the mask is
    // hard (center fully cleared); on press the floor lifts to ~0.45
    // so a little overlap bleeds into the text area.
    float yEdge = abs((gl_FragCoord.y / u_resolution.y) - 0.5) * 2.0;
    float edgeMask = smoothstep(0.30, 0.80, yEdge);
    edgeMask = mix(mix(0.0, 0.45, u_intensity), 1.0, edgeMask);
    col *= edgeMask;

    // Premultiplied alpha: brightest channel drives opacity so dark areas
    // are transparent and the AMOLED surface shows through. Keeping
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
        // `phase` advances at a rate that depends on the current intensity
        // so fbm motion accelerates smoothly between rest/active.
        this.phase = 0;
        this.lastFrame = performance.now();
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

    // Resting and active phase rates, mirroring the codepen's tweakpane defaults.
    static REST_SPEED = 0.35;
    static ACTIVE_SPEED = 2.8;

    #draw() {
        this.gl.uniform1f(this.uniforms.time, this.phase);
        this.gl.uniform1f(this.uniforms.intensity, this.intensity);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    #tick = () => {
        const now = performance.now();
        // Cap delta so a backgrounded tab doesn't fast-forward the phase.
        const dt = Math.min(0.1, (now - this.lastFrame) / 1000);
        this.lastFrame = now;

        this.intensity += (this.targetIntensity - this.intensity) * 0.12;

        const speed =
            NoiseButton.REST_SPEED +
            (NoiseButton.ACTIVE_SPEED - NoiseButton.REST_SPEED) * this.intensity;
        this.phase += dt * speed;
        // Wrap to keep float precision; the trig noise is periodic so this is safe.
        if (this.phase > 1e5) this.phase %= 1e5;

        this.#draw();
        this.rafId = requestAnimationFrame(this.#tick);
    };
}

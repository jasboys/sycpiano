import parseToRgb from 'polished/lib/color/parseToRgb';

import { gsap } from 'gsap';

import {
    AudioVisualizerBase,
    TWO_PI,
} from 'src/components/Media/Music/AudioVisualizerBase';

import { polarToCartesian } from 'src/components/Media/Music/utils';
import { CIRCLE_SAMPLES, constantQ, firLoader, waveformLoader } from 'src/components/Media/Music/VisualizationUtils';

import { cqFrag, genFrag, genVert, lineVert } from 'src/components/Media/Music/shaders';
import { initShader } from 'src/components/Media/Music/webGLHelpers';

interface ShaderProgram {
    shader: WebGLShader;
    buffers: {
        [key: string]: WebGLBuffer;
    };
    uniforms: {
        [key: string]: WebGLUniformLocation;
    };
    attributes: {
        [key: string]: number;
    };
}

class AudioVisualizer extends AudioVisualizerBase<WebGLRenderingContext> {
    cqProgram!: ShaderProgram;
    genProgram!: ShaderProgram;
    lineProgram!: ShaderProgram;

    viewMatrix!: Float32Array;

    internalOffset!: number;
    deviceRatio!: number;

    initializeVisualizer = async (): Promise<void> => {
        if (!this.visualization.current) {
            console.error('visualization element does not exist.');
            return;
        }
        const gl = this.visualization.current.getContext('webgl');
        if (!gl) {
            console.error('no WebGL context.');
            return;
        }
        gl.getExtension('GL_OES_standard_derivatives');
        gl.getExtension('OES_standard_derivatives');
        this.renderingContext = gl;

        const cqShader = initShader(gl, genVert, cqFrag);
        const genShader = initShader(gl, genVert, genFrag);
        const lineShader = initShader(gl, lineVert, genFrag);

        if (!cqShader || !genShader || !lineShader) {
            console.error('error creating shaders.');
            return;
        }

        this.cqProgram = {
            shader: cqShader,
            buffers: {
                vertices: gl.createBuffer()!,
            },
            uniforms: {
                globalColor: gl.getUniformLocation(cqShader, 'uGlobalColor')!,
                radius: gl.getUniformLocation(cqShader, 'uRadius')!,
                center: gl.getUniformLocation(cqShader, 'uCenter')!,
                viewMatrix: gl.getUniformLocation(cqShader, 'uMatrix')!,
            },
            attributes: {
                vertexPosition: gl.getAttribLocation(cqShader, 'aVertexPosition'),
            },
        };

        this.genProgram = {
            shader: genShader,
            buffers: {
                vertices: gl.createBuffer()!,
            },
            uniforms: {
                globalColor: gl.getUniformLocation(genShader, 'uGlobalColor')!,
                viewMatrix: gl.getUniformLocation(genShader, 'uMatrix')!,
            },
            attributes: {
                vertexPosition: gl.getAttribLocation(genShader, 'aVertexPosition'),
            },
        };

        this.lineProgram = {
            shader: lineShader,
            buffers: {
                vertices: gl.createBuffer()!,
            },
            uniforms: {
                globalColor: gl.getUniformLocation(lineShader, 'uGlobalColor')!,
                thickness: gl.getUniformLocation(lineShader, 'uThickness')!,
                viewMatrix: gl.getUniformLocation(lineShader, 'uMatrix')!,
            },
            attributes: {
                position: gl.getAttribLocation(lineShader, 'aPosition'),
                normal: gl.getAttribLocation(lineShader, 'aNormal'),
            },
        };

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // To disable the background color of the canvas element
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        this.onResize();

        await this.initialize();
    }

    drawConstantQBins = (gl: WebGLRenderingContext, values: Float32Array, radius: number, color: Float32Array): void => {
        if (!this.visualization.current) {
            return;
        }
        let currentInput = 0;
        let currentSample = 0;
        let currentFraction = 0;

        const vertices = new Float32Array(CIRCLE_SAMPLES * 2 + 4);
        vertices[0] = 0;
        vertices[1] = 0;

        // "resampling" constantQ from CQ_BINS to CIRCLE_SAMPLES using FIR
        while (currentSample < CIRCLE_SAMPLES && currentInput < this.CQ_BINS) {
            const index = currentFraction * this.SAMPLES_PER_CROSSING;
            const integralPart = Math.floor(index);
            const fractionalPart = index - integralPart;
            let sum = 0;
            for (let i = integralPart, j = this.HALF_CROSSINGS; i < this.FILTER_SIZE; i += this.SAMPLES_PER_CROSSING, j--) {
                let input = currentInput + j;
                // treat like ring buffer
                if (input < 0) {
                    input += this.CQ_BINS;
                } else if (input >= this.CQ_BINS) {
                    input -= this.CQ_BINS;
                }
                const scale = values[input];
                sum += scale * (firLoader.coeffs[i] + fractionalPart * firLoader.deltas[i]);
            }
            const result = radius + this.props.volume * sum * this.SCALE;
            let { x, y } = constantQ.angles[currentSample];
            x *= result;
            y *= result;

            vertices[2 + 2 * currentSample] = x;
            vertices[2 + 2 * currentSample + 1] = y;

            // update for next sample
            currentSample += 1;
            currentFraction += this.STEP_SIZE;
            if (currentFraction >= 1) {
                currentInput += 1;
                currentFraction -= 1;
            }
        }

        vertices[2 + CIRCLE_SAMPLES * 2] = vertices[2];
        vertices[2 + CIRCLE_SAMPLES * 2 + 1] = vertices[3];

        gl.useProgram(this.cqProgram.shader);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cqProgram.buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

        const { globalColor: uGlobalColor, center: uCenter, radius: uRadius } = this.cqProgram.uniforms;

        gl.uniform4fv(uGlobalColor, color);
        gl.uniform2fv(uCenter, new Float32Array([this.visualization.current.width / 2, this.visualization.current.height / 2 - this.internalOffset]));
        gl.uniform1f(uRadius, 1 + radius * this.deviceRatio);

        const { vertices: aVertexPosition } = this.cqProgram.attributes;
        gl.enableVertexAttribArray(aVertexPosition);
        gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
    }

    drawWaveForm = (gl: WebGLRenderingContext, centerAxis: number, color: Float32Array): void => {
        const waveform = waveformLoader.waveform;
        const angles = waveformLoader.angles;
        if (!waveform || waveform.length === 0) {
            return;
        }

        const waveformLength = waveform.length / 2;
        const volumeHeightScale = this.props.volume * this.WAVEFORM_HALF_HEIGHT;
        const vertices = new Float32Array(waveformLength * 4);
        // going through mins from start to end
        for (let j = 0; j < waveformLength; j++) {
            let scale = centerAxis + waveform[j * 2] * volumeHeightScale;
            const { x, y } = angles?.[j] || { x: 0, y: 0 };

            vertices[j * 4] = x * scale;
            vertices[j * 4 + 1] = y * scale;

            scale = centerAxis + waveform[j * 2 + 1] * volumeHeightScale;

            vertices[j * 4 + 2] = x * scale;
            vertices[j * 4 + 3] = y * scale;
        }

        gl.useProgram(this.genProgram.shader);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.genProgram.buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

        gl.uniform4fv(this.genProgram.uniforms.globalColor, color);

        gl.enableVertexAttribArray(this.genProgram.attributes.vertexPosition);
        gl.vertexAttribPointer(this.genProgram.attributes.vertexPosition, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, waveformLength * 2);
    }

    drawPlaybackHead = (gl: WebGLRenderingContext, angle: number, minRad: number, maxRad: number, color: Float32Array): void => {
        const [xStart, yStart] = polarToCartesian(minRad, angle);
        const [xEnd, yEnd] = polarToCartesian(maxRad, angle);

        let [dx, dy] = [xEnd - xStart, yEnd - yStart];
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;

        const verts = new Float32Array([
            xStart, yStart, -dy, dx,
            xStart, yStart, dy, -dx,
            xEnd, yEnd, -dy, dx,
            xEnd, yEnd, dy, -dx,
        ]);

        gl.useProgram(this.lineProgram.shader);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineProgram.buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);

        gl.enableVertexAttribArray(this.lineProgram.attributes.position);
        gl.enableVertexAttribArray(this.lineProgram.attributes.normal);
        gl.vertexAttribPointer(this.lineProgram.attributes.position, 2, gl.FLOAT, false, 4 * 4, 0);
        gl.vertexAttribPointer(this.lineProgram.attributes.normal, 2, gl.FLOAT, false, 4 * 4, 2 * 4);

        gl.uniform4fv(this.lineProgram.uniforms.globalColor, color);
        gl.uniform1f(this.lineProgram.uniforms.thickness, 1.0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    drawSeekArea = (gl: WebGLRenderingContext, radius: number, color: Float32Array, timestamp: number): void => {
        const WAVEFORM_CENTER_AXIS = radius - this.WAVEFORM_HALF_HEIGHT;
        this.drawWaveForm(gl, WAVEFORM_CENTER_AXIS, color);

        // interpolate playbackhead position with timestamp difference if audio object hasn't updated current position
        let playbackHead = this.props.currentPosition;
        if (
            this.props.currentPosition &&
            this.props.currentPosition === this.lastPlayheadPosition &&
            this.props.isPlaying
        ) {
            playbackHead = this.props.currentPosition + (timestamp - this.props.prevTimestamp) / 1000;
        } else {
            this.lastPlayheadPosition = this.props.currentPosition;
        }
        const angle = (this.props.currentPosition && this.props.duration) ? TWO_PI * playbackHead / this.props.duration : 0;
        this.drawPlaybackHead(
            gl,
            angle,
            WAVEFORM_CENTER_AXIS - this.props.volume * this.WAVEFORM_HALF_HEIGHT,
            WAVEFORM_CENTER_AXIS + this.props.volume * this.WAVEFORM_HALF_HEIGHT,
            new Float32Array([1.0, 1.0, 1.0, 1.0]),
        );
        if (this.props.isHoverSeekring && this.props.hoverAngle !== undefined) {
            this.drawPlaybackHead(
                gl,
                this.props.hoverAngle,
                WAVEFORM_CENTER_AXIS - this.props.volume * this.WAVEFORM_HALF_HEIGHT,
                WAVEFORM_CENTER_AXIS + this.props.volume * this.WAVEFORM_HALF_HEIGHT,
                new Float32Array([0.5, 0.5, 0.5, 1.0]),
            );
        }
    }

    drawVisualization = (gl: WebGLRenderingContext, lowFreq: number, values: Float32Array, lightness: number, timestamp: number): void => {
        if (!this.visualization.current) {
            return;
        }
        // beware! we are rotating the whole thing by -half_pi so, we need to swap width and height values
        // context.clearRect(-this.height / 2 + this.HEIGHT_ADJUST, -this.width / 2, this.height, this.width);
        // hsl derived from @light-blue: #4E86A4;
        const hsl = `hsl(201, ${Math.round(36 + lightness * 64)}%, ${Math.round(47 + lightness * 53)}%)`;
        const color = parseToRgb(hsl);
        const colorArray = new Float32Array([color.red / 255, color.green / 255, color.blue / 255, 1.0]);

        // adjust large radius to change with the average of all values
        const radius = this.RADIUS_BASE + lowFreq * this.RADIUS_SCALE;
        this.props.setRadii(radius - 2 * this.WAVEFORM_HALF_HEIGHT, radius, this.RADIUS_BASE);

        gl.viewport(0, 0, this.visualization.current.width, this.visualization.current.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.drawConstantQBins(gl, values, radius, colorArray);
        this.drawSeekArea(gl, radius, colorArray, timestamp);
    }

    onResize = (): void => {
        this.idleStart = performance.now();
        this.adjustHeight();

        if (
            !this.container.current ||
            !this.visualization.current
        ) {
            return;
        }

        const devicePixelRatio = window.devicePixelRatio || 1;

        this.height = this.container.current.offsetHeight;
        this.width = this.container.current.offsetWidth;
        this.visualization.current.height = this.height * devicePixelRatio;
        this.visualization.current.width = this.width * devicePixelRatio;
        this.visualization.current.style.width = `${this.width}px`;
        this.visualization.current.style.height = `${this.height}px`;

        const centerX = this.width / 2;
        const centerY = this.height / 2 + this.HEIGHT_ADJUST;

        // rotate so 0rad is up top
        // move so center is in center of canvas element (but since we rotated already,
        // we also need to rotate our translate [centerX, centerY] => [-centerY, centerX]

        this.viewMatrix = new Float32Array([
            0, 2 * devicePixelRatio / this.visualization.current.height, 0,
            2 * devicePixelRatio / this.visualization.current.width, 0, 0,
            0, -2 * devicePixelRatio * this.HEIGHT_ADJUST / this.visualization.current.height, 1,
        ]);

        this.renderingContext!.useProgram(this.cqProgram.shader);
        this.renderingContext!.uniformMatrix3fv(this.cqProgram.uniforms.viewMatrix, false, this.viewMatrix);

        this.renderingContext!.useProgram(this.genProgram.shader);
        this.renderingContext!.uniformMatrix3fv(this.genProgram.uniforms.viewMatrix, false, this.viewMatrix);

        this.renderingContext!.useProgram(this.lineProgram.shader);
        this.renderingContext!.uniformMatrix3fv(this.lineProgram.uniforms.viewMatrix, false, this.viewMatrix);

        this.internalOffset = this.HEIGHT_ADJUST * devicePixelRatio;
        this.deviceRatio = devicePixelRatio;

        this.RADIUS_SCALE = Math.min(this.width, this.height) / 12;
        this.RADIUS_BASE = Math.min(centerX, centerY) - this.RADIUS_SCALE * 3 / 4;
        this.WAVEFORM_HALF_HEIGHT = Math.min(50, this.RADIUS_BASE / 4);

        if (!this.isRendering) {
            gsap.ticker.add(this.onAnalyze);
            this.isRendering = true;
        }
    }
}

export const Component = AudioVisualizer;

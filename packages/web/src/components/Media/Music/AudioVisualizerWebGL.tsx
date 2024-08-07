import { gsap } from 'gsap';
import { hsl, parseToRgb } from 'polished';
import getNormals from 'polyline-normals';

import {
    AudioVisualizerBase,
    TWO_PI,
} from 'src/components/Media/Music/AudioVisualizerBase';
import {
    CIRCLE_SAMPLES,
    constantQ,
    firLoader,
} from 'src/components/Media/Music/VisualizationUtils';
import {
    cqFrag,
    genFrag,
    genVert,
    lineVert,
    phaseVert,
} from 'src/components/Media/Music/shaders';
import { polarToCartesian } from 'src/components/Media/Music/utils';
import { initShader } from 'src/components/Media/Music/webGLHelpers';
import { musicStore } from './store.js';

interface ShaderProgram {
    shader: WebGLShader;
    buffers: {
        [key: string]: WebGLBuffer | null;
    };
    uniforms: {
        [key: string]: WebGLUniformLocation | null;
    };
    attributes: {
        [key: string]: number;
    };
}

class AudioVisualizer extends AudioVisualizerBase<WebGLRenderingContext> {
    cqProgram!: ShaderProgram;
    genProgram!: ShaderProgram;
    lineProgram!: ShaderProgram;
    phaseProgram!: ShaderProgram;

    viewMatrix!: Float32Array;

    internalOffset!: number;
    deviceRatio!: number;

    // persistent buffers
    cqVertices: Float32Array = new Float32Array(CIRCLE_SAMPLES * 2 + 4);
    waveformVertices!: Float32Array;
    phaseVertices!: Float32Array;
    lineVertices = new Float32Array(16);
    colorArray = new Float32Array(4);
    white = new Float32Array([1.0, 1.0, 1.0, 1.0]);
    gray = new Float32Array([0.5, 0.5, 0.5, 1.0]);

    initializeVisualizer = async (): Promise<void> => {
        if (!this.visualization.current) {
            console.error('visualization element does not exist.');
            return;
        }
        const gl = this.visualization.current.getContext('webgl', {
            antialias: true,
        });
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
        const phaseShader = initShader(gl, phaseVert, genFrag);

        if (!cqShader || !genShader || !lineShader || !phaseShader) {
            console.error('error creating shaders.');
            return;
        }

        this.cqProgram = {
            shader: cqShader,
            buffers: {
                vertices: gl.createBuffer(),
            },
            uniforms: {
                globalColor: gl.getUniformLocation(cqShader, 'uGlobalColor'),
                radius: gl.getUniformLocation(cqShader, 'uRadius'),
                center: gl.getUniformLocation(cqShader, 'uCenter'),
                viewMatrix: gl.getUniformLocation(cqShader, 'uMatrix'),
            },
            attributes: {
                vertexPosition: gl.getAttribLocation(
                    cqShader,
                    'aVertexPosition',
                ),
            },
        };

        this.genProgram = {
            shader: genShader,
            buffers: {
                vertices: gl.createBuffer(),
            },
            uniforms: {
                globalColor: gl.getUniformLocation(genShader, 'uGlobalColor'),
                viewMatrix: gl.getUniformLocation(genShader, 'uMatrix'),
            },
            attributes: {
                vertexPosition: gl.getAttribLocation(
                    genShader,
                    'aVertexPosition',
                ),
            },
        };

        this.lineProgram = {
            shader: lineShader,
            buffers: {
                vertices: gl.createBuffer(),
            },
            uniforms: {
                globalColor: gl.getUniformLocation(lineShader, 'uGlobalColor'),
                thickness: gl.getUniformLocation(lineShader, 'uThickness'),
                viewMatrix: gl.getUniformLocation(lineShader, 'uMatrix'),
            },
            attributes: {
                position: gl.getAttribLocation(lineShader, 'aPosition'),
                normal: gl.getAttribLocation(lineShader, 'aNormal'),
            },
        };

        this.phaseProgram = {
            shader: phaseShader,
            buffers: {
                vertices: gl.createBuffer(),
            },
            uniforms: {
                globalColor: gl.getUniformLocation(phaseShader, 'uGlobalColor'),
                thickness: gl.getUniformLocation(phaseShader, 'uThickness'),
                viewMatrix: gl.getUniformLocation(phaseShader, 'uMatrix'),
                rotateMatrix: gl.getUniformLocation(phaseShader, 'uRotate'),
            },
            attributes: {
                position: gl.getAttribLocation(phaseShader, 'aPosition'),
                normal: gl.getAttribLocation(phaseShader, 'aNormal'),
                miter: gl.getAttribLocation(phaseShader, 'aMiter'),
            },
        };

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // To disable the background color of the canvas element
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);

        const angle = -Math.PI / 4;
        const cosTheta = Math.cos(angle);
        const sinTheta = Math.sin(angle);
        const rotateMatrix = new Float32Array([
            cosTheta,
            sinTheta,
            0,
            -sinTheta,
            cosTheta,
            0,
            0,
            0,
            1,
        ]);

        gl.useProgram(this.phaseProgram.shader);
        gl.uniformMatrix3fv(
            this.phaseProgram.uniforms.rotateMatrix,
            false,
            rotateMatrix,
        );
        gl.uniform1f(this.phaseProgram.uniforms.thickness, 1.0);

        gl.useProgram(this.lineProgram.shader);
        gl.uniform1f(this.lineProgram.uniforms.thickness, 1.0);

        gl.useProgram(null);

        this.onResize();

        await this.initialize();

        this.phaseVertices = new Float32Array(10 * this.leftData.length);
    };

    drawConstantQBins = (radius: number, color: Float32Array): void => {
        if (!this.visualization.current || !this.renderingContext) {
            return;
        }
        let currentInput = 0;
        let currentSample = 0;
        let currentFraction = 0;

        this.cqVertices[0] = 0;
        this.cqVertices[1] = 0;

        // "resampling" constantQ from CQ_BINS to CIRCLE_SAMPLES using FIR
        while (currentSample < CIRCLE_SAMPLES && currentInput < this.CQ_BINS) {
            const index = currentFraction * this.SAMPLES_PER_CROSSING;
            const integralPart = Math.floor(index);
            const fractionalPart = index - integralPart;
            let sum = 0;
            for (
                let i = integralPart, j = this.HALF_CROSSINGS;
                i < this.FILTER_SIZE;
                i += this.SAMPLES_PER_CROSSING, j--
            ) {
                let input = currentInput + j;
                // treat like ring buffer
                if (input < 0) {
                    input += this.CQ_BINS;
                } else if (input >= this.CQ_BINS) {
                    input -= this.CQ_BINS;
                }
                const scale = this.vizBins[input];
                sum +=
                    scale *
                    (firLoader.coeffs[i] +
                        fractionalPart * firLoader.deltas[i]);
            }
            const result = radius + musicStore.get.volume() * sum * this.SCALE;
            let { x, y } = constantQ.angles[currentSample];
            x *= result;
            y *= result;

            this.cqVertices[2 + 2 * currentSample] = x;
            this.cqVertices[2 + 2 * currentSample + 1] = y;

            // update for next sample
            currentSample += 1;
            currentFraction += this.STEP_SIZE;
            if (currentFraction >= 1) {
                currentInput += 1;
                currentFraction -= 1;
            }
        }

        this.cqVertices[2 + CIRCLE_SAMPLES * 2] = this.cqVertices[2];
        this.cqVertices[2 + CIRCLE_SAMPLES * 2 + 1] = this.cqVertices[3];

        const gl = this.renderingContext;
        gl.useProgram(this.cqProgram.shader);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cqProgram.buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, this.cqVertices, gl.DYNAMIC_DRAW);

        const {
            globalColor: uGlobalColor,
            center: uCenter,
            radius: uRadius,
        } = this.cqProgram.uniforms;

        gl.uniform4fv(uGlobalColor, color);
        gl.uniform2fv(
            uCenter,
            new Float32Array([
                this.visualization.current.width / 2,
                this.visualization.current.height / 2 - this.internalOffset,
            ]),
        );
        gl.uniform1f(uRadius, 1 + radius * this.deviceRatio);

        const { vertices: aVertexPosition } = this.cqProgram.attributes;
        gl.enableVertexAttribArray(aVertexPosition);
        gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.cqVertices.length / 2);
    };

    drawWaveForm = (centerAxis: number, color: Float32Array): void => {
        const waveform = this.props.musicPlayer.waveform.waveform;
        const angles = this.props.musicPlayer.waveform.angles;
        if (!waveform || waveform.length === 0 || !this.renderingContext) {
            return;
        }

        const waveformLength = waveform.length / 2;
        const volumeHeightScale =
            musicStore.get.volume() * this.WAVEFORM_HALF_HEIGHT;
        if (
            !this.waveformVertices ||
            this.waveformVertices.length !== waveformLength * 4
        ) {
            this.waveformVertices = new Float32Array(waveformLength * 4);
        }
        // going through mins and maxes from start to end
        for (let j = 0; j < waveformLength; j++) {
            const minScale = centerAxis + waveform[j * 2] * volumeHeightScale;
            const maxScale =
                centerAxis + waveform[j * 2 + 1] * volumeHeightScale;
            const { x, y } = angles?.[j] || { x: 0, y: 0 };
            this.waveformVertices.set(
                [x * minScale, y * minScale, x * maxScale, y * maxScale],
                j * 4,
            );
        }

        const gl = this.renderingContext;
        gl.useProgram(this.genProgram.shader);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.genProgram.buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, this.waveformVertices, gl.DYNAMIC_DRAW);

        gl.uniform4fv(this.genProgram.uniforms.globalColor, color);

        gl.enableVertexAttribArray(this.genProgram.attributes.vertexPosition);
        gl.vertexAttribPointer(
            this.genProgram.attributes.vertexPosition,
            2,
            gl.FLOAT,
            false,
            0,
            0,
        );

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, waveformLength * 2);
    };

    drawPlaybackHead = (
        angle: number,
        minRad: number,
        maxRad: number,
        color: Float32Array,
    ): void => {
        if (!this.renderingContext) return;

        const [xStart, yStart] = polarToCartesian(minRad, angle);
        const [xEnd, yEnd] = polarToCartesian(maxRad, angle);

        let [dx, dy] = [xEnd - xStart, yEnd - yStart];
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;

        this.lineVertices.set(
            [
                xStart,
                yStart,
                -dy,
                dx,
                xStart,
                yStart,
                dy,
                -dx,
                xEnd,
                yEnd,
                -dy,
                dx,
                xEnd,
                yEnd,
                dy,
                -dx,
            ],
            0,
        );

        const gl = this.renderingContext;

        gl.useProgram(this.lineProgram.shader);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineProgram.buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, this.lineVertices, gl.DYNAMIC_DRAW);

        gl.enableVertexAttribArray(this.lineProgram.attributes.position);
        gl.enableVertexAttribArray(this.lineProgram.attributes.normal);
        gl.vertexAttribPointer(
            this.lineProgram.attributes.position,
            2,
            gl.FLOAT,
            false,
            4 * 4,
            0,
        );
        gl.vertexAttribPointer(
            this.lineProgram.attributes.normal,
            2,
            gl.FLOAT,
            false,
            4 * 4,
            2 * 4,
        );

        gl.uniform4fv(this.lineProgram.uniforms.globalColor, color);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    drawSeekArea = (radius: number, color: Float32Array): void => {
        const WAVEFORM_CENTER_AXIS = radius - this.WAVEFORM_HALF_HEIGHT;
        this.drawWaveForm(WAVEFORM_CENTER_AXIS, color);
        const currentPosition = this.props.musicPlayer.audio.currentTime;
        // interpolate playbackhead position with timestamp difference if audio object hasn't updated current position

        const duration = this.props.musicPlayer.audio.duration;
        const angle =
            currentPosition && duration
                ? Math.min((TWO_PI * currentPosition) / duration)
                : 0;
        const volume = musicStore.get.volume();
        this.drawPlaybackHead(
            angle,
            WAVEFORM_CENTER_AXIS - volume * this.WAVEFORM_HALF_HEIGHT,
            WAVEFORM_CENTER_AXIS + volume * this.WAVEFORM_HALF_HEIGHT,
            this.white,
        );
        const hoverAngle = musicStore.get.angle?.();
        if (musicStore.get.isHoverSeekring() && hoverAngle !== undefined) {
            this.drawPlaybackHead(
                hoverAngle,
                WAVEFORM_CENTER_AXIS - volume * this.WAVEFORM_HALF_HEIGHT,
                WAVEFORM_CENTER_AXIS + volume * this.WAVEFORM_HALF_HEIGHT,
                this.gray,
            );
        }
    };

    drawPhaseVerts = (verts: Float32Array, color: Float32Array) => {
        if (!this.renderingContext) return;
        const gl = this.renderingContext;
        gl.useProgram(this.phaseProgram.shader);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.phaseProgram.buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);

        gl.enableVertexAttribArray(this.phaseProgram.attributes.position);
        gl.enableVertexAttribArray(this.phaseProgram.attributes.normal);
        gl.enableVertexAttribArray(this.phaseProgram.attributes.miter);

        gl.vertexAttribPointer(
            this.phaseProgram.attributes.position,
            2,
            gl.FLOAT,
            false,
            4 * 5,
            0,
        );
        gl.vertexAttribPointer(
            this.phaseProgram.attributes.normal,
            2,
            gl.FLOAT,
            false,
            4 * 5,
            2 * 4,
        );
        gl.vertexAttribPointer(
            this.phaseProgram.attributes.miter,
            1,
            gl.FLOAT,
            false,
            4 * 5,
            4 * 4,
        );

        gl.uniform4fv(this.phaseProgram.uniforms.globalColor, color);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, verts.length / 5);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };

    drawPhase = (radius: number, color: Float32Array) => {
        if (!this.renderingContext) return;

        const tempArray: number[][] = [];
        for (let i = 0; i < this.leftData.length; i++) {
            // const x = this.leftData[i] * this.leftData[i] - this.rightData[i] * this.rightData[i];
            // const y = 2 * this.rightData[i] * this.leftData[i];
            const x = this.leftData[i];
            const y = this.rightData[i];
            // tempArray.push([x * 2 * radius, (y < 0) ? -y * 2 * radius : y *2 * radius]);
            tempArray.push([x * radius, y * radius]);
            // tempArray.push([0, i]);
        }
        const normalData = getNormals(tempArray);
        for (let i = 0; i < tempArray.length; i++) {
            this.phaseVertices.set(
                [
                    ...tempArray[i],
                    ...normalData[i][0],
                    normalData[i][1],
                    ...tempArray[i],
                    -normalData[i][0][0],
                    -normalData[i][0][1],
                    normalData[i][1],
                ],
                10 * i,
            );
        }

        const verts = this.phaseVertices;
        this.history.push(verts);
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
        }

        let i = 1;
        for (const phase of this.history) {
            // color[3] = Math.pow(0.8, maxLength - i);
            color[3] = (i / this.maxHistoryLength) ** 4;
            this.drawPhaseVerts(phase, color);
            i++;
        }
    };

    drawVisualization = (lowFreq: number, lightness: number): void => {
        if (!this.visualization.current || !this.renderingContext) {
            return;
        }
        // beware! we are rotating the whole thing by -half_pi so, we need to swap width and height values
        // context.clearRect(-this.height / 2 + this.HEIGHT_ADJUST, -this.width / 2, this.height, this.width);
        // hsl derived from @light-blue: #4E86A4;
        const hslString = hsl(
            201,
            (36 + lightness * 64) / 100,
            (47 + lightness * 53) / 100,
        );
        const color = parseToRgb(hslString);
        this.colorArray.set([
            color.red / 255,
            color.green / 255,
            color.blue / 255,
            1.0,
        ]);

        // adjust large radius to change with the average of all values
        const radius = this.RADIUS_BASE + lowFreq * this.RADIUS_SCALE;
        this.props.setRadii({
            inner: radius - 2 * this.WAVEFORM_HALF_HEIGHT,
            outer: radius,
            base: this.RADIUS_BASE,
        });

        const gl = this.renderingContext;

        gl.viewport(
            0,
            0,
            this.visualization.current.width,
            this.visualization.current.height,
        );
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.drawConstantQBins(radius, this.colorArray);
        this.drawSeekArea(radius, this.colorArray);
        !this.props.isMobile &&
            this.drawPhase(this.RADIUS_BASE, this.colorArray);
    };

    onResize = (): void => {
        this.idleStart = performance.now();
        this.adjustHeight();

        if (
            !this.container.current ||
            !this.visualization.current ||
            !this.renderingContext
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
            0,
            (2 * devicePixelRatio) / this.visualization.current.height,
            0,
            (2 * devicePixelRatio) / this.visualization.current.width,
            0,
            0,
            0,
            (-2 * devicePixelRatio * this.HEIGHT_ADJUST) /
                this.visualization.current.height,
            1,
        ]);

        const gl = this.renderingContext;

        gl.useProgram(this.cqProgram.shader);
        gl.uniformMatrix3fv(
            this.cqProgram.uniforms.viewMatrix,
            false,
            this.viewMatrix,
        );

        gl.useProgram(this.genProgram.shader);
        gl.uniformMatrix3fv(
            this.genProgram.uniforms.viewMatrix,
            false,
            this.viewMatrix,
        );

        gl.useProgram(this.lineProgram.shader);
        gl.uniformMatrix3fv(
            this.lineProgram.uniforms.viewMatrix,
            false,
            this.viewMatrix,
        );

        gl.useProgram(this.phaseProgram.shader);
        gl.uniformMatrix3fv(
            this.phaseProgram.uniforms.viewMatrix,
            false,
            this.viewMatrix,
        );

        this.internalOffset = this.HEIGHT_ADJUST * devicePixelRatio;
        this.deviceRatio = devicePixelRatio;

        this.RADIUS_SCALE = Math.min(this.width, this.height) / 12;
        this.RADIUS_BASE =
            Math.min(centerX, centerY) - (this.RADIUS_SCALE * 3) / 4;
        this.WAVEFORM_HALF_HEIGHT = Math.min(50, this.RADIUS_BASE / 4);

        if (!this.isRendering) {
            gsap.ticker.add(this.onAnalyze);
            this.isRendering = true;
        }
    };
}

export const Component = AudioVisualizer;

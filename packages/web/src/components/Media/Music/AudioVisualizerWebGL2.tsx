import { gsap } from 'gsap';
import { parseToRgb } from 'polished';
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
import { polarToCartesian } from 'src/components/Media/Music/utils';
import { initShader } from 'src/components/Media/Music/webGLHelpers';
import {
    cqFragWebGL2,
    genFrag,
    genVert,
    lineVert,
    phaseVert,
} from './shadersGL2.js';

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
    vertexArray: WebGLVertexArrayObject | null;
}

class AudioVisualizer extends AudioVisualizerBase<WebGL2RenderingContext> {
    cqProgram!: ShaderProgram;
    genProgram!: ShaderProgram;
    lineProgram!: ShaderProgram;
    phaseProgram!: ShaderProgram;

    viewMatrix!: Float32Array;

    internalOffset!: number;
    deviceRatio!: number;

    initializeVisualizer = async (): Promise<void> => {
        if (!this.visualization.current) {
            console.error('visualization element does not exist.');
            return;
        }
        const gl = this.visualization.current.getContext('webgl2', {
            antialias: true,
            alpha: false,
        });
        if (!gl) {
            console.error('no WebGL context.');
            return;
        }
        this.renderingContext = gl;

        const cqShader = initShader(gl, genVert, cqFragWebGL2);
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
            vertexArray: gl.createVertexArray(),
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
            vertexArray: gl.createVertexArray(),
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
            vertexArray: gl.createVertexArray(),
        };

        this.phaseProgram = {
            shader: phaseShader,
            buffers: {
                vertices: gl.createBuffer(),
            },
            uniforms: {
                globalColor: gl.getUniformLocation(
                    phaseShader,
                    'uGlobalColor',
                ),
                thickness: gl.getUniformLocation(phaseShader, 'uThickness'),
                viewMatrix: gl.getUniformLocation(phaseShader, 'uMatrix'),
                rotateMatrix: gl.getUniformLocation(phaseShader, 'uRotate'),
            },
            attributes: {
                position: gl.getAttribLocation(phaseShader, 'aPosition'),
                normal: gl.getAttribLocation(phaseShader, 'aNormal'),
                miter: gl.getAttribLocation(phaseShader, 'aMiter'),
            },
            vertexArray: gl.createVertexArray(),
        };

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cqProgram.buffers.vertices);
        gl.bindVertexArray(this.cqProgram.vertexArray);
        gl.enableVertexAttribArray(this.cqProgram.attributes.vertexPosition);
        gl.vertexAttribPointer(
            this.cqProgram.attributes.vertexPosition,
            2,
            gl.FLOAT,
            false,
            0,
            0,
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, this.genProgram.buffers.vertices);
        gl.bindVertexArray(this.genProgram.vertexArray);
        gl.enableVertexAttribArray(this.genProgram.attributes.vertexPosition);
        gl.vertexAttribPointer(
            this.genProgram.attributes.vertexPosition,
            2,
            gl.FLOAT,
            false,
            0,
            0,
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineProgram.buffers.vertices);
        gl.bindVertexArray(this.lineProgram.vertexArray);
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

        gl.bindBuffer(gl.ARRAY_BUFFER, this.phaseProgram.buffers.vertices);
        gl.bindVertexArray(this.phaseProgram.vertexArray);
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

        gl.bindVertexArray(null);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

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
    };

    drawConstantQBins = (radius: number, color: Float32Array): void => {
        if (!this.visualization.current || !this.renderingContext) {
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

        const gl = this.renderingContext;

        gl.useProgram(this.cqProgram.shader);

        gl.bindVertexArray(this.cqProgram.vertexArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cqProgram.buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

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

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);

        gl.bindVertexArray(null);
    };

    drawWaveForm = (centerAxis: number, color: Float32Array): void => {
        const waveform = this.props.musicPlayer.getCurrentWaveform().waveform;
        const angles = this.props.musicPlayer.getCurrentWaveform().angles;
        if (!waveform || waveform.length === 0 || !this.renderingContext) {
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

        const gl = this.renderingContext;

        gl.useProgram(this.genProgram.shader);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.genProgram.buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

        gl.uniform4fv(this.genProgram.uniforms.globalColor, color);

        gl.bindVertexArray(this.genProgram.vertexArray);

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

        const verts = new Float32Array([
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
        ]);

        const gl = this.renderingContext;

        gl.useProgram(this.lineProgram.shader);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineProgram.buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);

        gl.bindVertexArray(this.lineProgram.vertexArray);

        gl.uniform4fv(this.lineProgram.uniforms.globalColor, color);
        gl.uniform1f(this.lineProgram.uniforms.thickness, 1.0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
        gl.bindVertexArray(null);
    };

    drawSeekArea = (
        radius: number,
        color: Float32Array,
        timestamp: number,
    ): void => {
        if (!this.renderingContext) return;
        const WAVEFORM_CENTER_AXIS = radius - this.WAVEFORM_HALF_HEIGHT;
        this.drawWaveForm(WAVEFORM_CENTER_AXIS, color);

        // interpolate playbackhead position with timestamp difference if audio object hasn't updated current position
        let playbackHead = this.props.currentPosition;
        if (
            this.props.currentPosition &&
            this.props.currentPosition === this.lastPlayheadPosition &&
            this.props.isPlaying
        ) {
            playbackHead =
                this.props.currentPosition +
                (timestamp - this.lastPositionUpdateTimestamp) / 1000;
        } else {
            this.lastPlayheadPosition = this.props.currentPosition;
        }

        const angle =
            playbackHead && this.props.duration
                ? Math.min(TWO_PI, TWO_PI * playbackHead / this.props.duration)
                : 0;

        this.drawPlaybackHead(
            angle,
            WAVEFORM_CENTER_AXIS -
                this.props.volume * this.WAVEFORM_HALF_HEIGHT,
            WAVEFORM_CENTER_AXIS +
                this.props.volume * this.WAVEFORM_HALF_HEIGHT,
            new Float32Array([1.0, 1.0, 1.0, 1.0]),
        );
        if (this.props.isHoverSeekring && this.props.hoverAngle !== undefined) {
            this.drawPlaybackHead(
                this.props.hoverAngle,
                WAVEFORM_CENTER_AXIS -
                    this.props.volume * this.WAVEFORM_HALF_HEIGHT,
                WAVEFORM_CENTER_AXIS +
                    this.props.volume * this.WAVEFORM_HALF_HEIGHT,
                new Float32Array([0.5, 0.5, 0.5, 1.0]),
            );
        }
    };

    drawPhaseVerts = (verts: Float32Array, color: Float32Array) => {
        if (!this.renderingContext) return;
        const gl = this.renderingContext;
        gl.useProgram(this.phaseProgram.shader);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.phaseProgram.buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);

        gl.bindVertexArray(this.phaseProgram.vertexArray);

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
        const vertsArray: number[] = [];
        for (let i = 0; i < tempArray.length; i++) {
            vertsArray.push(
                ...tempArray[i],
                ...normalData[i][0],
                normalData[i][1],
            );
            vertsArray.push(
                ...tempArray[i],
                -normalData[i][0][0],
                -normalData[i][0][1],
                normalData[i][1],
            );
        }

        if (this.props.isMobile) {
            this.drawPhaseVerts(new Float32Array(vertsArray), color);
        } else {
            const verts = new Float32Array(vertsArray);
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
        }
    };

    drawVisualization = (
        lowFreq: number,
        lightness: number,
        timestamp: number,
    ): void => {
        if (!this.visualization.current || !this.renderingContext) {
            return;
        }

        // beware! we are rotating the whole thing by -half_pi so, we need to swap width and height values
        // context.clearRect(-this.height / 2 + this.HEIGHT_ADJUST, -this.width / 2, this.height, this.width);
        // hsl derived from @light-blue: #4E86A4;
        const hsl = `hsl(201, ${Math.round(36 + lightness * 64)}%, ${Math.round(
            47 + lightness * 53,
        )}%)`;
        const color = parseToRgb(hsl);
        const colorArray = new Float32Array([
            color.red / 255,
            color.green / 255,
            color.blue / 255,
            1.0,
        ]);

        // adjust large radius to change with the average of all values
        const radius = this.RADIUS_BASE + lowFreq * this.RADIUS_SCALE;
        this.props.setRadii(
            radius - 2 * this.WAVEFORM_HALF_HEIGHT,
            radius,
            this.RADIUS_BASE,
        );

        const gl = this.renderingContext;

        gl.viewport(
            0,
            0,
            this.visualization.current.width,
            this.visualization.current.height,
        );
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.drawConstantQBins(radius, colorArray);
        this.drawSeekArea(radius, colorArray, timestamp);
        this.drawPhase(this.RADIUS_BASE, colorArray);
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

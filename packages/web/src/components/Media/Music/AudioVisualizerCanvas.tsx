import { gsap } from 'gsap';
import { hsl, opacify } from 'polished';

import {
    AudioVisualizerBase,
    HALF_PI,
    TWO_PI,
} from 'src/components/Media/Music/AudioVisualizerBase';
import { polarToCartesian } from 'src/components/Media/Music/utils';
import {
    CIRCLE_SAMPLES,
    constantQ,
    drawCircleMask,
    firLoader,
} from 'src/components/Media/Music/VisualizationUtils';

declare global {
    interface CanvasRenderingContext2D {
        webkitBackingStorePixelRatio?: number;
        mozBackingStorePixelRatio?: number;
        msBackingStorePixelRatio?: number;
        oBackingStorePixelRatio?: number;
        backingStorePixelRatio?: number;
    }
}

class AudioVisualizer extends AudioVisualizerBase<CanvasRenderingContext2D> {
    pixelScaling!: number;

    initializeVisualizer = async (): Promise<void> => {
        if (this.visualization.current) {
            this.renderingContext = this.visualization.current.getContext('2d');
            this.renderingContext?.save();
        }

        this.onResize();

        await this.initialize();
    };

    drawConstantQBins = (radius: number, color: string): void => {
        if (!this.renderingContext) return;
        this.renderingContext.save();
        this.renderingContext.beginPath();
        let currentInput = 0;
        let currentSample = 0;
        let currentFraction = 0;

        // "resampling" constantQ from CQ_BINS to CIRCLE_SAMPLES using FIR
        while (currentSample < CIRCLE_SAMPLES && currentInput < this.CQ_BINS) {
            const index = currentFraction * this.SAMPLES_PER_CROSSING;
            const integralPart = Math.floor(index);
            const fractionalPart = index - integralPart;
            let sum = 0;
            for (
                let i = integralPart, j = this.HALF_CROSSINGS;
                i < this.FILTER_SIZE;
                i += this.SAMPLES_PER_CROSSING, j = j - 1
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

            // if first sample, use moveTo instead of lineTo
            if (currentSample === 0) {
                this.renderingContext.moveTo(x, y);
            } else {
                this.renderingContext.lineTo(x, y);
            }

            // update for next sample
            currentSample += 1;
            currentFraction += this.STEP_SIZE;
            if (currentFraction >= 1) {
                currentInput += 1;
                currentFraction -= 1;
            }
        }
        this.renderingContext.fillStyle = color;
        this.renderingContext.fill();
        this.renderingContext.restore();
    };

    drawWaveForm = (centerAxis: number, color: string): void => {
        const waveform = this.props.musicPlayer.getCurrentWaveform().waveform;
        const angles = this.props.musicPlayer.getCurrentWaveform().angles;
        if (!waveform || waveform.length === 0 || !this.renderingContext) {
            return;
        }

        const waveformLength = waveform.length / 2;
        const volumeHeightScale = this.props.volume * this.WAVEFORM_HALF_HEIGHT;
        this.renderingContext.save();
        this.renderingContext.beginPath();
        // going through mins from start to end
        for (let j = 0; j < waveformLength; j++) {
            const scale = centerAxis + waveform[j * 2] * volumeHeightScale;
            let { x, y } = angles?.[j] || { x: 0, y: 0 };
            x *= scale;
            y *= scale;

            if (j === 0) {
                this.renderingContext.moveTo(x, y);
            } else {
                this.renderingContext.lineTo(x, y);
            }
        }

        // looping around maxes from end to start
        for (let j = waveformLength - 1; j >= 0; j--) {
            const scale = centerAxis + waveform[j * 2 + 1] * volumeHeightScale;
            let { x, y } = angles?.[j] || { x: 0, y: 0 };
            x *= scale;
            y *= scale;

            this.renderingContext.lineTo(x, y);
        }
        this.renderingContext.fillStyle = color;
        this.renderingContext.fill();
        this.renderingContext.restore();
    };

    drawPlaybackHead = (
        angle: number,
        minRad: number,
        maxRad: number,
        color: string,
    ): void => {
        if (!this.renderingContext) return;
        const [xStart, yStart] = polarToCartesian(minRad, angle);
        const [xEnd, yEnd] = polarToCartesian(maxRad, angle);
        this.renderingContext.save();
        this.renderingContext.beginPath();
        this.renderingContext.moveTo(xStart, yStart);
        this.renderingContext.lineTo(xEnd, yEnd);
        this.renderingContext.strokeStyle = color;
        this.renderingContext.stroke();
        this.renderingContext.restore();
    };

    drawSeekArea = (radius: number, color: string, timestamp: number): void => {
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
            this.props.currentPosition && this.props.duration
                ? Math.min(TWO_PI * playbackHead / this.props.duration)
                : 0;
        this.drawPlaybackHead(
            angle,
            WAVEFORM_CENTER_AXIS -
                this.props.volume * this.WAVEFORM_HALF_HEIGHT,
            WAVEFORM_CENTER_AXIS +
                this.props.volume * this.WAVEFORM_HALF_HEIGHT,
            '#FFF',
        );
        if (this.props.isHoverSeekring && this.props.hoverAngle !== undefined) {
            this.drawPlaybackHead(
                this.props.hoverAngle,
                WAVEFORM_CENTER_AXIS -
                    this.props.volume * this.WAVEFORM_HALF_HEIGHT,
                WAVEFORM_CENTER_AXIS +
                    this.props.volume * this.WAVEFORM_HALF_HEIGHT,
                '#888',
            );
        }
    };

    drawPhaseVerts = (verts: Float32Array, color: string) => {
        if (!this.renderingContext) return;
        this.renderingContext.fillStyle = 'rgba(0, 0, 0, 0)';
        this.renderingContext.strokeStyle = color;
        this.renderingContext.lineWidth = 1.0;
        this.renderingContext.beginPath();
        this.renderingContext.moveTo(verts[0], verts[1]);

        for (let i = 2; i < verts.length; i += 2) {
            this.renderingContext.lineTo(verts[i], verts[i + 1]);
        }

        this.renderingContext.stroke();
    };

    drawPhase = (radius: number, color: string): void => {
        if (!this.renderingContext) return;

        const verts: number[] = [];

        for (let i = 1; i < this.leftData.length; i++) {
            verts.push(this.rightData[i] * radius, this.leftData[i] * radius);
        }

        this.renderingContext.save();
        this.renderingContext.rotate(-Math.PI / 4.0);

        if (this.props.isMobile) {
            this.drawPhaseVerts(new Float32Array(verts), color);
        } else {
            this.history.push(new Float32Array(verts));
            if (this.history.length > this.maxHistoryLength) {
                this.history.shift();
            }

            let i = 1;
            for (const phase of this.history) {
                // color[3] = Math.pow(0.8, maxLength - i);
                const opacified = opacify((i / this.maxHistoryLength) ** 4)(
                    color,
                );
                this.drawPhaseVerts(phase, opacified);
                i++;
            }
        }
        this.renderingContext.restore();
    };

    drawVisualization = (
        lowFreq: number,
        lightness: number,
        timestamp: number,
    ): void => {
        if (!this.renderingContext) return;
        // beware! we are rotating the whole thing by -half_pi so, we need to swap width and height values
        this.renderingContext.clearRect(
            -this.height / 2 + this.HEIGHT_ADJUST,
            -this.width / 2,
            this.height,
            this.width,
        );
        // hsl derived from @light-blue: #4E86A4;
        const color = hsl(
            201,
            (36 + lightness * 64) / 100,
            (47 + lightness * 53) / 100,
        );
        // adjust large radius to change with the average of all values
        const radius = this.RADIUS_BASE + lowFreq * this.RADIUS_SCALE;
        this.props.setRadii(
            radius - 2 * this.WAVEFORM_HALF_HEIGHT,
            radius,
            this.RADIUS_BASE,
        );

        this.drawConstantQBins(radius, color);
        drawCircleMask(this.renderingContext, radius + 0.25, [
            this.width,
            this.height,
        ]);
        this.drawSeekArea(radius, color, timestamp);
        this.drawPhase(this.RADIUS_BASE, opacify(0.5)(color));
    };

    onResize = (): void => {
        this.idleStart = performance.now();
        this.adjustHeight();

        this.renderingContext?.restore();
        this.renderingContext?.save();

        // scale canvas for high-resolution screens
        // code from https://gist.github.com/callumlocke/cc258a193839691f60dd
        const devicePixelRatio = window.devicePixelRatio || 1;
        const anyCtx: CanvasRenderingContext2D | null = this.renderingContext;
        if (
            !anyCtx ||
            !this.container.current ||
            !this.visualization.current ||
            !this.renderingContext
        ) {
            return;
        }
        const backingStoreRatio =
            anyCtx.webkitBackingStorePixelRatio ||
            anyCtx.mozBackingStorePixelRatio ||
            anyCtx.msBackingStorePixelRatio ||
            anyCtx.oBackingStorePixelRatio ||
            anyCtx.backingStorePixelRatio ||
            1;

        const ratio = devicePixelRatio / backingStoreRatio;

        this.height = this.container.current.offsetHeight;
        this.width = this.container.current.offsetWidth;
        if (devicePixelRatio !== backingStoreRatio) {
            this.visualization.current.height = this.height * ratio;
            this.visualization.current.width = this.width * ratio;
            this.visualization.current.style.width = `${this.width}px`;
            this.visualization.current.style.height = `${this.height}px`;
            this.pixelScaling = ratio;
            this.renderingContext.scale(ratio, ratio);
        } else {
            this.visualization.current.height = this.height;
            this.visualization.current.width = this.width;
            this.visualization.current.style.width = '';
            this.visualization.current.style.height = '';
        }

        const centerX = this.width / 2;
        const centerY = this.height / 2 + this.HEIGHT_ADJUST;

        // rotate so 0rad is up top
        this.renderingContext.rotate(-HALF_PI);
        // move so center is in center of canvas element (but since we rotated already,
        // we also need to rotate our translate [centerX, centerY] => [-centerY, centerX]
        this.renderingContext.translate(-centerY, centerX);

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

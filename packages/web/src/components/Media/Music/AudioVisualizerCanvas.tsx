import { gsap } from 'gsap';

import {
    AudioVisualizerBase,
    HALF_PI,
    TWO_PI,
} from 'src/components/Media/Music/AudioVisualizerBase';

import { polarToCartesian } from 'src/components/Media/Music/utils';
import { CIRCLE_SAMPLES, constantQ, drawCircleMask, firLoader, waveformLoader } from 'src/components/Media/Music/VisualizationUtils';

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

    initializeVisualizer = async (): Promise<void> => {
        if (this.visualization.current) {
            this.renderingContext = this.visualization.current.getContext('2d');
            this.renderingContext?.save();
        }

        this.onResize();

        await this.initialize();
    };

    drawConstantQBins = (context: CanvasRenderingContext2D, values: Float32Array, radius: number, color: string): void => {
        context.beginPath();
        let currentInput = 0;
        let currentSample = 0;
        let currentFraction = 0;

        // "resampling" constantQ from CQ_BINS to CIRCLE_SAMPLES using FIR
        while (currentSample < CIRCLE_SAMPLES && currentInput < this.CQ_BINS) {
            const index = currentFraction * this.SAMPLES_PER_CROSSING;
            const integralPart = Math.floor(index);
            const fractionalPart = index - integralPart;
            let sum = 0;
            for (let i = integralPart, j = this.HALF_CROSSINGS; i < this.FILTER_SIZE; i += this.SAMPLES_PER_CROSSING, j = j - 1) {
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

            // if first sample, use moveTo instead of lineTo
            if (currentSample === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }

            // update for next sample
            currentSample += 1;
            currentFraction += this.STEP_SIZE;
            if (currentFraction >= 1) {
                currentInput += 1;
                currentFraction -= 1;
            }
        }
        context.fillStyle = color;
        context.fill();
    };

    drawWaveForm = (context: CanvasRenderingContext2D, centerAxis: number, color: string): void => {
        const waveform = waveformLoader.waveform;
        const angles = waveformLoader.angles;
        if (!waveform || waveform.length === 0) {
            return;
        }

        const waveformLength = waveform.length / 2;
        const volumeHeightScale = this.props.volume * this.WAVEFORM_HALF_HEIGHT;
        context.beginPath();
        // going through mins from start to end
        for (let j = 0; j < waveformLength; j++) {
            const scale = centerAxis + waveform[j * 2] * volumeHeightScale;
            let { x, y } = angles?.[j] || { x: 0, y: 0 };
            x *= scale;
            y *= scale;

            if (j === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }

        // looping around maxes from end to start
        for (let j = waveformLength - 1; j >= 0; j--) {
            const scale = centerAxis + waveform[j * 2 + 1] * volumeHeightScale;
            let { x, y } = angles?.[j] || { x: 0, y: 0 };
            x *= scale;
            y *= scale;

            context.lineTo(x, y);
        }
        context.fillStyle = color;
        context.fill();
    };

    drawPlaybackHead = (context: CanvasRenderingContext2D, angle: number, minRad: number, maxRad: number, color: string): void => {
        const [xStart, yStart] = polarToCartesian(minRad, angle);
        const [xEnd, yEnd] = polarToCartesian(maxRad, angle);
        context.beginPath();
        context.moveTo(xStart, yStart);
        context.lineTo(xEnd, yEnd);
        context.strokeStyle = color;
        context.stroke();
    };

    drawSeekArea = (context: CanvasRenderingContext2D, radius: number, color: string, timestamp: number): void => {
        const WAVEFORM_CENTER_AXIS = radius - this.WAVEFORM_HALF_HEIGHT;
        this.drawWaveForm(context, WAVEFORM_CENTER_AXIS, color);

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
            context,
            angle,
            WAVEFORM_CENTER_AXIS - this.props.volume * this.WAVEFORM_HALF_HEIGHT,
            WAVEFORM_CENTER_AXIS + this.props.volume * this.WAVEFORM_HALF_HEIGHT,
            '#FFF',
        );
        if (this.props.isHoverSeekring && this.props.hoverAngle !== undefined) {
            this.drawPlaybackHead(
                context,
                this.props.hoverAngle,
                WAVEFORM_CENTER_AXIS - this.props.volume * this.WAVEFORM_HALF_HEIGHT,
                WAVEFORM_CENTER_AXIS + this.props.volume * this.WAVEFORM_HALF_HEIGHT,
                '#888',
            );
        }
    };

    drawVisualization = (context: CanvasRenderingContext2D, lowFreq: number, values: Float32Array, lightness: number, timestamp: number): void => {
        // beware! we are rotating the whole thing by -half_pi so, we need to swap width and height values
        context.clearRect(-this.height / 2 + this.HEIGHT_ADJUST, -this.width / 2, this.height, this.width);
        // hsl derived from @light-blue: #4E86A4;
        const color = `hsl(201, ${36 + lightness * 64}%, ${47 + lightness * 53}%)`;
        // adjust large radius to change with the average of all values
        const radius = this.RADIUS_BASE + lowFreq * this.RADIUS_SCALE;
        this.props.setRadii(radius - 2 * this.WAVEFORM_HALF_HEIGHT, radius, this.RADIUS_BASE);

        this.drawConstantQBins(context, values, radius, color);
        drawCircleMask(context, radius + 0.25, [this.width, this.height]);
        this.drawSeekArea(context, radius, color, timestamp);
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
        const backingStoreRatio = anyCtx.webkitBackingStorePixelRatio ||
            anyCtx.mozBackingStorePixelRatio ||
            anyCtx.msBackingStorePixelRatio ||
            anyCtx.oBackingStorePixelRatio ||
            anyCtx.backingStorePixelRatio || 1;

        const ratio = devicePixelRatio / backingStoreRatio;

        this.height = this.container.current.offsetHeight;
        this.width = this.container.current.offsetWidth;
        if (devicePixelRatio !== backingStoreRatio) {
            this.visualization.current.height = this.height * ratio;
            this.visualization.current.width = this.width * ratio;
            this.visualization.current.style.width = `${this.width}px`;
            this.visualization.current.style.height = `${this.height}px`;
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
        this.RADIUS_BASE = Math.min(centerX, centerY) - this.RADIUS_SCALE * 3 / 4;
        this.WAVEFORM_HALF_HEIGHT = Math.min(50, this.RADIUS_BASE / 4);

        if (!this.isRendering) {
            gsap.ticker.add(this.onAnalyze);
            this.isRendering = true;
        }
    };
}

export const Component = AudioVisualizer;

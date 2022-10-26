import * as React from 'react';

import { gsap } from 'gsap';

import {
    AudioVisualizerProps,
    HALF_PI,
    HEIGHT_ADJUST_DESKTOP,
    HEIGHT_ADJUST_MOBILE,
    HIGH_FREQ_SCALE,
    MOBILE_MSPF,
    SCALE_DESKTOP,
    SCALE_MOBILE,
    TWO_PI,
    VisualizerCanvas,
    VisualizerContainer,
} from 'src/components/Media/Music/audioVisualizerBase';

import { polarToCartesian, visibilityChangeApi } from 'src/components/Media/Music/utils';
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

class AudioVisualizer extends React.Component<AudioVisualizerProps> {
    isRendering!: boolean;
    lastPlayheadPosition = 0;
    height!: number;
    width!: number;
    visualization: React.RefObject<HTMLCanvasElement> = React.createRef();
    container: React.RefObject<HTMLDivElement> = React.createRef();
    SCALE!: number;
    RADIUS_SCALE!: number;
    RADIUS_BASE!: number;
    WAVEFORM_HALF_HEIGHT!: number;
    HEIGHT_ADJUST!: number;
    visualizationCtx: CanvasRenderingContext2D | null = null;

    frequencyData!: Uint8Array;
    FFT_HALF_SIZE!: number;
    CQ_BINS!: number;
    INV_CQ_BINS!: number;

    normalizedL!: Float32Array;
    normalizedR!: Float32Array;
    vizBins!: Float32Array;

    MAX_BIN!: number;
    HIGH_PASS_BIN!: number;
    LOW_PASS_BIN!: number;

    NUM_CROSSINGS!: number;
    SAMPLES_PER_CROSSING!: number;
    HALF_CROSSINGS!: number;
    FILTER_SIZE!: number;

    STEP_SIZE!: number;
    lastIsHover = false;
    lastHover?: number = 0;
    lastCurrentPosition = 0;
    idleStart = 0;
    requestId = 0;
    lastCallback?: number;

    adjustHeight = (): void => {
        this.HEIGHT_ADJUST = this.props.isMobile ? HEIGHT_ADJUST_MOBILE : HEIGHT_ADJUST_DESKTOP;
        this.SCALE = this.props.isMobile ? SCALE_MOBILE : SCALE_DESKTOP;
    }

    initializeVisualizer = async (): Promise<void> => {
        if (this.visualization.current) {
            this.visualizationCtx = this.visualization.current.getContext('2d');
            this.visualizationCtx?.save();
        }

        this.onResize();

        try {
            await Promise.all([constantQ.loaded, firLoader.loaded]);

            this.FFT_HALF_SIZE = constantQ.numRows;
            this.frequencyData = new Uint8Array(this.FFT_HALF_SIZE);
            this.CQ_BINS = constantQ.numCols * 2;
            this.INV_CQ_BINS = 1 / this.CQ_BINS;

            // set MaxDesiredFreq to 22050 (nyquist limit of 44.1k).
            // Therefore the bin of MaxDesiredFreq must be 22050/(sr/2) percent of total bin_size.
            // bin number of MaxFreq = numBins * MaxDesiredFreq / AbsMaxFreq
            const sr2 = constantQ.sampleRate / 2;
            this.MAX_BIN = Math.round(this.FFT_HALF_SIZE * 22050 / sr2);
            this.HIGH_PASS_BIN = Math.round(constantQ.maxF * this.FFT_HALF_SIZE / sr2);
            this.LOW_PASS_BIN = Math.round(constantQ.minF * this.FFT_HALF_SIZE / sr2);

            this.NUM_CROSSINGS = firLoader.numCrossings;
            this.SAMPLES_PER_CROSSING = firLoader.samplesPerCrossing;
            this.HALF_CROSSINGS = firLoader.halfCrossings;
            this.FILTER_SIZE = firLoader.filterSize;
            this.STEP_SIZE = this.CQ_BINS / CIRCLE_SAMPLES;
            // create visualization arrays here instead of new ones each loop
            // saves on overhead/allocation
            this.vizBins = new Float32Array(this.CQ_BINS);
            this.normalizedL = new Float32Array(this.FFT_HALF_SIZE);
            this.normalizedR = new Float32Array(this.FFT_HALF_SIZE);
            this.idleStart = performance.now();

            gsap.ticker.add(this.onAnalyze);
            this.isRendering = true;
        } catch (err) {
            console.error('visualizer init failed.', err);
        }
    }

    onAnalyze = (): void => {
        // this.requestId = requestAnimationFrame(this.onAnalyze);
        // don't render anything if analyzers are null, i.e. audio not set up yet
        // also limit 30fps on mobile =).
        const timestamp = performance.now();
        if (this.props.isMobile && this.lastCallback && (timestamp - this.lastCallback) < MOBILE_MSPF) {
            return;
        } else if (!(this.props.analyzerL && this.props.analyzerR) || !this.visualizationCtx) {
            return;
        } else {
            if (this.props.isMobile) {
                if (this.lastCallback) {
                    const timeAdjusted = (timestamp - this.lastCallback) % MOBILE_MSPF;
                    this.lastCallback = timestamp - timeAdjusted;
                } else {
                    this.lastCallback = timestamp;
                }
            }

            if (!this.props.isPlaying) {
                // reset idleStart time if either hover, hoverangle, or currPos changes
                if (this.lastIsHover !== this.props.isHoverSeekring ||
                    this.lastCurrentPosition !== this.props.currentPosition ||
                    this.lastHover !== this.props.hoverAngle
                ) {
                    this.idleStart = timestamp;
                }
                // update hover, hoverangle, currPos (no effect obviously if no change)
                this.lastIsHover = this.props.isHoverSeekring;
                this.lastHover = this.props.hoverAngle;
                this.lastCurrentPosition = this.props.currentPosition;
                // if has been idle for over 3.5 seconds, cancel animation
                if (this.idleStart !== 0 && (timestamp - this.idleStart > 3500)) {
                    gsap.ticker.remove(this.onAnalyze);
                    this.isRendering = false;
                    return;
                }
            }

            // accumulators
            const lowFreqs = {
                l: 0,
                r: 0,
            };

            const highFreqs = {
                l: 0,
                r: 0,
            };

            // get byte data, and store into normalized[L,R], while accumulating
            this.props.analyzerL.getByteFrequencyData(this.frequencyData);
            this.normalizedL?.forEach((_, index, arr) => {
                if (this.frequencyData && this.MAX_BIN && this.HIGH_PASS_BIN) {
                    const temp = this.frequencyData[index] / 255;
                    arr[index] = temp;
                    // accumulate
                    if (index < this.MAX_BIN) {
                        index && (lowFreqs.l += temp);
                        (index >= this.HIGH_PASS_BIN) && (highFreqs.l += temp);
                    }
                }
            });

            this.props.analyzerR.getByteFrequencyData(this.frequencyData);
            this.normalizedR?.forEach((_, index, arr) => {
                if (this.frequencyData && this.MAX_BIN && this.HIGH_PASS_BIN) {
                    const temp = this.frequencyData[index] / 255;
                    arr[index] = temp;
                    // accumulate
                    if (index < this.MAX_BIN) {
                        index && (lowFreqs.r += temp);
                        (index >= this.HIGH_PASS_BIN) && (highFreqs.r += temp);
                    }
                }
            });
            // FFT -> CQ
            const resultL = constantQ.apply(this.normalizedL);
            const resultR = constantQ.apply(this.normalizedR).reverse();

            // concat the results, store in vizBins
            this.vizBins.set(resultL);
            this.vizBins.set(resultR, resultL.length);

            // Average left and right for each high and low accumulator, and divide by number of bins
            let highFreq = (highFreqs.l + highFreqs.r) / (2 * (this.MAX_BIN - this.HIGH_PASS_BIN));
            const lowFreq = (lowFreqs.l + lowFreqs.r) / (2 * this.HIGH_PASS_BIN);
            highFreq = HIGH_FREQ_SCALE * highFreq;

            this.drawVisualization(this.visualizationCtx, lowFreq, this.vizBins, highFreq, timestamp);
        }
    }

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
    }

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
    }

    drawPlaybackHead = (context: CanvasRenderingContext2D, angle: number, minRad: number, maxRad: number, color: string): void => {
        const [xStart, yStart] = polarToCartesian(minRad, angle);
        const [xEnd, yEnd] = polarToCartesian(maxRad, angle);
        context.beginPath();
        context.moveTo(xStart, yStart);
        context.lineTo(xEnd, yEnd);
        context.strokeStyle = color;
        context.stroke();
    }

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
    }

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
    }

    onResize = (): void => {
        this.idleStart = performance.now();
        this.adjustHeight();

        this.visualizationCtx?.restore();
        this.visualizationCtx?.save();

        // scale canvas for high-resolution screens
        // code from https://gist.github.com/callumlocke/cc258a193839691f60dd
        const devicePixelRatio = window.devicePixelRatio || 1;
        const anyCtx: CanvasRenderingContext2D | null = this.visualizationCtx;
        if (
            !anyCtx ||
            !this.container.current ||
            !this.visualization.current ||
            !this.visualizationCtx
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
            this.visualizationCtx.scale(ratio, ratio);
        } else {
            this.visualization.current.height = this.height;
            this.visualization.current.width = this.width;
            this.visualization.current.style.width = '';
            this.visualization.current.style.height = '';
        }

        const centerX = this.width / 2;
        const centerY = this.height / 2 + this.HEIGHT_ADJUST;

        // rotate so 0rad is up top
        this.visualizationCtx.rotate(-HALF_PI);
        // move so center is in center of canvas element (but since we rotated already,
        // we also need to rotate our translate [centerX, centerY] => [-centerY, centerX]
        this.visualizationCtx.translate(-centerY, centerX);

        this.RADIUS_SCALE = Math.min(this.width, this.height) / 12;
        this.RADIUS_BASE = Math.min(centerX, centerY) - this.RADIUS_SCALE * 3 / 4;
        this.WAVEFORM_HALF_HEIGHT = Math.min(50, this.RADIUS_BASE / 4);

        if (!this.isRendering) {
            gsap.ticker.add(this.onAnalyze);
            this.isRendering = true;
        }
    }

    onVisibilityChange = (): void => {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        if (!(document as any)[visibilityChangeApi.hidden]) {
            if (!this.isRendering) {
                this.idleStart = performance.now();
                gsap.ticker.add(this.onAnalyze);
                this.isRendering = true;
            }
        } else {
            if (this.isRendering) {
                gsap.ticker.remove(this.onAnalyze);
                this.isRendering = false;
            }
        }
    }

    componentDidMount(): void {
        window.addEventListener('resize', this.onResize);
        document.addEventListener(visibilityChangeApi.visibilityChange, this.onVisibilityChange, false);
        this.initializeVisualizer();
    }

    componentWillUnmount(): void {
        window.removeEventListener('resize', this.onResize);
        document.removeEventListener(visibilityChangeApi.visibilityChange, this.onVisibilityChange);
        gsap.ticker.remove(this.onAnalyze);
        this.isRendering = false;
    }

    shouldComponentUpdate(nextProps: AudioVisualizerProps): boolean {
        if (nextProps.isMobile !== this.props.isMobile ||
            nextProps.currentPosition !== this.props.currentPosition ||
            nextProps.isPlaying && !this.props.isPlaying ||
            nextProps.isHoverSeekring !== this.props.isHoverSeekring ||
            nextProps.hoverAngle !== this.props.hoverAngle
        ) {
            this.idleStart = performance.now();
            if (!this.isRendering) {
                gsap.ticker.add(this.onAnalyze);
                this.isRendering = true;
            }
        }
        return false;
    }

    render(): JSX.Element {
        return (
            <VisualizerContainer ref={this.container}>
                <VisualizerCanvas ref={this.visualization} />
            </VisualizerContainer>
        );
    }
}

export const Component = AudioVisualizer;

import styled from '@emotion/styled';
import { gsap } from 'gsap';
import * as React from 'react';

import type { MusicPlayer } from './MusicPlayer.js';
import { CIRCLE_SAMPLES, constantQ, firLoader } from './VisualizationUtils.js';
import { nextPow2 } from './utils.js';
import type { Radii } from './types.js';
import { musicStore } from './store.js';

const VisualizerContainer = styled.div({
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
    backgroundColor: 'black',
});

const VisualizerCanvas = styled.canvas({
    position: 'absolute',
    width: '100%',
    height: '100%',
});

export const TWO_PI = 2 * Math.PI;
export const HALF_PI = Math.PI / 2;
export const SCALE_DESKTOP = 40;
export const SCALE_MOBILE = 20;
export const HEIGHT_ADJUST_MOBILE = -45;
export const HEIGHT_ADJUST_DESKTOP = -100;
export const HIGH_FREQ_SCALE = 10;
export const MOBILE_MSPF = 1000 / 30;

export interface AudioVisualizerProps {
    readonly musicPlayer: MusicPlayer;
    // readonly currentPosition: number;
    readonly duration: number;
    readonly isPlaying: boolean;
    readonly volume: number;
    readonly isMobile: boolean;
    readonly isHoverSeekring: boolean;
    readonly hoverAngle?: number;
    readonly setRadii: ({ inner, outer, base }: Radii) => void;
}

type ColorType<C> = C extends WebGL2RenderingContext | WebGLRenderingContext
    ? Float32Array
    : string;

type ArrayType<C> = C extends WebGL2RenderingContext | WebGLRenderingContext
    ? Float32Array[]
    : number[][];

export abstract class AudioVisualizerBase<
    C extends RenderingContext,
> extends React.Component<AudioVisualizerProps> {
    renderingContext!: C | null;
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

    FFT_HALF_SIZE!: number;
    CQ_BINS!: number;
    INV_CQ_BINS!: number;

    leftCQResult!: Float32Array;
    rightCQResult!: Float32Array;
    vizBins!: Float32Array;

    leftData!: Float32Array;
    rightData!: Float32Array;

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
    lastPositionUpdateTimestamp: number = 0;
    lastCurrentPosition = 0;
    idleStart = 0;
    requestId = 0;
    lastCallback!: number;

    history: ArrayType<C> = [];
    maxHistoryLength = 30;

    abstract drawConstantQBins: (radius: number, color: ColorType<C>) => void;
    abstract drawWaveForm: (centerAxis: number, color: ColorType<C>) => void;
    abstract drawPlaybackHead: (
        angle: number,
        minRad: number,
        maxRad: number,
        color: ColorType<C>,
    ) => void;
    abstract drawSeekArea: (radius: number, color: ColorType<C>) => void;
    abstract drawPhase: (radius: number, color: ColorType<C>) => void;
    abstract drawVisualization: (lowFreq: number, lightness: number) => void;
    abstract onResize: () => void;
    abstract initializeVisualizer: () => Promise<void>;

    adjustHeight = (): void => {
        this.HEIGHT_ADJUST = this.props.isMobile
            ? HEIGHT_ADJUST_MOBILE
            : HEIGHT_ADJUST_DESKTOP;
        this.SCALE = this.props.isMobile ? SCALE_MOBILE : SCALE_DESKTOP;
    };

    initialize = async () => {
        try {
            await Promise.all([constantQ.loaded, firLoader.loaded]);

            this.FFT_HALF_SIZE = constantQ.numRows;
            this.CQ_BINS = constantQ.numCols * 2;
            this.INV_CQ_BINS = 1 / this.CQ_BINS;

            // set MaxDesiredFreq to 22050 (nyquist limit of 44.1k).
            // Therefore the bin of MaxDesiredFreq must be 22050/(sr/2) percent of total bin_size.
            // bin number of MaxFreq = numBins * MaxDesiredFreq / AbsMaxFreq
            const sr2 = constantQ.sampleRate / 2;
            this.MAX_BIN = Math.round((this.FFT_HALF_SIZE * 22050) / sr2);
            this.HIGH_PASS_BIN = Math.round(
                (constantQ.maxF * this.FFT_HALF_SIZE) / sr2,
            );
            this.LOW_PASS_BIN = Math.round(
                (constantQ.minF * this.FFT_HALF_SIZE) / sr2,
            ); // not used right now

            this.NUM_CROSSINGS = firLoader.numCrossings;
            this.SAMPLES_PER_CROSSING = firLoader.samplesPerCrossing;
            this.HALF_CROSSINGS = firLoader.halfCrossings;
            this.FILTER_SIZE = firLoader.filterSize;
            this.STEP_SIZE = this.CQ_BINS / CIRCLE_SAMPLES;
            // create visualization arrays here instead of new ones each loop
            // saves on overhead/allocation
            this.vizBins = new Float32Array(this.CQ_BINS);
            this.leftCQResult = new Float32Array(constantQ.numCols);
            this.rightCQResult = new Float32Array(constantQ.numCols);

            const phaseSamples =
                constantQ.sampleRate *
                ((this.props.isMobile ? MOBILE_MSPF : 1000.0 / 60.0) / 1000);

            this.leftData = new Float32Array(nextPow2(phaseSamples));
            this.rightData = new Float32Array(nextPow2(phaseSamples));
            this.idleStart = performance.now();

            gsap.ticker.add(this.onAnalyze);
            this.isRendering = true;
        } catch (err) {
            console.error('visualizer init failed.', err);
        }
    };

    onAnalyze = (): void => {
        // this.requestId = requestAnimationFrame(this.onAnalyze);
        // don't render anything if analyzers are null, i.e. audio not set up yet
        // also limit 30fps on mobile =).
        const timestamp = performance.now();
        const { left: leftAnalyzer, right: rightAnalyzer } =
            this.props.musicPlayer.analyzers;

        const { left: leftPhase, right: rightPhase } =
            this.props.musicPlayer.phasalyzers;

        if (
            !this.vizBins ||
            !this.renderingContext ||
            !leftAnalyzer ||
            !rightAnalyzer ||
            !leftPhase ||
            !rightPhase ||
            (this.props.isMobile &&
                this.lastCallback &&
                timestamp - this.lastCallback < MOBILE_MSPF)
        ) {
            return;
        }
        if (this.props.isMobile) {
            if (this.lastCallback) {
                const timeAdjusted =
                    (timestamp - this.lastCallback) % MOBILE_MSPF;
                this.lastCallback = timestamp - timeAdjusted;
            } else {
                this.lastCallback = timestamp;
            }
        }

        if (!musicStore.get.isPlaying()) {
            // reset idleStart time if either hover, hoverangle, or currPos changes
            if (
                this.lastIsHover !== musicStore.get.isHoverSeekring() ||
                this.lastCurrentPosition !==
                    musicStore.get.playbackPosition() ||
                this.lastHover !== musicStore.get.angle?.()
            ) {
                this.idleStart = timestamp;
            }
            // update hover, hoverangle, currPos (no effect obviously if no change)
            this.lastIsHover = musicStore.get.isHoverSeekring();
            this.lastHover = musicStore.get.angle?.();
            this.lastCurrentPosition = musicStore.get.playbackPosition();
            // if has been idle for over 3.5 seconds, cancel animation
            if (this.idleStart !== 0 && timestamp - this.idleStart > 3500) {
                gsap.ticker.remove(this.onAnalyze);
                this.isRendering = false;
                return;
            }
        }

        // FFT -> CQ
        const { lowFreq: leftLow, highFreq: leftHigh } =
            leftAnalyzer.getConstantQ(this.leftCQResult);
        const { lowFreq: rightLow, highFreq: rightHigh } =
            rightAnalyzer.getConstantQ(this.rightCQResult);
        leftPhase?.getFloatTimeDomainData(this.leftData);
        rightPhase?.getFloatTimeDomainData(this.rightData);

        // concat the results, store in vizBins
        this.vizBins.set(this.leftCQResult);
        this.vizBins.set(
            this.rightCQResult.reverse(),
            this.leftCQResult.length,
        );

        // Average left and right for each high and low accumulator, and divide by number of bins
        let highFreq = (leftHigh + rightHigh) / 2;
        const lowFreq = (leftLow + rightLow) / 2;
        highFreq = HIGH_FREQ_SCALE * highFreq;

        this.drawVisualization(lowFreq, highFreq);
    };

    onVisibilityChange = (): void => {
        if (document.visibilityState === 'hidden') {
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
    };

    componentDidMount(): void {
        window.addEventListener('resize', this.onResize);
        document.addEventListener(
            'visibilitychange',
            this.onVisibilityChange,
            false,
        );
        this.initializeVisualizer();
    }

    componentWillUnmount(): void {
        window.removeEventListener('resize', this.onResize);
        document.removeEventListener(
            'visibilitychange',
            this.onVisibilityChange,
        );
        gsap.ticker.remove(this.onAnalyze);
        this.isRendering = false;
    }

    componentDidUpdate(prevProps: AudioVisualizerProps): void {
        if (
            prevProps.isMobile !== this.props.isMobile ||
            // prevProps.currentPosition !== this.props.currentPosition ||
            prevProps.isPlaying !== this.props.isPlaying ||
            prevProps.isHoverSeekring !== this.props.isHoverSeekring ||
            prevProps.hoverAngle !== this.props.hoverAngle
        ) {
            // if (
            //     prevProps.currentPosition !== this.props.currentPosition ||
            //     this.props.isPlaying
            // ) {
            //     this.lastPositionUpdateTimestamp = performance.now();
            // }
            if (prevProps.isMobile !== this.props.isMobile) {
                this.onResize();
            }
            this.idleStart = performance.now();
            if (!this.isRendering) {
                gsap.ticker.add(this.onAnalyze);
                this.isRendering = true;
            }
        }
    }

    render() {
        return (
            <VisualizerContainer ref={this.container}>
                <VisualizerCanvas ref={this.visualization} />
            </VisualizerContainer>
        );
    }
}

export type AudioVisualizerType = React.ComponentType<AudioVisualizerProps>;

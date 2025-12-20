import gsap from 'gsap';
import { MOBILE_MSPF } from './AudioVisualizerBase.jsx';
import { ConstantQNode } from './ConstantQNode.js';
import { type BufferSrc, getAudioContext, nextPow2 } from './utils.js';
import { WaveformLoader } from './VisualizationUtils.js';

class Audio {
    element: HTMLAudioElement | null = null;
    audioPromise: Promise<void> = Promise.resolve();
    promiseResolver: () => void = () => {};
    promiseRejector: () => void = () => {};
    loaded: boolean = false;

    play = () => {
        this.element?.play();
    };

    pause = () => {
        this.element?.pause();
    };

    load = () => {
        this.element?.load();
    };

    set positionPercent(percent: number) {
        if (this.element) {
            this.element.currentTime = this.element.duration * percent;
        }
    }

    get positionPercent() {
        return this.element?.currentTime ?? 0;
    }

    resetPromise = () => {
        this.promiseRejector();
        this.audioPromise = new Promise((resolve) => {
            this.promiseResolver = resolve;
        });
    };

    get rawSrc() {
        return this.element?.getAttribute('src') ?? '';
    }

    get src() {
        return this.element?.src || '';
    }

    set src(source: string) {
        if (this.element) {
            this.element.src = source;
        }
    }

    get volume() {
        return this.element?.volume || 0;
    }

    set volume(percent: number) {
        if (this.element) {
            this.element.volume = percent;
        }
    }

    get currentTime() {
        return this.element?.currentTime || 0;
    }

    set currentTime(time: number) {
        if (this.element) {
            this.element.currentTime = time;
        }
    }

    get duration() {
        return this.element?.duration || 0;
    }

    get isPlaying() {
        return !this.element?.paused;
    }
}

interface MusicPlayerConstructorArgs {
    isMobile: boolean;
    volumeCallback: (volume: number) => void;
    loadingCallback: () => void;
    loadedCallback: () => void;
}

export class MusicPlayer {
    audio: Audio = new Audio();
    waveform: WaveformLoader = new WaveformLoader();
    buffers: {
        prev: Audio;
        next: Audio;
    } = {
        prev: new Audio(),
        next: new Audio(),
    };
    waveforms: {
        prev: WaveformLoader;
        next: WaveformLoader;
    } = {
        prev: new WaveformLoader(),
        next: new WaveformLoader(),
    };

    context: AudioContext | null = null;

    analyzers: {
        left: ConstantQNode | null;
        right: ConstantQNode | null;
    } = { left: null, right: null };

    phasalyzers: {
        left: AnalyserNode | null;
        right: AnalyserNode | null;
    } = { left: null, right: null };

    phaseRateMultiplier: number = 0;

    volumeCallback!: (volume: number) => void;
    loadingCallback!: () => void;
    loadedCallback!: () => void;
    splitter: ChannelSplitterNode | null = null;

    async initialize(
        audio: HTMLAudioElement,
        prevAudio: HTMLAudioElement,
        nextAudio: HTMLAudioElement,
        first: BufferSrc,
    ) {
        this.context = getAudioContext();
        this.context.onstatechange = () => {
            if (this.context?.state !== 'running') {
                this.context?.resume();
            }
        };
        const sampleRate = this.context.sampleRate;
        const smoothing = 0.9 * (sampleRate / 192000) ** 2;
        this.analyzers.left = new ConstantQNode(this.context, {
            smoothingTimeConstant: smoothing,
        });
        this.analyzers.right = new ConstantQNode(this.context, {
            smoothingTimeConstant: smoothing,
        });

        const phaseSamples = sampleRate * this.phaseRateMultiplier;

        this.phasalyzers.left = new AnalyserNode(this.context, {
            fftSize: nextPow2(phaseSamples),
        });
        this.phasalyzers.right = new AnalyserNode(this.context, {
            fftSize: nextPow2(phaseSamples),
        });

        this.audio.element = audio;
        this.buffers.prev.element = prevAudio;
        this.buffers.next.element = nextAudio;

        const gain = this.context.createGain();

        if (this.audio.element) {
            this.audio.element.volume = 0;
            const src = this.context?.createMediaElementSource(
                this.audio.element,
            );
            src?.connect(gain);
        }

        gain.connect(this.context.destination);
        this.splitter = this.context.createChannelSplitter(2);

        gain.connect(this.splitter);
        this.splitter.connect(this.phasalyzers.left, 0);
        this.splitter.connect(this.phasalyzers.right, 1);
        this.splitter.connect(this.analyzers.left, 0);
        this.splitter.connect(this.analyzers.right, 1);

        this.queueAudio(first.src, first.waveform, true, false);

        // if (!this.audio.loaded) {
        //     this.loadingCallback();
        //     await this.audio.audioPromise;
        // }
        // this.loadedCallback();
        // gsap.fromTo(
        //     this.audio,
        //     { duration: 0.3, volume: 0 },
        //     {
        //         volume: 1,
        //         onUpdate: () => {
        //             this.volumeCallback(this.audio.volume);
        //         },
        //     },
        // );
    }

    disconnectPhasalizers() {
        if (!this.splitter) {
            return;
        }

        this.phasalyzers.left &&
            this.splitter.disconnect(this.phasalyzers.left, 0);
        this.phasalyzers.right &&
            this.splitter.disconnect(this.phasalyzers.right, 1);
    }

    reconnectPhasalizers() {
        if (!this.splitter) {
            return;
        }

        this.phasalyzers.left &&
            this.splitter.connect(this.phasalyzers.left, 0);
        this.phasalyzers.right &&
            this.splitter.connect(this.phasalyzers.right, 1);
    }

    get initialized() {
        return (
            !!this.analyzers.left &&
            !!this.analyzers.right &&
            !!this.phasalyzers.left &&
            !!this.phasalyzers.right
        );
    }

    constructor(args: MusicPlayerConstructorArgs) {
        this.volumeCallback = args.volumeCallback;
        this.loadedCallback = args.loadedCallback;
        this.loadingCallback = args.loadingCallback;
        this.setPhaseRateMultiplier(args.isMobile);
    }

    setPhaseRateMultiplier = (isMobile: boolean) => {
        this.phaseRateMultiplier =
            (isMobile ? MOBILE_MSPF : 1000.0 / 60.0) / 1000;
    };

    queueBuffers = (prev?: BufferSrc, next?: BufferSrc) => {
        if (prev) {
            this.buffers.prev.src = prev.src;
            this.buffers.prev.load();
            this.waveforms.prev.loadWaveformFile(prev.waveform);
        }

        if (next) {
            this.buffers.next.src = next.src;
            this.buffers.next.load();
            this.waveforms.next.loadWaveformFile(next.waveform);
        }
    };

    queueAudio = async (
        src: string,
        waveform: string,
        fade: boolean,
        play = true,
    ) => {
        if (fade) {
            await new Promise((resolve: (arg: unknown) => void) => {
                gsap.fromTo(
                    this.audio,
                    {
                        volume: this.audio.volume,
                        duration: 0.3,
                    },
                    {
                        volume: 0,
                        onUpdate: () => {
                            this.volumeCallback(this.audio.volume);
                        },
                        onComplete: () => {
                            this.audio.pause();
                            this.audio.currentTime = 0;
                            setTimeout(resolve, 100);
                        },
                    },
                );
            });
        } else {
            this.audio.promiseRejector();
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio.volume = 0;
        }

        this.audio.resetPromise();
        this.audio.src = src;
        this.audio.load();
        this.waveform.loadWaveformFile(waveform);

        if (!this.audio.loaded || !this.waveform.loaded) {
            this.loadingCallback();
            await Promise.all([this.audio.audioPromise, this.waveform.loaded]);
        }
        this.loadedCallback();
        if (fade) {
            gsap.fromTo(
                this.audio,
                { duration: 0.3, volume: 0 },
                {
                    volume: 1,
                    onUpdate: () => {
                        this.volumeCallback(this.audio.volume);
                    },
                    onComplete: () => {
                        play && this.audio.play();
                    },
                },
            );
        } else {
            this.audio.volume = 1;
            play && this.audio.play();
        }
    };

    audioOnLoad = () => {
        this.audio.promiseResolver();
        this.audio.loaded = true;
    };

    resetTrack = () => {
        this.audio.currentTime = 0;
    };

    play = async () => {
        if (this.context?.state === 'suspended') {
            this.context.resume();
        }
        await Promise.all([this.audio.audioPromise, this.waveform.loaded]);
        this.audio.play();
    };

    pause = () => {
        this.audio.pause();
    };

    get positionPercent() {
        return this.audio.positionPercent;
    }

    set positionPercent(percent: number) {
        this.audio.positionPercent = percent;
    }

    setTrack = (src: string, waveform: string, fade: boolean = true) => {
        this.queueAudio(src, waveform, fade);
    };
}

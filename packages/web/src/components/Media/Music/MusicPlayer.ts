import { MOBILE_MSPF } from './AudioVisualizerBase.jsx';
import { ConstantQNode } from './ConstantQNode.js';
import { WaveformLoader } from './VisualizationUtils.js';
import { getAudioContext, nextPow2 } from './utils.js';
import gsap from 'gsap';

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
        return !this.element?.paused ?? false;
    }
}

interface MusicPlayerConstructorArgs {
    isMobile: boolean;
    volumeCallback: (volume: number) => void;
    loadingCallback: () => void;
    loadedCallback: () => void;
}

export class MusicPlayer {
    audios: Audio[] = [new Audio(), new Audio()];
    waveforms: WaveformLoader[] = [new WaveformLoader(), new WaveformLoader()];
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
    currentBuffer: 0 | 1 = 0;
    volumeCallback!: (volume: number) => void;
    loadingCallback!: () => void;
    loadedCallback!: () => void;

    async initialize(
        audio0: HTMLAudioElement,
        audio1: HTMLAudioElement,
        firstTrack: string,
        firstWaveForm: string,
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

        this.audios[0].element = audio0;
        this.audios[1].element = audio1;

        const gain = this.context.createGain();

        this.audios.forEach((audio) => {
            if (audio.element) {
                audio.element.volume = 0;
                const src = this.context?.createMediaElementSource(
                    audio.element,
                );
                src?.connect(gain);
            }
        });

        gain.connect(this.context.destination);
        const splitter = this.context.createChannelSplitter(2);

        gain.connect(splitter);
        splitter.connect(this.phasalyzers.left, 0);
        splitter.connect(this.phasalyzers.right, 1);
        splitter.connect(this.analyzers.left, 0);
        splitter.connect(this.analyzers.right, 1);

        this.queueCurrentBuffer(firstTrack, firstWaveForm);

        const currAudio = this.audios[this.currentBuffer];
        if (!currAudio.loaded) {
            this.loadingCallback();
            await currAudio.audioPromise;
        }
        this.loadedCallback();
        gsap.fromTo(
            currAudio,
            { duration: 0.3, volume: 0 },
            {
                volume: 1,
                onUpdate: () => {
                    this.volumeCallback(currAudio.volume);
                },
            },
        );
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

    setAudioElement = (buffer: 0 | 1, audio: HTMLAudioElement) => {
        this.audios[buffer].element = audio;
    };

    queueNextBuffer = (src: string, waveform: string) => {
        const nextBuffer = this.currentBuffer ? 0 : 1;
        if (this.audios[nextBuffer].rawSrc !== src) {
            this.audios[nextBuffer].resetPromise();
            this.audios[nextBuffer].src = src;
            this.audios[nextBuffer].load();
            this.waveforms[nextBuffer].loadWaveformFile(waveform);
        }
    };

    queueCurrentBuffer = (src: string, waveform: string) => {
        this.audios[this.currentBuffer].resetPromise();
        this.audios[this.currentBuffer].src = src;
        this.audios[this.currentBuffer].load();
        this.waveforms[this.currentBuffer].loadWaveformFile(waveform);
    };

    changeBuffers = async (fade: boolean) => {
        const currBuff = this.currentBuffer;
        const currAudio = this.audios[currBuff];
        const nextBuff = this.currentBuffer ? 0 : 1;
        const nextAudio = this.audios[nextBuff];

        if (fade) {
            await new Promise((resolve: (arg: void) => void) => {
                gsap.fromTo(
                    currAudio,
                    {
                        volume: currAudio.volume,
                        duration: 0.3,
                    },
                    {
                        volume: 0,
                        onUpdate: () => {
                            this.volumeCallback(currAudio.volume);
                        },
                        onComplete: () => {
                            currAudio.pause();
                            currAudio.currentTime = 0;
                            setTimeout(resolve, 100);
                        },
                    },
                );
            });
        } else {
            currAudio.promiseRejector();
            currAudio.pause();
            currAudio.currentTime = 0;
            currAudio.volume = 0;
        }
        if (!nextAudio.loaded) {
            this.loadingCallback();
            await Promise.all([
                nextAudio.audioPromise,
                this.waveforms[nextBuff].loaded,
            ]);
        }
        this.loadedCallback();
        this.currentBuffer = nextBuff;
        if (fade) {
            gsap.fromTo(
                nextAudio,
                { duration: 0.3, volume: 0 },
                {
                    volume: 1,
                    onUpdate: () => {
                        this.volumeCallback(nextAudio.volume);
                    },
                    onComplete: () => {
                        nextAudio.play();
                    },
                },
            );
        } else {
            nextAudio.volume = 1;
            nextAudio.play();
        }
    };

    audioOnLoad = (buff: 0 | 1) => () => {
        this.audios[buff].promiseResolver();
        this.audios[buff].loaded = true;
    };

    getCurrentAudio = () => {
        return this.audios[this.currentBuffer];
    };

    getCurrentWaveform = () => {
        return this.waveforms[this.currentBuffer];
    };

    resetTrack = () => {
        this.audios[this.currentBuffer].currentTime = 0;
    };

    play = async () => {
        if (this.context?.state === 'suspended') {
            this.context.resume();
        }
        await Promise.all([
            this.audios[this.currentBuffer].audioPromise,
            this.waveforms[this.currentBuffer].loaded,
        ]);
        this.audios[this.currentBuffer].play();
    };

    pause = () => {
        this.audios[this.currentBuffer].pause();
    };

    get positionPercent() {
        return this.audios[this.currentBuffer].positionPercent;
    }

    set positionPercent(percent: number) {
        this.audios[this.currentBuffer].positionPercent = percent;
    }

    audioCallback = (
        buff: 0 | 1,
        nextSrc: () => string,
        nextWaveForm: () => string,
        callback: (currentTime: number, duration: number) => void,
    ) => {
        if (buff === this.currentBuffer) {
            const audio = this.audios[buff];
            if (
                audio.currentTime &&
                audio.duration &&
                audio.currentTime >= audio.duration - 10 &&
                audio.currentTime < audio.duration - 9
            ) {
                this.queueNextBuffer(nextSrc(), nextWaveForm());
            }
            callback(audio.currentTime, audio.duration);
        }
    };

    setTrack = (src: string, waveform: string, fade: boolean = true) => {
        this.queueNextBuffer(src, waveform);
        this.changeBuffers(fade);
    };
}

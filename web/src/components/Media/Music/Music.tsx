/* global MUSIC_PATH */

import isEmpty from 'lodash-es/isEmpty';
import shuffle from 'lodash-es/shuffle';
import * as React from 'react';
import { connect } from 'react-redux';

import styled from '@emotion/styled';

import { gsap } from 'gsap';

import { onScroll, scrollFn } from 'src/components/App/NavBar/reducers';
import { fetchPlaylist } from 'src/components/Media/Music/reducers';
import AudioInfo from 'src/components/Media/Music/AudioInfo';
import AudioUI from 'src/components/Media/Music/AudioUI';
import MusicPlaylist from 'src/components/Media/Music/MusicPlaylist';
import { getAudioContext, getLastName, getPermaLink, getRelativePermaLink, modulo, normalizeString } from 'src/components/Media/Music/utils';
import { constantQ, firLoader, waveformLoader } from 'src/components/Media/Music/VisualizationUtils';

import { AudioVisualizerType } from 'src/components/Media/Music/audioVisualizerBase';
import { isMusicItem, MusicFileItem, MusicListItem } from 'src/components/Media/Music/types';

import { pushed } from 'src/styles/mixins';
import { screenXSorPortrait } from 'src/styles/screens';
import { navBarHeight } from 'src/styles/variables';

import module from 'src/module';
import store, { AppDispatch, GlobalStateShape } from 'src/store';
import { NavigateFunction, PathMatch, useMatch, useNavigate } from 'react-router-dom';

const register = module(store);

interface MusicState {
    readonly isPlaying: boolean;
    readonly volume: number;
    readonly playbackPosition: number;
    readonly lastUpdateTimestamp: number;
    readonly duration: number;
    readonly currentTrack?: MusicFileItem;
    readonly isLoading: boolean;
    readonly userInteracted: boolean;
    readonly isShuffle: boolean;
    readonly localFlat: MusicFileItem[];

    readonly Visualizer: AudioVisualizerType | null;
    readonly isHoverSeekring: boolean;
    readonly isMouseMove: boolean;
    readonly angle?: number;
    readonly radii: {
        readonly inner: number;
        readonly outer: number;
        readonly base: number;
    };
}

interface MusicStateToProps {
    readonly items: MusicListItem[];
    readonly flatItems: MusicFileItem[];
}

interface MusicDispatchToProps {
    // readonly fetchPlaylistAction: () => AppDispatch;
    // readonly onScroll: (triggerHeight: number, scrollTop: number) => void;
    dispatch: AppDispatch;
}

interface MusicOwnProps {
    isMobile: boolean;
}

type MusicProps = MusicOwnProps & MusicStateToProps & MusicDispatchToProps & {
    matches: PathMatchResult;
    navigate: NavigateFunction;
};

const MusicDiv = styled.div`
    ${pushed}
    position: relative;
    width: 100%;
    background-color: black;

    ${screenXSorPortrait} {
        margin-top: 0;
        padding-top: ${navBarHeight.mobile}px;
        height: 100%;
        overflow-y: scroll;
        -webkit-overflow-scrolling: touch;
    }
`;

class Music extends React.Component<MusicProps, MusicState> {
    wasPlaying = false;
    audio: React.RefObject<HTMLAudioElement> = React.createRef();
    state: MusicState = {
        isPlaying: false,
        volume: 0.0,
        playbackPosition: 0.0,
        lastUpdateTimestamp: 0,
        duration: -1,
        currentTrack: undefined,
        isLoading: false,
        userInteracted: false,
        isShuffle: false,
        localFlat: [],
        Visualizer: null,
        isHoverSeekring: false,
        isMouseMove: false,
        angle: 0,
        radii: {
            inner: 0,
            outer: 0,
            base: 0,
        },
    };

    audioCtx!: AudioContext;
    analyzerL!: AnalyserNode;
    analyzerR!: AnalyserNode;

    musicOrder!: number[];
    musicFileOrder!: number[];

    getNextTrack = (which: 'next' | 'prev', force = false) => {
        const trackNo = this.state.localFlat.findIndex((item) => item.id === this.state.currentTrack?.id);
        const nextTrackNo = (which === 'next') ? trackNo + 1 : trackNo - 1;
        if (force) {
            return this.state.localFlat[modulo(nextTrackNo, this.state.localFlat.length)];
        }
        if (nextTrackNo >= 0 && nextTrackNo < this.state.localFlat.length
        ) {
            return this.state.localFlat[nextTrackNo];
        }
    }

    toggleShuffle = () => {
        this.setState({
            isShuffle: !this.state.isShuffle,
        }, () => {
            if (this.state.isShuffle) {
                this.setState({
                    localFlat: shuffle(this.state.localFlat),
                });
            } else {
                this.setState({
                    localFlat: this.props.flatItems,
                });
            }
        });
    }

    play = () => {
        if (!this.state.userInteracted) {
            this.setState({
                userInteracted: true,
            });
        }
        if (this.audioCtx?.state === 'suspended') {
            this.audioCtx.resume();
        }
        this.audio.current?.play();
    }

    pause = () => {
        this.audio.current?.pause();
    }

    initializeAudioPlayer = async () => {
        if (!this.audio.current) {
            throw new Error('audio element ref not created');
        }
        this.audioCtx = getAudioContext();
        const audioSrc = this.audioCtx.createMediaElementSource(this.audio.current);

        // source -> split(L, R) => analyzer(L, R) => merge -> dest
        this.analyzerL = this.audioCtx.createAnalyser();
        this.analyzerR = this.audioCtx.createAnalyser();

        const splitter = this.audioCtx.createChannelSplitter(2);
        const merger = this.audioCtx.createChannelMerger(2);
        audioSrc.connect(splitter);
        splitter.connect(this.analyzerL, 0);
        splitter.connect(this.analyzerR, 1);
        this.analyzerL.connect(merger, 0, 0);
        this.analyzerR.connect(merger, 0, 1);
        merger.connect(this.audioCtx.destination);

        const sampleRate = this.audioCtx.sampleRate;
        // smooth more when sampleRate is higher
        this.analyzerL.smoothingTimeConstant = this.analyzerR.smoothingTimeConstant = 0.9 * Math.pow(sampleRate / 192000, 2);

        this.audio.current.volume = 0;

        this.setState({ isLoading: true });
        this.waitForFilterAndPlaylist();
    }

    getFirstTrack = (composer: string | undefined, piece: string | undefined, movement = '') => {
        if (composer && piece) {
            return this.props.flatItems.find((item) => {
                // early return before looking through props.items
                // if composer or piece don't match, return false
                if (
                    composer !== getLastName(item.musicItem.composer) ||
                    piece !== normalizeString(item.musicItem.piece)
                ) {
                    return false;
                }

                // If we're here, that means composer and piece matched
                // If movement also matches, we're golden.
                if (movement === normalizeString(item.name)) {
                    return true;
                }

                // If not, then the only last possible way this returns true
                // is if musicFiles.length === 1, since that would mean there isn't
                // a movement name associated with this track.
                const music = this.props.items.find((mi) => item.musicItem.id === mi.id);
                return (
                    music &&
                    isMusicItem(music) &&
                    music.musicFiles.length === 1
                );
            });
        } else {
            return this.props.flatItems[0];
        }
    }

    waitForFilterAndPlaylist = async () => {
        try {
            const {
                composer,
                piece,
                movement
            } = {
                composer: undefined,
                piece: undefined,
                movement: undefined,
                ...this.props.matches?.params
            };

            await Promise.all([
                constantQ.loaded,
                this.props.dispatch(fetchPlaylist()),
            ]);

            const firstTrack = this.getFirstTrack(composer, piece, movement);
            this.analyzerL.fftSize = this.analyzerR.fftSize = constantQ.numRows * 2;

            this.setState({
                localFlat: this.props.flatItems,
            });
            if (firstTrack) {
                this.loadTrack(firstTrack);
            }
        } catch (err) {
            console.error('constantQ or playlist init failed.', err);
        }
    }

    loadTrack = async (track: MusicFileItem) => {
        if (
            this.state.currentTrack &&
            this.state.currentTrack.id === track.id
        ) {
            return Promise.reject(new Error('no clicky'));
        }
        await new Promise((resolve: (arg: void) => void) => {
            if (this.audio.current) {
                gsap.fromTo(this.audio.current,
                    { volume: this.audio.current.volume, duration: 0.3 },
                    {
                        volume: 0,
                        onUpdate: () => {
                            if (this.audio.current) {
                                this.setState({ volume: this.audio.current.volume });
                            }
                        },
                        onComplete: () => {
                            setTimeout(resolve, 100);
                        },
                    }
                )
            } else {
                resolve();
            }
        });
        this.audio.current?.pause();
        this.setState({
            currentTrack: track,
            duration: -1,
            isLoading: this.audioCtx.state === 'suspended' ? false : true,
        });
        waveformLoader.loadWaveformFile(`${MUSIC_PATH}/waveforms/${track.waveformFile}`);
        if (this.audio.current) {
            this.audio.current.src = `${MUSIC_PATH}/${track.audioFile}`;
        }
        await waveformLoader.loaded;
        if (this.audio.current) {
            gsap.fromTo(this.audio.current, { duration: 0.3, volume: 0 }, {
                volume: 1,
                onUpdate: () => {
                    if (this.audio.current) {
                        this.setState({ volume: this.audio.current.volume });
                    }
                },
            });
        }
    }

    loadTrackNoFade = async (track: MusicFileItem) => {
        this.setState({
            currentTrack: track,
            duration: -1,
            isLoading: true,
        });
        waveformLoader.loadWaveformFile(`${MUSIC_PATH}/waveforms/${track.waveformFile}`);
        if (this.audio.current) {
            this.audio.current.src = `${MUSIC_PATH}/${track.audioFile}`;
        }
        await waveformLoader.loaded;
    }

    onTimeUpdate = () => {
        if (this.audio.current) {
            this.setState({
                playbackPosition: this.audio.current.currentTime,
                lastUpdateTimestamp: performance.now(),
            });
        }
    }

    playPrev = async () => {
        if (!this.state.userInteracted) {
            this.play();
        }
        // Prev Button should scroll to beginning of track unless it's at the beginning
        if (this.audio.current?.currentTime && this.audio.current.currentTime >= 3) {
            this.audio.current.currentTime = 0;
            return;
        }
        const next = this.getNextTrack('prev', true);
        if (next) {
            this.props.navigate(getRelativePermaLink(next.musicItem.composer, next.musicItem.piece, next.name));
            await this.loadTrack(next);
            this.play();
        }
    }

    playNext = async () => {
        if (!this.state.userInteracted) {
            this.play();
        }
        const next = this.getNextTrack('next', true);
        if (next) {
            this.props.navigate(getRelativePermaLink(next.musicItem.composer, next.musicItem.piece, next.name));
            await this.loadTrack(next);
            this.play();
        }
    }

    playNextNoFade = async () => {
        const next = this.getNextTrack('next', true);
        if (next) {
            this.props.navigate(getPermaLink(next.musicItem.composer, next.musicItem.piece, next.name));
            await this.loadTrackNoFade(next);
            this.play();
        }
    }

    onEnded = () => {
        // console.log('ended');
        this.setState({
            isPlaying: false,
            playbackPosition: 0,
            lastUpdateTimestamp: performance.now(),
        });
        this.playNextNoFade();
    }

    onDrag = (percent: number) => {
        if (this.audio.current) {
            const position = percent * this.audio.current.duration;
            this.setState({
                playbackPosition: position,
                lastUpdateTimestamp: performance.now(),
            });
        }
    }

    onStartDrag = (percent: number) => {
        this.wasPlaying = this.state.isPlaying;
        if (this.audio.current) {
            if (this.wasPlaying && !this.audio.current.paused) {
                this.audio.current.pause();
            }

            const position = percent * this.audio.current.duration;
            this.audio.current.currentTime = position;
        }
    }

    seekAudio = (percent: number) => {
        this.onDrag(percent);
        if (this.audio.current) {
            const position = percent * this.audio.current.duration;
            this.audio.current.currentTime = position;
            if (this.wasPlaying && this.audio.current.paused) {
                this.audio.current.play();
            }
        }
    }

    audioOnLoad = async () => {
        if (this.audio.current) {
            this.setState({
                duration: this.audio.current.duration,
                isLoading: false,
            });
        }
        try {
            await Promise.all([constantQ.loaded, firLoader.loaded, waveformLoader.loaded]);
        } catch (err) {
            console.error('music component init failed.', err);
        }
    }

    onPause = () => {
        if (this.audio.current) {
            this.setState({
                isPlaying: false,
                playbackPosition: this.audio.current.currentTime,
                lastUpdateTimestamp: performance.now(),
            });
        }
    }

    onPlaying = () => {
        if (this.audio.current) {
            this.setState({
                isPlaying: true,
                playbackPosition: this.audio.current.currentTime,
                lastUpdateTimestamp: performance.now(),
            });
        }
    }

    detectWebGL = () => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return (gl && gl instanceof WebGLRenderingContext);
    }

    setHoverSeekring = (isHoverSeekring: boolean, angle?: number) => {
        this.setState({
            isHoverSeekring,
            angle,
        });
    }

    setMouseMove = (isMouseMove: boolean) => {
        this.setState({ isMouseMove });
    }

    setRadii = (inner: number, outer: number, base: number) => {
        this.setState({
            radii: {
                inner,
                outer,
                base,
            },
        });
    }

    async componentDidMount() {
        this.initializeAudioPlayer();
        if (this.detectWebGL()) {
            const component = await register('visualizer', import(/* webpackChunkName: 'visualizerWebGL' */ 'src/components/Media/Music/AudioVisualizerWebGL'));
            this.setState({
                Visualizer: component,
            });
        } else {
            const component = await register('visualizer', import(/* webpackChunkName: 'visualizerCanvas' */ 'src/components/Media/Music/AudioVisualizerCanvas'));
            this.setState({
                Visualizer: component,
            });
        }
    }

    async componentWillUnmount() {
        this.audio.current?.pause();
        waveformLoader.reset();
    }

    onScrollDispatch = (triggerHeight: number, scrollTop: number) => {
        this.props.dispatch(onScroll({ triggerHeight, scrollTop }));
    };

    render() {
        const isMobile = this.props.isMobile;
        const Visualizer = this.state.Visualizer;
        return (
            <MusicDiv onScroll={this.props.isMobile ? scrollFn(navBarHeight.mobile, this.onScrollDispatch) : undefined}>
                <audio
                    id="audio"
                    crossOrigin="anonymous"
                    ref={this.audio}
                    onLoadedData={this.audioOnLoad}
                    onCanPlayThrough={this.audioOnLoad}
                    onPlaying={this.onPlaying}
                    onTimeUpdate={this.onTimeUpdate}
                    onPause={this.onPause}
                    onEnded={this.onEnded}
                />
                <MusicPlaylist
                    play={this.play}
                    onClick={this.loadTrack}
                    currentTrackId={(this.state.currentTrack) ? this.state.currentTrack.id : ''}
                    isMobile={isMobile}
                    userInteracted={this.state.userInteracted}
                    toggleShuffle={this.toggleShuffle}
                    isShuffle={this.state.isShuffle}
                />
                <AudioUI
                    seekAudio={this.seekAudio}
                    onStartDrag={this.onStartDrag}
                    onDrag={this.onDrag}
                    play={this.play}
                    pause={this.pause}
                    next={this.playNext}
                    prev={this.playPrev}
                    isPlaying={this.state.isPlaying}
                    currentPosition={this.state.playbackPosition}
                    isMobile={isMobile}
                    isLoading={this.state.isLoading}
                    isMouseMove={this.state.isMouseMove}
                    radii={this.state.radii}
                    setMouseMove={this.setMouseMove}
                    setRadii={this.setRadii}
                    setHoverSeekring={this.setHoverSeekring}
                />
                <AudioInfo
                    duration={this.state.duration}
                    currentPosition={this.state.playbackPosition}
                    currentTrack={this.state.currentTrack}
                    isMobile={isMobile}
                    matchParams={!isEmpty(this.props.matches?.params)}
                />
                {Visualizer && (
                    <Visualizer
                        currentPosition={this.state.playbackPosition}
                        analyzerL={this.analyzerL}
                        analyzerR={this.analyzerR}
                        isPlaying={this.state.isPlaying}
                        duration={this.state.duration}
                        prevTimestamp={this.state.lastUpdateTimestamp}
                        volume={this.state.volume}
                        isMobile={isMobile}
                        isHoverSeekring={this.state.isHoverSeekring}
                        hoverAngle={this.state.angle}
                        setRadii={this.setRadii}
                    />
                )}
            </MusicDiv>
        );
    }
}

type PathMatchResult = PathMatch<'composer' | 'piece'> | PathMatch<'composer' | 'piece' | 'movement'> | null;

const mapStateToProps = ({ audioPlaylist }: GlobalStateShape): MusicStateToProps => ({
    items: audioPlaylist.items,
    flatItems: audioPlaylist.flatItems,
});

const ConnectedMusic = connect<MusicStateToProps, void, MusicOwnProps, GlobalStateShape>(
    mapStateToProps,
)(Music);

const routerHOC = <T extends MusicOwnProps>(Component: typeof ConnectedMusic) =>
    (props: T) => {
        const matches: PathMatchResult = [
            useMatch('music/:composer/:piece'),
            useMatch('music/:composer/:piece/:movement')
        ].reduce((prev, curr) => prev ?? curr, null);

        return <Component
            {...props}
            matches={matches}
            navigate={useNavigate()}
        />;
    };

export type MusicType = React.Component<MusicProps>;
export type RequiredProps = MusicOwnProps;
export default routerHOC(ConnectedMusic);

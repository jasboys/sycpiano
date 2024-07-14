/* global MUSIC_PATH */

import isEmpty from 'lodash-es/isEmpty';
import * as React from 'react';
import {
    useMatch,
    useNavigate,
    type NavigateFunction,
    type PathMatch,
} from 'react-router-dom';

import { onScroll, scrollFn } from 'src/components/App/NavBar/reducers';
import AudioInfo from 'src/components/Media/Music/AudioInfo';
import AudioUI from 'src/components/Media/Music/AudioUI';
import type { AudioVisualizerType } from 'src/components/Media/Music/AudioVisualizerBase.jsx';
import MusicPlaylist from 'src/components/Media/Music/MusicPlaylist';
import { toMedia } from 'src/mediaQuery';

import { css } from '@emotion/react';
import { createSelector, createStructuredSelector } from 'reselect';
import { mqSelectors } from 'src/components/App/reducers.js';
import {
    fetchPlaylistThunk,
    getNextTrack,
    isLoadingAction,
    setRadiiAction,
    setTrackAction,
    updateAction,
    volumeAction,
    type FetchPlaylistThunkReturn,
} from 'src/components/Media/Music/reducers';
import type {
    MusicFileItem,
    MusicListItem,
} from 'src/components/Media/Music/types';
import {
    getBufferSrc,
    getRelativePermaLink,
    getSrc,
    getWaveformSrc,
} from 'src/components/Media/Music/utils';
import { useAppDispatch, useAppSelector } from 'src/hooks.js';
import module from 'src/module';
import {
    minRes,
    screenM,
    screenPortrait,
    screenShort,
    webkitMinDPR,
} from 'src/screens';
import store, { type AppDispatch, type GlobalStateShape } from 'src/store';
import { pushed } from 'src/styles/mixins';
import { navBarHeight, playlistContainerWidth } from 'src/styles/variables';
import { MusicPlayer } from './MusicPlayer.js';

const detectWebGL = () => {
    const canvas = document.createElement('canvas');
    const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
    return gl;
};

interface MusicStateToProps {
    readonly items: MusicListItem[];
    readonly flatItems: MusicFileItem[];
    readonly hiDpx: boolean;
    readonly isHamburger: boolean;
}

interface MusicDispatchToProps {
    dispatch: AppDispatch;
}

type PathMatchResult =
    | PathMatch<'composer' | 'piece'>
    | PathMatch<'composer' | 'piece' | 'movement'>
    | null;

type MusicProps = MusicStateToProps &
    MusicDispatchToProps & {
        matches: PathMatchResult;
        navigate: NavigateFunction;
    };

const styles = {
    music: css(pushed, {
        position: 'relative',
        width: '100%',
        backgroundColor: 'black',
        [toMedia(screenPortrait)]: {
            marginTop: 0,
            height: '100%',
            overflowY: 'scroll',
            WebkitOverflowScrolling: 'touch',
            backgroundColor: 'white',
        },
    }),
    spacer: css({
        [toMedia(screenPortrait)]: {
            height: navBarHeight.lowDpx,
            [toMedia([minRes, webkitMinDPR])]: {
                height: navBarHeight.hiDpx,
            },
        },
    }),
    visualizerGroup: css({
        position: 'relative',
        height: '100%',
        width: `calc(100% - ${playlistContainerWidth.desktop})`,
        [toMedia(screenM)]: {
            width: `calc(100% - ${playlistContainerWidth.tablet})`,
        },
        [toMedia(screenPortrait)]: {
            position: 'sticky',
            top: 0,
            zIndex: 60,
            transition: 'top 0.25s',
            width: '100%',
            height: '80vw',
            boxShadow: '0 0 7px 2px rgba(0 0 0 / 0.5)',
        },
        [toMedia(screenShort)]: {
            height: 360,
        },
    }),
    visualizerGroupPushed: css({
        top: 0,
        [toMedia(screenPortrait)]: {
            top: navBarHeight.lowDpx,
            [toMedia([minRes, webkitMinDPR])]: {
                top: navBarHeight.hiDpx,
            },
        },
    }),
};

const musicSelector = createSelector(
    (state: GlobalStateShape) => state.musicPlayer,
    (state) => ({
        isPlaying: state.isPlaying,
        flatItems: state.flatItems,
        currentTrack: state.currentTrack,
        playbackPosition: state.playbackPosition,
        duration: state.duration,
        volume: state.volume,
        isHoverSeekring: state.isHoverSeekring,
        angle: state.angle,
        isLoading: state.isLoading,
        isShuffle: state.isShuffle,
    }),
);

const mediaSelectors = createStructuredSelector({
    hiDpx: mqSelectors.hiDpx,
    isHamburger: mqSelectors.isHamburger,
    screenPortrait: mqSelectors.screenPortrait,
    screenM: mqSelectors.screenM,
    screenLandscape: mqSelectors.screenLandscape,
    screenL: mqSelectors.screenL,
});

const Music: React.FC = () => {
    const matches: PathMatchResult = [
        useMatch('media/music/:composer/:piece'),
        useMatch('media/music/:composer/:piece/:movement'),
    ].reduce((prev, curr) => prev ?? curr, null);
    const navigate = useNavigate();

    const Visualizer = React.useRef<AudioVisualizerType>();
    const [visualizerLoaded, setVisualizerLoaded] =
        React.useState<boolean>(false);
    const dispatch = useAppDispatch();
    const {
        isPlaying,
        flatItems,
        currentTrack,
        playbackPosition,
        duration,
        volume,
        isHoverSeekring,
        angle,
        isShuffle,
    } = useAppSelector(musicSelector);
    const navBarShow = useAppSelector(({ navbar }) => navbar.isVisible);

    const audio = React.useRef<HTMLAudioElement | null>(null);
    const buffers = React.useRef<{
        prev: HTMLAudioElement | null;
        next: HTMLAudioElement | null;
    }>({ prev: null, next: null });
    const shouldPlay = React.useRef<boolean>();
    const tracks = React.useRef<{
        prev: MusicFileItem | undefined;
        next: MusicFileItem | undefined;
    }>({ prev: undefined, next: undefined });

    const {
        isHamburger,
        hiDpx,
        screenPortrait,
        screenM,
        screenL,
        screenLandscape,
    } = useAppSelector(mediaSelectors);

    const musicPlayer = React.useRef<MusicPlayer>(
        new MusicPlayer({
            isMobile: isHamburger,
            volumeCallback: (volume: number) => dispatch(volumeAction(volume)),
            loadingCallback: () => dispatch(isLoadingAction(true)),
            loadedCallback: () => dispatch(isLoadingAction(false)),
        }),
    );

    React.useEffect(() => {
        const prev = (tracks.current.prev = getNextTrack(
            flatItems,
            currentTrack,
            'prev',
            true,
        ));
        const next = (tracks.current.next = getNextTrack(
            flatItems,
            currentTrack,
            'next',
            true,
        ));
        musicPlayer.current.queueBuffers(
            getBufferSrc(prev),
            getBufferSrc(next),
        );
    }, [currentTrack, flatItems, isShuffle]);

    React.useEffect(() => {
        musicPlayer.current.setPhaseRateMultiplier(isHamburger);
        isHamburger
            ? musicPlayer.current.disconnectPhasalizers()
            : musicPlayer.current.reconnectPhasalizers();
    }, [isHamburger]);

    const togglePlay = React.useCallback(() => {
        if (isPlaying && musicPlayer.current.audio.isPlaying) {
            musicPlayer.current.pause();
        } else {
            musicPlayer.current.play();
        }
    }, [isPlaying]);

    const playSubsequent = React.useCallback(
        (which: 'prev' | 'next', fade = true) => {
            const audio = musicPlayer.current.audio;
            if (
                which === 'prev' &&
                audio?.currentTime &&
                audio?.currentTime >= 3
            ) {
                audio.currentTime = 0;
                return;
            }

            const subsequent = tracks.current[which];
            if (subsequent) {
                navigate(
                    getRelativePermaLink(
                        subsequent.composer ?? '',
                        subsequent.piece ?? '',
                        subsequent.name,
                    ),
                );
                dispatch(setTrackAction(subsequent));
                musicPlayer.current.setTrack(
                    getSrc(subsequent),
                    getWaveformSrc(subsequent),
                    fade,
                );
            }
        },
        [flatItems, currentTrack],
    );

    const waitForPlaylist = React.useCallback(async () => {
        try {
            const { composer, piece, movement } = {
                composer: undefined,
                piece: undefined,
                movement: undefined,
                ...matches?.params,
            };

            const result = await dispatch(
                fetchPlaylistThunk({ composer, piece, movement }),
            );
            if (!result.payload) {
                if (currentTrack) {
                    return {
                        first: currentTrack,
                        prev: tracks.current.prev,
                        next: tracks.current.next,
                    };
                }
                return {
                    first: flatItems[0],
                    prev: flatItems[flatItems.length - 1],
                    next: flatItems[1],
                };
            }
            return {
                first: (result.payload as FetchPlaylistThunkReturn).firstTrack,
                prev: (result.payload as FetchPlaylistThunkReturn).prevTrack,
                next: (result.payload as FetchPlaylistThunkReturn).nextTrack,
            };
        } catch (err) {
            console.error('Playlist init failed.', err);
            throw err;
        }
    }, [flatItems]);

    const importVisualizer = React.useCallback(async () => {
        const register = module(store);
        const gl = detectWebGL();
        if (gl) {
            if (gl instanceof WebGL2RenderingContext) {
                const component = await register(
                    'visualizer',
                    import(
                        /* webpackChunkName: 'visualizerWebGL2' */ 'src/components/Media/Music/AudioVisualizerWebGL2.js'
                    ),
                );
                console.log('Using WebGL2');
                Visualizer.current = component;
                setVisualizerLoaded(true);
            } else {
                const component = await register(
                    'visualizer',
                    import(
                        /* webpackChunkName: 'visualizerWebGL' */ 'src/components/Media/Music/AudioVisualizerWebGL.js'
                    ),
                );
                console.log('Using WebGL');
                Visualizer.current = component;
                setVisualizerLoaded(true);
            }
        } else {
            const component = await register(
                'visualizer',
                import(
                    /* webpackChunkName: 'visualizerCanvas' */ 'src/components/Media/Music/AudioVisualizerCanvas'
                ),
            );
            console.log('Using Canvas');
            Visualizer.current = component;
            setVisualizerLoaded(true);
        }
    }, []);

    React.useEffect(() => {
        const initialize = async () => {
            console.log(audio, buffers);
            if (
                !audio.current ||
                !buffers.current.prev ||
                !buffers.current.next
            ) {
                throw new Error('audio elements refs not created');
            }
            const { first, prev, next } = await waitForPlaylist();
            musicPlayer.current.initialize(
                audio.current,
                buffers.current.prev,
                buffers.current.next,
                { src: getSrc(first), waveform: getWaveformSrc(first) },
                prev
                    ? { src: getSrc(prev), waveform: getWaveformSrc(prev) }
                    : undefined,
                next
                    ? { src: getSrc(next), waveform: getWaveformSrc(next) }
                    : undefined,
            );
        };
        dispatch(isLoadingAction(true));
        importVisualizer();
        initialize();
        return () => {
            musicPlayer.current.pause();
        };
    }, []);

    React.useEffect(() => {
        if ('mediaSession' in navigator) {
            try {
                navigator.mediaSession.setActionHandler('play', togglePlay);
                navigator.mediaSession.setActionHandler('pause', togglePlay);
                navigator.mediaSession.setActionHandler('nexttrack', () =>
                    playSubsequent('next'),
                );
                navigator.mediaSession.setActionHandler('previoustrack', () =>
                    playSubsequent('prev'),
                );
            } catch (e) {
                console.log('Media session action is not supported');
            }
        }
    }, [togglePlay, playSubsequent]);

    const onEnded = React.useCallback(() => {
        playSubsequent('next', false);
    }, [playSubsequent]);

    const onDrag = React.useCallback((percent: number) => {
        const position = musicPlayer.current.audio.duration * percent;
        dispatch(
            updateAction({
                playbackPosition: position,
            }),
        );
    }, []);

    const onStartDrag = React.useCallback((percent: number) => {
        const audio = musicPlayer.current.audio;

        shouldPlay.current = audio.isPlaying;
        audio.pause();

        audio.positionPercent = percent;
    }, []);

    const seekAudio = React.useCallback((percent: number) => {
        onDrag(percent);
        const audio = musicPlayer.current.audio;
        audio.positionPercent = percent;
        if (shouldPlay.current) {
            audio.play();
        }
    }, []);

    const onScrollDispatch = (triggerHeight: number, scrollTop: number) => {
        dispatch(onScroll({ triggerHeight, scrollTop }));
    };

    const audioCallback = React.useCallback(
        (play?: boolean) => () => {
            if (currentTrack) {
                const audio = musicPlayer.current.audio;
                dispatch(
                    updateAction({
                        playing:
                            play !== undefined && isPlaying !== play
                                ? play
                                : undefined,
                        playbackPosition: audio.currentTime,
                        duration: audio.duration,
                    }),
                );
            }
        },
        [currentTrack, isPlaying],
    );

    const selectTrack = React.useCallback(
        async (musicFile: MusicFileItem, fade?: boolean) => {
            if (musicPlayer.current.context?.state === 'suspended') {
                await musicPlayer.current.context.resume();
            }
            if (musicFile.id !== currentTrack?.id) {
                dispatch(isLoadingAction(true));
                dispatch(setTrackAction(musicFile));
                musicPlayer.current.setTrack(
                    getSrc(musicFile),
                    getWaveformSrc(musicFile),
                    fade,
                );
            }
        },
        [currentTrack],
    );

    const updateRadii = React.useCallback(
        (inner: number, outer: number, base: number) => {
            dispatch(setRadiiAction({ inner, outer, base }));
        },
        [],
    );

    return (
        <div
            css={styles.music}
            onScroll={
                isHamburger
                    ? scrollFn(navBarHeight.get(hiDpx), onScrollDispatch)
                    : undefined
            }
        >
            {screenPortrait && <div css={styles.spacer} />}
            <audio
                id="main"
                crossOrigin="anonymous"
                ref={audio}
                onLoadedData={musicPlayer.current.audioOnLoad}
                onCanPlayThrough={musicPlayer.current.audioOnLoad}
                onPlay={audioCallback(true)}
                onTimeUpdate={audioCallback()}
                onDurationChange={audioCallback()}
                onPause={audioCallback(false)}
                onEnded={onEnded}
                preload="auto"
            />
            <audio
                id="prev"
                crossOrigin="anonymous"
                ref={(el) => (buffers.current.prev = el)}
                preload="auto"
            />
            <audio
                id="next"
                crossOrigin="anonymous"
                ref={(el) => (buffers.current.next = el)}
                preload="auto"
            />
            <div
                css={[
                    styles.visualizerGroup,
                    navBarShow && styles.visualizerGroupPushed,
                ]}
            >
                <AudioUI
                    togglePlay={togglePlay}
                    seekAudio={seekAudio}
                    onStartDrag={onStartDrag}
                    onDrag={onDrag}
                    playSubsequent={playSubsequent}
                />
                <AudioInfo matchParams={!isEmpty(matches?.params)} />
                {visualizerLoaded && Visualizer.current && (
                    <Visualizer.current
                        currentPosition={playbackPosition}
                        musicPlayer={musicPlayer.current}
                        isPlaying={isPlaying}
                        duration={duration}
                        volume={volume}
                        isMobile={
                            (screenM && screenPortrait) ||
                            (screenL && screenLandscape)
                        }
                        isHoverSeekring={isHoverSeekring}
                        hoverAngle={angle}
                        setRadii={updateRadii}
                    />
                )}
            </div>
            <MusicPlaylist onClick={selectTrack} />
        </div>
    );
};

export type MusicType = React.Component<MusicProps>;
export type RequiredProps = Record<never, unknown>;
export default Music;

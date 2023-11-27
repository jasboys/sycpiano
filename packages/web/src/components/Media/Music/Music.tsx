/* global MUSIC_PATH */

import isEmpty from 'lodash-es/isEmpty';
import * as React from 'react';
import {
    NavigateFunction,
    PathMatch,
    useMatch,
    useNavigate,
} from 'react-router-dom';

import { toMedia } from 'src/mediaQuery';
import { onScroll, scrollFn } from 'src/components/App/NavBar/reducers';
import AudioInfo from 'src/components/Media/Music/AudioInfo';
import AudioUI from 'src/components/Media/Music/AudioUI';
import { AudioVisualizerType } from 'src/components/Media/Music/AudioVisualizerBase.jsx';
import MusicPlaylist from 'src/components/Media/Music/MusicPlaylist';

import {
    FetchPlaylistThunkReturn,
    fetchPlaylistThunk,
    getNextTrack,
    isLoadingAction,
    setRadiiAction,
    setTrackAction,
    updateAction,
    volumeAction,
} from 'src/components/Media/Music/reducers';
import { MusicFileItem, MusicListItem } from 'src/components/Media/Music/types';
import {
    getRelativePermaLink,
    getSrc,
    getWaveformSrc,
} from 'src/components/Media/Music/utils';
import module from 'src/module';
import {
    minRes,
    screenM,
    screenPortrait,
    screenShort,
    webkitMinDPR,
} from 'src/screens';
import store, { AppDispatch, GlobalStateShape } from 'src/store';
import { pushed } from 'src/styles/mixins';
import { navBarHeight, playlistContainerWidth } from 'src/styles/variables';
import { useAppDispatch, useAppSelector } from 'src/hooks.js';
import { createSelector, createStructuredSelector } from 'reselect';
import { mqSelectors } from 'src/components/App/reducers.js';
import { MusicPlayer } from './MusicPlayer.js';
import { css } from '@emotion/react';

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
    screenL: mqSelectors.screenL
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

    const audios = React.useRef<
        [HTMLAudioElement | null, HTMLAudioElement | null]
    >([null, null]);
    const shouldPlay = React.useRef<boolean>();
    const nextTrack = React.useRef<MusicFileItem>();

    const { isHamburger, hiDpx, screenPortrait, screenM, screenL, screenLandscape } =
        useAppSelector(mediaSelectors);

    const musicPlayer = React.useRef<MusicPlayer>(
        new MusicPlayer({
            isMobile: isHamburger,
            volumeCallback: (volume: number) => dispatch(volumeAction(volume)),
            loadingCallback: () => dispatch(isLoadingAction(true)),
            loadedCallback: () => dispatch(isLoadingAction(false)),
        }),
    );

    React.useEffect(() => {
        nextTrack.current = getNextTrack(flatItems, currentTrack, 'next', true);
    }, [currentTrack, flatItems]);

    React.useEffect(() => {
        musicPlayer.current.setPhaseRateMultiplier(isHamburger);
    }, [isHamburger]);

    const togglePlay = React.useCallback(() => {
        if (isPlaying) {
            musicPlayer.current.pause();
        } else {
            musicPlayer.current.play();
        }
    }, [isPlaying]);

    const playSubsequent = React.useCallback(
        (which: 'prev' | 'next', fade = true) => {
            const audio = musicPlayer.current.getCurrentAudio();
            if (
                which === 'prev' &&
                audio?.currentTime &&
                audio?.currentTime >= 3
            ) {
                audio.currentTime = 0;
                return;
            }

            const subsequent = getNextTrack(
                flatItems,
                currentTrack,
                which,
                true,
            );
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
            if (
                result.type === fetchPlaylistThunk.rejected.type &&
                currentTrack
            ) {
                return currentTrack;
            }
            return (result.payload as FetchPlaylistThunkReturn).firstTrack;
        } catch (err) {
            console.error('Playlist init failed.', err);
            throw err;
        }
    }, []);

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

    React.useLayoutEffect(() => {
        const initialize = async () => {
            if (!audios.current[0] || !audios.current[1]) {
                throw new Error('audio element ref not created');
            }
            const firstTrack = await waitForPlaylist();
            musicPlayer.current.initialize(
                audios.current[0],
                audios.current[1],
                getSrc(firstTrack),
                getWaveformSrc(firstTrack),
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

    React.useEffect(() => {
        const audio = musicPlayer.current.getCurrentAudio();
        if (audio.currentTime > audio.duration - 9 && nextTrack.current) {
            musicPlayer.current.queueNextBuffer(
                getSrc(nextTrack.current),
                getWaveformSrc(nextTrack.current),
            );
        }
    }, [isShuffle]);

    const onEnded = React.useCallback(() => {
        const next = nextTrack.current;
        if (next) {
            musicPlayer.current.setTrack(
                getSrc(next),
                getWaveformSrc(next),
                false,
            );
            dispatch(setTrackAction(next));
            navigate(
                getRelativePermaLink(
                    next.composer ?? '',
                    next.piece ?? '',
                    next.name,
                ),
            );
        }
    }, []);

    const onDrag = React.useCallback((percent: number) => {
        const position =
            musicPlayer.current.getCurrentAudio().duration * percent;
        dispatch(
            updateAction({
                playbackPosition: position,
            }),
        );
    }, []);

    const onStartDrag = React.useCallback((percent: number) => {
        const audio = musicPlayer.current.getCurrentAudio();

        shouldPlay.current = audio.isPlaying;
        audio.pause();

        audio.positionPercent = percent;
    }, []);

    const seekAudio = React.useCallback((percent: number) => {
        onDrag(percent);
        const audio = musicPlayer.current.getCurrentAudio();
        audio.positionPercent = percent;
        if (shouldPlay.current) {
            audio.play();
        }
        if (audio.currentTime > audio.duration - 9 && nextTrack.current) {
            musicPlayer.current.queueNextBuffer(
                getSrc(nextTrack.current),
                getWaveformSrc(nextTrack.current),
            );
        }
    }, []);

    const onScrollDispatch = (triggerHeight: number, scrollTop: number) => {
        dispatch(onScroll({ triggerHeight, scrollTop }));
    };

    const audioCallback = React.useCallback(
        (buff: 0 | 1, play?: boolean) => () => {
            if (currentTrack) {
                musicPlayer.current.audioCallback(
                    buff,
                    () => {
                        return nextTrack.current
                            ? getSrc(nextTrack.current)
                            : '';
                    },
                    () => {
                        return nextTrack.current
                            ? getWaveformSrc(nextTrack.current)
                            : '';
                    },
                    (currentTime, duration) => {
                        dispatch(
                            updateAction({
                                playing:
                                    play !== undefined && isPlaying !== play
                                        ? play
                                        : undefined,
                                playbackPosition: currentTime,
                                duration: duration,
                            }),
                        );
                    },
                );
            }
        },
        [currentTrack, isPlaying],
    );

    const selectTrack = React.useCallback(
        (musicFile: MusicFileItem, fade?: boolean) => {
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
                id="audio0"
                crossOrigin="anonymous"
                ref={(el) => (audios.current[0] = el)}
                onLoadedData={musicPlayer.current.audioOnLoad(0)}
                onCanPlayThrough={musicPlayer.current.audioOnLoad(0)}
                onPlay={audioCallback(0, true)}
                onTimeUpdate={audioCallback(0)}
                onDurationChange={audioCallback(0)}
                onPause={audioCallback(0, false)}
                onEnded={onEnded}
                preload="auto"
            />
            <audio
                id="audio1"
                crossOrigin="anonymous"
                ref={(el) => (audios.current[1] = el)}
                onLoadedData={musicPlayer.current.audioOnLoad(1)}
                onCanPlayThrough={musicPlayer.current.audioOnLoad(1)}
                onPlay={audioCallback(1, true)}
                onTimeUpdate={audioCallback(1)}
                onDurationChange={audioCallback(1)}
                onPause={audioCallback(1, false)}
                onEnded={onEnded}
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
                        isMobile={(screenM && screenPortrait || screenL && screenLandscape)}
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

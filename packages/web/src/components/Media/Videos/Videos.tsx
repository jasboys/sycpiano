import styled from '@emotion/styled';
import { gsap } from 'gsap';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useMatch } from 'react-router-dom';
import { Transition } from 'react-transition-group';

import { mqSelectors } from 'src/components/App/reducers';
import { LoadingInstance } from 'src/components/LoadingSVG';
import PreviewOverlay from 'src/components/Media/Videos/PreviewOverlay';
import {
    fetchVideoPlaylist,
    playerIsReady,
    playVideo,
    resetPlayer,
} from 'src/components/Media/Videos/reducers';
import VideoPlaylist from 'src/components/Media/Videos/VideoPlaylist';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { toMedia } from 'src/mediaQuery';
import { minRes, screenXS, webkitMinDPR } from 'src/screens';
import youTube from 'src/services/YouTube';
import { pushed } from 'src/styles/mixins';
import { navBarHeight } from 'src/styles/variables';
import { titleStringBase } from 'src/utils';

type VideosProps = Record<never, unknown>;

const StyledVideos = styled.div(pushed, {
    width: '100%',
    backgroundColor: 'black',
    position: 'relative',
    [toMedia([minRes, webkitMinDPR])]: {
        marginTop: 0,
        paddingTop: navBarHeight.hiDpx,
        height: '100%',
    },
    iframe: {
        width: '100%',
        height: '100%',
        [toMedia([minRes, webkitMinDPR])]: {
            position: 'fixed',
            top: navBarHeight.hiDpx,
            height: '56.25vw',
            zIndex: 5,
            boxShadow: '0 0 7px 2px rgba(0 0 0 / 0.5)',
        },
    },
});

const LoadingOverlayDiv = styled.div({
    width: '100%',
    height: '100%',
    zIndex: 11,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255 255 255 / 0.5)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

const LoadingInstanceContainer = styled.div({
    padding: '0.5rem',
    borderRadius: '50%',
    backdropFilter: 'blur(2px)',
    backgroundColor: 'rgba(255 255 255 / 0.8)',
    display: 'flex',
    boxShadow: '0px 3px 5px -2px rgba(0 0 0 / 0.5)',
    svg: {
        fill: 'none',
        stroke: 'var(--light-blue)',
        width: 120,
        height: 120,
    },
    [toMedia(screenXS)]: {
        padding: '0.75rem',
        svg: {
            width: 100,
            height: 100,
        },
    },
});

const Videos: React.FC<VideosProps> = () => {
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
    const match = useMatch('media/videos/:videoId');
    const domElement = React.useRef<HTMLDivElement>(null);
    // const initialized = React.useRef<boolean>(false);
    const dispatch = useAppDispatch();
    const videos = useAppSelector(({ videoPlaylist }) => videoPlaylist.items);
    const isPlayerReady = useAppSelector(
        ({ videoPlayer }) => videoPlayer.isPlayerReady,
    );

    React.useEffect(() => {
        async function callDispatch() {
            if (domElement.current) {
                await Promise.all([
                    dispatch(fetchVideoPlaylist()),
                    youTube.initializePlayerOnElement(domElement.current),
                ]);
                dispatch(playerIsReady());
                if (match?.params.videoId !== undefined) {
                    dispatch(playVideo(isHamburger, match.params.videoId));
                }
            }
        }

        callDispatch();
        return function cleanup() {
            dispatch(resetPlayer());
        };
    }, []);

    const videoId = match?.params.videoId;
    const video =
        videoId !== undefined
            ? videos.find((item) => item.id === videoId)
            : undefined;
    const description = video?.snippet?.description;
    return (
        <>
            {video !== undefined && (
                <Helmet
                    title={`${titleStringBase} | Videos | ${video.snippet?.title}`}
                    meta={[
                        {
                            name: 'description',
                            content: description,
                        },
                    ]}
                />
            )}
            <StyledVideos ref={domElement}>
                <PreviewOverlay isMobile={isHamburger} />
                <Transition<undefined>
                    in={!isPlayerReady}
                    onExit={(el) =>
                        gsap.to(el, { duration: 0.3, autoAlpha: 0 })
                    }
                    timeout={300}
                    mountOnEnter={true}
                    unmountOnExit={true}
                >
                    <LoadingOverlayDiv>
                        <LoadingInstanceContainer>
                            <LoadingInstance />
                        </LoadingInstanceContainer>
                    </LoadingOverlayDiv>
                </Transition>
                <VideoPlaylist />
            </StyledVideos>
        </>
    );
};

export type VideosType = typeof Videos;
export type RequiredProps = VideosProps;
export default Videos;

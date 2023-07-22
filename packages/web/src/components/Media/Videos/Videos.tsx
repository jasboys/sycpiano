import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useMatch } from 'react-router-dom';
import { Transition } from 'react-transition-group';
import youTube from 'src/services/YouTube';

import styled from '@emotion/styled';

import { gsap } from 'gsap';

import { LoadingInstance } from 'src/components/LoadingSVG';
import PreviewOverlay from 'src/components/Media/Videos/PreviewOverlay';
import VideoPlaylist from 'src/components/Media/Videos/VideoPlaylist';

import { fetchVideoPlaylist, playerIsReady, playVideo, resetPlayer } from 'src/components/Media/Videos/reducers';

import { pushed } from 'src/styles/mixins';
import { minRes, webkitMinDPR } from 'src/screens';
import { navBarHeight } from 'src/styles/variables';
import { titleStringBase } from 'src/utils';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { toMedia } from 'src/mediaQuery';
import { mqSelectors } from 'src/components/App/reducers';

type VideosProps = Record<never, unknown>;

const StyledVideos = styled.div`
    ${pushed}
    width: 100%;
    background-color: black;
    position: relative;

    ${toMedia([minRes, webkitMinDPR])} {
        margin-top: 0;
        padding-top: ${navBarHeight.hiDpx}px;
        height: 100%;
    }

    iframe {
        width: 100%;
        height: 100%;

        ${toMedia([minRes, webkitMinDPR])} {
            position: fixed;
            top: ${navBarHeight.hiDpx}px;
            height: 56.25vw;
            z-index: 5;
            box-shadow: 0 0 7px 2px rgba(0 0 0 / 0.5);
        }
    }
`;

const LoadingOverlayDiv = styled.div`
    width: 100%;
    height: 100%;
    z-index: 11;
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(60 60 60 / 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Videos: React.FC<VideosProps> = () => {
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
    const match = useMatch('media/videos/:videoId');
    const domElement = React.useRef<HTMLDivElement>(null);
    // const initialized = React.useRef<boolean>(false);
    const dispatch = useAppDispatch();
    const videos = useAppSelector(({ videoPlaylist }) => videoPlaylist.items);
    const isPlayerReady = useAppSelector(({ videoPlayer }) => videoPlayer.isPlayerReady);

    React.useEffect(() => {
        async function callDispatch() {
            if (domElement.current) {
                await Promise.all([
                    dispatch(fetchVideoPlaylist()),
                    youTube.initializePlayerOnElement(domElement.current)
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
        }
    }, []);

    const videoId = match?.params.videoId;
    const video = videoId !== undefined ? videos.find((item) => item.id === videoId) : undefined;
    const description = video?.snippet?.description;
    return (
        <>
            {(video !== undefined) && (
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
            <StyledVideos
                ref={domElement}
            >
                <PreviewOverlay isMobile={isHamburger} />
                <Transition<undefined>
                    in={!isPlayerReady}
                    onExit={(el) => gsap.to(el, { duration: 0.3, autoAlpha: 0 })}
                    timeout={300}
                    mountOnEnter={true}
                    unmountOnExit={true}
                >
                    <LoadingOverlayDiv>
                        <LoadingInstance width={120} height={120} />
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
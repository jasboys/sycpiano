import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { gsap } from 'gsap';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useMatch, useNavigate } from 'react-router-dom';
import { Transition } from 'react-transition-group';

import { LoadingInstance } from 'src/components/LoadingSVG';
import PreviewOverlay from 'src/components/Media/Videos/PreviewOverlay';
import { videoStore } from 'src/components/Media/Videos/store.js';
import VideoPlaylist from 'src/components/Media/Videos/VideoPlaylist';
import { toMedia } from 'src/mediaQuery';
import { minRes, screenPortrait, screenXS, webkitMinDPR } from 'src/screens';
import youTube from 'src/services/YouTube';
import { pushed } from 'src/styles/mixins';
import { navBarHeight } from 'src/styles/variables';
import { titleStringBase } from 'src/utils';
import { useStore } from 'src/store.js';
import type { VideoItemShape } from './types.js';

type VideosProps = Record<never, unknown>;

const StyledVideos = styled.div(pushed, {
    width: '100%',
    backgroundColor: 'black',
    position: 'relative',
    [toMedia(screenPortrait)]: {
        marginTop: 0,
        paddingTop: navBarHeight.lowDpx,
        height: '100%',
        [toMedia([webkitMinDPR, minRes])]: {
            paddingTop: navBarHeight.hiDpx,
        },
    },
    iframe: {
        width: '100%',
        height: '100%',
        [toMedia(screenPortrait)]: {
            position: 'fixed',
            top: navBarHeight.lowDpx,
            height: '56.25vw',
            zIndex: 5,
            boxShadow: '0 0 7px 2px rgba(0 0 0 / 0.5)',
            [toMedia([webkitMinDPR, minRes])]: {
                top: navBarHeight.hiDpx,
            },
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

const fetchVideos = async (): Promise<VideoItemShape[]> => {
    const playlistResponse = await youTube.getPlaylistItems();
    const videoItems: (Youtube.PlaylistItem & Youtube.Video)[] =
        playlistResponse.data.items.filter((item: Youtube.PlaylistItem) => {
            return (
                item?.snippet?.thumbnails &&
                Object.keys(item.snippet.thumbnails).length !== 0
            );
        });
    const videoIds = videoItems.reduce(
        (prev: string[], item: Youtube.PlaylistItem) => {
            if (item?.snippet?.resourceId?.videoId !== undefined) {
                prev.push(item.snippet.resourceId.videoId);
                return prev;
            }
            return prev;
        },
        [],
    );
    const videosResponse = await youTube.getVideos(videoIds);
    for (const item of videosResponse.data.items) {
        const idx = videoItems.findIndex(
            (vi) => vi.snippet?.resourceId?.videoId === item.id,
        );
        if (idx >= 0) {
            videoItems[idx] = { ...videoItems[idx], ...item };
        }
    }
    return videoItems;
};

const Videos: React.FC<VideosProps> = () => {
    const isHamburger = useStore().mediaQueries.isHamburger();
    const isPlayerReady = videoStore.use.isPlayerReady();
    const match = useMatch('media/videos/:videoId');
    const domElement = React.useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const { data: videos } = useQuery({
        queryKey: ['videoPlaylist'],
        queryFn: fetchVideos,
    });

    React.useEffect(() => {
        async function loadYoutubeElement() {
            if (domElement.current) {
                await youTube.initializePlayerOnElement(domElement.current);
                videoStore.set.playerIsReady();
            }
        }

        loadYoutubeElement();
        return function cleanup() {
            videoStore.set.resetPlayer();
        };
    }, []);

    React.useEffect(() => {
        if (videos?.length && isPlayerReady) {
            if (
                match?.params.videoId !== undefined &&
                videos.find((i) => i.id === videoId)
            ) {
                videoStore.set.videoId(match.params.videoId);
            } else {
                videoStore.set.videoId(videos[0].id);
                navigate(`/media/videos/${videos[0].id}`);
            }
        }
    }, [videos, isPlayerReady]);

    const videoId = match?.params.videoId;
    const video =
        videos && videoId !== undefined
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
                <VideoPlaylist videos={videos} />
            </StyledVideos>
        </>
    );
};

export type VideosType = typeof Videos;
export type RequiredProps = VideosProps;
export default Videos;

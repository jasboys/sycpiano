import styled from '@emotion/styled';
import { gsap } from 'gsap';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import { formatTime } from 'src/components/Media/Music/utils';
import { staticImage } from 'src/imageUrls.js';
import { toMedia } from 'src/mediaQuery';
import { minRes, screenPortrait, webkitMinDPR } from 'src/screens';
import { latoFont } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';
import { metaDescriptions, titleStringBase } from 'src/utils';
import { musicStore } from './store.js';
import { shallow } from 'zustand/shallow';
import { useStore } from 'src/store.js';

interface AudioInfoProps {
    matchParams: boolean;
}

const AudioInfoContainer = styled.div(noHighlight, latoFont(200), {
    width: '100%',
    height: '100%',
    zIndex: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    textAlign: 'center',
    letterSpacing: 2,
    color: 'white',
    paddingBlock: '3rem',

    [toMedia(screenPortrait)]: {
        top: 0,
        paddingBottom: '1rem',
    },
});

const ComposerTitle = styled.div({
    padding: '0 1.25rem',
    fontSize: '2.0rem',
    lineHeight: '3.2rem',
    width: '100%',
    overflowX: 'hidden',

    [toMedia([minRes, webkitMinDPR])]: {
        whiteSpace: 'nowrap',
        fontSize: '1.4rem',
        lineHeight: '2rem',
    },
});

const Marquee = styled.div({
    width: 'fit-content',
    position: 'relative',
    whiteSpace: 'nowrap',

    span: {
        display: 'inline-block',
        '&:last-child': {
            margin: '0 200px',
        },
    },
});

const ContributingOrDuration = styled.div({
    padding: '0 0.625rem',
    fontSize: '1.5rem',
    lineHeight: '2.6rem',

    [toMedia([minRes, webkitMinDPR])]: {
        fontSize: '1.1rem',
        lineHeight: '1.5rem',
    },
});

const AudioInfo: React.FC<AudioInfoProps> = ({ matchParams }) => {
    const timeline = React.useRef<GSAPTimeline>();
    const titleDiv = React.useRef<HTMLDivElement>(null);
    const marquee = React.useRef<HTMLDivElement>(null);
    const secondSpan = React.useRef<HTMLSpanElement>(null);

    const [forceUpdate, setForceUpdate] = React.useState<number>(0);
    const isHamburger = useStore().mediaQueries.isHamburger();

    const {
        isPlaying,
        playbackPosition,
        playbackTimeString,
        currentTrack,
        duration,
    } = musicStore.useStore(
        (state) => ({
            isPlaying: state.isPlaying,
            playbackPosition: state.playbackPosition,
            playbackTimeString: formatTime(state.playbackPosition),
            currentTrack: state.currentTrack,
            duration: state.duration,
        }),
        shallow,
    );
    const currentTrackId = currentTrack?.id;

    React.useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            timeline.current?.kill();
            if (marquee.current && titleDiv.current && secondSpan.current) {
                marquee.current.removeAttribute('style');
                titleDiv.current.removeAttribute('style');
                const divWidth = titleDiv.current.offsetWidth;
                const spanWidth = (
                    marquee.current.children[0] as HTMLDivElement
                ).offsetWidth;
                if (divWidth > spanWidth) {
                    marquee.current.style.left = `${
                        (divWidth - spanWidth) / 2
                    }px`;
                    titleDiv.current.style.padding = '0';
                    secondSpan.current.style.visibility = 'hidden';
                } else {
                    const dur = marquee.current.offsetWidth / 100;
                    timeline.current = gsap
                        .timeline({ repeat: -1 })
                        .fromTo(
                            marquee.current,
                            { x: '0%' },
                            {
                                duration: dur,
                                x: '-50%',
                                ease: 'linear',
                                clearProps: 'transform',
                                delay: 3,
                            },
                        )
                        .play();
                    secondSpan.current.style.visibility = 'unset';
                }
            }
        });
        return () => ctx.revert();
    }, [currentTrackId, forceUpdate]);

    React.useEffect(() => {
        function windowListenerFn() {
            setForceUpdate(Math.random());
        }
        window.addEventListener('resize', windowListenerFn);
        return () => {
            window.removeEventListener('resize', windowListenerFn);
        };
    }, []);

    const {
        piece = '',
        composer = '',
        contributors = '',
        year = null,
        name: movement = '',
    } = currentTrack || {};

    const contribArray =
        contributors === '' || contributors === null
            ? undefined
            : contributors.split(', ');
    const composerTitle = `${composer} ${piece}${year ? ` (${year})` : ''}`;
    const composerTitleWithMovement =
        composerTitle + (movement ? ` - ${movement}` : '');
    const metaTitle = `Music | ${composerTitleWithMovement}`;
    const marqueeText = composerTitleWithMovement;

    React.useEffect(() => {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: composerTitleWithMovement,
            artist: 'Sean Chen',
            album: 'seanchenpiano.com',
            artwork: [
                { src: `${staticImage('/syc_withpiano_square_512.jpg')}` },
            ],
        });
    }, [composerTitleWithMovement]);

    React.useEffect(() => {
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }, [isPlaying]);

    React.useEffect(() => {
        navigator.mediaSession.setPositionState({
            duration: duration === -1 ? 0 : duration,
            playbackRate: 1,
            position: playbackPosition,
        });
    }, [isPlaying, playbackPosition, duration]);

    return (
        <>
            {matchParams && (
                <Helmet
                    title={`${titleStringBase}${metaTitle}`}
                    meta={[
                        {
                            name: 'description',
                            content: metaDescriptions.getMusic(
                                composerTitleWithMovement,
                                contributors,
                            ),
                        },
                    ]}
                />
            )}
            <AudioInfoContainer>
                <ComposerTitle ref={titleDiv}>
                    <Marquee ref={marquee}>
                        <span>{marqueeText}</span>
                        <span ref={secondSpan}>{marqueeText}</span>
                    </Marquee>
                </ComposerTitle>
                {contribArray &&
                    (isHamburger ? (
                        contribArray.map((contributor) => (
                            <ContributingOrDuration key={contributor}>
                                {contributor}
                            </ContributingOrDuration>
                        ))
                    ) : (
                        <ContributingOrDuration>
                            {contributors}
                        </ContributingOrDuration>
                    ))}
                <ContributingOrDuration>
                    {`${playbackTimeString} / ${formatTime(duration)}`}
                </ContributingOrDuration>
            </AudioInfoContainer>
        </>
    );
};

export default React.memo(AudioInfo);

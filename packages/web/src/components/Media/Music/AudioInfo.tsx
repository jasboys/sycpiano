import styled from '@emotion/styled';
import { gsap } from 'gsap';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import { toMedia } from 'src/mediaQuery';
import { MusicFileItem } from 'src/components/Media/Music/types';
import { formatTime } from 'src/components/Media/Music/utils';
import { minRes, screenM, screenPortrait, webkitMinDPR } from 'src/screens';
import { latoFont } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';
import { navBarHeight, playlistContainerWidth } from 'src/styles/variables';
import { metaDescriptions, titleStringBase } from 'src/utils';

interface AudioInfoProps {
    currentTrack?: MusicFileItem;
    duration: number;
    currentPosition: number;
    isMobile: boolean;
    matchParams: boolean;
}

const AudioInfoContainer = styled.div(noHighlight, latoFont(200), {
    width: `calc(100% - ${playlistContainerWidth.desktop})`,
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

    [toMedia(screenM)]: {
        width: `calc(100% - ${playlistContainerWidth.tablet})`,
    },

    [toMedia(screenPortrait)]: {
        width: '100%',
        height: 360,
        top: navBarHeight.hiDpx,
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

// const Movement = styled.div({
//     padding: '0 0.625rem',
//     fontSize: '2.0rem',
//     lineHeight: '3.2rem',
// });

const ContributingOrDuration = styled.div({
    padding: '0 0.625rem',
    fontSize: '1.5rem',
    lineHeight: '2.6rem',

    [toMedia([minRes, webkitMinDPR])]: {
        fontSize: '1.1rem',
        lineHeight: '1.5rem',
    },
});

class AudioInfo extends React.PureComponent<AudioInfoProps> {
    private tween: gsap.core.Tween | undefined;
    private titleDiv: React.RefObject<HTMLDivElement> = React.createRef();
    private marquee: React.RefObject<HTMLDivElement> = React.createRef();
    private secondSpan: React.RefObject<HTMLSpanElement> = React.createRef();

    recalculateMarquee = () => {
        this.tween?.kill();
        if (
            this.marquee.current &&
            this.titleDiv.current &&
            this.secondSpan.current
        ) {
            this.marquee.current.removeAttribute('style');
            this.titleDiv.current.removeAttribute('style');
            const divWidth = this.titleDiv.current.offsetWidth;
            const spanWidth = (
                this.marquee.current.children[0] as HTMLDivElement
            ).offsetWidth;
            if (divWidth > spanWidth) {
                this.marquee.current.style.left = `${
                    (divWidth - spanWidth) / 2
                }px`;
                this.titleDiv.current.style.padding = '0';
                this.secondSpan.current.style.visibility = 'hidden';
            } else {
                const dur = this.marquee.current.offsetWidth / 100;
                this.tween = gsap.fromTo(
                    this.marquee.current,
                    { x: '0%' },
                    {
                        duration: dur,
                        x: '-50%',
                        ease: 'linear',
                        clearProps: 'transform',
                        delay: 3,
                        onComplete: () => {
                            this.tween?.restart(true);
                        },
                    },
                );
                this.secondSpan.current.style.visibility = 'unset';
            }
        }
    };

    componentDidUpdate(prevProps: AudioInfoProps) {
        if (
            this.props.currentTrack &&
            (!prevProps.currentTrack ||
                prevProps.currentTrack.id !== this.props.currentTrack.id)
        ) {
            this.recalculateMarquee();
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.recalculateMarquee);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.recalculateMarquee);
    }

    render() {
        const { isMobile, currentPosition, duration } = this.props;

        const {
            piece = '',
            composer = '',
            contributors = '',
            year = null,
        } = (this.props.currentTrack && this.props.currentTrack) || {};

        const { name: movement = '' } = this.props.currentTrack || {};

        const contribArray =
            contributors === '' || contributors === null
                ? undefined
                : contributors.split(', ');
        const composerTitle = `${composer} ${piece}${year ? ` (${year})` : ''}`;
        const composerTitleWithMovement =
            composerTitle + (movement ? ` - ${movement}` : '');
        const metaTitle = ` | Music | ${composerTitleWithMovement}`;
        const marqueeText = composerTitleWithMovement
        return (
            <>
                {this.props.matchParams && (
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
                    <ComposerTitle ref={this.titleDiv}>
                        <Marquee ref={this.marquee}>
                            <span>{marqueeText}</span>
                            <span ref={this.secondSpan}>{marqueeText}</span>
                        </Marquee>
                    </ComposerTitle>
                    {contribArray &&
                        (isMobile ? (
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
                        {`${formatTime(currentPosition)} / ${formatTime(
                            duration,
                        )}`}
                    </ContributingOrDuration>
                </AudioInfoContainer>
            </>
        );
    }
}

export default AudioInfo;

import * as React from 'react';
import Markdown from 'markdown-to-jsx';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { fetchBio } from 'src/components/About/Bio/reducers';
import { Blurb } from 'src/components/About/Bio/types';
import { onScroll, scrollFn } from 'src/components/App/NavBar/reducers';

import { easeQuadOut } from 'd3-ease';
import { gsap } from 'gsap';

import PortfolioButton from 'src/components/About/Bio/PortfolioButton';
import { LazyImage } from 'src/components/LazyImage';

import { offWhite } from 'src/styles/colors';
import { lato2, lato3 } from 'src/styles/fonts';
import { generateSrcsetWidths, resizedImage, sycWithPianoBW } from 'src/imageUrls';
import { pushed } from 'src/styles/mixins';
import { isHamburger, screenLengths, screenM, screenPortrait, screenWidths, screenXS } from 'src/screens';
import { camel2var, navBarHeight } from 'src/styles/variables';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { isImageElement } from 'src/utils';
import { toMedia } from 'src/mediaQuery';
import { mqSelectors } from 'src/components/App/reducers';
import { createStructuredSelector } from 'reselect';

const pictureHeight = 250;

const Paragraph = styled.p({
    fontFamily: lato2,
    fontSize: '1.2rem',
    lineHeight: '2rem',
    margin: '1.6rem 0',

    [toMedia(isHamburger)]: {
        '&:first-of-type': {
            marginTop: 0,
        }
    },

    [toMedia(screenM)]: {
        fontSize: '1rem',
    },

    [toMedia([screenXS, screenPortrait])]: {
        fontSize: '1rem',
        lineHeight: '1.6rem',
        margin: '1.3rem 0',
        '&:last-of-type': {
            marginBottom: '3rem'
        }
    }
});

const SpaceFiller = styled.div({
    display: 'none',

    [toMedia([screenXS, screenPortrait])]: {
        display: 'block',
        minHeight: pictureHeight,
        height: 'min(50vw, 33vh)',
        width: '100%',
        backgroundColor: 'transparent',
    }
});

const TextGroup = styled.div({
    [toMedia([screenXS, screenPortrait])]: {
        backgroundColor: 'white',
        padding: '20px 20px',
    },
    fontFamily: lato2
});

const TextContainer = styled.div({
    boxSizing: 'border-box',
    flex: '1 0 45%',
    height: 'auto',
    padding: '3rem 40px 80px 60px',
    backgroundColor: offWhite,
    color: 'black',
    overflowY: 'scroll',

    [toMedia(screenM)]: {
        padding: '2rem 2rem 5rem 3rem',
    },

    [toMedia([screenXS, screenPortrait])]: {
        position: 'relative',
        zIndex: 1,
        marginTop: 0,
        height: '100%',
        left: 0,
        backgroundColor: 'transparent',
        padding: 0,
        overflowY: 'visible',
    },
});

const NameSpan = styled.span({
    fontFamily: lato3,
});

const Title = styled.div({
    fontFamily: lato3,
    fontSize: '2rem',
});

interface BioTextProps {
    bio: Blurb[];
    needsTitle: boolean;
}

const BioText: React.FunctionComponent<BioTextProps> = (props) => {
    return (
        <TextContainer>
            <SpaceFiller />
            {props.needsTitle && <Title>Biography</Title> }
            <TextGroup>
                {props.bio.map(({ text }, i) => {
                    return (
                        <Markdown
                            key={i}
                            options={{
                                forceBlock: true,
                                overrides: {
                                    p: Paragraph,
                                    strong: NameSpan,
                                }
                            }}
                        >
                            {text}
                        </Markdown>
                    );
                })}
            </TextGroup>
        </TextContainer>
    );
};

const MemoizedBioText = React.memo(BioText, (prev, next) => {
    return prev.bio.length === next.bio.length && prev.needsTitle === next.needsTitle;
});

interface ImageContainerProps { bgImage?: string }

const ImageContainer = styled.div<ImageContainerProps>({
    flex: '0 1 50vw',
    backgroundSize: 'cover',
    backgroundPosition: 'center 25%',
    backgroundAttachment: 'initial',
    backgroundRepeat: 'no-repeat',
    backgroundColor: 'black',
    visibility: 'hidden',

    [toMedia(screenM)]: {
        backgroundSize: 'cover',
        backgroundPosition: 'center 0',
    },

    [toMedia([screenXS, screenPortrait])]: {
        position: 'fixed',
        zIndex: 0,
        minHeight: pictureHeight,
        height: 'min(50vw, 33vh)',
        width: '100%',
        backgroundSize: '106%',
        backgroundPosition: 'center 15%',
        maxWidth: 'unset',
        paddingTop: camel2var('navBarHeight'),
    },
}, ({ bgImage }) => ({
    backgroundImage: bgImage ? `url(${bgImage})` : 'unset',
}));

const BioContainer = styled.div(
    pushed,
    {
        width: '100%',
        backgroundColor: 'black',
        position: 'absolute',
        display: 'flex',
        [toMedia([screenXS, screenPortrait])]: {
            marginTop: 0,
            display: 'block',
            height: '100%',
            overflowY: 'scroll',
            backgroundColor: 'white',
            paddingTop: camel2var('navBarHeight'),
        },
    });

const IMAGE_RATIO = 1736 / 2560;

const srcWidths = screenLengths.map((value) => (
    Math.round(value * IMAGE_RATIO)
));

const imageLoaderStyle = css({
    visibility: 'hidden',
    position: 'absolute',
});

const selector = createStructuredSelector({
    hiDpx: mqSelectors.hiDpx,
    screenPortrait: mqSelectors.screenPortrait,
    screenXS: mqSelectors.screenXS,
    isHamburger: mqSelectors.isHamburger,
});

const Bio: React.FunctionComponent<Record<never, unknown>> = () => {
    const { hiDpx, isHamburger, screenXS, screenPortrait } = useAppSelector(selector);
    const [bgImage, setBgImage] = React.useState('');
    const bgRef = React.useRef<HTMLImageElement>(null);
    const dispatch = useAppDispatch();
    const bio = useAppSelector(({ bio }) => bio.bio);
    const scrollTop = useAppSelector(({ navbar }) => navbar.lastScrollTop);

    React.useEffect(() => {
        dispatch(fetchBio());
    }, []);

    React.useEffect(() => {
        if (bgRef.current) {
            if (screenXS || screenPortrait) {
                const height = parseInt(window.getComputedStyle(bgRef.current).height);
                const float = easeQuadOut(Math.max(1 - scrollTop / height, 0));
                const rounded = Math.round((float + Number.EPSILON) * 100) / 100;
                bgRef.current.style.opacity = rounded.toFixed(2);
            } else {
                bgRef.current.style.opacity = '1.0';
            }
        }
    }, [scrollTop, screenXS, screenPortrait]);

    React.useEffect(() => {
        if (bgRef.current) {
            gsap.to(
                bgRef.current,
                { autoAlpha: 1, duration: 0.3, delay: 0.2, clearProps: 'opacity' });
        }
    }, [bgImage]);

    const onImageLoad = React.useCallback((el: HTMLImageElement | Element | undefined) => {
        if (el && isImageElement(el)) {
            setBgImage(el.currentSrc);
        }
    }, []);

    const onImageDestroy = React.useCallback(() => {
        if (bgRef.current) {
            gsap.to(
                bgRef.current,
                { autoAlpha: 0, duration: 0.1 },
            );
        }
    }, []);

    const onScrollDispatch = React.useCallback((triggerHeight: number, scrollTop: number) => {
        dispatch(onScroll({ triggerHeight, scrollTop }));
    }, []);

    return (
        <BioContainer onScroll={
            isHamburger ?
                (ev) => {
                    if (bgRef.current) {
                        const height = parseInt(window.getComputedStyle(bgRef.current).height);
                        scrollFn(height + navBarHeight.get(hiDpx), onScrollDispatch)(ev);
                    }
                }
                : undefined
            }
        >
            <ImageContainer
                bgImage={bgImage}
                ref={bgRef}
            >
                <LazyImage
                    isMobile={isHamburger}
                    id="about_lazy_image"
                    csss={{
                        mobile: imageLoaderStyle,
                        desktop: imageLoaderStyle,
                    }}
                    mobileAttributes={{
                        webp: {
                            srcset: generateSrcsetWidths(sycWithPianoBW('webp'), screenWidths),
                            sizes: '100vw',
                        },
                        jpg: {
                            srcset: generateSrcsetWidths(sycWithPianoBW(), screenWidths),
                            sizes: '100vw',
                        },
                        src: resizedImage(sycWithPianoBW(), { width: 640 }),
                    }}
                    desktopAttributes={{
                        webp: {
                            srcset: generateSrcsetWidths(sycWithPianoBW('webp'), srcWidths),
                            sizes: '100vh',
                        },
                        jpg: {
                            srcset: generateSrcsetWidths(sycWithPianoBW(), srcWidths),
                            sizes: '100vh',
                        },
                        src: resizedImage(sycWithPianoBW(), { height: 1080 }),
                    }}
                    alt="about background"
                    successCb={onImageLoad}
                    destroyCb={onImageDestroy}
                />
            </ImageContainer>
            <MemoizedBioText bio={bio} needsTitle={!isHamburger}/>
            <PortfolioButton />
        </BioContainer>
    );
}

export type BioType = typeof Bio;
export type RequiredProps = React.ComponentProps<typeof Bio>;
export default Bio;

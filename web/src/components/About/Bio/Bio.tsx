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
import { generateSrcsetWidths, resizedImage, sycWithPianoBW } from 'src/styles/imageUrls';
import { pushed } from 'src/styles/mixins';
import { screenLengths, screenM, screenWidths, screenXSorPortrait } from 'src/styles/screens';
import { navBarHeight } from 'src/styles/variables';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { isImageElement } from 'src/utils';

const pictureHeight = 250;

const Paragraph = styled.p({
    fontFamily: lato2,
    fontSize: '1.2em',
    lineHeight: '2em',
    margin: '1.6em 0',

    [screenM]: {
        fontSize: '1em',
    },

    [screenXSorPortrait]: {
        fontSize: '1em',
        lineHeight: '1.6em',
        margin: '1.3em 0',
    }
});

const SpaceFiller = styled.div({
    display: 'none',

    [screenXSorPortrait]: {
        display: 'block',
        height: pictureHeight,
        width: '100%',
        backgroundColor: 'transparent',
    }
});

const TextGroup = styled.div({
    [screenXSorPortrait]: {
        backgroundColor: 'white',
        padding: '20px 20px',
    }
});

const TextContainer = styled.div({
    boxSizing: 'border-box',
    flex: '0 0 45%',
    height: 'auto',
    padding: '20px 40px 80px 60px',
    backgroundColor: offWhite,
    color: 'black',
    overflowY: 'scroll',

    [screenXSorPortrait]: {
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

interface BioTextProps {
    bio: Blurb[];
}

const BioText: React.FunctionComponent<BioTextProps> = (props) => {
    return (
        <TextContainer>
            <SpaceFiller />
            <TextGroup>
                {props.bio.map(({ text }, i) => {
                    return (
                        <Markdown
                            key={i}
                            options={{
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

const MemoizedBioText = React.memo(BioText, (prev, next) => { return prev.bio.length === next.bio.length; });

interface ImageContainerProps { bgImage?: string }

const ImageContainer = styled.div<ImageContainerProps>({
    flex: 1,
    backgroundSize: 'cover',
    backgroundPosition: 'center 100px',
    backgroundAttachment: 'initial',
    backgroundRepeat: 'no-repeat',
    backgroundColor: 'black',
    visibility: 'hidden',

    [screenM]: {
        backgroundSize: 'cover',
        backgroundPosition: 'center 0',
    },

    [screenXSorPortrait]: {
        position: 'fixed',
        zIndex: 0,
        top: navBarHeight.mobile,
        height: pictureHeight,
        width: '100%',
        backgroundSize: '106%',
        backgroundPosition: 'center 15%',
    }
}, ({ bgImage }) => ({
    backgroundImage: bgImage ? `url(${bgImage})` : 'unset',
    // opacity: easeQuadOut(Math.max(1 - currScrollTop / pictureHeight, 0)),
}));

const BioContainer = styled.div(
    pushed,
    {
        width: '100%',
        backgroundColor: 'black',
        position: 'absolute',
        display: 'flex',
        [screenXSorPortrait]: {
            marginTop: 0,
            paddingTop: navBarHeight.mobile,
            display: 'block',
            height: '100%',
            overflowY: 'scroll',
            WebkitOverflowScrolling: 'touch',
            backgroundColor: 'white',
        },
    });

const srcWidths = screenLengths.map((value) => (
    Math.round(value * 1736 / 2560)
));

interface BioProps {
    readonly isMobile: boolean;
}

const imageLoaderStyle = css({
    visibility: 'hidden',
    position: 'absolute',
});

const Bio: React.FunctionComponent<BioProps> = (props) => {
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
            bgRef.current.style.opacity = easeQuadOut(Math.max(1 - scrollTop / pictureHeight, 0)).toString();
        }
    }, [scrollTop]);

    React.useEffect(() => {
        if (bgRef.current) {
            gsap.to(
                bgRef.current,
                { autoAlpha: 1, duration: 0.3, delay: 0.2, clearProps: 'opacity' });
        }
    }, [bgImage]);

    const onImageLoad = (el: HTMLImageElement | Element | undefined) => {
        if (el && isImageElement(el)) {
            setBgImage(el.currentSrc);
        }
    };

    const onImageDestroy = () => {
        if (bgRef.current) {
            gsap.to(
                bgRef.current,
                { autoAlpha: 0, duration: 0.1 },
            );
        }
    };

    const onScrollDispatch = (triggerHeight: number, scrollTop: number) => {
        dispatch(onScroll({ triggerHeight, scrollTop }));
    };

    return (
        <BioContainer onScroll={props.isMobile ? scrollFn(pictureHeight + navBarHeight.mobile, onScrollDispatch) : undefined}>
            <ImageContainer
                bgImage={bgImage}
                ref={bgRef}
            >
                <LazyImage
                    isMobile={props.isMobile}
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
            <MemoizedBioText bio={bio} />
            <PortfolioButton />
        </BioContainer>
    );
}

export type BioType = typeof Bio;
export type RequiredProps = BioProps;
export default Bio;

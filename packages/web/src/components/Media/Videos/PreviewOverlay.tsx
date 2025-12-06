import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { gsap } from 'gsap';
import * as React from 'react';
import { Transition } from 'react-transition-group';
import { LazyImage } from 'src/components/LazyImage';
import { cliburn1, generateSrcsetWidths, resizedImage } from 'src/imageUrls';
import { toMedia } from 'src/mediaQuery';
import {
    minRes,
    screenLengths,
    screenPortrait,
    screenWidths,
    webkitMinDPR,
} from 'src/screens';
import { navBarHeight } from 'src/styles/variables';
import { isImageElement } from 'src/utils';
import { videoStore } from './store.js';

type PreviewOverlayProps = { isMobile: boolean };

const StyledPreviewOverlay = styled.div<{ bgImage?: string }>(
    {
        width: '100%',
        height: '100%',
        zIndex: 10,
        position: 'absolute',
        top: 0,
        left: 0,

        [toMedia(screenPortrait)]: {
            height: '56.25vw',
            top: navBarHeight.lowDpx,
            position: 'fixed',
            [toMedia([minRes, webkitMinDPR])]: {
                top: navBarHeight.hiDpx,
            },
        },

        '&:hover': {
            cursor: 'pointer',
        },

        svg: {
            position: 'relative',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fill: '#030303',
            stroke: 'none',
        },
    },
    ({ bgImage }) =>
        bgImage && {
            backgroundImage: `url(${bgImage})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
        },
);

const ytIconStyle = css({
    transition: 'all 0.2s',
    [`${StyledPreviewOverlay}:hover &`]: {
        fill: '#cc181e',
        fillOpacity: 1,
    },
});

const imageLoaderStyle = css({
    visibility: 'hidden',
    position: 'absolute',
});

const PreviewOverlay: React.FC<PreviewOverlayProps> = (props) => {
    const [bgImage, setBgImage] = React.useState('');
    const bgRef = React.useRef<HTMLDivElement>(null);
    const isPreviewOverlay = videoStore.use.isPreviewOverlay();

    React.useEffect(() => {
        if (bgRef.current) {
            gsap.to(bgRef.current, {
                autoAlpha: 1,
                duration: 0.3,
                delay: 0.2,
                clearProps: 'opacity',
            });
        }
    }, [bgImage]);

    const onImageLoad = React.useCallback(
        (el: HTMLImageElement | HTMLElement | Element | undefined) => {
            if (el && isImageElement(el)) {
                setBgImage(el.currentSrc);
            }
        },
        [],
    );

    const clickCallback = React.useCallback(() => {
        videoStore.set.playVideo(undefined, props.isMobile);
    }, [props.isMobile]);

    return (
        <Transition
            in={isPreviewOverlay}
            onExit={() => {
                gsap.fromTo(bgRef.current, { opacity: 1, duration: 0.3 }, { opacity: 0 });
            }}
            timeout={300}
            unmountOnExit={true}
            mountOnEnter={true}
            nodeRef={bgRef}
        >
            <StyledPreviewOverlay
                onClick={clickCallback}
                bgImage={bgImage}
                ref={bgRef}
            >
                <svg viewBox="0 0 68 48" width="68" height="48">
                    <title>YouTube Preview Button</title>
                    <path
                        css={ytIconStyle}
                        d="m .66,37.62 c 0,0 .66,4.70 2.70,6.77 2.58,2.71 5.98,2.63 7.49,2.91 5.43,.52 23.10,.68 23.12,.68 .00,-1.3e-5 14.29,-0.02 23.81,-0.71 1.32,-0.15 4.22,-0.17 6.81,-2.89 2.03,-2.07 2.70,-6.77 2.70,-6.77 0,0 .67,-5.52 .67,-11.04 l 0,-5.17 c 0,-5.52 -0.67,-11.04 -0.67,-11.04 0,0 -0.66,-4.70 -2.70,-6.77 C 62.03,.86 59.13,.84 57.80,.69 48.28,0 34.00,0 34.00,0 33.97,0 19.69,0 10.18,.69 8.85,.84 5.95,.86 3.36,3.58 1.32,5.65 .66,10.35 .66,10.35 c 0,0 -0.55,4.50 -0.66,9.45 l 0,8.36 c .10,4.94 .66,9.45 .66,9.45 z"
                        fill="#1f1f1e"
                        fillOpacity="0.81"
                    />
                    <path
                        d="m 26.96,13.67 18.37,9.62 -18.37,9.55 -0.00,-19.17 z"
                        fill="#fff"
                    />
                    <path
                        d="M 45.02,23.46 45.32,23.28 26.96,13.67 43.32,24.34 45.02,23.46 z"
                        fill="#ccc"
                    />
                </svg>
                <LazyImage
                    isMobile={props.isMobile}
                    id="video_preview_overlay"
                    csss={{
                        mobile: imageLoaderStyle,
                        desktop: imageLoaderStyle,
                    }}
                    mobileAttributes={{
                        webp: {
                            srcset: generateSrcsetWidths(
                                cliburn1('webp'),
                                screenWidths,
                            ),
                            sizes: '100vw',
                        },
                        jpg: {
                            srcset: generateSrcsetWidths(
                                cliburn1(),
                                screenWidths,
                            ),
                            sizes: '100vw',
                        },
                        src: resizedImage(cliburn1(), { width: 640 }),
                    }}
                    desktopAttributes={{
                        webp: {
                            srcset: generateSrcsetWidths(
                                cliburn1('webp'),
                                screenLengths,
                            ),
                            sizes: '100vw',
                        },
                        jpg: {
                            srcset: generateSrcsetWidths(
                                cliburn1(),
                                screenLengths,
                            ),
                            sizes: '100vw',
                        },
                        src: resizedImage(cliburn1(), { height: 1080 }),
                    }}
                    alt="video preview"
                    successCb={onImageLoad}
                />
            </StyledPreviewOverlay>
        </Transition>
    );
};

export default PreviewOverlay;

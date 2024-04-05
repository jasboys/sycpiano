import { css } from '@emotion/react';
import { easeQuadOut } from 'd3-ease';
import { gsap } from 'gsap';
import * as React from 'react';
import { createStructuredSelector } from 'reselect';

import { toMedia } from 'src/mediaQuery';
import PortfolioButton from 'src/components/About/Bio/PortfolioButton';
import { fetchBio } from 'src/components/About/Bio/reducers';
import { onScroll, scrollFn } from 'src/components/App/NavBar/reducers';
import { mqSelectors } from 'src/components/App/reducers';
import { LazyImage } from 'src/components/LazyImage';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import {
    generateSrcsetWidths,
    resizedImage,
    sycWithPianoBW,
} from 'src/imageUrls';
import {
    screenLengths,
    screenM,
    screenPortrait,
    screenWidths,
    screenXS,
} from 'src/screens';
import { pushed } from 'src/styles/mixins';
import { navBarHeight } from 'src/styles/variables';
import { isImageElement } from 'src/utils';
import { MemoizedBioText } from './BioText';
import { pictureHeight } from './common';

const bioStyles = {
    imageContainer: css({
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
            minHeight: 'var(--bio-pic-min-height)',
            height: 'var(--bio-pic-height)',
            width: '100%',
            backgroundSize: '106%',
            backgroundPosition: 'center 15%',
            maxWidth: 'unset',
            paddingTop: 'var(--nav-bar-height)',
        },
    }),
    hasBgImage: (bgImage: string) =>
        css({
            backgroundImage: `url(${bgImage})`,
        }),
    container: css(pushed, {
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
            paddingTop: 'var(--nav-bar-height)',
        },
        '--bio-pic-min-height': pictureHeight,
        '--bio-pic-height': 'min(50vw, 33vh)',
    }),
    loader: css({
        visibility: 'hidden',
        position: 'absolute',
    }),
};

const IMAGE_RATIO = 1736 / 2560;

const srcWidths = screenLengths.map((value) => Math.round(value * IMAGE_RATIO));

const selector = createStructuredSelector({
    hiDpx: mqSelectors.hiDpx,
    screenPortrait: mqSelectors.screenPortrait,
    screenXS: mqSelectors.screenXS,
    isHamburger: mqSelectors.isHamburger,
});

const Bio: React.FunctionComponent<Record<never, unknown>> = () => {
    const { hiDpx, isHamburger, screenXS, screenPortrait } =
        useAppSelector(selector);
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
                const height = Number.parseInt(
                    window.getComputedStyle(bgRef.current).height,
                );
                const float = easeQuadOut(Math.max(1 - scrollTop / height, 0));
                const rounded =
                    Math.round((float + Number.EPSILON) * 100) / 100;
                bgRef.current.style.opacity = rounded.toFixed(2);
            } else {
                bgRef.current.style.opacity = '1.0';
            }
        }
    }, [scrollTop, screenXS, screenPortrait]);

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
        (el: HTMLImageElement | Element | undefined) => {
            if (el && isImageElement(el)) {
                setBgImage(el.currentSrc);
            }
        },
        [],
    );

    const onImageDestroy = React.useCallback(() => {
        if (bgRef.current) {
            gsap.to(bgRef.current, { autoAlpha: 0, duration: 0.1 });
        }
    }, []);

    const onScrollDispatch = React.useCallback(
        (triggerHeight: number, scrollTop: number) => {
            dispatch(onScroll({ triggerHeight, scrollTop }));
        },
        [],
    );

    return (
        <div
            css={bioStyles.container}
            onScroll={
                isHamburger
                    ? (ev) => {
                          if (bgRef.current) {
                              const height = Number.parseInt(
                                  window.getComputedStyle(bgRef.current).height,
                              );
                              scrollFn(
                                  height + navBarHeight.get(hiDpx),
                                  onScrollDispatch,
                              )(ev);
                          }
                      }
                    : undefined
            }
        >
            <div
                css={[
                    bioStyles.imageContainer,
                    bgImage && bioStyles.hasBgImage(bgImage),
                ]}
                ref={bgRef}
            >
                <LazyImage
                    isMobile={isHamburger}
                    id="about_lazy_image"
                    csss={{
                        mobile: bioStyles.loader,
                        desktop: bioStyles.loader,
                    }}
                    mobileAttributes={{
                        webp: {
                            srcset: generateSrcsetWidths(
                                sycWithPianoBW('webp'),
                                screenWidths,
                            ),
                            sizes: '100vw',
                        },
                        jpg: {
                            srcset: generateSrcsetWidths(
                                sycWithPianoBW(),
                                screenWidths,
                            ),
                            sizes: '100vw',
                        },
                        src: resizedImage(sycWithPianoBW(), { width: 640 }),
                    }}
                    desktopAttributes={{
                        webp: {
                            srcset: generateSrcsetWidths(
                                sycWithPianoBW('webp'),
                                srcWidths,
                            ),
                            sizes: '100vh',
                        },
                        jpg: {
                            srcset: generateSrcsetWidths(
                                sycWithPianoBW(),
                                srcWidths,
                            ),
                            sizes: '100vh',
                        },
                        src: resizedImage(sycWithPianoBW(), { height: 1080 }),
                    }}
                    alt="about background"
                    successCb={onImageLoad}
                    destroyCb={onImageDestroy}
                />
            </div>
            <MemoizedBioText bio={bio} needsTitle={!isHamburger} />
            <PortfolioButton />
        </div>
    );
};

export type BioType = typeof Bio;
export type RequiredProps = React.ComponentProps<typeof Bio>;
export default Bio;

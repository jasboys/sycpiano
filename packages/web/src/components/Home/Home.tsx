import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { format } from 'date-fns';
import * as React from 'react';
import { Transition } from 'react-transition-group';

import {
    DesktopBackgroundPreview,
    MobileBackgroundPreview,
} from 'src/components/Home/PreviewSVGs';
import Social from 'src/components/Home/Social';
import { LazyImage } from 'src/components/LazyImage';
import {
    generateSrcsetWidths,
    homeBackground,
    resizedImage,
    sycChairVertical,
} from 'src/imageUrls';
import { toMedia } from 'src/mediaQuery';
import {
    isHamburger,
    screenLengths,
    screenPortrait,
    screenXSandPortrait,
} from 'src/screens';
import { interFont, latoFont } from 'src/styles/fonts';
import { container, noHighlight } from 'src/styles/mixins';
import { navBarHeight } from 'src/styles/variables';
import { fadeOnEnter, fadeOnExit } from 'src/utils';
import { focusAtom } from 'jotai-optics';
import { mediaQueriesBaseAtom } from '../App/store';
import { useAtomValue } from 'jotai';
import { navBarAtoms } from '../App/NavBar/store';
import { cartAtoms } from '../Cart/store';

const textShadowColor = 'rgba(0 0 0 / 0.75)';

const HomeContainer = styled.div(container, {
    height: '100%',
    width: '100%',
});

const ContentContainer = styled.div<{ menuExpanded: boolean; hiDpx: boolean }>(
    noHighlight,
    {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        bottom: 0,
        color: 'white',
        textShadow: `0 0 8px ${textShadowColor}`,
        zIndex: 100,
        overflow: 'hidden',
        transition: 'filter 0.25s',
    },
    ({ menuExpanded, hiDpx }) => ({
        filter: menuExpanded ? 'blur(8px)' : 'blur(0px)',
        height: `calc(100% - ${navBarHeight.get(hiDpx)}px)`,
    }),
);

const Name = styled.div(interFont(200), {
    fontSize: 'calc(100vh / 8)',
    position: 'absolute',
    textTransform: 'uppercase',
    width: '100%',
    top: 'calc(35.9% - 46px)',
    [toMedia({ and: [isHamburger, screenPortrait] })]: {
        fontSize: 'calc(100vw / 6.2)',
        bottom: '63%',
        top: 'unset',
    },
});

const Skills = styled.div(latoFont(200), {
    position: 'absolute',
    fontSize: 'calc(100vh / 16)',
    color: '#fff6b0',
    textShadow: `0 0 6px ${textShadowColor}`,
    width: '100%',
    top: 'calc(50.8% - 35.8px)',
    [toMedia({ and: [isHamburger, screenPortrait] })]: {
        fontSize: 'calc(100vw / 16)',
        bottom: '58%',
        top: 'unset',
    },
});

const BackgroundContainer = styled.div({
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
});

const backgroundStyle = css({
    height: '100%',
    width: '100%',
    position: 'absolute',
    filter: 'saturate(0.8)',
    zIndex: 0,
    objectFit: 'cover',
});

const desktopBackgroundStyle = css(backgroundStyle, {
    objectPosition: '50% 35%',
});

const mobileBackgroundStyle = css(backgroundStyle, {
    objectPosition: '50% 100%',
});

const loadingStyle = css({
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 10,
});

const BackgroundCover = styled.div<{ isHamburger: boolean }>(
    {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
    },
    ({ isHamburger }) => ({
        backgroundImage: isHamburger
            ? `linear-gradient(
            66deg,
            rgba(0 0 0 / 0) 30%,
            rgba(0 0 0 / 0.2) 55%
        )`
            : `linear-gradient(
            66deg,
            rgba(0 0 0 / 0) 70%,
            rgba(0 0 0 / 0.2) 75%
        )`,
    }),
);

const NavBarGradient = styled.div<{ hiDpx: boolean; isHamburger: boolean }>(
    {
        padding: '0 30px 0 0',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
    },
    ({ isHamburger, hiDpx }) => ({
        height: navBarHeight.get(hiDpx),
        backgroundImage: isHamburger
            ? `linear-gradient(
            122deg,
            rgba(3 3 3 / 0.4) 5%,
            rgba(255 255 255 / 0.11) 40%,
            rgba(255 255 255 / 0.21) 52%,
            rgba(255 255 255 / 0.36) 60%,
            rgba(53 53 53 / 0.27) 90%
        )`
            : `linear-gradient(
            122deg,
            rgba(3 3 3 / 0.4) 5%,
            rgba(255 255 255 / 0.11) 20%,
            rgba(255 255 255 / 0.62) 22%,
            rgba(255 255 255 / 0.6) 40%,
            rgba(53 53 53 / 0.27) 60%
        )`,
    }),
);

const StyledCopyright = styled.div(latoFont(300), {
    position: 'absolute',
    bottom: 0,
    right: 0,
    color: 'white',
    padding: '20px 30px',

    [toMedia(screenXSandPortrait)]: {
        width: '100%',
    },
});

const MobileBackground = styled.div({
    visibility: 'hidden',
    position: 'absolute',
    top: 0,
    zIndex: 1,
    height: '100%',
    width: '100%',
});

const srcWidths = screenLengths.map((value) =>
    Math.round((value * 1779) / 2560),
);

const Content: React.FC = () => (
    <React.Fragment>
        <Name>Sean Chen</Name>
        <Skills>pianist / composer / arranger</Skills>
        <Social />
        <StyledCopyright>
            Copyright © {format(new Date(), 'yyyy')} Sean Chen
        </StyledCopyright>
    </React.Fragment>
);

const mediaQueries = focusAtom(mediaQueriesBaseAtom, (optic) =>
    optic.pick(['isHamburger', 'hiDpx', 'screenPortrait']),
);

const Home: React.FC<Record<never, unknown>> = () => {
    const { isHamburger, hiDpx, screenPortrait } = useAtomValue(mediaQueries);
    const menuExpanded = useAtomValue(navBarAtoms.isExpanded);
    const cartExpanded = useAtomValue(cartAtoms.visible);
    const backgroundRef = React.useRef<HTMLDivElement>(null);
    const navbarRef = React.useRef<HTMLDivElement>(null);
    return (
        <HomeContainer>
            <BackgroundContainer>
                <Transition
                    in={isHamburger && (menuExpanded || cartExpanded)}
                    onEnter={fadeOnEnter(backgroundRef)}
                    onExit={fadeOnExit(backgroundRef, 0.15)}
                    timeout={400}
                    nodeRef={backgroundRef}
                >
                    <MobileBackground ref={backgroundRef}>
                        <MobileBackgroundPreview />
                    </MobileBackground>
                </Transition>
                <LazyImage
                    isMobile={isHamburger && screenPortrait}
                    id="home_bg"
                    csss={{
                        mobile: mobileBackgroundStyle,
                        desktop: desktopBackgroundStyle,
                        loading: loadingStyle,
                    }}
                    mobileAttributes={{
                        webp: {
                            srcset: generateSrcsetWidths(
                                sycChairVertical('webp'),
                                srcWidths,
                            ),
                            sizes: '100vh',
                        },
                        jpg: {
                            srcset: generateSrcsetWidths(
                                sycChairVertical(),
                                srcWidths,
                            ),
                            sizes: '100vh',
                        },
                        src: resizedImage(sycChairVertical(), { height: 1920 }),
                    }}
                    desktopAttributes={{
                        webp: {
                            srcset: generateSrcsetWidths(
                                homeBackground('webp'),
                                screenLengths,
                            ),
                        },
                        jpg: {
                            srcset: generateSrcsetWidths(
                                homeBackground(),
                                screenLengths,
                            ),
                        },
                        src: resizedImage(homeBackground(), { width: 1920 }),
                    }}
                    loadingComponent={
                        isHamburger
                            ? MobileBackgroundPreview
                            : DesktopBackgroundPreview
                    }
                    alt="home background"
                    successCb={undefined}
                />
                <BackgroundCover isHamburger={isHamburger} />
                <Transition
                    in={isHamburger && !(menuExpanded || cartExpanded)}
                    onEnter={fadeOnEnter(navbarRef)}
                    onExit={fadeOnExit(navbarRef, 0.15)}
                    timeout={400}
                    nodeRef={navbarRef}
                >
                    <NavBarGradient
                        ref={navbarRef}
                        hiDpx={hiDpx}
                        isHamburger={isHamburger}
                    />
                </Transition>
            </BackgroundContainer>
            <ContentContainer
                menuExpanded={menuExpanded || cartExpanded}
                hiDpx={hiDpx}
            >
                <Content />
            </ContentContainer>
        </HomeContainer>
    );
};

export type HomeType = typeof Home;
export type RequiredProps = Record<never, unknown>;
export default Home;

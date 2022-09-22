import * as React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { lato1, lato2 } from 'src/styles/fonts';
import {
    generateSrcsetWidths,
    homeBackground,
    resizedImage,
    sycChairVertical,
} from 'src/imageUrls';
import { container, noHighlight } from 'src/styles/mixins';
import { navBarHeight } from 'src/styles/variables';

import { DesktopBackgroundPreview, MobileBackgroundPreview } from 'src/components/Home/PreviewSVGs';
import Social from 'src/components/Home/Social';
import { LazyImage } from 'src/components/LazyImage';
import { screenLengths, screenXSandPortrait, screenXSorPortrait, screenMorPortrait, screenBreakPoints } from 'src/styles/screens';
import { Transition } from 'react-transition-group';
import { fadeOnEnter, fadeOnExit } from 'src/utils';
import { useAppSelector } from 'src/hooks';
import format from 'date-fns/format';
import { useMedia } from 'react-media';

const textShadowColor = 'rgba(0 0 0 / 0.75)';

const HomeContainer = styled('div')`
    ${container}
    height: 100%;
    width: 100%;
`;

const Content = styled.div<{ menuExpanded: boolean }>`
    ${noHighlight}
    position: absolute;
    width: 100%;
    text-align: center;
    height: calc(100% - ${navBarHeight.desktop}px);
    bottom: 0;
    color: white;
    text-shadow: 0 0 8px ${textShadowColor};
    z-index: 100;
    overflow: hidden;
    transition: filter 0.25s;

    ${screenMorPortrait} {
        filter: ${props => props.menuExpanded ? 'blur(8px)' : 'unset'};
        height: calc(100% - ${navBarHeight.mobile}px);
    }
`;

const Name = styled('div')`
    font-family: ${lato2};
    font-size: calc(100vh / 8);
    position: absolute;
    text-transform: uppercase;
    width: 100%;
    top: 31%;

    ${screenXSorPortrait} {
        font-size: calc(100vw / 6.2);
        bottom: 63%;
        top: unset;
    }
`;

const Skills = styled('div')`
    position: absolute;
    font-family: ${lato2};
    font-size: calc(100vh / 16);
    color: #fff6b0;
    text-shadow: 0 0 6px ${textShadowColor};
    width: 100%;
    top: 47%;

    ${screenXSorPortrait} {
        font-size: calc(100vw / 16);
        bottom: 58%;
        top: unset;
    }
`;

const BackgroundContainer = styled('div')`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
`;

const backgroundStyle = css`
    height: 100%;
    width: 100%;
    position: absolute;
    filter: saturate(0.8);
    z-index: 0;
    object-fit: cover;
`;

const desktopBackgroundStyle = css`
    ${backgroundStyle}
    object-position: 50% 35%;
`;

const mobileBackgroundStyle = css`
    ${backgroundStyle}
    object-position: 50% 100%;
`;

const loadingStyle = css`
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 10;
`;

const BackgroundCover = styled('div')`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    background-image:
        linear-gradient(
            66deg,
            rgba(0 0 0 / 0) 70%,
            rgba(0 0 0 / 0.2) 75%
        );

    ${screenXSorPortrait} {
        background-image:
            linear-gradient(
                66deg,
                rgba(0 0 0 / 0) 30%,
                rgba(0 0 0 / 0.2) 55%
            );
    }
`;

const NavBarGradient = styled('div')`
    height: ${navBarHeight.desktop}px;
    padding: 0 30px 0 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
    background-image:
        linear-gradient(
            122deg,
            rgba(3 3 3 / 0.4) 5%,
            rgba(255 255 255 / 0.11) 20%,
            rgba(255 255 255 / 0.62) 22%,
            rgba(255 255 255 / 0.6) 40%,
            rgba(53 53 53 / 0.27) 60%
        );

    ${screenMorPortrait} {
        height: ${navBarHeight.mobile}px;
        background-image:
            linear-gradient(
                122deg,
                rgba(3 3 3 / 0.4) 5%,
                rgba(255 255 255 / 0.11) 40%,
                rgba(255 255 255 / 0.21) 52%,
                rgba(255 255 255 / 0.36) 60%,
                rgba(53 53 53 / 0.27) 90%
            );
    }
`;

const StyledCopyright = styled('div')`
    position: absolute;
    bottom: 0;
    right: 0;
    font-family: ${lato1};
    font-weight: bold;
    color: white;
    padding: 20px 30px;

    ${screenXSandPortrait} {
        width: 100%;
    }
`;

const MobileBackground = styled.div({
    visibility: 'hidden',
    position: 'absolute',
    top: 0,
    zIndex: 1,
    height: '100%',
    width: '100%',
});

const srcWidths = screenLengths.map((value) => (
    Math.round(value * 1779 / 2560)
));

interface HomeProps {
    isMobile: boolean;
}

const Home: React.FC<HomeProps> = () => {
    const menuExpanded = useAppSelector(({ navbar }) => navbar.isExpanded);
    const cartExpanded = useAppSelector(({ cart }) => cart.visible);
    const { xs, medium } = useMedia({ queries: screenBreakPoints });

    const isMobile = xs || medium;
    return (
        <HomeContainer>
            <BackgroundContainer>
                <Transition<undefined>
                    in={isMobile && (menuExpanded || cartExpanded)}
                    onEnter={fadeOnEnter()}
                    onExit={fadeOnExit(0.15)}
                    timeout={400}
                >
                    <MobileBackground>
                        <MobileBackgroundPreview />
                    </MobileBackground>
                </Transition>
                <LazyImage
                    isMobile={isMobile}
                    id="home_bg"
                    csss={{
                        mobile: mobileBackgroundStyle,
                        desktop: desktopBackgroundStyle,
                        loading: loadingStyle,
                    }}
                    mobileAttributes={{
                        webp: {
                            srcset: generateSrcsetWidths(sycChairVertical('webp'), srcWidths),
                            sizes: '100vh',
                        },
                        jpg: {
                            srcset: generateSrcsetWidths(sycChairVertical(), srcWidths),
                            sizes: '100vh',
                        },
                        src: resizedImage(sycChairVertical(), { height: 1920 }),
                    }}
                    desktopAttributes={{
                        webp: {
                            srcset: generateSrcsetWidths(homeBackground('webp'), screenLengths),
                        },
                        jpg: {
                            srcset: generateSrcsetWidths(homeBackground(), screenLengths),
                        },
                        src: resizedImage(homeBackground(), { width: 1920 }),
                    }}
                    loadingComponent={isMobile ? MobileBackgroundPreview : DesktopBackgroundPreview}
                    alt="home background"
                    successCb={undefined}
                />
                <BackgroundCover />
                <Transition<undefined>
                    in={isMobile && !(menuExpanded || cartExpanded)}
                    onEnter={fadeOnEnter()}
                    onExit={fadeOnExit(0.15)}
                    timeout={400}
                >
                    <NavBarGradient />
                </Transition>
            </BackgroundContainer>
            <Content menuExpanded={menuExpanded || cartExpanded}>
                <Name>Sean Chen</Name>
                <Skills>pianist / composer / arranger</Skills>
                <Social />
                <StyledCopyright>Copyright © {format(new Date(), 'yyyy')} Sean Chen</StyledCopyright>
            </Content>
        </HomeContainer>
    );
}

export type HomeType = typeof Home;
export type RequiredProps = HomeProps;
export default Home;

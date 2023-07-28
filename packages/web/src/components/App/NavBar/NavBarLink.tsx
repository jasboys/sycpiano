import * as React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { mix } from 'polished';
import { Link, LinkProps } from 'react-router-dom';
import { Transition } from 'react-transition-group';

import { gsap } from 'gsap';

import { toggleExpanded, showSubNav } from 'src/components/App/NavBar/reducers';
import SubNav from 'src/components/App/NavBar/SubNav/SubNav';
import { LinkShape } from 'src/components/App/NavBar/types';

import { lightBlue, logoBlue, navFontColor } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';
import { minRes, webkitMinDPR } from 'src/screens';
import { navBarHeight, navBarMarginTop } from 'src/styles/variables';
import { useAppSelector, useAppDispatch } from 'src/hooks';
import { toMedia } from 'src/MediaQuery';

interface HighlightProps {
    readonly active: boolean;
    readonly expanded?: boolean;
    readonly isHamburger: boolean;
    readonly isHome: boolean;
    readonly link: LinkShape;
}

const HighlightDiv = styled.div<{ active: boolean; isHome: boolean }>({
    width: '100%',
    position: 'absolute',
    bottom: 0,
    padding: 0,
    marginTop: navBarMarginTop,
    height: 5,
    zIndex: -1,
    transition: 'opacity 0.2s',
}, ({ active, isHome }) => ({
    opacity: active ? 1 : 0,
    backgroundColor: isHome ? 'white' : lightBlue,
}));

const MobileHighlight = styled.div<{ active: boolean; isHome: boolean }>({
    flex: '0 0 5px',
}, ({ active, isHome }) => ({
    opacity: active ? 1 : 0,
    backgroundColor: isHome ? 'white' : lightBlue,
}));

const HyperlinkText = styled.div<{ isHamburger: boolean }>(
    {
        height: navBarHeight.lowDpx - navBarMarginTop,
        padding: '20px 10px 0 10px',
        marginTop: navBarMarginTop,
    },
    ({ isHamburger }) => isHamburger ?
        ({
            marginTop: 'unset',
            height: 'unset',
            lineHeight: '1.5rem',
            padding: '1rem 0.8rem',
            flex: '0 0 auto',
        }) :
        ({
            [toMedia([minRes, webkitMinDPR])]: {
                height: navBarHeight.hiDpx - navBarMarginTop,
            }
        }),
);

const Highlight: React.FC<HighlightProps> = ({ active, isHome, link, isHamburger }) => (
    <React.Fragment>
        {!isHamburger && <HighlightDiv active={active} isHome={isHome} />}
        <HyperlinkText isHamburger={isHamburger}>{link.name}</HyperlinkText>
        {isHamburger && <MobileHighlight active={active} isHome={isHome} />}
    </React.Fragment>
);

interface NavBarLinkProps {
    readonly className?: string;
    readonly active: boolean;
    readonly isHome: boolean;
    readonly link: LinkShape;
    readonly subNavLinks?: LinkShape[];
    readonly isHamburger: boolean;
    readonly currentSpecificPath: string;
}

const linkStyle = css(
    noHighlight,
    {
        color: navFontColor,
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.5s',
        WebkitTapHighlightColor: 'transparent',

        '&:hover': {
            color: mix(0.5, logoBlue, '#444'),
            [`${HighlightDiv}`]: {
                opacity: 0.5,
            },
        },
    },
);

const linkActiveStyle = css({
    color: lightBlue,
});

const linkHomeStyle = css({
    color: 'white',
    // textShadow: '0 0 1px rgba(0, 0, 0, 0.8)',
    '&:hover': {
        color: 'white',
        textShadow: '0 0 1px rgba(255, 255, 255, 1)',
    },
});

const linkHomeActiveStyle = css({
    textShadow: '0 0 1px rgba(255, 255, 255, 1)'
});

const mobileLinkStyle = css({
    display: 'flex',
    justifyContent: 'flex-end',
});

const SubNavContainer = styled.div<{ isHamburger: boolean }>(
    {
        visibility: 'hidden',
    }, ({ isHamburger }) => isHamburger && ({
        visibility: 'unset',
        height: 0,
        overflow: 'hidden',
        display: 'flex',
        marginRight: '1rem',
    })
);

const SubNavLine = styled.div<{ isHome: boolean }>({
    flex: '0 0 1px',
}, ({ isHome }) => ({
    backgroundColor: isHome ? 'white' : navFontColor,
}));

const enterAnimation = (el: HTMLElement, isAppearing: boolean, isHamburger: boolean, path: string) => {
    if (isHamburger) {
        if (isAppearing) {
            el.style.height = 'auto';
        } else {
            gsap.set(el, { height: 'auto' });
            gsap.from(el, { height: 0, duration: 0.25 });
            gsap.fromTo(`.${path}`, { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0, stagger: 0.08, duration: 0.3 });

        }
    } else {
        gsap.to(el, { autoAlpha: 1, duration: 0.25 });
    }
};

const exitAnimation = (el: HTMLElement, isHamburger: boolean, path: string) => {
    if (isHamburger) {
        gsap.to(el, { height: 0, duration: 0.25 })
        gsap.to(`.${path}`, { autoAlpha: 0, x: 80, stagger: 0.05, duration: 0.25 });
    } else {
        gsap.to(el, { autoAlpha: 0, duration: 0.25 });
    }
};

const StyledLi = styled.li<{ isHamburger: boolean }>(
    latoFont(300),
    {
        fontSize: '1.4rem',
        position: 'relative',
        letterSpacing: 0,
        display: 'inline-block',
        padding: '0 1px 0 1px',
        verticalAlign: 'top',
        textAlign: 'center',

        '&:last-child': {
            marginRight: 0,
        },
    }, ({ isHamburger }) => isHamburger && ({
        textAlign: 'right',
        visibility: 'hidden',
        opacity: 0,
    })
);

interface AorLink {
    href?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
    to?: string;
}

const NavBarLink: React.FC<NavBarLinkProps> = ({
    active,
    isHome,
    isHamburger,
    link,
    subNavLinks,
    currentSpecificPath,
}) => {
    const showSubs = useAppSelector(({ navbar }) => navbar.showSubs);
    const dispatch = useAppDispatch();

    // css attr is common
    const attr: AorLink = {};
    const style = css(
        linkStyle,
        active && !isHome && linkActiveStyle,
        isHome && linkHomeStyle,
        active && isHome && !isHamburger && linkHomeActiveStyle,
        isHamburger && mobileLinkStyle,
    );

    // add attr's conditionally
    if (link.name === 'blog') {
        attr.href = link.path;
    } else if (subNavLinks) {
        attr.onClick = () => {
            dispatch(showSubNav({ sub: link.name, isHamburger }));
        };
    } else {
        attr.to = link.path;
        attr.onClick = () => {
            (!isHamburger || !subNavLinks) && dispatch(showSubNav());
            isHamburger && dispatch(toggleExpanded(false));
        };
    }

    const HighlightComponent =
        <Highlight
            active={active}
            isHome={isHome}
            link={link}
            isHamburger={isHamburger}
            expanded={showSubs.includes(link.name)}
        />;

    return (
        <StyledLi className="navlink-entry" isHamburger={isHamburger}>
            {(subNavLinks || link.name === 'blog') ? (
                <a css={style} {...attr}>
                    {HighlightComponent}
                </a>
            ) : (
                    <Link css={style} {...(attr as LinkProps)}>
                        {HighlightComponent}
                    </Link>
                )}
            {subNavLinks && (
                <Transition<undefined>
                    in={showSubs.includes(link.name)}
                    onEnter={(el, isAppearing) => enterAnimation(el, isAppearing, isHamburger, link.name)}
                    onExit={(el) => exitAnimation(el, isHamburger, link.name)}
                    timeout={250}
                    appear={true}
                >
                    <SubNavContainer isHamburger={isHamburger}>
                        <SubNav
                            basePath={link}
                            links={subNavLinks}
                            currentSpecificPath={currentSpecificPath}
                            onClick={() => {
                                !isHamburger && dispatch(showSubNav());
                                isHamburger && dispatch(toggleExpanded(false));
                            }}
                            isHome={isHome}
                            isHamburger={isHamburger}
                        />
                        {isHamburger && <SubNavLine isHome={isHome} />}
                    </SubNavContainer>
                </Transition>
            )}
        </StyledLi>
    );
};

export default NavBarLink;

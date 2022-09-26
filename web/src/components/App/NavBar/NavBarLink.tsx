import * as React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import mix from 'polished/lib/color/mix';
import { Link, LinkProps } from 'react-router-dom';
import { Transition } from 'react-transition-group';

import { gsap } from 'gsap';

import { toggleExpanded, showSubNav } from 'src/components/App/NavBar/reducers';
import SubNav from 'src/components/App/NavBar/SubNav/SubNav';
import { LinkShape } from 'src/components/App/NavBar/types';

import { lightBlue, logoBlue, navFontColor } from 'src/styles/colors';
import { lato2 } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';
import { screenMorPortrait } from 'src/styles/screens';
import { navBarHeight, navBarMarginTop } from 'src/styles/variables';
import { useAppSelector, useAppDispatch } from 'src/hooks';

interface HighlightProps {
    readonly active: boolean;
    readonly expanded?: boolean;
    readonly isMobile: boolean;
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

const HyperlinkText = styled.div({
    height: navBarHeight.desktop - navBarMarginTop,
    padding: '20px 10px 0 10px',
    marginTop: navBarMarginTop,

    [screenMorPortrait]: {
        marginTop: 'unset',
        height: 'unset',
        lineHeight: '1.5rem',
        padding: '1rem 0.8rem',
        flex: '0 0 auto',
    },
});

const Highlight: React.FC<HighlightProps> = ({ active, isHome, link, isMobile }) => (
    <React.Fragment>
        {!isMobile && <HighlightDiv active={active} isHome={isHome} />}
        <HyperlinkText>{link.name}</HyperlinkText>
        {isMobile && <MobileHighlight active={active} isHome={isHome} />}
    </React.Fragment>
);

interface NavBarLinkProps {
    readonly className?: string;
    readonly active: boolean;
    readonly isHome: boolean;
    readonly link: LinkShape;
    readonly subNavLinks?: LinkShape[];
    readonly isMobile: boolean;
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

const SubNavContainer = styled.div({
    visibility: 'hidden',
    [screenMorPortrait]: {
        visibility: 'unset',
        height: 0,
        overflow: 'hidden',
        display: 'flex',
        marginRight: '1rem',
    },
});

const SubNavLine = styled.div<{ isHome: boolean }>({
    flex: '0 0 1px',
}, ({ isHome }) => ({
    backgroundColor: isHome ? 'white' : navFontColor,
}));

const enterAnimation = (el: HTMLElement, isAppearing: boolean, isMobile: boolean, path: string) => {
    if (isMobile) {
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

const exitAnimation = (el: HTMLElement, isMobile: boolean, path: string) => {
    if (isMobile) {
        gsap.to(el, { height: 0, duration: 0.25 })
        gsap.to(`.${path}`, { autoAlpha: 0, x: 80, stagger: 0.05, duration: 0.25 });
    } else {
        gsap.to(el, { autoAlpha: 0, duration: 0.25 });
    }
};

const StyledLi = styled.li<{ isHome: boolean }>({
    fontSize: '1.4rem',
    position: 'relative',
    fontFamily: lato2,
    letterSpacing: 0,
    display: 'inline-block',
    padding: '0 1px 0 1px',
    verticalAlign: 'top',
    textAlign: 'center',

    '&:last-child': {
        marginRight: 0,
    },
}, ({ isHome: _isHome }) => ({
    [screenMorPortrait]: {
        textAlign: 'right',
        visibility: 'hidden',
        opacity: 0,
        // fontFamily: isHome ? lato2 : lato3,
        // fontWeight: isHome ? 'bold' : 'unset',
    },
}));

interface AorLink {
    href?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
    to?: string;
}

const NavBarLink: React.FC<NavBarLinkProps> = ({
    active,
    isHome,
    isMobile,
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
        active && isHome && !isMobile && linkHomeActiveStyle,
        isMobile && mobileLinkStyle,
    );

    // add attr's conditionally
    if (link.name === 'blog') {
        attr.href = link.path;
    } else if (subNavLinks) {
        attr.onClick = () => {
            dispatch(showSubNav({ sub: link.name, isMobile }));
        };
    } else {
        attr.to = link.path;
        attr.onClick = () => {
            (!isMobile || !subNavLinks) && dispatch(showSubNav());
            isMobile && dispatch(toggleExpanded(false));
        };
    }

    const HighlightComponent =
        <Highlight
            active={active}
            isHome={isHome}
            link={link}
            isMobile={isMobile}
            expanded={showSubs.includes(link.name)}
        />;

    return (
        <StyledLi className="navlink-entry" isHome={isHome}>
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
                    onEnter={(el, isAppearing) => enterAnimation(el, isAppearing, isMobile, link.name)}
                    onExit={(el) => exitAnimation(el, isMobile, link.name)}
                    timeout={250}
                    appear={true}
                >
                    <SubNavContainer>
                        <SubNav
                            basePath={link}
                            links={subNavLinks}
                            currentSpecificPath={currentSpecificPath}
                            onClick={() => {
                                !isMobile && dispatch(showSubNav());
                                isMobile && dispatch(toggleExpanded(false));
                            }}
                            isHome={isHome}
                            isMobile={isMobile}
                        />
                        {isMobile && <SubNavLine isHome={isHome} />}
                    </SubNavContainer>
                </Transition>
            )}
        </StyledLi>
    );
};

export default NavBarLink;

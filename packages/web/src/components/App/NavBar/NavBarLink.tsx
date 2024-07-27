import { css } from '@emotion/react';
import { gsap } from 'gsap';
import { mix } from 'polished';
import * as React from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Transition } from 'react-transition-group';

import Highlight from 'src/components/App/NavBar/Highlight';
import SubNav from 'src/components/App/NavBar/SubNav/SubNav';
import type { LinkShape } from 'src/components/App/NavBar/types';
import { lightBlue, logoBlue, navFontColor } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';
import { navBarStore } from './store.js';

interface NavBarLinkProps {
    readonly active: boolean;
    readonly isHome: boolean;
    readonly link: LinkShape;
    readonly subNavLinks?: LinkShape[];
    readonly isHamburger: boolean;
    readonly currentSpecificPath: string;
}

const linkStyles = {
    base: css(noHighlight, {
        color: navFontColor,
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.5s',
        WebkitTapHighlightColor: 'transparent',

        '&:hover': {
            color: mix(0.5, logoBlue, '#444'),
            '.highlight': {
                opacity: 0.5,
            },
        },
    }),
    active: css({
        color: lightBlue,
    }),
    home: css({
        color: 'white',
        '&:hover': {
            color: 'white',
            textShadow: '0 0 1px rgba(255, 255, 255, 1)',
        },
    }),
    activeHome: css({
        textShadow: '0 0 1px rgba(255, 255, 255, 1)',
    }),
    hamburger: css({
        textShadow: 'none',
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'row-reverse',
    }),
};

const subNavStyles = {
    base: css({
        visibility: 'hidden',
    }),
    hamburger: css({
        visibility: 'unset',
        height: 0,
        overflow: 'hidden',
        display: 'flex',
        marginRight: '1rem',
    }),
};

const subNavHighlight = {
    base: css({
        flex: '0 0 1px',
        backgroundColor: navFontColor,
    }),
    home: css({
        backgroundColor: 'white',
    }),
};

const liStyles = {
    base: css(latoFont(300), {
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
    }),
    hamburger: css({
        textAlign: 'right',
        visibility: 'hidden',
        opacity: 0,
    }),
};

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
    const showSubs = navBarStore.use.showSubs();
    const enterTimeline = React.useRef<GSAPTimeline>();
    const exitTimeline = React.useRef<GSAPTimeline>();
    const el = React.useRef<HTMLDivElement>(null);

    // css attr is common
    const attr: AorLink = {};
    const linkInstanceStyle = css([
        linkStyles.base,
        active && linkStyles.active,
        isHome && linkStyles.home,
        active && isHome && linkStyles.activeHome,
        isHamburger && linkStyles.hamburger,
    ]);

    // add attr's conditionally
    if (link.name === 'blog') {
        attr.href = link.path;
    } else if (subNavLinks) {
        attr.onClick = () => {
            navBarStore.set.callSub({ sub: link.name, isHamburger });
        };
    } else {
        attr.to = link.path;
        attr.onClick = () => {
            (!isHamburger || !subNavLinks) && navBarStore.set.callSub({});
            isHamburger && navBarStore.set.toggleExpanded(false);
        };
    }

    const HighlightComponent = (
        <Highlight
            active={active}
            isHome={isHome}
            link={link}
            isHamburger={isHamburger}
            expanded={showSubs.includes(link.name)}
        />
    );

    React.useLayoutEffect(() => {
        if (el.current) {
            const ctx = gsap.context(() => {
                enterTimeline.current = gsap.timeline({ paused: true });
                exitTimeline.current = gsap.timeline({ paused: true });
                if (isHamburger) {
                    enterTimeline.current = enterTimeline.current
                        .fromTo(el.current, { height: 0 }, { height: 'auto' }, 0)
                        .fromTo(
                            `.${link.name}`,
                            { autoAlpha: 0, x: 80 },
                            {
                                autoAlpha: 1,
                                x: 0,
                                stagger: 0.08,
                                duration: 0.3,
                            },
                            0,
                        );

                    exitTimeline.current = exitTimeline.current
                        .to(el.current, { height: 0, duration: 0.25 }, 0)
                        .to(
                            `.${link.name}`,
                            {
                                autoAlpha: 0,
                                x: 80,
                                stagger: 0.05,
                                duration: 0.25,
                            },
                            0,
                        );
                } else {
                    enterTimeline.current = enterTimeline.current.to(
                        el.current,
                        {
                            autoAlpha: 1,
                            duration: 0.25,
                        },
                    );
                    exitTimeline.current = exitTimeline.current.to(el.current, {
                        autoAlpha: 0,
                        duration: 0.25,
                    });
                }
            }, el.current);
            return () => ctx.revert();
        }
    }, [link.name, isHamburger]);

    return (
        <li
            className="navlink-entry"
            css={[liStyles.base, isHamburger && liStyles.hamburger]}
        >
            {subNavLinks || link.name === 'blog' ? (
                <a css={linkInstanceStyle} {...attr}>
                    {HighlightComponent}
                </a>
            ) : (
                <Link css={linkInstanceStyle} {...(attr as LinkProps)}>
                    {HighlightComponent}
                </Link>
            )}
            {subNavLinks && (
                <Transition<HTMLDivElement>
                    nodeRef={el}
                    in={showSubs.includes(link.name)}
                    onEnter={(isAppearing) => {
                        if (isAppearing && el.current) {
                            el.current.style.height = 'auto';
                        }
                        if (!isAppearing) {
                            enterTimeline.current?.restart().play();
                        }
                    }}
                    onExit={() => {
                        exitTimeline.current?.restart().play();
                    }}
                    timeout={250}
                    appear={true}
                >
                    <div
                        ref={el}
                        css={[
                            subNavStyles.base,
                            isHamburger && subNavStyles.hamburger,
                        ]}
                    >
                        <SubNav
                            basePath={link}
                            links={subNavLinks}
                            currentSpecificPath={currentSpecificPath}
                            onClick={() => {
                                !isHamburger && navBarStore.set.callSub({});
                                isHamburger && navBarStore.set.toggleExpanded(false);
                            }}
                            isHome={isHome}
                        />
                        {isHamburger && (
                            <div
                                css={[
                                    subNavHighlight.base,
                                    isHome && subNavHighlight.home,
                                ]}
                            />
                        )}
                    </div>
                </Transition>
            )}
        </li>
    );
};

// export default NavBarLink;
export default React.memo(NavBarLink, (prev, next) => {
    return (
        prev.active === next.active &&
        prev.isHome === next.isHome &&
        prev.isHamburger === next.isHamburger &&
        prev.currentSpecificPath === next.currentSpecificPath
    );
});

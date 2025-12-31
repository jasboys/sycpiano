import { css } from '@emotion/react';
import * as React from 'react';
import { links } from 'src/components/App/NavBar/links';
import NavBarLink from 'src/components/App/NavBar/NavBarLink';
import type {
    LinkShape,
    NavBarLinksProps,
} from 'src/components/App/NavBar/types';
import { toMedia } from 'src/mediaQuery';
import { hiDpx } from 'src/screens';
import { noHighlight, pushedHelper } from 'src/styles/mixins';
import { navBarHeight } from 'src/styles/variables';

const getGradientStops = (
    startPos: number | string,
    startUnit: string,
    stopPos: number | string,
    stopUnit: string,
    num: number,
) => {
    const stops = new Array(num)
        .fill(0)
        .map((_, idx) => {
            const stop = `calc(${startPos}${startUnit} + (${stopPos}${stopUnit} - ${startPos}${startUnit}) * ${idx} / ${num})`;
            const alphaScale = 0.5 * (Math.cos(Math.PI * (idx / num)) + 1);
            return `rgba(255 255 255 / ${alphaScale}) ${stop}`;
        })
        .join(', ');
    return `${stops}, rgba(255 255 255 / 0.0) ${stopPos}${stopUnit}`;
};

const gradient = getGradientStops(180, 'px', 'min(100%, 400px)', '', 12);

const styles = {
    ul: css({
        padding: 0,
        margin: 0,
    }),
    ulHamburger: css({
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        paddingTop: '1.8rem',
        overflow: 'hidden auto',
        alignItems: 'flex-end',
    }),
    linkBase: css(noHighlight, {
        textTransform: 'uppercase',
        transition: 'backdrop-filter 0.2s',
    }),
    linkHamburger: css({
        opacity: 0,
        visibility: 'hidden',
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        boxShadow: 'inset 0 7px 6px -5px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(1px)',
        overflowY: 'auto',
        background: `linear-gradient(-90deg, ${gradient})`,
        ...pushedHelper(navBarHeight.lowDpx, 'vh'),
        [toMedia(hiDpx)]: pushedHelper(navBarHeight.hiDpx, 'vh'),
    }),
    linkHamburgerHome: css({
        backdropFilter: 'none',
        background: 'transparent',
    }),
};

const NavBarLinks = React.forwardRef<HTMLDivElement, NavBarLinksProps>(
    ({ specificPath, currentBasePath, isHamburger }, ref) => {
        return (
            <div
                ref={ref}
                css={[
                    styles.linkBase,
                    isHamburger && styles.linkHamburger,
                    isHamburger &&
                        specificPath === '' &&
                        styles.linkHamburgerHome,
                ]}
            >
                <ul css={[styles.ul, isHamburger && styles.ulHamburger]}>
                    {links.map((link: LinkShape) => {
                        console.log(link, currentBasePath);

                        return (
                            <NavBarLink
                                key={link.path}
                                link={link}
                                subNavLinks={link.subLinks}
                                active={link.path === currentBasePath}
                                currentSpecificPath={specificPath}
                                isHome={specificPath === ''}
                                isHamburger={isHamburger}
                            />
                        );
                    })}
                </ul>
            </div>
        );
    },
);

const MemoizedLinks = React.memo(NavBarLinks, (prev, next) => {
    return (
        prev.currentBasePath === next.currentBasePath &&
        prev.isHamburger === next.isHamburger &&
        prev.specificPath === next.specificPath
    );
});

export default MemoizedLinks;

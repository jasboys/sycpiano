import { css } from '@emotion/react';
import { toMedia } from 'src/mediaQuery';
import { isHamburger } from 'src/screens';
import { LinkShape } from './types';
import React from 'react';

export interface HighlightProps {
    readonly active: boolean;
    readonly expanded?: boolean;
    readonly isHamburger: boolean;
    readonly isHome: boolean;
    readonly link: LinkShape;
}

const highlightStyles = {
    base: css({
        backgroundColor: 'var(--light-blue)',
        opacity: 0,
    }),
    home: css({
        backgroundColor: 'white',
    }),
    active: css({
        opacity: 1,
    }),
    normal: css({
        width: '100%',
        position: 'absolute',
        bottom: 0,
        padding: 0,
        marginTop: 'var(--nav-bar-margin-top)',
        height: 5,
        zIndex: -1,
        transition: 'opacity 0.2s',
    }),
    hamburger: css({
        flex: '0 0 5px',
    }),
};

const linkTextStyles = css({
    height: 'calc(var(--nav-bar-height) - var(--nav-bar-margin-top))',
    padding: '20px 10px 0 10px',
    marginTop: 'var(--nav-bar-margin-top)',
    [toMedia(isHamburger)]: {
        marginTop: 'unset',
        height: 'unset',
        lineHeight: '1.5rem',
        padding: '1rem 0.8rem',
        flex: '0 0 auto',
    },
});

const Highlight: React.FC<HighlightProps> = ({
    active,
    isHome,
    link,
    isHamburger,
}) => (
    <React.Fragment>
        <div
            className={'highlight'}
            css={[
                highlightStyles.base,
                active && highlightStyles.active,
                isHome && highlightStyles.home,
                isHamburger
                    ? highlightStyles.hamburger
                    : highlightStyles.normal,
            ]}
        />
        <div
            css={[linkTextStyles]}
        >
            {link.name}
        </div>
    </React.Fragment>
);

export default React.memo(Highlight, (prev, next) => {
    return (
        prev.active === next.active &&
        prev.isHome === next.isHome &&
        prev.isHamburger === next.isHamburger
    );
});
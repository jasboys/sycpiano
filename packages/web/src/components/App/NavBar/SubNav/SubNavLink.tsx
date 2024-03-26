import { css } from '@emotion/react';
import { darken, saturate } from 'polished';
import * as React from 'react';
import { Link } from 'react-router-dom';

import type { LinkShape } from 'src/components/App/NavBar/types';
import { toMedia } from 'src/mediaQuery';
import { isHamburger } from 'src/screens';
import { lightBlue, navFontColor } from 'src/styles/colors';
import { noHighlight } from 'src/styles/mixins';

interface SubNavLinkProps {
    readonly isHome: boolean;
    readonly basePath: LinkShape;
    readonly link: LinkShape;
    readonly onClick: () => void;
    readonly currentSpecificPath: string;
}

const styles = {
    link: css({
        color: navFontColor,
        position: 'relative',
        width: '100%',
        display: 'block',
        padding: '10px',
        backgroundColor: 'white',
        textAlign: 'center',
        boxShadow: '0 6px 11px -5px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.25s',
        lineHeight: '2rem',
        '&:hover': {
            color: 'white',
            backgroundColor: lightBlue,
        },
        [toMedia(isHamburger)]: {
            color: navFontColor,
            padding: '0.5rem 1rem 0.5rem',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            textAlign: 'right',
            '&:hover': {
                color: 'unset',
                backgroundColor: 'transparent',
            },
        },
    }),
    isActive: css({
        [toMedia(isHamburger)]: {
            color: lightBlue,
        },
        '&:hover': {
            color: 'white',
            [toMedia(isHamburger)]: {
                color: saturate(0.2, darken(0.1, lightBlue)),
            },
        },
    }),
    isHome: css({
        color: 'white',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        [toMedia(isHamburger)]: {
            color: 'white',
        },
        '&:hover': {
            textShadow: '0 0 1px rgba(255, 255, 255, 1)',
            backgroundColor: 'rgba(53, 53, 53, 0.27)',
            boxShadow: '0 6px 11px -5px rgba(0, 0, 0, 0.5)',
            color: 'white',
            [toMedia(isHamburger)]: {
                boxShadow: 'none',
                backgroundColor: 'transparent',
            },
        },
    }),
};

const SubNavLink: React.FC<SubNavLinkProps> = ({
    basePath,
    link,
    onClick,
    isHome,
    currentSpecificPath,
}) => {
    const isActive = link.name === currentSpecificPath;
    return (
        <li css={noHighlight} className={basePath.name}>
            <Link
                css={[
                    styles.link,
                    isHome && styles.isHome,
                    isActive && styles.isActive,
                ]}
                to={`${basePath.path}${link.path}`}
                onClick={() => {
                    setTimeout(() => onClick(), 250);
                }}
            >
                {link.name}
            </Link>
        </li>
    );
};

export default React.memo(SubNavLink, (prev, next) => {
    return (
        prev.isHome === next.isHome &&
        prev.currentSpecificPath === next.currentSpecificPath
    );
});

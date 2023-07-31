import { css } from '@emotion/react';
import * as React from 'react';

import { toMedia } from 'src/MediaQuery';
import SubNavLink from 'src/components/App/NavBar/SubNav/SubNavLink';
import { LinkShape } from 'src/components/App/NavBar/types';
import { isHamburger } from 'src/screens';

interface SubNavProps {
    readonly className?: string;
    readonly isHome: boolean;
    readonly basePath: LinkShape;
    readonly currentSpecificPath: string;
    readonly links: LinkShape[];
    readonly onClick: () => void;
}

const styles = {
    ul: css({
        zIndex: 10,
        position: 'absolute',
        listStyle: 'none',
        paddingLeft: 0,
        marginTop: 0,
        display: 'inline-block',
        transformOrigin: 'top',
        transform: 'translateX(-50%)',
        overflow: 'visible',
        [toMedia(isHamburger)]: {
            width: '100%',
            position: 'relative',
            transform: 'unset',
            overflow: 'hidden',
            backgroundColor: 'unset',
            backdropFilter: 'unset',
            boxShadow: 'unset',
        },
    }),
    isHome: css({
        backgroundColor: 'rgba(0 0 0 / 0.1)',
        backdropFilter: 'blur(2px)',
        boxShadow: '0 5px 11px -5px rgba(0 0 0 / 0.5)',
    }),
};

const SubNav: React.FC<SubNavProps> = ({ links, ...props }) => (
    <ul css={[styles.ul, props.isHome && styles.isHome]}>
        {links.map((link) => (
            <SubNavLink key={link.path} link={link} {...props} />
        ))}
    </ul>
);

export default React.memo(SubNav);

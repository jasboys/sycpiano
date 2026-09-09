import { css } from '@emotion/react';
import type { ComponentPropsWithRef } from 'react';
import * as React from 'react';

import SubNavLink from 'src/components/App/NavBar/SubNav/SubNavLink';
import type { LinkShape } from 'src/components/App/NavBar/types';
import { toMedia } from 'src/mediaQuery';
import { isHamburger } from 'src/screens';

interface SubNavProps extends ComponentPropsWithRef<'ul'> {
    readonly useDarkFont: boolean;
    readonly basePath: LinkShape;
    readonly currentSpecificPath: string;
    readonly links: LinkShape[];
    readonly onClick: () => void;
}

const styles = {
    ul: css({
        visibility: 'hidden',
        opacity: 0,
        zIndex: 10,
        position: 'absolute',
        listStyle: 'none',
        paddingLeft: 0,
        marginTop: 0,
        display: 'inline-block',
        transformOrigin: 'top',
        transform: 'translateX(-50%) translateZ(0)',
        overflow: 'visible',
        boxShadow: '0 5px 11px -5px rgba(0 0 0 / 0.5)',

        [toMedia(isHamburger)]: {
            width: '100%',
            opacity: 1,
            position: 'relative',
            transform: 'unset',
            overflow: 'hidden',
            visibility: 'unset',
            backgroundColor: 'unset',
            backdropFilter: 'unset',
            boxShadow: 'unset',
        },
    }),
    darkFont: css({
        // backgroundColor: 'rgba(255 255 255 / 0.1)',
        backdropFilter: 'blur(12px)',
    }),
    lightFont: css({
        backgroundColor: 'rgba(0 0 0 / 0.08)',
        backdropFilter: 'blur(1px)',
    }),
};

const SubNav: React.FC<SubNavProps> = ({ links, ...props }) => (
    <ul
        css={[
            styles.ul,
            props.useDarkFont ? styles.darkFont : styles.lightFont,
        ]}
    >
        {links.map((link) => (
            <SubNavLink key={link.path} link={link} {...props} />
        ))}
    </ul>
);

export default React.memo(SubNav, (prev, next) => {
    return (
        prev.useDarkFont === next.useDarkFont &&
        prev.currentSpecificPath === next.currentSpecificPath
    );
});

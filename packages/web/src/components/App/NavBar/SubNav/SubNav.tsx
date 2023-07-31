import styled from '@emotion/styled';
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
    readonly isHamburger: boolean;
}

const SubNavContainer = styled.ul<{ isHome: boolean }>(
    {
        zIndex: 10,
        position: 'absolute',
        listStyle: 'none',
        paddingLeft: 0,
        marginTop: 0,
        display: 'inline-block',
        transformOrigin: 'top',
        transform: 'translateX(-50%)',
        overflow: 'visible',
    },
    ({ isHome }) =>
        isHome && {
            backgroundColor: 'rgba(0 0 0 / 0.1)',
            backdropFilter: 'blur(2px)',
            boxShadow: '0 5px 11px -5px rgba(0 0 0 / 0.5)',
        },
    {
        [toMedia(isHamburger)]: {
            width: '100%',
            position: 'relative',
            transform: 'unset',
            overflow: 'hidden',
            backgroundColor: 'unset',
            backdropFilter: 'unset',
            boxShadow: 'unset',
        },
    },
);

const SubNav: React.FC<SubNavProps> = ({ links, isHamburger, ...props }) => (
    <SubNavContainer isHome={props.isHome}>
        {links.map((link) => (
            <SubNavLink
                key={link.path}
                link={link}
                isHamburger={isHamburger}
                {...props}
            />
        ))}
    </SubNavContainer>
);

export default React.memo(SubNav);

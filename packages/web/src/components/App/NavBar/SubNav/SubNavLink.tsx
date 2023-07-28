import * as React from 'react';
import { Link } from 'react-router-dom';

import styled from '@emotion/styled';

import { lightBlue, navFontColor } from 'src/styles/colors';
import { noHighlight } from 'src/styles/mixins';

import { LinkShape } from 'src/components/App/NavBar/types';
import { darken, saturate } from 'polished';

interface SubNavLinkProps {
    readonly isHome: boolean;
    readonly basePath: LinkShape;
    readonly link: LinkShape;
    readonly onClick: () => void;
    readonly isHamburger: boolean;
    readonly currentSpecificPath: string;
}

const StyledSubNavLink = styled(
    Link,
    { shouldForwardProp: (prop) => (
        prop !== 'isHamburger' &&
        prop !== 'isHome' &&
        prop !== 'isActive'
    ), }
)<{ isHamburger: boolean; isHome: boolean, isActive: boolean }>(
    {
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
    },
    (props) => props.isActive && {
        '&:hover': {
            color: 'white',
        }
    },
    (props) => props.isHamburger && {
        color: props.isActive ? lightBlue : navFontColor,
        padding: '0.5rem 1rem 0.5rem',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        textAlign: 'right',
        '&:hover': {
            color: 'unset',
            backgroundColor: 'transparent',
        },
    },
    (props) => props.isHamburger && props.isActive && {
        '&:hover': {
            color: saturate(0.2, darken(0.1, lightBlue)),
        }
    },
    (props) => props.isHome && {
        color: 'white',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        '&:hover': {
            textShadow: '0 0 1px rgba(255, 255, 255, 1)',
            backgroundColor: 'rgba(53, 53, 53, 0.27)',
            boxShadow: '0 6px 11px -5px rgba(0, 0, 0, 0.5)',
            color: 'white',
        }
    }
);

const StyledLi = styled.li(noHighlight);

const SubNavLink: React.FC<SubNavLinkProps> = ({ basePath, link, onClick, isHome, isHamburger, currentSpecificPath }) => {
    return (
        <StyledLi className={basePath.name}>
            <StyledSubNavLink
                to={`${basePath.path}${link.path}`}
                isHamburger={isHamburger}
                isHome={isHome}
                isActive={link.name === currentSpecificPath}
                onClick={() => { setTimeout(() => onClick(), 250); }}
            >
                {link.name}
            </StyledSubNavLink>
        </StyledLi>
    );
};

export default SubNavLink;

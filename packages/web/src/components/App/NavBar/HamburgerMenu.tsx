import * as React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

const hamburgerLayerHeight = 2;
const hamburgerLayerBorderRadius = '0px';
const hamburgerLayerExpandRotation = 135;
const hamburgerLayerOffsetMultiple = 10;

const hamburgerMenuWidth = '32px';
const hamburgerMenuHeight = `${hamburgerLayerOffsetMultiple * 2 + hamburgerLayerHeight}px`;

const hamburgerLayerStyles = (backgroundColor: string) => css`
    display: block;
    position: absolute;
    height: ${hamburgerLayerHeight}px;
    width: 100%;
    background-color: ${backgroundColor};
    border-radius: ${hamburgerLayerBorderRadius};
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition:
        transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
        left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
        top 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 0.3s ease-in-out,
        background-color 0.3s;
`;

interface HamburgerLayerProps {
    isExpanded: boolean;
    backgroundColor: string;
}

const HamburgerTop = styled.span<HamburgerLayerProps>(
    (props) => hamburgerLayerStyles(props.backgroundColor),
    (props) => ({
        top: props.isExpanded ? hamburgerLayerOffsetMultiple : 0,
        transform: props.isExpanded ? `rotate(-${hamburgerLayerExpandRotation}deg)` : 'none',
    }),
);

const HamburgerMiddle = styled.span<HamburgerLayerProps>(
    (props) => hamburgerLayerStyles(props.backgroundColor),
    (props) => ({
        top: hamburgerLayerOffsetMultiple,
        opacity: props.isExpanded ? 0 : 1,
        left: props.isExpanded ? 60 : 0,
    }),
);

const HamburgerBottom = styled.span<HamburgerLayerProps>(
    (props) => hamburgerLayerStyles(props.backgroundColor),
    (props) => ({
        top: props.isExpanded ? hamburgerLayerOffsetMultiple : hamburgerLayerOffsetMultiple * 2,
        transform: props.isExpanded ? `rotate(${hamburgerLayerExpandRotation}deg)` : 'none',
    }),
);

interface HamburgerMenuProps {
    isExpanded: boolean;
    className?: string;
    onClick: () => void;
    layerColor: string;
}

const StyledHamburger = styled.div`
    width: ${hamburgerMenuWidth};
    height: ${hamburgerMenuHeight};
    position: relative;
    transform: rotate(0deg);
    transition: 0.5s ease-in-out;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
`;

const HamburgerMenu: React.FC<HamburgerMenuProps> = (props) => (
    <StyledHamburger onClick={props.onClick}>
        <HamburgerTop isExpanded={props.isExpanded} backgroundColor={props.layerColor} />
        <HamburgerMiddle isExpanded={props.isExpanded} backgroundColor={props.layerColor} />
        <HamburgerBottom isExpanded={props.isExpanded} backgroundColor={props.layerColor} />
    </StyledHamburger>
);

export default HamburgerMenu;

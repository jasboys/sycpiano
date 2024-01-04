import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as React from 'react';

const hamburgerLayerHeight = 2;
const hamburgerLayerBorderRadius = 0;
const hamburgerLayerExpandRotation = 135;
const hamburgerLayerOffsetMultiple = 10;

const hamburgerMenuWidth = 32;
const hamburgerMenuHeight = hamburgerLayerOffsetMultiple * 2 + hamburgerLayerHeight;

const hamburgerLayerStyles = (backgroundColor: string) =>
    css({
        display: 'block',
        position: 'absolute',
        height: hamburgerLayerHeight,
        width: '100%',
        backgroundColor: backgroundColor,
        borderRadius: hamburgerLayerBorderRadius,
        opacity: 1,
        left: 0,
        transform: 'rotate(0deg)',
        transition: `
            transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
            opacity 0.3s ease-in-out,
            background-color 0.3s;`,
    });

interface HamburgerLayerProps {
    isExpanded: boolean;
    backgroundColor: string;
}

const HamburgerTop = styled.span<HamburgerLayerProps>({
    top: 0
},
    (props) => hamburgerLayerStyles(props.backgroundColor),
    (props) => ({
        // top: props.isExpanded ? hamburgerLayerOffsetMultiple : 0,
        transform: props.isExpanded
            ? `translate3d(0, ${hamburgerLayerOffsetMultiple}px, 0) rotate(${hamburgerLayerExpandRotation + 90}deg)`
            : 'none',
    }),
);

const HamburgerMiddle = styled.span<HamburgerLayerProps>(
    {
        top: hamburgerLayerOffsetMultiple,
    },
    (props) => hamburgerLayerStyles(props.backgroundColor),
    (props) => ({
        opacity: props.isExpanded ? 0 : 1,
        transform: props.isExpanded
            ? 'translate3d(60px, 0, 0)'
            : 'translate3d(0, 0, 0)',
    }),
);

const HamburgerBottom = styled.span<HamburgerLayerProps>({
    top: hamburgerLayerOffsetMultiple * 2
},
    (props) => hamburgerLayerStyles(props.backgroundColor),
    (props) => ({
        transform: props.isExpanded
            ? `translate3d(0, -${hamburgerLayerOffsetMultiple}px, 0) rotate(${hamburgerLayerExpandRotation}deg)`
            : 'none',
    }),
);

interface HamburgerMenuProps {
    isExpanded: boolean;
    className?: string;
    onClick: () => void;
    layerColor: string;
}

// TODO change to button for a11y
const StyledHamburger = styled.div({
    width: hamburgerMenuWidth,
    height: hamburgerMenuHeight,
    position: 'relative',
    transition: '0.5s ease-in-out',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
});

const HamburgerMenu: React.FC<HamburgerMenuProps> = (props) => (
    <StyledHamburger onClick={props.onClick}>
        <HamburgerTop
            isExpanded={props.isExpanded}
            backgroundColor={props.layerColor}
        />
        <HamburgerMiddle
            isExpanded={props.isExpanded}
            backgroundColor={props.layerColor}
        />
        <HamburgerBottom
            isExpanded={props.isExpanded}
            backgroundColor={props.layerColor}
        />
    </StyledHamburger>
);

export default React.memo(HamburgerMenu);

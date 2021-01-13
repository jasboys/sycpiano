import * as React from 'react';

import { css } from '@emotion/react';
import styled, { Interpolation } from '@emotion/styled';

import { PauseSVG, PlaySVG, SkipSVG } from 'src/components/Media/Music/IconSVGs';
import { AnyComponent } from 'src/types';

interface IconProps {
    setRef: (div: HTMLDivElement) => void;
    width: number;
    height: number;
    verticalOffset: number;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    Component?: AnyComponent<any>;
    className?: string;
}

const getSharedStyle = (verticalOffset: number) => css({
    transform: `translateY(${verticalOffset}px)`,
    transformOrigin: 'center center',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    webkitTap: 'transparent',
});

const StyledIcon = styled.div<{ verticalOffset: number }>`
    ${(props) => getSharedStyle(props.verticalOffset)}
    opacity: 0;
    pointer-events: none;
    position: absolute;

    svg {
        pointer-events: none;
    }
`;

const getInnerBlurStyle = css({
    position: 'absolute',
    fill: '#eee',
    zIndex: 1,
})

const getInnerSolidStyle = css({
    position: 'absolute',
    fill: '#999',
    zIndex: 1,
})

const Icon: React.FC<IconProps> = ({ setRef, verticalOffset, Component, ...props }) => (
    <StyledIcon
        ref={(div) => setRef(div)}
        verticalOffset={verticalOffset}
    >
        <Component css={getInnerSolidStyle} {...props} />
        <Component css={getInnerBlurStyle} {...props} />
    </StyledIcon>
);

export const PlayIcon: React.FC<IconProps> = ({ ...props }) => (
    <Icon Component={PlaySVG} {...props} />
);

export const PauseIcon: React.FC<IconProps> = ({ ...props }) => (
    <Icon Component={PauseSVG} {...props} />
);

export const SkipIcon: React.FC<IconProps> = ({ ...props }) => (
    <Icon Component={SkipSVG} {...props} />
);

interface ButtonProps {
    readonly isHovering: boolean;
    readonly onMouseOver: () => void;
    readonly onMouseOut: () => void;
    readonly onMouseMove: (event: React.MouseEvent<HTMLElement>) => void;
    readonly onClick: (event: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLElement>) => void;
    readonly width: number;
    readonly height: number;
    readonly verticalOffset: number;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    readonly Component?: AnyComponent<any>;
    readonly className?: string;
}

const StyledButton = styled.div<{ verticalOffset: number; height: number; width: number }>(
    ({ verticalOffset, width, height }) => ({
        ...getSharedStyle(verticalOffset),
        width,
        height,
    }),
    {
        transition: 'opacity 0.25s',
        opacity: 1,
        flex: 'initial',
    },
);

const solidButtonStyle = css(
    getInnerSolidStyle,
    {
        zIndex: 2,
        transition: 'fill 0.25s',
    },
);

const solidButtonHover = css`
    cursor: pointer;
    fill: #eee;
`;

const blurButtonStyle = css(
    getInnerBlurStyle,
    {
        transition: 'blur 0.25s',
    },
);

const blurButtonHover = css` filter: blur(5px); `;

const Button: React.FC<ButtonProps & React.HTMLProps<HTMLDivElement>> = ({
    isHovering,
    onMouseOver,
    onMouseOut,
    onMouseMove,
    onClick,
    width,
    height,
    verticalOffset,
    Component,
    className,
}) => (
        <StyledButton
            onMouseMove={onMouseMove}
            verticalOffset={verticalOffset}
            width={width}
            height={height}
        >
            <Component
                css={[
                    solidButtonStyle,
                    isHovering && solidButtonHover,
                ]}
                className={className}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
                onClick={onClick}
                width={width}
                height={height}
            />
            <Component
                css={[
                    blurButtonStyle,
                    isHovering && blurButtonHover,
                ]}
                className={className}
                width={width}
                height={height}
            />
        </StyledButton>
    );

export const PlayButton: React.FC<ButtonProps & React.HTMLProps<HTMLDivElement>> = ({ ...props }) =>
    <Button Component={PlaySVG} {...props} />;

export const PauseButton: React.FC<ButtonProps & React.HTMLProps<HTMLDivElement>> = ({ ...props }) =>
    <Button Component={PauseSVG} {...props} />;

export const SkipButton: React.FC<ButtonProps & React.HTMLProps<HTMLDivElement>> = ({ ...props }) =>
    <Button Component={SkipSVG} {...props} />;

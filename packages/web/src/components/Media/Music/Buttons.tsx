import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as React from 'react';

import {
    PauseSVG,
    PlaySVG,
    SkipSVG,
} from 'src/components/Media/Music/IconSVGs';

interface IconProps {
    // setRef: (div: HTMLDivElement | null) => void;
    width: number | string;
    height: number | string;
    verticalOffset: number;
    Component?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    className?: string;
}

const getSharedStyle = (verticalOffset: number) =>
    css({
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
});

const getInnerSolidStyle = css({
    position: 'absolute',
    fill: '#999',
    zIndex: 1,
});

const Icon = React.forwardRef<HTMLDivElement, IconProps & React.SVGProps<SVGSVGElement>>(({
    verticalOffset,
    Component,
    ...props
}, ref) => {
    return Component === undefined ? null : (
        <StyledIcon ref={ref} verticalOffset={verticalOffset}>
            <Component css={getInnerSolidStyle} {...props} />
            <Component css={getInnerBlurStyle} {...props} />
        </StyledIcon>
    );
});
export const PlayIcon = React.memo(
    React.forwardRef<HTMLDivElement, IconProps>(({ ...props }, ref) => (
        <Icon ref={ref} Component={PlaySVG} {...props} />
    )),
);

export const PauseIcon = React.memo(
    React.forwardRef<HTMLDivElement, IconProps>(({ ...props }, ref) => (
    <Icon ref={ref} Component={PauseSVG} {...props} />
)));

export const SkipIcon = React.memo(
    React.forwardRef<HTMLDivElement, IconProps>(({ ...props }, ref) => (
    <Icon ref={ref} Component={SkipSVG} {...props} />
)));

interface ButtonProps {
    readonly isHovering: boolean;
    readonly onMouseMove: (event: React.MouseEvent<HTMLElement>) => void;
    readonly onClick: (event: React.MouseEvent<HTMLElement>) => void;
    readonly width: number;
    readonly height: number;
    readonly verticalOffset: number;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    readonly Component?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const StyledButton = styled.div<{
    verticalOffset: number;
    height: number;
    width: number;
}>(
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

const solidButtonStyle = css(getInnerSolidStyle, {
    zIndex: 2,
    transition: 'fill 0.25s',
});

const solidButtonHover = css`
    cursor: pointer;
    fill: #eee;
`;

const blurButtonStyle = css(getInnerBlurStyle, {
    transition: 'blur 0.25s',
});

const blurButtonHover = css` filter: blur(5px); `;

const Button = React.forwardRef<
    HTMLDivElement,
    ButtonProps & React.SVGProps<SVGSVGElement>
>(
    (
        {
            isHovering,
            onMouseOver,
            onMouseOut,
            onBlur,
            onFocus,
            onMouseMove,
            onClick,
            width,
            height,
            verticalOffset,
            Component,
            className,
        },
        ref,
    ) => {
        return Component === undefined ? null : (
            <StyledButton
                ref={ref}
                onMouseMove={onMouseMove}
                verticalOffset={verticalOffset}
                width={width}
                height={height}
            >
                <Component
                    css={[solidButtonStyle, isHovering && solidButtonHover]}
                    className={className}
                    onMouseOver={onMouseOver}
                    onMouseOut={onMouseOut}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    onClick={onClick}
                    width={width}
                    height={height}
                />
                <Component
                    css={[blurButtonStyle, isHovering && blurButtonHover]}
                    className={className}
                    width={width}
                    height={height}
                />
            </StyledButton>
        );
    },
);

export const PlayButton = React.memo(
    React.forwardRef<
        HTMLDivElement,
        ButtonProps & React.SVGProps<SVGSVGElement>
    >(({ ...props }, ref) => (
        <Button Component={PlaySVG} {...props} ref={ref} />
    )),
);

export const PauseButton = React.memo(
    React.forwardRef<
        HTMLDivElement,
        ButtonProps & React.SVGProps<SVGSVGElement>
    >(({ ...props }, ref) => (
        <Button Component={PauseSVG} {...props} ref={ref} />
    )),
);

export const SkipButton = React.memo(
    React.forwardRef<
        HTMLDivElement,
        ButtonProps & React.SVGProps<SVGSVGElement>
    >(({ ...props }, ref) => (
        <Button Component={SkipSVG} {...props} ref={ref} />
    )),
);

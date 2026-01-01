import type * as React from 'react';

export const PlaySVG: React.FC<React.SVGProps<SVGSVGElement>> = ({
    onMouseOver,
    onMouseOut,
    onFocus,
    onBlur,
    width,
    height,
    onClick,
    onKeyDown,
    ...props
}) => (
    <svg
        {...props}
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 132.29166 132.29166"
        onClick={onClick}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
    >
        <title>Play Icon</title>
        <path d="M105.252 66.145L75.922 83.08l-29.33 16.932V32.28l29.33 16.932z" />
    </svg>
);

export const SkipSVG: React.FC<React.SVGProps<SVGSVGElement>> = ({
    onMouseOver,
    onMouseOut,
    onFocus,
    onBlur,
    width,
    height,
    onClick,
    onKeyDown,
    ...props
}) => (
    <svg
        {...props}
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 198.436 132.29166"
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={onClick}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
    >
        <title>Skip Icon</title>
        <g>
            <path d="M105.252 66.145L75.922 83.08l-29.33 16.932V32.28l29.33 16.932z" />
            <path d="M151.844 66.145L122.514 83.08l-29.33 16.932V32.28l29.33 16.932z" />
            <path d="M143.776 66.145V100h8.068V32.28h-8.068z" />
        </g>
    </svg>
);

export const PauseSVG: React.FC<React.SVGProps<SVGSVGElement>> = ({
    onMouseOver,
    onMouseOut,
    onFocus,
    onBlur,
    width,
    height,
    onClick,
    onKeyDown,
    ...props
}) => (
    <svg
        width={width}
        height={height}
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 132.29166 132.29166"
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={onClick}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
    >
        <title>Pause Icon</title>
        <g>
            <path
                fill="#FFF"
                fillOpacity="0"
                d="M23.813 23.813h84.667v84.667H23.813z"
            />
            <path d="M44.71 32.28H55.29v67.732H44.71zm32.29 0H87.58v67.732H77z" />
        </g>
    </svg>
);

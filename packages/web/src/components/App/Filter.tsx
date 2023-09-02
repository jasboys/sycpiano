import React from 'react';

export const BlurFilter = React.forwardRef<
    SVGFEGaussianBlurElement,
    { filterName: string }
>(({ filterName }, ref) => (
    <svg xmlns="http://www.w3.org/2000/svg" css={{ width: 0, height: 0, display: 'block' }}>
        <title>filter</title>
        <defs>
            <filter id={filterName}>
                <feGaussianBlur
                    ref={ref}
                    stdDeviation="0"
                    result="blur"
                    colorInterpolationFilters="sRGB"
                />
                <feColorMatrix
                    colorInterpolationFilters="sRGB"
                    in="blur"
                    type="matrix"
                    values="1 0 0 0 0
                                    0 1 0 0 0
                                    0 0 1 0 0
                                    0 0 0 0 1"
                />
            </filter>
        </defs>
    </svg>
));
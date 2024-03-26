import type * as React from 'react';

export const SearchIconSVG: React.FC<Record<never, unknown>> = () => (
    <svg style={{ display: 'none' }}>
        <title>Search Icon Template</title>
        <symbol id="search_icon_template">
            <path
                d="M19.427 21.427a8.5 8.5 0 1 1 2-2l5.585 5.585c.55.55.546 1.43 0 1.976l-.024.024a1.4 1.4 0 0 1-1.976 0l-5.585-5.585zM14.5 21a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z"
                fillRule="evenodd"
            />
        </symbol>
    </svg>
);

export const SearchIconInstance: React.FC<React.SVGProps<SVGSVGElement>> = (
    props,
) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 32 32"
    >
        <title>Search Icon Instance</title>
        <use xlinkHref="#search_icon_template" />
    </svg>
);

import type * as React from 'react';

export const LocationIconSVG: React.FC<Record<never, unknown>> = () => (
    <svg style={{ display: 'none' }}>
        <title>Location Icon Template</title>
        <symbol id="location_icon_template">
            <path
                id="location-icon-marker-part"
                strokeWidth="2"
                strokeMiterlimit="10"
                d="M400 200.106c0-55.23-44.77-100.053-100-100.053s-100 44.852-100 100.08c0 10.008 1.477 19.867 4.213 28.867h-.003C214.02 266 300 401.213 300 401.213S385.98 266 395.79 229h-.003c2.736-9 4.213-18.886 4.213-28.894zM300 240c-22.092 0-40-17.908-40-40s17.908-40 40-40c22.09 0 40 17.908 40 40s-17.91 40-40 40z"
            />
        </symbol>
    </svg>
);

export const LocationIconInstance: React.FC<React.SVGProps<SVGSVGElement>> = (
    props,
) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="600"
        height="600"
        viewBox="100 50 400 400"
    >
        <title>Location Icon Instance</title>
        <use xlinkHref="#location_icon_template" />
    </svg>
);

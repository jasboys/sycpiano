import * as React from 'react';

export const LinkIconSVG: React.FC<Record<string, unknown>> = () => (
    <svg style={{ display: 'none' }}>
        <symbol id="link_icon_template">
            <path d="M5.306 20.48a4.222 4.222 0 0 0 0 5.964 4.222 4.222 0 0 0 5.964 0l4.476-4.476 1.66-1.66c-.884.342-1.498.383-2.093.223l-.502.508-4.47 4.476a2.874 2.874 0 0 1-4.094 0 2.873 2.873 0 0 1 .002-4.092l4.476-4.475.716-.713 1.12-1.12 1.12-1.12c.57-.57 1.305-.85 2.045-.85s1.473.28 2.044.85c.283.287.453.44.65.76.165.27.36.8.36 1.37l1.035-1.03c.013-.335-.146-.75-.3-1.003-.27-.453-.4-.623-.81-1.033a4.21 4.21 0 0 0-5.963 0l-1.12 1.12-1.12 1.12-.714.714zm21.138-9.21a4.222 4.222 0 0 0 0-5.964 4.222 4.222 0 0 0-5.964 0l-4.476 4.476-1.66 1.66c.884-.342 1.498-.383 2.093-.223l.502-.508 4.47-4.476a2.874 2.874 0 0 1 4.094 0 2.873 2.873 0 0 1-.002 4.092l-4.474 4.48-.715.713-1.118 1.12-1.12 1.12c-.57.57-1.307.85-2.047.85a2.87 2.87 0 0 1-2.04-.85c-.285-.286-.455-.44-.65-.76-.167-.27-.36-.8-.362-1.37l-1.036 1.03c-.012.336.147.75.3 1.004.272.453.4.623.81 1.034a4.21 4.21 0 0 0 5.964 0l1.12-1.12 1.12-1.12.714-.714z" />
        </symbol>
    </svg>
);

export const LinkIconInstance: React.FC<React.SVGAttributes<unknown>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 31.749999 31.750001">
        <use xlinkHref="#link_icon_template" />
    </svg>
);

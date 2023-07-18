import * as React from 'react';

export const BackIconSVG: React.FC<Record<never, unknown>> = () => {
    return (
        <svg style={{ display: 'none' }}>
            <symbol id="back_icon_template" viewBox="0 0 36 36">
                <line x1={8} y1={18} x2={24} y2={30} />
                <line x1={8} y1={18} x2={24} y2={6} />
            </symbol>
        </svg>
    );
};

export const BackIconInstance: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
        <use href="#back_icon_template" />
    </svg>
);
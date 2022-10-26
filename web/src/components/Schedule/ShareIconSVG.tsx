import * as React from 'react';

export const ShareIconSVG: React.FC<Record<never, unknown>> = () => {
    const xs = [-10, -10 * Math.cos(2 * Math.PI / 3), -10 * Math.cos(4 * Math.PI / 3)];
    const ys = [0, -10 * Math.sin(2 * Math.PI / 3), -10 * Math.sin(4 * Math.PI / 3)]
    return (
        <svg style={{ display: 'none' }}>
            <symbol id="share_icon_template" viewBox="-18 -18 36 36">
                <circle cx={xs[0]} cy={ys[0]} r={3.2} />
                <circle cx={xs[1]} cy={ys[1]} r={3.2} />
                <circle cx={xs[2]} cy={ys[2]} r={3.2} />
                <path d={`M${xs[1]} ${ys[1]}L${xs[0]} ${ys[0]}L${xs[2]} ${ys[2]}`} fill="none"/>
            </symbol>
        </svg>
    );
};

export const ShareIconInstance = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    (props, ref) => (
        <svg ref={ref} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
            <use href="#share_icon_template" width={props.width} height={props.height} />
        </svg>
    )
);

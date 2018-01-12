import * as React from 'react';

import { Moment } from 'moment-timezone';

import { polarToCartesian } from 'src/utils';

const HOUR_LENGTH = 120;
const MINUTES_LENGTH = 180;

export const ClockIconInstance: React.SFC<React.SVGAttributes<{}> & { readonly date: Moment; }> = ({ date, ...props }) => {
    const minutes = date.minutes();
    const minutesAngle = -Math.PI / 2 + Math.PI * minutes / 30;

    const hour = date.hour() + minutes / 60;
    const hourAngle = -Math.PI / 2 + Math.PI * hour / 6;

    const [minutesX, minutesY] = polarToCartesian(MINUTES_LENGTH, minutesAngle, [300, 300]);
    const [hourX, hourY] = polarToCartesian(HOUR_LENGTH, hourAngle, [300, 300]);
    return (
        <svg {...props} xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'>
            <circle fill='none' id='clock-border' cx='300' cy='300' r='200' />
            <line id='minute-hand' x1='300' y1='300' x2={minutesX} y2={minutesY} />
            <line id='hour-hand' x1='300' y1='300' x2={hourX} y2={hourY} />
        </svg>
    );
};

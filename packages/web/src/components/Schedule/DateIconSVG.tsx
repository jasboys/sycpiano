import add from 'date-fns/add';
import getISODay from 'date-fns/getISODay';
import isSameDay from 'date-fns/isSameDay';
import isSameMonth from 'date-fns/isSameMonth';
import startOfMonth from 'date-fns/startOfMonth';
import sub from 'date-fns/sub';
import * as React from 'react';

export const DateIconSVG: React.FC<Record<never, unknown>> = () => {
    return (
        <svg style={{ display: 'none' }}>
            <symbol id="date_icon_template">
                <path strokeMiterlimit="10" d="M487.16 99.5H111.84c-6.815 0-12.34 6.697-12.34 14.958v370.085c0 8.26 5.524 14.957 12.34 14.957h375.32c6.815 0 12.34-6.696 12.34-14.957V114.458c0-8.26-5.524-14.958-12.34-14.958zM400 112c10.86 0 19.67 8.8 19.67 19.67 0 10.86-8.81 19.66-19.67 19.66s-19.67-8.8-19.67-19.66c0-10.87 8.81-19.67 19.67-19.67zm-200 0c10.86 0 19.667 8.805 19.667 19.667 0 10.86-8.806 19.667-19.667 19.667s-19.667-8.805-19.667-19.667C180.333 120.805 189.14 112 200 112zm298.5 374.978c0 6.363-5.51 11.522-12.31 11.522H112.81c-6.798 0-12.31-5.16-12.31-11.522V210.022c0-6.364 5.51-11.522 12.31-11.522h373.38c6.8 0 12.31 5.16 12.31 11.522v276.956z" />
            </symbol>
        </svg>
    );
};

interface DateIconProps extends React.SVGProps<SVGSVGElement> {
    readonly date: Date;
}

export const DateIconInstance: React.FC<DateIconProps> = ({ date, ...props }) => {
    const monthStart = startOfMonth(date);
    const startDay = getISODay(monthStart) % 7;
    const firstDayOfCalendar = sub(monthStart, { days: startDay });
    const calendarArray: Date[] = new Array(42);
    for (let i = 0; i < 42; i++) {
        calendarArray[i] = add(firstDayOfCalendar, { days: i });
    }
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
            <use xlinkHref="#date_icon_template" />
            {
                calendarArray.map((element, index) => {
                    const x = 118 + 3 + index % 7 * 52;
                    const y = 224 + 3 + Math.floor(index / 7) * 42;
                    if (isSameMonth(date, element)) {
                        const className = (isSameDay(date, element)) ? 'active' : 'inactive';
                        return <rect key={index} className={className} stroke="none" x={x} y={y} width="46" height="36" />;
                    }
                })
            }
        </svg>
    );
};

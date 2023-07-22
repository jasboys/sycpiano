import { css } from '@emotion/react';
import { parseISO } from 'date-fns';
import { utcToZonedTime, formatInTimeZone } from 'date-fns-tz';
import { toMedia } from 'src/mediaQuery.js';
import { screenXS } from 'src/screens.js';
import { logoBlue } from 'src/styles/colors.js';
import { ClockIconInstance } from 'src/components/Schedule/ClockIconSVG.jsx';
import { EventDateTimeProps } from '../types.js';

const eventTimeStyle = css({
    marginLeft: -6,
    fontSize: '1rem',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    stroke: logoBlue,
    height: 30,

    [toMedia(screenXS)]: {
        fontSize: '0.8rem',
        height: 24,
    }
});

const clockStyle = css({
    strokeWidth: 20,
    width: 20,
    height: 20,
    [toMedia(screenXS)]: {
        width: 16,
        height: 16,
        strokeWidth: 24,
    },
});

export const EventTime: React.FC<Omit<EventDateTimeProps, 'rounded'>> = ({ dateTime, timezone, isMobile }) => (
    <div css={eventTimeStyle}>
        <div css={{ margin: '0 3px', display: 'flex' }}>
            <ClockIconInstance css={clockStyle} date={utcToZonedTime(dateTime, timezone)} />
        </div>
        <div css={{ marginLeft: isMobile ? 0 : 10 }}>{formatInTimeZone(parseISO(dateTime), timezone, 'h:mm a z')}</div>
    </div>
);
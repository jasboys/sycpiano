import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { format, parseISO } from 'date-fns';
import * as React from 'react';

import { toMedia } from 'src/mediaQuery.js';
import { screenXS } from 'src/screens.js';
import { latoFont } from 'src/styles/fonts.js';
import { EventDateTimeProps } from '../types.js';


const Connector = styled.div({
    flex: '1 1 1rem',
    width: '100%',
    background:
        `linear-gradient(
            to right,
            transparent 0%,
            transparent calc(50% - 0.82px),
            white calc(50% - 0.82px),
            white calc(50% + 0.82px),
            transparent calc(50% + 0.82px),
            transparent 100%
        )`,
    margin: '0.2rem 0',
});

const eventDateStyle = css(
    latoFont(300),
    {
        textAlign: 'center',
        background: 'none',
        color: 'white',
        height: '100%',
        width: 80,
        padding: '1.0rem 1.0rem',
        flex: '0 0 auto',
        zIndex: 5,
        position: 'relative',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        [toMedia(screenXS)]: {
            padding: '1.0rem',
            width: 60,
        },
    }
);

const MonthDay = styled.div({
    flex: '0 0 auto',
    fontSize: '2.0rem',
    lineHeight: '2.2rem',
    [toMedia(screenXS)]: {
        fontSize: '1.5rem',
    }
});

const DayOfWeek = styled.div({
    flex: '0 0 auto',
    fontSize: '0.8rem',
    lineHeight: '0.75rem',
});

const Overlay = styled.div({
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    backgroundColor: `#0000008a`,
    backdropFilter: 'blur(1px)',
});

export const EventDate: React.FC<EventDateTimeProps> = (props) => {
    const date = parseISO(props.dateTime);
    const end = props.endDate ? parseISO(props.endDate) : undefined;
    return (
        <div css={eventDateStyle}>
            <Overlay />
            <MonthDay>
                {`${format(date, 'dd')}`}
            </MonthDay>
            <DayOfWeek>
                {format(date, 'EE')}
            </DayOfWeek>
            {!!end && (
                <>
                    <Connector />
                    <MonthDay css={{ justifySelf: 'flex-end' }}>
                        {`${format(end, 'dd')}`}
                    </MonthDay>
                    <DayOfWeek css={{ justifySelf: 'flex-end' }}>
                        {format(end, 'EE')}
                    </DayOfWeek>
                </>
            )}

        </div>
    );
};

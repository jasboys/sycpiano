import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { format, parseISO } from 'date-fns';
import type * as React from 'react';

import { toMedia } from 'src/mediaQuery.js';
import { screenXS } from 'src/screens.js';
import { interFont } from 'src/styles/fonts.js';
import type { EventDateTimeProps } from '../types.js';

const CONNECTOR_WIDTH_HALF = 0.75

const Connector = styled.div({
    flex: '1 1 1rem',
    width: '100%',
    zIndex: 2,
    background: `linear-gradient(
            to right,
            transparent 0%,
            transparent calc(50% - ${CONNECTOR_WIDTH_HALF + 0.5}px),
            white calc(50% - ${CONNECTOR_WIDTH_HALF}px),
            white calc(50% + ${CONNECTOR_WIDTH_HALF}px),
            transparent calc(50% + ${CONNECTOR_WIDTH_HALF + 0.5}px),
            transparent 100%
        )`,
    marginTop: '0.2rem',
    [toMedia(screenXS)]: {
        background: `linear-gradient(
                to right,
                transparent 0%,
                transparent calc(50% - ${CONNECTOR_WIDTH_HALF + 0.25}px),
                white calc(50% - ${CONNECTOR_WIDTH_HALF}px),
                white calc(50% + ${CONNECTOR_WIDTH_HALF}px),
                transparent calc(50% + ${CONNECTOR_WIDTH_HALF + 0.25}px),
                transparent 100%
            )`,
    },
});

const eventDateStyle = css(interFont(200), {
    textAlign: 'center',
    background: 'none',
    color: 'white',
    height: '100%',
    width: 90,
    padding: '1.2rem 0.8rem',
    flex: '0 0 auto',
    zIndex: 3,
    position: 'relative',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    [toMedia(screenXS)]: {
        padding: '1.0rem',
        width: 80,
    },
});

const MonthDay = styled.div({
    flex: '0 0 auto',
    fontSize: '1.9rem',
    lineHeight: '2.2rem',
    zIndex: 2,
    [toMedia(screenXS)]: {
        fontSize: '1.4rem',
    },
});

const DayOfWeek = styled.div({
    flex: '0 0 auto',
    fontSize: '0.9rem',
    lineHeight: '1rem',
    zIndex: 2,
});

const Overlay = styled.div({
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    backgroundColor: '#00000070',
    backdropFilter: 'blur(1px)',
});

export const EventDate: React.FC<EventDateTimeProps> = (props) => {
    const date = parseISO(props.dateTime);
    const end = props.endDate ? parseISO(props.endDate) : undefined;
    return (
        <div css={eventDateStyle}>
            <Overlay />
            <MonthDay>{`${format(date, 'M/d')}`}</MonthDay>
            <DayOfWeek>{format(date, 'EE')}</DayOfWeek>
            {!!end && (
                <>
                    <Connector />
                    <MonthDay css={{ justifySelf: 'flex-end' }}>
                        {`${format(end, 'M/d')}`}
                    </MonthDay>
                    <DayOfWeek css={{ justifySelf: 'flex-end' }}>
                        {format(end, 'EE')}
                    </DayOfWeek>
                </>
            )}
        </div>
    );
};

import * as React from 'react';

import styled from '@emotion/styled';
import { toMedia } from 'src/mediaQuery.js';
import { screenXS } from 'src/screens.js';
import { offWhite, logoBlue } from 'src/styles/colors.js';
import { latoFont } from 'src/styles/fonts.js';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useNavigate } from 'react-router-dom';
import { BackIconInstance } from 'src/components/Schedule/BackIconSVG.jsx';
import EventItem from 'src/components/Schedule/EventItem.jsx';
import { EventListName, MonthGroup as MonthGroupType, } from 'src/components/Schedule/types.js';

const Events = styled.div({
    overflowY: 'auto',
});

const MonthGroup = styled.div({
    marginBottom: 4,
    width: '100vw',
});

const MonthBar = styled.div<{ isMobile: boolean }>(
    latoFont(300),
    {
        fontSize: 'min(10vw, 2rem)',
        position: 'sticky',
        top: 0,
        zIndex: 11,
        width: '86vw',
        display: 'flex',
        background: `linear-gradient(${offWhite} 0% 95%, rgba(255, 255, 255, 0))`,
        color: logoBlue,
        paddingTop: '2rem',
        [toMedia(screenXS)]: {
            ...latoFont(400),
            paddingTop: '0.5rem',
            fontSize: '1.6rem',
        }
    },
    ({ isMobile }) => (
        {
            maxWidth: isMobile ? 'unset' : 850,
            margin: isMobile ? 'auto' : '0 auto',
        }
    )
);


const BackButton = styled.div({
    width: 'min(10vw, 2.0rem)',
    height: 'min(10vw, 2.0rem)',
    borderRadius: '50%',
    border: '1px var(--logo-blue) solid',
    position: 'absolute',
    stroke: 'var(--logo-blue)',
    strokeWidth: '1.5px',
    alignSelf: 'center',
    transition: 'all 250ms',
    '&:hover': {
        cursor: 'pointer',
        stroke: 'var(--light-blue)',
        borderColor: 'var(--light-blue)'
    }
});

interface MonthEventsProps {
    type: EventListName;
    lastQuery?: string;
    idx: number;
    isHamburger: boolean;
    monthGroup: MonthGroupType;
}

export const MonthEvents: React.FC<MonthEventsProps> = ({
    type,
    lastQuery,
    idx,
    isHamburger,
    monthGroup,
}) => {
    const navigate = useNavigate();
    const backOnClick = React.useCallback(() => {
        navigate('/schedule/upcoming');
    }, []);

    return (
        <MonthGroup key={`${type}-${lastQuery!}-${idx}-month`}>
            <MonthBar isMobile={isHamburger}>
                {(type === 'event') &&
                    <BackButton>
                        <BackIconInstance onClick={backOnClick} />
                    </BackButton>
                }
                <div css={{}}>{format(parseISO(monthGroup.dateTime), 'MMMM yyyy')}</div>
            </MonthBar>
            <Events>
                {
                    monthGroup.events.map((event, idx) => {
                        const permaLink = `/schedule/event/${encodeURIComponent(formatInTimeZone(parseISO(event.dateTime), 'Zulu', `yyyyMMdd'T'HHmmssX`))}`;
                        return (
                            <EventItem
                                key={`${type}-${lastQuery!}-${idx}-event`}
                                listType={type}
                                isMobile={isHamburger}
                                permaLink={permaLink}
                                {...event}
                            />
                        );
                    })
                }
            </Events>
        </MonthGroup>
    );
};
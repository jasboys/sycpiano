import startCase from 'lodash-es/startCase';
import mix from 'polished/lib/color/mix';
import * as React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { LocationIconInstance } from 'src/components/Schedule/LocationIconSVG';
import { Collaborator, EventType, Piece } from 'src/components/Schedule/types';
import { getGoogleMapsSearchUrl } from 'src/components/Schedule/utils';

import { lightBlue, logoBlue } from 'src/styles/colors';
import { lato2 } from 'src/styles/fonts';

import { utcToZonedTime } from 'date-fns-tz';
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { ClockIconInstance } from 'src/components/Schedule/ClockIconSVG';
import { toMedia } from 'src/mediaQuery';
import { screenXS } from 'src/screens';

const locationIconDimension = 30;

const Connector = styled.div({
    height: '1.2rem',
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
    );`
})

interface EventDateTimeProps {
    dateTime: string;
    endDate?: string;
    timezone: string;
    isMobile: boolean;
}

const eventDateStyle = css({
    textAlign: 'center',
    background: 'none',
    color: 'white',
    height: 'fit-content',
    width: 'fit-content',
    padding: '1.5rem 1.0rem',
    flex: '0 0 auto',
    zIndex: 5,
    fontFamily: lato2,
    position: 'relative',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'end',
    [toMedia(screenXS)]: {
        paddingTop: '1.0rem',
    },
});

const MonthDay = styled.div({
    fontSize: '1.8rem',
    [toMedia(screenXS)]: {
        fontSize: '1.5rem',
    }
});

const DayOfWeek = styled.div({
    fontSize: '0.8rem',
})

const EventDate: React.FC<EventDateTimeProps> = (props) => {
    const date = parseISO(props.dateTime);
    const end = props.endDate ? parseISO(props.endDate) : undefined;
    return (
        <div css={eventDateStyle}>
            <MonthDay>
                {`${format(date, 'M/d')}`}
            </MonthDay>
            <DayOfWeek>
                {format(date, 'EEEE')}
            </DayOfWeek>
            {!!end && (
                <>
                    <Connector />
                    <MonthDay>
                        {`${format(end, 'M/d')}`}
                    </MonthDay>
                    <DayOfWeek>
                        {format(end, 'EEEE')}
                    </DayOfWeek>
                </>
            )}

        </div>
    );
};

interface EventNameProps {
    name: string;
    eventType: EventType;
    isMobile?: boolean;
    permaLink: string
}

const eventNameStyle = css({
    fontSize: '1.75rem',
    fontFamily: lato2,
    transition: 'color 0.2s',
    color: logoBlue,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: '0.4rem',
    wordBreak: 'break-word',

    '&:hover': {
        cursor: 'pointer',
    },

    [toMedia(screenXS)]: {
        fontSize: '1.25rem',
    },
});

const EventName: React.FC<EventNameProps> = ({ name, eventType }) => {
    return (
        <div css={eventNameStyle}>
            <span>
                {`${name}${eventType === 'masterclass' ? ': Masterclass' : ''}`}
            </span>
        </div>
    );
};

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
    width: 24,
    height: 24,
    [toMedia(screenXS)]: {
        width: 19.2,
        height: 19.2,
        strokeWidth: 24,
    },
});

const EventTime: React.FC<Omit<EventDateTimeProps, 'rounded'>> = ({ dateTime, timezone, isMobile }) => (
    <div css={eventTimeStyle}>
        <div css={{ margin: '0 3px', display: 'flex' }}>
            <ClockIconInstance css={clockStyle} date={utcToZonedTime(dateTime, timezone)} />
        </div>
        <div css={{ marginLeft: isMobile? 0 : 10 }}>{formatInTimeZone(parseISO(dateTime), timezone, 'h:mm a z')}</div>
    </div>
);

interface EventLocationProps { location: string; className?: string; isMobile?: boolean }

const getVenueName = (location: string): string => {
    if (!location) {
        return '';
    }

    // Example location string:
    // Howard L. Schrott Center for the Arts, 610 W 46th St, Indianapolis, IN 46208, USA
    const locArray = location.split(', ');
    return locArray.length >= 1 ? locArray[0] : '';
};

const locationIconStyle = css({
    height: locationIconDimension,
    width: locationIconDimension,
    stroke: logoBlue,
    fill: logoBlue,
    flex: '0 0 auto',
    [toMedia(screenXS)]: {
        height: 0.8 * locationIconDimension,
        width: 0.8 * locationIconDimension,
    },
});

const eventLocationStyle = css({
    fontSize: '1rem',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: 'fit-content',
    textDecoration: 'underline solid transparent',
    transition: 'text-decoration-color 0.2s',
    margin: '0.3rem 0 0.3rem -6px',
    '&:hover': {
        color: logoBlue,
        textDecorationColor: logoBlue,
    },
    [toMedia(screenXS)]: {
        fontSize: '0.8rem',
        marginTop: 0,
    }
});

const EventLocation: React.FC<EventLocationProps> = ({ location, isMobile }) => {
    return (
        <a
            href={getGoogleMapsSearchUrl(location)}
            css={eventLocationStyle}
            target="_blank"
            rel="noopener noreferrer"
        >
            <LocationIconInstance css={locationIconStyle} />

            <strong
                css={{ marginLeft: isMobile ? 0 : 10 }}
            >
                {getVenueName(location)}
            </strong>
        </a>
    );
};

interface EventCollaboratorsProps {
    collaborators: Collaborator[];
    className?: string;
}

const eventCollaboratorsStyle = css({
    listStyle: 'none',
    padding: 0,
    fontSize: '1rem',
    fontFamily: lato2,
    margin: '0.5rem 0',
    [toMedia(screenXS)]: {
        fontSize: '0.8rem',
    }
});

const CollaboratorName = styled.span({
    fontWeight: 'bold',
});

const EventCollaborators: React.FC<EventCollaboratorsProps> = ({ collaborators }) => (
    <div css={eventCollaboratorsStyle}>
        {collaborators.map((collaborator: Collaborator, i: number) => (
            collaborator.name && collaborator.instrument && (
                <div key={i}>
                    <CollaboratorName>{collaborator.name}</CollaboratorName>{' - '}
                    <span css={{ fontSize: '0.8em' }}>{startCase(collaborator.instrument)}</span>
                </div>
            )
        ))}
    </div>
);

interface EventProgramProps {
    program: Piece[];
}

const eventProgramStyle = css({
    listStyle: 'none',
    padding: 0,
    paddingLeft: '1rem',
    textIndent: '-1rem',
    fontSize: '1rem',
    fontFamily: lato2,
    margin: '0.5rem 0',
    [toMedia(screenXS)]: {
        fontSize: '0.8rem',
    }
});

const EventProgram: React.FC<EventProgramProps> = ({ program }) => (
    <div css={eventProgramStyle}>
        {program.map(({ composer, piece }: Piece, i: number) => (
            <div key={i}>
                {composer}{piece ? ' ' : ''}<i>{piece}</i>
            </div>
        ))}
    </div>
);

interface EventWebsiteButtonProps {
    website: string;
    className?: string;
}

const StyledWebsiteButton = styled.a({
    display: 'block',
    fontSize: '1.1rem',
    width: 'fit-content',
    padding: 11,
    textAlign: 'center',
    fontFamily: lato2,
    backgroundColor: 'var(--light-blue)',
    color: 'white',
    transition: 'all 0.25s',
    marginRight: '1rem',
    '&:hover': {
        backgroundColor: mix(0.75, lightBlue, 'white'),
        color: 'white',
        cursor: 'pointer',
    },

    [toMedia(screenXS)]: {
        fontSize: '1.0rem',
    }
});

const EventWebsiteButton: React.FC<EventWebsiteButtonProps> = ({ website }) => (
    <StyledWebsiteButton href={website} target="_blank" rel="noopener noreferrer">
        {`Tickets & Info`}
    </StyledWebsiteButton>
);

export {
    EventCollaborators,
    EventDate,
    EventLocation,
    EventName,
    EventProgram,
    EventTime,
    EventWebsiteButton
};

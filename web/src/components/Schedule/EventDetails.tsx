import startCase from 'lodash-es/startCase';
import mix from 'polished/lib/color/mix';
import * as React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { LocationIconInstance } from 'src/components/Schedule/LocationIconSVG';
import { Collaborator, EventType, Piece } from 'src/components/Schedule/types';
import { getGoogleMapsSearchUrl } from 'src/components/Schedule/utils';

import { lightBlue, logoBlue, magenta, textGrey } from 'src/styles/colors';
import { lato2 } from 'src/styles/fonts';

import { screenPortrait, screenXS } from 'src/screens';
import { toMedia } from 'src/mediaQuery';
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import parseISO from 'date-fns/parseISO';
import format from 'date-fns/format';
import { ClockIconInstance } from 'src/components/Schedule/ClockIconSVG';
import { utcToZonedTime } from 'date-fns-tz';

const locationIconDimension = '30px';

const Connector = styled.div({
    height: '1.2rem',
    width: '100%',
    background:
        `linear-gradient(
        to right,
        white 0%,
        white calc(50% - 0.82px),
        ${lightBlue} calc(50% - 0.82px),
        ${lightBlue} calc(50% + 0.82px),
        white calc(50% + 0.82px),
        white 100%
    );`
})

interface EventDateTimeProps {
    dateTime: string;
    endDate?: string;
    timezone: string;
    className?: string;
    isMobile: boolean;
}

let EventDate: React.FC<EventDateTimeProps> = (props) => {
    const date = parseISO(props.dateTime);
    const end = props.endDate ? parseISO(props.endDate) : undefined;
    return (
        <div className={props.className}>
            <div css={css({ fontSize: '2.0rem' })}>
                {`${format(date, 'M/d')}`}
            </div>
            <div css={css({ fontSize: '1.4em' })}>
                {format(date, 'EEE')}
            </div>
            {!!end && (
                <>
                    <Connector />
                    <div css={css({ fontSize: '2.0rem' })}>
                        {`${format(end, 'M/d')}`}
                    </div>
                    <div css={css({ fontSize: '1.4em' })}>
                        {format(end, 'EEE')}
                    </div>
                </>
            )}

        </div>
    );
};

EventDate = styled(EventDate)<EventDateTimeProps>(
    {
        textAlign: 'center',
        backgroundColor: 'white',
        color: lightBlue,
        height: 'fit-content',
        width: 'fit-content',
        padding: '1rem',
        flex: '0 0 auto',
        zIndex: 3,
        fontFamily: lato2,
        fontWeight: 'bold',
        position: 'absolute',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '0 0 8px 0',
    }
);

interface EventNameProps { name: string; eventType: EventType; className?: string; isMobile?: boolean; permaLink: string }

const eventNameStyle = css`
    font-size: 1.75rem;
    font-family: ${lato2};
    transition: fill 0.2s, color 0.2s;
    fill: transparent;
    color: ${logoBlue};
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 0.3rem;

    &:hover {
        cursor: pointer;
        filter: drop-shadow();
    }

    ${toMedia([screenXS, screenPortrait])} {
        fill: ${logoBlue};
    }
`;

const EventName: React.FC<EventNameProps> = ({ name, eventType }) => {
    return (
        <div css={eventNameStyle}>
            <span css={{ overflowWrap: 'break-word' }}>
                {`${name}${eventType === 'masterclass' ? ': Masterclass' : ''}`}
            </span>
        </div>
    );
};

let EventTime: React.FC<Omit<EventDateTimeProps, 'rounded'>> = ({ className, dateTime, timezone }) => (
    <div className={className}>
        <div css={{ margin: '0 3px', display: 'flex' }}>
            <ClockIconInstance width={24} height={24} stroke="black" strokeWidth={20} date={utcToZonedTime(dateTime, timezone)} />
        </div>
        <div css={{ marginLeft: '10px' }}>{formatInTimeZone(parseISO(dateTime), timezone, 'h:mm a z')}</div>
    </div>
);

EventTime = styled(EventTime)({
    margin: '0.3rem 0 0.3rem -6px',
    fontSize: '1rem',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
});

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

let EventLocation: React.FC<EventLocationProps> = ({ location, className, isMobile }) => {
    const locationIconStyle = css({
        height: locationIconDimension,
        width: locationIconDimension,
    });

    return (
        <a href={getGoogleMapsSearchUrl(location)} className={className} target="_blank" rel="noopener noreferrer">
            <LocationIconInstance css={locationIconStyle} />

            <strong
                css={{ marginLeft: isMobile ? 0 : 10 }}
            >
                {getVenueName(location)}
            </strong>
        </a>
    );
};

EventLocation = styled(EventLocation)`
    font-size: 1rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: fit-content;
    text-decoration: underline solid transparent;
    transition: text-decoration-color 0.2s;
    margin: 0.3rem 0 0.3rem -6px;

    &:hover {
        color: ${logoBlue};
        text-decoration-color: ${logoBlue};
    }
`;

interface EventCollaboratorsProps {
    collaborators: Collaborator[];
    className?: string;
}

let EventCollaborators: React.FC<EventCollaboratorsProps> = ({ className, collaborators }) => (
    <div className={className}>
        {collaborators.map((collaborator: Collaborator, i: number) => (
            collaborator.name && collaborator.instrument && (
                <div key={i}>
                    <span><strong>{collaborator.name}</strong></span>{' - '}
                    <span css={{ fontSize: '0.8rem' }}>{startCase(collaborator.instrument)}</span>
                </div>
            )
        ))}
    </div>
);

EventCollaborators = styled(EventCollaborators)`
    list-style: none;
    padding: 0;
    padding-left: 0.5rem;
    font-size: 1rem;
    font-family: ${lato2};
    margin: 0.5rem 0;
`;

interface EventProgramProps {
    program: Piece[];
    className?: string;
}

let EventProgram: React.FC<EventProgramProps> = ({ program, className }) => (
    <div className={className}>
        {program.map(({ composer, piece }: Piece, i: number) => (
            <div key={i}>
                {composer}{piece ? ' ' : ''}<i>{piece}</i>
            </div>
        ))}
    </div>
);

EventProgram = styled(EventProgram)`
    list-style: none;
    padding: 0;
    padding-left: 1.5rem;
    text-indent: -1rem;
    font-size: 1rem;
    font-family: ${lato2};
    margin: 0.5rem 0;
`;

interface EventWebsiteButtonProps {
    website: string;
    className?: string;
}

let EventWebsiteButton: React.FC<EventWebsiteButtonProps> = ({ website, className }) => (
    <a href={website} target="_blank" rel="noopener noreferrer" className={className}>
        {`Tickets & Info`}
    </a>
);

EventWebsiteButton = styled(EventWebsiteButton)`
    display: block;
    font-size: 1.2em;
    width: 150px;
    padding: 10px;
    text-align: center;
    border-radius: 4px;
    font-family: ${lato2};
    background-color: ${magenta};
    color: ${textGrey};
    transition: all 0.25s;
    margin: 0.6rem 0;

    &:hover {
        background-color: ${mix(0.75, magenta, '#FFF')};
        color: white;
        cursor: pointer;
    }
`;

export {
    EventCollaborators,
    EventDate,
    EventLocation,
    EventName,
    EventProgram,
    EventTime,
    EventWebsiteButton,
};

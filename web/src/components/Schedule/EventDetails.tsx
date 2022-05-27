import startCase from 'lodash-es/startCase';
import mix from 'polished/lib/color/mix';
import * as React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { LinkIconInstance } from 'src/components/Schedule/LinkIconSVG';
import { LocationIconInstance } from 'src/components/Schedule/LocationIconSVG';
import { Collaborator, EventType, Piece } from 'src/components/Schedule/types';
import { getGoogleMapsSearchUrl } from 'src/components/Schedule/utils';

import { lightBlue, logoBlue, magenta, textGrey } from 'src/styles/colors';
import { lato2 } from 'src/styles/fonts';

import { gsap } from 'gsap';
import { screenXSorPortrait } from 'src/styles/screens';
import { format, getDate, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const locationIconDimension = '30px';

interface EventDateTimeProps {
    dateTime: string;
    timezone: string;
    className?: string;
    isMobile: boolean;
    rounded: 'top' | 'bottom' | 'both';
}

let EventDate: React.FC<EventDateTimeProps> = (props) => {
    const date = parseISO(props.dateTime);
    return (
        <div className={props.className}>
            <div css={css({ fontSize: '2.2em' })}>
                {getDate(date)}
            </div>
            <div css={css({ fontSize: '1.4em' })}>
                {format(date, 'EEE')}
            </div>
        </div>
    );
};

const radii: {
    [key: string]: string;
} = {
    top: '50% 50% 0 0',
    bottom: '0 0 50% 50%',
    both: '50%',
};

EventDate = styled(EventDate)<EventDateTimeProps>`
    text-align: center;
    background-color: ${lightBlue};
    color: white;
    height: 6.7em;
    width: 6.7em;
    line-height: 2.5em;
    padding: 0.8em;
    flex: 0 0 auto;
    border-radius: ${props => radii[props.rounded]};
`;

interface EventNameProps { name: string; eventType: EventType; className?: string; isMobile?: boolean; permaLink: string }

const linkIconStyle = css`
    margin: 0 0.5em;
    width: 1em;
    height: 1em;
    display: inline-block;
    vertical-align: top;
`;

const eventNameStyle = css`
    font-size: 2em;
    font-family: ${lato2};
    transition: fill 0.2s, color 0.2s;
    fill: transparent;
    color: ${logoBlue};

    &:hover {
        cursor: pointer;
        fill: #999;
    }

    ${screenXSorPortrait} {
        fill: ${logoBlue};
    }
`;

const EventName: React.FC<EventNameProps> = (props) => {
    const copiedSpan = React.useRef<HTMLSpanElement>(null);

    const onCopy = () => {
        if (copiedSpan.current) {
            gsap.fromTo(copiedSpan.current, { autoAlpha: 1, duration: 0.2 }, { autoAlpha: 0, delay: 0.5 });
        }
    };

    return (
        <CopyToClipboard onCopy={onCopy} text={`${window.location.host}${props.permaLink}`}>
            <div css={eventNameStyle}>
                <span>{props.name}</span>
                {props.eventType === 'masterclass' && <span>{`: Masterclass`}</span>}
                <LinkIconInstance css={linkIconStyle} />
                <span
                    ref={copiedSpan}
                    css={css`
                            visibility: hidden;
                            font-size: 0.5em;
                        `}
                >
                    copied
                </span>
            </div>
        </CopyToClipboard>
    );
}

let EventTime: React.FC<Omit<EventDateTimeProps, 'rounded'>> = ({ className, dateTime, timezone }) => (
    <div className={className}>
        {formatInTimeZone(parseISO(dateTime), timezone, 'h:mm a z')}
    </div>
);

EventTime = styled(EventTime)` font-size: 1.5em; `;

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
                css={{ marginLeft: isMobile ? 0 : 10}}
            >
                {getVenueName(location)}
            </strong>
        </a>
    );
};

EventLocation = styled(EventLocation)`
    font-size: 1.2em;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: fit-content;
    text-decoration: underline solid transparent;
    transition: text-decoration-color 0.2s;

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
                    <span>{startCase(collaborator.instrument)}</span>
                </div>
            )
        ))}
    </div>
);

EventCollaborators = styled(EventCollaborators)`
    list-style: none;
    padding: 0;
    font-size: 1.2em;
    font-family: ${lato2};
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
    font-size: 1.2em;
    font-family: ${lato2};
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

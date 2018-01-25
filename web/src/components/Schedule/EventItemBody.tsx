import React from 'react';
import styled, { css } from 'react-emotion';

import {
    EventCollaborators,
    EventDate,
    EventLocation,
    EventName,
    EventProgram,
    EventTime,
    EventWebsiteButton,
} from 'src/components/Schedule/EventDetails';
import { DayItemShape } from 'src/components/Schedule/types';

import { lato1 } from 'src/styles/fonts';

const FlexEventDate = styled(EventDate)`flex: 0 0 100px`;

const FlexEventInfoContainer = styled('div')`
    flex: 1 1 auto;
    padding: 0 0 0 35px;
`;

type EventItemBody = DayItemShape & { className?: string };

const detailSectionMargin = (extra?: number) => css`margin-bottom: ${20 + (extra || 0)}px`;

let EventItemBody: React.SFC<EventItemBody> = (props) => (
    <div className={props.className}>
        <div><FlexEventDate dateTime={props.dateTime} /></div>

        <FlexEventInfoContainer>
            <EventName className={detailSectionMargin()} name={props.name} />

            <EventTime
                className={detailSectionMargin()}
                dateTime={props.dateTime}
            />

            <EventLocation location={props.location} className={detailSectionMargin()} />
            <EventCollaborators collaborators={props.collaborators} className={detailSectionMargin()} />
            <EventProgram program={props.program} className={detailSectionMargin(5)} />

            {props.website && <EventWebsiteButton website={props.website} />}
        </FlexEventInfoContainer>
    </div>
);

EventItemBody = styled(EventItemBody)`
    display: flex;
    padding: 30px 0 30px 30px;
    font-family: ${lato1};
    align-items: top;
    color: black;
    transition: 0.2s all;
    width: 80%;
    max-width: 1240px;
    margin: 0 auto;
`;

export { EventItemBody };

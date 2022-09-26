import * as React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import {
    EventCollaborators,
    EventDate,
    EventLocation,
    EventName,
    EventProgram,
    EventTime,
    EventWebsiteButton,
} from 'src/components/Schedule/EventDetails';
import { EventItem as EventItemType, EventListName } from 'src/components/Schedule/types';

import { lightBlue } from 'src/styles/colors';
import { lato2 } from 'src/styles/fonts';
import { screenXSorPortrait } from 'src/styles/screens';
import { cardShadow } from 'src/styles/mixins';
import { ShareIconInstance } from './ShareIconSVG';

const getGooglePlacePhoto = (photoReference: string, maxHeight: number) =>
    `https://maps.googleapis.com/maps/api/place/photo?maxheight=${maxHeight}&photo_reference=${photoReference}&key=${GAPI_KEY}`;

const Connector = styled.div`
    flex: 1 1 auto;
    min-height: 2rem;
    transform: scaleY(1.2);
    background:
        linear-gradient(
            to right,
            ${lightBlue} 0%,
            ${lightBlue} calc(50% - 0.81px),
            white calc(50% - 0.8px),
            white calc(50% + 0.8px),
            ${lightBlue} calc(50% + 0.81px),
            ${lightBlue} 100%
        );
`;

type EventItemProps = EventItemType & { className?: string; isMobile: boolean; permaLink: string; listType: EventListName };

const detailSectionMargin = (extra?: number) => css` margin-bottom: ${20 + (extra || 0)}px; `;

const ItemContainer = styled.div({
    margin: '2.4rem auto',
    width: '80vw',
    maxWidth: 600,
    overflow: 'hidden',
    boxShadow: cardShadow,
    borderRadius: 8,
    backgroundColor: 'white',
    display: 'flex',
    flexWrap: 'wrap',
    [screenXSorPortrait]: {
        flexDirection: 'column',
    }
});

const ImageContainer = styled.div(
    {
        flex: '0 0 300px',
        backgroundColor: lightBlue,
        [screenXSorPortrait]: {
            height: '50vw',
            flex: '0 0 50vw',
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
        }
    }
);

const Image = styled.img({
    objectFit: 'cover',
    [screenXSorPortrait]: {
        height: '100%',
        width: '100%',
        position: 'relative',
        left: 0,
    }
});

const DetailsContainer = styled.div({
    flex: 1,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: lato2,
    [screenXSorPortrait]: {
        width: 0,
        minWidth: '100%',
    }
});

const StyledShareIcon = styled(ShareIconInstance)({
    position: 'absolute',
    right: 0,
    zIndex: 5,
    fill: 'white',
    stroke: 'white',
    margin: '0.2rem',
});

const EventItem: React.FC<EventItemProps> = ({
    dateTime,
    endDate,
    allDay,
    isMobile,
    name,
    location,
    collaborators,
    type,
    pieces,
    website,
    permaLink,
    timezone,
    listType,
    imageUrl,
    photoReference,
    usePlacePhoto,
}) => {
    const firstDate = listType === 'archive' ? endDate : dateTime;
    const secondDate = listType === 'archive' ? dateTime : endDate;
    const DateChildren = (firstDate && secondDate) ? (
        <React.Fragment>
            <EventDate dateTime={firstDate} timezone={timezone} isMobile={isMobile} rounded={'top'} />
            <Connector />
            <EventDate dateTime={secondDate} timezone={timezone} isMobile={isMobile} rounded={'bottom'} />
        </React.Fragment>
    ) : <EventDate dateTime={dateTime} timezone={timezone} isMobile={isMobile} rounded={'both'} />;

    return (
        <ItemContainer>
            <ImageContainer>
                <Image src={((usePlacePhoto && !!photoReference) ? getGooglePlacePhoto(photoReference, 300) : imageUrl) ?? ''} />
                {DateChildren}
                <StyledShareIcon width={36} height={36} />
            </ImageContainer>

            <DetailsContainer>
                <EventName css={detailSectionMargin()} name={name} isMobile={isMobile} permaLink={permaLink} eventType={type} />

                {!allDay && (
                    <EventTime
                        dateTime={dateTime}
                        isMobile={isMobile}
                        timezone={timezone}
                    />
                )}

                <EventLocation location={location} isMobile={isMobile} />
                {collaborators.length !== 0 && <EventCollaborators collaborators={collaborators} />}
                {pieces.length !== 0 && <EventProgram program={pieces} />}

                {website && <EventWebsiteButton website={website} />}
            </DetailsContainer>
        </ItemContainer>
    );
};

export default EventItem;

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
import { screenXS } from 'src/screens';
import { toMedia } from 'src/mediaQuery';
import { cardShadow } from 'src/styles/mixins';
import { ShareIconInstance } from './ShareIconSVG';
import { arrow, offset, useFloating } from '@floating-ui/react-dom';
import { Transition } from 'react-transition-group';
import { fadeOnEnter, fadeOnExit } from 'src/utils';

const getGooglePlacePhoto = (photoReference: string, maxHeight: number) =>
    `https://maps.googleapis.com/maps/api/place/photo?maxheight=${maxHeight}&photo_reference=${photoReference}&key=${GAPI_KEY}`;

type EventItemProps = EventItemType & { className?: string; isMobile: boolean; permaLink: string; listType: EventListName };

const detailSectionMargin = (extra?: number) => css` margin-bottom: ${20 + (extra || 0)}px; `;

const ItemContainer = styled.div({
    margin: '2.4rem auto',
    width: '80vw',
    maxWidth: 720,
    overflow: 'hidden',
    boxShadow: cardShadow,
    borderRadius: 8,
    backgroundColor: 'white',
    display: 'flex',
    [toMedia(screenXS)]: {
        flexWrap: 'wrap',
        flexDirection: 'column',
    }
});

const ImageContainer = styled.div(
    {
        flex: '0 0 300px',
        backgroundColor: lightBlue,
        width: 300,
        overflow: 'hidden',
        position: 'relative',
        [toMedia(screenXS)]: {
            height: '50vw',
            flex: '0 0 50vw',
            width: '100%',
        }
    }
);

const Image = styled.img({
    objectFit: 'cover',
    height: '100%',
    width: '100%',
    position: 'relative',
    [toMedia(screenXS)]: {
        left: 0,
    }
});

const DetailsContainer = styled.div({
    flex: 1,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: lato2,
    [toMedia(screenXS)]: {
        width: 0,
        minWidth: '100%',
    }
});

const StyledShareIcon = styled(ShareIconInstance, {
    shouldForwardProp: () => true,
})({
    position: 'absolute',
    right: 0,
    fill: 'white',
    stroke: 'white',
    margin: '0.2rem',
    filter: 'drop-shadow(0 0 1px black)',
});

const CopiedTooltip = styled.div<{ x: number; y: number; strategy: 'absolute' | 'fixed' }>({
    width: 'max-content',
    height: 'min-content',
    boxShadow: cardShadow,
},
(props) => ({
    position: props.strategy,
    left: props.x,
    top: props.y,
}));

const CopiedDiv = styled.div({
    padding: '0.5rem',
    backgroundColor: 'white',
    fontFamily: lato2,
    position: 'relative',
    borderRadius: 4,
});

const Arrow = styled.div<{ y: number; }>({
    position: 'absolute',
    background: 'white',
    width: 8,
    height: 8,
    transform: 'rotate(45deg)',
    right: -4,
    boxShadow: cardShadow,
},
(props) => ({
    top: props.y,
}));

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
    const arrowRef = React.useRef<HTMLDivElement | null>(null);
    const [copiedIn, setCopiedIn] = React.useState(false);
    const { x, y, reference, floating, strategy, middlewareData } = useFloating({
        placement: 'left',
        middleware: [
            offset(4),
            arrow({ element: arrowRef })
        ],
    });

    const onCopy = React.useCallback(async (_ev: React.MouseEvent<SVGElement>) => {
        await window.navigator.clipboard.writeText(`${window.location.host}${permaLink}`);
        setCopiedIn(true);
        setTimeout(() => {
            setCopiedIn(false);
        }, 2000);
        // console.log('copied');
    }, [permaLink]);

    const DateChildren = <EventDate dateTime={dateTime} endDate={endDate} timezone={timezone} isMobile={isMobile} />;

    return (
        <ItemContainer>
            <ImageContainer>
                <Image src={((usePlacePhoto && !!photoReference) ? getGooglePlacePhoto(photoReference, 300) : imageUrl) ?? ''} />
                {DateChildren}
                <StyledShareIcon width={36} height={36} onClick={onCopy} ref={reference} />
                <Transition<undefined>
                    in={copiedIn}
                    onEnter={fadeOnEnter(0, 0.15)}
                    onExit={fadeOnExit(0, 0.15)}
                    timeout={250}
                    mountOnEnter={true}
                    unmountOnExit={true}
                >
                    <CopiedTooltip x={x ?? 0} y={y ?? 0} strategy={strategy} ref={floating}>
                        <Arrow y={middlewareData.arrow?.y ?? 0} ref={arrowRef} />
                        <CopiedDiv>Link Copied!</CopiedDiv>
                    </CopiedTooltip>
                </Transition>
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

import * as React from 'react';

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

const ItemContainer = styled.div({
    margin: '1.8rem auto',
    width: '80vw',
    maxWidth: 800,
    overflow: 'hidden',
    boxShadow: cardShadow,
    backgroundColor: 'transparent',
    display: 'flex',
});

const Left = styled.div({
    flex: '0 0 max(calc(50% - 200px), 100px)',
    display: 'flex',
    justifyContent: 'end',
    backgroundColor: lightBlue,
    overflow: 'hidden',
    position: 'relative',
});

const Overlay = styled.div({
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 4,
    backgroundColor: `#14141473`,
    backdropFilter: 'blur(1px)',
});

const Image = styled.img({
    objectFit: 'cover',
    height: '100%',
    width: '100%',
    position: 'absolute',
    zIndex: 3,
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
    position: 'relative',
    zIndex: 10,
    // backdropFilter: 'blur(2px) contrast(0.1) brightness(1.8)',
    backgroundColor: 'rgba(255 255 255 / 0.92)',
    height: '100%',
    [toMedia(screenXS)]: {
        padding: '1.0rem',
    },
});

const Right = styled.div({
    flex: 1,
    position: 'relative',
});

const StyledShareIcon = styled(ShareIconInstance, {
    shouldForwardProp: () => true,
})({
    position: 'absolute',
    right: 0,
    top: 0,
    fill: 'var(--light-blue)',
    stroke: 'var(--light-blue)',
    margin: '0.25rem',
    width: 32,
    height: 32,
    transition: 'opacity 250ms',
    // filter: 'drop-shadow(0 0 1px var(--light-blue))',
    '&:hover': {
        cursor: 'pointer',
        opacity: 0.6,
    },
    [toMedia(screenXS)]: {
        height: 24,
        width: 24,
    },
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
    // listType,
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
            <Left>
                {DateChildren}
                <Overlay />
                <Image src={((usePlacePhoto && !!photoReference) ? getGooglePlacePhoto(photoReference, 300) : imageUrl) ?? ''} />

            </Left>
            <Right>

            <DetailsContainer>

                <EventName name={name} isMobile={isMobile} permaLink={permaLink} eventType={type} />

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
                {/* <StyledShareIcon width={36} height={36} onClick={onCopy} ref={reference} /> */}
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
            </DetailsContainer>
            </Right>
        </ItemContainer>
    );
};

export default EventItem;

import styled from '@emotion/styled';
import { arrow, offset, useFloating } from '@floating-ui/react-dom';
import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { startCase } from 'lodash-es';
import * as React from 'react';
import { Transition } from 'react-transition-group';

import {
    EventCollaborators,
    EventDate,
    EventLocation,
    EventName,
    EventProgram,
    EventTime,
    EventWebsiteButton,
} from 'src/components/Schedule/EventDetails';
import { staticImage } from 'src/imageUrls.js';
import { toMedia } from 'src/mediaQuery.js';
import { screenXS } from 'src/screens.js';
import { lightBlue } from 'src/styles/colors.js';
import { latoFont } from 'src/styles/fonts.js';
import { cardShadow } from 'src/styles/mixins.js';
import { fadeOnEnter, fadeOnExit, titleStringBase } from 'src/utils.js';
import { ShareIconInstance } from './ShareIconSVG.jsx';
import type { EventItem as EventItemType, EventListName, EventType } from './types.js';

const eventPictureFallbackMap: Record<EventType, string> = {
    concerto: staticImage('/gallery/thumbnails/cip_5.jpg'),
    solo: staticImage('/gallery/thumbnails/cliburn1.jpg'),
    chamber: staticImage('/gallery/thumbnails/chamber1.jpg'),
    masterclass: staticImage('/gallery/thumbnails/masterclass1.jpg'),
    adjudication: staticImage('/gallery/thumbnails/score1.jpg'),
};

type EventItemProps = EventItemType & {
    className?: string;
    isMobile: boolean;
    permaLink: string;
    listType: EventListName;
};

const ItemContainer = styled.div({
    margin: '4rem auto',
    width: '80vw',
    maxWidth: 800,
    backgroundColor: 'transparent',
    display: 'flex',
    '&:first-of-type': {
        marginTop: '2rem',
    },
    '&:last-of-type': {
        marginBottom: '2rem',
    },
    [toMedia(screenXS)]: {
        width: '90vw',
        margin: '1.75rem auto',
        '&:first-of-type': {
            marginTop: '0.85rem',
        },
        '&:last-of-type': {
            marginBottom: '0.85rem',
        },
    },
});

const Left = styled.div({
    flex: '0 0 max(calc(50% - 180px), 80px)',
    display: 'flex',
    justifyContent: 'end',
    backgroundColor: lightBlue,
    position: 'relative',
    borderRadius: '0.2rem',
    boxShadow: '0px 3px 5px -2px rgba(0 0 0 / 0.5)',
    overflow: 'hidden',
});

const Image = styled.img({
    objectFit: 'cover',
    height: '100%',
    width: '100%',
    position: 'absolute',
    zIndex: 2,
    [toMedia(screenXS)]: {
        left: 0,
    },
});

const Right = styled.div(latoFont(300), {
    flex: 1,
    padding: '1.5rem 0 1.5rem 3rem',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 0,
    height: '100%',
    [toMedia(screenXS)]: {
        padding: '1.0rem',
    },
});

const DetailsContainer = styled.div({
    borderLeft: '3px solid var(--light-blue)',
    paddingLeft: '0.5rem',
    marginLeft: '0.2rem',
});

const StyledShareIcon = styled(ShareIconInstance, {
    shouldForwardProp: () => true,
})({
    position: 'relative',
    fill: 'var(--light-blue)',
    stroke: 'var(--light-blue)',
    width: 28,
    height: 28,
    transition: 'opacity 250ms',
    '&:hover': {
        cursor: 'pointer',
        opacity: 0.6,
    },
    [toMedia(screenXS)]: {
        height: 22,
        width: 22,
    },
});

const CopiedTooltip = styled.div<{
    x: number;
    y: number;
    strategy: 'absolute' | 'fixed';
}>(
    {
        width: 'max-content',
        height: 'min-content',
        boxShadow: cardShadow,
    },
    (props) => ({
        position: props.strategy,
        left: props.x,
        top: props.y,
    }),
);

const CopiedDiv = styled.div(latoFont(200), {
    padding: '0.5rem',
    backgroundColor: 'white',
    position: 'relative',
});

const Arrow = styled.div<{ y: number }>(
    {
        position: 'absolute',
        background: 'white',
        width: 8,
        height: 8,
        transform: 'rotate(45deg)',
        left: -4,
        boxShadow: cardShadow,
    },
    (props) => ({
        top: props.y,
    }),
);

const Links = styled.div({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '0.6rem',
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
    imageUrl,
}) => {
    const arrowRef = React.useRef<HTMLDivElement | null>(null);
    const [shared, setShared] = React.useState<
        'shared' | 'copied' | undefined
    >();
    const {
        x,
        y,
        refs: { reference, floating },
        strategy,
        middlewareData,
    } = useFloating<SVGSVGElement>({
        placement: 'right',
        middleware: [offset(4), arrow({ element: arrowRef })],
    });

    const onClick = React.useCallback(
        async (ev: React.MouseEvent<HTMLButtonElement>) => {
            ev.preventDefault();
            const shareData: ShareData = {
                title: `${titleStringBase}Event | ${formatInTimeZone(
                    parseISO(dateTime),
                    timezone,
                    'EEE, MMMM dd, yyyy, h:mmaaa z',
                )}`,
                text: name,
                url: window.location.host + permaLink,
            };
            console.log(navigator);
            try {
                if (window.navigator.canShare(shareData)) {
                    await window.navigator.share(shareData);
                    setShared('shared');
                    setTimeout(() => {
                        setShared(undefined);
                    }, 2000);
                }
            } catch (e) {
                await window.navigator.clipboard.writeText(
                    `${window.location.protocol}//${window.location.host}${permaLink}`,
                );
                setShared('copied');
                setTimeout(() => {
                    setShared(undefined);
                }, 2000);
            }
        },
        [permaLink],
    );

    const src = imageUrl || eventPictureFallbackMap[type];

    const DateChildren = (
        <EventDate
            dateTime={dateTime}
            endDate={endDate}
            timezone={timezone}
            isMobile={isMobile}
        />
    );

    return (
        <ItemContainer>
            <Left>
                {DateChildren}
                <Image src={src} />
            </Left>
            <Right>
                <EventName
                    name={name}
                    isMobile={isMobile}
                    permaLink={permaLink}
                    eventType={type}
                />
                <DetailsContainer>
                    {!allDay && (
                        <EventTime
                            dateTime={dateTime}
                            isMobile={isMobile}
                            timezone={timezone}
                        />
                    )}

                    <EventLocation location={location} isMobile={isMobile} />
                    {collaborators.length !== 0 && (
                        <EventCollaborators collaborators={collaborators} />
                    )}
                    {pieces.length !== 0 && <EventProgram program={pieces} />}
                </DetailsContainer>

                <Links>
                    {website && <EventWebsiteButton website={website} />}
                    <button
                        type="button"
                        onClick={onClick}
                        css={{ all: 'unset' }}
                    >
                        <StyledShareIcon
                            width={36}
                            height={36}
                            ref={reference}
                        />
                    </button>
                    <Transition<undefined>
                        in={!!shared}
                        onEnter={fadeOnEnter(0, 0.15)}
                        onExit={fadeOnExit(0, 0.15)}
                        timeout={250}
                        mountOnEnter={true}
                        unmountOnExit={true}
                    >
                        <CopiedTooltip
                            x={x ?? 0}
                            y={y ?? 0}
                            strategy={strategy}
                            ref={
                                floating as React.MutableRefObject<HTMLDivElement>
                            }
                        >
                            <Arrow
                                y={middlewareData.arrow?.y ?? 0}
                                ref={arrowRef}
                            />
                            <CopiedDiv>Link {startCase(shared)}!</CopiedDiv>
                        </CopiedTooltip>
                    </Transition>
                </Links>
            </Right>
        </ItemContainer>
    );
};

export default EventItem;

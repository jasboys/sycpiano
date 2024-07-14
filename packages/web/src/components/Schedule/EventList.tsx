import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { parseISO, startOfDay } from 'date-fns';
import { Back, gsap } from 'gsap';
import debounce from 'lodash-es/debounce';
import startCase from 'lodash-es/startCase';
import { createCachedSelector } from 're-reselect';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Transition } from 'react-transition-group';

import { mqSelectors } from 'src/components/App/reducers';
import { LoadingInstance } from 'src/components/LoadingSVG.jsx';
import { MonthEvents } from 'src/components/Schedule/EventMonth.jsx';
import { fetchEvents, searchEvents } from 'src/components/Schedule/reducers';
import type {
    EventListName,
    FetchEventsArguments
} from 'src/components/Schedule/types';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { toMedia } from 'src/mediaQuery';
import { screenPortrait, screenXS, screenXSandPortrait } from 'src/screens';
import type { GlobalStateShape } from 'src/store';
import { lightBlue, logoBlue } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { metaDescriptions, titleStringBase } from 'src/utils';

interface EventListProps {
    readonly type: EventListName;
}

interface OnScrollProps {
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
}

const LoadingDiv = styled.div({
    position: 'absolute',
    bottom: 0,
    transform: 'translateY(200px)',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 20,
});

const SpinnerContainer = styled.div({
    margin: '0.7rem',
    display: 'flex',
    padding: '0.5rem',
    borderRadius: '50%',
    backgroundColor: 'rgba(255 255 255 / 0.6)',
    backdropFilter: 'blur(3px)',
    boxShadow: '0px 3px 5px -2px rgba(0 0 0 / 0.5)',
    svg: {
        fill: 'none',
        stroke: lightBlue,
    },
});

const loadingStyle = css({
    margin: '0.5rem',
});

const EndOfList = styled.div(latoFont(200), {
    margin: '2.4rem auto',
    width: '80vw',
    maxWidth: 720,
    overflow: 'hidden',
    display: 'flex',
    flexWrap: 'wrap',
    padding: '1.5rem',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    color: logoBlue,
    [toMedia([screenXS, screenPortrait])]: {
        flexDirection: 'column',
    },
});

const fetchDateParam = (type: string) =>
    type === 'upcoming' ? 'after' : 'before';

const scheduleListSelector = createCachedSelector(
    (state: GlobalStateShape) => state.scheduleEventItems,
    (_: GlobalStateShape, type: EventListName) => type,
    (state, type) => ({
        eventItems: state[type].items,
        eventItemsLength: state[type].items.length,
        minDate: state[type].minDate,
        maxDate: state[type].maxDate,
        hasMore: state[type].hasMore,
        isFetchingList: state[type].isFetchingList,
        lastQuery: state[type].lastQuery,
    }),
)((_, type) => type);

const ScrollingContainer = styled.div<{ isSearch: boolean }>((props) => ({
    width: '100%',
    height: '100%',
    overflowY: 'scroll',
    overflowX: 'hidden',
    marginTop: 0,
    [toMedia(screenXSandPortrait)]: {
        paddingTop: 0,
        marginTop: props.isSearch ? 'calc(80px + 1.2rem)' : 'calc(50px + 2rem)',
        height: props.isSearch
            ? 'calc(100% - (80px + 1.2rem))'
            : 'calc(100% - (50px + 1.2rem))',
    },
}));

const loadingOnEnter = (el: HTMLElement) => {
    gsap.fromTo(
        el,
        { y: 200 },
        { duration: 0.5, y: 0, ease: Back.easeOut.config(1) },
    );
};

const loadingOnExit = (el: HTMLElement) => {
    gsap.fromTo(
        el,
        { y: 0 },
        {
            duration: 0.5,
            y: 200,
            ease: Back.easeIn.config(1),
            clearProps: 'translate,rotate,scale,transform',
        },
    );
};

export const EventList: React.FC<EventListProps> = (props) => {
    const {
        eventItems,
        minDate,
        maxDate,
        hasMore,
        isFetchingList,
        eventItemsLength,
        lastQuery,
    } = useAppSelector((state) => scheduleListSelector(state, props.type));
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const routeParams = useParams();
    const { '*': date } = routeParams;
    const [params, _setParams] = useSearchParams();
    const isHamburger = useAppSelector(mqSelectors.isHamburger);

    const searchQ = params.get('q');

    const onMountOrUpdate = React.useCallback(() => {
        if (searchQ !== null) {
            if (searchQ === '') {
                navigate('/schedule/upcoming');
                return;
            }
            // run search fetch
            dispatch(
                searchEvents({
                    name: 'search',
                    q: searchQ,
                }),
            );
        } else if (props.type === 'event') {
            console.log(date);
            if (!date) {
                navigate('/schedule/upcoming');
                return;
            }
            console.log('single event');
            // get single event
            const fetchParams: FetchEventsArguments = {
                name: 'event',
                at: parseISO(date),
            };
            dispatch(fetchEvents(fetchParams));
            return;
        } else if (eventItemsLength === 0) {
            const fetchParams: FetchEventsArguments = {
                name: props.type,
                [fetchDateParam(props.type)]: startOfDay(new Date()),
            };
            dispatch(fetchEvents(fetchParams));
            return;
        }
    }, [searchQ, date, props.type, eventItemsLength]);

    React.useEffect(() => {
        onMountOrUpdate();
    }, [props.type, searchQ]);

    const getScrollFetchParams: {
        [key: string]: () => FetchEventsArguments;
    } = {
        upcoming: () => ({
            name: props.type,
            after: maxDate ? parseISO(maxDate) : undefined,
        }),
        archive: () => ({
            name: props.type,
            before: minDate ? parseISO(minDate) : undefined,
        }),
    };

    const onScroll = React.useCallback(
        ({ clientHeight, scrollTop, scrollHeight }: OnScrollProps) => {
            if (
                scrollTop + clientHeight > scrollHeight - 600 &&
                hasMore &&
                !isFetchingList &&
                !!maxDate &&
                !!minDate
            ) {
                if (props.type !== 'search' && props.type !== 'event') {
                    dispatch(fetchEvents(getScrollFetchParams[props.type]()));
                }
            }
        },
        [hasMore, isFetchingList, maxDate, minDate, props.type],
    );

    const debouncedFetch = React.useMemo(
        () => debounce(onScroll, 100, { leading: true }),
        [props.type, hasMore, isFetchingList, maxDate, minDate],
    );

    const title =
        `${titleStringBase}Schedule | ${(props.type === 'archive' ? 'Archived' : startCase(props.type))}Events${(searchQ ?? `: ${searchQ}`)}`;

    const description = metaDescriptions[props.type] as string;

    const loadingDimension = isHamburger ? 50 : 72;

    return (
        <React.Fragment>
            <Helmet
                title={title}
                meta={[
                    {
                        name: 'description',
                        content: description,
                    },
                ]}
            />
            <ScrollingContainer
                isSearch={props.type === 'search'}
                onScroll={(ev) => {
                    ev.persist();
                    const { scrollTop, scrollHeight, clientHeight } =
                        ev.currentTarget;
                    debouncedFetch({ scrollTop, scrollHeight, clientHeight });
                }}
            >
                {eventItemsLength ? (
                    eventItems.monthGroups.map((monthGroup, idx) => (
                        <MonthEvents
                            key={monthGroup.dateTime}
                            type={props.type}
                            idx={idx}
                            monthGroup={monthGroup}
                            isHamburger={isHamburger}
                            lastQuery={lastQuery}
                        />
                    ))
                ) : (
                    <div />
                )}
                {props.type !== 'event' && (
                    <EndOfList>
                        {eventItemsLength === 0
                            ? 'No events fetched'
                            : hasMore
                            ? ''
                            : 'No more events'}
                    </EndOfList>
                )}
            </ScrollingContainer>
            <Transition<undefined>
                in={isFetchingList}
                timeout={300}
                onEnter={loadingOnEnter}
                onExit={loadingOnExit}
            >
                <LoadingDiv>
                    <SpinnerContainer>
                        <LoadingInstance
                            css={loadingStyle}
                            width={loadingDimension}
                            height={loadingDimension}
                        />
                    </SpinnerContainer>
                </LoadingDiv>
            </Transition>
        </React.Fragment>
    );
};

export default EventList;

import startCase from 'lodash-es/startCase';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import { createCachedSelector } from 're-reselect';

import styled from '@emotion/styled';

import debounce from 'lodash-es/debounce';

import { LoadingInstance } from 'src/components/LoadingSVG';
import { fetchEvents, searchEvents, selectEvent } from 'src/components/Schedule/reducers';
import EventItem from 'src/components/Schedule/EventItem';
import {
    EventListName,
    FetchEventsArguments,
    EventItem as EventItemType,
    MonthGroups,
    findDateInMonthGroups,
} from 'src/components/Schedule/types';
import { lightBlue, logoBlue } from 'src/styles/colors';
import { lato2 } from 'src/styles/fonts';
import { screenPortrait, screenXS, screenXSandPortrait } from 'src/screens';
import { toMedia } from 'src/mediaQuery';
import { GlobalStateShape } from 'src/store';
import { metaDescriptions, titleStringBase } from 'src/utils';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import parseISO from 'date-fns/parseISO';
import parseDate from 'date-fns/parse';
import startOfDay from 'date-fns/startOfDay';
import isBefore from 'date-fns/isBefore';
import format from 'date-fns-tz/format';
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import { useSearchParams } from 'react-router-dom';
import { cardShadow } from 'src/styles/mixins';
import { Transition } from 'react-transition-group';
import { gsap } from 'gsap';
import { MediaContext } from '../App/App';

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
});

const SpinnerContainer = styled.div({
    // borderRadius: '50%',
    // backgroundColor: 'rgba(255 255 255 / 0.7)',
    // backdropFilter: 'blur(5px)',
    margin: '0.7rem',
    // boxShadow: '0 0 4px rgba(0 0 0 / 0.3)',
    display: 'flex',
});

const StyledLoadingInstance = styled(LoadingInstance)({
    fill: 'none',
    stroke: lightBlue,
    margin: '0.5rem',
});

const EndOfList = styled.div({
    margin: '2.4rem auto',
    width: '80vw',
    maxWidth: 720,
    overflow: 'hidden',
    // boxShadow: cardShadow,
    // borderRadius: 8,
    // backgroundColor: 'rgba(255 255 255 / 0.5)',
    // backdropFilter: 'blur(2px)',
    display: 'flex',
    flexWrap: 'wrap',
    fontFamily: lato2,
    padding: '1.5rem',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    color: logoBlue,
    [toMedia([screenXS, screenPortrait])]: {
        flexDirection: 'column',
    }
});

const fetchDateParam = (type: string) => type === 'upcoming' ? 'after' : 'before';

const scheduleListSelector = createCachedSelector(
    (state: GlobalStateShape) => state.scheduleEventItems,
    (_: GlobalStateShape, type: EventListName) => type,
    (state, type) => ({
        eventItems: state[type].items,
        eventItemsLength: state[type].items.length,
        currentItem: state[type].currentItem,
        minDate: state[type].minDate,
        maxDate: state[type].maxDate,
        hasMore: state[type].hasMore,
        isFetchingList: state[type].isFetchingList,
        lastQuery: state[type].lastQuery,
    }),
)(
    (_, type) => type
);

const ScrollingContainer = styled.div<{ isSearch: boolean; }>((props) => ({
        width: '100%',
        height: '100%',
        overflowY: 'scroll',
        marginTop: 0,
        [toMedia(screenXSandPortrait)]: {
            paddingTop: 0,
            marginTop: props.isSearch ? 112 : 82,
            height: 'calc(100% - 82px)'
        }
    })
);

const Events = styled.div({
    overflowY: 'auto',
});

const MonthGroup = styled.div({
    marginBottom: 4,
    width: '100vw',
})

const MonthBar = styled.div<{ isMobile: boolean }>(({ isMobile }) => ({
    fontSize: 'min(10vw, 2.0rem)',
    position: 'sticky',
    top: 0,
    zIndex: 11,
    width: '80vw',
    maxWidth: isMobile ? '88vw' : '960px',
    margin: isMobile ? 'auto' : '0 auto',
    display: 'flex',
    fontFamily: lato2,
    backgroundColor: 'rgb(238 238 238)',
    color: logoBlue,
    borderBottom: `1px var(--logo-blue) solid`,
}));

const MonthText = styled.div<{ isMobile: boolean }>(({}) => ({
    flex: '0 0 calc(50% - 200px)',
    whiteSpace: 'nowrap',
    textAlign: 'right',
    padding: '2rem 0.5rem 0.8rem 0',
}));

const YearText = styled.div<{ isMobile: boolean }>(({}) => ({
    flex: 1,
    padding: '2rem 0 0.8rem 0.5rem',
}));

const loadingOnEnter = (el: HTMLElement) => {
    gsap.fromTo(el, { y: 200 }, { duration: 0.25, y: 0, ease: "back.out(1)" });
};

const loadingOnExit = (el: HTMLElement) => {
    gsap.fromTo(el, { y: 0 }, { duration: 0.25, y: 200, ease: "back.in(1)" });
}

interface PrevProps {
    currentItem?: EventItemType;
    type?: EventListName;
}

export const EventList: React.FC<EventListProps> = (props) => {
    const updatedCurrent = React.useRef(true);
    const _eventItems = React.useRef<MonthGroups>();
    const prevProps = React.useRef<PrevProps>({ currentItem: undefined, type: undefined });
    const {
        eventItems,
        currentItem,
        minDate,
        maxDate,
        hasMore,
        isFetchingList,
        eventItemsLength,
        lastQuery,
    } = useAppSelector((state) => scheduleListSelector(state, props.type));
    const navigate = useNavigate();
    const { date: dateParam } = useParams();
    const dispatch = useAppDispatch();
    const [params, _setParams] = useSearchParams();
    const { isHamburger } = React.useContext(MediaContext);

    const searchQ = params.get('q');

    const [firstEffectRan, setFirstEffectRan] = React.useState(false);

    const onMountOrUpdate = React.useCallback(() => {
        const date = dateParam === undefined ? undefined : startOfDay(parseDate(dateParam, 'yyyy-MM-dd', new Date()));
        if (searchQ !== null) {
            if (searchQ === '') {
                navigate('/schedule/upcoming');
            }
            // run search fetch
            dispatch(searchEvents({
                name: 'search',
                q: searchQ
            }));
        } else {
            // Empty List
            if (eventItemsLength === 0) {
                let fetchParams: FetchEventsArguments;
                if (date) {
                    fetchParams = {
                        name: props.type,
                        date: date,
                        scrollTo: true,
                    };
                } else {
                    fetchParams = {
                        name: props.type,
                        [fetchDateParam(props.type)]: startOfDay(new Date()),
                        scrollTo: false,
                    };
                }
                dispatch(fetchEvents(fetchParams));
                return;
            } else if (
                date &&
                findDateInMonthGroups(eventItems, date) !== undefined
            ) {
                const fetchParams: FetchEventsArguments = {
                    name: props.type,
                    date: date,
                    scrollTo: true,
                };
                dispatch(fetchEvents(fetchParams));
                return;
            }
        }
    }, [dateParam, searchQ, props.type, eventItemsLength]);

    React.useEffect(() => {
        const strDate = dateParam;
        const date = dateParam === undefined ? undefined : startOfDay(parseDate(dateParam, 'yyyy-MM-dd', new Date()));
        if (date) {
            if (isBefore(date, new Date()) && props.type === 'upcoming') {
                navigate(`archive/${strDate}`);
                return;
            } else if (!isBefore(date, new Date()) && props.type === 'archive') {
                navigate(`upcoming/${strDate}`);
                return;
            }
        }

        onMountOrUpdate();
        prevProps.current = {
            currentItem,
            type: props.type
        };
        setFirstEffectRan(true);
    }, []);

    React.useEffect(() => {
        _eventItems.current = eventItems;
    }, [eventItems])

    React.useEffect(() => {
        if (firstEffectRan) {
            onMountOrUpdate();
        }
    }, [currentItem, props.type, searchQ]);

    React.useEffect(() => {
        if (firstEffectRan) {
            updatedCurrent.current = true;
        }
    }, [currentItem]);

    React.useEffect(() => {
        if (firstEffectRan) {
            currentItem && selectEvent({ name: props.type, event: undefined });
        }
    }, [props.type, currentItem]);

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

    const onScroll = ({ clientHeight, scrollTop, scrollHeight }: OnScrollProps) => {
        if (scrollTop + clientHeight > scrollHeight - 600 &&
            hasMore &&
            !isFetchingList &&
            !!maxDate &&
            !!minDate
        ) {
            if (props.type !== 'search') {
                dispatch(fetchEvents(getScrollFetchParams[props.type]()));
            }
        }
    };

    const debouncedFetch = React.useMemo(
        () => debounce(onScroll, 100, { leading: true })
        , [props.type, hasMore, isFetchingList, maxDate, minDate]);

    // const getScrollTarget = React.useCallback(() => {
    //     if (updatedCurrent.current && eventItemsLength) {
    //         if (currentItem) {
    //             updatedCurrent.current = false;
    //             return getScrollIndex(currentItem);
    //         } else {
    //             updatedCurrent.current = false;
    //             return 0;
    //         }
    //     } else {
    //         return -1;
    //     }
    // }, [currentItem, eventItemsLength]);

    // const getScrollIndex = React.useCallback((currentItem: DayItem) => (
    //     Math.max(0, eventItems.findIndex(
    //         (item) => (
    //             item && itemIsDay(item) &&
    //             isSameDay(parseISO(item.dateTime), parseISO(currentItem.dateTime))
    //         ),
    //     ))
    // ), [eventItems]);

    const item = (eventItemsLength && dateParam !== undefined) ?
        findDateInMonthGroups(eventItems, (parseDate(dateParam, 'yyy-MM-dd', new Date())))
        : undefined;

    const title = `${titleStringBase} | Schedule` + (item
        ? ` | ${formatInTimeZone(parseISO(item.dateTime), item.timezone, 'EEEE MMMM dd, yyyy, HH:mm zzz')}`
        : ` | ${props.type === 'archive' ? 'Archived' : startCase(props.type)} Events${searchQ ? ': ' + searchQ : ''
        }`);

    const description = item
        ? `${startCase(props.type)} ${startCase(item.type)}: ${item.name}`
        : metaDescriptions[props.type];

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
                    const {
                        scrollTop,
                        scrollHeight,
                        clientHeight
                    } = ev.currentTarget;
                    debouncedFetch({ scrollTop, scrollHeight, clientHeight });
                }}
            >
                {/* <div
                    css={{
                        position: 'absolute',
                        top: 0,
                        backgroundColor: 'rgb(238 238 238)',
                        width: '100%',
                        maxWidth: 800,
                        height: 40,
                        margin: 'auto',
                        left: 0,
                        right: 0,
                        zIndex: 5
                    }}
                /> */}
                {eventItemsLength ?
                    eventItems.monthGroups.map((monthGroup, idx) =>
                        <MonthGroup key={`${props.type}-${lastQuery!}-${idx}-month`}>
                            <MonthBar isMobile={isHamburger}>
                                <MonthText isMobile={isHamburger}>
                                    {format(parseISO(monthGroup.dateTime), 'MMMM')}
                                </MonthText>
                                <YearText isMobile={isHamburger}>
                                    {format(parseISO(monthGroup.dateTime), 'yyyy')}
                                </YearText>
                            </MonthBar>
                            <Events>
                                {
                                    monthGroup.events.map((event, idx) => {
                                        const permaLink = `/schedule/${format(parseISO(event.dateTime), 'yyyy-MM-dd')}`;
                                        return (
                                            <EventItem
                                                key={`${props.type}-${lastQuery!}-${idx}-event`}
                                                listType={props.type}
                                                isMobile={isHamburger}
                                                permaLink={permaLink}
                                                {...event}
                                            />
                                        );
                                    })
                                }
                            </Events>
                        </MonthGroup>
                    )
                    : <div />
                }
                {
                    <EndOfList>
                        {eventItemsLength === 0 ?
                            'No events fetched'
                            : (hasMore ?
                                ''
                                : 'No more events')}
                    </EndOfList>
                }
            </ScrollingContainer>
            <Transition<undefined>
                in={isFetchingList}
                timeout={300}
                onEnter={loadingOnEnter}
                onExit={loadingOnExit}
            >
                <LoadingDiv>
                    <SpinnerContainer>
                        <StyledLoadingInstance width={72} height={72} />
                    </SpinnerContainer>
                </LoadingDiv>
            </Transition>
        </React.Fragment>
    );
};

export default EventList;
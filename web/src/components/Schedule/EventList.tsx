import startCase from 'lodash-es/startCase';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import { createCachedSelector } from 're-reselect';

import { css } from '@emotion/react';
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
import { lato2, lato3 } from 'src/styles/fonts';
import { screenXSorPortrait } from 'src/styles/screens';
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

interface EventListProps {
    readonly type: EventListName;
    readonly isMobile: boolean;
}

interface OnScrollProps {
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
}

const StyledLoadingInstance = styled(LoadingInstance)`
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px;
    fill: none;
    stroke: ${lightBlue};
`;

const placeholderStyle = css`
    width: 80%;
    height: 100%;
    min-height: 6.5rem;
    max-width: 1240px;
    margin: 0 auto;
    font-family: ${lato2};
    font-size: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;

    ${screenXSorPortrait} {
        width: 90%;
        font-size: 1.5rem;
    }
`;

const firstElementStyle = (isSearch: boolean) => css`
    ${placeholderStyle}
    padding-top: 85px;
    justify-content: unset;
    padding-left: 28px;
    min-height: 4.5rem;
    z-index: 6;
    background-color: white;
    ${isSearch ? 'position: sticky; top: 0;' : ''}
`;

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

const ScrollingContainer = styled.div<{ isMobile: boolean }>(
    {
        width: '100%',
        height: '100%',
        overflowY: 'scroll',
        maskImage: 'linear-gradient(0deg, transparent 20%, black 50%)'
    },
    (props) => ({
        maskImage: props.isMobile ? 'linear-gradient(to bottom, transparent 82px, black 83px)' : 'unset',
        paddingTop: props.isMobile ? 82 : '2rem',
    })
);

const Events = styled.div({
    overflowY: 'auto',
});

const MonthGroup = styled.div({
    marginBottom: 4,
})

const MonthBar = styled.div<{ isMobile: boolean }>(({ isMobile }) => ({
    color: lightBlue,
    fontFamily: lato2,
    fontWeight: 'bold',
    fontSize: '2.5rem',
    padding: '0 1rem',
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    zIndex: 5,
    width: '100%',
    maxWidth: isMobile ? '88vw' : '800px',
    margin: isMobile ? 'auto' : '0.1rem auto',
    boxShadow: cardShadow,
}));

const MonthText = styled.div<{ isMobile: boolean }>(({ isMobile }) => ({
    width: 'min-content',
    // background: `linear-gradient(white 88%, rgba(255, 255, 255, 0) 88%)`,
    padding: '1rem 0.5rem 0.5rem',
    whiteSpace: 'nowrap',
}));

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
                        [fetchDateParam(props.type)]: new Date(),
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
                isMobile={props.isMobile}
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
                    {eventItemsLength ?
                        eventItems.monthGroups.map((monthGroup, idx) =>
                            <MonthGroup key={`${props.type}-${lastQuery!}-${idx}-month`}>
                                <MonthBar isMobile={props.isMobile}>
                                    <MonthText isMobile={props.isMobile}>
                                        {format(parseISO(monthGroup.dateTime), 'MMMM yyyy')}
                                    </MonthText>
                                </MonthBar>
                                <Events>
                                {
                                    monthGroup.events.map((event, idx) => {
                                        const permaLink = `/schedule/${format(parseISO(event.dateTime), 'yyyy-MM-dd')}`;
                                        return (
                                            <EventItem
                                                key={`${props.type}-${lastQuery!}-${idx}-event`}
                                                listType={props.type}
                                                isMobile={props.isMobile}
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
                    {isFetchingList ?
                        <StyledLoadingInstance width={80} height={80} />
                        : (
                            <div css={placeholderStyle}>
                                {eventItemsLength === 0 ? 'No Events Fetched' : ''}
                            </div>
                        )
                    }
            </ScrollingContainer>
        </React.Fragment>
    );
};

export default EventList;
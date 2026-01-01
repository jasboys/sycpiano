import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { parseISO } from 'date-fns';
import { Back, gsap } from 'gsap';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import debounce from 'lodash-es/debounce';
import startCase from 'lodash-es/startCase';
import { transparentize } from 'polished';
import type { JSX } from 'react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Transition } from 'react-transition-group';
import { LoadingInstance } from 'src/components/LoadingSVG.jsx';
import { MonthEvents } from 'src/components/Schedule/EventMonth.jsx';
import {
    scheduleActions,
    scheduleAtoms,
} from 'src/components/Schedule/store.js';
import { toMedia } from 'src/mediaQuery';
import { screenPortrait, screenXS, screenXSandPortrait } from 'src/screens';
import { lightBlue, logoBlue } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { metaDescriptions, titleStringBase } from 'src/utils';
import { mediaQueriesAtoms } from '../App/store.js';
import {
    FETCH_LIMIT,
    fetchEvents,
    getInitFetchParams,
    getScrollFetchParams,
} from './queryFunctions.js';
import type {
    EventItem,
    EventListName,
    FetchEventsArguments,
} from './types.js';

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
    backgroundColor: transparentize(0.2, lightBlue),
    backdropFilter: 'blur(3px)',
    boxShadow: '0px 3px 5px -2px rgba(0 0 0 / 0.5)',
    svg: {
        fill: 'none',
        stroke: 'white',
        image: {
            filter: 'saturate(0) brightness(200%)',
        },
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

const loadingOnEnter = (el: React.RefObject<HTMLDivElement | null>) => () => {
    gsap.fromTo(
        el.current,
        { y: 200 },
        { duration: 0.5, y: 0, ease: Back.easeOut.config(1) },
    );
};

const loadingOnExit = (el: React.RefObject<HTMLDivElement | null>) => () => {
    gsap.fromTo(
        el.current,
        { y: 0 },
        {
            duration: 0.5,
            y: 200,
            ease: Back.easeIn.config(1),
            clearProps: 'translate,rotate,scale,transform',
        },
    );
};

const useEventList = (type: EventListName, searchQ?: string, date?: string) => {
    const {
        fetchNextPage,
        isFetchingNextPage,
        hasNextPage,
        isSuccess,
        isFetching,
        data,
    } = useInfiniteQuery<
        EventItem[],
        Error,
        InfiniteData<EventItem[], FetchEventsArguments>,
        (string | undefined)[],
        FetchEventsArguments
    >({
        queryKey: ['schedule', type, searchQ ?? undefined],
        queryFn: async ({ pageParam }) => {
            return await fetchEvents(pageParam);
        },
        initialPageParam: getInitFetchParams({
            type: type,
            searchQ,
            eventDate: date,
        }),
        getNextPageParam: (_lastPage, allPages) => {
            const lastPage = allPages[allPages.length - 1];
            if (lastPage.length === 0 || lastPage.length !== FETCH_LIMIT) {
                return undefined;
            }
            return getScrollFetchParams(type);
        },
        refetchOnWindowFocus: false,
    });

    const setFulfilled = useSetAtom(scheduleActions.fulfilled);

    React.useEffect(() => {
        isSuccess &&
            data &&
            setFulfilled({
                pagedEvents: data.pages,
                type,
            });
    }, [isSuccess, data, setFulfilled]);

    return {
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
    };
};

export const EventList: React.FC<{ type: EventListName; searchQ?: string }> = ({
    type,
    searchQ,
}) => {
    const loadingRef = React.useRef<HTMLDivElement>(null);

    const setLastQuery = useSetAtom(scheduleAtoms.lastQuery);
    const setDate = useSetAtom(scheduleAtoms.date);

    React.useEffect(() => {
        setLastQuery(searchQ);
    }, [searchQ]);

    const { eventItems, minDate, maxDate } = useAtomValue(
        React.useMemo(
            () =>
                atom((get) => {
                    const events = get(scheduleAtoms[type]);
                    return {
                        eventItems: events.items,
                        minDate: events.minDate,
                        maxDate: events.maxDate,
                    };
                }),
            [],
        ),
    );

    const eventItemsLength = useAtomValue(scheduleAtoms.itemsLength[type]);

    const navigate = useNavigate();
    const routeParams = useParams();
    const { '*': date } = routeParams;
    const isHamburger = useAtomValue(mediaQueriesAtoms.isHamburger);

    const checkRedirects = React.useCallback(() => {
        if (type === 'search' && (searchQ === undefined || searchQ === '')) {
            navigate('/schedule/upcoming');
            return;
        }
        if (type === 'event' && !date) {
            navigate('/schedule/upcoming');
            return;
        }
        return;
    }, [searchQ, date, type]);

    React.useEffect(() => {
        checkRedirects();
        setDate(date);
    }, [type, searchQ, date]);

    const { fetchNextPage, isFetchingNextPage, hasNextPage, isFetching } =
        useEventList(type, searchQ, date);

    const onScroll = React.useCallback(
        ({ clientHeight, scrollTop, scrollHeight }: OnScrollProps) => {
            if (
                scrollTop + clientHeight > scrollHeight - 600 &&
                hasNextPage &&
                !isFetching &&
                !isFetchingNextPage &&
                !!maxDate &&
                !!minDate
            ) {
                if (type !== 'search' && type !== 'event') {
                    fetchNextPage();
                }
            }
        },
        [hasNextPage, isFetching, maxDate, minDate, type],
    );

    const debouncedFetch = React.useMemo(
        () => debounce(onScroll, 100, { leading: true }),
        [onScroll],
    );

    const getHeadTitle = React.useCallback(() => {
        if (!eventItemsLength) {
            return '';
        }
        const event = eventItems.monthGroups[0].events[0];
        let title = `${titleStringBase}Schedule | `;
        if (type !== 'event') {
            title += type === 'archive' ? 'Past' : startCase(type);
            title += ' Events';
            if (type === 'search' && searchQ) {
                title += `: ${searchQ}`;
            }
        } else {
            const formattedDate = new Intl.DateTimeFormat('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                timeZoneName: 'short',
                timeZone: event.timezone,
            }).format(parseISO(event.dateTime));
            title += `Event on ${formattedDate}`;
        }
        return title;
    }, [searchQ, type, eventItems]);

    const description = metaDescriptions[type] as string;

    const loadingDimension = isHamburger ? 50 : 96;

    const getFooterText = React.useCallback(() => {
        let footerText: JSX.Element = <span></span>;
        if (isFetching) {
            footerText = <span>Fetching events...</span>;
        } else if (eventItemsLength === 0) {
            if (type === 'upcoming')
                footerText = (
                    <span>
                        No upcoming events posted. For past events, visit the{' '}
                        <Link to="/schedule/archive">archive</Link>.
                    </span>
                );
        } else if (hasNextPage) {
        } else if (!date) {
            const redirect = type === 'upcoming' ? 'archive' : 'upcoming';
            footerText = (
                <span>
                    End of {type} list. Check out the{' '}
                    <Link to={`/schedule/${redirect}`}>{redirect}</Link>.
                </span>
            );
        }
        return footerText;
    }, [date, hasNextPage, isFetching, eventItemsLength]);

    return (
        <React.Fragment>
            <Helmet
                title={getHeadTitle()}
                meta={[
                    {
                        name: 'description',
                        content: description,
                    },
                ]}
            />
            <ScrollingContainer
                isSearch={type === 'search'}
                onScroll={(ev) => {
                    ev.persist();
                    const { scrollTop, scrollHeight, clientHeight } =
                        ev.currentTarget;
                    !isFetching &&
                        debouncedFetch({
                            scrollTop,
                            scrollHeight,
                            clientHeight,
                        });
                }}
            >
                {eventItemsLength ? (
                    eventItems.monthGroups.map((monthGroup, idx) => (
                        <MonthEvents
                            key={monthGroup.dateTime}
                            type={type}
                            idx={idx}
                            monthGroup={monthGroup}
                            isHamburger={isHamburger}
                            lastQuery={searchQ}
                        />
                    ))
                ) : (
                    <div />
                )}
                {type !== 'event' && <EndOfList>{getFooterText()}</EndOfList>}
            </ScrollingContainer>
            <Transition
                in={isFetching}
                timeout={300}
                onEnter={loadingOnEnter(loadingRef)}
                onExit={loadingOnExit(loadingRef)}
                appear={true}
                nodeRef={loadingRef}
            >
                <LoadingDiv ref={loadingRef}>
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
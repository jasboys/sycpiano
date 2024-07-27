import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { Back, gsap } from 'gsap';
import debounce from 'lodash-es/debounce';
import startCase from 'lodash-es/startCase';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { Transition } from 'react-transition-group';

import { LoadingInstance } from 'src/components/LoadingSVG.jsx';
import { MonthEvents } from 'src/components/Schedule/EventMonth.jsx';
import { scheduleStore } from 'src/components/Schedule/store.js';
import type {
    EventItem,
    EventListName,
    FetchEventsArguments,
} from 'src/components/Schedule/types';
import { toMedia } from 'src/mediaQuery';
import { screenPortrait, screenXS, screenXSandPortrait } from 'src/screens';
import { lightBlue, logoBlue } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { metaDescriptions, titleStringBase } from 'src/utils';
import { shallow } from 'zustand/shallow';
import { transparentize } from 'polished';
import { useStore } from 'src/store.js';
import { FETCH_LIMIT, fetchEvents, getInitFetchParams, getScrollFetchParams } from './queryFunctions.js';

interface EventListProps {
    readonly type: EventListName;
    readonly searchQ?: string;
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
        eventItemsLength,
        lastQuery,
        isSearching,
    } = scheduleStore.useStore((state) => {
        const name = props.type;
        return {
            eventItems: state[name].items,
            eventItemsLength: state[name].items.length,
            minDate: state[name].minDate,
            maxDate: state[name].maxDate,
            lastQuery: state[name].lastQuery,
            isSearching: state.isFetching,
        };
    }, shallow);
    const navigate = useNavigate();
    const routeParams = useParams();
    const { '*': date } = routeParams;
    const isHamburger = useStore().mediaQueries.isHamburger();

    const searchQ = props.searchQ;

    const checkRedirects = React.useCallback(() => {
        if (searchQ !== undefined) {
            if (searchQ === '') {
                navigate('/schedule/upcoming');
                return;
            }
        } else if (props.type === 'event') {
            if (!date) {
                navigate('/schedule/upcoming');
                return;
            }
        } else {
            return;
        }
    }, [searchQ, date, props.type]);

    React.useEffect(() => {
        checkRedirects();
    }, [props.type, searchQ, date]);

    const { fetchNextPage, hasNextPage, isSuccess, isFetching, data } =
        useInfiniteQuery<
            EventItem[],
            Error,
            InfiniteData<EventItem[], FetchEventsArguments>,
            (string | undefined)[],
            FetchEventsArguments
        >({
            queryKey: ['schedule', props.type, searchQ ?? undefined],
            queryFn: async ({ pageParam }) => {
                return await fetchEvents(pageParam);
            },
            initialPageParam: getInitFetchParams({
                type: props.type,
                searchQ,
                eventDate: date,
            }),
            getNextPageParam: (_lastPage, allPages) => {
                const lastPage = allPages[allPages.length - 1];
                if (lastPage.length === 0 || lastPage.length !== FETCH_LIMIT) {
                    return undefined;
                }
                return getScrollFetchParams(props.type);
            },
            refetchOnWindowFocus: false,
        });

    React.useEffect(() => {
        scheduleStore.set.isFetching(isFetching);
    }, [isFetching]);

    // Store data (will be transformed into monthGroups)
    React.useEffect(() => {
        isSuccess &&
            data &&
            scheduleStore.set.fulfilled({
                name: props.type,
                pagedEvents: data.pages,
                lastQuery: searchQ,
            });
    }, [isSuccess, props.type, data]);

    const onScroll = React.useCallback(
        ({ clientHeight, scrollTop, scrollHeight }: OnScrollProps) => {
            if (
                scrollTop + clientHeight > scrollHeight - 600 &&
                hasNextPage &&
                !isFetching &&
                !!maxDate &&
                !!minDate
            ) {
                if (props.type !== 'search' && props.type !== 'event') {
                    fetchNextPage();
                }
            }
        },
        [hasNextPage, isFetching, maxDate, minDate, props.type],
    );

    const debouncedFetch = React.useMemo(
        () => debounce(onScroll, 100, { leading: true }),
        [onScroll],
    );

    const title = `${titleStringBase}Schedule | ${props.type === 'archive' ? 'Archived' : startCase(props.type)}Events${searchQ ?? `: ${searchQ}`}`;

    const description = metaDescriptions[props.type] as string;

    const loadingDimension = isHamburger ? 50 : 96;

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
                        {isFetching || isSearching
                            ? 'Fetching events...'
                            : eventItemsLength === 0
                              ? 'No events fetched'
                              : hasNextPage
                                ? ''
                                : 'No more events'}
                    </EndOfList>
                )}
            </ScrollingContainer>
            <Transition<undefined>
                in={isFetching || isSearching}
                timeout={300}
                onEnter={loadingOnEnter}
                onExit={loadingOnExit}
                appear={true}
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

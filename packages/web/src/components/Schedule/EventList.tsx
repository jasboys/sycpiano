import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { Back, gsap } from 'gsap';
import { useAtomValue, useSetAtom } from 'jotai';
import debounce from 'lodash-es/debounce';
import startCase from 'lodash-es/startCase';
import { transparentize } from 'polished';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { Transition } from 'react-transition-group';
import { LoadingInstance } from 'src/components/LoadingSVG.jsx';
import { MonthEvents } from 'src/components/Schedule/EventMonth.jsx';
import { eventsQueryAtom, scheduleActions, scheduleAtoms } from 'src/components/Schedule/store.js';
import { toMedia } from 'src/mediaQuery';
import { screenPortrait, screenXS, screenXSandPortrait } from 'src/screens';
import { lightBlue, logoBlue } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { metaDescriptions, titleStringBase } from 'src/utils';
import { mediaQueriesAtoms } from '../App/store.js';

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

const useEventList = () => {
    const { fetchNextPage, hasNextPage, isSuccess, isFetching, data } =
        useAtomValue(
            eventsQueryAtom,
        );
    const setFetching = useSetAtom(scheduleAtoms.isFetching);
    const setFulfilled = useSetAtom(scheduleActions.fulfilled);

    React.useEffect(() => {
        setFetching(isFetching);
    }, [isFetching]);

    React.useEffect(() => {
        isSuccess &&
            data &&
            setFulfilled({
                pagedEvents: data.pages,
            });
    }, [isSuccess, data]);

    return {
        fetchNextPage,
        hasNextPage,
    }
}

export const EventList: React.FC = () => {
    const loadingRef = React.useRef<HTMLDivElement>(null);

    const {
        eventItems,
        minDate,
        maxDate,
        eventItemsLength
    } = useAtomValue(scheduleAtoms.eventList);
    const type = useAtomValue(scheduleAtoms.currentType);
    const searchQ = useAtomValue(scheduleAtoms.lastQuery);
    const isFetching = useAtomValue(scheduleAtoms.isFetching)

    const navigate = useNavigate();
    const routeParams = useParams();
    const { '*': date } = routeParams;
    const isHamburger = useAtomValue(mediaQueriesAtoms.isHamburger);


    const checkRedirects = React.useCallback(() => {
        if (
            type === 'search' &&
            (searchQ === undefined || searchQ === '')
        ) {
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
    }, [type, searchQ, date]);

    const { fetchNextPage, hasNextPage } = useEventList();

    const onScroll = React.useCallback(
        ({ clientHeight, scrollTop, scrollHeight }: OnScrollProps) => {
            if (
                scrollTop + clientHeight > scrollHeight - 600 &&
                hasNextPage &&
                !isFetching &&
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

    const title = `${titleStringBase}Schedule | ${type === 'archive' ? 'Archived' : startCase(type)} Events${searchQ ? '' : `: ${searchQ}`}`;

    const description = metaDescriptions[type] as string;

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
                isSearch={type === 'search'}
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
                {type !== 'event' && (
                    <EndOfList>
                        {isFetching
                            ? 'Fetching events...'
                            : eventItemsLength === 0
                              ? 'No events fetched'
                              : hasNextPage
                                ? ''
                                : 'No more events'}
                    </EndOfList>
                )}
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

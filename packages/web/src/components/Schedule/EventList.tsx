import styled from '@emotion/styled';
import startCase from 'lodash-es/startCase';
import { createCachedSelector } from 're-reselect';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';

import debounce from 'lodash-es/debounce';

import { css } from '@emotion/css';
import { formatInTimeZone } from 'date-fns-tz';
import format from 'date-fns-tz/format';
import parseISO from 'date-fns/parseISO';
import startOfDay from 'date-fns/startOfDay';
import { gsap } from 'gsap';
import { useSearchParams } from 'react-router-dom';
import { Transition } from 'react-transition-group';
import { mqSelectors } from 'src/components/App/reducers';
import { BackIconInstance } from 'src/components/Schedule/BackIconSVG';
import EventItem from 'src/components/Schedule/EventItem';
import { fetchEvents, searchEvents } from 'src/components/Schedule/reducers';
import {
    EventListName,
    FetchEventsArguments,
    MonthGroup as MonthGroupType,
} from 'src/components/Schedule/types';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { toMedia } from 'src/mediaQuery';
import { screenPortrait, screenXS, screenXSandPortrait } from 'src/screens';
import { GlobalStateShape } from 'src/store';
import { lightBlue, logoBlue } from 'src/styles/colors';
import { lato2 } from 'src/styles/fonts';
import { metaDescriptions, titleStringBase } from 'src/utils';
import { LoadingInstance } from '../LoadingSVG.jsx';

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

const loadingStyle = css({
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
    overflowX: 'hidden',
    marginTop: 0,
    [toMedia(screenXSandPortrait)]: {
        paddingTop: 0,
        marginTop: props.isSearch ? 'calc(80px + 1.2rem)' : 'calc(50px + 1.2rem)',
        height: props.isSearch ? 'calc(100% - (80px + 1.2rem))' : 'calc(100% - (50px + 1.2rem))'
    }
})
);

const Events = styled.div({
    overflowY: 'auto',
});

const MonthGroup = styled.div({
    marginBottom: 4,
    width: '100vw',
});

const MonthBar = styled.div<{ isMobile: boolean }>(({ isMobile }) => ({
    fontSize: 'min(10vw, 2.0rem)',
    position: 'sticky',
    top: 0,
    zIndex: 11,
    width: '86vw',
    maxWidth: isMobile ? 'unset' : 850,
    margin: isMobile ? 'auto' : '0 auto',
    display: 'flex',
    fontFamily: lato2,
    backgroundColor: 'rgb(238 238 238)',
    color: logoBlue,
    borderBottom: `1px var(--logo-blue) solid`,
    padding: '2rem 0 0.5rem 0',
    [toMedia(screenXS)]: {
        paddingTop: '0.5rem',
    }
}));

const MonthText = styled.div<{ isMobile: boolean }>(
    {
        paddingRight: '0.3rem',
        flex: '0 0 max(calc(50% - 200px), 100px)',
        whiteSpace: 'nowrap',
        textAlign: 'right',
    }
);

const YearText = styled.div<{ isMobile: boolean }>(
    {
        paddingLeft: '0.3rem',
        flex: 1,
    }
);

const BackButton = styled.div({
    width: 'min(10vw, 2.0rem)',
    height: 'min(10vw, 2.0rem)',
    borderRadius: '50%',
    border: '1px var(--logo-blue) solid',
    position: 'absolute',
    stroke: 'var(--logo-blue)',
    strokeWidth: '1.5px',
    alignSelf: 'center',
    transition: 'all 250ms',
    '&:hover': {
        cursor: 'pointer',
        stroke: 'var(--light-blue)',
        borderColor: 'var(--light-blue)'
    }
});

interface MonthEventsProps {
    type: EventListName;
    lastQuery?: string;
    idx: number;
    isHamburger: boolean;
    monthGroup: MonthGroupType;
}

const MonthEvents: React.FC<MonthEventsProps> = ({
    type,
    lastQuery,
    idx,
    isHamburger,
    monthGroup,
}) => {
    const navigate = useNavigate();
    const backOnClick = React.useCallback(() => {
        navigate('/schedule/upcoming');
    }, []);

    return (
        <MonthGroup key={`${type}-${lastQuery!}-${idx}-month`}>
            <MonthBar isMobile={isHamburger}>
                {(type === 'event') &&
                    <BackButton>
                        <BackIconInstance onClick={backOnClick}/>
                    </BackButton>
                }
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
                        const permaLink = `/schedule/event/${encodeURIComponent(formatInTimeZone(parseISO(event.dateTime), 'Zulu', `yyyyMMdd'T'HHmmssX`))}`;
                        return (
                            <EventItem
                                key={`${type}-${lastQuery!}-${idx}-event`}
                                listType={type}
                                isMobile={isHamburger}
                                permaLink={permaLink}
                                {...event}
                            />
                        );
                    })
                }
            </Events>
        </MonthGroup>
    );
}

const loadingOnEnter = (el: HTMLElement) => {
    gsap.fromTo(el, { y: 200 }, { duration: 0.25, y: 0, ease: "back.out(1)" });
};

const loadingOnExit = (el: HTMLElement) => {
    gsap.fromTo(el, { y: 0 }, { duration: 0.25, y: 200, ease: "back.in(1)" });
}

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
    console.log(routeParams);

    const onMountOrUpdate = React.useCallback(() => {
        console.log(searchQ);
        if (searchQ !== null) {
            if (searchQ === '') {
                navigate('/schedule/upcoming');
                return;
            }
            // run search fetch
            dispatch(searchEvents({
                name: 'search',
                q: searchQ
            }));
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

    const onScroll = React.useCallback(({ clientHeight, scrollTop, scrollHeight }: OnScrollProps) => {
        if (scrollTop + clientHeight > scrollHeight - 600 &&
            hasMore &&
            !isFetchingList &&
            !!maxDate &&
            !!minDate
        ) {
            if (props.type !== 'search' && props.type !== 'event') {
                dispatch(fetchEvents(getScrollFetchParams[props.type]()));
            }
        }
    }, [hasMore, isFetchingList, maxDate, minDate, props.type]);

    const debouncedFetch = React.useMemo(
        () => debounce(onScroll, 100, { leading: true })
        , [props.type, hasMore, isFetchingList, maxDate, minDate]);

    const title =
        titleStringBase +
        'Schedule | ' +
        (props.type === 'archive' ? 'Archived' : startCase(props.type)) +
        'Events' +
        (searchQ ? ': ' + searchQ : '');

    const description = metaDescriptions[props.type];

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
                {eventItemsLength
                    ? eventItems.monthGroups.map((monthGroup, idx) =>
                        <MonthEvents
                            key={idx}
                            type={props.type}
                            idx={idx}
                            monthGroup={monthGroup}
                            isHamburger={isHamburger}
                            lastQuery={lastQuery}
                        />)
                    : <div />
                }
                {(props.type !== 'event') && <EndOfList>
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
                        <LoadingInstance css={loadingStyle} width={72} height={72} />
                    </SpinnerContainer>
                </LoadingDiv>
            </Transition>
        </React.Fragment>
    );
};

export default EventList;
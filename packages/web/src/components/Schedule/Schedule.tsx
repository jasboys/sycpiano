import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SwitchTransition, Transition } from 'react-transition-group';

import { BackIconSVG } from 'src/components/Schedule/BackIconSVG';
import EventList from 'src/components/Schedule/EventList';
import { LocationIconSVG } from 'src/components/Schedule/LocationIconSVG';
import { Search } from 'src/components/Schedule/Search';
import { SearchIconSVG } from 'src/components/Schedule/SearchIconSVG';
import { ShareIconSVG } from 'src/components/Schedule/ShareIconSVG';
import type { EventListName } from 'src/components/Schedule/types';
import { toMedia } from 'src/mediaQuery';
import { hiDpx, screenPortrait, screenXS } from 'src/screens';
import { logoBlue } from 'src/styles/colors.js';
import { latoFont } from 'src/styles/fonts.js';
import { container, pushed } from 'src/styles/mixins';
import { navBarHeight } from 'src/styles/variables.js';
import { fadeOnEnter, fadeOnExit } from 'src/utils';

const ScheduleContainer = styled.div(pushed, container, {
    fontSize: '100%',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    [toMedia([screenXS, screenPortrait])]: {
        fontSize: '80%',
    },
});

const Fading = styled.div(container, {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    visibility: 'hidden',
});

const typeDisplayStyle = css(latoFont(300), {
    position: 'fixed',
    top: navBarHeight.lowDpx,
    left: 0,
    transformOrigin: '0 0',
    transform: 'rotate(90deg) translateY(-100%)',
    padding: '2rem 2.5rem',
    fontSize: '3rem',
    color: logoBlue,
    letterSpacing: '0.6rem',
    [toMedia(hiDpx)]: {
        top: navBarHeight.hiDpx,
    },
});

const TypeDisplay: React.FC<{ type: EventListName }> = ({ type }) => {
    return <div css={typeDisplayStyle}>{type.toUpperCase()}</div>;
};

interface ScheduleProps {
    type: EventListName;
}

const Schedule: React.FC<ScheduleProps> = ({ type }) => {
    const [params, _setParams] = useSearchParams();
    const fadingRef = React.useRef<HTMLDivElement>(null);
    // const setType = useSetAtom(scheduleAtoms.currentType);
    // const setLastQuery = useSetAtom(scheduleAtoms.lastQuery);
    // const [ready, setReady] = React.useState(false);

    const searchQ = params.get('q') ?? undefined;

    return (
        <ScheduleContainer>
            <Search />
            <TypeDisplay type={type} />
            <div css={css({ height: '100%' })}>
                <SwitchTransition>
                    <Transition
                        timeout={800}
                        onEntering={fadeOnEnter(fadingRef, 0.2)}
                        onExiting={fadeOnExit(fadingRef, 0.5)}
                        key={`${type}`}
                        appear={true}
                        nodeRef={fadingRef}
                    >
                        <Fading ref={fadingRef}>
                            <EventList
                                key={type}
                                type={type}
                                searchQ={searchQ}
                            />
                        </Fading>
                    </Transition>
                </SwitchTransition>
            </div>
            {/* <DateIconSVG /> */}
            <LocationIconSVG />
            {/* <TrebleIconSVG /> */}
            {/* <LinkIconSVG /> */}
            <ShareIconSVG />
            <BackIconSVG />
            <SearchIconSVG />
        </ScheduleContainer>
    );
};

export { EventList };
export type ScheduleType = typeof Schedule;
export type RequiredProps = ScheduleProps;
export default Schedule;

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useAtomValue } from 'jotai';
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
import { screenPortrait, screenXS } from 'src/screens';
import { container, pushed, verticalTextStyle } from 'src/styles/mixins';
import { fadeOnEnter, fadeOnExit } from 'src/utils';
import { mediaQueriesAtoms } from '../App/store';

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

const verticalStyle = css(verticalTextStyle, {
    left: 'calc(50vw - min(400px, 40vw))',
    transform: 'rotate(90deg) translateY(50%)',
    zIndex: 100,
});

const TypeDisplay: React.FC<{ type: EventListName }> = ({ type }) => {
    return <div css={verticalStyle}>{type.toUpperCase()}</div>;
};

interface ScheduleProps {
    type: EventListName;
}

const Schedule: React.FC<ScheduleProps> = ({ type }) => {
    const [params, _setParams] = useSearchParams();
    const fadingRef = React.useRef<HTMLDivElement>(null);
    const isHamburger = useAtomValue(mediaQueriesAtoms.isHamburger);

    const searchQ = params.get('q') ?? undefined;

    return (
        <ScheduleContainer>
            {!isHamburger && <TypeDisplay type={type} />}

            <Search searchQ={searchQ} />
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

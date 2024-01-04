import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as React from 'react';
import { SwitchTransition, Transition } from 'react-transition-group';

import { toMedia } from 'src/mediaQuery';
import { BackIconSVG } from 'src/components/Schedule/BackIconSVG';
import EventList from 'src/components/Schedule/EventList';
import { LocationIconSVG } from 'src/components/Schedule/LocationIconSVG';
import { Search } from 'src/components/Schedule/Search';
import { SearchIconSVG } from 'src/components/Schedule/SearchIconSVG';
import { ShareIconSVG } from 'src/components/Schedule/ShareIconSVG';
import { EventListName } from 'src/components/Schedule/types';
import { screenPortrait, screenXS } from 'src/screens';
import { container, pushed } from 'src/styles/mixins';
import { fadeOnEnter, fadeOnExit } from 'src/utils';

const ScheduleContainer = styled.div(
    pushed,
    container,
    {
        fontSize: '100%',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: 'white',
        [toMedia([screenXS, screenPortrait])]: {
            fontSize: '80%'
        }
    });

const Fading = styled.div(
    container,
    {
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        visibility: 'hidden',
    }
);

interface ScheduleProps { type: EventListName; }

const Schedule: React.FC<ScheduleProps> = ({ type }) => {
    return (
        <ScheduleContainer>
            <Search />
            <div css={css({ height: '100%' })}>
                <SwitchTransition>
                    <Transition<undefined>
                        timeout={800}
                        onEntering={fadeOnEnter(0.2)}
                        onExiting={fadeOnExit(0.5)}
                        key={`${type} ${location.search}`}
                        appear={true}
                    >
                        <Fading>
                            <EventList
                                key={type}
                                type={type}
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

import * as React from 'react';

import { css } from '@emotion/react';

import EventList from 'src/components/Schedule/EventList';
import { Search } from 'src/components/Schedule/Search';

import { container, pushed } from 'src/styles/mixins';

import { LocationIconSVG } from 'src/components/Schedule/LocationIconSVG';
import { screenPortrait, screenXS } from 'src/screens';
import { toMedia } from 'src/mediaQuery';
import { EventListName } from 'src/components/Schedule/types';
import styled from '@emotion/styled';
import { SwitchTransition, Transition } from 'react-transition-group';
import { fadeOnEnter, fadeOnExit } from 'src/utils';
import { ShareIconSVG } from 'src/components/Schedule/ShareIconSVG';
import { BackIconSVG } from 'src/components/Schedule/BackIconSVG';
import { SearchIconSVG } from 'src/components/Schedule/SearchIconSVG';

const ScheduleContainer = styled.div(
    pushed,
    container,
    {
        fontSize: '100%',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: 'white',
        // backgroundImage: 'linear-gradient(90deg, var(--light-blue) calc(50vw - 200px), rgb(238 238 238) calc(50vw - 200px))',
        // backgroundImage: `url('/static/images/Van_Cliburn_Sean_Chen-0044.jpg')`,
        // backgroundSize: 'cover',
        // backgroundPosition: '50% 66%',
        // backgroundBlendMode: 'overlay',
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
                        key={type + ' ' + location.search}
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

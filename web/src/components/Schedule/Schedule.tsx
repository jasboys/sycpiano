import * as React from 'react';

import { css } from '@emotion/react';

import EventList from 'src/components/Schedule/EventList';
import { Search } from 'src/components/Schedule/Search';

import { container, pushed } from 'src/styles/mixins';

import { DateIconSVG } from 'src/components/Schedule/DateIconSVG';
import { LinkIconSVG } from 'src/components/Schedule/LinkIconSVG';
import { LocationIconSVG } from 'src/components/Schedule/LocationIconSVG';
import { TrebleIconSVG } from 'src/components/Schedule/TrebleIconSVG';
import { screenXSorPortrait } from 'src/styles/screens';
import { EventListName } from 'src/components/Schedule/types';
import styled from '@emotion/styled';

const ScheduleContainer = styled.div(
    pushed,
    container,
    {
        fontSize: '100%',
        width: '100%',
        boxSizing: 'border-box',
        [screenXSorPortrait]: {
            fontSize: '80%'
        }
    });

interface ScheduleProps { isMobile: boolean; type: EventListName; }

const Schedule: React.FC<ScheduleProps> = ({ isMobile, type }) => {
    // const match = useMatch('schedule/:type/*')
    // const type = match!.params.type!;

    return (
        <ScheduleContainer>
            <Search />
            <div css={css({ height: '100%' })}>
                <EventList
                    key={type}
                    type={type}
                    isMobile={isMobile}
                />
            </div>
            <DateIconSVG />
            <LocationIconSVG />
            <TrebleIconSVG />
            <LinkIconSVG />
        </ScheduleContainer>
    );
};

export { EventList };
export type ScheduleType = typeof Schedule;
export type RequiredProps = ScheduleProps;
export default Schedule;

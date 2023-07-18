import { scheduleReducer } from 'src/components/Schedule/reducers';
import Schedule from 'src/components/Schedule/Schedule';

export const Component = Schedule;
export const reducers = {
    scheduleEventItems: scheduleReducer,
};

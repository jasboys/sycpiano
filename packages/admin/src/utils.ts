import { parse, startOfMinute } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

export const toUTC = (dt: string, tz: string) => {
    try {
        return fromZonedTime(
            startOfMinute(parse(dt, 'yyyy-MM-dd HH:mm', new Date())),
            tz,
        ).toISOString();
    } catch (e) {
        return '';
    }
};

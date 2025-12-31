import { tz } from '@date-fns/tz';
import { parse, startOfMinute } from 'date-fns';

export const toUTC = (dt: string, timezone: string) => {
    try {
        return startOfMinute(
            parse(dt, 'yyyy-MM-dd HH:mm', new Date(), {
                in: tz(timezone),
            }).withTimeZone('UTC'),
        ).toISOString();
    } catch (_e) {
        return undefined;
    }
};

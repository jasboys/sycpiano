import { parse, startOfMinute } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

export const toUTC = (dt: string, tz: string) => {
    try {
        return zonedTimeToUtc(startOfMinute(parse(dt, "yyyy-MM-dd HH:mm", new Date())), tz).toISOString();
    } catch (e) {
        return '';
    }
};
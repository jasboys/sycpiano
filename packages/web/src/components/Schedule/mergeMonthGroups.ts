import { isSameMonth, parseISO } from 'date-fns';
import {
    MonthGroups,
    MonthGroup,
    eventAscend,
    eventDescend,
    monthGroupAscend,
    monthGroupDescend,
} from './types';

export const mergeMonthGroups = (
    left: MonthGroups,
    right: MonthGroups,
): MonthGroups => {
    if (left.order !== right.order) {
        throw Error('trying to merge two groups of opposite sorting order');
    }
    if (left.monthGroups.length === 0) {
        return { ...right };
    }
    if (right.monthGroups.length === 0) {
        return { ...left };
    }
    const localLeft = { ...left };
    const mergedWithExisting: MonthGroup[] = right.monthGroups.map((mg) => {
        const inLeftIdx = localLeft.monthGroups.findIndex((leftGroup) =>
            isSameMonth(parseISO(leftGroup.dateTime), parseISO(mg.dateTime)),
        );
        if (inLeftIdx !== -1) {
            const popped = localLeft.monthGroups.splice(inLeftIdx, 1)[0]; // mutate local array
            return {
                ...popped,
                events: [...popped.events, ...mg.events].sort(
                    localLeft.order === 'asc' ? eventAscend : eventDescend,
                ),
            };
        }
        return mg;
    });
    const result = [
        ...localLeft.monthGroups, // any duplicate months have been removed because of popping
        ...mergedWithExisting,
    ].sort(localLeft.order === 'asc' ? monthGroupAscend : monthGroupDescend);

    return {
        order: localLeft.order,
        length: result.reduce((prev, curr) => {
            return prev + curr.events.length;
        }, 0),
        monthGroups: result,
    };
};

import { calendar } from 'models/calendar';

import * as forest from 'forest-express-sequelize';
import { formatInTimeZone } from 'date-fns-tz';

forest.collection('calendar', {
    actions: [
        { name: 'Sync', type: 'global' },
        { name: 'Sync Selected', type: 'bulk' },
    ],
    fields: [{
        field: 'DateTime Input',
        type: 'String',
        get: (cal: calendar) => {
            if (cal.dateTime) {
                return formatInTimeZone(cal.dateTime, cal.timezone, 'yyyy-MM-dd HH:mm');
            } else {
                return '';
            }
        },
        set: (cal: calendar, _input: string) => {
            // Creates moment in UTC from input by passing in null
            // This is necessary because of how forest/sequelize detects changes in values.
            // cal.dateTime = moment.tz(input, null).toDate();
            return cal;
        },
    }],
});

export {};

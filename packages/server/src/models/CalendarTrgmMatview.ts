import {
    Entity,
    Index,
    OneToOne,
    Platform,
    PrimaryKey,
    Property,
    Type,
} from '@mikro-orm/core';
import type { Rel } from '@mikro-orm/core';
import { Calendar } from './Calendar.js';

export class RegexSearch extends Type<RegExp, RegExp> {
    compareAsType(): string {
        return 'string';
    }

    getColumnType(): string {
        return 'string';
    }

    convertToDatabaseValue(key: RegExp, _platform: Platform): RegExp {
        console.log('why', key);
        // return `to_tsquery('en', ${key})`;
        return key;
    }
}

@Entity()
export class CalendarTrgmMatview {
    @PrimaryKey({ columnType: 'text' })
    id!: string;

    @Index({ name: 'calendar_trgm_gist_idx' })
    @Property({ columnType: 'text' })
    doc!: string;

    @OneToOne({ entity: () => Calendar, joinColumn: 'id' })
    Calendar!: Rel<Calendar>;
}

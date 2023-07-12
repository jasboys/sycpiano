import { Entity, Index, OneToOne, Platform, PrimaryKey, Property, Type } from '@mikro-orm/core';
import type { Rel } from '@mikro-orm/core';
import { Calendar } from './Calendar.js';

export class FullTextSearch extends Type<string, string> {
    compareAsType(): string {
        return 'string';
    }

    getColumnType(): string {
        return 'tsvector';
    }

    convertToDatabaseValueSQL(key: string, _platform: Platform): string {
        return `to_tsquery('en', ${key})`;
    }
}

@Entity()
export class CalendarSearchMatview {

  @PrimaryKey({ columnType: 'text' })
  id!: string;

  @Index({ name: 'search_idx' })
  @Property({ fieldName: '_search', type: FullTextSearch })
  Search!: string;

  @OneToOne({ mappedBy: 'calendar' })
  Calendar!: Rel<Calendar>
}

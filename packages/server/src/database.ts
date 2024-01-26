import {
    EntityProperty,
    LoadStrategy,
    MikroORM,
    PopulateHint,
    ReflectMetadataProvider,
} from '@mikro-orm/core';
import { PostgreSqlDriver, PostgreSqlPlatform } from '@mikro-orm/postgresql';

import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import config from './config/config.js';

const { databaseUrl } = config;

class FixedPlatform extends PostgreSqlPlatform {
    override getFullTextWhereClause(prop: EntityProperty): string {
        if (prop.columnTypes[0] === 'tsvector') {
            return `:column: @@ to_tsquery('en', :query)`;
        }

        return `to_tsvector('simple', :column:) @@ plainto_tsquery('simple', :query)`;
    }
}

export class FixedPostgresql extends PostgreSqlDriver {
    protected readonly platform = new FixedPlatform();
}

const orm = await MikroORM.init<FixedPostgresql>({
    entities: ['packages/server/build/models'],
    entitiesTs: ['packages/server/src/models'],
    metadataProvider: ReflectMetadataProvider,
    clientUrl: databaseUrl,
    debug: true,
    driver: FixedPostgresql,
    loadStrategy: LoadStrategy.JOINED,
    populateWhere: PopulateHint.INFER,
    discovery: {
        checkDuplicateFieldNames: false,
    },
});

export default orm;

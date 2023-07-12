import { EntityProperty, MikroORM, ReflectMetadataProvider } from '@mikro-orm/core';
import { PostgreSqlDriver, PostgreSqlPlatform } from '@mikro-orm/postgresql';

import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import config from './config/config.js';
// import { Acclaim } from './models/orm/Acclaim.js';
// import { Calendar } from './models/orm/Calendar.js';
// import { Piece } from './models/orm/Piece.js';
import { Kysely, PostgresDialect } from 'kysely';
import { DB } from 'kysely-codegen';
import { Pool } from 'pg';
const {
    databaseUrl
} = config;

// class FixedPlatform extends PostgreSqlPlatform {
//     override getFullTextWhereClause(prop: EntityProperty): string {
//         if (prop.columnTypes[0] === 'tsvector') {
//           return `:column: @@ to_tsquery('en', :query)`;
//         }

//         return `to_tsvector('simple', :column:) @@ plainto_tsquery('simple', :query)`;
//       }
// }

// class FixedPostgresql extends PostgreSqlDriver {
//     protected readonly platform = new FixedPlatform;
// }

// console.log(process.env.DATABASE_URL);

// const orm = await MikroORM.init<FixedPostgresql>({
//     entities: ['server/build/models/orm'],
//     entitiesTs: ['server/src/models/orm'],
//     metadataProvider: ReflectMetadataProvider,
//     dbName: 'sycpiano',
//     user: 'sycpiano',
//     password: 'sycpiano',
//     host: 'localhost',
//     port: 5432,
//     charset: 'utf8',
//     allowGlobalContext: true,
//     debug: true,
//     driver: FixedPostgresql
// });

// const cal = await orm.em.find(Piece, {}, { limit: 1 });

// console.log(cal);

const db = new Kysely<DB>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: databaseUrl,
        }),
    }),
});

export default db;
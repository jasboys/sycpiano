import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import orm from './database.js';
import { User } from './models/User.js';

async function main() {
    console.log(process.argv);
    if (process.argv.length < 4) {
        console.log('usage: node server/build/createAdmin.js username password');
        throw new Error('Too few args.');
    }
    const username = process.argv[2];
    const password = process.argv[3];
    try {
        const passHash = await argon2.hash(password, { type: argon2.argon2id });

        const user = orm.em.create(
            User,
            {
                id: randomUUID(),
                username,
                passHash,
                role: 'admin',
            });
        orm.em.persist(user).flush();
        console.log('Successfully created Admin user.');
    } catch (e) {
        console.log('Failed to create Admin user.');
        throw e;
    }
}

main();
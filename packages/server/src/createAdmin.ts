import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import orm from './database.js';
import { User } from './models/User.js';

async function main() {
    if (process.argv.length < 5) {
        console.log(
            'usage: node server/build/createAdmin.js role username password',
        );
        throw new Error('Too few args.');
    }
    const role = process.argv[2];
    if (!['admin', 'readonly'].includes(role)) {
        throw new Error('Role must be admin or readonly');
    }
    const username = process.argv[3];
    const password = process.argv[4];
    try {
        const passHash = await argon2.hash(password, { type: 2 });
        const em = orm.em.fork();

        const user = em.create(User, {
            id: randomUUID(),
            username,
            passHash,
            role,
        });
        await em.persist(user).flush();
        console.log('Successfully created Admin user.');
    } catch (e) {
        console.log('Failed to create Admin user.');
        throw e;
    }
}

main();

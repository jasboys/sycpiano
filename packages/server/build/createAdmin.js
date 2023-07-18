import * as argon2 from "argon2";
import { randomUUID } from "crypto";
import orm from "./database.js";
import { User } from "./models/User.js";
async function main() {
    console.log(process.argv);
    if (process.argv.length < 4) {
        console.log('usage: node server/build/createAdmin.js username password');
        throw new Error('Too few args.');
    }
    const username = process.argv[2];
    const password = process.argv[3];
    try {
        const passHash = await argon2.hash(password, {
            type: argon2.argon2id
        });
        const user = orm.em.create(User, {
            id: randomUUID(),
            username,
            passHash,
            role: 'admin'
        });
        orm.em.persist(user).flush();
        console.log('Successfully created Admin user.');
    } catch (e) {
        console.log('Failed to create Admin user.');
        throw e;
    }
}
main();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jcmVhdGVBZG1pbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBhcmdvbjIgZnJvbSAnYXJnb24yJztcbmltcG9ydCB7IHJhbmRvbVVVSUQgfSBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IG9ybSBmcm9tICcuL2RhdGFiYXNlLmpzJztcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuL21vZGVscy9Vc2VyLmpzJztcblxuYXN5bmMgZnVuY3Rpb24gbWFpbigpIHtcbiAgICBjb25zb2xlLmxvZyhwcm9jZXNzLmFyZ3YpO1xuICAgIGlmIChwcm9jZXNzLmFyZ3YubGVuZ3RoIDwgNCkge1xuICAgICAgICBjb25zb2xlLmxvZygndXNhZ2U6IG5vZGUgc2VydmVyL2J1aWxkL2NyZWF0ZUFkbWluLmpzIHVzZXJuYW1lIHBhc3N3b3JkJyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVG9vIGZldyBhcmdzLicpO1xuICAgIH1cbiAgICBjb25zdCB1c2VybmFtZSA9IHByb2Nlc3MuYXJndlsyXTtcbiAgICBjb25zdCBwYXNzd29yZCA9IHByb2Nlc3MuYXJndlszXTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwYXNzSGFzaCA9IGF3YWl0IGFyZ29uMi5oYXNoKHBhc3N3b3JkLCB7IHR5cGU6IGFyZ29uMi5hcmdvbjJpZCB9KTtcblxuICAgICAgICBjb25zdCB1c2VyID0gb3JtLmVtLmNyZWF0ZShcbiAgICAgICAgICAgIFVzZXIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6IHJhbmRvbVVVSUQoKSxcbiAgICAgICAgICAgICAgICB1c2VybmFtZSxcbiAgICAgICAgICAgICAgICBwYXNzSGFzaCxcbiAgICAgICAgICAgICAgICByb2xlOiAnYWRtaW4nLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIG9ybS5lbS5wZXJzaXN0KHVzZXIpLmZsdXNoKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTdWNjZXNzZnVsbHkgY3JlYXRlZCBBZG1pbiB1c2VyLicpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0ZhaWxlZCB0byBjcmVhdGUgQWRtaW4gdXNlci4nKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICB9XG59XG5cbm1haW4oKTsiXSwibmFtZXMiOlsiYXJnb24yIiwicmFuZG9tVVVJRCIsIm9ybSIsIlVzZXIiLCJtYWluIiwiY29uc29sZSIsImxvZyIsInByb2Nlc3MiLCJhcmd2IiwibGVuZ3RoIiwiRXJyb3IiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwicGFzc0hhc2giLCJoYXNoIiwidHlwZSIsImFyZ29uMmlkIiwidXNlciIsImVtIiwiY3JlYXRlIiwiaWQiLCJyb2xlIiwicGVyc2lzdCIsImZsdXNoIiwiZSJdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWUEsWUFBWSxTQUFTO0FBQ2pDLFNBQVNDLFVBQVUsUUFBUSxTQUFTO0FBQ3BDLE9BQU9DLFNBQVMsZ0JBQWdCO0FBQ2hDLFNBQVNDLElBQUksUUFBUSxtQkFBbUI7QUFFeEMsZUFBZUM7SUFDWEMsUUFBUUMsR0FBRyxDQUFDQyxRQUFRQyxJQUFJO0lBQ3hCLElBQUlELFFBQVFDLElBQUksQ0FBQ0MsTUFBTSxHQUFHLEdBQUc7UUFDekJKLFFBQVFDLEdBQUcsQ0FBQztRQUNaLE1BQU0sSUFBSUksTUFBTTtJQUNwQjtJQUNBLE1BQU1DLFdBQVdKLFFBQVFDLElBQUksQ0FBQyxFQUFFO0lBQ2hDLE1BQU1JLFdBQVdMLFFBQVFDLElBQUksQ0FBQyxFQUFFO0lBQ2hDLElBQUk7UUFDQSxNQUFNSyxXQUFXLE1BQU1iLE9BQU9jLElBQUksQ0FBQ0YsVUFBVTtZQUFFRyxNQUFNZixPQUFPZ0IsUUFBUTtRQUFDO1FBRXJFLE1BQU1DLE9BQU9mLElBQUlnQixFQUFFLENBQUNDLE1BQU0sQ0FDdEJoQixNQUNBO1lBQ0lpQixJQUFJbkI7WUFDSlU7WUFDQUU7WUFDQVEsTUFBTTtRQUNWO1FBQ0puQixJQUFJZ0IsRUFBRSxDQUFDSSxPQUFPLENBQUNMLE1BQU1NLEtBQUs7UUFDMUJsQixRQUFRQyxHQUFHLENBQUM7SUFDaEIsRUFBRSxPQUFPa0IsR0FBRztRQUNSbkIsUUFBUUMsR0FBRyxDQUFDO1FBQ1osTUFBTWtCO0lBQ1Y7QUFDSjtBQUVBcEIifQ==
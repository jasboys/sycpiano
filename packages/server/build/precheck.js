import * as dotenv from "dotenv";
dotenv.config({
    override: true
});
const required = [
    'PORT',
    'ADMIN_PORT',
    'HOST',
    'GAPI_KEY_SERVER',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_KEY',
    'COOKIE_SECRET',
    'PRODUCTS_DIR',
    'DKIM_PRIVATE_KEY_FILE',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USERNAME',
    'SMTP_PASSWORD',
    'GAPI_CLIENT_EMAIL',
    'GAPI_PRIVATE_KEY'
];
export const precheck = async ()=>{
    // Check DB stuff
    if (!process.env.DATABASE_URL) {
        const dbRequired = [
            'DB_USER',
            'DB_PASS'
        ];
        dbRequired.forEach((key)=>{
            const value = process.env[key];
            if (!value) {
                throw Error(`${key} is not defined, nor DB_URL`);
            }
        });
    }
    required.forEach((key)=>{
        const value = process.env[key];
        if (!value) {
            throw Error(`${key} is not defined.`);
        }
    });
// run migrations!
// await umzug.up();
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wcmVjaGVjay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBkb3RlbnYgZnJvbSAnZG90ZW52JztcblxuZG90ZW52LmNvbmZpZyh7IG92ZXJyaWRlOiB0cnVlIH0pO1xuXG5jb25zdCByZXF1aXJlZCA9IFtcbiAgICAnUE9SVCcsXG4gICAgJ0FETUlOX1BPUlQnLFxuICAgICdIT1NUJyxcbiAgICAnR0FQSV9LRVlfU0VSVkVSJyxcbiAgICAnU1RSSVBFX1NFQ1JFVF9LRVknLFxuICAgICdTVFJJUEVfV0VCSE9PS19LRVknLFxuICAgICdDT09LSUVfU0VDUkVUJyxcbiAgICAnUFJPRFVDVFNfRElSJyxcbiAgICAnREtJTV9QUklWQVRFX0tFWV9GSUxFJyxcbiAgICAnU01UUF9IT1NUJyxcbiAgICAnU01UUF9QT1JUJyxcbiAgICAnU01UUF9VU0VSTkFNRScsXG4gICAgJ1NNVFBfUEFTU1dPUkQnLFxuICAgICdHQVBJX0NMSUVOVF9FTUFJTCcsXG4gICAgJ0dBUElfUFJJVkFURV9LRVknXG5dO1xuXG5leHBvcnQgY29uc3QgcHJlY2hlY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgLy8gQ2hlY2sgREIgc3R1ZmZcbiAgICBpZiAoIXByb2Nlc3MuZW52LkRBVEFCQVNFX1VSTCkge1xuICAgICAgICBjb25zdCBkYlJlcXVpcmVkID0gWydEQl9VU0VSJywgJ0RCX1BBU1MnXTtcbiAgICAgICAgZGJSZXF1aXJlZC5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcHJvY2Vzcy5lbnZba2V5XTtcbiAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihgJHtrZXl9IGlzIG5vdCBkZWZpbmVkLCBub3IgREJfVVJMYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXF1aXJlZC5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBwcm9jZXNzLmVudltrZXldO1xuICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcihgJHtrZXl9IGlzIG5vdCBkZWZpbmVkLmApO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBydW4gbWlncmF0aW9ucyFcbiAgICAvLyBhd2FpdCB1bXp1Zy51cCgpO1xufTtcbiJdLCJuYW1lcyI6WyJkb3RlbnYiLCJjb25maWciLCJvdmVycmlkZSIsInJlcXVpcmVkIiwicHJlY2hlY2siLCJwcm9jZXNzIiwiZW52IiwiREFUQUJBU0VfVVJMIiwiZGJSZXF1aXJlZCIsImZvckVhY2giLCJrZXkiLCJ2YWx1ZSIsIkVycm9yIl0sIm1hcHBpbmdzIjoiQUFBQSxZQUFZQSxZQUFZLFNBQVM7QUFFakNBLE9BQU9DLE1BQU0sQ0FBQztJQUFFQyxVQUFVO0FBQUs7QUFFL0IsTUFBTUMsV0FBVztJQUNiO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtDQUNIO0FBRUQsT0FBTyxNQUFNQyxXQUFXO0lBQ3BCLGlCQUFpQjtJQUNqQixJQUFJLENBQUNDLFFBQVFDLEdBQUcsQ0FBQ0MsWUFBWSxFQUFFO1FBQzNCLE1BQU1DLGFBQWE7WUFBQztZQUFXO1NBQVU7UUFDekNBLFdBQVdDLE9BQU8sQ0FBQyxDQUFDQztZQUNoQixNQUFNQyxRQUFRTixRQUFRQyxHQUFHLENBQUNJLElBQUk7WUFDOUIsSUFBSSxDQUFDQyxPQUFPO2dCQUNSLE1BQU1DLE1BQU0sQ0FBQyxFQUFFRixJQUFJLDJCQUEyQixDQUFDO1lBQ25EO1FBQ0o7SUFDSjtJQUNBUCxTQUFTTSxPQUFPLENBQUMsQ0FBQ0M7UUFDZCxNQUFNQyxRQUFRTixRQUFRQyxHQUFHLENBQUNJLElBQUk7UUFDOUIsSUFBSSxDQUFDQyxPQUFPO1lBQ1IsTUFBTUMsTUFBTSxDQUFDLEVBQUVGLElBQUksZ0JBQWdCLENBQUM7UUFDeEM7SUFDSjtBQUVBLGtCQUFrQjtBQUNsQixvQkFBb0I7QUFDeEIsRUFBRSJ9
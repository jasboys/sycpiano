import root from "app-root-path";
import archiver from "archiver";
import { getYear } from "date-fns";
import { promises as fsAsync, readFileSync } from "fs";
import mustache from "mustache";
import * as nodemailer from "nodemailer";
import * as path from "path";
import orm from "./database.js";
import { Product } from "./models/Product.js";
if (process.env.SMTP_HOST === undefined || process.env.SMTP_PASSWORD === undefined || process.env.SMTP_PORT === undefined || process.env.SMTP_USERNAME === undefined || process.env.SMTP_PASSWORD === undefined || process.env.DKIM_PRIVATE_KEY_FILE === undefined || process.env.IMAGE_ASSETS_DIR === undefined || process.env.PRODUCTS_DIR === undefined) {
    throw new Error('Missing env vars');
}
const transportOptions = {
    host: process.env.SMTP_HOST,
    secure: parseInt(process.env.SMTP_PORT) === 465 ? true : false,
    port: parseInt(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    },
    dkim: {
        domainName: 'seanchenpiano.com',
        keySelector: 'email',
        privateKey: readFileSync(path.resolve(process.env.DKIM_PRIVATE_KEY_FILE), 'utf8')
    }
};
export const duplicateEmailNotification = async (username)=>{
    if (process.env.IMAGE_ASSETS_DIR === undefined) {
        throw new Error('Missing env vars');
    }
    const transport = nodemailer.createTransport(transportOptions);
    const attachments = [
        {
            filename: 'logo.png',
            path: path.resolve(process.env.IMAGE_ASSETS_DIR, 'email_logo.png'),
            cid: 'logo@seanchenpiano.com'
        }
    ];
    const template = await fsAsync.readFile(path.resolve(root.toString(), 'web/partials', 'notificationEmail.html'), 'utf8');
    const html = mustache.render(template, {
        username,
        notification: `Someone attempted to open an account with this existing email address. If you need to reset your password, please click on 'reset password' on the login modal. If you have any questions, reply to this email or email seanchen@seanchenpiano.com.`,
        year: getYear(new Date())
    });
    const message = {
        from: 'Sean Chen Piano <seanchen@seanchenpiano.com>',
        replyTo: 'seanchen@seanchenpiano.com',
        to: username,
        subject: `[Sean Chen Piano] Duplicate Account Registration`,
        html,
        attachments
    };
    const result = await transport.sendMail(message);
    if (process.env.NODE_ENV === 'development') {
        console.log(username);
        console.log(attachments);
        console.log(result);
    }
};
export const emailRegisterNotification = async (username)=>{
    if (process.env.IMAGE_ASSETS_DIR === undefined) {
        throw new Error('Missing env vars');
    }
    const transport = nodemailer.createTransport(transportOptions);
    const attachments = [
        {
            filename: 'logo.png',
            path: path.resolve(process.env.IMAGE_ASSETS_DIR, 'email_logo.png'),
            cid: 'logo@seanchenpiano.com'
        }
    ];
    const template = await fsAsync.readFile(path.resolve(root.toString(), 'web/partials', 'notificationEmail.html'), 'utf8');
    const html = mustache.render(template, {
        username,
        notification: `Thank you for registering an account with Sean Chen Piano. Once you purchase scores, they will be downloadable from the website when logged in. You will also receive an email with the scores upon purchase.`,
        year: getYear(new Date())
    });
    const message = {
        from: 'Sean Chen Piano <seanchen@seanchenpiano.com>',
        replyTo: 'seanchen@seanchenpiano.com',
        to: username,
        subject: `[Sean Chen Piano] Account Registration`,
        html,
        attachments
    };
    const result = await transport.sendMail(message);
    if (process.env.NODE_ENV === 'development') {
        console.log(username);
        console.log(attachments);
        console.log(result);
    }
};
// To email a manual request, omit clientRef (or pass falsey value)
export const emailPDFs = async (productIDs, email, clientRef)=>{
    try {
        if (process.env.PRODUCTS_DIR === undefined || process.env.IMAGE_ASSETS_DIR === undefined) {
            throw new Error('Missing env vars');
        }
        const transport = nodemailer.createTransport(transportOptions);
        const products = await orm.em.find(Product, {
            id: {
                $in: productIDs
            }
        });
        let attachments = [
            {
                filename: 'logo.png',
                path: path.resolve(process.env.IMAGE_ASSETS_DIR, 'email_logo.png'),
                cid: 'logo@seanchenpiano.com'
            }
        ];
        if (products.length === 1) {
            attachments = [
                ...attachments,
                {
                    filename: products[0].file,
                    path: path.resolve(process.env.PRODUCTS_DIR, products[0].file)
                }
            ];
        } else {
            const zip = archiver('zip', {
                zlib: {
                    level: 9
                }
            });
            zip.on('warning', function(err) {
                if (err.code === 'ENOENT') {
                    // log warning
                    console.error(err);
                } else {
                    // throw error
                    throw err;
                }
            });
            // good practice to catch this error explicitly
            zip.on('error', function(err) {
                throw err;
            });
            products.forEach((prod)=>{
                zip.file(path.resolve(process.env.PRODUCTS_DIR, prod.file), {
                    name: prod.file
                });
            });
            await zip.finalize();
            attachments = [
                ...attachments,
                {
                    filename: 'seanchenpiano_scores.zip',
                    content: zip
                }
            ];
        }
        const template = await fsAsync.readFile(path.resolve(root.toString(), 'web/partials', 'purchaseEmail.html'), 'utf8');
        const html = mustache.render(template, {
            products: products.map((prod)=>prod.name),
            clientRef,
            year: getYear(new Date())
        });
        const message = {
            from: 'Sean Chen Piano <seanchen@seanchenpiano.com>',
            replyTo: 'seanchen@seanchenpiano.com',
            to: email,
            subject: `[Sean Chen Piano] ${clientRef ? 'Your recent' : 'Your request for previously'} purchased PDFs from seanchenpiano.com.`,
            html,
            attachments
        };
        const result = await transport.sendMail(message);
        if (process.env.NODE_ENV === 'development') {
            console.log(email);
            console.log(attachments);
            console.log(result);
        }
    } catch (e) {
        console.error(e);
    }
}; //     console.log(nodemailer.getTestMessageUrl(result));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWlsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJvb3QgZnJvbSAnYXBwLXJvb3QtcGF0aCc7XHJcbmltcG9ydCBhcmNoaXZlciBmcm9tICdhcmNoaXZlcic7XHJcbmltcG9ydCB7IGdldFllYXIgfSBmcm9tICdkYXRlLWZucyc7XHJcbmltcG9ydCB7IHByb21pc2VzIGFzIGZzQXN5bmMsIHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IG11c3RhY2hlIGZyb20gJ211c3RhY2hlJztcclxuaW1wb3J0ICogYXMgbm9kZW1haWxlciBmcm9tICdub2RlbWFpbGVyJztcclxuaW1wb3J0IHsgQXR0YWNobWVudCB9IGZyb20gJ25vZGVtYWlsZXIvbGliL21haWxlcic7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCBvcm0gZnJvbSAnLi9kYXRhYmFzZS5qcyc7XHJcbmltcG9ydCB7IFByb2R1Y3QgfSBmcm9tICcuL21vZGVscy9Qcm9kdWN0LmpzJztcclxuXHJcbmlmIChwcm9jZXNzLmVudi5TTVRQX0hPU1QgPT09IHVuZGVmaW5lZCB8fFxyXG4gICAgcHJvY2Vzcy5lbnYuU01UUF9QQVNTV09SRCA9PT0gdW5kZWZpbmVkIHx8XHJcbiAgICBwcm9jZXNzLmVudi5TTVRQX1BPUlQgPT09IHVuZGVmaW5lZCB8fFxyXG4gICAgcHJvY2Vzcy5lbnYuU01UUF9VU0VSTkFNRSA9PT0gdW5kZWZpbmVkIHx8XHJcbiAgICBwcm9jZXNzLmVudi5TTVRQX1BBU1NXT1JEID09PSB1bmRlZmluZWQgfHxcclxuICAgIHByb2Nlc3MuZW52LkRLSU1fUFJJVkFURV9LRVlfRklMRSA9PT0gdW5kZWZpbmVkIHx8XHJcbiAgICBwcm9jZXNzLmVudi5JTUFHRV9BU1NFVFNfRElSID09PSB1bmRlZmluZWQgfHxcclxuICAgIHByb2Nlc3MuZW52LlBST0RVQ1RTX0RJUiA9PT0gdW5kZWZpbmVkXHJcbikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGVudiB2YXJzJyk7XHJcbn1cclxuXHJcbmNvbnN0IHRyYW5zcG9ydE9wdGlvbnMgPSB7XHJcbiAgICBob3N0OiBwcm9jZXNzLmVudi5TTVRQX0hPU1QsXHJcbiAgICBzZWN1cmU6IHBhcnNlSW50KHByb2Nlc3MuZW52LlNNVFBfUE9SVCkgPT09IDQ2NSA/IHRydWUgOiBmYWxzZSxcclxuICAgIHBvcnQ6IHBhcnNlSW50KHByb2Nlc3MuZW52LlNNVFBfUE9SVCksXHJcbiAgICBhdXRoOiB7XHJcbiAgICAgICAgdXNlcjogcHJvY2Vzcy5lbnYuU01UUF9VU0VSTkFNRSxcclxuICAgICAgICBwYXNzOiBwcm9jZXNzLmVudi5TTVRQX1BBU1NXT1JELFxyXG4gICAgfSxcclxuICAgIGRraW06IHtcclxuICAgICAgICBkb21haW5OYW1lOiAnc2VhbmNoZW5waWFuby5jb20nLFxyXG4gICAgICAgIGtleVNlbGVjdG9yOiAnZW1haWwnLFxyXG4gICAgICAgIHByaXZhdGVLZXk6IHJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUocHJvY2Vzcy5lbnYuREtJTV9QUklWQVRFX0tFWV9GSUxFKSwgJ3V0ZjgnKSxcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZHVwbGljYXRlRW1haWxOb3RpZmljYXRpb24gPSBhc3luYyAodXNlcm5hbWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4gPT4ge1xyXG4gICAgaWYgKFxyXG4gICAgICAgIHByb2Nlc3MuZW52LklNQUdFX0FTU0VUU19ESVIgPT09IHVuZGVmaW5lZFxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGVudiB2YXJzJyk7XHJcbiAgICB9XHJcbiAgICBjb25zdCB0cmFuc3BvcnQgPSBub2RlbWFpbGVyLmNyZWF0ZVRyYW5zcG9ydCh0cmFuc3BvcnRPcHRpb25zKTtcclxuICAgIGNvbnN0IGF0dGFjaG1lbnRzOiB7XHJcbiAgICAgICAgZmlsZW5hbWU6IHN0cmluZztcclxuICAgICAgICBwYXRoOiBzdHJpbmc7XHJcbiAgICAgICAgY2lkPzogc3RyaW5nO1xyXG4gICAgfVtdID0gW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogJ2xvZ28ucG5nJyxcclxuICAgICAgICAgICAgICAgIHBhdGg6IHBhdGgucmVzb2x2ZShwcm9jZXNzLmVudi5JTUFHRV9BU1NFVFNfRElSLCAnZW1haWxfbG9nby5wbmcnKSxcclxuICAgICAgICAgICAgICAgIGNpZDogJ2xvZ29Ac2VhbmNoZW5waWFuby5jb20nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgY29uc3QgdGVtcGxhdGUgPSBhd2FpdCBmc0FzeW5jLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShyb290LnRvU3RyaW5nKCksICd3ZWIvcGFydGlhbHMnLCAnbm90aWZpY2F0aW9uRW1haWwuaHRtbCcpLCAndXRmOCcpO1xyXG5cclxuICAgIGNvbnN0IGh0bWwgPSBtdXN0YWNoZS5yZW5kZXIodGVtcGxhdGUsIHtcclxuICAgICAgICB1c2VybmFtZSxcclxuICAgICAgICBub3RpZmljYXRpb246IGBTb21lb25lIGF0dGVtcHRlZCB0byBvcGVuIGFuIGFjY291bnQgd2l0aCB0aGlzIGV4aXN0aW5nIGVtYWlsIGFkZHJlc3MuIElmIHlvdSBuZWVkIHRvIHJlc2V0IHlvdXIgcGFzc3dvcmQsIHBsZWFzZSBjbGljayBvbiAncmVzZXQgcGFzc3dvcmQnIG9uIHRoZSBsb2dpbiBtb2RhbC4gSWYgeW91IGhhdmUgYW55IHF1ZXN0aW9ucywgcmVwbHkgdG8gdGhpcyBlbWFpbCBvciBlbWFpbCBzZWFuY2hlbkBzZWFuY2hlbnBpYW5vLmNvbS5gLFxyXG4gICAgICAgIHllYXI6IGdldFllYXIobmV3IERhdGUoKSksXHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgY29uc3QgbWVzc2FnZTogbm9kZW1haWxlci5TZW5kTWFpbE9wdGlvbnMgPSB7XHJcbiAgICAgICAgZnJvbTogJ1NlYW4gQ2hlbiBQaWFubyA8c2VhbmNoZW5Ac2VhbmNoZW5waWFuby5jb20+JyxcclxuICAgICAgICByZXBseVRvOiAnc2VhbmNoZW5Ac2VhbmNoZW5waWFuby5jb20nLFxyXG4gICAgICAgIHRvOiB1c2VybmFtZSxcclxuICAgICAgICBzdWJqZWN0OiBgW1NlYW4gQ2hlbiBQaWFub10gRHVwbGljYXRlIEFjY291bnQgUmVnaXN0cmF0aW9uYCxcclxuICAgICAgICBodG1sLFxyXG4gICAgICAgIGF0dGFjaG1lbnRzLFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0cmFuc3BvcnQuc2VuZE1haWwobWVzc2FnZSk7XHJcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyh1c2VybmFtZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYXR0YWNobWVudHMpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBlbWFpbFJlZ2lzdGVyTm90aWZpY2F0aW9uID0gYXN5bmMgKHVzZXJuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+ID0+IHtcclxuICAgIGlmIChcclxuICAgICAgICBwcm9jZXNzLmVudi5JTUFHRV9BU1NFVFNfRElSID09PSB1bmRlZmluZWRcclxuICAgICkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBlbnYgdmFycycpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgdHJhbnNwb3J0ID0gbm9kZW1haWxlci5jcmVhdGVUcmFuc3BvcnQodHJhbnNwb3J0T3B0aW9ucyk7XHJcbiAgICBjb25zdCBhdHRhY2htZW50czoge1xyXG4gICAgICAgIGZpbGVuYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgcGF0aDogc3RyaW5nO1xyXG4gICAgICAgIGNpZD86IHN0cmluZztcclxuICAgIH1bXSA9IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6ICdsb2dvLnBuZycsXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBwYXRoLnJlc29sdmUocHJvY2Vzcy5lbnYuSU1BR0VfQVNTRVRTX0RJUiwgJ2VtYWlsX2xvZ28ucG5nJyksXHJcbiAgICAgICAgICAgICAgICBjaWQ6ICdsb2dvQHNlYW5jaGVucGlhbm8uY29tJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBdO1xyXG5cclxuICAgIGNvbnN0IHRlbXBsYXRlID0gYXdhaXQgZnNBc3luYy5yZWFkRmlsZShwYXRoLnJlc29sdmUocm9vdC50b1N0cmluZygpLCAnd2ViL3BhcnRpYWxzJywgJ25vdGlmaWNhdGlvbkVtYWlsLmh0bWwnKSwgJ3V0ZjgnKTtcclxuXHJcbiAgICBjb25zdCBodG1sID0gbXVzdGFjaGUucmVuZGVyKHRlbXBsYXRlLCB7XHJcbiAgICAgICAgdXNlcm5hbWUsXHJcbiAgICAgICAgbm90aWZpY2F0aW9uOiBgVGhhbmsgeW91IGZvciByZWdpc3RlcmluZyBhbiBhY2NvdW50IHdpdGggU2VhbiBDaGVuIFBpYW5vLiBPbmNlIHlvdSBwdXJjaGFzZSBzY29yZXMsIHRoZXkgd2lsbCBiZSBkb3dubG9hZGFibGUgZnJvbSB0aGUgd2Vic2l0ZSB3aGVuIGxvZ2dlZCBpbi4gWW91IHdpbGwgYWxzbyByZWNlaXZlIGFuIGVtYWlsIHdpdGggdGhlIHNjb3JlcyB1cG9uIHB1cmNoYXNlLmAsXHJcbiAgICAgICAgeWVhcjogZ2V0WWVhcihuZXcgRGF0ZSgpKSxcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICBjb25zdCBtZXNzYWdlOiBub2RlbWFpbGVyLlNlbmRNYWlsT3B0aW9ucyA9IHtcclxuICAgICAgICBmcm9tOiAnU2VhbiBDaGVuIFBpYW5vIDxzZWFuY2hlbkBzZWFuY2hlbnBpYW5vLmNvbT4nLFxyXG4gICAgICAgIHJlcGx5VG86ICdzZWFuY2hlbkBzZWFuY2hlbnBpYW5vLmNvbScsXHJcbiAgICAgICAgdG86IHVzZXJuYW1lLFxyXG4gICAgICAgIHN1YmplY3Q6IGBbU2VhbiBDaGVuIFBpYW5vXSBBY2NvdW50IFJlZ2lzdHJhdGlvbmAsXHJcbiAgICAgICAgaHRtbCxcclxuICAgICAgICBhdHRhY2htZW50cyxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdHJhbnNwb3J0LnNlbmRNYWlsKG1lc3NhZ2UpO1xyXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2codXNlcm5hbWUpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGF0dGFjaG1lbnRzKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gVG8gZW1haWwgYSBtYW51YWwgcmVxdWVzdCwgb21pdCBjbGllbnRSZWYgKG9yIHBhc3MgZmFsc2V5IHZhbHVlKVxyXG5leHBvcnQgY29uc3QgZW1haWxQREZzID0gYXN5bmMgKHByb2R1Y3RJRHM6IHN0cmluZ1tdLCBlbWFpbDogc3RyaW5nLCBjbGllbnRSZWY/OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+ID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52LlBST0RVQ1RTX0RJUiA9PT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICAgIHByb2Nlc3MuZW52LklNQUdFX0FTU0VUU19ESVIgPT09IHVuZGVmaW5lZFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZW52IHZhcnMnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdHJhbnNwb3J0ID0gbm9kZW1haWxlci5jcmVhdGVUcmFuc3BvcnQodHJhbnNwb3J0T3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGNvbnN0IHByb2R1Y3RzID0gYXdhaXQgb3JtLmVtLmZpbmQoXHJcbiAgICAgICAgICAgIFByb2R1Y3QsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGluOiBwcm9kdWN0SURzLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBsZXQgYXR0YWNobWVudHM6IEF0dGFjaG1lbnRbXSA9IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6ICdsb2dvLnBuZycsXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBwYXRoLnJlc29sdmUocHJvY2Vzcy5lbnYuSU1BR0VfQVNTRVRTX0RJUiwgJ2VtYWlsX2xvZ28ucG5nJyksXHJcbiAgICAgICAgICAgICAgICBjaWQ6ICdsb2dvQHNlYW5jaGVucGlhbm8uY29tJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBdO1xyXG4gICAgICAgIGlmIChwcm9kdWN0cy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgYXR0YWNobWVudHMgPSBbXHJcbiAgICAgICAgICAgICAgICAuLi5hdHRhY2htZW50cyxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogcHJvZHVjdHNbMF0uZmlsZSxcclxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBwYXRoLnJlc29sdmUocHJvY2Vzcy5lbnYuUFJPRFVDVFNfRElSLCBwcm9kdWN0c1swXS5maWxlKSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgemlwID0gYXJjaGl2ZXIoJ3ppcCcsIHtcclxuICAgICAgICAgICAgICAgIHpsaWI6IHsgbGV2ZWw6IDkgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHppcC5vbignd2FybmluZycsIGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIuY29kZSA9PT0gJ0VOT0VOVCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBsb2cgd2FybmluZ1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhyb3cgZXJyb3JcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gZ29vZCBwcmFjdGljZSB0byBjYXRjaCB0aGlzIGVycm9yIGV4cGxpY2l0bHlcclxuICAgICAgICAgICAgemlwLm9uKCdlcnJvcicsIGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBwcm9kdWN0cy5mb3JFYWNoKChwcm9kKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB6aXAuZmlsZShwYXRoLnJlc29sdmUocHJvY2Vzcy5lbnYuUFJPRFVDVFNfRElSISwgcHJvZC5maWxlKSwgeyBuYW1lOiBwcm9kLmZpbGUgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBhd2FpdCB6aXAuZmluYWxpemUoKTtcclxuICAgICAgICAgICAgYXR0YWNobWVudHMgPSBbXHJcbiAgICAgICAgICAgICAgICAuLi5hdHRhY2htZW50cyxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogJ3NlYW5jaGVucGlhbm9fc2NvcmVzLnppcCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogemlwLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gYXdhaXQgZnNBc3luYy5yZWFkRmlsZShwYXRoLnJlc29sdmUocm9vdC50b1N0cmluZygpLCAnd2ViL3BhcnRpYWxzJywgJ3B1cmNoYXNlRW1haWwuaHRtbCcpLCAndXRmOCcpO1xyXG5cclxuICAgICAgICBjb25zdCBodG1sID0gbXVzdGFjaGUucmVuZGVyKHRlbXBsYXRlLCB7XHJcbiAgICAgICAgICAgIHByb2R1Y3RzOiBwcm9kdWN0cy5tYXAoKHByb2QpID0+IHByb2QubmFtZSksXHJcbiAgICAgICAgICAgIGNsaWVudFJlZixcclxuICAgICAgICAgICAgeWVhcjogZ2V0WWVhcihuZXcgRGF0ZSgpKSxcclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIGNvbnN0IG1lc3NhZ2U6IG5vZGVtYWlsZXIuU2VuZE1haWxPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBmcm9tOiAnU2VhbiBDaGVuIFBpYW5vIDxzZWFuY2hlbkBzZWFuY2hlbnBpYW5vLmNvbT4nLFxyXG4gICAgICAgICAgICByZXBseVRvOiAnc2VhbmNoZW5Ac2VhbmNoZW5waWFuby5jb20nLFxyXG4gICAgICAgICAgICB0bzogZW1haWwsXHJcbiAgICAgICAgICAgIHN1YmplY3Q6IGBbU2VhbiBDaGVuIFBpYW5vXSAke2NsaWVudFJlZiA/ICdZb3VyIHJlY2VudCcgOiAnWW91ciByZXF1ZXN0IGZvciBwcmV2aW91c2x5J30gcHVyY2hhc2VkIFBERnMgZnJvbSBzZWFuY2hlbnBpYW5vLmNvbS5gLFxyXG4gICAgICAgICAgICBodG1sLFxyXG4gICAgICAgICAgICBhdHRhY2htZW50cyxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0cmFuc3BvcnQuc2VuZE1haWwobWVzc2FnZSk7XHJcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVtYWlsKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYXR0YWNobWVudHMpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgfVxyXG59O1xyXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKG5vZGVtYWlsZXIuZ2V0VGVzdE1lc3NhZ2VVcmwocmVzdWx0KSk7Il0sIm5hbWVzIjpbInJvb3QiLCJhcmNoaXZlciIsImdldFllYXIiLCJwcm9taXNlcyIsImZzQXN5bmMiLCJyZWFkRmlsZVN5bmMiLCJtdXN0YWNoZSIsIm5vZGVtYWlsZXIiLCJwYXRoIiwib3JtIiwiUHJvZHVjdCIsInByb2Nlc3MiLCJlbnYiLCJTTVRQX0hPU1QiLCJ1bmRlZmluZWQiLCJTTVRQX1BBU1NXT1JEIiwiU01UUF9QT1JUIiwiU01UUF9VU0VSTkFNRSIsIkRLSU1fUFJJVkFURV9LRVlfRklMRSIsIklNQUdFX0FTU0VUU19ESVIiLCJQUk9EVUNUU19ESVIiLCJFcnJvciIsInRyYW5zcG9ydE9wdGlvbnMiLCJob3N0Iiwic2VjdXJlIiwicGFyc2VJbnQiLCJwb3J0IiwiYXV0aCIsInVzZXIiLCJwYXNzIiwiZGtpbSIsImRvbWFpbk5hbWUiLCJrZXlTZWxlY3RvciIsInByaXZhdGVLZXkiLCJyZXNvbHZlIiwiZHVwbGljYXRlRW1haWxOb3RpZmljYXRpb24iLCJ1c2VybmFtZSIsInRyYW5zcG9ydCIsImNyZWF0ZVRyYW5zcG9ydCIsImF0dGFjaG1lbnRzIiwiZmlsZW5hbWUiLCJjaWQiLCJ0ZW1wbGF0ZSIsInJlYWRGaWxlIiwidG9TdHJpbmciLCJodG1sIiwicmVuZGVyIiwibm90aWZpY2F0aW9uIiwieWVhciIsIkRhdGUiLCJtZXNzYWdlIiwiZnJvbSIsInJlcGx5VG8iLCJ0byIsInN1YmplY3QiLCJyZXN1bHQiLCJzZW5kTWFpbCIsIk5PREVfRU5WIiwiY29uc29sZSIsImxvZyIsImVtYWlsUmVnaXN0ZXJOb3RpZmljYXRpb24iLCJlbWFpbFBERnMiLCJwcm9kdWN0SURzIiwiZW1haWwiLCJjbGllbnRSZWYiLCJwcm9kdWN0cyIsImVtIiwiZmluZCIsImlkIiwiJGluIiwibGVuZ3RoIiwiZmlsZSIsInppcCIsInpsaWIiLCJsZXZlbCIsIm9uIiwiZXJyIiwiY29kZSIsImVycm9yIiwiZm9yRWFjaCIsInByb2QiLCJuYW1lIiwiZmluYWxpemUiLCJjb250ZW50IiwibWFwIiwiZSJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBT0EsVUFBVSxnQkFBZ0I7QUFDakMsT0FBT0MsY0FBYyxXQUFXO0FBQ2hDLFNBQVNDLE9BQU8sUUFBUSxXQUFXO0FBQ25DLFNBQVNDLFlBQVlDLE9BQU8sRUFBRUMsWUFBWSxRQUFRLEtBQUs7QUFDdkQsT0FBT0MsY0FBYyxXQUFXO0FBQ2hDLFlBQVlDLGdCQUFnQixhQUFhO0FBRXpDLFlBQVlDLFVBQVUsT0FBTztBQUM3QixPQUFPQyxTQUFTLGdCQUFnQjtBQUNoQyxTQUFTQyxPQUFPLFFBQVEsc0JBQXNCO0FBRTlDLElBQUlDLFFBQVFDLEdBQUcsQ0FBQ0MsU0FBUyxLQUFLQyxhQUMxQkgsUUFBUUMsR0FBRyxDQUFDRyxhQUFhLEtBQUtELGFBQzlCSCxRQUFRQyxHQUFHLENBQUNJLFNBQVMsS0FBS0YsYUFDMUJILFFBQVFDLEdBQUcsQ0FBQ0ssYUFBYSxLQUFLSCxhQUM5QkgsUUFBUUMsR0FBRyxDQUFDRyxhQUFhLEtBQUtELGFBQzlCSCxRQUFRQyxHQUFHLENBQUNNLHFCQUFxQixLQUFLSixhQUN0Q0gsUUFBUUMsR0FBRyxDQUFDTyxnQkFBZ0IsS0FBS0wsYUFDakNILFFBQVFDLEdBQUcsQ0FBQ1EsWUFBWSxLQUFLTixXQUMvQjtJQUNFLE1BQU0sSUFBSU8sTUFBTTtBQUNwQjtBQUVBLE1BQU1DLG1CQUFtQjtJQUNyQkMsTUFBTVosUUFBUUMsR0FBRyxDQUFDQyxTQUFTO0lBQzNCVyxRQUFRQyxTQUFTZCxRQUFRQyxHQUFHLENBQUNJLFNBQVMsTUFBTSxNQUFNLE9BQU87SUFDekRVLE1BQU1ELFNBQVNk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
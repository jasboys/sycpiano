import * as nodemailer from 'nodemailer';
import db from './models';
import { Op } from 'sequelize';
import * as path from 'path';
import * as mustache from 'mustache';
import { promises as fsAsync, readFileSync } from 'fs';
import * as root from 'app-root-path';
import { getYear } from 'date-fns';
import * as archiver from 'archiver';
import { Attachment } from 'nodemailer/lib/mailer';

const models = db.models;

if (process.env.SMTP_HOST === undefined ||
    process.env.SMTP_PASSWORD === undefined ||
    process.env.SMTP_PORT === undefined ||
    process.env.SMTP_USERNAME === undefined ||
    process.env.SMTP_PASSWORD === undefined ||
    process.env.DKIM_PRIVATE_KEY_FILE === undefined ||
    process.env.IMAGE_ASSETS_DIR === undefined ||
    process.env.PRODUCTS_DIR === undefined
) {
    throw new Error('Missing env vars');
}

const transportOptions = {
    host: process.env.SMTP_HOST,
    secure: parseInt(process.env.SMTP_PORT) === 465 ? true : false,
    port: parseInt(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
    dkim: {
        domainName: 'seanchenpiano.com',
        keySelector: 'email',
        privateKey: readFileSync(path.resolve(process.env.DKIM_PRIVATE_KEY_FILE), 'utf8'),
    },
};

export const duplicateEmailNotification = async (username: string): Promise<void> => {
    if (
        process.env.IMAGE_ASSETS_DIR === undefined
    ) {
        throw new Error('Missing env vars');
    }
    const transport = nodemailer.createTransport(transportOptions);
    const attachments: {
        filename: string;
        path: string;
        cid?: string;
    }[] = [
            {
                filename: 'logo.png',
                path: path.resolve(process.env.IMAGE_ASSETS_DIR, 'email_logo.png'),
                cid: 'logo@seanchenpiano.com',
            },
        ];

    const template = await fsAsync.readFile(path.resolve(root.toString(), 'web/partials', 'notificationEmail.html'), 'utf8');

    const html = mustache.render(template, {
        username,
        notification: `Someone attempted to open an account with this existing email address. If you need to reset your password, please click on 'reset password' on the login modal. If you have any questions, reply to this email or email seanchen@seanchenpiano.com.`,
        year: getYear(new Date()),
    });


    const message: nodemailer.SendMailOptions = {
        from: 'Sean Chen Piano <seanchen@seanchenpiano.com>',
        replyTo: 'seanchen@seanchenpiano.com',
        to: username,
        subject: `[Sean Chen Piano] Duplicate Account Registration`,
        html,
        attachments,
    };

    const result = await transport.sendMail(message);
    if (process.env.NODE_ENV === 'development') {
        console.log(username);
        console.log(attachments);
        console.log(result);
    }
}

export const emailRegisterNotification = async (username: string): Promise<void> => {
    if (
        process.env.IMAGE_ASSETS_DIR === undefined
    ) {
        throw new Error('Missing env vars');
    }
    const transport = nodemailer.createTransport(transportOptions);
    const attachments: {
        filename: string;
        path: string;
        cid?: string;
    }[] = [
            {
                filename: 'logo.png',
                path: path.resolve(process.env.IMAGE_ASSETS_DIR, 'email_logo.png'),
                cid: 'logo@seanchenpiano.com',
            },
        ];

    const template = await fsAsync.readFile(path.resolve(root.toString(), 'web/partials', 'notificationEmail.html'), 'utf8');

    const html = mustache.render(template, {
        username,
        notification: `Thank you for registering an account with Sean Chen Piano. Once you purchase scores, they will be downloadable from the website when logged in. You will also receive an email with the scores upon purchase.`,
        year: getYear(new Date()),
    });


    const message: nodemailer.SendMailOptions = {
        from: 'Sean Chen Piano <seanchen@seanchenpiano.com>',
        replyTo: 'seanchen@seanchenpiano.com',
        to: username,
        subject: `[Sean Chen Piano] Account Registration`,
        html,
        attachments,
    };

    const result = await transport.sendMail(message);
    if (process.env.NODE_ENV === 'development') {
        console.log(username);
        console.log(attachments);
        console.log(result);
    }
};

// To email a manual request, omit clientRef (or pass falsey value)
export const emailPDFs = async (productIDs: string[], email: string, clientRef?: string): Promise<void> => {
    try {
        if (process.env.PRODUCTS_DIR === undefined ||
            process.env.IMAGE_ASSETS_DIR === undefined
        ) {
            throw new Error('Missing env vars');
        }
        const transport = nodemailer.createTransport(transportOptions);

        const products = await models.product.findAll({
            attributes: ['id', 'file', 'name'],
            where: {
                id: {
                    [Op.in]: productIDs,
                },
            },
        });

        let attachments: Attachment[] = [
            {
                filename: 'logo.png',
                path: path.resolve(process.env.IMAGE_ASSETS_DIR, 'email_logo.png'),
                cid: 'logo@seanchenpiano.com',
            },
        ];
        if (products.length === 1) {
            attachments = [
                ...attachments,
                {
                    filename: products[0].file,
                    path: path.resolve(process.env.PRODUCTS_DIR, products[0].file),
                },
            ];
        } else {
            const zip = archiver('zip', {
                zlib: { level: 9 }
            });

            zip.on('warning', function (err) {
                if (err.code === 'ENOENT') {
                    // log warning
                    console.error(err);
                } else {
                    // throw error
                    throw err;
                }
            });

            // good practice to catch this error explicitly
            zip.on('error', function (err) {
                throw err;
            });

            products.forEach((prod) => {
                zip.file(path.resolve(process.env.PRODUCTS_DIR!, prod.file), { name: prod.file });
            });
            await zip.finalize();
            attachments = [
                ...attachments,
                {
                    filename: 'seanchenpiano_scores.zip',
                    content: zip,
                },
            ];
        }

        const template = await fsAsync.readFile(path.resolve(root.toString(), 'web/partials', 'purchaseEmail.html'), 'utf8');

        const html = mustache.render(template, {
            products: products.map((prod) => prod.name),
            clientRef,
            year: getYear(new Date()),
        });


        const message: nodemailer.SendMailOptions = {
            from: 'Sean Chen Piano <seanchen@seanchenpiano.com>',
            replyTo: 'seanchen@seanchenpiano.com',
            to: email,
            subject: `[Sean Chen Piano] ${clientRef ? 'Your recent' : 'Your request for previously'} purchased PDFs from seanchenpiano.com.`,
            html,
            attachments,
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
};
    //     console.log(nodemailer.getTestMessageUrl(result));
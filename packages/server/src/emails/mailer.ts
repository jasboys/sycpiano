import archiver from 'archiver';
import { getYear } from 'date-fns';
import mustache from 'mustache';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer/index.js';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import orm from '../database.js';
import { Product } from '../models/Product.js';

interface Mailer {
    duplicateEmailNotification: (username: string) => Promise<void>;
    emailRegisterNotification: (username: string) => Promise<void>;
    emailPDFs: (
        productIDs: string[],
        email: string,
        clientRef?: string,
    ) => Promise<void>;
}

class ConnectedMailer implements Mailer {
    private transporter?: nodemailer.Transporter;

    constructor() {
        if (
            process.env.SMTP_HOST === undefined ||
            process.env.SMTP_PASSWORD === undefined ||
            process.env.SMTP_PORT === undefined ||
            process.env.SMTP_USERNAME === undefined ||
            process.env.IMAGE_ASSETS_DIR === undefined ||
            process.env.PRODUCTS_DIR === undefined
        ) {
            throw new Error('Missing env vars');
        }
    }

    initialize = async (): Promise<ConnectedMailer> => {
        const transportOptions: SMTPTransport.Options = {
            host: process.env.SMTP_HOST,
            secure: Number.parseInt(process.env.SMTP_PORT) === 465,
            port: Number.parseInt(process.env.SMTP_PORT),
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            },
        };
        if (process.env.DKIM_PRIVATE_KEY_FILE && process.env.EMAIL_DOMAIN) {
            const privateKey = await readFile(
                path.resolve(process.env.DKIM_PRIVATE_KEY_FILE),
                'utf8',
            );
            transportOptions.dkim = {
                domainName: process.env.EMAIL_DOMAIN,
                keySelector: 'email',
                privateKey,
            };
        } else if (process.env.NODE_ENV === 'production') {
            console.warn(
                'Production env vars should include EMAIL_DOMAIN and DKIM_PRIVATE_KEY_FILE',
            );
        }
        this.transporter = nodemailer.createTransport(transportOptions);
        return this;
    };

    duplicateEmailNotification = async (username: string): Promise<void> => {
        if (process.env.IMAGE_ASSETS_DIR === undefined) {
            throw new Error('Missing env vars');
        }
        const attachments: Mail.Attachment[] = [
            {
                filename: 'logo.png',
                path: path.resolve(
                    process.env.IMAGE_ASSETS_DIR,
                    'email_logo.png',
                ),
                cid: 'logo@seanchenpiano.com',
            },
        ];

        const template = await readFile(
            path.resolve(process.env.PARTIALS_DIR, 'notificationEmail.html'),
            'utf8',
        );

        const html = mustache.render(template, {
            username,
            notification: `Someone attempted to open an account with this existing email address. If you need to reset your password, please click on 'reset password' on the login modal. If you have any questions, reply to this email or email seanchen@seanchenpiano.com.`,
            year: getYear(new Date()),
        });

        const message: nodemailer.SendMailOptions = {
            from: 'Sean Chen Piano <seanchen@seanchenpiano.com>',
            replyTo: 'seanchen@seanchenpiano.com',
            to: username,
            subject: '[Sean Chen Piano] Duplicate Account Registration',
            html,
            attachments,
        };

        const result = await this.transporter?.sendMail(message);
        if (process.env.NODE_ENV === 'development') {
            console.log(username);
            console.log(attachments);
            console.log(result);
        }
    };

    emailRegisterNotification = async (username: string): Promise<void> => {
        if (process.env.IMAGE_ASSETS_DIR === undefined) {
            throw new Error('Missing env vars');
        }
        const attachments: Mail.Attachment[] = [
            {
                filename: 'logo.png',
                path: path.resolve(
                    process.env.IMAGE_ASSETS_DIR,
                    'email_logo.png',
                ),
                cid: 'logo@seanchenpiano.com',
            },
        ];

        const template = await readFile(
            path.resolve(process.env.PARTIALS_DIR, 'notificationEmail.html'),
            'utf8',
        );

        const html = mustache.render(template, {
            username,
            notification:
                'Thank you for registering an account with Sean Chen Piano. Once you purchase scores, they will be downloadable from the website when logged in. You will also receive an email with the scores upon purchase.',
            year: getYear(new Date()),
        });

        const message: nodemailer.SendMailOptions = {
            from: 'Sean Chen Piano <seanchen@seanchenpiano.com>',
            replyTo: 'seanchen@seanchenpiano.com',
            to: username,
            subject: '[Sean Chen Piano] Account Registration',
            html,
            attachments,
        };

        const result = await this.transporter?.sendMail(message);
        if (process.env.NODE_ENV === 'development') {
            console.log(username);
            console.log(attachments);
            console.log(result);
        }
    };

    emailPDFs = async (
        productIDs: string[],
        email: string,
        clientRef?: string,
    ): Promise<void> => {
        try {
            if (
                process.env.PRODUCTS_DIR === undefined ||
                process.env.IMAGE_ASSETS_DIR === undefined
            ) {
                throw new Error('Missing env vars');
            }

            const products = await orm.em.find(Product, {
                id: {
                    $in: productIDs,
                },
            });

            let attachments: Mail.Attachment[] = [
                {
                    filename: 'logo.png',
                    path: path.resolve(
                        process.env.IMAGE_ASSETS_DIR,
                        'email_logo.png',
                    ),
                    cid: 'logo@seanchenpiano.com',
                },
            ];
            if (products.length === 0) {
                throw new Error(`Could not find any of product: ${productIDs}`);
            }
            if (products.length === 1) {
                attachments = [
                    ...attachments,
                    {
                        filename: products[0].file,
                        path: path.resolve(
                            process.env.PRODUCTS_DIR,
                            products[0].file,
                        ),
                    },
                ];
            } else {
                const zip = archiver('zip', {
                    zlib: { level: 9 },
                });

                zip.on('warning', (err) => {
                    if (err.code === 'ENOENT') {
                        // log warning
                        console.error(err);
                    } else {
                        // throw error
                        throw err;
                    }
                });

                // good practice to catch this error explicitly
                zip.on('error', (err) => {
                    throw err;
                });

                for (const prod of products) {
                    zip.file(
                        path.resolve(process.env.PRODUCTS_DIR, prod.file),
                        {
                            name: prod.file,
                        },
                    );
                }
                await zip.finalize();
                console.log(`Successfully zipped ${products.length} products.`);
                attachments = [
                    ...attachments,
                    {
                        filename: 'seanchenpiano_scores.zip',
                        content: zip,
                    },
                ];
            }

            const template = await readFile(
                path.resolve(process.env.PARTIALS_DIR, 'purchaseEmail.html'),
                'utf8',
            );

            const html = mustache.render(template, {
                products: products.map((prod) => prod.name),
                clientRef,
                year: getYear(new Date()),
            });

            const message: nodemailer.SendMailOptions = {
                from: 'Sean Chen Piano <seanchen@seanchenpiano.com>',
                replyTo: 'seanchen@seanchenpiano.com',
                to: email,
                subject: `[Sean Chen Piano] ${
                    clientRef ? 'Your recent' : 'Your request for previously'
                } purchased PDFs from seanchenpiano.com.`,
                html,
                attachments,
            };

            if (this.transporter) {
                const result = await this.transporter.sendMail(message);
                if (process.env.NODE_ENV === 'development') {
                    console.log(email);
                    console.log(attachments);
                    console.log(result);
                } else {
                    console.log(`Successfully sent email to: ${email}`);
                    this.infoEmailer(
                        'Emailer',
                        `Successfully sent email to: ${email}`,
                    );
                }
            } else {
                throw new Error('this.transporter was undefined or null.');
            }
        } catch (e) {
            console.error(e);
            this.errorEmailer('Emailer', JSON.stringify(e));
        }
    };

    infoEmailer = async (domain: string, error: string) => {
        try {
            const message: nodemailer.SendMailOptions = {
                from: 'Sean Chen Piano <seanchen@seanchenpiano.com>',
                replyTo: 'seanchen@seanchenpiano.com',
                to: 'seanchen@seanchenpiano.com',
                subject: `[Server Info]: ${domain}`,
                text: `
                On ${new Date()}, ${domain} received this info:
                ${error}
            `,
            };

            const result = await this.transporter?.sendMail(message);
            if (process.env.NODE_ENV === 'development') {
                console.log('Sent info email');
                console.log(result);
            }
        } catch (e) {
            console.error(e);
        }
    };

    errorEmailer = async (domain: string, error: string) => {
        try {
            const message: nodemailer.SendMailOptions = {
                from: 'Sean Chen Piano <seanchen@seanchenpiano.com>',
                replyTo: 'seanchen@seanchenpiano.com',
                to: 'seanchen@seanchenpiano.com',
                subject: `[Server Error]: ${domain}`,
                text: `
                On ${new Date()}, ${domain} received this error:
                ${error}
            `,
            };

            const result = await this.transporter?.sendMail(message);
            if (process.env.NODE_ENV === 'development') {
                console.log('Sent error email');
                console.log(result);
            }
        } catch (e) {
            console.error(e);
        }
    };
}

class DummyMailer {
    duplicateEmailNotification = async () => {
        console.log('DummyMailer - Send duplicate email notification');
        return new Promise(() => {});
    };
    emailRegisterNotification = async () => {
        console.log('DummyMailer - Send register notification');
        return new Promise(() => {});
    };
    emailPDFs = async () => {
        console.log('DummyMailer - Send PDFs notification');
        return new Promise(() => {});
    };
}

export const mailer =
    process.env.USE_DUMMY_MAILER === 'true'
        ? new DummyMailer()
        : await new ConnectedMailer().initialize();

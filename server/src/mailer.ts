import * as nodemailer from 'nodemailer';
import db from './models';
import { Op } from 'sequelize';
import * as path from 'path';
import * as mustache from 'mustache';
import { promises as fsAsync, readFileSync } from 'fs';
import * as moment from 'moment';
import * as root from 'app-root-path';

const models = db.models;

const transportOptions =
// (process.env.NODE_ENV === 'production') ?
{
    host: 'smtpout.secureserver.net',
    secure: true,
    port: 465,
    auth: {
        user: 'seanchen@seanchenpiano.com',
        pass: process.env.EMAIL_PASSWORD,
    },
    dkim: {
        domainName: 'seanchenpiano.com',
        keySelector: 'email',
        privateKey: readFileSync(path.resolve(process.env.DKIM_PRIVATE_KEY_FILE), 'utf8'),
    },
};
// : {
//         host: 'smtp.ethereal.email',
//         port: 587,
//         auth: {
//             user: 'dave14@ethereal.email',
//             pass: 'ZbHs2rcZubP4EV9tWB'
//         },
//     };

// To email a manual request, omit clientRef (or pass falsey value)
export const emailPDFs = async (productIDs: string[], email: string, clientRef?: string): Promise<void> => {
    const transport = nodemailer.createTransport(transportOptions);

    const products = await models.product.findAll({
        attributes: ['id', 'file', 'name'],
        where: {
            id: {
                [Op.in]: productIDs,
            },
        },
    });

    let attachments: {
        filename: string;
        path: string;
        cid?: string;
    }[] = products.map((prod) => ({
        filename: prod.file,
        path: path.resolve(process.env.PRODUCTS_DIR, prod.file),
    }));

    attachments = [
        ...attachments,
        {
            filename: 'logo.png',
            path: path.resolve(process.env.IMAGE_ASSETS_DIR, 'email_logo.png'),
            cid: 'logo@seanchenpiano.com',
        },
    ];

    const template = await fsAsync.readFile(path.resolve(root.toString(), 'web/partials', 'email.html'), 'utf8');

    const html = mustache.render(template, {
        products: products.map((prod) => prod.name),
        clientRef,
        year: moment().year(),
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
};
    //     console.log(nodemailer.getTestMessageUrl(result));
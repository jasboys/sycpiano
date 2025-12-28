import { createHash } from 'node:crypto';

export const getLastName = (name: string) => {
    return /([^\s]+)\s?(?:\(.*\))?$/.exec(name)?.[1];
};

const normalizeString = (str: string) => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f":()',.-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/_$/, '');
};

export const getHash = (
    composer: string,
    piece: string,
    name?: string,
): string => {
    const str = `/${getLastName(composer)}/${normalizeString(piece)}${
        name ? `/${normalizeString(name)}` : ''
    }`;
    return createHash('sha1').update(str).digest('base64');
};

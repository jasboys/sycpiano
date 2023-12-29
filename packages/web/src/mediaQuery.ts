import decamalize from 'decamelize';

const isDimension = (feature: string) => {
    const re = /(height|width)$/;
    return re.test(feature);
};

const isResolution = (feature: string) => {
    const re = /resolution$/;
    return re.test(feature);
};

const negatable = [
    'any-hover',
    'any-pointer',
    'forced-colors',
    'hover',
    'inverted-colors',
    'monochrome',
    'overflow-block',
    'overflow-inline',
    'pointer',
    'scripting',
    'update',
];

type MediaQueryValue = string | number | boolean;
interface MediaQueryEntries {
    [key: string]: MediaQueryValue;
}
type MediaQueryObject =
    | MediaQueryGroup
    | MediaQueryEntries
    | (MediaQueryEntries | MediaQueryGroup)[];
type MediaQueryGroup = {
    or?: MediaQueryObject;
    and?: MediaQueryObject;
    not?: MediaQueryObject;
};

const processFeature = (feature: string, value: MediaQueryValue) => {
    const hyphenized = decamalize(feature, { separator: '-' });
    const suffixed =
        isDimension(hyphenized) && typeof value === 'number'
            ? `${value}px`
            : isResolution(hyphenized) && typeof value === 'number'
            ? `${value}dppx`
            : value;
    if (value === true) {
        return hyphenized;
    } else if (value === false || negatable.includes(feature)) {
        return `not (${hyphenized})`;
    } else {
        return `(${hyphenized}: ${suffixed})`;
    }
};

const logicOperator = {
    or: ', ',
    and: ' and ',
};

// This code doesn't actually work for infinitely recursive, because media queries are strange
// Good enough for depth of 2, as long as top level isn't and with multiple ors under it
const obj2mq = (obj: MediaQueryObject, logic?: 'or' | 'and') => {
    if (Array.isArray(obj)) {
        const strings: string[] = obj.map((val) => obj2mq(val));
        return strings.length === 1
            ? strings[0]
            : `${strings.join(logicOperator[logic ?? 'or'])}`;
    } else {
        const strings: string[] = Object.entries(obj).map(
            ([feature, value]) => {
                if (feature === 'or' || feature === 'and') {
                    if (typeof value === 'object') {
                        return obj2mq(value, feature);
                    } else {
                        throw Error(
                            'logic entries must have either objects or array of objects',
                        );
                    }
                } else if (feature === 'not') {
                    if (typeof value === 'object') {
                        return `not ${obj2mq(value)}`;
                    } else {
                        throw Error(
                            'logic entries must have either objects or array of objects',
                        );
                    }
                } else {
                    return processFeature(feature, value as MediaQueryValue);
                }
            },
        );
        return strings.length === 1
            ? strings[0]
            : `${strings.join(logicOperator[logic ?? 'and'])}`;
    }
};

export const toMedia = (obj: MediaQueryObject) => {
    return `@media ${obj2mq(obj)}`;
};

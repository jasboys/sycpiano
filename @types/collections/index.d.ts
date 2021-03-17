declare module 'collections/sorted-array' {
    type Key = string | number;
    export class SortedArray<T> extends Array<T> {
        length: number;
        Iterator: Iterator;
        isSorted: boolean;
        constructor(
            values?: T[],
            equals?: (a: T, b: T) => boolean,
            compare?: (a: T, b: T) => number,
            getDefault?: (a: Key) => T
        );
        constructClone(values?: T[]): SortedArray<T>;
        has(value: T): boolean;
        get(value: T): T | undefined;
        add(value: T): boolean;
        addEach(...args: T[]): void;
        ['delete'](value: T): boolean;
        deleteAll(value: T, equals: (a: T, b: T) => boolean): number;
        toggle(value: T): void;
        indexOf(value: T): number;
        lastIndexOf(value: T): number;
        findValue(value: T): number;
        findLastValue(value: T): number;
        push(...args: T[]): void;
        unshift(...args: T[]): void;
        pop(): T;
        shift(): T;
        slice(start?: Key, end?: Key): SortedArray<T>;
        splice(index: number, length: number, ...args: T[]): T[];
        swap(index: number, length: number, plus: T[]): T[];
        reduce<R>(callback: (result: R, val: T, key: Key, collection: SortedArray<T>) => R,
            basis?: R, thisp?: unknown): R;
        reduceRight<R>(callback: (result: R, val: T, key: Key, collection: SortedArray<T>) => R,
        basis?: R, thisp?: unknown): R;
        min(): T;
        max(): T;
        one(): T;
        clear(): void;
        equals(that: unknown, equals?: (a: T, b: T) => boolean): boolean;
        compare(that: unknown, compare?: (a: T, b: T) => boolean): boolean;
        iterate(start: number, end: number): Iterator<T>;
        toJSON(): T[];
    }
}

declare module 'collections/sorted-array-set' {
    export class SortedArraySet<T> extends Array<T> {
        length: number;
        Iterator: Iterator;
        isSorted: boolean;
        isSet: boolean;
        constructor(
            values?: T[],
            equals?: (a: T, b: T) => boolean,
            compare?: (a: T, b: T) => number,
            getDefault?: (a: Key) => T
        );
        constructClone(values?: T[]): SortedArraySet<T>;
        has(value: T): boolean;
        get(value: T): T | undefined;
        add(value: T): boolean;
        addEach(...args: T[]): void;
        ['delete'](value: T): boolean;
        deleteAll(value: T, equals: (a: T, b: T) => boolean): number;
        indexOf(value: T): number;
        lastIndexOf(value: T): number;
        findValue(value: T): number;
        findLastValue(value: T): number;
        push(...args: T[]): void;
        unshift(...args: T[]): void;
        pop(): T;
        shift(): T;
        union(args: T[]): SortedArraySet<T>;
        intersection(args: T[]): SortedArraySet<T>;
        difference(args: T[]): SortedArraySet<T>;
        symmetricDifference(args: T[]): SortedArraySet<T>;
        slice(start?: Key, end?: Key): SortedArray<T>;
        splice(index: number, length: number, ...args: T[]): T[];
        swap(index: number, length: number, plus: T[]): T[];
        reduce<R>(callback: (result: R, val: T, key: Key, collection: SortedArray<T>) => R,
            basis?: R, thisp?: unknown): R;
        reduceRight<R>(callback: (result: R, val: T, key: Key, collection: SortedArray<T>) => R,
        basis?: R, thisp?: unknown): R;
        min(): T;
        max(): T;
        one(): T;
        clear(): void;
        equals(that: unknown, equals?: (a: T, b: T) => boolean): boolean;
        compare(that: unknown, compare?: (a: T, b: T) => boolean): boolean;
        iterate(start: number, end: number): Iterator<T>;
        toJSON(): T[];
        toArray(): T[];
    }
}
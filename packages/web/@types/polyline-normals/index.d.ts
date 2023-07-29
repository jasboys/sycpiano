declare module 'polyline-normals' {
    declare function pn(
        points: number[][],
        closed?: boolean,
    ): [[number, number], number][];
    export = pn;
}
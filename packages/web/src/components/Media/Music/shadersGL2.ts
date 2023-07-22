export const genVert = `#version 300 es
    in vec2 aVertexPosition;

    uniform mat3 uMatrix;

    void main() {
        vec3 myVec = vec3(aVertexPosition, 1.0);
        gl_Position = vec4(uMatrix * myVec, 1.0);
    }
`;

export const cqFragWebGL2 = `#version 300 es
    precision highp float;

    uniform vec4 uGlobalColor;
    uniform vec2 uCenter;
    uniform float uRadius;

    out vec4 outputColor;

    void main()
    {
        float r = 0.0, delta = 0.0, alpha = 1.0;
        vec2 cxy = gl_FragCoord.xy - uCenter;
        r = length(cxy);
        delta = fwidth(r);
        alpha = smoothstep(uRadius - delta, uRadius + delta, r);


        outputColor = vec4(uGlobalColor.xyz, alpha);
    }
`

export const genFrag = `#version 300 es
    precision highp float;
    uniform vec4 uGlobalColor;

    out vec4 outputColor;

    void main() {
        outputColor = uGlobalColor;
    }
`;

export const lineVert = `#version 300 es
    in vec2 aPosition;
    in vec2 aNormal;
    uniform mat3 uMatrix;
    uniform float uThickness;

    void main() {
        //push the point along its normal by half thickness
        vec3 p = vec3(aPosition + aNormal * uThickness / 2.0, 1.0);
        gl_Position = vec4(uMatrix * p, 1.0);
    }
`;

export const phaseVert = `#version 300 es
    in vec2 aPosition;
    in vec2 aNormal;
    in float aMiter;
    uniform float uThickness;
    uniform mat3 uMatrix;
    uniform mat3 uRotate;

    void main() {
        //push the point along its normal by half thickness
        vec3 p = vec3(aPosition + aNormal * uThickness / 2.0 * min(aMiter, 1.5), 1.0);
        gl_Position = vec4(uMatrix * uRotate * p, 1.0);
    }
`;

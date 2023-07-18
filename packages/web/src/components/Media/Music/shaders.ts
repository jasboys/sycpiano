export const genVert = `
    attribute vec2 aVertexPosition;

    uniform mat3 uMatrix;

    void main() {
        vec3 myVec = vec3(aVertexPosition, 1.0);
        gl_Position = vec4(uMatrix * myVec, 1.0);
    }
`;

export const cqFrag = `
    #ifdef GL_OES_standard_derivatives
        #extension GL_OES_standard_derivatives : enable
    #endif
    #ifdef GL_ES
        precision highp float;
    #endif

    uniform vec4 uGlobalColor;
    uniform float uRadius;
    uniform vec2 uCenter;

    void main()
    {
        float r = 0.0, delta = 0.0, alpha = 1.0;
        vec2 cxy = gl_FragCoord.xy - uCenter;
        r = length(cxy);
        #ifdef GL_OES_standard_derivatives
            delta = fwidth(r);
            alpha = smoothstep(uRadius - delta, uRadius + delta, r);
        #endif

        gl_FragColor = vec4(uGlobalColor.xyz, alpha);
    }
`;

export const genFrag = `
    #ifdef GL_ES
        precision highp float;
    #endif

    uniform vec4 uGlobalColor;

    void main() {
        gl_FragColor = uGlobalColor;
    }
`;

export const lineVert = `
    attribute vec2 aPosition;
    attribute vec2 aNormal;
    uniform float uThickness;
    uniform mat3 uMatrix;

    void main() {
        //push the point along its normal by half thickness
        vec3 p = vec3(aPosition + aNormal * uThickness / 2.0, 1.0);
        gl_Position = vec4(uMatrix * p, 1.0);
    }
`;

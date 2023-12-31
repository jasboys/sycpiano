export const loadShader = (
    gl: WebGLRenderingContext,
    type: number,
    source: string,
): WebGLShader | undefined => {
    const shader = gl.createShader(type);
    if (!shader) return undefined;

    // Send the source to the shader object
    gl.shaderSource(shader, source);
    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(
                shader,
            )} ${type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'}`,
        );
        gl.deleteShader(shader);
        return undefined;
    }

    return shader;
};

export const initShader = (
    gl: WebGLRenderingContext,
    vSource: string,
    fSource: string,
): WebGLProgram | undefined => {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    if (!vertexShader || !fragmentShader || !shaderProgram) return undefined;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                shaderProgram,
            )}`,
        );
        return undefined;
    }

    return shaderProgram;
};

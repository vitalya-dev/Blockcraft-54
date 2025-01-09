
class Cube {
    constructor(gl) {
        this.gl = gl;
        this.transform = new Transform();

        // Initialize shaders
        this.initShaders();

        // Initialize vertex data and buffers
        this.vertices = new Float32Array([
            // Vertex coordinates
            1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // front
            1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // right
            1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // up
            -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // left
            -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // down
            1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // back
        ]);

        this.colors = new Float32Array([
            // Colors
            1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,  // front
            0, 1, 0,   0, 1, 0,   0, 1, 0,  0, 1, 0,  // right
            0, 0, 1,   0, 0, 1,   0, 0, 1,  0, 0, 1,  // up
            1, 1, 0,   1, 1, 0,   1, 1, 0,  1, 1, 0,  // left
            0, 1, 1,   0, 1, 1,   0, 1, 1,  0, 1, 1,  // down
            1, 0, 1,   1, 0, 1,   1, 0, 1,  1, 0, 1   // back
        ]);

        this.indices = new Uint8Array([
            0, 1, 2,   0, 2, 3,    // front
            4, 5, 6,   4, 6, 7,    // right
            8, 9,10,   8,10,11,    // up
            12,13,14,  12,14,15,   // left
            16,17,18,  16,18,19,   // down
            20,21,22,  20,22,23    // back
        ]);

        this.initBuffers();
    }

    initShaders() {
        const gl = this.gl;

        // Vertex shader source code
        const vsSource = `
            attribute vec4 a_Position;
            attribute vec4 a_Color;
            uniform mat4 u_MvpMatrix;
            varying vec4 v_Color;
            void main() {
                gl_Position = u_MvpMatrix * a_Position;
                v_Color = a_Color;
            }
        `;

        // Fragment shader source code
        const fsSource = `
            precision mediump float;
            varying vec4 v_Color;
            void main() {
                gl_FragColor = v_Color;
            }
        `;

        // Compile shaders and link the program
        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fsSource);

        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, vertexShader);
        gl.attachShader(this.shaderProgram, fragmentShader);
        gl.linkProgram(this.shaderProgram);

        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            console.error('Could not link shaders: ' + gl.getProgramInfoLog(this.shaderProgram));
        }

        // Use the program
        gl.useProgram(this.shaderProgram);
        gl.program = this.shaderProgram;
    }

    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    initBuffers() {
        const gl = this.gl;

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // Vertex buffer
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        const a_Position = gl.getAttribLocation(this.shaderProgram, 'a_Position');
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // Color buffer
        this.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
        const a_Color = gl.getAttribLocation(this.shaderProgram, 'a_Color');
        gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        // Index buffer
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        gl.bindVertexArray(null);
    }

    draw(vpMatrix) {
        const gl = this.gl;

        const u_MvpMatrix = gl.getUniformLocation(this.shaderProgram, 'u_MvpMatrix');

        const modelMatrix = this.transform.getMatrix();
        const mvpMatrix = new Matrix4(vpMatrix).multiply(modelMatrix);

        gl.useProgram(this.shaderProgram);
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);
    }
}
class DrawableObject {
    constructor(gl) {
        this.gl = gl;
        this.transform = new Transform();
        this.color = [1.0, 1.0, 1.0, 1.0]; // Default color (white)

        // Initialize shaders
        this.initShaders();
    }

    initShaders() {
        const gl = this.gl;

        const vsSource = `
            attribute vec4 a_Position;
            uniform mat4 u_MvpMatrix;
            uniform mat4 u_NormalMatrix; // Matrix to transform normals
            void main() {
                gl_Position = u_MvpMatrix * a_Position;
            }
        `;

        const fsSource = `
            precision mediump float;
            uniform vec4 u_Color;
            void main() {
                gl_FragColor = u_Color;
            }
        `;

        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fsSource);

        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, vertexShader);
        gl.attachShader(this.shaderProgram, fragmentShader);
        gl.linkProgram(this.shaderProgram);

        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            console.error('Could not link shaders: ' + gl.getProgramInfoLog(this.shaderProgram));
        }

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

        if (this.vertices) {
            this.vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

            const a_Position = gl.getAttribLocation(this.shaderProgram, 'a_Position');
            gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);
        }

        gl.bindVertexArray(null);
    }

    draw(vpMatrix) {
        const gl = this.gl;

        const u_MvpMatrix = gl.getUniformLocation(this.shaderProgram, 'u_MvpMatrix');
        const u_Color = gl.getUniformLocation(this.shaderProgram, 'u_Color');
        const u_NormalMatrix = gl.getUniformLocation(this.shaderProgram, 'u_NormalMatrix');

        const modelMatrix = this.transform.getMatrix();
        const mvpMatrix = new Matrix4(vpMatrix).multiply(modelMatrix);

        gl.useProgram(this.shaderProgram);
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        gl.uniform4fv(u_Color, this.color);

        const normalMatrix = new Matrix4(modelMatrix).invert().transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
        gl.bindVertexArray(null);
    }
}

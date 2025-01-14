class DrawableObject {
    constructor(gl) {
        this.gl = gl;
        this.transform = new Transform();

        // Initialize shaders
        this.initShaders();
        //this.initBuffers();
    }

    initShaders() {
        const gl = this.gl;

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

        const fsSource = `
            precision mediump float;
            varying vec4 v_Color;
            void main() {
                gl_FragColor = v_Color;
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

        if (this.colors) {
            this.colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

            const a_Color = gl.getAttribLocation(this.shaderProgram, 'a_Color');
            gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Color);
        }

        if (this.indices) {
            this.indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        }

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

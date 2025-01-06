class Triangle {
    constructor(gl) {
        this.gl = gl;
        this.program = this.initShaders();
        this.vao = null;
        this.transform = new Transform();
        this.initVAO();
    }

    // Initialize shaders
    initShaders() {
        const gl = this.gl;

        // Compile shaders
        const vertexShader = this.compileShader(gl.VERTEX_SHADER, `
            attribute vec4 a_Position;
            uniform mat4 u_Transform;
            void main() {
                gl_Position = u_Transform * a_Position;
            }
        `);

        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, `
            void main() {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            }
        `);

        // Link program
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        // Check for linking errors
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Failed to link program:", gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }

        gl.useProgram(program);
        return program;
    }

    // Compile a shader
    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        // Check for compilation errors
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(`Failed to compile shader:`, gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    initVAO() {
        const gl = this.gl;

        // Vertex data
        const vertices = new Float32Array([
            0.0, 0.5,  // Vertex 1
            -0.5, -0.5, // Vertex 2
            0.5, -0.5   // Vertex 3
        ]);

        // Create VAO
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // Create buffer and upload vertex data
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Get attribute location, enable it, and point to the vertex data
        const a_Position = gl.getAttribLocation(this.program, 'a_Position');
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // Unbind VAO and buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw() {
        const gl = this.gl;

        // Use the program
        gl.useProgram(this.program);

        // Bind the VAO
        gl.bindVertexArray(this.vao);

        // Pass the transformation matrix to the shader
        const u_Transform = gl.getUniformLocation(this.program, 'u_Transform');
        const transformMatrix = this.transform.getMatrix();
        gl.uniformMatrix4fv(u_Transform, false, transformMatrix.elements);

        // Draw the triangle
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // Unbind the VAO
        gl.bindVertexArray(null);
    }
}

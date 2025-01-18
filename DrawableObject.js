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
            attribute vec3 a_Normal; // Normal attribute
            uniform mat4 u_MvpMatrix;
            uniform mat4 u_ModelMatrix; // Model matrix
            uniform mat4 u_NormalMatrix; // Matrix to transform normals

            varying vec3 v_Normal;
            varying vec3 v_Position;

            void main() {
                gl_Position = u_MvpMatrix * a_Position;
                v_Normal = mat3(u_NormalMatrix) * a_Normal;
                v_Position = vec3(u_ModelMatrix * a_Position);
            }
        `;

        const fsSource = `
            precision mediump float;

            uniform vec3 u_LightPosition;  // Position of the point light
            uniform vec3 u_LightColor;     // Color of the light source
            uniform vec3 u_AmbientColor;   // Ambient light color
            uniform vec4 u_Color;          // Base color of the object

            varying vec3 v_Normal;
            varying vec3 v_Position;

            void main() {
                // Normalize the normal vector
                vec3 normal = normalize(v_Normal);

                // Calculate the direction from the fragment to the light source
                vec3 lightDirection = normalize(u_LightPosition - v_Position);

                // Calculate the diffuse light intensity
                float nDotL = max(dot(normal, lightDirection), 0.0);
                vec3 diffuse = u_LightColor * u_Color.rgb * nDotL;

                // Calculate the ambient light intensity
                vec3 ambient = u_AmbientColor * u_Color.rgb;

                // Combine the lighting components
                vec3 finalColor = ambient + diffuse;

                gl_FragColor = vec4(finalColor, u_Color.a);
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

        if (this.normals) {
            this.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

            const a_Normal = gl.getAttribLocation(this.shaderProgram, 'a_Normal');
            gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Normal);
        }

        gl.bindVertexArray(null);
    }

    draw(vpMatrix) {
        const gl = this.gl;

        const u_MvpMatrix = gl.getUniformLocation(this.shaderProgram, 'u_MvpMatrix');
        const u_Color = gl.getUniformLocation(this.shaderProgram, 'u_Color');
        const u_NormalMatrix = gl.getUniformLocation(this.shaderProgram, 'u_NormalMatrix');
        const u_ModelMatrix = gl.getUniformLocation(this.shaderProgram, 'u_ModelMatrix');
        const u_LightPosition = gl.getUniformLocation(this.shaderProgram, 'u_LightPosition');
        const u_LightColor = gl.getUniformLocation(this.shaderProgram, 'u_LightColor');
        const u_AmbientColor = gl.getUniformLocation(this.shaderProgram, 'u_AmbientColor');

        const modelMatrix = this.transform.getMatrix();
        const mvpMatrix = new Matrix4(vpMatrix).multiply(modelMatrix);

        gl.useProgram(this.shaderProgram);
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.uniform4fv(u_Color, this.color);

        const normalMatrix = new Matrix4(modelMatrix).invert().transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        // Set the point light properties
        gl.uniform3fv(u_LightPosition, [2.0, 2.0, 2.0]); // Example light position
        gl.uniform3fv(u_LightColor, [1.0, 1.0, 1.0]);    // White light
        gl.uniform3fv(u_AmbientColor, [0.5, 0.5, 0.5]);  // Low ambient light

        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
        gl.bindVertexArray(null);
    }
}

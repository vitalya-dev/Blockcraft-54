class DrawableObject {
    constructor(gl, id = 0) {
        this.gl = gl;
        this.transform = new Transform();
        this.color = [1.0, 1.0, 1.0, 1.0]; // Default color (white)
        this.wireframe = false;
        this.pickingColor = this.generatePickingColor(id);

        // Initialize shaders
        this.initPickingShader();
        this.initShaders();
    }

    generatePickingColor(id) {
        const r = ((id >> 16) & 0xFF) / 255;
        const g = ((id >> 8) & 0xFF) / 255;
        const b = (id & 0xFF) / 255;
        return [r, g, b, 1.0];
    }

    initPickingShader() {
        const gl = this.gl;

        const pickingVsSource = `
            attribute vec4 a_Position;
            uniform mat4 u_MvpMatrix;

            void main() {
                gl_Position = u_MvpMatrix * a_Position;
            }
        `;

        const pickingFsSource = `
            precision mediump float;
            uniform vec4 u_PickingColor;

            void main() {
                gl_FragColor = u_PickingColor;
            }
        `;

        const vertexShader = this.compileShader(gl.VERTEX_SHADER, pickingVsSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, pickingFsSource);

        this.pickingShaderProgram = gl.createProgram();
        gl.attachShader(this.pickingShaderProgram, vertexShader);
        gl.attachShader(this.pickingShaderProgram, fragmentShader);
        gl.linkProgram(this.pickingShaderProgram);

        if (!gl.getProgramParameter(this.pickingShaderProgram, gl.LINK_STATUS)) {
            console.error('Could not link picking shaders: ' + gl.getProgramInfoLog(this.pickingShaderProgram));
        }
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

            uniform vec3 u_LightDirection; // Direction of the light
            uniform vec3 u_LightColor;     // Color of the light source
            uniform vec3 u_AmbientColor;   // Ambient light color
            uniform vec4 u_Color;          // Base color of the object
            uniform int u_Wireframe;   // 1 for wireframe mode, 0 for solid shading

            varying vec3 v_Normal;

            void main() {
                if (u_Wireframe == 1) {
                    gl_FragColor = u_Color;
                    return;
                }
                // Normalize the normal vector
                vec3 normal = normalize(v_Normal);
                vec3 lightDirection = normalize(u_LightDirection);

                // Calculate the diffuse light intensity (dot product of normal and light direction)
                float nDotL = max(dot(normal, -lightDirection), 0.0); // Light direction is incoming

                // Quantize the diffuse lighting into discrete levels (toon shading)
                float levels = 4.0; // Number of discrete shading levels
                nDotL = floor(nDotL * levels) / levels;

                // Calculate the diffuse color
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
        gl.useProgram(this.shaderProgram);

        // Compute transformation matrices
        const modelMatrix = this.transform.getMatrix();
        const mvpMatrix = new Matrix4(vpMatrix).multiply(modelMatrix);
        const normalMatrix = new Matrix4(modelMatrix).invert().transpose();

        // Set uniforms for normal rendering
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, 'u_MvpMatrix'), false, mvpMatrix.elements);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, 'u_ModelMatrix'), false, modelMatrix.elements);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, 'u_NormalMatrix'), false, normalMatrix.elements);
        gl.uniform4fv(gl.getUniformLocation(this.shaderProgram, 'u_Color'), this.color);

        // Set lighting uniforms
        gl.uniform3fv(gl.getUniformLocation(this.shaderProgram, 'u_LightDirection'), [-1.0, -2.0, -3.0]);
        gl.uniform3fv(gl.getUniformLocation(this.shaderProgram, 'u_LightColor'), [1.0, 1.0, 1.0]);
        gl.uniform3fv(gl.getUniformLocation(this.shaderProgram, 'u_AmbientColor'), [0.5, 0.5, 0.5]);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'u_Wireframe'), this.wireframe ? 1 : 0);

        // Draw the object
        this.drawObject();
    }


    drawPicking(vpMatrix) {
        const gl = this.gl;
        gl.useProgram(this.pickingShaderProgram);


        // Compute transformation matrix
        const modelMatrix = this.transform.getMatrix();
        const mvpMatrix = new Matrix4(vpMatrix).multiply(modelMatrix);

        // Set picking uniforms
        gl.uniformMatrix4fv(gl.getUniformLocation(this.pickingShaderProgram, 'u_MvpMatrix'), false, mvpMatrix.elements);
        gl.uniform4fv(gl.getUniformLocation(this.pickingShaderProgram, 'u_PickingColor'), this.pickingColor);

        // Draw the object for picking
        this.drawObject();
    }



    drawObject() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);

        const drawMode = this.wireframe ? gl.LINES : gl.TRIANGLES;
        gl.drawArrays(drawMode, 0, this.vertices.length / 3);

        gl.bindVertexArray(null);
    }
}

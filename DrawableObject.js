class DrawableObject {
    constructor(gl, id) {
        this.gl = gl;
        this.transform = new Transform();
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.wireframe = false;
        this.pickingColor = DrawableObject.generatePickingColor(id);
        
        this.buffers = {};
        this.vaos = {};
        this.shaderPrograms = {};
        this.mainUniforms = null;
        this.pickingUniforms = null;

        this.initializeResources();
    }

    initializeResources() {
        this.initShaders();
        this.initPickingShader();
        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;
        this.createBuffer('vertex', this.vertices);
        this.createBuffer('normal', this.normals);

        this.vaos.main = this.createVAO(() => this.setupMainAttributes());
        this.vaos.picking = this.createVAO(() => this.setupPickingAttributes());
    }

    createBuffer(name, data) {
        if (!data) return;
        
        const gl = this.gl;
        this.buffers[name] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[name]);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    }

    createVAO(setupCallback) {
        const gl = this.gl;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        setupCallback();
        gl.bindVertexArray(null);
        return vao;
    }

    setupMainAttributes() {
        this.setupVertexAttribute(0, 'vertex', 3);
        this.setupVertexAttribute(1, 'normal', 3);
    }

    setupPickingAttributes() {
        this.setupVertexAttribute(0, 'vertex', 3);
    }

    setupVertexAttribute(location, bufferName, components) {
        const gl = this.gl;
        const buffer = this.buffers[bufferName];
        if (!buffer) return;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, components, gl.FLOAT, false, 0, 0);
    }

    static generatePickingColor(id) {
        return [
            ((id >> 16) & 0xFF) / 255,
            ((id >> 8) & 0xFF) / 255,
            (id & 0xFF) / 255,
            1.0
        ];
    }

    initShaders() {
        const [vs, fs] = this.getMainShaderSources();
        this.shaderPrograms.main = this.createShaderProgram(vs, fs);
        this.mainUniforms = this.getMainUniformLocations();
    }

    initPickingShader() {
        const [vs, fs] = this.getPickingShaderSources();
        this.shaderPrograms.picking = this.createShaderProgram(vs, fs);
        this.pickingUniforms = this.getPickingUniformLocations();
    }

    getMainUniformLocations() {
        const gl = this.gl;
        const program = this.shaderPrograms.main;
        return {
            mvpMatrix: gl.getUniformLocation(program, 'u_MvpMatrix'),
            modelMatrix: gl.getUniformLocation(program, 'u_ModelMatrix'),
            normalMatrix: gl.getUniformLocation(program, 'u_NormalMatrix'),
            color: gl.getUniformLocation(program, 'u_Color'),
            lightDirection: gl.getUniformLocation(program, 'u_LightDirection'),
            lightColor: gl.getUniformLocation(program, 'u_LightColor'),
            ambientColor: gl.getUniformLocation(program, 'u_AmbientColor'),
            wireframe: gl.getUniformLocation(program, 'u_Wireframe')
        };
    }

    getPickingUniformLocations() {
        const gl = this.gl;
        const program = this.shaderPrograms.picking;
        return {
            mvpMatrix: gl.getUniformLocation(program, 'u_MvpMatrix'),
            pickingColor: gl.getUniformLocation(program, 'u_PickingColor')
        };
    }

    getMainShaderSources() {
        const vsSource = `#version 300 es
            layout(location=0) in vec4 a_Position;
            layout(location=1) in vec3 a_Normal;
            uniform mat4 u_MvpMatrix, u_ModelMatrix, u_NormalMatrix;
            out vec3 v_Normal, v_Position;
            
            void main() {
                gl_Position = u_MvpMatrix * a_Position;
                v_Normal = mat3(u_NormalMatrix) * a_Normal;
                v_Position = vec3(u_ModelMatrix * a_Position);
            }`;

        const fsSource = `#version 300 es
            precision mediump float;
            in vec3 v_Normal;
            out vec4 fragColor;
            uniform vec3 u_LightDirection, u_LightColor, u_AmbientColor;
            uniform vec4 u_Color;
            uniform int u_Wireframe;
            
            void main() {
                if (u_Wireframe == 1) {
                    fragColor = u_Color;
                    return;
                }
                
                vec3 normal = normalize(v_Normal);
                float nDotL = max(dot(normal, -normalize(u_LightDirection)), 0.0);
                nDotL = floor(nDotL * 4.0) / 4.0;
                
                fragColor = vec4(
                    u_AmbientColor * u_Color.rgb +
                    u_LightColor * u_Color.rgb * nDotL, 
                    u_Color.a
                );
            }`;

        return [vsSource, fsSource];
    }

    getPickingShaderSources() {
        const vsSource = `#version 300 es
            layout(location=0) in vec4 a_Position;
            uniform mat4 u_MvpMatrix;
            
            void main() {
                gl_Position = u_MvpMatrix * a_Position;
            }`;

        const fsSource = `#version 300 es
            precision mediump float;
            uniform vec4 u_PickingColor;
            out vec4 fragColor;
            
            void main() {
                fragColor = u_PickingColor;
            }`;

        return [vsSource, fsSource];
    }

    createShaderProgram(vertexSource, fragmentSource) {
        const gl = this.gl;
        const program = gl.createProgram();
        
        const compileShader = (type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(`Shader error: ${gl.getShaderInfoLog(shader)}`);
                return null;
            }
            return shader;
        };

        const vs = compileShader(gl.VERTEX_SHADER, vertexSource);
        const fs = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

        if (vs && fs) {
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            gl.linkProgram(program);
            
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error(`Program error: ${gl.getProgramInfoLog(program)}`);
                return null;
            }
        }

        return program;
    }

    draw(vpMatrix) {
        const gl = this.gl;
        const { modelMatrix, mvpMatrix, normalMatrix } = this.calculateMatrices(vpMatrix);
        
        gl.useProgram(this.shaderPrograms.main);
        this.setMainUniforms(modelMatrix, mvpMatrix, normalMatrix);
        this.drawObject(this.vaos.main);
    }

    drawPicking(vpMatrix) {
        const gl = this.gl;
        const mvpMatrix = new Matrix4(vpMatrix).multiply(this.transform.getMatrix());
        
        gl.useProgram(this.shaderPrograms.picking);
        gl.uniformMatrix4fv(this.pickingUniforms.mvpMatrix, false, mvpMatrix.elements);
        gl.uniform4fv(this.pickingUniforms.pickingColor, this.pickingColor);
        this.drawObject(this.vaos.picking);
    }

    calculateMatrices(vpMatrix) {
        const modelMatrix = this.transform.getMatrix();
        return {
            modelMatrix,
            mvpMatrix: new Matrix4(vpMatrix).multiply(modelMatrix),
            normalMatrix: new Matrix4(modelMatrix).invert().transpose()
        };
    }

    setMainUniforms(modelMatrix, mvpMatrix, normalMatrix) {
        const gl = this.gl;
        
        gl.uniformMatrix4fv(this.mainUniforms.mvpMatrix, false, mvpMatrix.elements);
        gl.uniformMatrix4fv(this.mainUniforms.modelMatrix, false, modelMatrix.elements);
        gl.uniformMatrix4fv(this.mainUniforms.normalMatrix, false, normalMatrix.elements);
        gl.uniform4fv(this.mainUniforms.color, this.color);
        gl.uniform3fv(this.mainUniforms.lightDirection, [-1.0, -2.0, -3.0]);
        gl.uniform3fv(this.mainUniforms.lightColor, [1.0, 1.0, 1.0]);
        gl.uniform3fv(this.mainUniforms.ambientColor, [0.5, 0.5, 0.5]);
        gl.uniform1i(this.mainUniforms.wireframe, this.wireframe ? 1 : 0);
    }

    drawObject(vao) {
        const gl = this.gl;
        gl.bindVertexArray(vao);
        gl.drawArrays(
            this.wireframe ? gl.LINES : gl.TRIANGLES,
            0,
            this.vertices ? this.vertices.length / 3 : 0
        );
        gl.bindVertexArray(null);
    }
}
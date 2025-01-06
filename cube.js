// cube.js

class Transform {
    constructor() {
        this.translation = [0, 0, 0];
        this.rotation = [0, 0, 0]; // rotation angles in degrees
        this.scale = [1, 1, 1];
    }

    getMatrix() {
        const matrix = new Matrix4();
        matrix.setTranslate(...this.translation);
        matrix.rotate(this.rotation[0], 1, 0, 0);
        matrix.rotate(this.rotation[1], 0, 1, 0);
        matrix.rotate(this.rotation[2], 0, 0, 1);
        matrix.scale(...this.scale);
        return matrix;
    }
}

class Cube {
    constructor(gl) {
        this.gl = gl;
        this.transform = new Transform();
        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;

        const vertices = new Float32Array([
            // Vertex coordinates
            1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // front
            1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // right
            1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // up
            -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // left
            -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // down
            1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, // back
        ]);

        const colors = new Float32Array([
            // Colors
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // front
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // right
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // up
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // left
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // down
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // back
        ]);

        const normals = new Float32Array([
            // Normals
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // front
            1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // right
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // up
            -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // left
            0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // down
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, // back
        ]);

        const indices = new Uint8Array([
            0, 1, 2, 0, 2, 3, // front
            4, 5, 6, 4, 6, 7, // right
            8, 9, 10, 8, 10, 11, // up
            12, 13, 14, 12, 14, 15, // left
            16, 17, 18, 16, 18, 19, // down
            20, 21, 22, 20, 22, 23, // back
        ]);

        this.vertexCount = indices.length;

        this.vertexBuffer = this.initArrayBuffer(vertices, 3, gl.FLOAT, 'a_Position');
        this.colorBuffer = this.initArrayBuffer(colors, 3, gl.FLOAT, 'a_Color');
        this.normalBuffer = this.initArrayBuffer(normals, 3, gl.FLOAT, 'a_Normal');

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }

    initArrayBuffer(data, num, type, attribute) {
        const gl = this.gl;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        const a_attribute = gl.getAttribLocation(gl.program, attribute);
        gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);

        return buffer;
    }

    render(u_MvpMatrix, u_NormalMatrix, vpMatrix) {
        const gl = this.gl;

        const modelMatrix = this.transform.getMatrix();
        const mvpMatrix = new Matrix4(vpMatrix).multiply(modelMatrix);
        const normalMatrix = new Matrix4().setInverseOf(modelMatrix).transpose();

        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_BYTE, 0);
    }
}

// // main.js
// function main() {
//     const canvas = document.getElementById("webgl");
//     const gl = canvas.getContext("webgl");

//     if (!gl || !initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
//         console.error("Failed to initialize WebGL or shaders.");
//         return;
//     }

//     gl.clearColor(0, 0, 0, 1);
//     gl.enable(gl.DEPTH_TEST);

//     const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
//     const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
//     const u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');

//     const lightDirection = new Vector3([0.5, 3.0, 4.0]).normalize();
//     gl.uniform3fv(u_LightDirection, lightDirection.elements);

//     const vpMatrix = new Matrix4();
//     vpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
//     vpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);

//     const cube = new Cube(gl);

//     let currentAngle = 0.0;
//     const tick = function () {
//         currentAngle = animate(currentAngle);
//         cube.transform.rotation[1] = currentAngle;

//         gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//         cube.render(u_MvpMatrix, u_NormalMatrix, vpMatrix);

//         requestAnimationFrame(tick);
//     };

//     tick();
// }

// function animate(angle) {
//     const ANGLE_STEP = 30; // degrees per second
//     const now = Date.now();
//     const elapsed = (now - (animate.last || now)) / 1000;
//     animate.last = now;
//     return (angle + ANGLE_STEP * elapsed) % 360;
// }

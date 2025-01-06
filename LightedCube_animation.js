// main.js
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'uniform vec3 u_LightDirection;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  vec4 normal = u_NormalMatrix * a_Normal;\n' +
    '  float nDotL = max(dot(u_LightDirection, normalize(normal.xyz)), 0.0);\n' +
    '  v_Color = vec4(a_Color.xyz * nDotL, a_Color.a);\n' +
    '}\n';

var FSHADER_SOURCE=
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main(){\n'+
    'gl_FragColor = v_Color;\n'+
    '}\n';


function main() {
    const canvas = document.getElementById("webgl");
    const gl = canvas.getContext("webgl");

    if (!gl || !initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.error("Failed to initialize WebGL or shaders.");
        return;
    }

    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    const u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');

    const lightDirection = new Vector3([0.5, 3.0, 4.0]).normalize();
    gl.uniform3fv(u_LightDirection, lightDirection.elements);

    const vpMatrix = new Matrix4();
    vpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
    vpMatrix.lookAt(0, 0, 15, 0, 0, 0, 0, 1, 0);

    const cube_1 = new Cube(gl);
    const cube_2 = new Cube(gl);

    cube_1.transform.translation = [-2, 0, 0];
    cube_2.transform.translation = [2, 0, 0];

    let currentAngle = 0.0;
    const tick = function () {
        currentAngle = animate(currentAngle);
        cube_1.transform.rotation[1] = currentAngle;
        cube_2.transform.rotation[1] = -currentAngle;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        cube_1.render(u_MvpMatrix, u_NormalMatrix, vpMatrix);
        cube_2.render(u_MvpMatrix, u_NormalMatrix, vpMatrix);

        requestAnimationFrame(tick);
    };

    tick();
}

function animate(angle) {
    const ANGLE_STEP = 120; // degrees per second
    const now = Date.now();
    const elapsed = (now - (animate.last || now)) / 1000;
    animate.last = now;
    return (angle + ANGLE_STEP * elapsed) % 360;
}

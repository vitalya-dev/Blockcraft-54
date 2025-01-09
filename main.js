// Main.js
window.onload = function () {
    // Get the canvas element
    const canvas = document.getElementById('webgl');
    if (!canvas) {
        console.error('Failed to retrieve the <canvas> element.');
        return;
    }

    // Get the WebGL rendering context
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        console.error('Failed to get the rendering context for WebGL.');
        return;
    }

    // Set the clear color and enable depth testing
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create the cube object
    const cube = new Cube(gl);

    // View and projection matrices
    const viewMatrix = new Matrix4();
    viewMatrix.setLookAt(0, 0, 5, 0, 0, 0, 0, 1, 0);

    const projMatrix = new Matrix4();
    projMatrix.setPerspective(45, canvas.width / canvas.height, 1, 100);

    const vpMatrix = new Matrix4(projMatrix).multiply(viewMatrix);

    cube.draw(vpMatrix);

};

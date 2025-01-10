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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    const cube = new Cube(gl);

    const camera = new Camera();
    camera.aspect = canvas.width / canvas.height;

    canvas.addEventListener('mousedown', () => (camera.isDragging = true));
    canvas.addEventListener('mouseup', () => (camera.isDragging = false));
    canvas.addEventListener('mousemove', (event) => {
        if (camera.isDragging) {
            camera.updateMouse(event.movementX, event.movementY);
        }
    });
    canvas.addEventListener("wheel", (event) => {
        camera.handleMouseWheel(event.deltaY);
    });

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        cube.draw(camera.getProjectionMatrix().multiply(camera.getViewMatrix()));
        requestAnimationFrame(render);
    }

    render();
};

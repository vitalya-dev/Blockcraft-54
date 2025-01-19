// Main.js
window.onload = initialize;

function initialize() {
    const canvas = setupCanvas('webgl');
    if (!canvas) return;

    const gl = setupWebGLContext(canvas);
    if (!gl) return;

    const camera = setupCamera(canvas);
    camera.yaw = 45;
    camera.pitch = 45;
    camera.distance = 20;

    const box = new Box(gl);

    setupEventListeners(canvas, camera);
    setupResizeHandling(canvas, gl, camera);

    resizeCanvas(canvas, gl, camera);

    startRendering(gl, canvas, box, camera);
}

function setupCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Failed to retrieve the <canvas> element with ID '${canvasId}'.`);
    }
    return canvas;
}

function setupWebGLContext(canvas) {
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        console.error('Failed to get the rendering context for WebGL.');
        return null;
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    return gl;
}

function setupCamera(canvas) {
    const camera = new Camera();
    camera.aspect = canvas.width / canvas.height;
    return camera;
}

function setupEventListeners(canvas, camera) {
    canvas.addEventListener('mousedown', () => (camera.isDragging = true));
    canvas.addEventListener('mouseup', () => (camera.isDragging = false));
    canvas.addEventListener('mousemove', (event) => {
        if (camera.isDragging) {
            camera.updateMouse(event.movementX, event.movementY);
        }
    });
    canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        camera.handleMouseWheel(event.deltaY);
    });
}

function setupResizeHandling(canvas, gl, camera) {
    window.addEventListener('resize', () => resizeCanvas(canvas, gl, camera));
}

function resizeCanvas(canvas, gl, camera) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    camera.aspect = canvas.width / canvas.height;
}

function startRendering(gl, canvas, drawable, camera) {
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        drawable.draw(camera.getProjectionMatrix().multiply(camera.getViewMatrix()));
        requestAnimationFrame(render);
    }

    render();
}
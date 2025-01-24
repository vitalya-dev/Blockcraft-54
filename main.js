// Main.js
window.onload = initialize;

// Global WebGL context and resources
let gl;
let drawables = [];
let pickingFramebuffer;

function initialize() {
    const canvas = setupCanvas('webgl');
    if (!canvas) return;

    gl = setupWebGLContext(canvas);
    if (!gl) return;

    const camera = setupCamera(canvas);
    camera.yaw = 45;
    camera.pitch = 45;
    camera.distance = 20;

    drawables.push(new Box(gl));
    drawables.push(new TShape(gl, 1));
    drawables.push(new Floor(gl, 100, 100));

    resizeCanvas(canvas, gl, camera);

    pickingFramebuffer = createPickingFramebuffer(gl, canvas.width, canvas.height);

    setupEventListeners(canvas, camera);
    setupResizeHandling(canvas, gl, camera);
    startRendering(gl, canvas, drawables, camera);
}

function setupCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Failed to retrieve the <canvas> element with ID '${canvasId}'.`);
    }
    return canvas;
}

function createFramebuffer(gl, width, height) {
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { framebuffer, texture };
}

function createPickingFramebuffer(gl, width, height) {
    const framebufferData = createFramebuffer(gl, width, height);
    return framebufferData;
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
    canvas.addEventListener('mousedown', (event) => {
        if (event.button === 0) {
            handlePicking(gl, canvas, event, camera);
        } else {
            event.preventDefault();
            camera.isDragging = true;
        }
    });
    
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

function startRendering(gl, canvas, drawables, camera) {
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const projectionMatrix = camera.getProjectionMatrix();
        const viewMatrix = camera.getViewMatrix();
        const vpMatrix = projectionMatrix.multiply(viewMatrix);
        for (const drawable of drawables) {
            drawable.draw(vpMatrix);
        }
        requestAnimationFrame(render);
    }

    render();
}


function handlePicking(gl, canvas, event, camera) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = rect.bottom - event.clientY;

    // Render to picking framebuffer
    const projectionMatrix = camera.getProjectionMatrix();
    const viewMatrix = camera.getViewMatrix();
    const vpMatrix = projectionMatrix.multiply(viewMatrix);

    gl.bindFramebuffer(gl.FRAMEBUFFER, pickingFramebuffer.framebuffer);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (const drawable of drawables) {
        drawable.drawPicking(vpMatrix);
    }

    // Read pixel and decode ID
    const pixel = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const id = (pixel[0] << 16) | (pixel[1] << 8) | pixel[2];
    console.log(`Picked object ID: ${id}`);
}
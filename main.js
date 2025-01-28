// Main.js
class WebGLApp {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.camera = null;
        this.drawables = [];
        this.pickingFramebuffer = null;

        this.selectedObject = null;
        this.isDraggingObject = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        window.onload = () => this.initialize();
    }

    initialize() {
        this.setupCanvas();
        if (!this.canvas) return;

        this.setupWebGLContext();
        if (!this.gl) return;

        this.setupCamera();
        this.createScene();
        this.setupFramebuffers();
        this.setupEventListeners();
        this.setupResizeHandling();
        this.startRendering();
    }

    setupCanvas() {
        this.canvas = document.getElementById('webgl');
        if (!this.canvas) {
            console.error("Failed to retrieve the <canvas> element with ID 'webgl'.");
        }
    }

    setupWebGLContext() {
        this.gl = this.canvas.getContext('webgl2');
        if (!this.gl) {
            console.error('Failed to get WebGL2 context');
            return;
        }
        
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    setupCamera() {
        this.camera = new Camera();
        this.camera.yaw = 45;
        this.camera.pitch = 45;
        this.camera.distance = 20;
        this.camera.aspect = this.canvas.width / this.canvas.height;
    }

    createScene() {
        this.drawables.push(
            new Box(this.gl),
            new TShape(this.gl, 5),
            new Floor(this.gl, 0, 100, 100)
        );
    }

    setupFramebuffers() {
        this.resizeCanvas();
        this.pickingFramebuffer = this.createFramebuffer();
    }

    createFramebuffer() {
        const gl = this.gl;
        const { width, height } = this.canvas;
        
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        // Create and configure texture
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, 
                      gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        
        // Create depth buffer
        const depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        
        // Attach buffers
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, 
                              gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, 
                                 gl.RENDERBUFFER, depthBuffer);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return { framebuffer, texture };
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('wheel', this.handleMouseWheel.bind(this));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setupResizeHandling() {
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const { gl, canvas, camera } = this;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        if (gl) {
            gl.viewport(0, 0, canvas.width, canvas.height);
            camera.aspect = canvas.width / canvas.height;
        }
    }

    startRendering() {
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        this.render();
    }

    render() {
        const { gl, camera, drawables } = this;
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        const vpMatrix = camera.getProjectionMatrix()
                            .multiply(camera.getViewMatrix());
        
        drawables.forEach(drawable => drawable.draw(vpMatrix));
        requestAnimationFrame(() => this.render());
    }

    handleMouseDown(event) {
        if (event.button === 0) {
            this.handlePicking(event);
            if (this.selectedObject) {
                this.isDraggingObject = true;
                this.lastMouseX = event.clientX;
                this.lastMouseY = event.clientY;
                event.preventDefault();
            }
        } else {
            event.preventDefault();
            this.camera.isDragging = true;
        }
    }

    handleMouseUp(event) {
        this.camera.isDragging = false;
        this.isDraggingObject = false;
        this.selectedObject = null;
    }

    handleMouseMove(event) {
        if (this.camera.isDragging) {
            this.camera.updateMouse(event.movementX, event.movementY);
        } else if (this.isDraggingObject && this.selectedObject) {
            const dx = event.clientX - this.lastMouseX;
            const dy = event.clientY - this.lastMouseY;
            this.moveSelectedObject(dx, dy);
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        }
    }

    moveSelectedObject(dx, dy) {
        const right = this.camera.right();
        const forward = this.camera.forward();
        const factor = 500;

        // right.elements[1] = 0;
        // forward.elements[1] = 0;

        // // Calculate movement deltas
        // const deltaX = right.multiply(dx * factor);
        // const deltaZ = forward.multiply(-dy * factor); // Negative for natural movement

        this.selectedObject.transform.translation[0] += dx;
    }


    handleMouseWheel(event) {
        event.preventDefault();
        this.camera.handleMouseWheel(event.deltaY);
    }

    handlePicking(event) {
        const { gl, canvas, camera, drawables, pickingFramebuffer } = this;
        const rect = canvas.getBoundingClientRect();
        
        const x = event.clientX - rect.left;
        const y = rect.bottom - event.clientY;

        console.log(camera.right(), camera.forward(), camera.getViewMatrix());

        // Render to picking framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, pickingFramebuffer.framebuffer);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const vpMatrix = camera.getProjectionMatrix()
                            .multiply(camera.getViewMatrix());
        
        drawables.forEach(drawable => drawable.drawPicking(vpMatrix));

        // Read pixel data
        const pixel = new Uint8Array(4);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        const id = (pixel[0] << 16) | (pixel[1] << 8) | pixel[2];
        console.log(`Picked object ID: ${id}`);
        this.selectedObject = this.drawables.find(d => d.id() === id);
        console.log(this.selectedObject);
    }
}

// Initialize application
new WebGLApp();
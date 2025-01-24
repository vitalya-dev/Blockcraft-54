class Camera {
    constructor() {
        this.target = [0, 0, 0]; // Look at the origin
        this.up = [0, 1, 0]; // Up vector
        this.yaw = 0; // Horizontal rotation (degrees)
        this.pitch = 0; // Vertical rotation (degrees)
        this.sensitivity = 0.3; // Mouse sensitivity
        this.distance = 5; // Distance from the target
        this.isDragging = false; // Mouse drag state
        this.fov = 90; // Field of view (degrees)
        this.aspect = 1; // Aspect ratio (set dynamically later)
        this.near = 0.1; // Near clipping plane
        this.far = 100.0; // Far clipping plane
        this.zoomSpeed = 0.005; // Speed of zooming
        this.minDistance = 2; // Minimum zoom distance
        this.maxDistance = 20; // Maximum zoom distance
    }

    getViewMatrix() {
        // Convert yaw and pitch to radians
        const yawRad = (this.yaw * Math.PI) / 180;
        const pitchRad = (this.pitch * Math.PI) / 180;

        // Spherical coordinates to Cartesian conversion
        const z = Math.cos(yawRad) * Math.cos(pitchRad) * this.distance;
        const y = Math.sin(pitchRad) * this.distance;
        const x = Math.sin(yawRad) * Math.cos(pitchRad) * this.distance;


        // Generate the view matrix using lookAt
        return new Matrix4().lookAt(x, y, z, ...this.target, ...this.up);
    }

    getProjectionMatrix() {
        // Generate a perspective projection matrix
        return new Matrix4().perspective(
            this.fov, // FOV in radians
            this.aspect,
            this.near,
            this.far
        );
    }

    updateMouse(deltaX, deltaY) {
        this.yaw -= deltaX * this.sensitivity;
        this.yaw %= 360;
        this.pitch += deltaY * this.sensitivity;

        // Clamp the pitch to prevent flipping
        this.pitch = Math.max(-89, Math.min(89, this.pitch));
    }

     handleMouseWheel(deltaY) {
        // Update distance based on the wheel delta
        this.distance += deltaY * this.zoomSpeed;
        // Clamp the distance to stay within bounds
        this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
    }
}
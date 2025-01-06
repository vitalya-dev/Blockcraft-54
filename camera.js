class Camera {
    constructor(radius, pitch, yaw, target = [0, 0, 0]) {
        this.radius = radius; // Distance from the target
        this.pitch = pitch; // Vertical angle (in radians)
        this.yaw = yaw; // Horizontal angle (in radians)
        this.target = target; // The point the camera orbits around
        this.minRadius = 1; // Minimum zoom distance
        this.maxRadius = 100; // Maximum zoom distance
        this.zoomSpeed = 0.1; // Zoom sensitivity
    }

    updateRadius(delta) {
        this.radius += delta * this.zoomSpeed;
        this.radius = Math.max(this.minRadius, Math.min(this.radius, this.maxRadius)); // Clamp the radius
    }


    updateViewMatrix() {
        const x = this.radius * Math.cos(this.pitch) * Math.sin(this.yaw);
        const y = this.radius * Math.sin(this.pitch);
        const z = this.radius * Math.cos(this.pitch) * Math.cos(this.yaw);

        this.viewMatrix.setLookAt(
            x,
            y,
            z,
            this.target[0],
            this.target[1],
            this.target[2],
            this.up[0],
            this.up[1],
            this.up[2]
        );
    }

    updateOrbit(deltaYaw, deltaPitch) {
        this.yaw += deltaYaw;
        this.pitch += deltaPitch;

        // Clamp pitch to avoid flipping the camera
        const maxPitch = Math.PI / 2 - 0.01;
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

        this.updateViewMatrix();
    }
}

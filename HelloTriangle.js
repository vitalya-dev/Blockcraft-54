
function main() {
    const canvas = document.getElementById("webgl");
    if (!canvas) {
        console.error("Failed to retrieve the <canvas> element");
        return;
    }

    const gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("Failed to get the rendering context for WebGL");
        return;
    }

    const triangle = new Triangle(gl);

    // Apply transformations
    triangle.transform.translation = [0, 0, 0];
    triangle.transform.rotation = [0, 0, 0]; 
    triangle.transform.scale = [1, 1, 1];

    const rotationSpeed = 1;
      // Animation loop
    function render() {
        // Update rotation
        triangle.transform.rotation[1] += rotationSpeed;
        if (triangle.transform.rotation[1] >= 360) {
            triangle.transform.rotation[1] -= 360; // Keep rotation angle in range
        }

        // Clear the canvas
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Draw the triangle
        triangle.draw();

        // Request the next frame
        requestAnimationFrame(render);
    }
    render()
}
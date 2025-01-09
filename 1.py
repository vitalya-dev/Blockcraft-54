import numpy as np

def create_perspective_matrix(fov, aspect_ratio, near, far):
    """
    Create a perspective projection matrix.

    Parameters:
        fov (float): Field of view in degrees.
        aspect_ratio (float): Aspect ratio of the viewport (width / height).
        near (float): Near clipping plane.
        far (float): Far clipping plane.

    Returns:
        numpy.ndarray: A 4x4 perspective projection matrix.
    """
    # Convert FOV from degrees to radians
    fov_rad = np.radians(fov)
    
    # Calculate scale based on FOV
    f = 1 / np.tan(fov_rad / 2)
    
    # Initialize the projection matrix
    perspective_matrix = np.zeros((4, 4))
    
    # Fill in the matrix values
    perspective_matrix[0, 0] = f / aspect_ratio
    perspective_matrix[1, 1] = f
    perspective_matrix[2, 2] = (far + near) / (near - far)
    perspective_matrix[2, 3] = (2 * far * near) / (near - far)
    perspective_matrix[3, 2] = -1
    
    return perspective_matrix

def apply_perspective_projection(matrix, vector):
    """
    Applies a perspective projection matrix to a 4D vector.

    Parameters:
        matrix (numpy.ndarray): The 4x4 perspective projection matrix.
        vector (numpy.ndarray): The 4D vector to transform.

    Returns:
        numpy.ndarray: The transformed 3D vector in NDC space.
    """
    # Multiply the vector by the matrix
    transformed_vector = np.dot(matrix, vector)
    
    # Perform perspective division
    x_ndc = transformed_vector[0] / transformed_vector[3]
    y_ndc = transformed_vector[1] / transformed_vector[3]
    z_ndc = transformed_vector[2] / transformed_vector[3]
    
    return np.array([x_ndc, y_ndc, z_ndc])

# Example vector and perspective matrix
vector = np.array([1, 1, -90, 1])  # A 4D point in homogeneous coordinates
perspective_matrix = create_perspective_matrix(90, 1, 0.1, 100)
print(perspective_matrix)

# Apply perspective projection
ndc_vector = apply_perspective_projection(perspective_matrix, vector)

print("NDC Vector (after perspective division):")
print(ndc_vector)



# Input string
input_data = """
v 1.000000 1.000000 -1.000000
v 1.000000 -1.000000 -1.000000
v 1.000000 1.000000 1.000000
v 1.000000 -1.000000 1.000000
v -1.000000 1.000000 -1.000000
v -1.000000 -1.000000 -1.000000
v -1.000000 1.000000 1.000000
v -1.000000 -1.000000 1.000000
vn -0.0000 1.0000 -0.0000
vn -0.0000 -0.0000 1.0000
vn -1.0000 -0.0000 -0.0000
vn -0.0000 -1.0000 -0.0000
vn 1.0000 -0.0000 -0.0000
vn -0.0000 -0.0000 -1.0000
vt 0.875000 0.500000
vt 0.625000 0.750000
vt 0.625000 0.500000
vt 0.375000 1.000000
vt 0.375000 0.750000
vt 0.625000 0.000000
vt 0.375000 0.250000
vt 0.375000 0.000000
vt 0.375000 0.500000
vt 0.125000 0.750000
vt 0.125000 0.500000
vt 0.625000 0.250000
vt 0.875000 0.750000
vt 0.625000 1.000000
s 0
f 5/1/1 3/2/1 1/3/1
f 3/2/2 8/4/2 4/5/2
f 7/6/3 6/7/3 8/8/3
f 2/9/4 8/10/4 6/11/4
f 1/3/5 4/5/5 2/9/5
f 5/12/6 2/9/6 6/7/6
f 5/1/1 7/13/1 3/2/1
f 3/2/2 7/14/2 8/4/2
f 7/6/3 5/12/3 6/7/3
f 2/9/4 4/5/4 8/10/4
f 1/3/5 3/2/5 4/5/5
f 5/12/6 1/3/6 2/9/6
"""

# Functions to parse components
def parse_vertices(lines):
    vertices = []
    for line in lines:
        if line.startswith("v "):  # Vertex
            parts = line.split()[1:]
            vertices.append(", ".join(map(str, map(float, parts))))
    return vertices

def parse_faces(lines):
    indices = []
    for line in lines:
        if line.startswith("f "):  # Face
            parts = line.split()[1:]
            indices.append([int(part.split("/")[0]) - 1 for part in parts])
    return indices

def parse_normals(lines):
    normals = []
    for line in lines:
        if line.startswith("vn "):  # Normal
            parts = line.split()[1:]
            normals.append(", ".join(map(str, map(float, parts))))
    return normals

def parse_texture_coords(lines):
    texture_coords = []
    for line in lines:
        if line.startswith("vt "):  # Texture Coordinate
            parts = line.split()[1:]
            texture_coords.append(", ".join(map(str, map(float, parts))))
    return texture_coords

# Main parsing function
def parse_obj(input_data):
    lines = input_data.strip().splitlines()
    vertices = parse_vertices(lines)
    indices = parse_faces(lines)
    normals = parse_normals(lines)
    texture_coords = parse_texture_coords(lines)
    return vertices, indices, normals, texture_coords

# Parse the input data
vertices, indices, normals, texture_coords = parse_obj(input_data)

# Output formatted data
print("this.vertices = new Float32Array([\n    " + ",\n    ".join(vertices) + "\n]);")

formatted_indices = ",\n    ".join(", ".join(map(str, triangle)) for triangle in indices)
print(f"this.indices = new Uint8Array([\n    {formatted_indices}\n]);")

if normals:
    print("this.normals = new Float32Array([\n    " + ",\n    ".join(normals) + "\n]);")

if texture_coords:
    print("this.textureCoords = new Float32Array([\n    " + ",\n    ".join(texture_coords) + "\n]);")

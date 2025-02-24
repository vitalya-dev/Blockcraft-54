def parse_obj(input_data):
    vertices = []
    normals = []
    tex_coords = []
    indices = []

    vertex_array_buffer = []
    normal_array_buffer = []

    for line in input_data.splitlines():
        if line.startswith("v "):  # Vertex
            vertices.append([float(v) for v in line.split()[1:]])
        elif line.startswith("vn "):  # Vertex normal
            normals.append([float(vn) for vn in line.split()[1:]])
        elif line.startswith("f "):  # Face
            face_indices = line.split()[1:]
            for vertex in face_indices:
                v, _, n = [int(idx) - 1 if idx else -1 for idx in vertex.split('/')]
                vertex_array_buffer.extend(vertices[v])
                normal_array_buffer.extend(normals[n])

    # Format buffers as JavaScript arrays with one line per vertex/normal
    def format_array(data, elements_per_line):
        lines = [
            ", ".join([f"{data[i + j]:.1f}" for j in range(elements_per_line)])
            for i in range(0, len(data), elements_per_line)
        ]
        return "[\n    " + ",\n    ".join(lines) + "\n]"

    vertex_buffer_js = "this.vertices = new Float32Array(" + format_array(vertex_array_buffer, 3) + ");"
    normal_buffer_js = "this.normals = new Float32Array(" + format_array(normal_array_buffer, 3) + ");"

    return {
        "vertex_buffer_js": vertex_buffer_js,
        "normal_buffer_js": normal_buffer_js,
    }


# Input data
input_data = """
# Blender 4.3.2
# www.blender.org
mtllib TShape.mtl
o Cube
v -1.500000 -0.500000 0.000000
v -1.500000 0.500000 0.000000
v -1.500000 -0.500000 -1.000000
v -1.500000 0.500000 -1.000000
v 1.500000 -0.500000 0.000000
v 1.500000 0.500000 0.000000
v 1.500000 -0.500000 -1.000000
v 1.500000 0.500000 -1.000000
v 0.500000 -0.500000 -1.000000
v -0.500000 -0.500000 -1.000000
v -0.500000 0.500000 -1.000000
v 0.500000 0.500000 -1.000000
v -0.500000 -0.500000 0.000000
v 0.500000 -0.500000 0.000000
v 0.500000 0.500000 0.000000
v -0.500000 0.500000 0.000000
v -0.500000 -0.500000 1.000000
v 0.500000 -0.500000 1.000000
v 0.500000 0.500000 1.000000
v -0.500000 0.500000 1.000000
vn -1.0000 -0.0000 -0.0000
vn -0.0000 -0.0000 -1.0000
vn 1.0000 -0.0000 -0.0000
vn -0.0000 -0.0000 1.0000
vn -0.0000 -1.0000 -0.0000
vn -0.0000 1.0000 -0.0000
vt 0.625000 0.000000
vt 0.375000 0.250000
vt 0.375000 0.000000
vt 0.625000 0.416667
vt 0.375000 0.500000
vt 0.375000 0.416667
vt 0.625000 0.500000
vt 0.375000 0.750000
vt 0.625000 0.916667
vt 0.375000 1.000000
vt 0.375000 0.916667
vt 0.291667 0.750000
vt 0.291667 0.500000
vt 0.875000 0.500000
vt 0.791667 0.750000
vt 0.791667 0.500000
vt 0.708333 0.500000
vt 0.625000 0.750000
vt 0.708333 0.750000
vt 0.208333 0.500000
vt 0.125000 0.750000
vt 0.125000 0.500000
vt 0.208333 0.750000
vt 0.375000 0.833333
vt 0.625000 0.250000
vt 0.375000 0.333333
vt 0.625000 0.333333
vt 0.625000 0.833333
vt 0.625000 1.000000
vt 0.875000 0.750000
s 0
f 2/1/1 3/2/1 1/3/1
f 12/4/2 7/5/2 9/6/2
f 8/7/3 5/8/3 7/5/3
f 16/9/4 1/10/4 13/11/4
f 7/5/5 14/12/5 9/13/5
f 4/14/6 16/15/6 11/16/6
f 12/17/6 6/18/6 8/7/6
f 11/16/6 15/19/6 12/17/6
f 10/20/5 1/21/5 3/22/5
f 9/13/5 13/23/5 10/20/5
f 6/18/4 14/24/4 5/8/4
f 16/15/6 19/19/6 15/19/6
f 4/25/2 10/26/2 3/2/2
f 11/27/2 9/6/2 10/26/2
f 19/28/4 17/11/4 18/24/4
f 14/12/5 17/23/5 13/23/5
f 15/28/3 18/24/3 14/24/3
f 13/11/1 20/9/1 16/9/1
f 2/1/1 4/25/1 3/2/1
f 12/4/2 8/7/2 7/5/2
f 8/7/3 6/18/3 5/8/3
f 16/9/4 2/29/4 1/10/4
f 7/5/5 5/8/5 14/12/5
f 4/14/6 2/30/6 16/15/6
f 12/17/6 15/19/6 6/18/6
f 11/16/6 16/15/6 15/19/6
f 10/20/5 13/23/5 1/21/5
f 9/13/5 14/12/5 13/23/5
f 6/18/4 15/28/4 14/24/4
f 16/15/6 20/15/6 19/19/6
f 4/25/2 11/27/2 10/26/2
f 11/27/2 12/4/2 9/6/2
f 19/28/4 20/9/4 17/11/4
f 14/12/5 18/12/5 17/23/5
f 15/28/3 19/28/3 18/24/3
f 13/11/1 17/11/1 20/9/1
"""

# Parse the OBJ data
result = parse_obj(input_data)

# Print the JavaScript-formatted buffers
print(result["vertex_buffer_js"])
print(result["normal_buffer_js"])

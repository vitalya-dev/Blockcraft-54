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
v -2.066483 4.033517 -1.966483
v -1.966483 4.033517 -1.966483
v -2.066483 4.033517 4.033518
v -1.966483 4.033517 4.033518
v -2.066484 -2.066483 -1.966483
v -1.966484 -2.066483 -1.966483
v -2.066484 -2.066483 4.033518
v -1.966484 -2.066483 4.033518
v -1.966482 -2.066480 -1.966483
v -1.966482 -1.966481 -1.966483
v -1.966483 -2.066481 4.033517
v -1.966483 -1.966482 4.033517
v 4.033517 -2.066481 -1.966483
v 4.033517 -1.966482 -1.966482
v 4.033517 -2.066482 4.033518
v 4.033517 -1.966483 4.033518
v 4.033517 4.033516 -2.066483
v 4.033517 4.033516 -1.966483
v -2.066483 4.033517 -2.066482
v -2.066483 4.033517 -1.966483
v 4.033516 -2.066483 -2.066483
v 4.033516 -2.066483 -1.966483
v -2.066484 -2.066483 -2.066482
v -2.066484 -2.066483 -1.966483
vn -1.0000 -0.0000 -0.0000
vn -0.0000 -0.0000 1.0000
vn -0.0000 -1.0000 -0.0000
vn 1.0000 -0.0000 -0.0000
vn -0.0000 1.0000 -0.0000
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
usemtl Material
f 5/1/1 3/2/1 1/3/1
f 3/2/2 8/4/2 4/5/2
f 7/6/3 6/7/3 8/8/3
f 2/9/4 8/10/4 6/11/4
f 1/3/5 4/5/5 2/9/5
f 6/7/6 1/3/6 2/9/6
f 13/1/3 11/2/3 9/3/3
f 11/2/2 16/4/2 12/5/2
f 15/6/4 14/7/4 16/8/4
f 14/11/5 12/5/5 16/10/5
f 9/3/1 12/5/1 10/9/1
f 13/12/6 10/9/6 14/7/6
f 21/1/6 19/2/6 17/3/6
f 19/2/1 24/4/1 20/5/1
f 23/6/3 22/7/3 24/8/3
f 18/9/2 24/10/2 22/11/2
f 17/3/5 20/5/5 18/9/5
f 21/12/4 18/9/4 22/7/4
f 5/1/1 7/13/1 3/2/1
f 3/2/2 7/14/2 8/4/2
f 7/6/3 5/12/3 6/7/3
f 2/9/4 4/5/4 8/10/4
f 1/3/5 3/2/5 4/5/5
f 6/7/6 5/12/6 1/3/6
f 13/1/3 15/13/3 11/2/3
f 11/2/2 15/14/2 16/4/2
f 15/6/4 13/12/4 14/7/4
f 14/11/5 10/9/5 12/5/5
f 9/3/1 11/2/1 12/5/1
f 13/12/6 9/3/6 10/9/6
f 21/1/6 23/13/6 19/2/6
f 19/2/1 23/14/1 24/4/1
f 23/6/3 21/12/3 22/7/3
f 18/9/2 20/5/2 24/10/2
f 17/3/5 19/2/5 20/5/5
f 21/12/4 17/3/4 18/9/4
"""

# Parse the OBJ data
result = parse_obj(input_data)

# Print the JavaScript-formatted buffers
print(result["vertex_buffer_js"])
print(result["normal_buffer_js"])

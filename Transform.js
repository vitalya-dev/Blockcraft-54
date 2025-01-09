class Transform {
    constructor() {
        this.translation = [0, 0, 0];
        this.rotation = [0, 0, 0]; // rotation angles in degrees
        this.scale = [1, 1, 1];
    }
    getMatrix() {
        const matrix = new Matrix4();
        matrix.setTranslate(...this.translation);
        matrix.rotate(this.rotation[0], 1, 0, 0);
        matrix.rotate(this.rotation[1], 0, 1, 0);
        matrix.rotate(this.rotation[2], 0, 0, 1);
        matrix.scale(...this.scale);
        return matrix;
    }
}
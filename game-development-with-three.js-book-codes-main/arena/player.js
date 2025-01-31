import * as THREE from 'three';

const Player = () => {
  THREE.Mesh.apply(this, arguments);
	this.rotation.order = 'YXZ';
	this._aggregateRotation = new THREE.Vector3();
	this.CameraHeight = 40;
	this.velocity = new THREE.Vector3();
	this.acceleration = new THREE.Vector3(0, -150, 0);
	this.ambientFriction = new THREE.Vector3(-10, 0, -10);
	this.moveDirection = {
		FORWARD: false,
		BACKWARD: false,
		LEFT: false,
		RIGHT: false
	}
}

Player.prototype = Object.create(THREE.Mesh.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = (() => {
	const halfAccel = new THREE.Vector3();
	const scaledVelocity = new THREE.Vector3();
	return (delta) => {
		const r = this._aggregateRotation.multiplyScalar(delta).add(this.rotation);
		r.x = Math.max(Math.PI * -0.5, Math.min(Math.PI * 0.5, r.x));
		this.rotation.x = 0;

		if (this.moveDirection.FORWARD) this.velocity.z -= Player.SPEED;
		if (this.moveDirection.LEFT) this.velocity.x -= Player.SPEED;
		if (this.moveDirection.BACKWARD) this.velocity.z += Player.SPEED;
		if (this.moveDirection.RIGHT) this.velocity.x += Player.SPEED;

		halfAccel.copy(this.acceleration).multiplyScalar(delta * 0.5);
		this.velocity.add(halfAccel);
		const squaredVelocity = this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z;

		if (squaredVelocity > Player.SPEED * Player.SPEED) {
			const scalar = Player.SPEED / Math.sqrt(squaredVelocity);
			this.velocity.x *= scalar;
			this.velocity.z *= scalar;
		}

		scaledVelocity.copy(this.velocity).multiplyScalar(delta);
		this.translateX(scaledVelocity.x);
		this.translateZ(scaledVelocity.z);
		this.position.y += scaledVelocity.y;
		this.velocity.add(halfAccel);

		this.velocity.add(scaledVelocity.multiply(this.ambientFriction));

		this.rotation.set(r.x, r.y, r.z);
		this._aggregateRotation.set(0, 0, 0);
	}
})();

export default Player;
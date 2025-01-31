import * as THREE from 'three';
import Player from './player';

const scene = new THREE.Scene();

const spawnPoints = [];

let map = "XXXXXXX \n" +
            "X     X \n" +
            "X  S  X \n" +
            "X     X \n" +
            "X   S XXX\n" +
            "XXX     X\n" +
            " XX   S X\n" +
            "  X     X\n" +
            "   XXXXXX";

map = map.split("\n");
const HORIZONTAL_UNIT = 100;
const VERTICAL_UNIT = 100;
const ZSIZE = map.length * HORIZONTAL_UNIT;
const XSIZE = map[0].length * HORIZONTAL_UNIT;

const addVoxel = (type, row, col) => {
  const z = (row + 1) * HORIZONTAL_UNIT - ZSIZE * 0.5;
  const x = (col + 1) * HORIZONTAL_UNIT - XSIZE * 0.5;
  
  switch(type) {
    case ' ': break;
    case 'S': 
      spawnPoints.push(new THREE.Vector3(x, 0, z)); 
        break;
    case 'X':
      const geo = new THREE.BoxGeometry(HORIZONTAL_UNIT, VERTICAL_UNIT, HORIZONTAL_UNIT);
			const material = new THREE.MeshPhongMaterial({color: Math.random() * 0xffffff});
			const mesh = new THREE.Mesh(geo, material)
			mesh.position.set(x, VERTICAL_UNIT * 0.5, z);
			break;
  }
}

for (let i = 0, rows = map.length; i < rows; i++) {
  for(let j = 0, cols = map[i].length; j < cols; j++) {
    addVoxel(map[i].charAt(j), i, j);
  }
}

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

const player = new Player();
player.add(camera);
scene.add(player);

document.addEventListener('mousemove', (event) => {
	player.rotate(event.movementY, event.movementX, 0);
});

document.addEventListener('keydown', (event) => {
	switch (event.keyCode) {
		case 38: /* up */
		case 87: /* W */ player.moveDirection.FORWARD = true; break;
		
		case 37: /* left */
		case 65: /* A */ player.moveDirection.LEFT = true; break;

		case 40: /* down */
		case 83: /* S */ player.moveDirection.BACKWARD = true; break;

		case 39: /* right */
		case 68: /* D */ player.moveDirection.RIGHT = true; break;

		case 32: /* space */ player.jump(); break;
	}
}, false)
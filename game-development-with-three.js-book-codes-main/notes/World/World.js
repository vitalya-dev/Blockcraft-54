import { createCamera } from './components/camera';
import { createCube } from './components/cube';
import { createScene } from './components/scene';
import { createLights } from './systems/lights';

import { createRenderer } from './systems/renderer';
import { Resizer } from './systems/Resizer';

// module-scoped: private variables instead of using this.camera = creareCamera()
let camera;
let renderer;
let scene;

class World {
  constructor(container) {
		camera = createCamera();
		scene = createScene();
		renderer = createRenderer();
		container.append(renderer.domElement);

		const cube = createCube();
		const light = createLights();

		scene.add(cube, light);

		const resizer = new Resizer(container, camera, renderer);
	}
	
	render() {
		// draw a single frame
		renderer.render(scene, camera);
	}
}

export { World }
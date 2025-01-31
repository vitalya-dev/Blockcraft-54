import * as THREE from 'three';
import GRAY_COLORS from './gray_scale_colors';

const randomNumber = (min, max) => { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const addCitySceen = (scene) => {
    const boxGeometry = new THREE.BoxGeometry();
    const boxMatrix = new THREE.Matrix4().makeTranslation(0, 0.5, 0);
    boxGeometry.applyMatrix4(boxMatrix);
    const boxMaterial = new THREE.MeshBasicMaterial();
    boxMaterial.color = new THREE.Color('#397c8d')
    // const cube = new THREE.Mesh(boxGeometry, boxMaterial);

    for (let i = 0; i < 100; i++) {
      const buildingMaterial = boxMaterial.clone();
      buildingMaterial.color = new THREE.Color(GRAY_COLORS[randomNumber(0, GRAY_COLORS.length - 1)]);
      const building = new THREE.Mesh(boxGeometry.clone(), buildingMaterial);
      building.position.x = Math.floor(Math.random() * 200 - 100) * 4;
      building.position.z = Math.floor(Math.random() * 200 - 100) * 4;
      building.scale.x = Math.random() * 50 + 10;
      building.scale.y = Math.random() * building.scale.x * 8 + 8;
      building.scale.z = building.scale.x;
      scene.add(building);
    }

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(2000, 2000, 20, 20);
    const floorMaterial = new THREE.MeshBasicMaterial({color: 0x9db3b5, overdraw: true});
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.rotation.x = -90 * Math.PI / 180;
    scene.add(floorMesh)
}

export { addCitySceen }
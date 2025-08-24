import { useEffect } from "react";
import * as THREE from "three";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export default function ModelViewer() {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 灯光
    const light = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(light);

    // 直接加载 OBJ 文件（无材质文件）
    const objLoader = new OBJLoader();
    objLoader.load("/assets/trytry.obj", (object) => {
      // 为模型添加默认材质
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshLambertMaterial({ color: 0x888888 });
        }
      });
      
      object.scale.set(0.01, 0.01, 0.01);
      object.position.set(0, 0, 0);
      scene.add(object);
    }, undefined, (error) => {
      console.error('加载OBJ模型失败:', error);
    });

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
  }, []);

  return null;
}
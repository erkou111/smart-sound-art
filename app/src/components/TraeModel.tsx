import { useEffect } from "react";
import * as THREE from "three";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

export default function TraeModel() {
  useEffect(() => {
    // 场景
    const scene = new THREE.Scene();

    // 相机
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);       // 确保相机对着模型

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("trae-container").appendChild(renderer.domElement);

    // 灯光
    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    // 创建材质
    const material = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      side: THREE.DoubleSide
    });

    // 加载 MTL 和 OBJ
    const mtlLoader = new MTLLoader();
    mtlLoader.load('/assets/smart.mtl', (materials) => {
      materials.preload();

      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load('/assets/smart.obj', (object) => {
        object.scale.set(0.01, 0.01, 0.01); // 缩小
        object.position.set(0, 0, 0);       // 放到原点

        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.computeVertexNormals();
            child.material.side = THREE.DoubleSide;
            child.material.wireframe = false;  // 取消线框
          }
        });

        scene.add(object);
      });
    });

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // 清理
    return () => {
      renderer.dispose();
    };
  }, []);

  return <div id="trae-container" style={{ width: "100%", height: "100vh" }} />;
}
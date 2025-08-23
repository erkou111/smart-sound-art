import { useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

    // 加载 GLB
    const gltfLoader = new GLTFLoader();
    console.log('开始加载 jiuming.glb 文件...');
    
    gltfLoader.load(
      '/assets/jiuming.glb',
      // 成功回调
      (gltf) => {
        console.log('GLB文件加载成功:', gltf);
        const object = gltf.scene;
        object.scale.set(0.01, 0.01, 0.01); // 缩小
        object.position.set(0, 0, 0);       // 放到原点
        
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.computeVertexNormals();
            child.material.side = THREE.DoubleSide;
          }
        });
        
        scene.add(object);
        console.log('GLB模型已添加到场景中');
      },
      // 进度回调
      (progress) => {
        console.log('加载进度:', (progress.loaded / progress.total * 100) + '%');
      },
      // 错误回调
      (error) => {
        console.error('GLB文件加载失败:', error);
        console.error('错误详情:', error instanceof Error ? error.message : String(error));
        
        // 创建一个简单的立方体作为备用
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 0, 0);
        scene.add(cube);
        console.log('已添加红色立方体作为备用模型');
      }
    );

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
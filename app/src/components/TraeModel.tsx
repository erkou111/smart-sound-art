import React, { useEffect, useRef, useState } from "react";
import * as THREE from 'three';

const TraeModel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const cameraAngleRef = useRef({ theta: 0, phi: 0 });
  const cameraDistanceRef = useRef(4);

  useEffect(() => {
    const loadThreeJS = async () => {
      try {
        // 动态导入Three.js
        const THREE = await import("three");
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        
        if (!containerRef.current) return;

        const container = containerRef.current;
        container.innerHTML = ""; // 清空容器
        
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 600;

        // 创建场景
        const scene = new THREE.Scene();
        scene.background = null;

        // 创建相机
         const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
         camera.position.set(0, 0, 4);

        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true, 
          alpha: false
        });
        renderer.setClearColor(0xffffff, 1); // 白色背景
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        // 添加光照
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // 创建测试立方体
         const geometry = new THREE.BoxGeometry(1, 1, 1);
         const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
         const cube = new THREE.Mesh(geometry, material);
         scene.add(cube);

        // 保存引用
         sceneRef.current = scene;
         cameraRef.current = camera;
         rendererRef.current = renderer;
         modelRef.current = cube;

        // 渲染场景
         renderer.render(scene, camera);

        // 尝试加载GLB模型
        const loader = new GLTFLoader();
        loader.load(
          "/assets/jiuming.glb",
          (gltf) => {
            // 移除测试立方体
            scene.remove(cube);
            
            const model = gltf.scene;
             
             // 计算模型边界框
             const box = new THREE.Box3().setFromObject(model);
             const size = box.getSize(new THREE.Vector3());
             const center = box.getCenter(new THREE.Vector3());
             
             // 计算合适的缩放比例，让模型占据大部分显示区域
             const maxDimension = Math.max(size.x, size.y, size.z);
             const targetSize = 1.2; // 目标大小，占据显示区域的大部分
             const scale = targetSize / maxDimension;
             
             model.scale.set(scale, scale, scale);
             scene.add(model);
             
             // 居中模型
             model.position.sub(center.multiplyScalar(scale));
            
            // 更新模型引用
             modelRef.current = model;
             
            // 渲染模型
             renderer.render(scene, camera);
          },
          undefined,
          (error) => {
            // 如果模型加载失败，保持绿色立方体
            console.warn("GLB模型加载失败，使用默认立方体", error);
          }
        );
        
        // 鼠标和触摸事件处理
         const handleMouseDown = (event: MouseEvent | TouchEvent) => {
           event.preventDefault();
           isDraggingRef.current = true;
           const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
           const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
           previousMousePositionRef.current = { x: clientX, y: clientY };
         };

         const handleMouseMove = (event: MouseEvent | TouchEvent) => {
           event.preventDefault();
           if (!isDraggingRef.current || !cameraRef.current) return;
           
           const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
           const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
           
           const deltaX = clientX - previousMousePositionRef.current.x;
           const deltaY = clientY - previousMousePositionRef.current.y;
           
           // 移动相机围绕模型旋转，而不是旋转模型本身
           // 水平拖拽控制水平角度（theta）
           cameraAngleRef.current.theta -= deltaX * 0.01;
           // 垂直拖拽控制垂直角度（phi）
           cameraAngleRef.current.phi += deltaY * 0.01;
           
           // 限制垂直角度，避免翻转
           cameraAngleRef.current.phi = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraAngleRef.current.phi));
           
           // 根据球坐标计算相机位置
           const distance = cameraDistanceRef.current;
           const phi = Math.PI / 2 + cameraAngleRef.current.phi; // 转换为标准球坐标
           const x = distance * Math.sin(phi) * Math.cos(cameraAngleRef.current.theta);
           const y = distance * Math.cos(phi);
           const z = distance * Math.sin(phi) * Math.sin(cameraAngleRef.current.theta);
           
           cameraRef.current.position.set(x, y, z);
           cameraRef.current.lookAt(0, 0, 0); // 始终看向模型中心
           
           previousMousePositionRef.current = { x: clientX, y: clientY };
           
           // 重新渲染
           if (rendererRef.current && sceneRef.current && cameraRef.current) {
             rendererRef.current.render(sceneRef.current, cameraRef.current);
           }
         };

         const handleMouseUp = (event: MouseEvent | TouchEvent) => {
           event.preventDefault();
           isDraggingRef.current = false;
         };

        // 处理窗口大小变化
        const handleResize = () => {
          if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
          
          const newWidth = containerRef.current.clientWidth;
          const newHeight = containerRef.current.clientHeight;
          
          cameraRef.current.aspect = newWidth / newHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newWidth, newHeight);
          if (sceneRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
        };
        
         // 添加事件监听器
         container.addEventListener('mousedown', handleMouseDown);
         container.addEventListener('touchstart', handleMouseDown);
         window.addEventListener('mousemove', handleMouseMove);
         window.addEventListener('touchmove', handleMouseMove);
         window.addEventListener('mouseup', handleMouseUp);
         window.addEventListener('touchend', handleMouseUp);
        window.addEventListener('resize', handleResize);
        
        // 清理函数
        return () => {
           container.removeEventListener('mousedown', handleMouseDown);
           container.removeEventListener('touchstart', handleMouseDown);
           window.removeEventListener('mousemove', handleMouseMove);
           window.removeEventListener('touchmove', handleMouseMove);
           window.removeEventListener('mouseup', handleMouseUp);
           window.removeEventListener('touchend', handleMouseUp);
          window.removeEventListener('resize', handleResize);
          if (container && rendererRef.current?.domElement && container.contains(rendererRef.current.domElement)) {
            container.removeChild(rendererRef.current.domElement);
          }
          rendererRef.current?.dispose();
        };
        
      } catch (error) {
        console.error("Three.js加载失败:", error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              color: white;
              font-size: 18px;
              text-align: center;
            ">
              3D模型加载中...
            </div>
          `;
        }
      }
    };

    // 延迟加载以确保DOM准备就绪
    const timer = setTimeout(loadThreeJS, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        borderRadius: "12px",
        position: "relative",
        backgroundColor: "white",
        cursor: "grab",
        userSelect: "none"
      }}
      onMouseDown={() => {
        if (containerRef.current) {
          containerRef.current.style.cursor = "grabbing";
        }
      }}
      onMouseUp={() => {
        if (containerRef.current) {
          containerRef.current.style.cursor = "grab";
        }
      }}
      onMouseLeave={() => {
        if (containerRef.current) {
          containerRef.current.style.cursor = "grab";
        }
      }}
    />
  );
};

export default TraeModel;
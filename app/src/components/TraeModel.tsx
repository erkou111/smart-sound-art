import React, { useEffect, useRef, useState } from "react";
import * as THREE from 'three';

interface TraeModelProps {
  lightColor?: string;
  ambientLightEnabled?: boolean;
  lightMode?: string;
}

const TraeModel: React.FC<TraeModelProps> = ({ 
  lightColor = "#4f46e5", 
  ambientLightEnabled = true,
  lightMode = "static"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const cameraAngleRef = useRef({ theta: 0, phi: 0 });
  const cameraDistanceRef = useRef(4);
  const lightBallsRef = useRef<THREE.Mesh[]>([]);
  const pointLightsRef = useRef<THREE.PointLight[]>([]);
  const animationFrameRef = useRef<number>();
  
  // 触摸缩放相关状态
  const isPinchingRef = useRef(false);
  const lastPinchDistanceRef = useRef(0);
  const touchesRef = useRef<TouchList | null>(null);

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

        // 创建灯球
         const createLightBalls = () => {
           const lightBalls: THREE.Mesh[] = [];
           const pointLights: THREE.PointLight[] = [];
           const ballGeometry = new THREE.SphereGeometry(0.05, 16, 16);
           
           // 创建6个灯球，围绕模型排列
           for (let i = 0; i < 6; i++) {
             const angle = (i / 6) * Math.PI * 2;
             const radius = 2;
             
             // 创建发光材质
             const ballMaterial = new THREE.MeshStandardMaterial({ 
               color: lightColor,
               transparent: true,
               opacity: 0.9,
               emissive: lightColor,
               emissiveIntensity: 0.5,
               roughness: 0.1,
               metalness: 0.1
             });
             
             const lightBall = new THREE.Mesh(ballGeometry, ballMaterial);
             lightBall.position.set(
               Math.cos(angle) * radius,
               Math.sin(i * 0.5) * 0.5, // 添加一些高度变化
               Math.sin(angle) * radius
             );
             
             // 添加点光源，增加亮度
             const pointLight = new THREE.PointLight(lightColor, 3, 15);
             pointLight.position.copy(lightBall.position);
             scene.add(pointLight);
             
             scene.add(lightBall);
             lightBalls.push(lightBall);
             pointLights.push(pointLight);
           }
           
           lightBallsRef.current = lightBalls;
           pointLightsRef.current = pointLights;
         };
         

        
        if (ambientLightEnabled) {
          createLightBalls();
        }

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
          "/assets/Rebuild 1整体.glb",
          (gltf) => {
            // 移除测试立方体
            scene.remove(cube);
            
            const model = gltf.scene;
             
             // 设置模型材质为半透明
             model.traverse((child) => {
               if (child instanceof THREE.Mesh) {
                 if (child.material) {
                   // 如果是数组材质
                   if (Array.isArray(child.material)) {
                     child.material.forEach((mat) => {
                       mat.transparent = true;
                       mat.opacity = 0.7;
                       mat.needsUpdate = true;
                     });
                   } else {
                     // 单个材质
                     child.material.transparent = true;
                     child.material.opacity = 0.7;
                     child.material.needsUpdate = true;
                   }
                 }
               }
             });
             
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
        
        // 计算两个触摸点之间的距离
        const getTouchDistance = (touches: TouchList) => {
          if (touches.length < 2) return 0;
          const touch1 = touches[0];
          const touch2 = touches[1];
          const dx = touch1.clientX - touch2.clientX;
          const dy = touch1.clientY - touch2.clientY;
          return Math.sqrt(dx * dx + dy * dy);
        };

        // 鼠标和触摸事件处理
        const handleMouseDown = (event: MouseEvent | TouchEvent) => {
          event.preventDefault();
          
          if ('touches' in event) {
            touchesRef.current = event.touches;
            
            if (event.touches.length === 2) {
              // 双指触摸，开始缩放
              isPinchingRef.current = true;
              isDraggingRef.current = false;
              lastPinchDistanceRef.current = getTouchDistance(event.touches);
            } else if (event.touches.length === 1) {
              // 单指触摸，开始拖拽
              isPinchingRef.current = false;
              isDraggingRef.current = true;
              const touch = event.touches[0];
              previousMousePositionRef.current = { x: touch.clientX, y: touch.clientY };
            }
          } else {
            // 鼠标事件
            isPinchingRef.current = false;
            isDraggingRef.current = true;
            previousMousePositionRef.current = { x: event.clientX, y: event.clientY };
          }
        };

         const handleMouseMove = (event: MouseEvent | TouchEvent) => {
          event.preventDefault();
          if (!cameraRef.current) return;
          
          if ('touches' in event) {
            touchesRef.current = event.touches;
            
            if (event.touches.length === 2 && isPinchingRef.current) {
              // 双指缩放
              const currentDistance = getTouchDistance(event.touches);
              if (lastPinchDistanceRef.current > 0) {
                const scale = currentDistance / lastPinchDistanceRef.current;
                
                // 调整相机距离实现缩放，限制缩放范围
                const newDistance = cameraDistanceRef.current / scale;
                cameraDistanceRef.current = Math.max(1, Math.min(10, newDistance));
                
                // 更新相机位置
                const distance = cameraDistanceRef.current;
                const phi = Math.PI / 2 + cameraAngleRef.current.phi;
                const x = distance * Math.sin(phi) * Math.cos(cameraAngleRef.current.theta);
                const y = distance * Math.cos(phi);
                const z = distance * Math.sin(phi) * Math.sin(cameraAngleRef.current.theta);
                
                cameraRef.current.position.set(x, y, z);
                cameraRef.current.lookAt(0, 0, 0);
              }
              lastPinchDistanceRef.current = currentDistance;
              
              // 重新渲染
              if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
              }
            } else if (event.touches.length === 1 && isDraggingRef.current) {
              // 单指拖拽旋转
              const touch = event.touches[0];
              const deltaX = touch.clientX - previousMousePositionRef.current.x;
              const deltaY = touch.clientY - previousMousePositionRef.current.y;
              
              // 移动相机围绕模型旋转
              cameraAngleRef.current.theta -= deltaX * 0.01;
              cameraAngleRef.current.phi += deltaY * 0.01;
              
              // 限制垂直角度，避免翻转
              cameraAngleRef.current.phi = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraAngleRef.current.phi));
              
              // 根据球坐标计算相机位置
              const distance = cameraDistanceRef.current;
              const phi = Math.PI / 2 + cameraAngleRef.current.phi;
              const x = distance * Math.sin(phi) * Math.cos(cameraAngleRef.current.theta);
              const y = distance * Math.cos(phi);
              const z = distance * Math.sin(phi) * Math.sin(cameraAngleRef.current.theta);
              
              cameraRef.current.position.set(x, y, z);
              cameraRef.current.lookAt(0, 0, 0);
              
              previousMousePositionRef.current = { x: touch.clientX, y: touch.clientY };
              
              // 重新渲染
              if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
              }
            }
          } else {
            // 鼠标拖拽旋转
            if (!isDraggingRef.current) return;
            
            const deltaX = event.clientX - previousMousePositionRef.current.x;
            const deltaY = event.clientY - previousMousePositionRef.current.y;
            
            // 移动相机围绕模型旋转
            cameraAngleRef.current.theta -= deltaX * 0.01;
            cameraAngleRef.current.phi += deltaY * 0.01;
            
            // 限制垂直角度，避免翻转
            cameraAngleRef.current.phi = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraAngleRef.current.phi));
            
            // 根据球坐标计算相机位置
            const distance = cameraDistanceRef.current;
            const phi = Math.PI / 2 + cameraAngleRef.current.phi;
            const x = distance * Math.sin(phi) * Math.cos(cameraAngleRef.current.theta);
            const y = distance * Math.cos(phi);
            const z = distance * Math.sin(phi) * Math.sin(cameraAngleRef.current.theta);
            
            cameraRef.current.position.set(x, y, z);
            cameraRef.current.lookAt(0, 0, 0);
            
            previousMousePositionRef.current = { x: event.clientX, y: event.clientY };
            
            // 重新渲染
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
              rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
          }
        };

         const handleMouseUp = (event: MouseEvent | TouchEvent) => {
          event.preventDefault();
          
          if ('touches' in event) {
            touchesRef.current = event.touches;
            
            if (event.touches.length < 2) {
              // 如果少于两个触摸点，停止缩放
              isPinchingRef.current = false;
              lastPinchDistanceRef.current = 0;
            }
            
            if (event.touches.length === 0) {
              // 所有触摸点都离开，停止拖拽
              isDraggingRef.current = false;
            } else if (event.touches.length === 1 && isPinchingRef.current) {
              // 从双指变为单指，切换到拖拽模式
              isPinchingRef.current = false;
              isDraggingRef.current = true;
              const touch = event.touches[0];
              previousMousePositionRef.current = { x: touch.clientX, y: touch.clientY };
            }
          } else {
            // 鼠标事件
            isDraggingRef.current = false;
            isPinchingRef.current = false;
          }
        };

        // 处理鼠标滚轮缩放
        const handleWheel = (event: WheelEvent) => {
          event.preventDefault();
          if (!cameraRef.current) return;
          
          // 根据滚轮方向调整相机距离
          const zoomSpeed = 0.1;
          const delta = event.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
          
          // 调整相机距离，限制缩放范围
          const newDistance = cameraDistanceRef.current * delta;
          cameraDistanceRef.current = Math.max(1, Math.min(10, newDistance));
          
          // 更新相机位置
          const distance = cameraDistanceRef.current;
          const phi = Math.PI / 2 + cameraAngleRef.current.phi;
          const x = distance * Math.sin(phi) * Math.cos(cameraAngleRef.current.theta);
          const y = distance * Math.cos(phi);
          const z = distance * Math.sin(phi) * Math.sin(cameraAngleRef.current.theta);
          
          cameraRef.current.position.set(x, y, z);
          cameraRef.current.lookAt(0, 0, 0);
          
          // 重新渲染
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
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
        container.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleMouseMove, { passive: false });
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchend', handleMouseUp);
        window.addEventListener('resize', handleResize);
        
        // 清理函数
        return () => {
          container.removeEventListener('mousedown', handleMouseDown);
          container.removeEventListener('touchstart', handleMouseDown);
          container.removeEventListener('wheel', handleWheel);
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('touchmove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
          window.removeEventListener('touchend', handleMouseUp);
          window.removeEventListener('resize', handleResize);
          
          // 停止动画
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          
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

  // 监听颜色、氛围灯状态和灯光模式变化
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    
    // 停止之前的动画
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // 控制灯球显示/隐藏
    lightBallsRef.current.forEach(lightBall => {
      lightBall.visible = ambientLightEnabled;
    });
    
    // 控制点光源开关
    pointLightsRef.current.forEach(pointLight => {
      pointLight.visible = ambientLightEnabled;
    });
    
    if (ambientLightEnabled) {
      if (lightMode === 'rainbow') {
        // 启动彩虹动画
        const animateRainbow = () => {
          const time = Date.now() * 0.001;
          
          lightBallsRef.current.forEach((lightBall, index) => {
            // 为每个灯球计算不同的色相，形成彩虹环绕效果
            const hue = (time * 50 + index * 60) % 360;
            const color = new THREE.Color().setHSL(hue / 360, 0.8, 0.7);
            
            // 更新灯球颜色和发光效果
            if (lightBall.material instanceof THREE.MeshStandardMaterial) {
              lightBall.material.color.copy(color);
              lightBall.material.emissive.copy(color);
              lightBall.material.emissiveIntensity = 0.6;
            }
            
            // 更新对应的点光源颜色，增加亮度
            if (pointLightsRef.current[index]) {
              pointLightsRef.current[index].color.copy(color);
              pointLightsRef.current[index].intensity = 3;
            }
          });
          
          // 重新渲染
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
          
          animationFrameRef.current = requestAnimationFrame(animateRainbow);
        };
        
        animateRainbow();
      } else {
        // 静态模式或呼吸模式 - 使用选定的颜色
        lightBallsRef.current.forEach((lightBall, index) => {
          if (lightBall.material instanceof THREE.MeshStandardMaterial) {
            lightBall.material.color.setStyle(lightColor);
            lightBall.material.emissive.setStyle(lightColor);
            lightBall.material.emissiveIntensity = 0.5;
          }
          
          // 更新对应的点光源颜色和亮度
          if (pointLightsRef.current[index]) {
            pointLightsRef.current[index].color.setStyle(lightColor);
            pointLightsRef.current[index].intensity = 3;
          }
        });
        
        // 重新渲染
        if (rendererRef.current && cameraRef.current) {
          rendererRef.current.render(scene, cameraRef.current);
        }
      }
    }
    
    // 清理函数
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [lightColor, ambientLightEnabled, lightMode]);

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
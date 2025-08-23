import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Rhino3dmLoader } from 'three/addons/loaders/3DMLoader.js';
import modelUrl from '../assets/魔法石单音箱集合.3dm?url';

interface Speaker3DViewerProps {
  color: string;
  isConnected: boolean;
  ambientEnabled: boolean;
  volume: number;
}

export const Speaker3DViewer = ({ color, isConnected, ambientEnabled, volume }: Speaker3DViewerProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    speaker: THREE.Group;
    ambientRing?: THREE.Mesh;
    coloredLights: THREE.Light[];
    controls: {
      isMouseDown: boolean;
      mouseX: number;
      mouseY: number;
      rotationX: number;
      rotationY: number;
    };
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 创建场景
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(192, 192); // 48 * 4 = 192px
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    mountRef.current.appendChild(renderer.domElement);

    // 创建音箱模型组
    const speakerGroup = new THREE.Group();
    scene.add(speakerGroup);
    
    // 使用Rhino3dmLoader加载.3dm文件
    const load3dmModel = () => {
      try {
        setLoadingError(null);
        
        const loader = new Rhino3dmLoader();
        
        // 尝试不同的库路径配置
        try {
          // 首先尝试CDN路径
          loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@8.17.0/');
          console.log('=== RHINO3DM LOADER INITIALIZED ===');
          console.log('Library path set to CDN:', 'https://cdn.jsdelivr.net/npm/rhino3dm@8.17.0/');
        } catch (error) {
          console.error('Failed to set library path:', error);
          setLoadingError('无法初始化Rhino3dm加载器');
          return;
        }
        
        console.log('Model URL to load:', modelUrl);
         console.log('File exists check - attempting to load...');
         
         // 添加一个测试标记来识别当前显示的模型
         console.log('=== CURRENT MODEL IDENTIFICATION ===');
         console.log('If you see a RED cylinder, it means 3DM loading failed');
         console.log('If you see a GRAY/DARK cylinder, it means 3DM loaded but no meshes found');
         console.log('If you see your original model, 3DM loading succeeded');
         
         // 加载3dm文件
         loader.load(
           modelUrl,
           // 加载成功回调
           (object) => {
             console.log('=== 3DM MODEL LOADED SUCCESSFULLY ===');
             console.log('Model URL:', modelUrl);
             console.log('Loaded object:', object);
             console.log('Object type:', object.type);
             console.log('Object children count:', object.children.length);
             
             // 详细分析加载的对象结构
             let meshCount = 0;
             let geometryInfo = [];
             
             object.traverse((child) => {
               console.log('Child found:', child.type, child.name || 'unnamed');
               
               if (child instanceof THREE.Mesh) {
                 meshCount++;
                 console.log(`Mesh ${meshCount}:`, {
                   geometry: child.geometry,
                   material: child.material,
                   vertices: child.geometry.attributes.position?.count || 0,
                   faces: child.geometry.index ? child.geometry.index.count / 3 : 0
                 });
                 
                 geometryInfo.push({
                   name: child.name || `Mesh_${meshCount}`,
                   vertices: child.geometry.attributes.position?.count || 0,
                   faces: child.geometry.index ? child.geometry.index.count / 3 : 0
                 });
                 
                 if (child.material) {
                   // 更新材质颜色
                   if (child.material instanceof THREE.MeshStandardMaterial) {
                     child.material.color.setHex(isConnected ? 0x2a2a2a : 0x666666);
                     child.material.metalness = 0.8;
                     child.material.roughness = 0.2;
                   }
                 }
               }
             });
             
             console.log('Total meshes found:', meshCount);
             console.log('Geometry info:', geometryInfo);
             
             if (meshCount === 0) {
               console.warn('WARNING: No meshes found in the 3DM file!');
               setLoadingError('3DM文件中没有找到可显示的网格对象');
               
               // 创建备用模型
               const fallbackGeometry = new THREE.CylinderGeometry(1.2, 1.4, 3, 32);
               const fallbackMaterial = new THREE.MeshStandardMaterial({
                 color: 0xff0000, // 红色表示这是备用模型
                 metalness: 0.8,
                 roughness: 0.2
               });
               const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
               speakerGroup.add(fallbackMesh);
               setModelLoaded(true);
               return;
             }
             
             // 调整模型大小和位置
             const box = new THREE.Box3().setFromObject(object);
             const center = box.getCenter(new THREE.Vector3());
             const size = box.getSize(new THREE.Vector3());
             
             console.log('Model bounding box:', {
               center: center,
               size: size,
               min: box.min,
               max: box.max
             });
             
             // 居中模型
             object.position.sub(center);
             
             // 缩放模型以适应视图
             const maxDim = Math.max(size.x, size.y, size.z);
             if (maxDim > 0) {
               const scale = 3 / maxDim; // 目标大小为3个单位
               object.scale.setScalar(scale);
               console.log('Applied scale:', scale);
             }
             
             // 添加到场景
             speakerGroup.add(object);
             setModelLoaded(true);
             console.log('=== MODEL LOADING COMPLETE ===');
           },
          // 加载进度回调
          (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '% loaded');
          },
          // 加载错误回调
          (error) => {
            console.error('=== 3DM MODEL LOADING FAILED ===');
            console.error('Error details:', error);
            console.error('Error type:', typeof error);
            console.error('Error message:', error?.message || 'Unknown error');
            console.error('Model URL that failed:', modelUrl);
            
            setLoadingError(`3D模型加载失败: ${error?.message || '未知错误'}`);
            
            // 创建备用模型（红色圆柱体表示加载失败）
            console.log('Creating fallback model due to loading failure...');
            const fallbackGeometry = new THREE.CylinderGeometry(1.2, 1.4, 3, 32);
            const fallbackMaterial = new THREE.MeshStandardMaterial({
              color: 0xff4444, // 红色表示这是因为加载失败的备用模型
              metalness: 0.8,
              roughness: 0.2
            });
            const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
            speakerGroup.add(fallbackMesh);
            setModelLoaded(true);
            
            console.log('Fallback model created and added to scene');
          }
        );
        
      } catch (error) {
        console.error('Error initializing 3dm loader:', error);
        setLoadingError(error instanceof Error ? error.message : 'Failed to initialize 3dm loader');
        setModelLoaded(true);
      }
    };
    
    // 开始加载模型
    load3dmModel();
    
    // 氛围灯环
    let ambientRing: THREE.Mesh | undefined;
    const coloredLights: THREE.Light[] = [];
    
    if (ambientEnabled && isConnected) {
      const ringGeometry = new THREE.TorusGeometry(1.5, 0.05, 16, 100);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9
      });
      ambientRing = new THREE.Mesh(ringGeometry, ringMaterial);
      speakerGroup.add(ambientRing);
      
      // 主要彩色点光源 - 前方
      const mainLight = new THREE.PointLight(new THREE.Color(color), 2, 15);
      mainLight.position.set(0, 0, 3);
      mainLight.name = 'mainColorLight';
      scene.add(mainLight);
      coloredLights.push(mainLight);
      
      // 底部向上的光源
      const bottomLight = new THREE.PointLight(new THREE.Color(color), 1.5, 12);
      bottomLight.position.set(0, -3, 0);
      bottomLight.name = 'bottomColorLight';
      scene.add(bottomLight);
      coloredLights.push(bottomLight);
      
      // 环绕光源 - 左侧
      const leftLight = new THREE.PointLight(new THREE.Color(color), 1, 10);
      leftLight.position.set(-4, 1, 2);
      leftLight.name = 'leftColorLight';
      scene.add(leftLight);
      coloredLights.push(leftLight);
      
      // 环绕光源 - 右侧
      const rightLight = new THREE.PointLight(new THREE.Color(color), 1, 10);
      rightLight.position.set(4, 1, 2);
      rightLight.name = 'rightColorLight';
      scene.add(rightLight);
      coloredLights.push(rightLight);
      
      // 顶部光源
      const topLight = new THREE.PointLight(new THREE.Color(color), 0.8, 8);
      topLight.position.set(0, 4, 1);
      topLight.name = 'topColorLight';
      scene.add(topLight);
      coloredLights.push(topLight);
    }
    
    // 照明
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
    pointLight2.position.set(-5, 5, 5);
    scene.add(pointLight2);
    
    // 相机位置
    camera.position.set(3, 2, 5);
    camera.lookAt(0, 0, 0);
    
    // 触控控制
    const controls = {
      isMouseDown: false,
      mouseX: 0,
      mouseY: 0,
      rotationX: 0,
      rotationY: 0
    };
    
    const handleMouseDown = (event: MouseEvent | TouchEvent) => {
      controls.isMouseDown = true;
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
      controls.mouseX = clientX;
      controls.mouseY = clientY;
    };
    
    const handleMouseMove = (event: MouseEvent | TouchEvent) => {
      if (!controls.isMouseDown) return;
      
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
      
      const deltaX = clientX - controls.mouseX;
      const deltaY = clientY - controls.mouseY;
      
      controls.rotationY += deltaX * 0.01;
      controls.rotationX += deltaY * 0.01;
      
      // 限制垂直旋转
      controls.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, controls.rotationX));
      
      speakerGroup.rotation.y = controls.rotationY;
      speakerGroup.rotation.x = controls.rotationX;
      
      controls.mouseX = clientX;
      controls.mouseY = clientY;
    };
    
    const handleMouseUp = () => {
      controls.isMouseDown = false;
    };
    
    // 事件监听
    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleMouseDown);
    canvas.addEventListener('touchmove', handleMouseMove);
    canvas.addEventListener('touchend', handleMouseUp);
    
    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      
      // 呼吸效果
      if (ambientEnabled && isConnected) {
        const scale = 1 + Math.sin(Date.now() * 0.002) * 0.02;
        speakerGroup.scale.setScalar(scale);
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // 保存引用
    sceneRef.current = {
      scene,
      camera,
      renderer,
      speaker: speakerGroup,
      ambientRing,
      coloredLights,
      controls
    };
    
    // 清理函数
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleMouseDown);
      canvas.removeEventListener('touchmove', handleMouseMove);
      canvas.removeEventListener('touchend', handleMouseUp);
      renderer.dispose();
    };
  }, []);
  
  // 更新颜色和状态
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const { scene, speaker, coloredLights } = sceneRef.current;
    
    // 更新材质颜色
    speaker.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
          if (child === speaker.children[0]) { // 主体
            child.material.color.setHex(isConnected ? 0x2a2a2a : 0x666666);
          }
        }
      }
    });
    
    // 更新氛围灯环
    const existingRing = speaker.children.find(child => 
      child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry
    );
    
    if (ambientEnabled && isConnected) {
      // 更新氛围灯环颜色
      if (existingRing instanceof THREE.Mesh && existingRing.material instanceof THREE.MeshStandardMaterial) {
        const newColor = new THREE.Color(color);
        existingRing.material.color.copy(newColor);
        existingRing.material.emissive.copy(newColor);
      }
      
      // 更新所有彩色光源的颜色
      coloredLights.forEach((light) => {
        if (light instanceof THREE.PointLight) {
          light.color.setHex(parseInt(color.replace('#', '0x')));
        }
      });
      
      // 根据音量调整光源强度
      const volumeIntensity = Math.max(0.3, volume / 100);
      coloredLights.forEach((light, index) => {
        if (light instanceof THREE.PointLight) {
          const baseIntensities = [2, 1.5, 1, 1, 0.8]; // 对应各个光源的基础强度
          light.intensity = (baseIntensities[index] || 1) * volumeIntensity;
        }
      });
      
    } else {
      // 关闭所有彩色光源
      coloredLights.forEach((light) => {
        if (light instanceof THREE.PointLight) {
          light.intensity = 0;
        }
      });
    }
  }, [color, isConnected, ambientEnabled, volume]);

  return (
    <div className="relative w-48 h-48 mx-auto">
      <div 
        ref={mountRef} 
        className="w-48 h-48 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />
      
      {/* 加载状态 */}
      {!modelLoaded && !loadingError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground">加载3D模型中...</p>
          </div>
        </div>
      )}
      
      {/* 错误状态 */}
      {loadingError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/10 rounded-lg">
          <div className="text-center p-2">
            <p className="text-xs text-red-500 mb-1">模型加载失败</p>
            <p className="text-xs text-muted-foreground">使用备用模型</p>
          </div>
        </div>
      )}
    </div>
  );
};
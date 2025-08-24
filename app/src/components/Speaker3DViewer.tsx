import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// Import GLTF model with proper path
const modelUrl = '/assets/Rebuild 1整体.glb';

interface Speaker3DViewerProps {
  color: string;
  isConnected: boolean;
  ambientEnabled: boolean;
  volume: number;
  autoRotate?: boolean; // 控制是否启用自动旋转
}

export const Speaker3DViewer = ({ color, isConnected, ambientEnabled, volume, autoRotate = true }: Speaker3DViewerProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationIdRef = useRef<number | null>(null);
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

    // 清理现有的canvas元素以避免WebGL上下文冲突
    const existingCanvases = mountRef.current.querySelectorAll('canvas');
    existingCanvases.forEach(existingCanvas => {
      const glContext = existingCanvas.getContext('webgl') || existingCanvas.getContext('experimental-webgl') || existingCanvas.getContext('webgl2');
      if (glContext) {
        const loseContext = (glContext as WebGLRenderingContext).getExtension('WEBGL_lose_context');
        if (loseContext) {
          loseContext.loseContext();
        }
      }
    });
    
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    // 创建场景
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    
    // 强制清理所有现有的WebGL上下文
    const globalCanvases = document.querySelectorAll('canvas');
    globalCanvases.forEach(canvasElement => {
      const glContext = canvasElement.getContext('webgl') || canvasElement.getContext('experimental-webgl');
      if (glContext && (glContext as WebGLRenderingContext).getExtension('WEBGL_lose_context')) {
(glContext as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
      }
    });
    
    // 创建新的canvas元素
    const newCanvas = document.createElement('canvas');
    newCanvas.width = 192;
    newCanvas.height = 192;
    newCanvas.style.display = 'block';
    newCanvas.style.width = '192px';
    newCanvas.style.height = '192px';
    
    // 尝试创建WebGL渲染器
    let renderer: THREE.WebGLRenderer;
    
    try {
      // 优化的WebGL渲染器配置
      renderer = new THREE.WebGLRenderer({ 
        canvas: newCanvas,
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: false,
        stencil: false,
        depth: true
      });
      
      console.log('=== WebGL渲染器创建成功 ===');
    } catch (error) {
      console.error('=== WebGL渲染器创建失败 ===', error);
      setLoadingError('WebGL渲染器创建失败: ' + (error as Error).message);
      return;
    }
    
    // 动态设置渲染器尺寸
    const containerSize = 192; // w-48 h-48 = 192px
    renderer.setSize(containerSize, containerSize);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    // 限制像素比（用户建议的优化要点）
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // GPU优化信息输出
    const gl = renderer.getContext();
    console.log('=== GPU硬件加速信息 ===');
    console.log('GPU厂商:', gl.getParameter(gl.VENDOR));
    console.log('GPU渲染器:', gl.getParameter(gl.RENDERER));
    console.log('WebGL版本:', gl.getParameter(gl.VERSION));
    console.log('最大纹理尺寸:', gl.getParameter(gl.MAX_TEXTURE_SIZE));
    console.log('最大顶点属性:', gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
    console.log('最大片段纹理单元:', gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
    
    // WebGL上下文丢失和恢复处理
    // canvas变量已在上面创建，这里直接使用
    
    const handleContextLost = (event: Event) => {
      console.warn('=== WebGL上下文丢失 ===');
      event.preventDefault();
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
    
    const handleContextRestored = () => {
      console.log('=== WebGL上下文恢复 ===');
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      animate();
      console.log('GPU上下文恢复完成，渲染已重启');
    };
    
    newCanvas.addEventListener('webglcontextlost', handleContextLost, false);
      newCanvas.addEventListener('webglcontextrestored', handleContextRestored, false);
    
    mountRef.current.appendChild(renderer.domElement);

    // 创建音箱模型组
    const speakerGroup = new THREE.Group();
    scene.add(speakerGroup);
    
    // 彩色光源数组
    const coloredLights: THREE.Light[] = [];
    
    // 使用GLTFLoader加载.glb文件（按用户建议优化）
    const loadGltfModel = () => {
      try {
        setLoadingError(null);
        
        // 设置Draco压缩解码器（用户建议的优化）
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
        
        loader.load(
          modelUrl,
          (gltf) => {
            console.log('GLTF模型加载成功:', gltf);
            const object = gltf.scene;
            
            let meshCount = 0;
            object.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                meshCount++;
                // 启用阴影
                child.castShadow = true;
                child.receiveShadow = true;
                
                // 回退使用 MeshStandardMaterial 以提高兼容性，避免部分 GPU 对 PhysicalMaterial 着色器编译失败
                const standardMat = new THREE.MeshStandardMaterial({
                  color: isConnected ? 0xaaaaaa : 0x888888,
                  metalness: 0.8,
                  roughness: 0.2,
                  envMapIntensity: 1.5
                });
                if (child.material) {
                  (child.material as THREE.Material).dispose();
                }
                child.material = standardMat;
              }
            });
            
            if (meshCount === 0) {
              console.warn('WARNING: No meshes found in the GLTF file!');
              createSpeakerModel();
              return;
            }
            
            // 调整模型大小和位置
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            object.position.sub(center);
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0) {
              const scale = 6 / maxDim; // 放大模型，避免过小导致看不见
              object.scale.setScalar(scale);
            }
            
            speakerGroup.add(object);
            setModelLoaded(true);
            console.log('GLTF模型添加到场景成功，面数:', meshCount);
          },
          (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            console.log('GLTF加载进度:', percent + '%');
          },
          (error) => {
            console.error('GLTF加载失败:', error);
            setLoadingError('模型加载失败: ' + error);
            createSpeakerModel();
          }
        );
      } catch (error) {
        console.error('GLTFLoader初始化失败:', error);
        setLoadingError('模型加载器初始化失败');
        createSpeakerModel();
      }
    };
    
    // 创建简化音箱模型
    const createSpeakerModel = () => {
      console.log('Creating artistic complex polyhedron model...');
    
      // 创建主体 - 基于十二面体的复合几何体
      const mainGeometry = new THREE.DodecahedronGeometry(1.2, 0);
      
      // 添加细分和变形
      const positionAttr = mainGeometry.getAttribute('position');
      const vertex = new THREE.Vector3();
      for (let i = 0; i < positionAttr.count; i++) {
        vertex.fromBufferAttribute(positionAttr, i);
        // 使用正弦波创建有机变形
        const wave = Math.sin(vertex.x * 3) * Math.cos(vertex.y * 2) * Math.sin(vertex.z * 4);
        const noise = (Math.random() - 0.5) * 0.15 + wave * 0.1;
        vertex.addScaledVector(vertex.clone().normalize(), noise);
        positionAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }
      positionAttr.needsUpdate = true;
      mainGeometry.computeVertexNormals();
    
      // 主体材质 - 渐变金属效果
      const mainMaterial = new THREE.MeshStandardMaterial({
        color: isConnected ? 0x4a90e2 : 0x7b68ee,
        metalness: 0.8,
        roughness: 0.2,
        envMapIntensity: 2.0,
        emissive: isConnected ? 0x001122 : 0x110022,
        emissiveIntensity: 0.1
      });
    
      const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
      mainMesh.castShadow = true;
      mainMesh.receiveShadow = true;
    
      // 创建内核 - 小型八面体
      const coreGeometry = new THREE.OctahedronGeometry(0.4, 1);
      const coreMaterial = new THREE.MeshStandardMaterial({
        color: isConnected ? 0xff6b6b : 0xffa726,
        metalness: 0.9,
        roughness: 0.1,
        emissive: isConnected ? 0x330000 : 0x331100,
        emissiveIntensity: 0.3
      });
      const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
      coreMesh.castShadow = true;
      coreMesh.receiveShadow = true;
    
      // 创建装饰环 - 环形几何体
      const ringGeometry = new THREE.TorusGeometry(1.8, 0.1, 8, 16);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: isConnected ? 0x50e3c2 : 0x9013fe,
        metalness: 1.0,
        roughness: 0.0,
        emissive: isConnected ? 0x001122 : 0x220033,
        emissiveIntensity: 0.2
      });
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.rotation.x = Math.PI / 4;
      ringMesh.rotation.z = Math.PI / 6;
      ringMesh.castShadow = true;
      ringMesh.receiveShadow = true;
    
      // 组装复合几何体
      const complexPolyhedron = new THREE.Group();
      complexPolyhedron.add(mainMesh);
      complexPolyhedron.add(coreMesh);
      complexPolyhedron.add(ringMesh);
      
      speakerGroup.add(complexPolyhedron);
      setModelLoaded(true);
    };
    
    // 加载模型
    loadGltfModel();
    
    // 创建氛围灯环
    if (ambientEnabled && isConnected) {
      const ringGeometry = new THREE.TorusGeometry(2.5, 0.1, 8, 100);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.8
      });
      const ambientRing = new THREE.Mesh(ringGeometry, ringMaterial);
      ambientRing.rotation.x = Math.PI / 2;
      ambientRing.position.y = -1.5;
      speakerGroup.add(ambientRing);
      
      // 创建彩色光源
      const centerLight = new THREE.PointLight(new THREE.Color(color), 2, 15);
      centerLight.position.set(0, 0, 0);
      centerLight.name = 'centerColorLight';
      scene.add(centerLight);
      coloredLights.push(centerLight);
      
      const leftLight = new THREE.PointLight(new THREE.Color(color), 1.5, 12);
      leftLight.position.set(-4, 1, 2);
      leftLight.name = 'leftColorLight';
      scene.add(leftLight);
      coloredLights.push(leftLight);
      
      const rightLight = new THREE.PointLight(new THREE.Color(color), 1, 10);
      rightLight.position.set(4, 1, 2);
      rightLight.name = 'rightColorLight';
      scene.add(rightLight);
      coloredLights.push(rightLight);
      
      const topLight = new THREE.PointLight(new THREE.Color(color), 0.8, 8);
      topLight.position.set(0, 4, 1);
      topLight.name = 'topColorLight';
      scene.add(topLight);
      coloredLights.push(topLight);
    }
    
    // 🎨 专业级PBR灯光系统（解决用户反馈的渲染质量问题）
    
    // 1. 主光源 - 模拟太阳光
    const mainLight = new THREE.DirectionalLight(0xffffff, 4); // 提高主光照强度
    mainLight.position.set(10, 15, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 100;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);
    
    // 2. 补光 - 填充阴影区域
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 1.0);
    fillLight.position.set(-8, 5, -3);
    scene.add(fillLight);
    
    // 3. 背光 - 增加轮廓感
    const rimLight = new THREE.DirectionalLight(0xffa500, 0.8);
    rimLight.position.set(-5, 2, -10);
    scene.add(rimLight);
    
    // 4. 环境光 - 提供基础照明
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    // 5. 半球光 - 模拟天空和地面反射
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x362d1d, 1.2);
    hemisphereLight.position.set(0, 50, 0);
    scene.add(hemisphereLight);
    
    // 🌟 环境贴图设置 - 解决反射和质感问题
    /*
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    
    // 创建程序化环境贴图（替代HDRI）
    const envMapTexture = new THREE.DataTexture(
      new Uint8Array([135, 206, 235, 255]), // 天蓝色
      1, 1, THREE.RGBAFormat
    );
    envMapTexture.needsUpdate = true;
    
    const envMap = pmremGenerator.fromEquirectangular(envMapTexture).texture;
    scene.environment = envMap;
    */
    
    // 🎭 渐变背景 - 提升视觉效果
    /*
    const gradientTexture = new THREE.CanvasTexture(createGradientCanvas());
    scene.background = gradientTexture;
    
    // 创建渐变背景画布
    function createGradientCanvas() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      
      const gradient = ctx.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, '#87ceeb'); // 天蓝色
      gradient.addColorStop(0.5, '#f0f8ff'); // 爱丽丝蓝
      gradient.addColorStop(1, '#e6e6fa'); // 薰衣草色
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      
      return canvas;
    }
    */
    // 使用透明背景
    scene.background = null;
    renderer.domElement.style.background = 'transparent';
    
    // 📷 优化相机设置 - 解决空间感和视角问题
    camera.fov = 45; // 减小FOV，增加透视感
    camera.near = 0.1;
    camera.far = 1000;
    camera.updateProjectionMatrix();
    
    // 更好的相机位置 - 增加立体感
    camera.position.set(4, 3, 6);
    camera.lookAt(0, 0, 0);
    
    // 添加轻微的相机倾斜，增加动态感
    camera.rotation.z = -0.02;
    
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
      
      controls.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, controls.rotationX));
      
      speakerGroup.rotation.y = controls.rotationY;
      speakerGroup.rotation.x = controls.rotationX;
      speakerGroup.rotation.z = 0;
      
      speakerGroup.position.x = 0;
      speakerGroup.position.y = 0;
      speakerGroup.position.z = 0;
      
      controls.mouseX = clientX;
      controls.mouseY = clientY;
    };
    
    const handleMouseUp = () => {
      controls.isMouseDown = false;
      controls.rotationX = 0;
      controls.rotationY = 0;
    };
    
    // 事件监听
    newCanvas.addEventListener('mousedown', handleMouseDown);
      newCanvas.addEventListener('mousemove', handleMouseMove);
      newCanvas.addEventListener('mouseup', handleMouseUp);
      newCanvas.addEventListener('touchstart', handleMouseDown);
      newCanvas.addEventListener('touchmove', handleMouseMove);
      newCanvas.addEventListener('touchend', handleMouseUp);
    
    // GPU性能监控变量
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;
    
    // 优化的动画循环（按用户建议）
    const animate = () => {
      // 性能监控（简化版）
      frameCount++;
      const currentTime = performance.now();
      if (currentTime - lastTime >= 5000) { // 每5秒输出一次
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        console.log(`渲染性能: ${fps} FPS`);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      // 动态性能优化
      if (fps < 30) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio * 0.8, 1));
        renderer.shadowMap.enabled = false;
      } else if (fps > 50) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
      }
      
      // 360°自动旋转（按用户建议：mesh.rotation.y += 0.01）
      if (autoRotate && !controls.isMouseDown) {
        speakerGroup.rotation.y += 0.01;
        
        // 轻微的呼吸效果
        const time = Date.now() * 0.001;
        speakerGroup.position.y = Math.sin(time * 0.5) * 0.05;
        
        // 内核和装饰环动画
        speakerGroup.children.forEach(child => {
          // 内核自转
          const coreChild = child.children.find((c: THREE.Object3D) => c instanceof THREE.Mesh && c.geometry instanceof THREE.OctahedronGeometry);
          if (coreChild) {
            coreChild.rotation.x += 0.03;
            coreChild.rotation.y += 0.02;
          }
          
          // 装饰环旋转
          const ringChild = child.children.find((c: THREE.Object3D) => c instanceof THREE.Mesh && c.geometry instanceof THREE.TorusGeometry);
          if (ringChild) {
            ringChild.rotation.y += 0.01;
            ringChild.rotation.z += 0.005;
          }
        });
      }
      
      // 呼吸效果
      if (ambientEnabled && isConnected) {
        const scale = 1 + Math.sin(Date.now() * 0.002) * 0.02;
        speakerGroup.scale.setScalar(scale);
      }
      
      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // 保存引用
    sceneRef.current = {
      scene,
      camera,
      renderer,
      speaker: speakerGroup,
      coloredLights,
      controls
    };
    
    // GPU资源清理函数
    return () => {
      console.log('=== 开始GPU资源清理 ===');
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      newCanvas.removeEventListener('mousedown', handleMouseDown);
      newCanvas.removeEventListener('mousemove', handleMouseMove);
      newCanvas.removeEventListener('mouseup', handleMouseUp);
      newCanvas.removeEventListener('touchstart', handleMouseDown);
      newCanvas.removeEventListener('touchmove', handleMouseMove);
      newCanvas.removeEventListener('touchend', handleMouseUp);
      newCanvas.removeEventListener('webglcontextlost', handleContextLost);
      newCanvas.removeEventListener('webglcontextrestored', handleContextRestored);
      
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => {
                if (material.map) material.map.dispose();
                if (material.normalMap) material.normalMap.dispose();
                if (material.roughnessMap) material.roughnessMap.dispose();
                if (material.metalnessMap) material.metalnessMap.dispose();
                material.dispose();
              });
            } else {
              if (object.material.map) object.material.map.dispose();
              if (object.material.normalMap) object.material.normalMap.dispose();
              if (object.material.roughnessMap) object.material.roughnessMap.dispose();
              if (object.material.metalnessMap) object.material.metalnessMap.dispose();
              object.material.dispose();
            }
          }
        }
      });
      
      coloredLights.forEach(light => {
        scene.remove(light);
        if (light.dispose) light.dispose();
      });
      
      while(scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
      
      // 强制释放WebGL上下文
      const gl = renderer.getContext();
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
      
      renderer.dispose();
      renderer.forceContextLoss();
      
      console.log('=== GPU资源清理完成 ===');
      
      if (window.gc) {
        window.gc();
      }
      
      console.log('=== GPU资源清理完成 ===');
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
          if (child === speaker.children[0]) {
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
      if (existingRing instanceof THREE.Mesh && existingRing.material instanceof THREE.MeshStandardMaterial) {
        const newColor = new THREE.Color(color);
        existingRing.material.color.copy(newColor);
        existingRing.material.emissive.copy(newColor);
      }
      
      coloredLights.forEach((light) => {
        if (light instanceof THREE.PointLight) {
          light.color.setHex(parseInt(color.replace('#', '0x')));
        }
      });
      
      const volumeIntensity = Math.max(0.3, volume / 100);
      coloredLights.forEach((light, index) => {
        if (light instanceof THREE.PointLight) {
          const baseIntensities = [2, 1.5, 1, 1, 0.8];
          light.intensity = (baseIntensities[index] || 1) * volumeIntensity;
        }
      });
      
    } else {
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
      
      {!modelLoaded && !loadingError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground">加载3D模型中...</p>
          </div>
        </div>
      )}
      
      {loadingError && (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-500/10 rounded-lg backdrop-blur-sm">
          <div className="text-center p-4 bg-white/90 shadow-lg rounded-md border border-yellow-300">
            <p className="text-sm text-yellow-800 font-medium mb-2">模型加载异常</p>
            <p className="text-xs text-yellow-700">{loadingError}</p>
            <p className="text-xs text-gray-600 mt-2">已切换到备用模型显示</p>
          </div>
        </div>
      )}
    </div>
  );
};
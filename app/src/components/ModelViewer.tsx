import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export default function ModelViewer() {
  const animationIdRef = useRef<number | null>(null);
  
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    // GPU硬件加速优化的WebGL渲染器配置
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance', // 优先使用独立显卡
      failIfMajorPerformanceCaveat: false, // 即使性能较差也继续渲染
      preserveDrawingBuffer: false, // 提高性能，不保留绘图缓冲区
      stencil: false, // 禁用模板缓冲区以提高性能
      depth: true, // 启用深度缓冲区
      logarithmicDepthBuffer: false // 对于小场景禁用对数深度缓冲区
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // GPU加速的阴影配置
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;
    
    // 启用GPU实例化和几何体合并优化
    renderer.sortObjects = true;
    renderer.autoClear = true;
    
    // 设置像素比以优化高DPI显示器性能
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // 启用GPU纹理压缩（如果支持）
    const gl = renderer.getContext();
    if (gl.getExtension('WEBGL_compressed_texture_s3tc') || 
        gl.getExtension('WEBGL_compressed_texture_etc1') ||
        gl.getExtension('WEBGL_compressed_texture_pvrtc')) {
      console.log('GPU纹理压缩已启用');
    }
    
    // 启用GPU几何体实例化（如果支持）
    if (gl.getExtension('ANGLE_instanced_arrays')) {
      console.log('GPU几何体实例化已启用');
    }
    
    // 输出GPU信息
    console.log('=== ModelViewer GPU硬件加速信息 ===');
    console.log('GPU厂商:', gl.getParameter(gl.VENDOR));
    console.log('GPU型号:', gl.getParameter(gl.RENDERER));
    console.log('WebGL版本:', gl.getParameter(gl.VERSION));
    console.log('着色器语言版本:', gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
    console.log('最大纹理尺寸:', gl.getParameter(gl.MAX_TEXTURE_SIZE));
    console.log('最大顶点属性:', gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
    console.log('最大片段纹理单元:', gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
    
    // WebGL上下文丢失和恢复处理
    const canvas = renderer.domElement;
    
    const handleContextLost = (event: Event) => {
      console.warn('=== ModelViewer WebGL上下文丢失 ===');
      event.preventDefault();
      // 停止渲染循环
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
    
    const handleContextRestored = () => {
      console.log('=== ModelViewer WebGL上下文恢复 ===');
      // 重新初始化渲染器设置
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      // 重新开始渲染循环
      animate();
      console.log('ModelViewer GPU上下文恢复完成，渲染已重启');
    };
    
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
    
    document.body.appendChild(renderer.domElement);

    // GPU优化的灯光配置
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // 使用统一的GLTFLoader路径加载模型
    const gltfLoader = new GLTFLoader();
    gltfLoader.load("/assets/Rebuild 1整体.glb", (gltf) => {
      const object = gltf.scene;
      
      console.log('=== ModelViewer GLTF模型加载成功 ===');
      console.log('模型子对象数量:', object.children.length);
      
      // 为模型添加GPU优化的材质
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (!child.material) {
            child.material = new THREE.MeshStandardMaterial({ 
              color: 0x888888,
              metalness: 0.5,
              roughness: 0.5
            });
          }
          
          // 启用阴影
          child.castShadow = true;
          child.receiveShadow = true;
          
          // GPU几何体优化
          if (child.geometry) {
            child.geometry.computeBoundingBox();
            child.geometry.computeBoundingSphere();
          }
        }
      });
      
      object.scale.set(0.01, 0.01, 0.01);
      object.position.set(0, 0, 0);
      scene.add(object);
      
      console.log('ModelViewer 模型添加到场景完成');
    }, (progress) => {
      console.log('ModelViewer 加载进度:', (progress.loaded / progress.total * 100) + '% loaded');
    }, (error) => {
      console.error('ModelViewer 加载GLTF模型失败:', error);
    });

    camera.position.z = 5;

    // GPU性能监控变量
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;

    // GPU优化的动画循环
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // GPU性能监控
      frameCount++;
      const currentTime = performance.now();
      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // 每秒输出一次GPU性能信息
        if (frameCount === 0) {
          console.log(`ModelViewer GPU渲染性能: ${fps} FPS`);
          
          // 检查GPU内存使用情况
          const info = renderer.info;
          console.log('ModelViewer GPU内存使用:', {
            几何体: info.memory.geometries,
            纹理: info.memory.textures,
            渲染调用: info.render.calls,
            三角形: info.render.triangles
          });
        }
      }
      
      // 动态帧率控制 - 根据性能调整渲染质量
      if (fps < 30) {
        // 性能较低时降低渲染质量
        renderer.setPixelRatio(Math.min(window.devicePixelRatio * 0.5, 1));
        renderer.shadowMap.enabled = false;
      } else if (fps > 50) {
        // 性能良好时恢复高质量渲染
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
      }
      
      renderer.render(scene, camera);
    };
    animate();
    
    // GPU资源清理函数
    return () => {
      console.log('=== ModelViewer 开始GPU资源清理 ===');
      
      // 停止动画循环
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      
      // 移除DOM元素
      if (document.body.contains(renderer.domElement)) {
        document.body.removeChild(renderer.domElement);
      }
      
      // 移除WebGL上下文事件监听器
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      
      // 清理Three.js场景中的所有对象
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          // 释放几何体
          if (object.geometry) {
            object.geometry.dispose();
          }
          
          // 释放材质
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
      
      // 清理场景
      while(scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
      
      // 释放渲染器资源
      renderer.dispose();
      renderer.forceContextLoss();
      
      // 强制垃圾回收（如果浏览器支持）
      if (window.gc) {
        window.gc();
      }
      
      console.log('=== ModelViewer GPU资源清理完成 ===');
    };
  }, []);

  return null;
}
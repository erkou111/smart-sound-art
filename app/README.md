# Smart Sound Art - 智能音响艺术

一个基于React和Three.js的智能音响可视化应用，提供3D音响模型展示、AI聊天交互和音频可视化功能。

## 功能特性

### 🎵 3D音响可视化
- 支持GLTF格式的3D音响模型加载
- 实时音量可视化和音频波形显示
- 动态环境光效果和颜色自定义
- 连接状态指示和视觉反馈

### 🤖 AI聊天助手
- 智能音乐推荐和播放建议
- 语音录制和文本输入支持
- 实时对话交互体验
- 音乐生成和创作辅助

### 🎨 界面定制
- 现代化的UI设计（基于Shadcn UI）
- 响应式布局适配
- 主题色彩自定义
- 直观的用户交互体验

## 技术栈

- **前端框架**: React 18 + TypeScript
- **3D渲染**: Three.js + React Three Fiber
- **UI组件**: Shadcn UI + Tailwind CSS
- **路由管理**: React Router DOM
- **构建工具**: Vite
- **状态管理**: React Hooks

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

应用将在 `http://localhost:8080` 启动。

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 项目结构

```
src/
├── components/          # React组件
│   ├── ui/             # UI基础组件
│   ├── Speaker3DViewer.tsx    # 3D音响查看器
│   ├── SpeakerVisualization.tsx # 音响可视化
│   ├── AIChat.tsx      # AI聊天组件
│   └── ModelViewer.tsx # 模型查看器
├── pages/              # 页面组件
│   └── Index.tsx       # 主页面
├── App.tsx             # 应用入口
└── main.tsx           # 程序入口

public/
└── assets/
    └── Rebuild 1整体(1).glb     # 3D音响模型文件
```

## 使用说明

### 3D模型加载
- 应用会自动加载 `public/assets/Rebuild 1整体(1).glb` 中的3D音响模型
- 如需更换模型，请替换该文件并确保为GLTF格式
- 支持模型的自动缩放和居中显示

### 音响控制
- **连接状态**: 点击连接按钮模拟音响连接/断开
- **音量调节**: 使用滑块调节音量，影响可视化效果
- **环境光**: 开启后显示彩色环境光效果
- **颜色选择**: 自定义音响和环境光的颜色

### AI聊天功能
- 支持文本输入和语音录制
- 提供音乐推荐和播放建议
- 智能对话和音乐创作辅助

## 开发指南

### 添加新的3D模型
1. 将GLTF格式的模型文件放入 `public/assets/` 目录
2. 更新 `Speaker3DViewer.tsx` 中的 `modelUrl` 变量
3. 根据需要调整模型的缩放和位置参数

### 自定义UI组件
- 基于Shadcn UI组件库构建
- 使用Tailwind CSS进行样式定制
- 组件位于 `src/components/ui/` 目录

### 扩展AI功能
- AI聊天逻辑位于 `AIChat.tsx` 组件
- 可以集成真实的AI API服务
- 支持自定义对话流程和响应逻辑

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进项目！
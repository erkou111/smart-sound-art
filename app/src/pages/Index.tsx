import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Palette, 
  Lightbulb, 
  MessageCircle, 
  Monitor,
  Volume2,
  Power,
  Settings,
  Music,
  RotateCw,
  Home
} from "lucide-react";
import { ColorPicker } from "@/components/ColorPicker";
import { SpeakerVisualization } from "@/components/SpeakerVisualization";
import { ScreenCustomizer } from "@/components/ScreenCustomizer";
import { AIChat } from "@/components/AIChat";
import TraeModel from "@/components/TraeModel";

const Index = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(true);
  const [ambientLightEnabled, setAmbientLightEnabled] = useState(true);
  const [volume, setVolume] = useState([75]);
  const [selectedColor, setSelectedColor] = useState("#4f46e5");
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(true);
  const [lightMode, setLightMode] = useState("static");

  // 跳转到首页的函数
  const handleNavigateToHome = () => {
    // 跳转到manager-web的初始页面
    window.open('http://localhost:8001/', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Volume2 className="w-3 h-3 text-primary-foreground" />
              </div>
              <h1 className="text-sm font-medium bg-gradient-primary bg-clip-text text-transparent">
                智能音箱控制中心
              </h1>
              <Badge variant={isConnected ? "default" : "secondary"} className="gap-1 text-xs px-2 py-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                {isConnected ? "已连接" : "未连接"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleNavigateToHome}
                variant="outline"
                size="sm"
                className="gap-1 text-xs px-3 py-1 h-7"
              >
                <Home className="w-3 h-3" />
                返回首页
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Settings className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col h-[calc(100vh-80px)]">
        {/* 3D Model Display Area - Takes most of the space */}
        <div className="flex-1 p-4">
          <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl shadow-2xl overflow-hidden">
            <div className="h-full w-full">
              <TraeModel 
                 lightColor={selectedColor}
                 ambientLightEnabled={ambientLightEnabled}
                 lightMode={lightMode}
               />
            </div>
          </div>
        </div>

        {/* Function Bar - Bottom area */}
        <div className="px-6 pb-6">
          <div className="bg-background rounded-lg">
            <Tabs defaultValue="control" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-muted/50">
                <TabsTrigger value="control" className="gap-2">
                  <Settings className="w-4 h-4" />
                  控制
                </TabsTrigger>
                <TabsTrigger value="colors" className="gap-2">
                  <Palette className="w-4 h-4" />
                  色彩
                </TabsTrigger>
                <TabsTrigger value="screen" className="gap-2">
                  <Monitor className="w-4 h-4" />
                  屏幕
                </TabsTrigger>
                <TabsTrigger value="music" className="gap-2">
                  <Music className="w-4 h-4" />
                  音乐
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  对话
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="control" className="p-6">
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">设备控制</h3>
                    <p className="text-sm text-muted-foreground">管理音箱的基本功能和设置</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Power Control */}
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Power className="w-5 h-5 text-primary" />
                          <span className="font-medium">电源状态</span>
                        </div>
                        <Badge variant={isConnected ? "default" : "secondary"}>
                          {isConnected ? "在线" : "离线"}
                        </Badge>
                      </div>
                      <Button 
                        variant={isConnected ? "default" : "outline"} 
                        size="default"
                        onClick={() => setIsConnected(!isConnected)}
                        className="w-full gap-2 font-medium transition-all"
                      >
                        <Power className="w-4 h-4" />
                        {isConnected ? "关闭设备" : "开启设备"}
                      </Button>
                    </div>
                    
                    {/* Volume Control */}
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Volume2 className="w-5 h-5 text-primary" />
                        <span className="font-medium">音量控制</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Slider
                            value={volume}
                            onValueChange={setVolume}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium min-w-[3rem] text-right">{volume[0]}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground text-center">
                          拖动滑块调节音量大小
                        </div>
                      </div>
                    </div>
                    
                    {/* Ambient Light Control */}
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className={`w-5 h-5 transition-colors ${
                          ambientLightEnabled ? 'text-amber-500' : 'text-primary'
                        }`} />
                        <span className="font-medium">氛围灯</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {ambientLightEnabled ? '已开启' : '已关闭'}
                          </span>
                          <Switch
                            checked={ambientLightEnabled}
                            onCheckedChange={setAmbientLightEnabled}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground text-center">
                          开启后显示彩色光环效果
                        </div>
                      </div>
                    </div>
                    
                    {/* Auto Rotation Control */}
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                      <div className="flex items-center gap-2 mb-3">
                        <RotateCw className={`w-5 h-5 transition-colors ${
                          autoRotateEnabled ? 'text-blue-500 animate-spin' : 'text-primary'
                        }`} style={{
                          animationDuration: autoRotateEnabled ? '3s' : 'none'
                        }} />
                        <span className="font-medium">自动旋转</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {autoRotateEnabled ? '已开启' : '已关闭'}
                          </span>
                          <Switch
                            checked={autoRotateEnabled}
                            onCheckedChange={setAutoRotateEnabled}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground text-center">
                          开启后3D模型将连续旋转
                        </div>
                      </div>
                    </div>
                  </div>
                  


                </div>
              </TabsContent>
              
              <TabsContent value="colors" className="p-6">
                <ColorPicker 
                  selectedColor={selectedColor} 
                  onColorChange={setSelectedColor}
                  ambientEnabled={ambientLightEnabled}
                  lightMode={lightMode}
                  onLightModeChange={setLightMode}
                />
              </TabsContent>
              
              <TabsContent value="screen" className="p-6">
                <ScreenCustomizer />
              </TabsContent>
              
              <TabsContent value="music" className="p-6">
                <div className="text-center py-8">
                  <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">AI音乐生成</h3>
                  <p className="text-muted-foreground mb-4">即将推出音乐生成功能</p>
                  <Button variant="outline" disabled>
                    敬请期待
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="chat" className="p-6">
                <AIChat />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
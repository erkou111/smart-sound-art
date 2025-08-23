import { useState } from "react";
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
  Music
} from "lucide-react";
import { ColorPicker } from "@/components/ColorPicker";
import { SpeakerVisualization } from "@/components/SpeakerVisualization";
import { ScreenCustomizer } from "@/components/ScreenCustomizer";
import { AIChat } from "@/components/AIChat";

const Index = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [ambientLightEnabled, setAmbientLightEnabled] = useState(true);
  const [volume, setVolume] = useState([75]);
  const [selectedColor, setSelectedColor] = useState("#4f46e5");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                智能音箱控制中心
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isConnected ? "default" : "secondary"} className="gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                {isConnected ? "已连接" : "未连接"}
              </Badge>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel - Controls */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Control Card */}
            <Card className="p-6 shadow-card bg-gradient-ambient">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">主控制面板</h2>
                <Button 
                  variant={isConnected ? "default" : "secondary"} 
                  size="sm"
                  onClick={() => setIsConnected(!isConnected)}
                  className="gap-2"
                >
                  <Power className="w-4 h-4" />
                  {isConnected ? "关闭" : "开启"}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">音量</label>
                    <span className="text-sm text-muted-foreground">{volume[0]}%</span>
                  </div>
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      智能氛围感灯光
                    </label>
                    <Switch
                      checked={ambientLightEnabled}
                      onCheckedChange={setAmbientLightEnabled}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    根据音乐节拍自动调节灯光效果
                  </p>
                </div>
              </div>
            </Card>

            {/* Function Tabs */}
            <Card className="shadow-card">
              <Tabs defaultValue="colors" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/50">
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
                
                <TabsContent value="colors" className="p-6">
                  <ColorPicker 
                    selectedColor={selectedColor} 
                    onColorChange={setSelectedColor}
                    ambientEnabled={ambientLightEnabled}
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
            </Card>
          </div>

          {/* Right Panel - Speaker Visualization */}
          <div className="space-y-6">
            <Card className="p-6 shadow-card bg-gradient-ambient">
              <h2 className="text-lg font-semibold mb-4">音箱状态</h2>
              <SpeakerVisualization 
                color={selectedColor}
                isConnected={isConnected}
                ambientEnabled={ambientLightEnabled}
                volume={volume[0]}
              />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
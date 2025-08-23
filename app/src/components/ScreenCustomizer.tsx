import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Type, 
  Image as ImageIcon, 
  Clock, 
  Activity,
  Heart,
  Star,
  Sun,
  Moon,
  Cloud,
  Download
} from "lucide-react";

const textTemplates = [
  { id: "welcome", text: "欢迎回家", icon: Heart },
  { id: "time", text: "当前时间", icon: Clock },
  { id: "weather", text: "今日天气", icon: Sun },
  { id: "music", text: "正在播放", icon: Activity },
];

const iconTemplates = [
  { id: "star", icon: Star, name: "星星" },
  { id: "heart", icon: Heart, name: "爱心" },
  { id: "sun", icon: Sun, name: "太阳" },
  { id: "moon", icon: Moon, name: "月亮" },
  { id: "cloud", icon: Cloud, name: "云朵" },
  { id: "music", icon: Activity, name: "音乐" },
];

export const ScreenCustomizer = () => {
  const [selectedTab, setSelectedTab] = useState("text");
  const [customText, setCustomText] = useState("Hello World");
  const [selectedIcon, setSelectedIcon] = useState("star");
  const [fontSize, setFontSize] = useState("16");
  const [textColor, setTextColor] = useState("#ffffff");

  const handleApplyToScreen = () => {
    // This would send the configuration to the speaker
    console.log("Applying screen configuration:", {
      type: selectedTab,
      content: selectedTab === "text" ? customText : selectedIcon,
      fontSize: fontSize,
      color: textColor
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">屏幕自定义</h3>
        <Badge variant="outline">128x64 OLED</Badge>
      </div>

      {/* Screen Preview */}
      <Card className="p-6 bg-card-elevated">
        <div className="mb-4">
          <h4 className="font-medium mb-2">预览效果</h4>
          <div className="bg-background border rounded-lg p-4 h-24 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-background to-muted opacity-50" />
            <div className="relative z-10">
              {selectedTab === "text" && (
                <p 
                  className="font-mono text-center"
                  style={{ 
                    fontSize: `${parseInt(fontSize)}px`,
                    color: textColor
                  }}
                >
                  {customText}
                </p>
              )}
              {selectedTab === "icon" && (
                <div className="flex justify-center">
                  {(() => {
                    const IconComponent = iconTemplates.find(i => i.id === selectedIcon)?.icon || Star;
                    return <IconComponent className="w-8 h-8" style={{ color: textColor }} />;
                  })()}
                </div>
              )}
              {selectedTab === "image" && (
                <div className="flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">自定义图片</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Customization Options */}
      <Card className="p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text" className="gap-2">
              <Type className="w-4 h-4" />
              文字
            </TabsTrigger>
            <TabsTrigger value="icon" className="gap-2">
              <Star className="w-4 h-4" />
              图标
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              图片
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4 mt-6">
            <div>
              <label className="text-sm font-medium mb-2 block">快速模板</label>
              <div className="grid grid-cols-2 gap-2">
                {textTemplates.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2"
                      onClick={() => setCustomText(template.text)}
                    >
                      <IconComponent className="w-3 h-3" />
                      {template.text}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">自定义文字</label>
              <Textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="输入要显示的文字..."
                className="resize-none"
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="icon" className="space-y-4 mt-6">
            <div>
              <label className="text-sm font-medium mb-2 block">选择图标</label>
              <div className="grid grid-cols-3 gap-3">
                {iconTemplates.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <Card
                      key={template.id}
                      className={`p-3 cursor-pointer transition-all border-2 ${
                        selectedIcon === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedIcon(template.id)}
                    >
                      <div className="text-center">
                        <IconComponent className="w-6 h-6 mx-auto mb-1" />
                        <p className="text-xs">{template.name}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-4 mt-6">
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-medium mb-2">上传自定义图片</h4>
              <p className="text-sm text-muted-foreground mb-4">
                支持 PNG、JPG 格式，推荐尺寸 128x64
              </p>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                选择文件
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Style Options */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
          <div>
            <label className="text-sm font-medium mb-2 block">字体大小</label>
            <Input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              min="8"
              max="32"
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">文字颜色</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-full h-10 rounded-lg border border-border cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* Apply Button */}
      <Button 
        onClick={handleApplyToScreen}
        className="w-full"
        size="lg"
      >
        应用到音箱屏幕
      </Button>
    </div>
  );
};
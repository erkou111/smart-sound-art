import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Palette, Zap, Sparkles } from "lucide-react";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  ambientEnabled: boolean;
}

// 生成颜色条的颜色值
const generateColorBar = () => {
  const colors = [];
  for (let i = 0; i <= 360; i += 10) {
    colors.push(`hsl(${i}, 70%, 60%)`);
  }
  return colors;
};

const colorBarColors = generateColorBar();

const lightModes = [
  { id: "static", name: "静态模式", icon: Palette, desc: "持续显示选定颜色" },
  { id: "breath", name: "呼吸模式", icon: Zap, desc: "柔和呼吸效果" },
  { id: "rainbow", name: "彩虹模式", icon: Sparkles, desc: "循环渐变色彩" }
];

export const ColorPicker = ({ selectedColor, onColorChange, ambientEnabled }: ColorPickerProps) => {
  const [lightMode, setLightMode] = useState("static");
  const [customColor, setCustomColor] = useState(selectedColor);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">色彩控制</h3>
        
        {/* Color Bar */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-3 block">颜色选择</label>
          <div className="relative">
            <div className="flex h-8 rounded-lg overflow-hidden border border-border">
              {colorBarColors.map((color, index) => (
                <div
                  key={index}
                  className="flex-1 cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => onColorChange(color)}
                  title={color}
                />
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              点击颜色条选择颜色
            </div>
          </div>
        </div>

        {/* Custom Color */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">自定义颜色</label>
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  onColorChange(e.target.value);
                }}
                className="w-full h-12 rounded-lg border border-border cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">颜色值</label>
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  onColorChange(e.target.value);
                }}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm font-mono"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Light Modes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">灯光模式</h3>
        <div className="space-y-3">
          {lightModes.map((mode) => {
            const IconComponent = mode.icon;
            return (
              <Card 
                key={mode.id}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  lightMode === mode.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setLightMode(mode.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${lightMode === mode.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{mode.name}</h4>
                    <p className="text-sm text-muted-foreground">{mode.desc}</p>
                  </div>
                  {lightMode === mode.id && (
                    <Badge variant="default" className="bg-primary">
                      已选择
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Current Status */}
      <Card className="p-4 bg-gradient-ambient">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">当前配置</h4>
            <p className="text-sm text-muted-foreground">
              {lightModes.find(m => m.id === lightMode)?.name} • {selectedColor}
            </p>
          </div>
          <div 
            className="w-12 h-12 rounded-full border-2 border-primary shadow-glow animate-pulse"
            style={{ backgroundColor: selectedColor }}
          />
        </div>
      </Card>
    </div>
  );
};
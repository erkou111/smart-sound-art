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

const presetColors = [
  { name: "经典蓝", color: "#4f46e5", desc: "冷静沉稳" },
  { name: "活力紫", color: "#7c3aed", desc: "神秘优雅" },
  { name: "青春绿", color: "#10b981", desc: "清新自然" },
  { name: "热情红", color: "#ef4444", desc: "热烈奔放" },
  { name: "温暖橙", color: "#f97316", desc: "温馨活泼" },
  { name: "天空青", color: "#06b6d4", desc: "清澈明朗" },
  { name: "薄荷绿", color: "#34d399", desc: "清新淡雅" },
  { name: "樱花粉", color: "#ec4899", desc: "浪漫温柔" }
];

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
        
        {/* Preset Colors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {presetColors.map((preset) => (
            <Card 
              key={preset.color}
              className={`p-3 cursor-pointer transition-all border-2 ${
                selectedColor === preset.color 
                  ? 'border-primary shadow-glow' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onColorChange(preset.color)}
            >
              <div 
                className="w-full h-12 rounded-lg mb-2 shadow-inner"
                style={{ backgroundColor: preset.color }}
              />
              <h4 className="font-medium text-sm">{preset.name}</h4>
              <p className="text-xs text-muted-foreground">{preset.desc}</p>
            </Card>
          ))}
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
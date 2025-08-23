import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX, Wifi, WifiOff } from "lucide-react";
import speakerImage from "@/assets/smart-speaker.jpg";

interface SpeakerVisualizationProps {
  color: string;
  isConnected: boolean;
  ambientEnabled: boolean;
  volume: number;
}

export const SpeakerVisualization = ({
  color,
  isConnected,
  ambientEnabled,
  volume
}: SpeakerVisualizationProps) => {
  const [audioWave, setAudioWave] = useState<number[]>([]);
  
  // Simulate audio wave data
  useEffect(() => {
    if (!isConnected) {
      setAudioWave([]);
      return;
    }

    const interval = setInterval(() => {
      const newWave = Array.from({ length: 12 }, () => 
        Math.random() * (volume / 100) * 100
      );
      setAudioWave(newWave);
    }, 150);

    return () => clearInterval(interval);
  }, [isConnected, volume]);

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <Badge 
          variant={isConnected ? "default" : "secondary"}
          className="gap-2"
        >
          {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isConnected ? "在线" : "离线"}
        </Badge>
        <Badge variant="outline" className="gap-2">
          {volume > 0 ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          {volume}%
        </Badge>
      </div>

      {/* Speaker Visual */}
      <Card className="p-6 bg-gradient-ambient relative overflow-hidden">
        <div className="relative">
          {/* Speaker Image */}
          <div className="relative mx-auto w-48 h-48 rounded-full overflow-hidden">
            <img 
              src={speakerImage} 
              alt="Smart Speaker"
              className="w-full h-full object-cover"
            />
            
            {/* Light Ring Overlay */}
            {isConnected && ambientEnabled && (
              <div 
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  background: `conic-gradient(from 0deg, ${color}33, ${color}, ${color}33, transparent, ${color}33, ${color}, ${color}33)`,
                  filter: 'blur(2px)'
                }}
              />
            )}
            
            {/* Glow Effect */}
            {isConnected && (
              <div 
                className="absolute inset-0 rounded-full opacity-30 animate-pulse"
                style={{
                  boxShadow: `0 0 40px ${color}66`
                }}
              />
            )}
          </div>

          {/* Status Indicator */}
          <div className="absolute top-0 right-0">
            <div 
              className={`w-4 h-4 rounded-full border-2 border-background ${
                isConnected ? 'bg-success animate-pulse' : 'bg-muted-foreground'
              }`}
            />
          </div>
        </div>
      </Card>

      {/* Audio Visualizer */}
      {isConnected && (
        <Card className="p-4">
          <div className="flex items-center justify-center gap-1 h-16">
            {audioWave.map((height, index) => (
              <div
                key={index}
                className="w-2 rounded-t-full transition-all duration-150"
                style={{
                  height: `${Math.max(height, 4)}%`,
                  backgroundColor: color,
                  opacity: 0.8
                }}
              />
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            音频可视化
          </p>
        </Card>
      )}

      {/* Device Info */}
      <Card className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">设备名称</span>
          <span className="text-sm font-medium">智能音箱 Pro</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">固件版本</span>
          <span className="text-sm font-medium">v2.1.3</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">电池电量</span>
          <span className="text-sm font-medium">85%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">信号强度</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((bar) => (
              <div
                key={bar}
                className={`w-1 h-3 rounded-sm ${
                  bar <= (isConnected ? 4 : 0) ? 'bg-success' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
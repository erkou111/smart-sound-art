import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX, Wifi, WifiOff } from "lucide-react";
import { Speaker3DViewer } from "./Speaker3DViewer";

interface SpeakerVisualizationProps {
  color: string;
  isConnected: boolean;
  ambientEnabled: boolean;
  volume: number;
  autoRotate?: boolean;
}

export const SpeakerVisualization = ({
  color,
  isConnected,
  ambientEnabled,
  volume,
  autoRotate = true
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
      <div className="relative">
          {/* 3D Speaker Model */}
          <div className="relative mx-auto">
            <Speaker3DViewer 
              color={color}
              isConnected={isConnected}
              ambientEnabled={ambientEnabled}
              volume={volume}
              autoRotate={autoRotate}
            />
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

      {/* Audio Visualizer */}
      {isConnected && (
        <div className="p-4 rounded-lg">
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
        </div>
      )}


    </div>
  );
};
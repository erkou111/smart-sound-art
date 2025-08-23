import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Mic, 
  MicOff, 
  Music, 
  Bot,
  User,
  Play,
  Pause,
  SkipForward
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  musicGenerated?: {
    title: string;
    duration: string;
    genre: string;
  };
}

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '你好！我是你的智能音乐助手。我可以帮你生成个性化音乐，或者和你聊天。试试说"给我来首放松的音乐"吧！',
      timestamp: new Date(Date.now() - 5000)
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const musicSuggestions = [
    "给我来首放松的音乐",
    "创作一首充满活力的歌曲",
    "制作一段冥想背景音",
    "来首适合工作的轻音乐"
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const isMusicRequest = inputValue.toLowerCase().includes('音乐') || 
                            inputValue.toLowerCase().includes('歌') ||
                            inputValue.toLowerCase().includes('曲');

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: isMusicRequest 
          ? '好的！我正在为你创作一首专属音乐。基于你的描述，我会融入相应的情感和风格。'
          : '我明白了！让我来帮助你解决这个问题。',
        timestamp: new Date()
      };

      if (isMusicRequest) {
        aiMessage.musicGenerated = {
          title: '专属定制音乐',
          duration: '3:24',
          genre: '轻松氛围'
        };
      }

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Here you would implement actual voice recording
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI智能助手</h3>
        <Badge variant="outline" className="gap-2">
          <Bot className="w-3 h-3" />
          在线
        </Badge>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">快速指令</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {musicSuggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="justify-start gap-2 text-left"
              onClick={() => setInputValue(suggestion)}
            >
              <Music className="w-3 h-3" />
              {suggestion}
            </Button>
          ))}
        </div>
      </Card>

      {/* Chat Messages */}
      <Card className="p-4">
        <ScrollArea className="h-80 w-full" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-primary' : 'bg-secondary'}`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Bot className="w-4 h-4 text-secondary-foreground" />
                    )}
                  </div>
                  <div className={`space-y-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    
                    {/* Music Generated Card */}
                    {message.musicGenerated && (
                      <Card className="p-3 bg-gradient-ambient">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary rounded-lg">
                            <Music className="w-4 h-4 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{message.musicGenerated.title}</h5>
                            <p className="text-xs text-muted-foreground">
                              {message.musicGenerated.genre} • {message.musicGenerated.duration}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <SkipForward className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString('zh-CN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="p-2 rounded-full bg-secondary">
                  <Bot className="w-4 h-4 text-secondary-foreground" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Input Area */}
      <Card className="p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息或音乐需求..."
              className="pr-12"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={toggleRecording}
            >
              {isRecording ? (
                <MicOff className="w-4 h-4 text-destructive" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {isRecording && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            正在录音...
          </div>
        )}
      </Card>
    </div>
  );
};
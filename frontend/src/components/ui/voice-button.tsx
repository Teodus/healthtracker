import { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  onRecord: () => void;
  className?: string;
}

export function VoiceButton({ onRecord, className }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);

  const handleClick = () => {
    setIsRecording(!isRecording);
    onRecord();
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className={cn(
        "w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
        "shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95",
        "border-2 border-primary/20",
        isRecording && "animate-pulse shadow-glow",
        className
      )}
    >
      {isRecording ? (
        <MicOff className="w-6 h-6 text-primary-foreground" />
      ) : (
        <Mic className="w-6 h-6 text-primary-foreground" />
      )}
    </Button>
  );
}
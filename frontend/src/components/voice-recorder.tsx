import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { voiceService } from '@/services/voice.service';
import { toast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onTranscription: (transcription: string, extractedData: any) => void;
  context?: 'food' | 'workout' | 'habit' | 'general';
  className?: string;
}

export function VoiceRecorder({ onTranscription, context = 'general', className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setRecordingDuration(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      await voiceService.startRecording();
      setIsRecording(true);
      
      // Haptic feedback for mobile (if supported)
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error: any) {
      toast({
        title: "Recording failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50]);
      }

      const audioBlob = await voiceService.stopRecording();
      
      // Minimum recording duration check
      if (recordingDuration < 1) {
        toast({
          title: "Recording too short",
          description: "Please speak for at least 1 second",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Transcribe the audio
      const response = await voiceService.transcribeAudio(audioBlob, context);
      
      if (response.transcription) {
        onTranscription(response.transcription, response.extractedData);
        
        toast({
          title: "Recording processed",
          description: `Detected: ${response.extractedData.type} entry`,
        });
      } else {
        toast({
          title: "No speech detected",
          description: "Please try speaking more clearly",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Processing failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (isProcessing) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <Button
        onClick={handleClick}
        size="lg"
        disabled={isProcessing}
        className={cn(
          "w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80",
          "hover:from-primary/90 hover:to-primary/70",
          "shadow-lg hover:shadow-xl transition-all duration-200",
          "active:scale-95 border-2 border-primary/20",
          "relative overflow-hidden",
          isRecording && "animate-pulse shadow-glow"
        )}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
        ) : isRecording ? (
          <>
            <MicOff className="w-8 h-8 text-primary-foreground relative z-10" />
            {/* Recording indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 animate-ping" />
            </div>
          </>
        ) : (
          <Mic className="w-8 h-8 text-primary-foreground" />
        )}
      </Button>
      
      {/* Duration display */}
      {isRecording && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-muted-foreground">
          {voiceService.formatDuration(recordingDuration)}
        </div>
      )}
      
      {/* Hint text */}
      {!isRecording && !isProcessing && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
          Tap to record
        </div>
      )}
    </div>
  );
}
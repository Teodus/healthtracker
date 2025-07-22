import { apiClient } from '@/lib/api-client';

export interface VoiceTranscriptionResponse {
  transcription: string;
  extractedData: {
    type: 'food' | 'workout' | 'habit' | 'general';
    confidence: number;
    suggestedEntry: any;
  };
  alternatives?: any[];
}

export interface QuickLogResponse {
  extractedData: {
    type: string;
    confidence: number;
    suggestedEntry: any;
  };
  createdEntries: any[];
}

class VoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      // Request microphone permission
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });

      // Create MediaRecorder with appropriate mime type
      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Microphone permission denied. Please allow microphone access.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No microphone found. Please connect a microphone.');
      } else {
        throw new Error('Failed to start recording: ' + error.message);
      }
    }
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // fallback
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        
        // Clean up
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
        
        this.mediaRecorder = null;
        this.audioChunks = [];
        
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  async transcribeAudio(audioBlob: Blob, context?: string): Promise<VoiceTranscriptionResponse> {
    const formData = new FormData();
    
    // Convert blob to file with appropriate extension
    const fileExtension = this.getFileExtension(audioBlob.type);
    const audioFile = new File([audioBlob], `recording.${fileExtension}`, { type: audioBlob.type });
    
    formData.append('audio', audioFile);
    if (context) {
      formData.append('context', context);
    }

    try {
      const response = await apiClient.uploadFile<VoiceTranscriptionResponse>(
        '/voice/transcribe',
        formData
      );
      return response;
    } catch (error: any) {
      throw new Error('Failed to transcribe audio: ' + error.message);
    }
  }

  private getFileExtension(mimeType: string): string {
    const mimeToExt: { [key: string]: string } = {
      'audio/webm': 'webm',
      'audio/mp4': 'm4a',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav'
    };
    return mimeToExt[mimeType] || 'webm';
  }

  async quickLog(transcription: string, autoCreate: boolean = true): Promise<QuickLogResponse> {
    return apiClient.post<QuickLogResponse>('/voice/quick-log', {
      transcription,
      autoCreate
    });
  }

  // Helper to format duration for display
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
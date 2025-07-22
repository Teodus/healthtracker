import OpenAI from 'openai';
import { env } from '@/config/env';
import { AIProcessingError } from '@/utils/errors/app-errors';
import logger from '@/utils/logger';

export class TranscriptionService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      // Determine file extension from mime type
      const extension = this.getFileExtension(mimeType);
      
      // Create a File object from the buffer
      const file = new File([audioBuffer], `audio.${extension}`, { type: mimeType });

      // Call Whisper API
      const response = await this.openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: 'en', // Optimize for English
        response_format: 'text',
      });

      const transcription = response.trim();
      
      if (!transcription) {
        throw new Error('Empty transcription received');
      }

      logger.info(`Transcribed ${audioBuffer.length} bytes of audio`);
      return transcription;
    } catch (error) {
      logger.error('Transcription error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          throw new AIProcessingError('Rate limit exceeded', 'whisper');
        }
        if (error.message.includes('audio')) {
          throw new AIProcessingError('Invalid audio format', 'whisper');
        }
      }
      
      throw new AIProcessingError('Failed to transcribe audio', 'whisper');
    }
  }

  private getFileExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'audio/webm': 'webm',
      'audio/mp3': 'mp3',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/wave': 'wav',
      'audio/x-wav': 'wav',
      'audio/m4a': 'm4a',
      'audio/mp4': 'm4a',
    };

    return mimeToExt[mimeType] || 'webm';
  }

  async validateAudioFile(
    buffer: Buffer,
    mimeType: string
  ): Promise<{ isValid: boolean; error?: string }> {
    // Check file size (25MB limit)
    const maxSize = 25 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return { 
        isValid: false, 
        error: 'Audio file too large. Maximum size is 25MB' 
      };
    }

    // Check mime type
    const allowedTypes = [
      'audio/webm',
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/m4a',
      'audio/mp4',
    ];

    if (!allowedTypes.includes(mimeType)) {
      return { 
        isValid: false, 
        error: `Unsupported audio format. Allowed formats: ${allowedTypes.join(', ')}` 
      };
    }

    return { isValid: true };
  }
}
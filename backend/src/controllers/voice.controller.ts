import { Request, Response, NextFunction } from 'express';
import { VoiceService } from '@/services/voice.service';
import multer from 'multer';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
});

export const uploadAudio = upload.single('audio');

export class VoiceController {
  private voiceService: VoiceService;

  constructor() {
    this.voiceService = new VoiceService();
  }

  transcribe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          error: 'No audio file provided',
          code: 'NO_AUDIO_FILE',
        });
        return;
      }

      const result = await this.voiceService.transcribeAudio(
        req.file.buffer,
        req.file.mimetype,
        req.body.context
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  quickLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { transcription, autoCreate = true } = req.body;

      if (!transcription) {
        res.status(400).json({
          error: 'No transcription provided',
          code: 'NO_TRANSCRIPTION',
        });
        return;
      }

      const result = await this.voiceService.processTextInput(
        req.user!.userId,
        transcription,
        autoCreate
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
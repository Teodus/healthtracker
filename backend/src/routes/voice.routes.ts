import { Router } from 'express';
import { VoiceController, uploadAudio } from '@/controllers/voice.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { voiceRateLimiter } from '@/middleware/rateLimiter';
import { z } from 'zod';

const router = Router();
const voiceController = new VoiceController();

// Voice processing schemas
const QuickLogSchema = z.object({
  transcription: z.string().min(1).max(5000),
  autoCreate: z.boolean().optional().default(true),
});

// Apply rate limiting to voice routes
router.use(voiceRateLimiter);

// All routes require authentication
router.use(authenticate);

// Voice routes
router.post('/transcribe', uploadAudio, voiceController.transcribe);
router.post('/quick-log', validate(QuickLogSchema), voiceController.quickLog);

export default router;
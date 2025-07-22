import { TranscriptionService } from '@/services/ai/transcription.service';
import { AIParsingService } from '@/services/ai/parsing.service';
import { FoodService } from '@/services/health/food.service';
import { WorkoutService } from '@/services/health/workout.service';
import { HabitsService } from '@/services/health/habits.service';
import logger from '@/utils/logger';

interface ProcessedEntry {
  type: 'food' | 'workout' | 'habit';
  id?: string;
  name: string;
  [key: string]: any;
}

export class VoiceService {
  private transcriptionService: TranscriptionService;
  private aiParsingService: AIParsingService;
  private foodService: FoodService;
  private workoutService: WorkoutService;
  private habitsService: HabitsService;

  constructor() {
    this.transcriptionService = new TranscriptionService();
    this.aiParsingService = new AIParsingService();
    this.foodService = new FoodService();
    this.workoutService = new WorkoutService();
    this.habitsService = new HabitsService();
  }

  async transcribeAudio(
    audioBuffer: Buffer,
    mimeType: string,
    context?: string
  ): Promise<{
    transcription: string;
    extractedData: any;
    alternatives?: any[];
  }> {
    // Validate audio file
    const validation = await this.transcriptionService.validateAudioFile(
      audioBuffer,
      mimeType
    );
    
    if (!validation.isValid) {
      throw new Error(validation.error!);
    }

    // Transcribe audio
    const transcription = await this.transcriptionService.transcribeAudio(
      audioBuffer,
      mimeType
    );

    // Parse health data
    const extractedData = await this.aiParsingService.parseHealthData(transcription);

    // Format response based on context
    const response = this.formatExtractionResponse(extractedData, context);

    logger.info(`Processed voice input for context: ${context || 'general'}`);
    
    return {
      transcription,
      extractedData: response.extractedData,
      alternatives: response.alternatives,
    };
  }

  async processTextInput(
    userId: string,
    text: string,
    autoCreate: boolean = true
  ): Promise<{
    createdEntries: ProcessedEntry[];
    message: string;
  }> {
    // Parse the text
    const parsedData = await this.aiParsingService.parseHealthData(text);

    if (!autoCreate) {
      // Just return what was detected
      return {
        createdEntries: this.summarizeParsedData(parsedData),
        message: 'Text analyzed successfully',
      };
    }

    // Create entries
    const createdEntries: ProcessedEntry[] = [];

    // Create food entries
    if (parsedData.foodEntries.length > 0) {
      const foods = await this.foodService.createManyFromParsedData(
        userId,
        parsedData.foodEntries
      );
      
      createdEntries.push(
        ...foods.map(f => ({
          type: 'food' as const,
          id: f.id,
          name: f.name,
          calories: f.calories,
          protein: f.protein,
        }))
      );
    }

    // Create workout entries
    if (parsedData.workouts.length > 0) {
      const workouts = await this.workoutService.createManyFromParsedData(
        userId,
        parsedData.workouts
      );
      
      createdEntries.push(
        ...workouts.map(w => ({
          type: 'workout' as const,
          id: w.id,
          name: w.name,
          duration: w.duration,
          calories: w.calories,
        }))
      );
    }

    // Complete habits
    if (parsedData.habits.length > 0) {
      const completedCount = await this.habitsService.completeHabitsFromParsedData(
        userId,
        parsedData.habits
      );
      
      if (completedCount > 0) {
        createdEntries.push({
          type: 'habit',
          name: `${completedCount} habits completed`,
          count: completedCount,
        });
      }
    }

    // Generate summary message
    const message = this.generateCreationMessage(createdEntries);

    logger.info(`Created ${createdEntries.length} entries from text input for user ${userId}`);

    return {
      createdEntries,
      message,
    };
  }

  private formatExtractionResponse(parsedData: any, context?: string) {
    let extractedData: any = {};
    const alternatives: any[] = [];

    // Format based on context
    if (context === 'food' && parsedData.foodEntries.length > 0) {
      const food = parsedData.foodEntries[0];
      extractedData = {
        type: 'food',
        confidence: food.confidence,
        suggestedEntry: {
          name: food.name,
          meal: food.meal,
          calories: food.calories,
          protein: food.protein,
          description: food.description,
        },
      };

      // Add alternatives
      if (parsedData.foodEntries.length > 1) {
        alternatives.push(
          ...parsedData.foodEntries.slice(1).map((f: any) => ({
            name: f.name,
            calories: f.calories,
            protein: f.protein,
          }))
        );
      }
    } else if (context === 'workout' && parsedData.workouts.length > 0) {
      const workout = parsedData.workouts[0];
      extractedData = {
        type: 'workout',
        confidence: 0.9,
        suggestedEntry: workout,
      };
    } else {
      // General context - return everything
      extractedData = {
        type: 'mixed',
        foodCount: parsedData.foodEntries.length,
        workoutCount: parsedData.workouts.length,
        habitCount: parsedData.habits.length,
        data: parsedData,
      };
    }

    return { extractedData, alternatives };
  }

  private summarizeParsedData(parsedData: any): ProcessedEntry[] {
    const entries: ProcessedEntry[] = [];

    // Add food entries
    entries.push(
      ...parsedData.foodEntries.map((f: any) => ({
        type: 'food' as const,
        name: f.name,
        calories: f.calories,
        protein: f.protein,
      }))
    );

    // Add workout entries
    entries.push(
      ...parsedData.workouts.map((w: any) => ({
        type: 'workout' as const,
        name: w.name,
        duration: w.duration,
        calories: w.calories,
      }))
    );

    // Add habit entries
    entries.push(
      ...parsedData.habits
        .filter((h: any) => h.completed)
        .map((h: any) => ({
          type: 'habit' as const,
          name: h.name,
        }))
    );

    return entries;
  }

  private generateCreationMessage(entries: ProcessedEntry[]): string {
    const counts = entries.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const parts = [];
    if (counts.food) parts.push(`${counts.food} food ${counts.food === 1 ? 'entry' : 'entries'}`);
    if (counts.workout) parts.push(`${counts.workout} ${counts.workout === 1 ? 'workout' : 'workouts'}`);
    if (counts.habit) parts.push(`${entries.find(e => e.type === 'habit')?.count || 0} habits`);

    if (parts.length === 0) {
      return 'No health data detected in your input';
    }

    return `Created ${parts.join(' and ')} from your ${parts.length > 1 ? 'voice note' : 'input'}`;
  }
}
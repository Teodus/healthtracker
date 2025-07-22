import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/config/env';
import { AIProcessingError } from '@/utils/errors/app-errors';
import { HEALTH_DATA_EXTRACTION_PROMPT } from './prompts';
import { MEAL_KEYWORDS, WORKOUT_CALORIES } from '@/config/constants';
import logger from '@/utils/logger';

interface ParsedHealthData {
  foodEntries: Array<{
    name: string;
    meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    calories: number;
    protein: number;
    description: string;
    confidence: number;
    components?: Record<string, { calories: number; protein: number }>;
  }>;
  workouts: Array<{
    name: string;
    type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
    duration: number;
    calories: number;
    notes?: string;
  }>;
  habits: Array<{
    name: string;
    completed: boolean;
  }>;
  metadata: {
    totalCaloriesConsumed: number;
    totalProtein: number;
    totalCaloriesBurned: number;
    parseQuality: 'high' | 'medium' | 'low';
  };
}

export class AIParsingService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });
  }

  async parseHealthData(text: string): Promise<ParsedHealthData> {
    try {
      const prompt = `${HEALTH_DATA_EXTRACTION_PROMPT}\n\n${text}`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt,
        }],
        temperature: 0.2, // Lower temperature for more consistent parsing
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse JSON response
      const parsed = this.parseClaudeResponse(content.text);
      
      // Validate and enhance the parsed data
      return this.validateAndEnhanceData(parsed);
    } catch (error) {
      logger.error('AI parsing error:', error);
      throw new AIProcessingError('Failed to parse health data', 'claude');
    }
  }

  private parseClaudeResponse(text: string): any {
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Failed to parse Claude response:', text);
      throw new Error('Invalid response format from AI');
    }
  }

  private validateAndEnhanceData(data: any): ParsedHealthData {
    // Ensure all required fields exist
    const result: ParsedHealthData = {
      foodEntries: [],
      workouts: [],
      habits: [],
      metadata: {
        totalCaloriesConsumed: 0,
        totalProtein: 0,
        totalCaloriesBurned: 0,
        parseQuality: 'medium',
      },
    };

    // Process food entries
    if (Array.isArray(data.foodEntries)) {
      result.foodEntries = data.foodEntries.map((entry: any) => ({
        name: this.sanitizeString(entry.name),
        meal: this.determineMealType(entry.meal, entry.name, entry.description),
        calories: Math.max(0, Math.round(entry.calories || 0)),
        protein: Math.max(0, Math.round(entry.protein || 0)),
        description: this.sanitizeString(entry.description || entry.name),
        confidence: entry.confidence || 0.7,
        components: entry.components,
      }));
    }

    // Process workouts
    if (Array.isArray(data.workouts)) {
      result.workouts = data.workouts.map((workout: any) => ({
        name: this.sanitizeString(workout.name),
        type: this.validateWorkoutType(workout.type),
        duration: Math.max(1, Math.round(workout.duration || 30)),
        calories: this.calculateWorkoutCalories(
          workout.type,
          workout.duration,
          workout.calories
        ),
        notes: workout.notes ? this.sanitizeString(workout.notes) : undefined,
      }));
    }

    // Process habits
    if (Array.isArray(data.habits)) {
      result.habits = data.habits.map((habit: any) => ({
        name: this.sanitizeString(habit.name),
        completed: habit.completed === true,
      }));
    }

    // Calculate metadata
    result.metadata.totalCaloriesConsumed = result.foodEntries.reduce(
      (sum, entry) => sum + entry.calories,
      0
    );
    result.metadata.totalProtein = result.foodEntries.reduce(
      (sum, entry) => sum + entry.protein,
      0
    );
    result.metadata.totalCaloriesBurned = result.workouts.reduce(
      (sum, workout) => sum + workout.calories,
      0
    );

    // Determine parse quality
    const totalItems = 
      result.foodEntries.length + 
      result.workouts.length + 
      result.habits.length;
    
    if (totalItems === 0) {
      result.metadata.parseQuality = 'low';
    } else if (totalItems >= 3) {
      result.metadata.parseQuality = 'high';
    }

    return result;
  }

  private sanitizeString(str: any): string {
    if (typeof str !== 'string') return '';
    return str.trim().substring(0, 255);
  }

  private determineMealType(
    meal: any,
    name: string,
    description?: string
  ): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
    // If meal is already valid, use it
    const validMeals = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (validMeals.includes(meal)) {
      return meal;
    }

    // Check name and description for meal keywords
    const text = `${name} ${description || ''}`.toLowerCase();
    
    for (const [mealType, keywords] of Object.entries(MEAL_KEYWORDS)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return mealType as any;
      }
    }

    // Default to snack if unclear
    return 'snack';
  }

  private validateWorkoutType(
    type: any
  ): 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other' {
    const validTypes = ['cardio', 'strength', 'flexibility', 'sports', 'other'];
    return validTypes.includes(type) ? type : 'other';
  }

  private calculateWorkoutCalories(
    type: string,
    duration: number,
    providedCalories?: number
  ): number {
    // If calories were provided and seem reasonable, use them
    if (providedCalories && providedCalories > 0 && providedCalories < 2000) {
      return Math.round(providedCalories);
    }

    // Otherwise, calculate based on type and duration
    const caloriesPerMinute = 
      WORKOUT_CALORIES[type as keyof typeof WORKOUT_CALORIES] || 
      WORKOUT_CALORIES.default;
    
    return Math.round(duration * caloriesPerMinute);
  }
}
import { FoodRepository } from '@/repositories/food.repository';
import { AIParsingService } from '@/services/ai/parsing.service';
import { FoodEntry } from '@/types/models';
import { CreateFoodEntryDto, UpdateFoodEntryDto } from '@/validators/food.validators';
import { NotFoundError } from '@/utils/errors/app-errors';
import logger from '@/utils/logger';

export class FoodService {
  private foodRepo: FoodRepository;
  private aiService: AIParsingService;

  constructor() {
    this.foodRepo = new FoodRepository();
    this.aiService = new AIParsingService();
  }

  async getFoodEntries(userId: string, date?: string): Promise<{
    entries: FoodEntry[];
    totals: { calories: number; protein: number };
    date: string;
  }> {
    const targetDate = date ? new Date(date) : new Date();
    const entries = await this.foodRepo.findByUserAndDate(userId, targetDate);

    const totals = entries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
      }),
      { calories: 0, protein: 0 }
    );

    return {
      entries,
      totals,
      date: targetDate.toISOString().split('T')[0],
    };
  }

  async createFromDescription(
    userId: string,
    data: CreateFoodEntryDto
  ): Promise<FoodEntry> {
    try {
      // Parse the description with AI
      const parsed = await this.aiService.parseHealthData(data.description);

      if (parsed.foodEntries.length === 0) {
        throw new Error('No food items detected in the description');
      }

      // Take the first food entry
      const foodData = parsed.foodEntries[0];

      // Create the food entry
      const entry = await this.foodRepo.create({
        userId,
        name: foodData.name,
        calories: foodData.calories,
        protein: foodData.protein,
        meal: data.meal || foodData.meal,
        description: data.description,
        analysisConfidence: foodData.confidence,
        nutritionBreakdown: foodData.components,
        timestamp: new Date(),
      });

      logger.info(`Created food entry for user ${userId}: ${entry.name}`);
      return entry;
    } catch (error) {
      logger.error('Failed to create food entry:', error);
      throw error;
    }
  }

  async createManyFromParsedData(
    userId: string,
    parsedFoods: Array<{
      name: string;
      calories: number;
      protein: number;
      meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      description: string;
      confidence: number;
      components?: Record<string, { calories: number; protein: number }>;
    }>
  ): Promise<FoodEntry[]> {
    const entries = parsedFoods.map(food => ({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      meal: food.meal,
      description: food.description,
      analysisConfidence: food.confidence,
      nutritionBreakdown: food.components,
      timestamp: new Date(),
    }));

    return this.foodRepo.createMany(userId, entries);
  }

  async updateFoodEntry(
    id: string,
    userId: string,
    updates: UpdateFoodEntryDto
  ): Promise<FoodEntry> {
    // Verify the entry exists and belongs to the user
    const entries = await this.foodRepo.findByUserAndDate(userId, new Date());
    const entry = entries.find(e => e.id === id);
    
    if (!entry) {
      throw new NotFoundError('Food entry');
    }

    return this.foodRepo.update(id, userId, updates);
  }

  async deleteFoodEntry(id: string, userId: string): Promise<void> {
    await this.foodRepo.delete(id, userId);
    logger.info(`Deleted food entry ${id} for user ${userId}`);
  }
}
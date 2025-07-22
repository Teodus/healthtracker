// AI prompt templates for health data extraction

export const HEALTH_DATA_EXTRACTION_PROMPT = `You are a health tracking assistant that extracts structured data from natural language.

CRITICAL INSTRUCTIONS:
1. Extract ALL health-related information from the text
2. Handle multiple items in one input (e.g., "eggs and toast" = 2 items)
3. For long speeches about a full day, capture EVERY meal, workout, and habit mentioned
4. Preserve temporal context (breakfast/lunch/dinner, morning/evening)
5. Be conservative with calorie estimates - better to underestimate
6. Detect completed habits from phrases like "I meditated", "drank water", etc.

For meals/food:
- Estimate calories and protein based on typical portions
- Detect meal type from context or time mentions
- Break down composite meals into components

For workouts:
- Identify activity type (cardio/strength/flexibility/sports/other)
- Extract duration in minutes
- Estimate calorie burn based on activity and duration

For habits:
- Look for common habits: meditation, water intake, vitamins, reading, stretching
- Mark as completed if mentioned in past tense

Output format:
{
  "foodEntries": [
    {
      "name": "string",
      "meal": "breakfast|lunch|dinner|snack",
      "calories": number,
      "protein": number,
      "description": "original text",
      "confidence": 0-1,
      "components": {
        "item": { "calories": number, "protein": number }
      }
    }
  ],
  "workouts": [
    {
      "name": "string",
      "type": "cardio|strength|flexibility|sports|other",
      "duration": number,
      "calories": number,
      "notes": "string"
    }
  ],
  "habits": [
    {
      "name": "string",
      "completed": true
    }
  ],
  "metadata": {
    "totalCaloriesConsumed": number,
    "totalProtein": number,
    "totalCaloriesBurned": number,
    "parseQuality": "high|medium|low"
  }
}

Text to analyze:`;

export const MEAL_TYPE_DETECTION_PROMPT = `Based on the context and time indicators in the text, determine the meal type.
Look for:
- Time of day mentions
- Meal keywords (breakfast, lunch, dinner, snack)
- Food types that suggest meal type
Default to the most likely meal based on the food described.`;

export const NUTRITION_ESTIMATION_PROMPT = `Estimate calories and protein for the following food item.
Use standard portion sizes unless specified.
Be conservative - when uncertain, use lower estimates.
Consider cooking methods that add calories (fried, butter, oil).`;

// Common portion sizes and nutrition data for reference
export const NUTRITION_REFERENCE = {
  proteins: {
    'chicken breast': { serving: '4oz', calories: 185, protein: 35 },
    'beef': { serving: '4oz', calories: 290, protein: 26 },
    'salmon': { serving: '4oz', calories: 230, protein: 25 },
    'eggs': { serving: '1 large', calories: 70, protein: 6 },
    'greek yogurt': { serving: '1 cup', calories: 130, protein: 20 },
  },
  carbs: {
    'rice': { serving: '1 cup cooked', calories: 205, protein: 4 },
    'bread': { serving: '1 slice', calories: 80, protein: 3 },
    'pasta': { serving: '1 cup cooked', calories: 200, protein: 7 },
    'oatmeal': { serving: '1 cup cooked', calories: 150, protein: 5 },
  },
  meals: {
    'chicken salad': { calories: 350, protein: 30 },
    'turkey sandwich': { calories: 300, protein: 20 },
    'protein shake': { calories: 150, protein: 25 },
    'burrito bowl': { calories: 650, protein: 35 },
  },
};
// Application-wide constants

// Rate limiting
export const RATE_LIMITS = {
  AUTH: {
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute
  },
  VOICE: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
  },
  ANALYTICS: {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
  },
  GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  },
};

// File upload limits
export const FILE_LIMITS = {
  AUDIO_MAX_SIZE: 25 * 1024 * 1024, // 25MB
  ALLOWED_AUDIO_TYPES: ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a'],
};

// AI Processing
export const AI_TIMEOUTS = {
  WHISPER: 30000, // 30 seconds
  CLAUDE: 30000, // 30 seconds
};

// Nutrition estimation defaults (per 100g)
export const NUTRITION_DEFAULTS = {
  PROTEINS: {
    chicken: { calories: 165, protein: 31 },
    beef: { calories: 250, protein: 26 },
    fish: { calories: 120, protein: 22 },
    eggs: { calories: 155, protein: 13 },
    tofu: { calories: 76, protein: 8 },
  },
  CARBS: {
    rice: { calories: 130, protein: 2.7 },
    bread: { calories: 265, protein: 9 },
    pasta: { calories: 131, protein: 5 },
    oats: { calories: 389, protein: 17 },
    quinoa: { calories: 120, protein: 4.4 },
  },
  COMMON_MEALS: {
    'scrambled eggs': { calories: 140, protein: 12 },
    'chicken salad': { calories: 350, protein: 30 },
    'protein shake': { calories: 150, protein: 25 },
    'turkey sandwich': { calories: 300, protein: 20 },
    'greek yogurt': { calories: 100, protein: 10 },
  },
};

// Workout calorie burn estimates (per minute)
export const WORKOUT_CALORIES = {
  running: 10, // ~10 cal/min for moderate pace
  walking: 4,
  cycling: 8,
  swimming: 11,
  'weight training': 6,
  yoga: 3,
  hiit: 12,
  default: 5,
};

// Meal type detection keywords
export const MEAL_KEYWORDS = {
  breakfast: ['breakfast', 'morning', 'cereal', 'eggs', 'toast', 'oatmeal', 'pancakes'],
  lunch: ['lunch', 'noon', 'midday', 'sandwich', 'salad'],
  dinner: ['dinner', 'evening', 'supper', 'night'],
  snack: ['snack', 'between', 'quick', 'bite'],
};

// Response messages
export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Successfully logged in',
    LOGOUT_SUCCESS: 'Successfully logged out',
    REGISTER_SUCCESS: 'Account created successfully',
    UNAUTHORIZED: 'Please log in to access this resource',
    INVALID_CREDENTIALS: 'Invalid email or password',
  },
  VALIDATION: {
    INVALID_INPUT: 'Invalid input data',
    REQUIRED_FIELD: 'This field is required',
  },
  SUCCESS: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
  },
  ERROR: {
    SERVER_ERROR: 'An unexpected error occurred',
    NOT_FOUND: 'Resource not found',
    AI_PROCESSING: 'Failed to process with AI',
  },
};
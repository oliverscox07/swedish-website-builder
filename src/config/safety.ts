// Safety configuration for Firestore reads
// Adjust these values based on your needs and budget

export const SAFETY_CONFIG = {
  // Maximum Firestore reads per day (prevents runaway costs)
  MAX_DAILY_READS: 1000,
  
  // Maximum cache entries (prevents memory issues)
  MAX_CACHE_SIZE: 100,
  
  // Minimum time between reads in milliseconds (rate limiting)
  MIN_READ_INTERVAL: 1000, // 1 second
  
  // Cache duration in milliseconds (how long data stays fresh)
  CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
  
  // Warning thresholds (percentage of daily limit)
  WARNING_THRESHOLD: 0.8, // 80% - shows red warning
  CAUTION_THRESHOLD: 0.6, // 60% - shows yellow warning
  
  // Emergency fallback (what happens when limits are reached)
  EMERGENCY_FALLBACK: 'cache' as 'cache' | 'null' | 'error',
  
  // Logging levels
  LOG_LEVEL: 'info' as 'debug' | 'info' | 'warn' | 'error'
};

// Cost estimates (Firestore pricing: $0.06 per 100,000 reads)
export const COST_ESTIMATES = {
  DAILY_COST_AT_LIMIT: (SAFETY_CONFIG.MAX_DAILY_READS * 0.06) / 100000,
  MONTHLY_COST_AT_LIMIT: (SAFETY_CONFIG.MAX_DAILY_READS * 30 * 0.06) / 100000,
  YEARLY_COST_AT_LIMIT: (SAFETY_CONFIG.MAX_DAILY_READS * 365 * 0.06) / 100000
};

// Safety recommendations
export const SAFETY_TIPS = [
  'Monitor the safety dashboard regularly',
  'Adjust MAX_DAILY_READS based on your budget',
  'Consider increasing CACHE_DURATION for less frequent updates',
  'Use the emergency fallback to prevent unexpected charges'
];

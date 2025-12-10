// Static exercise images - curated for accuracy
// Each image is carefully selected to show the correct exercise movement

const exerciseImageMap: Record<string, string> = {
  // Lower body exercises
  'Squats': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=600&fit=crop',
  'Alternate Lunges': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&h=600&fit=crop',
  'Glute Bridge': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop',
  
  // Core exercises
  'Plank': 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=800&h=600&fit=crop',
  'Bicycle Crunches': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
  'Leg Raises': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
  'Russian Twist': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop',
  'Side Plank': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop',
  
  // Upper body exercises
  'Push-ups': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&h=600&fit=crop',
  'Tricep Dips': 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=800&h=600&fit=crop',
  'Arm Circles': 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=800&h=600&fit=crop',
  
  // Cardio exercises
  'Jumping Jacks': 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800&h=600&fit=crop',
  'Mountain Climbers': 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800&h=600&fit=crop',
  'High Knees': 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=600&fit=crop',
  'Burpees': 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&h=600&fit=crop',
};

// Default fallback image for any exercise not in the map
const defaultExerciseImage = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop';

// Get all valid exercise names
export const validExerciseNames = Object.keys(exerciseImageMap);

// Get image URL for an exercise - always returns a valid image
export function getExerciseImage(exerciseName: string): string {
  return exerciseImageMap[exerciseName] || defaultExerciseImage;
}

// Check if an exercise has a dedicated image
export function hasExerciseImage(exerciseName: string): boolean {
  return exerciseName in exerciseImageMap;
}

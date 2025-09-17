import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExerciseSuggestion {
  id: string;
  name: string;
  category: 'cardio' | 'strength' | 'flexibility' | 'balance';
  duration: string;
  calories: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  equipment: string;
}

interface ExerciseSuggestionsProps {
  visible: boolean;
  onClose: () => void;
  bodyGoal?: string;
  bmi?: number;
}

export default function ExerciseSuggestions({ visible, onClose, bodyGoal, bmi }: ExerciseSuggestionsProps) {
  
  // Debug log to see what we're receiving
  console.log('ExerciseSuggestions Props:', { bodyGoal, bmi, visible });
  
  const getExerciseSuggestions = (): ExerciseSuggestion[] => {
    const allExercises: ExerciseSuggestion[] = [
      // Weight Loss Exercises
      {
        id: '1',
        name: 'Brisk Walking',
        category: 'cardio',
        duration: '30-45 min',
        calories: '200-300 cal',
        difficulty: 'beginner',
        description: 'Great low-impact cardio for burning calories and improving cardiovascular health.',
        equipment: 'None'
      },
      {
        id: '2',
        name: 'Jumping Jacks',
        category: 'cardio',
        duration: '15-20 min',
        calories: '150-200 cal',
        difficulty: 'beginner',
        description: 'Full-body cardio exercise that boosts heart rate and burns calories quickly.',
        equipment: 'None'
      },
      {
        id: '3',
        name: 'High-Intensity Interval Training (HIIT)',
        category: 'cardio',
        duration: '20-30 min',
        calories: '300-400 cal',
        difficulty: 'intermediate',
        description: 'Alternating high and low intensity exercises for maximum calorie burn.',
        equipment: 'None'
      },
      {
        id: '4',
        name: 'Swimming',
        category: 'cardio',
        duration: '30-45 min',
        calories: '250-400 cal',
        difficulty: 'beginner',
        description: 'Low-impact full-body workout excellent for joint health and weight loss.',
        equipment: 'Pool access'
      },
      
      // Weight Gain/Muscle Building Exercises
      {
        id: '5',
        name: 'Push-ups',
        category: 'strength',
        duration: '15-20 min',
        calories: '100-150 cal',
        difficulty: 'beginner',
        description: 'Build upper body strength and muscle mass in chest, shoulders, and arms.',
        equipment: 'None'
      },
      {
        id: '6',
        name: 'Squats',
        category: 'strength',
        duration: '15-20 min',
        calories: '100-150 cal',
        difficulty: 'beginner',
        description: 'Strengthen legs, glutes, and core while building lower body muscle mass.',
        equipment: 'None'
      },
      {
        id: '7',
        name: 'Resistance Band Training',
        category: 'strength',
        duration: '20-30 min',
        calories: '150-200 cal',
        difficulty: 'intermediate',
        description: 'Build muscle strength and size using resistance bands for full-body workouts.',
        equipment: 'Resistance bands'
      },
      {
        id: '8',
        name: 'Dumbbell Exercises',
        category: 'strength',
        duration: '30-45 min',
        calories: '200-300 cal',
        difficulty: 'intermediate',
        description: 'Progressive weight training to build muscle mass and strength.',
        equipment: 'Dumbbells'
      },
      
      // Maintenance/General Health Exercises
      {
        id: '9',
        name: 'Yoga',
        category: 'flexibility',
        duration: '30-60 min',
        calories: '150-250 cal',
        difficulty: 'beginner',
        description: 'Improve flexibility, balance, and mental well-being while maintaining fitness.',
        equipment: 'Yoga mat'
      },
      {
        id: '10',
        name: 'Pilates',
        category: 'strength',
        duration: '30-45 min',
        calories: '200-300 cal',
        difficulty: 'intermediate',
        description: 'Core strengthening and body conditioning for overall fitness maintenance.',
        equipment: 'Yoga mat'
      },
      {
        id: '11',
        name: 'Cycling',
        category: 'cardio',
        duration: '30-60 min',
        calories: '250-400 cal',
        difficulty: 'beginner',
        description: 'Low-impact cardio that maintains cardiovascular health and leg strength.',
        equipment: 'Bicycle'
      },
      {
        id: '12',
        name: 'Stretching Routine',
        category: 'flexibility',
        duration: '15-20 min',
        calories: '50-80 cal',
        difficulty: 'beginner',
        description: 'Daily flexibility routine to maintain mobility and prevent injury.',
        equipment: 'None'
      }
    ];

    // Filter exercises based on body goal
    let filteredExercises: ExerciseSuggestion[] = [];
    
    const bodyGoalString = typeof bodyGoal === 'string' ? bodyGoal.toLowerCase() : '';
    
    if (bodyGoalString.includes('lose weight') || bodyGoalString.includes('lose')) {
      // Focus on cardio for weight loss
      filteredExercises = allExercises.filter(ex => 
        ex.category === 'cardio' || 
        (ex.category === 'strength' && ex.name.includes('HIIT'))
      );
    } else if (bodyGoalString.includes('gain weight') || bodyGoalString.includes('build muscle') || bodyGoalString.includes('gain') || bodyGoalString.includes('muscle')) {
      // Focus on strength training for weight/muscle gain
      filteredExercises = allExercises.filter(ex => 
        ex.category === 'strength' || 
        ex.name.includes('Push-ups') || 
        ex.name.includes('Squats')
      );
    } else {
      // Maintenance or general fitness - balanced approach
      filteredExercises = allExercises.filter(ex => 
        ex.category === 'flexibility' || 
        ex.category === 'balance' ||
        ex.name.includes('Yoga') ||
        ex.name.includes('Cycling') ||
        ex.name.includes('Walking')
      );
    }

    // Adjust difficulty based on BMI
    if (bmi && bmi > 30) {
      // Prioritize beginner-friendly, low-impact exercises
      filteredExercises = filteredExercises.filter(ex => 
        ex.difficulty === 'beginner' && 
        (ex.name.includes('Walking') || ex.name.includes('Swimming') || ex.name.includes('Yoga'))
      );
    } else if (bmi && bmi < 18.5) {
      // Focus on strength building for underweight individuals
      filteredExercises = filteredExercises.filter(ex => 
        ex.category === 'strength' || ex.name.includes('Resistance')
      );
    }

    // Ensure we have at least some exercises - fallback to general exercises if none match
    if (filteredExercises.length === 0) {
      filteredExercises = [
        allExercises[0], // Brisk Walking
        allExercises[4], // Push-ups
        allExercises[8], // Yoga
        allExercises[11] // Stretching
      ].filter(ex => ex !== undefined);
    }

    console.log('Filtered exercises:', filteredExercises.length, 'for goal:', bodyGoalString);

    // Return top 4 suggestions
    return filteredExercises.slice(0, 4);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cardio': return 'heart';
      case 'strength': return 'barbell';
      case 'flexibility': return 'body';
      case 'balance': return 'fitness';
      default: return 'fitness';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#757575';
    }
  };

  const suggestions = getExerciseSuggestions();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Exercise Suggestions</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.goalInfo}>
          <Text style={styles.goalText}>
            Based on your goal: <Text style={styles.goalHighlight}>{bodyGoal || 'General fitness'}</Text>
          </Text>
          {bmi && (
            <Text style={styles.bmiText}>BMI: {bmi.toFixed(1)}</Text>
          )}
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {suggestions.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseInfo}>
                  <Ionicons 
                    name={getCategoryIcon(exercise.category)} 
                    size={24} 
                    color="#FCB647" 
                  />
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) }]}>
                  <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
                </View>
              </View>
              
              <Text style={styles.exerciseDescription}>{exercise.description}</Text>
              
              <View style={styles.exerciseDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.detailText}>{exercise.duration}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="flame" size={16} color="#666" />
                  <Text style={styles.detailText}>{exercise.calories}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="fitness" size={16} color="#666" />
                  <Text style={styles.detailText}>{exercise.equipment}</Text>
                </View>
              </View>
            </View>
          ))}
          
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  goalInfo: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  goalText: {
    fontSize: 16,
    color: '#666',
  },
  goalHighlight: {
    fontWeight: 'bold',
    color: '#FCB647',
  },
  bmiText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  bottomPadding: {
    height: 20,
  },
});

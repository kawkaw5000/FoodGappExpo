import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ExerciseOverview = () => {
  const [selectedDay, setSelectedDay] = useState(28);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const days = [26, 27, 28, 29, 30];
  const exercises = ['Walking', 'Jogging', 'Aerobic exercise'];

  const handleAddExercise = (exercise: string) => {
    setShowAddExercise(false);
    setShowCompletion(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>This week exercise</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekContainer}>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === day && styles.selectedDay
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[
              styles.dayText,
              selectedDay === day && styles.selectedDayText
            ]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.reminderText}>Tomorrow something to complete</Text>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowAddExercise(true)}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>

      <View style={styles.planSection}>
        <Text style={styles.planTitle}>My Plan ✏️</Text>
        <Text style={styles.currentGoal}>Current goal</Text>
        
        <TouchableOpacity style={styles.goalButton}>
          <Text style={styles.goalButtonText}>Maintain Gain</Text>
        </TouchableOpacity>

        <Text style={styles.questionText}>How do I work out?</Text>
        
        <TouchableOpacity style={styles.exerciseTypeButton}>
          <Text style={styles.exerciseTypeText}>Light Exercise</Text>
          <Text style={styles.exerciseSubtext}>1-3 / Week</Text>
        </TouchableOpacity>
      </View>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddExercise}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>What type of exercise did you do today?</Text>
            
            {exercises.map((exercise, index) => (
              <TouchableOpacity
                key={index}
                style={styles.exerciseOption}
                onPress={() => handleAddExercise(exercise)}
              >
                <Text style={styles.exerciseOptionText}>{exercise}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Completion Modal */}
      <Modal
        visible={showCompletion}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.completionContainer}>
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark" size={60} color="white" />
            </View>
            <Text style={styles.completionTitle}>Exercise this week is complete!</Text>
            <Text style={styles.completionSubtext}>You successfully completed this week's exercise.</Text>
            
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => setShowCompletion(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: '#FCB647',
  },
  dayText: {
    fontSize: 16,
    color: 'black',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reminderText: {
    textAlign: 'center',
    color: 'gray',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#FCB647',
    padding: 15,
    borderRadius: 8,
    margin: 20,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  planSection: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  currentGoal: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
  goalButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  goalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
  exerciseTypeButton: {
    backgroundColor: '#FFF59D',
    padding: 15,
    borderRadius: 8,
  },
  exerciseTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  exerciseSubtext: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  exerciseOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exerciseOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  completionContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    width: '80%',
  },
  checkmarkContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  completionSubtext: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  doneButton: {
    backgroundColor: '#FCB647',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  doneButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ExerciseOverview;

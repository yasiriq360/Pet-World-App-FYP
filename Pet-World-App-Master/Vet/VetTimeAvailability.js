import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { colors } from '../theme/colors';

// Time conversion functions remain the same
const convertTo12Hour = (hour, minute) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const formattedHour = displayHour.toString();
  const formattedMinute = minute.toString().padStart(2, '0');
  return `${formattedHour}:${formattedMinute} ${period}`;
};

const convertTo24Hour = (time12h) => {
  if (!time12h) return '';
  const [time, period] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

const generateTimeSlots = (startTime = '') => {
  // Time slot generation logic remains the same
  const slots = [];
  let startHour = 0;
  let startMinute = 0;

  if (startTime) {
    const time24h = convertTo24Hour(startTime);
    if (time24h) {
      const [hours, minutes] = time24h.split(':').map(Number);
      startHour = hours;
      startMinute = minutes;
    }
  }

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (startTime) {
        if (hour < startHour || (hour === startHour && minute <= startMinute)) {
          continue;
        }
      }
      slots.push(convertTo12Hour(hour, minute));
    }
  }
  return slots;
};

const TimePicker = ({ visible, onClose, onSelect, selectedTime, startTime }) => {
  const timeSlots = generateTimeSlots(startTime);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButtonContainer}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.timeList} showsVerticalScrollIndicator={false}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeItem,
                  selectedTime === time && styles.selectedTimeItem,
                ]}
                onPress={() => {
                  onSelect(time);
                  onClose();
                }}
              >
                <Text style={[
                  styles.timeText,
                  selectedTime === time && styles.selectedTimeText,
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const VetTimeAvailability = ({ route, navigation }) => {
  // State management remains the same
  const { vetId } = route.params;
  const [availability, setAvailability] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [activeSelection, setActiveSelection] = useState({ 
    day: null, 
    type: null,
    slotIndex: null 
  });

  // All the existing functions remain the same
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}/timeAvailability.json`
        );
        const data = await response.json();

        const initialAvailability = {
          Monday: [], Tuesday: [], Wednesday: [],
          Thursday: [], Friday: [], Saturday: [], Sunday: [],
        };

        if (data) {
          const fetchedAvailability = { ...initialAvailability, ...data };
          
          Object.keys(fetchedAvailability).forEach((day) => {
            const dayData = fetchedAvailability[day];
            if (Array.isArray(dayData)) {
              fetchedAvailability[day] = dayData.map(slot => {
                const formatTime = (time) => {
                  if (!time || typeof time !== 'string') return "";
                  // If it's already in 12-hour format with AM/PM, use it directly.
                  if (time.includes('AM') || time.includes('PM')) {
                    return time;
                  }
                  // Otherwise, assume it's old 24-hour data and convert it.
                  if (time.includes(':')) {
                    const parts = time.split(':').map(Number);
                    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                      return convertTo12Hour(parts[0], parts[1]);
                    }
                  }
                  return ""; // Return empty for invalid formats
                };

                return {
                  start: formatTime(slot.start),
                  end: formatTime(slot.end),
                };
              }).filter(slot => slot.start && slot.end); // Filter out incomplete slots
            } else {
              // Ensure day is always an array for consistency in the UI
              fetchedAvailability[day] = [];
            }
          });
          setAvailability(fetchedAvailability);
        } else {
            setAvailability(initialAvailability);
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
        Alert.alert("Error", "Could not fetch availability data.");
      } finally {
        setLoading(false);
      }
    };

    if (vetId) fetchAvailability();
  }, [vetId]);

  const handleTimeSelect = (time) => {
    if (activeSelection.day && activeSelection.type) {
      setAvailability((prev) => {
        const updatedDay = [...prev[activeSelection.day]];
        
        if (activeSelection.slotIndex !== null) {
          updatedDay[activeSelection.slotIndex] = {
            ...updatedDay[activeSelection.slotIndex],
            [activeSelection.type]: time
          };
        }
        
        return {
          ...prev,
          [activeSelection.day]: updatedDay
        };
      });
    }
  };

  const addNewSlot = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: [...prev[day], { start: "", end: "" }]
    }));
  };

  const removeSlot = (day, index) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  const validateTimes = (slots) => {
    if (slots.length === 0) return true;

    const timeRanges = slots.map(slot => {
      const start24 = convertTo24Hour(slot.start);
      const end24 = convertTo24Hour(slot.end);
      const [startHour, startMinute] = start24.split(':').map(Number);
      const [endHour, endMinute] = end24.split(':').map(Number);
      return {
        start: startHour * 60 + startMinute,
        end: endHour * 60 + endMinute
      };
    });

    for (const range of timeRanges) {
      if (range.end <= range.start) return false;
    }

    for (let i = 0; i < timeRanges.length; i++) {
      for (let j = i + 1; j < timeRanges.length; j++) {
        if (
          (timeRanges[i].start <= timeRanges[j].end && 
           timeRanges[i].end >= timeRanges[j].start) ||
          (timeRanges[j].start <= timeRanges[i].end && 
           timeRanges[j].end >= timeRanges[i].start)
        ) {
          return false;
        }
      }
    }

    return true;
  };

  const saveTimeAvailability = async () => {
    for (const day in availability) {
      const slots = availability[day];
      
      const invalidSlot = slots.find(slot => 
        (slot.start && !slot.end) || (!slot.start && slot.end)
      );
      
      if (invalidSlot) {
        Alert.alert("Error", `Please set both start and end time for all slots in ${day}.`);
        return;
      }

      if (!validateTimes(slots)) {
        Alert.alert("Error", `Invalid time ranges or overlapping slots detected for ${day}.`);
        return;
      }
    }

    const availabilityToSave = { ...availability };
    for (const day in availabilityToSave) {
        // Filter out slots that are incomplete before saving
        availabilityToSave[day] = availabilityToSave[day].filter(slot => slot.start && slot.end);
    }

    try {
      await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}/timeAvailability.json`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(availabilityToSave),
        }
      );

      Alert.alert("Success", "Time availability saved successfully!");
      navigation.navigate("DashboardScreen", { vetId });
    } catch (error) {
      console.error("Error saving time availability:", error);
      Alert.alert("Error", "Failed to save time availability.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Availability Schedule</Text>
              <Text style={styles.subtitle}>
                Set your working hours for each day
              </Text>
            </View>

            {Object.keys(availability).map((day) => (
              <View key={day} style={styles.dayContainer}>
                <Text style={styles.dayText}>{day}</Text>
                
                {availability[day].map((slot, index) => (
                  <View key={index} style={styles.slotContainer}>
                    <View style={styles.timeInputContainer}>
                      <TouchableOpacity
                        style={[styles.timeButton, slot.start && styles.timeButtonFilled]}
                        onPress={() => {
                          setActiveSelection({ day, type: 'start', slotIndex: index });
                          setShowPicker(true);
                        }}
                      >
                        <Text style={[styles.timeButtonText, slot.start && styles.timeButtonTextFilled]}>
                          {slot.start || 'Start Time'}
                        </Text>
                      </TouchableOpacity>

                      <Text style={styles.toText}>to</Text>

                      <TouchableOpacity
                        style={[styles.timeButton, slot.end && styles.timeButtonFilled]}
                        onPress={() => {
                          setActiveSelection({ day, type: 'end', slotIndex: index });
                          setShowPicker(true);
                        }}
                      >
                        <Text style={[styles.timeButtonText, slot.end && styles.timeButtonTextFilled]}>
                          {slot.end || 'End Time'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeSlot(day, index)}
                      >
                        <Text style={styles.removeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addNewSlot(day)}
                >
                  <Text style={styles.addButtonText}>+ Add Time Slot</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={saveTimeAvailability}
            >
              <Text style={styles.saveButtonText}>Save Schedule</Text>
            </TouchableOpacity>

            <TimePicker
              visible={showPicker}
              onClose={() => setShowPicker(false)}
              onSelect={handleTimeSelect}
              selectedTime={
                activeSelection.day && activeSelection.type && activeSelection.slotIndex !== null
                  ? availability[activeSelection.day][activeSelection.slotIndex][activeSelection.type]
                  : ''
              }
              startTime={
                activeSelection.type === 'end' && activeSelection.slotIndex !== null
                  ? availability[activeSelection.day][activeSelection.slotIndex].start
                  : ''
              }
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  dayContainer: {
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dayText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  slotContainer: {
    marginBottom: 12,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeButton: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 12,
    alignItems: "center",
  },
  timeButtonFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeButtonText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "500",
  },
  timeButtonTextFilled: {
    color: "#fff",
  },
  toText: {
    marginHorizontal: 8,
    color: "#666",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  closeButtonContainer: {
    padding: 8,
  },
  closeButton: {
    fontSize: 20,
    color: "#666",
  },
  timeList: {
    maxHeight: 400,
  },
  timeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedTimeItem: {
    backgroundColor: `${colors.primary}15`,
  },
  timeText: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  selectedTimeText: {
    color: colors.primary,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: `${colors.primary}15`,
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#fff0f0',
    padding: 10,
    borderRadius: 10,
    marginLeft: 8,
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    marginVertical: 24,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
});

export default VetTimeAvailability;

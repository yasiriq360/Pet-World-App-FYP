import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

const years = Array.from({ length: 22 }, (_, i) => 2004 + i);
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

const CalendarPicker = ({ navigation, route }) => {
  const { petName, breed, image, size, weight, unit, userId, petDescription, gender } = route.params;
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const days = Array.from({ length: daysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleDone = async () => {
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    if (selectedDate > new Date()) {
      Alert.alert("Invalid Date", "Please select a past date.");
      return;
    }

    const age = calculateAge(selectedDate);
    const birthDate = selectedDate.toDateString();

    // Upload image to Cloudinary and get the URL
    let imageUrl = image;
    if (image && !image.startsWith('http')) {
      try {
        // Convert local image URI to base64
        const base64 = await FileSystem.readAsStringAsync(image, { encoding: FileSystem.EncodingType.Base64 });
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dag88975y/upload`;
        const formData = new FormData();
        formData.append('file', dataUrl);
        formData.append('upload_preset', 'Pet World App');

        const uploadResponse = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const data = await uploadResponse.json();
        imageUrl = data.secure_url;
      } catch (error) {
        Alert.alert(
          'Upload Error',
          'Failed to upload image. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    try {
      const userResponse = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}.json`
      );
      const userData = await userResponse.json();

      let numberOfPets;
      if (userData && userData.numberOfPets !== undefined) {
        numberOfPets = userData.numberOfPets + 1;
      } else {
        numberOfPets = 1;
      }

      const updateUserResponse = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}.json`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ numberOfPets }),
        }
      );

      if (!updateUserResponse.ok) {
        throw new Error("Failed to update user pet count");
      }

      const petResponse = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}/Pets.json`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            petName,
            breed,
            image: imageUrl,
            size,
            weight,
            unit,
            birthDate,
            age,
            petDescription,
            gender,
          }),
        }
      );

      if (!petResponse.ok) {
        throw new Error("Failed to save pet data");
      }

      const responseData = await petResponse.json();
      const firebasePetId = responseData.name;

      Alert.alert("Success", "Pet data saved successfully!");

      navigation.reset({
        index: 0,
        routes: [{ name: "Functionality", params: { userId, petId: firebasePetId } }],
      });

    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Error", "Failed to save pet data.");
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="calendar" size={32} color="#E7D5BB" style={styles.calendarIcon} />
      <Text style={styles.header}>Select Birth Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearRow}>
        {years.map((year) => (
          <TouchableOpacity key={year} onPress={() => setSelectedYear(year)}>
            <Text style={[styles.year, year === selectedYear && styles.selectedYear]}>{year}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.monthRow}>
        <TouchableOpacity onPress={() => setSelectedMonth((prev) => Math.max(prev - 1, 0))}>
          <Text style={styles.monthSwitch}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{months[selectedMonth]}</Text>
        <TouchableOpacity onPress={() => setSelectedMonth((prev) => Math.min(prev + 1, 11))}>
          <Text style={styles.monthSwitch}>{">"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.daysContainer}>
        {days.map((day) => (
          <TouchableOpacity key={day} onPress={() => setSelectedDay(day)} style={styles.dayButton}>
            <Text style={[styles.dayText, day === selectedDay && styles.selectedDayText]}>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  calendarIcon: { alignSelf: 'center', marginBottom: 10 },
  header: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  yearRow: { flexDirection: "row", marginBottom: 20 },
  year: { fontSize: 16, marginHorizontal: 10, color: "#aaa" },
  selectedYear: { color: "#E7D5BB", fontWeight: "bold" },
  monthRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  monthSwitch: { fontSize: 24, color: "#E7D5BB" },
  monthText: { fontSize: 18, fontWeight: "bold", color: "#E7D5BB", marginHorizontal: 8 },
  daysContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  dayButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center", margin: 5 },
  dayText: { fontSize: 16, color: "#E7D5BB" },
  selectedDayText: { color: "#fff", backgroundColor: "#E7D5BB", borderRadius: 20, width: 30, height: 30, textAlign: "center", lineHeight: 30 },
  doneButton: { marginTop: 20, backgroundColor: "#E7D5BB", padding: 15, borderRadius: 10, alignItems: "center" },
  doneText: { color: "#fff", fontSize: 16 },
});

export default CalendarPicker;

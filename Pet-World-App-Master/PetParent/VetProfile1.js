import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { colors } from "../theme/colors";
import { Feather } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

// Reusable Star Rating Component
const StarRating = ({ rating, size = 16 }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    let name = "star";
    if (i <= fullStars) {
      name = "star";
    } else if (i === fullStars + 1 && halfStar) {
      name = "star"; // Using filled star for half as well for simplicity
    }
    stars.push(
      <Feather
        key={i}
        name={name}
        size={size}
        style={i <= rating ? styles.starFilled : styles.starEmpty}
      />
    );
  }
  return <View style={styles.starContainer}>{stars}</View>;
};


const VetProfile1 = ({ route, navigation }) => {
  const { vet, vetId, userId } = route.params;
  const [activeTab, setActiveTab] = useState('About');
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [hasChattedWithVet, setHasChattedWithVet] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  // State to track selected day (default to today)
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());

  useEffect(() => {
    fetchReviews();
    checkChatWithVet();

    // Polling interval for reviews and chat status
    const interval = setInterval(() => {
      fetchReviews();
      checkChatWithVet();
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [vetId]);

  // Check if user has chatted with this vet
  const checkChatWithVet = async () => {
    try {
      const chatId = [userId, vetId].sort().join('_');
      const response = await fetch(`https://pet-world-app123-default-rtdb.firebaseio.com/chats/${chatId}.json`);
      const data = await response.json();
      // If there are any messages, user has chatted with vet
      setHasChattedWithVet(!!data && Object.keys(data).length > 0);
    } catch (error) {
      setHasChattedWithVet(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}/reviews.json`);
      const data = await response.json();
      if (data) {
        const reviewsArray = Object.values(data);
        setReviews(reviewsArray.sort((a, b) => b.timestamp - a.timestamp));
        if (reviewsArray.length > 0) {
          const totalRating = reviewsArray.reduce((acc, review) => acc + review.rating, 0);
          setAverageRating(totalRating / reviewsArray.length);
        }
        // Check if this user has already reviewed
        setHasReviewed(reviewsArray.some(r => r.userId === userId));
      } else {
        setHasReviewed(false);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setHasReviewed(false);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!hasChattedWithVet) {
      Alert.alert("Not allowed", "You can only review a vet after chatting with them.");
      return;
    }
    if (hasReviewed) {
      Alert.alert("Already reviewed", "You have already submitted a review for this vet.");
      return;
    }
    if (myRating === 0 || myComment.trim() === '') {
      Alert.alert("Incomplete", "Please provide a rating and a comment.");
      return;
    }
    try {
      const userResponse = await fetch(`https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}.json`);
      const userData = await userResponse.json();
      const newReview = {
        userId,
        userName: userData?.username || 'Anonymous',
        userImage: userData?.profileImage || '',
        rating: myRating,
        comment: myComment.trim(),
        timestamp: Date.now(),
      };
      await fetch(`https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}/reviews.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });
      fetchReviews(); // Re-fetch reviews to update the list and average
      setReviewModalVisible(false);
      setMyRating(0);
      setMyComment('');
      Alert.alert("Success", "Your review has been submitted!");
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Could not submit your review.");
    }
  };

  const renderAboutTab = () => (
    <View style={styles.tabContentContainer}>
      <Text style={styles.sectionTitle}>Animal Behaviour and Surgeon</Text>
      <Text style={styles.aboutText}>{vet.bio}</Text>
      <Text style={styles.sectionTitle}>Services offered</Text>
      <Text style={styles.servicesText}>
        {Array.isArray(vet.services) 
          ? vet.services.map(s => `• ${s.trim()}`).join('\n')
          : `• ${vet.services}`
        }
      </Text>
      {/* Chat Button in About Tab */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate('ChatScreen', { userId, vetId: vet.vetId || vetId,vet })}
        activeOpacity={0.8}
      >
        <Text style={styles.chatButtonText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAppointmentTab = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayMap = {
      Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
      Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday',
    };
    const today = new Date();
    const week = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      return date;
    });
    const selectedDate = week[selectedDayIndex];
    const selectedDayName = days[selectedDate.getDay()];
    const selectedDayFull = dayMap[selectedDayName];
    const timeAvailability = vet.timeAvailability || {};
    const selectedSlots = timeAvailability[selectedDayFull];
    const hasSlots = Array.isArray(selectedSlots) && selectedSlots.length > 0;

    return (
      <View style={styles.tabContentContainer}>
        <View style={styles.calendarContainer}>
          <Text style={styles.dateHeaderText}>{`Jan 27 - Feb 9`}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={styles.weekContainer}>
              {week.map((date, idx) => {
                const dayName = days[date.getDay()];
                const isSelected = idx === selectedDayIndex;
                return (
                  <TouchableOpacity
                    key={date.toISOString()}
                    style={[
                      styles.dayContainer,
                      isSelected && { backgroundColor: colors.primary, borderRadius: 10 },
                      { alignItems: 'center', marginHorizontal: 6, padding: 8 },
                    ]}
                    onPress={() => setSelectedDayIndex(idx)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dayNameText,
                      isSelected && { color: colors.surface, fontWeight: 'bold' },
                    ]}>{dayMap[dayName]}</Text>
                    <Text style={[
                      styles.dayNumberText,
                      isSelected && { color: colors.surface, fontWeight: 'bold' },
                    ]}>{date.getDate()}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
        {/* Slots for selected day */}
        <View style={{ marginTop: 32, alignItems: 'center', minHeight: 60 }}>
          {hasSlots ? (
            selectedSlots.map((slot, index) => (
              <View key={index} style={[styles.timeSlot, { 
                flexDirection: 'row', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minWidth: 120,
                width: 'auto',
                paddingHorizontal: 16, 
                marginBottom: 10,
              }]}>
                <Text style={styles.timeSlotText}>{slot.start} - {slot.end}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: 6 }}>No slots</Text>
          )}
        </View>
      </View>
    );
  };
  
  const renderReviewsTab = () => (
    <View style={styles.tabContentContainer}>
      {loadingReviews ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : reviews.length > 0 ? (
        reviews.map((review, index) => (
          <View key={index} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Image source={{ uri: review.userImage || 'https://via.placeholder.com/40' }} style={styles.reviewUserImage} />
              <View style={styles.reviewHeaderText}>
                <Text style={styles.reviewUserName}>{review.userName}</Text>
                <StarRating rating={review.rating} />
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
            <Text style={styles.reviewDate}>{new Date(review.timestamp).toLocaleDateString()}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noReviewsText}>No reviews yet. Be the first to write one!</Text>
      )}
      {/* Only show button if user has chatted and not reviewed */}
      {!hasChattedWithVet && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 16 }}>
          You can only review after chatting with this vet.
        </Text>
      )}
      {hasReviewed && (
        <Text style={{ color: 'orange', textAlign: 'center', marginTop: 16 }}>
          You have already submitted a review for this vet.
        </Text>
      )}
      <TouchableOpacity
        style={[styles.addReviewButton, (!hasChattedWithVet || hasReviewed) && { backgroundColor: colors.border }]}
        onPress={() => {
          if (!hasChattedWithVet || hasReviewed) return;
          setReviewModalVisible(true);
        }}
        disabled={!hasChattedWithVet || hasReviewed}
      >
        <Text style={styles.addReviewButtonText}>Write a Review</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.mainContainer}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: vet.profileImage }} style={styles.profileImage} />
          <Text style={styles.vetName}>Dr. {vet.username}</Text>
          <View style={styles.ratingContainer}>
            <StarRating rating={averageRating} />
            <Text style={styles.reviewCountText}>{averageRating.toFixed(1)} ({reviews.length} reviews)</Text>
          </View>
        </View>
        <View style={styles.tabSwitcher}>
          {['Appointment', 'About', 'Reviews'].map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {activeTab === 'About' && renderAboutTab()}
        {activeTab === 'Appointment' && renderAppointmentTab()}
        {activeTab === 'Reviews' && renderReviewsTab()}
      </ScrollView>

      <Modal visible={isReviewModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Cross button to close modal */}
            <TouchableOpacity
              style={styles.crossButton}
              onPress={() => setReviewModalVisible(false)}
              accessibilityLabel="Close review modal"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <AntDesign name="close" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Write a Review</Text>
            <View style={styles.modalRatingContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setMyRating(star)}>
                  <Feather name="star" size={32} style={star <= myRating ? styles.starFilled : styles.starEmpty} />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.reviewInput}
              placeholder="Share your experience..."
              multiline
              value={myComment}
              onChangeText={setMyComment}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setReviewModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={handleReviewSubmit}>
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  mainContainer: { flex: 1 },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  vetName: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  reviewCountText: { marginLeft: 8, color: colors.textSecondary },
  starContainer: { flexDirection: 'row' },
  starFilled: { color: '#FFD700' },
  starEmpty: { color: '#d3d3d3' },
  tabSwitcher: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  activeTab: { backgroundColor: colors.primary },
  tabText: { fontSize: 16, color: colors.textSecondary, fontWeight: '500' },
  activeTabText: { color: colors.surface },
  tabContentContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 15, marginTop: 10 },
  aboutText: { fontSize: 16, color: colors.textSecondary, lineHeight: 24 },
  servicesText: { fontSize: 16, color: colors.textSecondary, lineHeight: 26 },
  calendarContainer: { marginBottom: 20 },
  dateHeaderText: { textAlign: 'center', fontSize: 16, fontWeight: '500', marginBottom: 15, color: colors.textPrimary },
  weekContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  dayContainer: { alignItems: 'center', padding: 8, borderRadius: 8 },
  todayContainer: { backgroundColor: colors.primary },
  dayNameText: { color: colors.textSecondary, marginBottom: 5 },
  dayNumberText: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  timeSlotsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  timeSlot: {
    width: '23%',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 10,
  },
  timeSlotText: { color: colors.primary, fontWeight: '500' },
  reviewCard: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewUserImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  reviewHeaderText: { flex: 1 },
  reviewUserName: { fontWeight: 'bold', color: colors.textPrimary },
  reviewComment: { color: colors.textSecondary, lineHeight: 22 },
  reviewDate: { color: colors.textSecondary, fontSize: 12, textAlign: 'right', marginTop: 10 },
  noReviewsText: { textAlign: 'center', color: colors.textSecondary, marginTop: 20 },
  addReviewButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  addReviewButtonText: { color: colors.surface, fontWeight: 'bold', fontSize: 16 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    width: '90%',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 20,
    position: 'relative',
  },
  crossButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: colors.textPrimary },
  modalRatingContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  cancelButton: { backgroundColor: colors.border },
  submitButton: { backgroundColor: colors.primary },
  modalButtonText: { color: colors.surface, fontWeight: 'bold' },
  chatButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  chatButtonText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
});

export default VetProfile1;

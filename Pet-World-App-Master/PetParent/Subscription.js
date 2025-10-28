import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { MotiView } from 'moti'; // Import MotiView

const SubscriptionScreen = ({ route, navigation }) => {
  const { userId } = route.params; // Get userId from navigation params

  // Define subscription plans
  const plans = [
    {
      id: 1,
      name: "Basic Plan",
      price: "250 pkr/month",
      description: "Add up to 3 pets",
      icon: "pets",
      numericPrice: 250,
      duration: "1 month",
      num_posts: 3,
    },
    {
      id: 2,
      name: "Premium Plan",
      price: "500 pkr/month",
      description: "Add unlimited pets",
      icon: "star",
      numericPrice: 500,
      duration: "1 month",
      num_posts: -1, // Unlimited posts
    },
    {
      id: 3,
      name: "Annual Plan",
      price: "4800 pkr/year",
      description: "Add unlimited pets and save 20%",
      icon: "card-giftcard",
      numericPrice: 4800,
      duration: "1 year",
      num_posts: -1, // Unlimited posts
    },
  ];

  const handlePlanSelection = (plan) => {
    // Navigate to the next page (e.g., PaymentScreen) with the selected plan and userId
    navigation.navigate("PaymentScreen", { 
      userId,
      planName: plan.name,
      planPrice: plan.numericPrice,
      planDuration: plan.duration,
      numPosts: plan.num_posts,
    });
  };

  return (
    <LinearGradient colors={["#D3C0A8","#E7D5BB"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose a Subscription Plan</Text>
        <Text style={styles.subtitle}>
          You have reached the maximum number of pets (2) allowed with your current plan. Upgrade to
          add more pets.
        </Text>
      </View>

      {/* Display plans */}
      {plans.map((plan, index) => (
        <MotiView
          key={plan.id}
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: index * 100, duration: 1000 }}
          style={styles.planCard}
        >
          <TouchableOpacity
            style={styles.planCard}
            onPress={() => handlePlanSelection(plan)}
          >
            <LinearGradient
              colors={["#D3C0A8","#E7D5BB"]}
              style={styles.gradientBackground}
            >
              <MaterialIcons name={plan.icon} size={40} color="#fff" style={styles.icon} />
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>{plan.price}</Text>
              <Text style={styles.planDescription}>{plan.description}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>
      ))}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#ddd",
  },
  planCard: {
    width: "90%",
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  gradientBackground: {
    padding: 25,
    alignItems: "center",
  },
  icon: {
    marginBottom: 15,
  },
  planName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 20,
    color: "#ffdd57",
    marginBottom: 5,
  },
  planDescription: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
});

export default SubscriptionScreen;
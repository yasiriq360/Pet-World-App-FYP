import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  // Linking, // Removed Linking import
} from "react-native";
import { Snackbar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { MotiView } from 'moti'; // Import MotiView
import { StripeProvider, useStripe } from '@stripe/stripe-react-native'; // Re-added Stripe SDK imports

const PaymentScreen = ({ route, navigation }) => {
  const { userId, planName, planPrice, planDuration, numPosts } = route.params; // Destructure new plan details
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState(null); // State to store clientSecret
  const [isPaymentSheetReady, setIsPaymentSheetReady] = useState(false); // New state to track if payment sheet is ready

  const { initPaymentSheet, presentPaymentSheet } = useStripe(); // Re-added Stripe hooks

  useEffect(() => {
    // Initialize payment sheet when component mounts or plan details change
    const initializePaymentSheet = async () => {
      setLoading(true);
      setIsPaymentSheetReady(false); // Reset readiness state
      try {
        const response = await fetch('http://10.211.0.23:5000/create-checkout-session', { // Ensure this is your Flask backend URL
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan_name: planName,
            plan_price: planPrice.toFixed(2), // Ensure price is sent as a string with 2 decimal places
            plan_email: 'test_user@example.com', // You might want to get the actual user email here
            plan_duration: planDuration,
            num_posts: numPosts,
          }),
        });

        const { error: backendError, clientSecret } = await response.json(); // Expecting 'clientSecret'

        if (backendError) {
          throw new Error(backendError);
        }

        console.log("Received clientSecret from backend:", clientSecret); // Debugging log
        setPaymentIntentClientSecret(clientSecret); // Store the clientSecret

        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: "Pet World App",
          paymentIntentClientSecret: clientSecret,
          allowsDelayedPaymentMethods: true,
        });

        if (initError) {
          throw new Error(initError.message);
        } else {
            setIsPaymentSheetReady(true); // Payment sheet is ready after successful initialization
        }
      } catch (error) {
        console.error("Error initializing payment sheet:", error);
        showSnackbar(`Error setting up payment: ${error.message}`, "error");
      } finally {
        setLoading(false);
      }
    };
    initializePaymentSheet();
  }, [planName, planPrice, planDuration, numPosts]); // Re-initialize if plan details change

  // Add helper to calculate end date
  const calculateSubscriptionEndDate = (startDate, planName) => {
    const endDate = new Date(startDate);
    if (planName === "Annual Plan") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    return endDate.toISOString();
  };

  // Add function to save subscription
  const saveSubscriptionToFirebase = async () => {
    const subscriptionId = Date.now().toString();
    const now = new Date();
    const endDate = calculateSubscriptionEndDate(now, planName);
    const subscriptionData = {
      planName,
      planPrice: `${planPrice} pkr/${planDuration === "1 year" ? "year" : "month"}`,
      planDescription: numPosts === -1 ? "Add unlimited pets" : `Add up to ${numPosts} pets`,
      subscriptionDate: now.toISOString(),
      subscriptionEndDate: endDate,
      subscriptionStatus: "active",
      id: subscriptionId,
    };
    // Remove any previous active subscriptions
    await fetch(`https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}/Subscription.json`, {
      method: "GET",
    })
      .then(res => res.json())
      .then(async (subs) => {
        if (subs) {
          for (const key of Object.keys(subs)) {
            if (subs[key].subscriptionStatus === "active") {
              await fetch(`https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}/Subscription/${key}.json`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriptionStatus: "cancelled" })
              });
            }
          }
        }
      });
    // Save new subscription
    await fetch(`https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}/Subscription/${subscriptionId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscriptionData),
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    showSnackbar("Presenting payment sheet...", "info");

    try {
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          showSnackbar('Payment cancelled by user.', 'error');
        } else {
          showSnackbar(`Payment failed: ${presentError.message}`, 'error');
        }
        return;
      }

      // Payment was successful. Now confirm with your backend.
      // Since the backend logic to save payment details was removed, we'll just show success.
      if (!presentError) {
        await saveSubscriptionToFirebase();
        showSnackbar(`Payment Successful! You have subscribed to the ${planName}.`, "success");
        setTimeout(() => {
          navigation.navigate("Functionality", { userId });
        }, 2000);
      }

    } catch (error) {
      console.error("Error during Stripe payment:", error);
      showSnackbar(`Payment failed: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, type) => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  return (
    <StripeProvider publishableKey="pk_test_51QlpiQ06xEZj1ZhfqizspHQdQ4lYeTAnsGP5R9NP7YRdcNvOCO5aKQQN62OJwnob2jUMGYkVFcCy0FD8H6IGA2k400KeFzefN4">{/* Replace with your actual Stripe publishable key */}
      <ScrollView contentContainerStyle={styles.container}>
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 1000 }}
        >
          <Text style={styles.title}>Confirm Your Subscription</Text>
          <View style={styles.planCard}>
            <Text style={styles.planName}>{planName}</Text>
            <Text style={styles.planPrice}>{planPrice} PKR ({planDuration})</Text>
            <Text style={styles.planDescription}>{numPosts === -1 ? 'Unlimited Posts' : `Up to ${numPosts} posts`}</Text>
          </View>
        </MotiView>

        {/* Card Details Form - These inputs are no longer needed for direct Stripe payment sheet */}
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 1000 }}
          style={styles.cardForm}
        >
          <Text style={styles.sectionTitle}>Stripe Payment</Text>
          <Text style={styles.infoText}>Your payment will be securely processed by Stripe.</Text>
        </MotiView>

        {/* Payment Button */}
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400, duration: 1000 }}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={!isPaymentSheetReady}>
              <Text style={styles.payButtonText}>Proceed to Payment</Text>
            </TouchableOpacity>
          )}
        </MotiView>

        {/* Snackbar for Alerts */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{
            backgroundColor: snackbarType === "success" ? "#4CAF50" : "#F44336",
          }}
        >
          <View style={styles.snackbarContent}>
            <Icon
              name={snackbarType === "success" ? "check-circle" : "error"}
              size={20}
              color="#fff"
            />
            <Text style={styles.snackbarText}>{snackbarMessage}</Text>
          </View>
        </Snackbar>
      </ScrollView>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  planName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  planPrice: {
    fontSize: 18,
    color: "#007bff",
    marginBottom: 10,
  },
  planDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  cardForm: {
    width: "100%",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: "#333",
  },
  row: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  payButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 15,
    width: "100%",
    alignItems: "center",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  snackbarContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  snackbarText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
});

export default PaymentScreen;
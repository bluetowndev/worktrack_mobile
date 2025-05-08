import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

const ClaimScreen = () => {
  const [claimType, setClaimType] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!claimType || !amount || !description) {
      Alert.alert("Error", "Please fill all fields before submitting.");
      return;
    }

    Alert.alert(
      "Success",
      `Claim for ${claimType} of amount $${amount} has been submitted.`
    );

    // Reset form fields
    setClaimType("");
    setAmount("");
    setDescription("");
  };

  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Claim Submission</Text>

      {/* Claim Type Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Distance Traveled</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter claim type (e.g., Travel, Medical)"
          value={claimType}
          onChangeText={setClaimType}
        />
      </View>

      {/* Claim Amount Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount Claimed</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* Claim Description Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.textInput, { height: 100 }]}
          placeholder="Provide a brief description of the claim"
          multiline
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Claim</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6C63FF",
    textAlign: "center",
    marginVertical: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 5,
    elevation: 3,
    padding: 10,
  },
  submitButton: {
    backgroundColor: "#6C63FF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default ClaimScreen;

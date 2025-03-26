import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "../../constants/firebaseConfig";

const Home = () => {
  const router = useRouter();
  const [team, setTeam] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");

  const handleGo = async () => {
    if (team && username.trim()) {
      try {
        // Clear previous user data
        await AsyncStorage.multiRemove([
          "selectedTeam",
          "username",
          "userId",
          "userTeam",
        ]);

        // Generate a unique user ID
        const usersRef = collection(db, "interactions", team, "user");
        const newUserDoc = doc(usersRef);
        const userId = newUserDoc.id;

        // Create user document in Firestore
        await setDoc(newUserDoc, {
          name: username,
          personalClick: "0",
          team: team,
          createdAt: new Date().toISOString(),
        });

        // Save all details to AsyncStorage
        await AsyncStorage.multiSet([
          ["selectedTeam", team],
          ["username", username],
          ["userId", userId],
          ["userTeam", team],
        ]);

        // Navigate to clicker screen with all necessary parameters
        router.push({
          pathname: "/(tabs)/clicker",
          params: {
            team: team,
            username: username,
            userId: userId,
          },
        });
      } catch (error) {
        console.error("Error creating user:", error);
        Alert.alert("Error", "Failed to create user. Please try again.");
      }
    } else {
      Alert.alert("Error", "Please select a team and enter a username.");
    }
  };

  return (
    <SafeAreaView style={styles.teamSelectionContainer}>
      <Text style={styles.title}>Choose your team!</Text>
      <View style={styles.teamButtonContainer}>
        <TouchableOpacity
          style={[
            styles.teamButton,
            styles.blueTeam,
            team === "blue" && styles.selectedBlueButton,
          ]}
          onPress={() => setTeam("blue")}
        >
          <Text style={styles.teamButtonText}>Blue Team</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.teamButton,
            styles.redTeam,
            team === "red" && styles.selectedRedButton,
          ]}
          onPress={() => setTeam("red")}
        >
          <Text style={styles.teamButtonText}>Red Team</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        placeholderTextColor="#ccc"
        value={username}
        onChangeText={setUsername}
      />
      <Text style={styles.note}>
        Note: If you create a new user, you will not be able to access your old
        user data. So be careful! 😉
      </Text>
      <TouchableOpacity style={styles.goButton} onPress={handleGo}>
        <Text style={styles.goButtonText}>Go!</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  teamSelectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    color: "white",
  },
  teamButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  teamButton: {
    padding: 20,
    margin: 10,
    borderRadius: 10,
    borderWidth: 3,
  },
  blueTeam: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  redTeam: {
    backgroundColor: "#e74c3c",
    borderColor: "#e74c3c",
  },
  selectedBlueButton: {
    borderColor: "#1c598a",
  },
  selectedRedButton: {
    borderColor: "#a8322a",
  },
  teamButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginTop: 20,
    width: "80%",
    color: "white",
    backgroundColor: "#1a1a1a",
  },
  goButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#2ecc71",
  },
  goButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  note: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 20,
    width: "80%",
    textAlign: "center",
  },
});

export default Home;

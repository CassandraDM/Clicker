import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "../../constants/firebaseConfig";
import { BlurView } from "expo-blur";

const Home = () => {
  const router = useRouter();
  const [team, setTeam] = React.useState<string | null>(null);
  const [username, setUsername] = React.useState<string>("");

  // Animated values for circle movement
  const blueCircleX = useRef(new Animated.Value(0)).current;
  const blueCircleY = useRef(new Animated.Value(0)).current;
  const redCircleX = useRef(new Animated.Value(0)).current;
  const redCircleY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate blue circle
    const blueCircleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(blueCircleX, {
          toValue: 50,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(blueCircleY, {
          toValue: 50,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(blueCircleX, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(blueCircleY, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Animate red circle
    const redCircleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(redCircleX, {
          toValue: -50,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(redCircleY, {
          toValue: -50,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(redCircleX, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(redCircleY, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    blueCircleAnimation.start();
    redCircleAnimation.start();

    return () => {
      blueCircleAnimation.stop();
      redCircleAnimation.stop();
    };
  }, []);

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
      {/* Animated Background Circles */}
      <Animated.View
        style={[
          styles.backgroundCircle,
          styles.blueCircle,
          {
            transform: [
              { translateX: blueCircleX },
              { translateY: blueCircleY },
            ],
          },
        ]}
      >
        <BlurView intensity={50} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <Animated.View
        style={[
          styles.backgroundCircle,
          styles.redCircle,
          {
            transform: [{ translateX: redCircleX }, { translateY: redCircleY }],
          },
        ]}
      >
        <BlurView intensity={50} style={StyleSheet.absoluteFill} />
      </Animated.View>

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
        Note: If create a next user, you will no longer have access to your
        previous user data. So be careful! 😉
      </Text>
      <TouchableOpacity style={styles.goButton} onPress={handleGo}>
        <Text style={styles.goButtonText}>Go!</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  teamSelectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
    position: "relative",
    overflow: "hidden",
  },
  backgroundCircle: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 200,
    opacity: 0.3,
    overflow: "hidden",
  },
  blueCircle: {
    backgroundColor: "rgba(52, 152, 219, 1)",
    top: -100,
    left: -100,
  },
  redCircle: {
    backgroundColor: "rgba(231, 76, 60, 1)",
    bottom: -80,
    right: -100,
  },
  container: {
    flex: 1,
    backgroundColor: "#000000",
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

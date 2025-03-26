import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../constants/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

export default function Clicker() {
  const { team, username, userId } = useLocalSearchParams();
  const [blueClicks, setBlueClicks] = useState(0);
  const [redClicks, setRedClicks] = useState(0);
  const [personalClicks, setPersonalClicks] = useState(0);
  const [storedUsername, setStoredUsername] = useState("");
  const [storedUserId, setStoredUserId] = useState("");
  const [storedTeam, setStoredTeam] = useState<"blue" | "red">("blue");

  // Animated values for circle movement
  const circle1X = useRef(new Animated.Value(0)).current;
  const circle1Y = useRef(new Animated.Value(0)).current;
  const circle2X = useRef(new Animated.Value(0)).current;
  const circle2Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate first circle
    const circle1Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(circle1X, {
          toValue: 50,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(circle1Y, {
          toValue: 50,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(circle1X, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(circle1Y, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Animate second circle
    const circle2Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(circle2X, {
          toValue: -50,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(circle2Y, {
          toValue: -50,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(circle2X, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(circle2Y, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    circle1Animation.start();
    circle2Animation.start();

    return () => {
      circle1Animation.stop();
      circle2Animation.stop();
    };
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Prioritize passed parameters, then stored values
        const savedTeam = (team ||
          (await AsyncStorage.getItem("userTeam"))) as string;
        const savedUsername = (username ||
          (await AsyncStorage.getItem("username"))) as string;
        const savedUserId = (userId ||
          (await AsyncStorage.getItem("userId"))) as string;

        console.log("Fetched Data:", {
          savedTeam,
          savedUsername,
          savedUserId,
        });

        if (savedTeam === "blue" || savedTeam === "red") {
          setStoredTeam(savedTeam as "blue" | "red");
        } else {
          console.error("Invalid team value:", savedTeam);
        }
        setStoredUsername(savedUsername);
        setStoredUserId(savedUserId);

        // Fetch team clicks
        const blueDocRef = doc(db, "interactions", "blue");
        const redDocRef = doc(db, "interactions", "red");

        const blueDocSnap = await getDoc(blueDocRef);
        const redDocSnap = await getDoc(redDocRef);

        if (blueDocSnap.exists()) {
          setBlueClicks(parseInt(blueDocSnap.data().click || "0", 10));
        }

        if (redDocSnap.exists()) {
          setRedClicks(parseInt(redDocSnap.data().click || "0", 10));
        }

        // Fetch user-specific data
        const userDocRef = doc(
          db,
          "interactions",
          savedTeam,
          "user",
          savedUserId
        );
        const userDocSnap = await getDoc(userDocRef);

        console.log("User Document:", {
          exists: userDocSnap.exists(),
          data: userDocSnap.data(),
        });

        // Always set personal clicks, even if the document doesn't exist
        const userData = userDocSnap.data();
        const personalClickValue = userData
          ? parseInt(userData.personalClick || "0", 10)
          : 0;

        setStoredUsername(userData?.name || savedUsername);
        setPersonalClicks(personalClickValue);

        // If the document doesn't exist, create it
        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            name: savedUsername,
            personalClick: "0",
            team: savedTeam,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchInitialData();
  }, [team, username, userId]);

  const handleClick = async () => {
    try {
      // Update team clicks
      const teamDocRef = doc(db, "interactions", storedTeam);
      const teamDocSnap = await getDoc(teamDocRef);

      if (teamDocSnap.exists()) {
        const currentTeamClicks = parseInt(teamDocSnap.data().click || "0", 10);
        await updateDoc(teamDocRef, {
          click: (currentTeamClicks + 1).toString(),
        });

        if (storedTeam === "blue") {
          setBlueClicks(currentTeamClicks + 1);
        } else if (storedTeam === "red") {
          setRedClicks(currentTeamClicks + 1);
        }
      } else {
        await setDoc(teamDocRef, {
          click: "1",
          team: storedTeam,
        });

        if (storedTeam === "blue") {
          setBlueClicks(1);
        } else if (storedTeam === "red") {
          setRedClicks(1);
        }
      }

      // Update personal clicks
      const userDocRef = doc(
        db,
        "interactions",
        storedTeam,
        "user",
        storedUserId
      );
      const userDocSnap = await getDoc(userDocRef);

      // Ensure the user document exists before updating
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          name: storedUsername,
          personalClick: "1",
          team: storedTeam,
          createdAt: new Date().toISOString(),
        });
        setPersonalClicks(1);
      } else {
        const currentPersonalClicks = parseInt(
          userDocSnap.data().personalClick || "0",
          10
        );
        await updateDoc(userDocRef, {
          personalClick: (currentPersonalClicks + 1).toString(),
        });
        setPersonalClicks(currentPersonalClicks + 1);
      }
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  // Determine team colors
  const teamColors = {
    blue: {
      primary: "rgba(52, 152, 219, 0.3)",
      secondary: "rgba(41, 128, 185, 0.3)",
    },
    red: {
      primary: "rgba(231, 76, 60, 0.3)",
      secondary: "rgba(192, 57, 43, 0.3)",
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Background Circles */}
      <Animated.View
        style={[
          {
            transform: [{ translateX: circle1X }, { translateY: circle1Y }],
          },
        ]}
      >
        <View
          style={[
            styles.backgroundCircle,
            {
              backgroundColor:
                teamColors[storedTeam]?.primary || teamColors.blue.primary,
            },
          ]}
        >
          <BlurView
            intensity={50}
            style={StyleSheet.absoluteFill}
            tint="dark"
          />
        </View>
      </Animated.View>
      <Animated.View
        style={[
          {
            transform: [{ translateX: circle2X }, { translateY: circle2Y }],
          },
        ]}
      >
        <View
          style={[
            styles.backgroundCircle,
            {
              backgroundColor: teamColors[storedTeam]?.secondary,
            },
          ]}
        >
          <BlurView
            intensity={50}
            style={StyleSheet.absoluteFill}
            tint="dark"
          />
        </View>
      </Animated.View>

      {/* User Info */}
      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoText}>Welcome, {storedUsername}!</Text>
        <Text style={styles.userInfoText}>Your Clicks: {personalClicks}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressBarBlue,
            {
              width: `${(blueClicks / (blueClicks + redClicks || 1)) * 100}%`,
            },
          ]}
        />
        <View
          style={[
            styles.progressBarRed,
            {
              width: `${(redClicks / (blueClicks + redClicks || 1)) * 100}%`,
            },
          ]}
        />
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <Text style={styles.blueStatsText}>
          {blueClicks} (
          {((blueClicks / (blueClicks + redClicks || 1)) * 100).toFixed(1)}%)
        </Text>
        <Text style={styles.redStatsText}>
          {redClicks} (
          {((redClicks / (blueClicks + redClicks || 1)) * 100).toFixed(1)}%)
        </Text>
      </View>

      {/* Click Button */}
      <TouchableOpacity
        style={[
          styles.clickButton,
          storedTeam === "blue" ? styles.blueTeam : styles.redTeam,
        ]}
        onPress={handleClick}
      >
        <Text style={styles.clickButtonText}>Click!</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },

  backgroundCircle: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 200,
    opacity: 1,
    overflow: "hidden",
  },

  userInfoContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  userInfoText: {
    color: "#ecf0f1",
    fontSize: 16,
    fontWeight: "600",
  },
  progressBar: {
    height: 30,
    flexDirection: "row",
    width: "80%",
    borderRadius: 15,
    marginVertical: 30,
    backgroundColor: "#1a1a1a",
  },
  progressBarBlue: {
    backgroundColor: "#3498db",
    height: 30,
    shadowColor: "#3498db",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    elevation: 10,
  },
  progressBarRed: {
    backgroundColor: "#e74c3c",
    height: 30,
    shadowColor: "#e74c3c",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 10,
  },
  blueTeam: {
    backgroundColor: "#2980b9",
  },
  redTeam: {
    backgroundColor: "#c0392b",
  },
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  blueStatsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2980b9",
  },
  redStatsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#c0392b",
  },
  clickButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignSelf: "center",
    marginTop: 20,
  },
  clickButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../constants/firebaseConfig";

export default function Clicker() {
  const { team } = useLocalSearchParams();
  const [blueClicks, setBlueClicks] = useState(0);
  const [redClicks, setRedClicks] = useState(0);

  useEffect(() => {
    const fetchClicks = async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching click data:", error);
      }
    };

    fetchClicks();
  }, []);

  const handleClick = async () => {
    try {
      const docRef = doc(db, "interactions", team as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentClicks = parseInt(docSnap.data().click || "0", 10);
        await updateDoc(docRef, {
          click: (currentClicks + 1).toString(),
        });

        if (team === "blue") {
          setBlueClicks(currentClicks + 1);
        } else if (team === "red") {
          setRedClicks(currentClicks + 1);
        }
      } else {
        await setDoc(docRef, {
          click: "1",
          team: team,
        });

        // Update the local state
        if (team === "blue") {
          setBlueClicks(1);
        } else if (team === "red") {
          setRedClicks(1);
        }
      }
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.statsText}>{blueClicks}</Text>
        <Text style={styles.statsText}>{redClicks}</Text>
      </View>

      {/* Click Button */}
      <TouchableOpacity
        style={[
          styles.clickButton,
          team === "blue" ? styles.blueTeam : styles.redTeam,
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
    backgroundColor: "#3498db", // Single, consolidated backgroundColor
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
    backgroundColor: "#e74c3c", // Single, consolidated backgroundColor
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
  statsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ecf0f1",
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

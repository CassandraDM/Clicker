import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const Home = () => {
  const router = useRouter();
  const [team, setTeam] = useState<string | null>(null);

  const selectTeam = async (selectedTeam: string) => {
    setTeam(selectedTeam);
    await AsyncStorage.setItem("selectedTeam", selectedTeam);
    router.push({
      pathname: "/(tabs)/clicker",
      params: { team: selectedTeam }, // Pass the selected team as a parameter
    });
  };

  return (
    <SafeAreaView style={styles.teamSelectionContainer}>
      <Text style={styles.title}>Choose your team!</Text>
      <View style={styles.teamButtonContainer}>
        <TouchableOpacity
          style={[styles.teamButton, styles.blueTeam]}
          onPress={() => selectTeam("blue")}
        >
          <Text style={styles.teamButtonText}>Blue Team</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.teamButton, styles.redTeam]}
          onPress={() => selectTeam("red")}
        >
          <Text style={styles.teamButtonText}>Red Team</Text>
        </TouchableOpacity>
      </View>
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
  },
  blueTeam: {
    backgroundColor: "#3498db",
  },
  redTeam: {
    backgroundColor: "#e74c3c",
  },
  teamButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  progressBar: {
    height: 20,
    flexDirection: "row",
    width: "100%",
  },
  progressBarBlue: {
    backgroundColor: "#3498db",
    height: "100%",
  },
  progressBarRed: {
    backgroundColor: "#e74c3c",
    height: "100%",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  statsText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  clickButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  clickButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Home;

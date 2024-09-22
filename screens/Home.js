import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import colors from "../colors";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { auth, database } from "../config/firebase";
import SearchBar from "./SearchBar";
import List from "./List";
import {
  ref,
  query,
  orderByChild,
  startAt,
  endAt,
  onValue,
} from "firebase/database";

const Home = () => {
  const navigation = useNavigation();
  const [searchPhrase, setSearchPhrase] = useState("");
  const [clicked, setClicked] = useState(false);
  const [personalizedPlan, setPersonalizedPlan] = useState('{}');
  const [results, setResults] = useState([]);
  const [recommendations, setRecommendations] = useState(undefined);
  const [adjustments, setAdjustments] = useState(undefined);

  const onSignOut = () => {
    signOut(auth).catch((error) => console.log("Error logging out: ", error));
  };
  // Helper function to extract specific fields from data
  const extractFields = (snapshot) => {
    tempResults = []
    if (snapshot.exists()) {
      Object.values(snapshot.val()).forEach((item) => {
        // Extract only the fields you want (e.g., field1, field2, field3)
        tempResults.push({
          id: item.idx,
          title: item.disease,
        });
      });
    }
    return tempResults;
  };
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <FontAwesome
          name="user-md"
          size={24}
          color={colors.gray}
          style={{ marginLeft: 15 }}
        />
      ),
      headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 10,
          }}
          onPress={onSignOut}
        >
          <AntDesign
            name="logout"
            size={24}
            color={colors.gray}
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      ),
    });

    if (searchPhrase !== "") {
      let searchResults = []  
      const queryField1 = query(
        ref(database, "/search"),
        orderByChild("disease"),
        startAt(searchPhrase),
        endAt(searchPhrase + "\uf8ff")
      );

      onValue(queryField1, (snapshot) => {
        if (snapshot.exists()) {
            searchResults = extractFields(snapshot);
        }
       });
      setResults(searchResults);
    }
  }, [navigation, searchPhrase]);
  useEffect(() => {
    const plan = JSON.parse(JSON.stringify(personalizedPlan));
    setRecommendations(plan?.recommendations);
    setAdjustments(plan?.adjustments);
  },[personalizedPlan])
  return (
    <View style={styles.container}>
      <SearchBar
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
        clicked={clicked}
        setClicked={setClicked}
      />
      {(results.length) ? <List
        searchPhrase={searchPhrase}
        data={results}
        setPersonalizedPlan={setPersonalizedPlan}
        setResults={setResults}
      /> : <></>}
      <ScrollView style={styles.scroll_container}> 
      <Text style={styles.heading}>Personalized Physiotherapy Plan</Text>

      {(recommendations!==undefined) ? recommendations.map((item, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.subheading}>
            {item['exercise'] ? `Exercise: ${item['exercise']}` : `Medication: ${item['medication']}`}
          </Text>
          <Text>Frequency: {item['frequency']}</Text>
          <Text>Duration: {item['duration']}</Text>
          <Text>Progression: {item['progression']}</Text>
        </View>
      )) : <></>}

      {(adjustments !== undefined) ? <View style={styles.section}>
        <Text style={styles.subheading}>Adjustments</Text>
        <Text>If pain increases: {adjustments['ifPainIncreases']}</Text>
        <Text>If no progress after X weeks: {adjustments['ifNoProgressAfterXWeeks']}</Text>
      </View> : <></>}
      </ScrollView>
      <View style={styles.chat_container}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Chat")}
          style={styles.chatButton}
        >
          <Entypo name="chat" size={24} color={colors.lightGray} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 15,
    justifyContent: "flex-start",
    backgroundColor: "#fff",
  },
  chat_container: {
    flex: 1,
    margin: 15,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  chatButton: {
    backgroundColor: colors.primary,
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    marginRight: 20,
    marginBottom: 50,
  },
  scroll_container: {
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    fontStyle: "italic",
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontStyle: "italic",
  },
  section: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  }
});

import React from "react";
import { StyleSheet, Text, View, FlatList, SafeAreaView , TouchableOpacity} from "react-native";
import { database } from "../config/firebase";
import {
  ref,
  query,
  orderByChild,
  equalTo,
  onValue,
} from "firebase/database";
import { getPersonalizedPhysioTreatmentPlan } from "../config/ibm";


const List = ({ searchPhrase, setPersonalizedPlan, setResults, data }) => {
  const basePrompt = "Input:{'idx': 269,disease': 'Osteoarthritis','Symptom': \['Knee pain', 'Hip pain', 'Shoulder pain', 'Back pain', 'Leg pain', 'Hand or finger pain', 'Joint pain', 'Knee swelling', 'Ankle pain', 'Elbow pain', 'Muscle pain', 'Knee weakness'],'reason': 'Osteoarthritis (OA) also known as degenerative arthritis or degenerative joint disease or osteoarthrosis, is a group of mechanical abnormalities involving degradation of joints, including articular cartilage and subchondral bone. Symptoms may include joint pain, tenderness, stiffness, locking, and sometimes an effusion. A variety of causes\\xe2\\x80\\x94hereditary, developmental, metabolic, and mechanical deficits\\xe2\\x80\\x94may initiate processes leading to loss of cartilage. When bone surfaces become less well protected by cartilage, bone may be exposed and damaged. As a result of decreased movement secondary to pain, regional muscles may atrophy, and ligaments may become more lax.','TestsAndProcedures': \['Radiographic imaging procedure', 'Plain x-ray (X ray)', 'Physical therapy exercises (Exercises)', 'Lipid panel', 'Magnetic resonance imaging (Mri)', 'Hemoglobin A1c measurement (Hemoglobin a1c test)', 'Other non-OR therapeutic procedures on musculoskeletal system'],'commonMedications': \['Celecoxib (Celebrex)', 'Triamcinolone Topical Product', 'Meloxicam', 'Bupivacaine', 'Sodium Hyaluronate', 'Cortisone', 'Chondroitin-Glucosamine', 'Piroxicam', 'Chondroitin', 'Mepivacaine (Carbocaine)', 'Insulin Isophane-Insulin Regular']}\nOutput:{'recommendations':\[{'exercise':'Quadriceps Strengthening','frequency':'3 times a week','duration':'15 minutes per session','progression':'Increase resistance over 4 weeks'},{'exercise':'Hamstring Stretch','frequency':'Daily','duration':'30 seconds per stretch','progression':'Increase stretch duration to 60 seconds over 2 weeks'},{'medication':'Ibuprofen','frequency':'Daily','duration':'1 dose before breakfast and 1 dose before dinner','progression':'Continue for 2 weeks'}],'adjustments':{'ifPainIncreases':'Reduce intensity of exercises and switch to low-impact activities like swimming','ifNoProgressAfterXWeeks':'Re-evaluate condition, consider advanced physical therapy techniques'}}\nInput:";   
  const personalizedPlan = async (item) => {
    setResults([]);
    const searchQuery = query(ref(database, '/search'),orderByChild('idx'),equalTo(item?.id));
    await onValue(searchQuery, async (snapshot) => {
      const data = snapshot.val();
      const patientInfo = JSON.stringify(data[item?.id]);
      const prompt = basePrompt.concat(patientInfo+"\nOutput:");
      let personalizedPlan = await getPersonalizedPhysioTreatmentPlan(prompt)
      if(personalizedPlan!=='')
        {
            const startIndex = personalizedPlan.indexOf('{');
            if (startIndex !== -1) {
              personalizedPlan = personalizedPlan.substring(startIndex);
            }
            const endIndex = personalizedPlan.lastIndexOf('}');
            if (endIndex !== -1) {
              personalizedPlan = personalizedPlan.substring(0, endIndex+1);
            }
            personalizedPlan = personalizedPlan.replace(/'/g, '"');
            setPersonalizedPlan(JSON.parse(personalizedPlan));  
        }    
    });
  }
 
  const renderItem = ({ item }) => {
    if (searchPhrase === "") {
      return (
        <View style={styles.item}>
          <Text style={styles.title}>No matching phrase</Text>
        </View>
      );
    }
    else {
      return (
        <View style={styles.item}>
          <TouchableOpacity onPress={() => personalizedPlan(item)}><Text style={styles.title} >{item?.title}</Text></TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
     
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
    
    </SafeAreaView>
  );
};

export default List;

const styles = StyleSheet.create({
  container: {
    margin: 10,
    height: "85%",
    width: "100%",
  },
  item: {
    margin: 30,
    borderBottomWidth: 2,
    borderBottomColor: "lightgrey",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    fontStyle: "italic",
  },
});
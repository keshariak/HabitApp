import { DATABASE_ID, databases, HABBIT_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/authContext";
import { Habit } from "@/types/databases.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Button, Surface, Text } from "react-native-paper";


export default function Index() {
  const { user, signOut } = useAuth();
  const [habits, setHabits] = useState<Habit[]>();

  useEffect(() => {
    fetchHabits();





//2:32 tak dekh liya hai a bav





  }, [user, habits]);
  const fetchHabits = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        HABBIT_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      console.log(response.documents);
      setHabits(response.documents as Habit[]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView>
       <View style={style.container}>
      <View style={style.header}>
        <Text style={style.title} variant="headlineSmall">Today's Habits</Text>
        <Button mode="text" onPress={signOut} icon={"logout"}>
          SignOut
        </Button>
      </View>
      {habits?.length === 0 ? (
        <View style={style.emptySate}>
          
          <Text style={style.emptySateText}>No Habits yet. Add your habits.</Text>
        </View>
      ) : (
        habits?.map((habit, key) => (
          <Surface style={style.card} elevation={0}>
          <View key={key} style={style.cardContent}>
            <Text  style={style.cardTitle}>{habit.title}</Text>
            <Text  style={style.cardDescription}>{habit.description}</Text>
            <View  style={style.cardFooter}>
              <View style={style.cardBadge}>
                
                <MaterialCommunityIcons
                  name="fire"
                  size={18} 
                  color={"#ff9800"}
                />
                <Text  style={style.streakText}>
                  {habit.streak_count} day streak
                </Text>
              </View>
              <View style={style.frequencyBadge} >
                <Text style={style.frequencyText}>
                  {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                </Text>
              </View>
            </View>
          </View>
          </Surface>
        ))
      )}
    </View>

    </ScrollView>
   
  );
}

const style = StyleSheet.create({
 
  container:{
    flex:1,
    padding:16,
    backgroundColor:"#f5f5f5"

  },
  header:{
    flexDirection:"row",
    justifyContent:'space-around',
    alignItems:"center",
    marginBottom:24,

  },
  title:{
    fontWeight:"bold"
    
  },
  card:{
    marginBottom:18,
    borderRadius:18,
    backgroundColor:"#fefefe",
    shadowColor:"#000",
    shadowOffset:{width:0, height:2},
    shadowOpacity:0.08,
    shadowRadius:8,
    elevation:4

  },
  emptySate:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"

  },
  emptySateText:{
    color:"#666666"

  },
  cardContent:{
    padding:12,

  },
  cardTitle:{
    fontSize:16,
    fontWeight:"bold",
    marginBottom:4,
    color:"#22223b"

  },
  cardDescription:{
    fontSize:10,
    marginBottom:2,
    color:"#6c6c80"


  },
  cardFooter:{
    flexDirection:"row",
    justifyContent:'space-between',
    alignItems:'center',
    marginTop:10


  },
  cardBadge:{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#fff3e0",
    borderRadius:12,
    paddingHorizontal:10,
    paddingVertical:3,

  },
  streakText:{
    marginLeft:5,
    color:"#ff9800",
    fontWeight:"700",
    fontSize:11,

  },
  frequencyBadge:{
   
    backgroundColor:"#ede7f6",
    borderRadius:12,
    paddingHorizontal:12,
    paddingVertical:3,

  },
  frequencyText:{
    
    color:"#7c4dff",
    fontWeight:"700",
    fontSize:12

  }
});

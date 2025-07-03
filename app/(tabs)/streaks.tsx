import { useEffect, useState } from "react";
import { View , StyleSheet} from "react-native";
import { Habit, HabitCompletion } from "@/types/databases.type";
import { useAuth } from "@/lib/authContext";


import {
    client,
  COMPLETIONS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  HABBIT_COLLECTION_ID,
  RealtimeResponse
} from "@/lib/appwrite";
import { Query } from "react-native-appwrite";
import { Card,Text } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import { hide } from "expo-router/build/utils/splash";
export default function StreakPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {

        const habitchannel = `databases.${DATABASE_ID}.collections.${HABBIT_COLLECTION_ID}.documents`;
              const habitSubscription = client.subscribe(
                habitchannel,
        
                (response: RealtimeResponse) => {
                  if (
                    response.events.includes(
                      "databases.*.collections.*.documents.*.create"
                    )
                  ) {
                    fetchHabits();
                  } else if (
                    response.events.includes(
                      "databases.*.collections.*.documents.*.update"
                    )
                  ) {
                    fetchHabits();
                  } else if (
                    response.events.includes(
                      "databases.*.collections.*.documents.*.delete"
                    )
                  ) {
                    fetchHabits();
                  }
                }
              );
              const completionsChannel = `databases.${DATABASE_ID}.collections.${COMPLETIONS_COLLECTION_ID}.documents`;
              const completionsSubscription = client.subscribe(
                completionsChannel,
        
                (response: RealtimeResponse) => {
                  if (
                    response.events.includes(
                      "databases.*.collections.*.documents.*.create"
                    )
                  ) { 
                    fetchCompletions();
                  }
                }
              );
      fetchHabits();
      fetchCompletions();
      return()=>{
        habitSubscription();
        completionsSubscription();
      }
    }
  }, [user]);

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

  const fetchCompletions = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      const completions = response.documents as HabitCompletion[];
      setCompletedHabits(completions);
    } catch (error) {
      console.error(error);
    }
  };

  interface StreakData {
    streak: number;
    bestStreaK: number;
    total: number;
  }
  const getStreakdata = (habitId: string) => {
    const habitCompletions = completedHabits
      ?.filter((c) => c.habit_id === habitId)
      .sort(
        (a,b)=>
            new Date(a.completed_at).getTime()-new Date(b.completed_at).getTime()
        
      );
      if(habitCompletions?.length===0){
        return{streak:0,bestStreaK:0, total:0};
      }
      //build streak data
    let streak=0;
    let bestStreaK=0;
    let total =habitCompletions?.length;

    let lastdate: Date| null = null;
    let currentStreak =0;

    habitCompletions?.forEach((c)=>{
        const date = new Date(  c.completed_at)
        if(lastdate){
            const diff =(date.getTime()- lastdate.getTime())/(1000*60*60*24)
            if(diff<= 1.5){
                currentStreak+=1
            }else currentStreak=1
        }else{currentStreak=1}
            if(currentStreak> bestStreaK) bestStreaK=currentStreak;
            streak =currentStreak;
            lastdate=date;
        
    })
      return{streak,bestStreaK, total};
  };

  const habitStreaks =habits.map((habit)=>{
    const {streak, bestStreaK, total}=getStreakdata(habit.$id);
    return{habit, bestStreaK, streak,total}
  })

  const rankhabits =habitStreaks.sort((a,b)=> b.bestStreaK - a.bestStreaK)
//   console.log(rankhabits.map((h)=> h.habit.title))

const badgeStyles =[style.badge1, style.badge2,style.badge3]
  return (
    <View style={style.container}>
      <Text style={style.title} variant="headlineSmall">Habit Straks </Text>
    {rankhabits.length>0 && (
        <View style={style.rankingContainer}>
            <Text style={style.rankingTitle}> 🏅 Top Streaks</Text>
            {rankhabits.slice(0,3).map((item,key)=>(
                <View key={key} style={style.rankingRow}>
                    <View style={[style.rankingBadge,badgeStyles[key]]}>
                        <Text style={style.rankingBagdeText}>{key+1}</Text>
                    </View>
                    <Text style={style.rankingHabit}>{item.habit.title }</Text>
                    <Text style={style.rankingStreak}>{item.bestStreaK }</Text>
                </View>
            ))}
        </View>
    )}
       <ScrollView showsVerticalScrollIndicator={false}>
      {habits.length===0?(
          <View >
            <Text>
              No Habits yet. Add your habits.
            </Text>
          </View>
        ):( 
           
           rankhabits.map(({habit, streak, bestStreaK, total}, key)=>(
            <Card key={key} style={[style.card,key===0 && style.firstCard ]}>
                <Card.Content  >
                    <Text variant="titleMedium" style={style.habitTitle}>{habit.title}</Text>
                    <Text style={style.habitDiscription}>{habit.description}</Text>
                    <View style={style.statsRow} >
                        <View style={style.statBadge} >
                            <Text  style={style.statBadgeText} >🔥 {streak}</Text>
                            <Text style={style.statBadgeLabel}>Current</Text>
                        </View>
                        <View  style={style.statBadgeGold} >
                            <Text style={style.statBadgeText}>🏆 {bestStreaK}</Text>
                            <Text style={style.statBadgeLabel} >Current</Text>
                        </View>
                        <View  style={style.statBadgeGreen} >
                            <Text style={style.statBadgeText}>✅ {total}</Text>
                            <Text style={style.statBadgeLabel}>Current</Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>
           ))
           
        )}
        </ScrollView>
    </View>
  );
}


const style = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:"#f5f5f5",
        padding:16,

    },
    title:{
        fontWeight:"bold",
        marginBottom:16,
        

    },
    card:{
        marginBottom:18,
        borderRadius:18,
        backgroundColor:"#fff",
        elevation:3,
        shadowColor:"#000",
        shadowOffset:{width:0, height:2},
        shadowOpacity:0.08,
        shadowRadius:8,
        borderWidth:1,
        borderColor:"#f0f0f0"
        
            
        },
    firstCard:{
        borderWidth:2,
        borderColor:"lightblue"

    },
    habitTitle:{
        fontWeight:"bold",
        fontSize:18,
        marginBottom:2,


            
    },
    habitDiscription:{
        color:"#6c6c80",
        marginBottom:8
,


    },
    statsRow:{
        flexDirection:"row",
        justifyContent:"space-between",
        marginBottom:1,
        marginTop:8,

    },
    statBadge:{
        backgroundColor:"#fff3e0",
        borderRadius:10,
        paddingHorizontal:12,
        paddingVertical:6,
        alignItems:'center',
        minWidth:60,


    },
    
    statBadgeGold:{
        backgroundColor:"#fffde7",
        borderRadius:10,
        paddingHorizontal:12,
        paddingVertical:6,
        alignItems:'center',
        minWidth:60,

    },
    statBadgeGreen:{
        backgroundColor:"#e8f5e9",
        borderRadius:10,
        paddingHorizontal:12,
        paddingVertical:6,
        alignItems:'center',
        minWidth:60,

    },
    statBadgeText:{
        fontWeight:"bold",
        fontSize:15,
        color:"#22223b"

    },
    statBadgeLabel:{
       
        fontSize:11,
        color:"#888",
        marginTop:2,
        fontWeight:"500"


    },
    rankingContainer:{
        marginBottom:24,
        backgroundColor:"#fff",
        borderRadius:16,
        padding:16,
        elevation:2,
        shadowColor:"#000",
        shadowOffset:{width:0,height:2},
        shadowOpacity:0.08,
        shadowRadius:8,
        borderWidth:1,
        borderColor:"#f0f0f0",
        },
        rankingTitle:{
            fontWeight:"bold",
            fontSize:18,
            marginBottom:12,
            color:"#7c4dff",
            letterSpacing:0.5,


        },
        rankingRow:{
            flexDirection:"row",
            alignItems:"center",
            marginBottom:8,
            borderBottomWidth:1,
            borderBlockColor:"#f0f0f0",
            paddingBottom:8
        },
        rankingBadge:{
             width:28,
             height:28,
             alignItems:"center",
             justifyContent:"center",
             marginRight:10,
             backgroundColor:"#e0e0e0",
             borderRadius:14,

        },
        badge1:{backgroundColor:"#ffd700", borderRadius:14},
        badge2:{backgroundColor:"#c0c0c0", borderRadius:14},
        badge3:{backgroundColor:"#cd7f32", borderRadius:14},
        rankingBagdeText:{
            fontWeight:"bold",
            color:"#fff",
            fontSize:15,


        },
        rankingHabit:{
            flex:1,
            fontSize:15,
            color:"#333",
            fontWeight:"600"
        },
        rankingStreak:{
            fontWeight:"bold",
            fontSize:14,
            color:"#7c4dff"

        }


})
import {
  client,
  COMPLETIONS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  HABBIT_COLLECTION_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/authContext";
import { Habit } from "@/types/databases.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text } from "react-native-paper";

export default function Index() {
  const { user, signOut } = useAuth();
  const [habits, setHabits] = useState<Habit[]>();
  const [completedHabits, setCompletedHabits] = useState<Habit[]>();
  const swipableRef = useRef<{ [key: string]: Swipeable | null }>({});

  useEffect(() => {
    if (user) {
      const channel = `databases.${DATABASE_ID}.collections.${HABBIT_COLLECTION_ID}.documents`;
      const habitSubscription = client.subscribe(
        channel,

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
      fetchHabits();
      return () => {
        habitSubscription();
      };
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
  // const fetchTodayCompletions = async () => {
  //   try {
  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0);

  //     const response = await databases.listDocuments(
  //       DATABASE_ID,
  //       HABBIT_COLLECTION_ID,
  //       [
  //         Query.equal("user_id", user?.$id ?? ""),
  //         Query.greaterThanEqual("completed_at", today.toISOString()),
  //       ]
  //     );
  //     console.log(response.documents);
  //     setHabits(response.documents as Habit[]);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const renderRightActions = () => (
    <View style={style.swipeactionRight}>
      <MaterialCommunityIcons
        name="check-circle-outline"
        size={32}
        color={"#fff"}
      />
    </View>
  );
  const renderLeftActions = () => (
    <View style={style.swipeactionLeft}>
      <MaterialCommunityIcons
        name="trash-can-outline"
        size={32}
        color={"#fff"}
      />
    </View>
  );
  const handleDeleteHabit = async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, HABBIT_COLLECTION_ID, id);
    } catch (error) {
      console.error(error);
    }
  };
  const handleCompleteHabit = async (id: string) => {
    if (!user) return;
    try {
      const currenytDate = new Date().toISOString();
      await databases.createDocument(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        ID.unique(),
        {
          habit_id: id,
          user_id: user?.$id,
          completed_at: currenytDate,
        }
      );

      const habit = habits?.find((h) => h.$id === id);
      if (!habit) return;
      await databases.updateDocument(DATABASE_ID, HABBIT_COLLECTION_ID, id, {
        streak_count: habit.streak_count + 1,
        last_completed: currenytDate,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={style.container}>
      <View style={style.header}>
        <Text style={style.title} variant="headlineSmall">
          Today's Habits
        </Text>
        <Button mode="text" onPress={signOut} icon={"logout"}>
          SignOut
        </Button>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {habits?.length === 0 ? (
          <View style={style.emptySate}>
            <Text style={style.emptySateText}>
              No Habits yet. Add your habits.
            </Text>
          </View>
        ) : (
          habits?.map((habit, key) => (
            <Swipeable
              ref={(ref: any) => {
                swipableRef.current[habit.$id] = ref;
              }}
              key={key}
              overshootLeft={false}
              overshootRight={false}
              renderRightActions={renderRightActions}
              renderLeftActions={renderLeftActions}
              onSwipeableOpen={(direction) => {
                if (direction === "left") {
                  handleDeleteHabit(habit.$id);
                } else if (direction === "right") {
                  handleCompleteHabit(habit.$id);
                }
                swipableRef.current[habit.$id]?.close();
              }}
            >
              <Surface style={style.card} elevation={0}>
                <View style={style.cardContent}>
                  <Text style={style.cardTitle}>{habit.title}</Text>
                  <Text style={style.cardDescription}>{habit.description}</Text>
                  <View style={style.cardFooter}>
                    <View style={style.cardBadge}>
                      <MaterialCommunityIcons
                        name="fire"
                        size={18}
                        color={"#ff9800"}
                      />
                      <Text style={style.streakText}>
                        {habit.streak_count} day streak
                      </Text>
                    </View>
                    <View style={style.frequencyBadge}>
                      <Text style={style.frequencyText}>
                        {habit.frequency.charAt(0).toUpperCase() +
                          habit.frequency.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Surface>
            </Swipeable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontWeight: "bold",
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#fefefe",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  emptySate: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptySateText: {
    color: "#666666",
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223b",
  },
  cardDescription: {
    fontSize: 10,
    marginBottom: 2,
    color: "#6c6c80",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  cardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  streakText: {
    marginLeft: 5,
    color: "#ff9800",
    fontWeight: "700",
    fontSize: 11,
  },
  frequencyBadge: {
    backgroundColor: "#ede7f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  frequencyText: {
    color: "#7c4dff",
    fontWeight: "700",
    fontSize: 12,
  },
  swipeactionRight: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    backgroundColor: "#4caf50",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  },
  swipeactionLeft: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    backgroundColor: "#e53935",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingLeft: 16,
  },
});

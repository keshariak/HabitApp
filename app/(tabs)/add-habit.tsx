import { DATABASE_ID, databases, HABBIT_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ID } from "react-native-appwrite";
import {
  Button,
  SegmentedButtons,
  TextInput,
  useTheme,
} from "react-native-paper";

const FREQUECIES = ["daily", "weekly", "monthly"];
type Frequency = (typeof FREQUECIES)[number];
export default function AddhabitPage() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [error, setError] = useState<string>("");

  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const handleSubmit = async () => {
  if (!user) return;

  try {
    await databases.createDocument(
      DATABASE_ID,
      HABBIT_COLLECTION_ID,
      ID.unique(),
      {
        user_id: user.$id,
        title,
        description,
        frequency,
        streak_count: 0,
        last_completed: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
    );

    //  Clear inputs
    setTitle("");
    setDescription("");
    setFrequency("daily");
    setError("");

    // Navigate back
    setTimeout(() => {
      router.back();
    }, 100);
    
  } catch (error) {
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError("Error Creating the Habit");
    }
  }
};

  return (
    <View style={styles.container}>
      <View>
        {/* <Text style={styles.headerTitle}>Add a New Habit</Text> */}
  {/* <Text style={styles.subtitle}>Track your personal growth by adding a habit to complete daily, weekly, or monthly.</Text> */}
  <Text style={styles.subtitle}>
  Create a habit like "Read for 15 mins", "Morning workout", or "Drink more water".
  Track how often you complete it and build your streak!
</Text>


      </View>
      <TextInput
        style={styles.input}
        label="Title"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
      />
      <TextInput
        style={styles.input}
        label="Description"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
      />
      <View>
        <SegmentedButtons
          value={frequency}
          onValueChange={(value) => setFrequency(value as Frequency)}
          buttons={FREQUECIES.map((freq) => ({
            value: freq,
            label: freq.charAt(0).toUpperCase() + freq.slice(1),
          }))}
          style={styles.SegmentedButtons}
        />
      </View>
      <Button
        style={styles.mainButton}
        mode="contained"
        onPress={handleSubmit}
        disabled={!title || !description}
      >
        Add Habit
      </Button>
      {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  input: {
    marginBottom: 16,
  },
  SegmentedButtons: {
    marginBottom: 16,
  },
  mainButton: {
    marginTop: 8,
  },
  subtitle:{
    padding:6,
    marginBottom:20,
    color:"purple",
    opacity:0.5
  }
});

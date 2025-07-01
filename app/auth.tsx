import { useAuth } from "@/lib/authContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput ,useTheme} from "react-native-paper";

export default function Authscreen() {
    const [isSignUp, setIsSignUp] = useState<boolean>(true)
    const [email, setEmail]= useState<string>("")
    const [password, setPassword]= useState<string>("")
    const [error, setError] = useState <string | null>("")
    const theme = useTheme()
    const router = useRouter()
    const {signIn ,signUp, isSigningUp,isSigningIn  } = useAuth()


    const handleSwitchMode =()=>{
        setIsSignUp((p)=>!p)
    }
    const handleAuth= async()=>{
        if(!email || !password){
            setError("Please fill deatils");
            return

        }
        setError(null)
        if(isSignUp){
          await signUp(email, password)
          if (error){
            setError(error)
            return
          }
        } else{
          await signIn(email, password)
          if (error){
            setError(error)
            return
          }
          router.replace('/')
        }

    }
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "padding" : "height"}
    >
      <View style={styles.content} >
        <Text style={styles.title} variant="headlineMedium">{isSignUp?"Create Account":"Welcome Back"}</Text>
        <TextInput style={styles.input}
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Write Email..."
          mode="outlined"
          onChangeText={setEmail}
        ></TextInput>

        <TextInput style={styles.input}
          label="Password"
          autoCapitalize="none"
          keyboardType="email-address"
          mode="outlined"
          secureTextEntry
          onChangeText={setPassword}
        ></TextInput>

        {error && <Text style={{color:theme.colors.error}}>{error}</Text>}
        {/* <Button style={styles.button} mode="contained"  onPress={handleAuth}>{isSignUp?"Sign Up" : "Sign In"}</Button> */}
        <Button
  style={styles.button}
  mode="contained"
  onPress={handleAuth}
  disabled={isSigningUp || isSigningIn}
>
  {isSigningUp
    ? "Signing Up..."
    : isSigningIn
    ? "Signing In..."
    : isSignUp
    ? "Sign Up"
    : "Sign In"}
</Button>
        <Button  style={styles.button} mode="text" onPress={handleSwitchMode}>{isSignUp?"Already have account? Sing in":"Dont have account? Sign Up"}</Button>
      </View>
    </KeyboardAvoidingView>
  );
}


const styles= StyleSheet.create({
    container:{
        flex:1,
        backgroundColor: "#f5f5f5"
    },
    content:{
        flex:1,
        padding: 16,
        justifyContent: "center",

    },
    title:{
       textAlign:'center',
       marginBottom: 24,
       
    },
    input:{
      
       marginBottom: 16
    },
    button:{
       textAlign:'center',
       marginTop: 8
    },


})
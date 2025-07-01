import { Link } from "expo-router";
import { View , Text, StyleSheet} from "react-native";

export default function Loginpage(){
    return(
        <View>
            <Text>login page</Text>
            <Link style={style.button} href={"/(tabs)/profile"}>Loginpage</Link>
        </View>
    )
}


const style= StyleSheet.create({
  view:{
    flex: 1,
        justifyContent: "center",
        alignItems: "center",

  },
  button:{
    backgroundColor: "coral",
    borderRadius: 5,
    padding:8,
    alignItems:"center",

  }

})
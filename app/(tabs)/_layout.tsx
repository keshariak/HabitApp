import {  Tabs } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
export default function RootLayout() {
  return (
    <Tabs screenOptions={{tabBarActiveTintColor:'Blue'}}>

      <Tabs.Screen  name="index" options={{title:"Home",tabBarIcon:({color})=>(
        <FontAwesome name="home" size={24} color={color} />
  )}} />

      <Tabs.Screen  name="profile" options={{title:"Profile", tabBarIcon:({color})=>(
        <FontAwesome6 name="user-large" size={20} color={color} />

      )}} />



    </Tabs>
  );
}

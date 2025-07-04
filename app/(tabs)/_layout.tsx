import {  Tabs } from "expo-router";
import {MaterialCommunityIcons} from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
export default function RootLayout() {
  return (
    <Tabs screenOptions={{
     headerStyle:{backgroundColor:"#f5f5f5"}, 
     headerShadowVisible:false,
     tabBarStyle:{
      backgroundColor:"#f5f5f5",
      borderTopWidth:0,
      elevation:0,
      shadowOpacity:0,

    },
    tabBarActiveTintColor:"#6200ee",
     
    }}>

      <Tabs.Screen  
       name="index"
       options={{
        title:"Today's Habits",
        tabBarIcon:({color, size, focused})=>(
          <MaterialCommunityIcons name="calendar-today"  size={size} color={color}/>
        
        )
       }} />
       <Tabs.Screen  
       name="streaks"
       options={{
        title:"Streaks",
        tabBarIcon:({color, size, focused})=>(
          <MaterialCommunityIcons name="chart-line"  size={size} color={color}/>
        
        )
       }} />
       <Tabs.Screen  
       name="add-habit"
       options={{
        title:"Add Habit",
        tabBarIcon:({color, size, focused})=>(
          <MaterialCommunityIcons name="plus-circle"  size={size} color={color}/>
        
        )
       }} />
       

    </Tabs>
  );
}

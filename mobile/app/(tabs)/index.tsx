import { View, TextInput, Button, Text, Alert } from "react-native";
import LoginScreen from "../components/login";
import ShowProfileUserComponent from "../components/showProfileUser";
import ShowClassComponent from "../components/showClass"
import { useState } from "react";

export default function HomeScreen() {
  const [user,setUser] = useState(null);


  
  return (
    <View>
      <LoginScreen userData={user} setUserData={setUser}/>

      {user && 
        <ShowProfileUserComponent user={user}/>
      }
      {user && 
        <ShowClassComponent user={user}/>
      }
    </View>


  );
}


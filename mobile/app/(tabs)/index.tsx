import LoginScreen from "../components/login";
import { useState } from "react";

export default function HomeScreen() {
  const [user,setUser] = useState(null);


  
  return (
    <LoginScreen userData={user} setUserData={setUser}/>
  );
}


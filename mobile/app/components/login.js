import React, { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import { login, logout, signUp } from "../authService";

const LoginScreen = ({userData,setUserData}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async () => {
    try {
      const user = await login(email, password);
      setUserData(user)
      console.log(user)
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
  };

  const handleSignUp = async () => {
    try {
      const user = await signUp(email, password, studentId, name);
      setUserData(user)
      console.log(user)
    } catch (error) {
      Alert.alert("Signup Failed", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout()
      setUserData(null)
      setIsSignUp(false)
    } catch(error){
      Alert.alert("logout failed", error.message);
    }
  }

  if(userData) return (
    <View style={{ padding: 20, marginTop: "10%" }}>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );

  return (
    <View style={{ padding: 20, marginTop: "10%" }}>
      <Text>{isSignUp ? "Register Student" : "Login Student"}</Text>
      <View>
        <Text>Email:</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="Enter email" textContentType="username" style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}/>
        <Text>Password:</Text>
        <TextInput value={password} onChangeText={setPassword} placeholder="Enter password" secureTextEntry textContentType="password" style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}/>
        {isSignUp && (
          <>
            <Text>Student ID:</Text>
            <TextInput value={studentId} onChangeText={setStudentId} placeholder="Enter student ID" style={{ borderWidth: 1, padding: 8, marginBottom: 10 }} />
            <Text>Name:</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Enter name" style={{ borderWidth: 1, padding: 8, marginBottom: 10 }} />
          </>
        )}
      </View>
      <View>
        {isSignUp ? (
          <Button title="Sign Up" onPress={handleSignUp} />
        ) : (
          <Button title="Login" onPress={handleLogin} />
        )}
        <Text>Or</Text>
        <Button title={isSignUp ? "Switch to Login" : "Switch to Sign Up"} onPress={() => setIsSignUp(!isSignUp)} />
      </View>
    </View>
  );
};

export default LoginScreen;

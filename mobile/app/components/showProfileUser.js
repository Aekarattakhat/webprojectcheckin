import { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";

const ShowProfileUserComponent = ({user}) =>{

    return (
        <View>
            <Text>{user.name}</Text>
            <Text>{user.stdId}</Text>
            <Text>{user.email}</Text>
        </View>
    )
}

export default ShowProfileUserComponent
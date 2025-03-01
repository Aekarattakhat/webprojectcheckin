import { View, TextInput, Button, Text, FlatList } from "react-native";
import AddClassModal from "./models/addClass";
import { useState } from "react";
import { db } from "@/app/cofig";
import { doc, getDoc, updateDoc,deleteField} from "firebase/firestore";

const ShowClassComponent =  ({user}) =>{
    const [classes,setClasses] = useState(user.classroom ?? []);
    const [showAddClassModa,setShowAddClassModa] = useState(false)

    const handleAddClass = async () =>{
        setShowAddClassModa(true)
    }

    const handleExitClass = async (classId) =>{
        console.log(classId)
        await updateDoc(doc(db,"user",user.uid), {
            [`classroom.${classId}`]: deleteField()
        });
        await updateDoc(doc(db,"classroom",classId), {
            [`students.${user.uid}`]: deleteField()
        });
    }

    return (
    <View>
        <Button title="Add Class" onPress={handleAddClass} />
        <FlatList 
            data={Object.entries(user.classroom ?? [])}
            horizontal={true}
            keyExtractor={([key]) => key} 
            renderItem={({ item }) =>{
                const [key, value] = item;
                return (<View style={{ flexDirection: 'row', padding: 10,flex: 1 }}>
                    <Text>{value.info.name}    </Text>
                    <Text>{value.info.code}    </Text>
                    <Button title="exit class" onPress={()=>handleExitClass(key)}></Button>
                </View>
                )}
            }
        />

        <AddClassModal showAddClassModal={showAddClassModa} setShowAddClassModal={setShowAddClassModa} user={user}/>
    </View>
    );

}

export default ShowClassComponent;
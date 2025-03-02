import { View, TextInput, Button, Text, FlatList } from "react-native";
import AddClassModal from "./models/addClass";
import CheckInModal from "./models/checkIn";
import { useState } from "react";
import { db } from "@/app/cofig";
import { doc, getDoc, updateDoc,deleteField} from "firebase/firestore";

const ShowClassComponent =  ({user}) =>{
    const [showAddClassModa,setShowAddClassModa] = useState(false)
    const [showCheckInModal,setShowCheckInModal] = useState(false)
    const [classid,setClassid,] = useState("")
    
    const handleAddClass = async () =>{
        setShowAddClassModa(true)
    }

    const handleCheckIn = (cid)=>{
        setClassid(cid)
        setShowCheckInModal(true)
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

            keyExtractor={([key]) => key} 
            renderItem={({ item }) =>{
                const [key, value] = item;
                return (<View style={{ flexDirection: 'row', padding: 10,flex: 1 }}>
                    <Text>{value.info.name}    </Text>
                    <Text>{value.info.code}    </Text>
                    <Button title="Check in" onPress={()=>handleCheckIn(key)}></Button>
                    <Button title="exit class" onPress={()=>handleExitClass(key)}></Button>
                </View>
                )}
            }
        />

        <AddClassModal showAddClassModal={showAddClassModa} setShowAddClassModal={setShowAddClassModa} user={user}/>
        <CheckInModal showCheckInModal={showCheckInModal} setshowCheckInModal={setShowCheckInModal} user={user} classid={classid}/>
    </View>
    );

}

export default ShowClassComponent;
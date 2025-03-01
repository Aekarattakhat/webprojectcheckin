import React, { useState } from "react";
import { View, TextInput, Button, Text, Modal, TouchableOpacity } from "react-native";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc} from "firebase/firestore";
import { CameraView, useCameraPermissions } from "expo-camera";
import { db } from "@/app/cofig";

const AddClassModal = ({ showAddClassModal, setShowAddClassModal, user }) => {
    const [classroomId, setClassroomId] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();


    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
          <View>
            <Text>We need your permission to show the camera</Text>
            <Button onPress={requestPermission} title="grant permission" />
          </View>
        );
      }

    const addClass = async ()=>{
        const classRef = doc(db, "classroom", classroomId);
        const classData = await getDoc(classRef);
        
        if(classData.exists()){
            
            await updateDoc(doc(db, "user", user.uid), {
                [`classroom.${classroomId}`]: {
                  info: classData.data().info,
                  status: "2",
                }
            });

            await updateDoc(classRef, {
                [`students.${user.uid}`]:{
                    name:user.name,
                    stdid:user.stdId,
                    status:"0",
                }
            });

        }
    }

    const handleBarCodeScanned = ({ data }) => {
        console.log(data)
        setClassroomId(data);
        setIsScanning(false);
        addClass()
    };

    const handleSubmit = () => {
        console.log("Classroom ID:", classroomId);
        setShowAddClassModal(false);
        setIsScanning(false);
        addClass()
    };

    return (
        <Modal visible={showAddClassModal} onRequestClose={() => setShowAddClassModal(false)}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
                <Text style={{ fontSize: 20, marginBottom: 10 }}>Enter Classroom ID</Text>
                <TextInput
                    value={classroomId}
                    onChangeText={setClassroomId}
                    placeholder="Enter Classroom ID"
                    style={{ borderWidth: 1, width: "80%", padding: 10, marginBottom: 10 }}
                />
                <TouchableOpacity onPress={() => setIsScanning(true)} style={{ marginBottom: 10 }}>
                    <Text style={{ color: "blue" }}>Scan QR Code</Text>
                </TouchableOpacity>

                {isScanning && (
                    <CameraView
                        style={{ width: 300, height: 300 }}
                        onBarcodeScanned={handleBarCodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ["qr"],
                          }}
                    />
                )}

                <Button title="Submit" onPress={handleSubmit} />
            </View>
        </Modal>
    );
};

export default AddClassModal;

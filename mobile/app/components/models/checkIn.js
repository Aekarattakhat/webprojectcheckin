import React, { useState } from "react";
import { View, TextInput, Button, Text, Modal, TouchableOpacity } from "react-native";
import { doc, getDoc, updateDoc,setDoc,serverTimestamp,onSnapshot} from "firebase/firestore";
import { db } from "@/app/cofig";

const CheckInModal = ({ showCheckInModal, setshowCheckInModal,classid,user }) => {
    const [step, setStep] = useState(1); // Step tracker
    const [cno, setCno] = useState("");
    const [remark, setRemark] = useState("");
    const [code, setCode] = useState("");
    const [answer, setAnswer] = useState("");
    const [checkin, setcheckin] = useState(null);
    const [studentData, setStudentData] = useState({
        name: user.name,
        stdid: user.stdId,
        remark: "",
    });

    const handleFirstSubmit = async () => {
        if (!cno || !code) {
            return alert("Please fill all fields");
        }
        
        try {
            const classroomDoc = await getDoc(doc(db, "classroom", classid));
    
            if (!classroomDoc.exists()) {
                return alert("Classroom not found!");
            }
    
            const classroomData = classroomDoc.data();
            const checkIn = classroomData.checkin[cno];

            if (!classroomData.checkin || !classroomData.checkin[cno] || checkIn.password !== code || checkIn["status"]=="0" ) {
                return alert("Can't Check in, you not in the right place and right time!!");
            }

            const studentData = {
                [`checkin.${cno}.students.${user.uid}`]:{
                    name: user.name,
                    stdid: user.stdId,
                    date: serverTimestamp(), 
                    score: 1, 
                    remark: remark,
                }
            };

            await updateDoc(doc(db, `classroom`, classid), studentData, { merge: true });
            
            onSnapshot(doc(db, `classroom`,classid),(doc)=>{
                const checkData = doc.data()["checkin"][cno]

                setcheckin(checkData)
                try{
                    const qno = checkData["question_no"]
                    if (checkData["question_show"] && !checkData["answers"][qno]["students"][user.stdId]) {
                        setStep(3);
                    }
                    else setStep(2)
                }catch(err){
                    setStep(2)
                }
            })
            
        } catch (error) {
            console.error("Error checking in:", error);
            alert("Something went wrong. Please try again.");
        }
    };
    
    const handleUpdateStudent = async () => {
        try {
            const studentRef = doc(db, `classroom/${classid}/checkin/${cno}/students`, user.uid);
            await updateDoc(studentRef, {
                name: studentData.name,
                stdid: studentData.stdid,
                remark: studentData.remark,
            });

            // Move to answer input step
            setStep(3);
        } catch (error) {
            console.error("Update error:", error);
            Alert.alert("Error", "Failed to update student details.");
        }
    };

    const handleSecondSubmit = async () => {
        if (!answer) return alert("Please enter an answer");
        const no = checkin["question_no"]
        const AnsData = {
            [`checkin.${cno}.answers.${no}.students.${user.stdId}`]:{
                text: answer,
                date: serverTimestamp(), 
            }
        };
        await updateDoc(doc(db, `classroom`, classid), AnsData, { merge: true });

        //setshowCheckInModal(false); // Close modal after submitting answer
    };

    return (
        <Modal visible={showCheckInModal} onRequestClose={() => setshowCheckInModal(false)}>
            <View style={{ padding: 20 }}>
                {step === 1 && (
                    // First Step: Input for cno, remark, code
                    <>
                        <Text>Enter Class Number:</Text>
                        <TextInput
                            value={cno}
                            onChangeText={setCno}
                            placeholder="Class Number"
                            style={styles.input}
                        />

                        <Text>Enter Code:</Text>
                        <TextInput
                            value={code}
                            onChangeText={setCode}
                            placeholder="Code"
                            style={styles.input}
                        />

                        <Text>Enter Remark:</Text>
                        <TextInput
                            value={remark}
                            onChangeText={setRemark}
                            placeholder="Remark"
                            style={styles.input}
                        />

                        <Button title="Submit" onPress={handleFirstSubmit} />
                    </>
                )} 

{step === 2 && (
                    // Step 2: Edit Student Data
                    <>
                        <Text>{user.classroom[classid].info.name}</Text>
                        <Text>{user.classroom[classid].info.code}</Text>

                        <Text>Now you are in class, Please waiting Question from Teacher...</Text>
                        
                    </>
                )}
                
                {step === 3 && (
                    // Second Step: Input for answer
                    <>
                        <Text>Question No. {checkin["question_no"]}</Text>
                        <Text>Enter Answer:</Text>
                        <TextInput
                            value={answer}
                            onChangeText={setAnswer}
                            placeholder="Answer"
                            style={styles.input}
                        />

                        <Button title="Submit Answer" onPress={handleSecondSubmit} />
                    </>
                )}
            </View>
        </Modal>
    );
};

// Simple styles
const styles = {
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginVertical: 5,
        borderRadius: 5
    }
};

export default CheckInModal;

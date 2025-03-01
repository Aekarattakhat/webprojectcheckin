import React, { useState } from "react";
import { View, TextInput, Button, Text, Modal, TouchableOpacity } from "react-native";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc} from "firebase/firestore";
import { db } from "@/app/cofig";

const CheckInModal = ({ showCheckInModal, setshowCheckInModal,user }) => {

    return (
        <Modal visible={showCheckInModal} onRequestClose={() => setshowCheckInModal(false)}>
            <Text>Checkin</Text>
        </Modal>
    );
};

export default CheckInModal;

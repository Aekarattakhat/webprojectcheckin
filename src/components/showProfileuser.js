import { db } from "@/config";
import { doc, getDoc, setDoc, serverTimestamp,collection, query, where,onSnapshot } from "firebase/firestore";
import React from 'react';


const ShowProfileUserComponent = ({state,setState}) =>{


    const deleteClass = (courseId)=> {
        if (confirm("Are you sure you want to delete this course?")) {
            db.collection("classroom").doc(courseId).delete()
                .then(() => {
                    console.log("Class deleted from Firestore.");
                })
                .catch((error) => {
                    console.error("Error deleting class:", error);
                });
        }
    }
    console.log(state.user.photoURL)
    return (
        <div>
            <h3>{state.user.displayName}</h3>
            <img src={state.user.photoURL} width="50" height="50" alt="Profile" />
            <p>{state.user.email}</p>
            <button variant="secondary" className="mx-2" onClick={() => setState({ showEditProfileModal: true })}>
                Edit Profile
            </button>
        </div>
    )
}

export default ShowProfileUserComponent
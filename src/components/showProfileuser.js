import { db } from "@/config";
import { useState } from "react";
import EditProfileModal from "@/components/modal/editProfile"; 
import React from 'react';


const ShowProfileUserComponent = ({state,setState}) =>{
    const [showEditProfileModa,setShowEditProfileModa] = useState(false)
    const handleProfile = ()=>{setShowEditProfileModa(true)}

    return (
        <div>
            <h3>{state.user.displayName}</h3>
            <img src={state.user.photoURL} width="50" height="50" alt="Profile" />
            <p>{state.user.email}</p>
            <button variant="secondary" className="mx-2" onClick={handleProfile}>
                Edit Profile
            </button>
            <EditProfileModal showEditProfileModal={showEditProfileModa} 
                            setShowEditProfileModa={setShowEditProfileModa} 
                            user={state.user}/>
        </div>
    )
}

export default ShowProfileUserComponent
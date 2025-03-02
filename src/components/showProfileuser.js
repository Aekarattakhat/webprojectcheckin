import { db } from "@/config";
import { useState } from "react";
import EditProfileModal from "@/components/modal/editProfile"; 
import React from 'react';

const ShowProfileUserComponent = ({ state, setState }) => {
    const [showEditProfileModa, setShowEditProfileModa] = useState(false)
    const handleProfile = () => { setShowEditProfileModa(true) }

    return (
        <div className="max-w-md ml-4 p-4 bg-white border border-gray-300 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">{state.user.displayName}</h3>
            <img 
                src={state.user.photoURL} 
                width="50" 
                height="50" 
                alt="Profile" 
                className="rounded-full mb-2"
            />
            <p className="text-gray-600 mb-4">{state.user.email}</p>
            <button 
                className="max-w-[150px] bg-blue-500 text-white py-2 px-4 rounded-lg 
                           hover:bg-blue-600 transition-colors mx-2 flex justify-center items-center"
                onClick={handleProfile}
            >
                Edit Profile
            </button>
            <EditProfileModal 
                showEditProfileModal={showEditProfileModa} 
                setShowEditProfileModa={setShowEditProfileModa} 
                user={state.user}
            />
        </div>
    )
}

export default ShowProfileUserComponent;

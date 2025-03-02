import React, { useState } from "react";
import Modal from "react-modal";
import { db } from "@/config";
import { setDoc, doc } from "firebase/firestore";

const EditProfileModal = ({ showEditProfileModal, setShowEditProfileModa, user }) => {
    console.log(user)
    const [formData, setFormData] = useState({
        name: user.displayName,
        photoURL: user.photoURL,
    });
    
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        console.log("Form Data:", formData);
        const ref = await setDoc(doc(db, "user", user.uid), formData, { merge: true })
        console.log(ref)
        closeModal()
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
    };

    const closeModal = () => { setShowEditProfileModa(false) }

    return (
        <Modal 
            isOpen={showEditProfileModal} 
            ariaHideApp={false} 
            className="max-w-md w-full mx-auto p-6 bg-white border border-gray-300 rounded-lg shadow-md"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Edit Profile</h1>
            <form 
                onSubmit={handleProfileSubmit} 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-md flex flex-col items-center"
            >
                <div className="mb-4 w-full">
                    <label className="block text-gray-700 text-lg mb-2">Name:</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required 
                        placeholder="Enter your name"
                    />
                </div>

                <div className="mb-4 w-full">
                    <label className="block text-gray-700 text-lg mb-2">Photo URL:</label>
                    <input 
                        type="text" 
                        name="photoURL" 
                        value={formData.photoURL} 
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required 
                        placeholder="Enter photo URL"
                    />
                </div>

                <button 
                    type="submit" 
                    className="w-full max-w-xs bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Submit
                </button>
            </form>
            <button 
                onClick={closeModal}
                className="w-full max-w-md mx-auto block bg-red-500 text-white py-3 rounded-lg mt-4 hover:bg-red-600 transition-colors"
            >
                Cancel
            </button>
        </Modal>
    );
}

export default EditProfileModal;
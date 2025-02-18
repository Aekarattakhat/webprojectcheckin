import React, { useState} from "react";
import Modal from "react-modal";
import { db } from "@/config";
import { setDoc, doc} from "firebase/firestore";

const EditProfileModal = ({ showEditProfileModal, setShowEditProfileModa,user})=>{
    console.log(user)
    const [formData, setFormData] = useState({
        name: user.displayName,
        photoURL: user.photoURL,
      });
    
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        console.log("Form Data:", formData);
        const ref = await setDoc(doc(db,"user",user.uid),formData,{ merge: true })
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

    const closeModal = () =>{setShowEditProfileModa(false)}

    return (
        <Modal isOpen={showEditProfileModal}  ariaHideApp={false}>
            <h1 >Edit Profile</h1>
            <form onSubmit={handleProfileSubmit} className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
                <div className="mb-4">
                    <label className="block text-gray-700">Name:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Photo:</label>
                    <input type="text"name="photo" value={formData.photoURL} onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>

                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg">
                    Submit
                </button>

            </form>
            <button onClick={closeModal}
            className="w-full bg-blue-500 text-white py-2 rounded-lg">
                    Cancel
            </button>
        </Modal>
    );

}

export default EditProfileModal
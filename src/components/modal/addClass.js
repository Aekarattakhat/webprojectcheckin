import React, { useState} from "react";
import Modal from "react-modal";
import { db } from "@/config";
import { addDoc, collection} from "firebase/firestore";


const AddClassModal = ({ showAddClassModal, setShowAddClassModal, user}) => {
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        photo: "",
        room: "",
      });
    
    const handleClassSubmit = async (e) => {
        e.preventDefault();
        console.log("Form Data:", formData);
        const ref = await addDoc(collection(db,"classroom"),{
            owner:user,
            info:formData,
        })
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

    const closeModal = () =>{setShowAddClassModal(false)}

    return (
        <Modal isOpen={showAddClassModal}  ariaHideApp={false}>
            <h1 >Add New Class</h1>
            <form onSubmit={handleClassSubmit} className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
                <div className="mb-4">
                    <label className="block text-gray-700">Code:</label>
                    <input type="text" name="code" value={formData.code} onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Name:</label>
                    <input type="text"name="name" value={formData.name} onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Photo URL:</label>
                    <input type="text" name="photo" value={formData.photo} onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Room:</label>
                    <input type="text" name="room" value={formData.room} onChange={handleChange}
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
};

export default AddClassModal;

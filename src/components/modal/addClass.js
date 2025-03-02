import React, { useState } from "react";
import Modal from "react-modal";
import { db } from "@/config";
import { addDoc, collection } from "firebase/firestore";

const AddClassModal = ({ showAddClassModal, setShowAddClassModal, user }) => {
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        photo: "",
        room: "",
    });

    const handleClassSubmit = async (e) => {
        e.preventDefault();
        console.log("Form Data:", formData);
        const ref = await addDoc(collection(db, "classroom"), {
            owner: user,
            info: formData,
        });
        console.log(ref);
        closeModal();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const closeModal = () => { setShowAddClassModal(false); };

    return (
        <Modal isOpen={showAddClassModal} ariaHideApp={false} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-xl font-semibold text-gray-800 mb-4 text-center">Add New Class</h1>
                <form onSubmit={handleClassSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Code:</label>
                        <input type="text" name="code" value={formData.code} onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Name:</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Photo URL:</label>
                        <input type="text" name="photo" value={formData.photo} onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Room:</label>
                        <input type="text" name="room" value={formData.room} onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    <div className="flex justify-between space-x-4">
                        <button type="submit" className="w-1/2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300">
                            Submit
                        </button>
                        <button onClick={closeModal} className="w-1/2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-700 transition duration-300">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default AddClassModal;
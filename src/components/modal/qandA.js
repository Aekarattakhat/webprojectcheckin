import React, { useState} from "react";
import Modal from "react-modal";
import { db } from "@/config";
import { setDoc, doc} from "firebase/firestore";

const QAModal = ({ showQAModal, setShowQAModa,user})=>{

    const [formData, setFormData] = useState({
        question_no: "",
        question_text: "",
      });
    
    const handleQASubmit = async (e) => {
        e.preventDefault();
        console.log("Form Data:", formData);
        //const ref = await setDoc(doc(db,"user",user.uid),formData,{ merge: true })
        //console.log(ref)
        closeModal()
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      };

    const closeModal = () =>{setShowQAModa(false)}

    return (
        <Modal isOpen={showQAModal}  ariaHideApp={false}>
            <h1 >Set Question</h1>
            <form onSubmit={handleQASubmit} className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
                <div className="mb-4">
                    <label className="block text-gray-700">Question Number:</label>
                    <input type="text" name="question_no" value={formData.question_no} onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Question Text:</label>
                    <input type="text"name="question_text" value={formData.question_text} onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>

                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg">
                    Show Question
                </button>

            </form>
            <button onClick={closeModal}
            className="w-full bg-blue-500 text-white py-2 rounded-lg">
                    Cancel
            </button>
        </Modal>
    );

}

export default QAModal
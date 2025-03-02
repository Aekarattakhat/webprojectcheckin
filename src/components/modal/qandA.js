import { db } from "@/config";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import Modal from "react-modal";

const QAModal = ({ showQAModal, setShowQAModal, cid, cno }) => {
    const [formData, setFormData] = useState({ question_no: "", question_text: "" });
    const [QAData, setQAData] = useState([]); // State for UI display, synced with Firestore only
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ question_no: "", question_text: "" });
    const unsubscribeRef = useRef(null);

    // Helper function to migrate question data from old question_no to new question_no
    const migrateQuestionData = async (oldQuestionNo, newQuestionNo, questionText, cid) => {
        if (!oldQuestionNo || !newQuestionNo || oldQuestionNo === newQuestionNo) return;

        const QARef = doc(db, "classroom", cid);
        try {
            // Fetch current data from Firestore
            const docSnapshot = await getDoc(QARef);
            if (!docSnapshot.exists()) return;

            const currentData = docSnapshot.data();
            const checkinData = currentData.checkin?.[cno] || {};

            // Get old answers data
            const oldAnswers = checkinData.answers?.[oldQuestionNo]?.students || {};
            const oldQuestionShow = checkinData.question_show || false;

            // Prepare new data structure for the new question_no
            const newAnswers = {
                question_text: questionText,
                students: Object.entries(oldAnswers).reduce((acc, [studentId, info]) => ({
                    ...acc,
                    [studentId]: { text: info.text || "N/A", timestamp: info.timestamp || Date.now() }
                }), {})
            };

            // Update Firestore with new question_no without deleting the old one
            await setDoc(
                QARef,
                {
                    checkin: {
                        [cno]: {
                            answers: {
                                [newQuestionNo]: newAnswers // เพิ่มข้อมูลสำหรับ question_no ใหม่
                            },
                            question_no: newQuestionNo // อัปเดต question_no ปัจจุบัน
                        }
                    }
                },
                { merge: true }
            );
        } catch (err) {
            console.error("Error migrating question data:", err);
        }
    };

    // Helper function to update question data and question_show in Firestore
    const updateQuestion = async (questionNo, questionText, showStatus = false) => {
        if (!questionNo || !questionText) return;

        const QARef = doc(db, "classroom", cid);
        try {
            // Fetch current data from Firestore
            const docSnapshot = await getDoc(QARef);
            const currentData = docSnapshot.exists() ? docSnapshot.data().checkin?.[cno]?.answers || {} : {};

            // Check if question_no has changed
            let oldQuestionNo = Object.keys(currentData).find(key => currentData[key].question_text === questionText);
            if (oldQuestionNo && oldQuestionNo !== questionNo) {
                // If question_no changed, migrate the data but keep the old data
                await migrateQuestionData(oldQuestionNo, questionNo, questionText, cid);
            }

            // Update Firestore with new data
            await setDoc(
                QARef,
                {
                    checkin: {
                        [cno]: {
                            question_show: showStatus, // อัปเดต question_show ตามสถานะ
                            question_no: questionNo, // อัปเดต question_no ปัจจุบัน
                            answers: {
                                [questionNo]: {
                                    question_text: questionText,
                                    students: Object.entries(currentData[questionNo]?.students || {}).reduce((acc, [studentId, info]) => ({
                                        ...acc,
                                        [studentId]: { text: info.text || "N/A", timestamp: info.timestamp || Date.now() }
                                    }), {})
                                }
                            }
                        }
                    }
                },
                { merge: true }
            );
        } catch (err) {
            console.error("Error updating question:", err);
        }
    };

    // Start real-time listener
    const startListening = () => {
        const QARef = doc(db, "classroom", cid);
        unsubscribeRef.current = onSnapshot(QARef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                const checkinData = data?.checkin?.[cno] || {};
                const questionNo = checkinData.question_no || formData.question_no; // Use question_no from Firestore or formData
                const students = checkinData.answers?.[questionNo]?.students || {};

                // Sync QAData with Firestore data only
                setQAData(Object.entries(students)
                    .map(([studentId, info]) => ({
                        studentId,
                        text: info.text || "N/A",
                        timestamp: info.timestamp || Date.now()
                    }))
                    .sort((a, b) => a.timestamp - b.timestamp));
                
                // Update formData.question_no to match Firestore
                setFormData(prev => ({ ...prev, question_no: questionNo }));
            } else {
                setQAData([]);
                updateQuestion(formData.question_no, formData.question_text, false); // Default to false when no data exists
            }
        });
    };

    // Stop real-time listener and update question_show to false
    const stopListening = () => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
            if (formData.question_no) {
                updateQuestion(formData.question_no, formData.question_text, false); // Set question_show to false when stopping
            }
        }
    };

    useEffect(() => {
        if (!showQAModal) {
            stopListening();
            return;
        }
        if (loading) startListening();
        return stopListening;
    }, [showQAModal, loading, formData.question_no]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "question_no" && !/^\d*$/.test(value)) {
            setError({ ...error, question_no: "Please enter numbers only" });
            return;
        }
        setFormData({ ...formData, [name]: value });
        setError({ ...error, [name]: "" });

        // If question_no changes and there are answers, update Firestore immediately
        if (name === "question_no" && value && QAData.length > 0) {
            updateQuestion(value, formData.question_text, loading); // Update with current question_text and status
        }
    };

    // Handle starting the question
    const handleStart = async () => {
        const newError = { question_no: "", question_text: "" };
        let hasError = false;

        if (!formData.question_no.trim()) {
            newError.question_no = "Please enter question number";
            hasError = true;
        }
        if (!formData.question_text.trim()) {
            newError.question_text = "Please enter question text";
            hasError = true;
        }

        setError(newError);
        if (!hasError) {
            await updateQuestion(formData.question_no, formData.question_text, true); // Set question_show to true when starting
            setLoading(true);
        }
    };

    // Close modal and reset state, ensure question_show is false
    const closeModal = () => {
        setShowQAModal(false);
        setFormData({ question_no: "", question_text: "" });
        setLoading(false);
        setError({ question_no: "", question_text: "" });
        if (formData.question_no) {
            updateQuestion(formData.question_no, formData.question_text, false); // Set question_show to false when closing modal
        }
        stopListening(); // This will set question_show to false if stopListening is called
    };

    return (
        <Modal isOpen={showQAModal} ariaHideApp={false} className="p-6 bg-white rounded-lg">
            <h1 className="text-2xl font-bold mb-4 text-center">Set Question</h1>
            <form onSubmit={(e) => e.preventDefault()} className="max-w-md mx-auto p-4 bg-gray-100 shadow-md rounded-lg flex flex-col items-center">
                {["question_no", "question_text"].map((field) => (
                    <div key={field} className="mb-4 w-full">
                        <label className="block text-black-700 capitalize">{field.replace("_", " ")}:</label>
                        <input
                            type={field === "question_no" ? "text" : "text"}
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg ${error[field] ? 'border-red-500' : ''}`}
                            required
                            disabled={loading} // Disable input when loading is true
                        />
                        {error[field] && <p className="text-red-500 text-sm mt-1">{error[field]}</p>}
                    </div>
                ))}
                <button onClick={handleStart} className="w-full max-w-xs bg-green-500 text-white py-2 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                    Start Question {loading && <span className="ml-2 animate-spin">🔄</span>}
                </button>
                <button onClick={() => setLoading(false)} className="w-full max-w-xs bg-red-500 text-white py-2 rounded-lg mt-2 hover:bg-red-600 transition-colors">
                    Stop Question
                </button>
            </form>
            <button onClick={closeModal} className="w-full max-w-md mx-auto block bg-blue-500 text-white px-10 py-2 rounded-lg mt-4 hover:bg-blue-600 transition-colors">
                Cancel
            </button>
            <div className="mt-6 p-4 bg-gray-200 rounded-lg">
                <h2 className="text-lg font-bold mb-2">Answer List (Question {formData.question_no})</h2>
                {loading ? (
                    <div>
                        {QAData.length > 0 ? (
                            <ul className="space-y-2 mb-4">
                                {QAData.map(({ studentId, text }) => (
                                    <li key={studentId} className="border-b p-2">
                                        <strong>{studentId}:</strong> {text}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-500">Waiting for student answers...</p>}
                    </div>
                ) : QAData.length > 0 ? (
                    <ul className="space-y-2">
                        {QAData.map(({ studentId, text }) => (
                            <li key={studentId} className="border-b p-2">
                                <strong>{studentId}:</strong> {text}
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-gray-500">No answers submitted</p>}
            </div>
        </Modal>
    );
};

export default QAModal;
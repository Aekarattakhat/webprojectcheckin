import { db } from "@/config";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import Modal from "react-modal";

const QAModal = ({ showQAModal, setShowQAModal, cid, cno }) => {
    const [formData, setFormData] = useState({
        question_no: "",
        question_text: "",
    });
    const [QAData, setQAData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ question_no: "", question_text: "" });
    const unsubscribeRef = useRef(null);

    useEffect(() => {
        if (!showQAModal) {
            stopListening();
            return;
        }

        if (loading) {
            startListening();
        }

        return () => stopListening();
    }, [showQAModal, loading, formData.question_no]);

    const startListening = async () => {
        const QARef = doc(db, "classroom", cid);

        unsubscribeRef.current = onSnapshot(QARef, async (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                const answers = data?.checkin?.[cno]?.answers || {};

                if (!answers[formData.question_no]) {
                    await setDoc(
                        QARef,
                        {
                            checkin: {
                                [cno]: {
                                    answers: {
                                        [formData.question_no]: {
                                            students: {},
                                            question_text: formData.question_text,
                                        },
                                    },
                                },
                            },
                        },
                        { merge: true }
                    );
                }

                const studentsData =
                    data?.checkin?.[cno]?.answers?.[formData.question_no]?.students || {};
                const sortedData = Object.entries(studentsData)
                    .map(([studentId, studentInfo]) => ({
                        studentId,
                        text: studentInfo.text || "N/A",
                        timestamp: studentInfo.timestamp || Date.now(),
                    }))
                    .sort((a, b) => a.timestamp - b.timestamp);
                setQAData(sortedData);
            } else {
                await setDoc(
                    QARef,
                    {
                        checkin: {
                            [cno]: {
                                answers: {
                                    [formData.question_no]: {
                                        students: {},
                                        question_text: formData.question_text,
                                    },
                                },
                            },
                        },
                    },
                    { merge: true }
                );
                setQAData([]);
            }
        });
    };

    const stopListening = () => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // จำกัดให้ question_no รับเฉพาะตัวเลข
        if (name === "question_no") {
            // ถ้าค่าไม่ใช่ตัวเลขหรือว่างเปล่า ให้อัปเดตเป็นค่าว่างหรือตัวเลขเท่านั้น
            if (!/^\d*$/.test(value)) {
                setError((prev) => ({
                    ...prev,
                    question_no: "Please enter numbers only",
                }));
                return;
            }
        }

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setError((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleStart = () => {
        let hasError = false;
        const newError = { question_no: "", question_text: "" };

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
            setLoading(true);
        }
    };

    const closeModal = () => {
        setShowQAModal(false);
        setFormData({ question_no: "", question_text: "" });
        setLoading(false);
        setError({ question_no: "", question_text: "" });
        stopListening();
    };

    return (
        <Modal isOpen={showQAModal} ariaHideApp={false} className="p-6 bg-white rounded-lg">
            <h1 className="text-2xl font-bold mb-4 text-center">Set Question</h1>

            <form 
                onSubmit={(e) => e.preventDefault()} 
                className="max-w-md w-full mx-auto p-4 bg-gray-100 shadow-md rounded-lg flex flex-col items-center"
            >
                <div className="mb-4 w-full">
                    <label className="block text-black-700">Question Number:</label>
                    <input 
                        type="text" // กลับมาใช้ type="text" แทน type="number"
                        name="question_no" 
                        value={formData.question_no} 
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg ${error.question_no ? 'border-red-500' : ''}`} 
                        required 
                    />
                    {error.question_no && <p className="text-red-500 text-sm mt-1">{error.question_no}</p>}
                </div>
                <div className="mb-4 w-full">
                    <label className="block text-black-700">Question Text:</label>
                    <input 
                        type="text" 
                        name="question_text" 
                        value={formData.question_text} 
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg ${error.question_text ? 'border-red-500' : ''}`} 
                        required 
                    />
                    {error.question_text && <p className="text-red-500 text-sm mt-1">{error.question_text}</p>}
                </div>
                <button 
                    onClick={handleStart} 
                    className="w-full max-w-xs bg-green-500 text-white py-2 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                    Start Question {loading && <span className="ml-2 animate-spin">🔄</span>}
                </button>
                <button 
                    onClick={() => setLoading(false)} 
                    className="w-full max-w-xs bg-red-500 text-white py-2 rounded-lg mt-2 hover:bg-red-600 transition-colors"
                >
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
                        {QAData.length > 0 && (
                            <ul className="space-y-2 mb-4">
                                {QAData.map(({ studentId, text }) => (
                                    <li key={studentId} className="border-b p-2">
                                        <strong>{studentId}:</strong> {text}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p className="text-gray-500">Waiting for student answers...</p>
                    </div>
                ) : (
                    QAData.length > 0 ? (
                        <ul className="space-y-2">
                            {QAData.map(({ studentId, text }) => (
                                <li key={studentId} className="border-b p-2">
                                    <strong>{studentId}:</strong> {text}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No answers submitted</p>
                    )
                )}
            </div>
        </Modal>
    );
};

export default QAModal;
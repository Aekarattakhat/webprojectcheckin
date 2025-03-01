import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { db } from "@/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import QAModal from "./qandA";

const ShowcheckinModal = ({ ShowcheckinModal, setShowcheckinModal, course }) => {
  const [students, setStudents] = useState([]);
  const [showStudents, setShowStudents] = useState(false);
  const [password, setPassword] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [showQAModal, setShowQAModal] = useState(false); 

  useEffect(() => {
    const fetchStudents = async () => {
      if (!course) return; 
      const studentsRef = collection(db, `classroom/${course.id}/students`);
      const snapshot = await getDocs(studentsRef);
      const studentsList = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        status: doc.data().status || "0",
        stdid: doc.data().stdid,
      }));
      setStudents(studentsList);
    };

    if (ShowcheckinModal && course) {
      fetchStudents();
    }
  }, [ShowcheckinModal, course]);

  const handleApplyPassword = async () => {
    if (!course) return;
    const classroomRef = doc(db, "classroom", course.id);
    try {
      await updateDoc(classroomRef, { "info.password": password });
      setUpdateMessage("Password updated successfully!");
      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (error) {
      console.error("Error updating password:", error);
      setUpdateMessage("Failed to update password.");
    }
  };

  const closeModal = () => {
    setShowcheckinModal(false);
  };

  return (
    <Modal isOpen={ShowcheckinModal} ariaHideApp={false}>
      <h1 className="text-xl font-bold bg-black bg-opacity-50 p-2 rounded">
        Show Check-in
      </h1>
      <div className="p-4 border rounded-lg text-white relative"
        style={{
          backgroundImage: course?.info?.photo ? `url(${course.info.photo})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "300px",
          padding: "20px",
        }}
      >
        {course ? (
          <div className="bg-black bg-opacity-50 p-4 rounded">
            <h2 className="text-lg font-bold">{course.info?.name}</h2>
            <p>Room: {course.info?.room}</p>
            <p>Code: {course.info?.code}</p>
            <p>Owner: {course.owner}</p>

            {/* ปุ่มเซ็ตรหัสผ่าน */}
            <div className="mt-4">
              <label className="text-white py-2 px-4 rounded-lg">Set New Code : </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white-500 text-black py-2 px-4 rounded-lg"
                placeholder="Enter new password"
              />
              <button
                onClick={handleApplyPassword}
                className="bg-green-500 text-white py-2 px-4 rounded-lg ml-2"
              >
                Apply
              </button>
              {updateMessage && <p className="text-sm text-yellow-300 mt-2">{updateMessage}</p>}
            </div>

            {/* ปุ่มแสดง/ซ่อนรายชื่อนักเรียน */}
            <button
              onClick={() => setShowStudents(!showStudents)}
              className="bg-yellow-500 text-white py-2 px-4 rounded-lg mt-4"
            >
              {showStudents ? "Hide Students" : "Show Students"}
            </button>

            {/* ปุ่มเปิด QAModal */}
            <button 
              onClick={() => setShowQAModal(true)} 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-600"
            >
              Ask Question
            </button>

            {/* รายชื่อนักเรียน */}
            {showStudents && (
              <div className="mt-4 bg-gray-800 p-3 rounded">
                <h3 className="font-bold text-white">Students:</h3>
                <ul>
                  {students.length > 0 ? (
                    students.map((student, index) => (
                      <li key={index} className="text-white">
                        {student.name} (ID: {student.stdid}) - Status: {student.status === '0' ? "ยังไม่เช็คชื่อ" : "เช็คชื่อแล้ว"}
                      </li>
                    ))
                  ) : (
                    <p className="text-white">No students found.</p>
                  )}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="bg-black bg-opacity-50 p-2 rounded">Loading...</p>
        )}

        <button onClick={closeModal} className="w-full bg-blue-500 text-white py-2 rounded-lg mt-4">
          Close
        </button>
      </div>

      {/* แสดง QAModal */}
      {showQAModal && (
        <QAModal 
          showQAModal={showQAModal} 
          setShowQAModal={setShowQAModal} 
          cid={course.id} 
          cno={"current-checkin-id"} 
        />
      )}
    </Modal>
  );
};

export default ShowcheckinModal;

import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { db } from "@/config";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import QAModal from "./qandA";
import { deleteField } from "firebase/firestore";

const ShowcheckinModal = ({ ShowcheckinModal, setShowcheckinModal, course, cno }) => {
  const [showQAModal, setShowQAModal] = useState(false);
  const [realTimeCourse, setRealTimeCourse] = useState(course);

  useEffect(() => {
    if (!course?.id) return;

    const checkinRef = doc(db, "classroom", course.id);

    // ฟังการเปลี่ยนแปลงของ Firestore แบบเรียลไทม์
    const unsubscribe = onSnapshot(checkinRef, (docSnap) => {
      if (docSnap.exists()) {
        setRealTimeCourse({ id: course.id, ...docSnap.data() });
      }
    });

    return () => unsubscribe(); // ยกเลิกการฟังข้อมูลเมื่อ component ถูก unmount
  }, [course?.id]);

  const closeModal = () => {
    setShowcheckinModal(false);
  };
  
  const updateStatus = async (newStatus) => {
    if (!realTimeCourse?.id) return;
    try {
      const checkinRef = doc(db, "classroom", realTimeCourse.id);
      await updateDoc(checkinRef, {
        [`checkin.${cno}.status`]: newStatus,  // เปลี่ยนจาก checkin.1 เป็น checkin.cno
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const deleteStudent = async (studentId) => {
    if (!realTimeCourse?.id) return;
    try {
      const checkinRef = doc(db, "classroom", realTimeCourse.id);
      await updateDoc(checkinRef, {
        [`checkin.${cno}.students.${studentId}`]: deleteField(),
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student");
    }
  };

  const updateScore = async (studentId, change) => {
    if (!realTimeCourse?.id) return;
    try {
      const checkinRef = doc(db, "classroom", realTimeCourse.id);
      const studentData = realTimeCourse?.checkin?.[cno]?.students?.[studentId];
      const newScore = (studentData?.score || 0) + change;
      await updateDoc(checkinRef, {
        [`checkin.${cno}.students.${studentId}.score`]: newScore,
      });
    } catch (error) {
      console.error("Error updating score:", error);
      alert("Failed to update score");
    }
  };

  return (
    <Modal isOpen={ShowcheckinModal} ariaHideApp={false}>
      <h1 className="text-xl font-bold bg-black bg-opacity-50 p-2 rounded">
        Show Check-in
      </h1>
      <div className="p-4 border rounded-lg text-white relative"
        style={{
          backgroundImage: realTimeCourse?.info?.photo ? `url(${realTimeCourse.info.photo})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "300px",
          padding: "20px",
        }}
      >
        {realTimeCourse ? (
          <div className="bg-black bg-opacity-50 p-4 rounded">
            <h2 className="text-lg font-bold">{realTimeCourse.info?.name}</h2>
            <p>Room: {realTimeCourse.info?.room}</p>
            <p>Code: {realTimeCourse.info?.code}</p>
            <p>Owner: {realTimeCourse.owner}</p>
            <p>Status: {realTimeCourse?.checkin?.[cno]?.status || "N/A"}</p>
            <p>Password: {realTimeCourse?.checkin?.[cno]?.password || "N/A"}</p>

            <div className="mt-4">
              <button onClick={() => updateStatus("0")} className="bg-red-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-red-600">
                Close Checkin
              </button>
              <button onClick={() => updateStatus("1")} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                Open Checkin
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Check-in Students</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-500">
                  <thead>
                    <tr className="bg-gray-700 text-white">
                      <th className="border border-gray-500 px-4 py-2">Student ID</th>
                      <th className="border border-gray-500 px-4 py-2">Name</th>
                      <th className="border border-gray-500 px-4 py-2">Time</th>
                      <th className="border border-gray-500 px-4 py-2">Score</th>
                      <th className="border border-gray-500 px-4 py-2">Remark</th>
                      <th className="border border-gray-500 px-4 py-2">Operation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {realTimeCourse?.checkin?.[cno]?.students
                      ? Object.entries(realTimeCourse.checkin[cno].students).map(([studentId, student]) => (
                          <tr key={studentId} className="bg-gray-800 text-white">
                            <td className="border border-gray-500 px-4 py-2">{student.stdid}</td>
                            <td className="border border-gray-500 px-4 py-2">{student.name}</td>
                            <td className="border border-gray-500 px-4 py-2">
                              {student.date
                                ? new Date(student.date.seconds ? student.date.seconds * 1000 : student.date).toLocaleString()
                                : "N/A"}
                            </td>
                            <td className="border border-gray-500 px-4 py-2 flex justify-center items-center">
                              <button onClick={() => updateScore(studentId, -1)} className="bg-red-500 text-white px-2 py-1 rounded mr-1 hover:bg-red-600">
                                -
                              </button>
                              <span className="mx-2">{student.score || 0}</span>
                              <button onClick={() => updateScore(studentId, 1)} className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                                +
                              </button>
                            </td>
                            <td className="border border-gray-500 px-4 py-2">{student.remark || "-"}</td>
                            <td className="border border-gray-500 px-4 py-2">
  <button
    onClick={() => deleteStudent(studentId)}
    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
  >
                                Delete
                              </button>
                            </td>

                          </tr>
                        ))
                      : (
                        <tr>
                          <td colSpan="5" className="text-center border border-gray-500 px-4 py-2">
                            No students checked in
                          </td>
                        </tr>
                      )
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <button onClick={() => setShowQAModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-600">
              Ask Question
            </button>
          </div>
        ) : (
          <p className="bg-black bg-opacity-50 p-2 rounded">Loading...</p>
        )}

        <button onClick={closeModal} className="w-full bg-blue-500 text-white py-2 rounded-lg mt-4">
          Close
        </button>
      </div>

      {showQAModal && (
        <QAModal 
          showQAModal={showQAModal} 
          setShowQAModal={setShowQAModal} 
          cid={realTimeCourse.id} 
          cno={cno} 
        />
      )}
    </Modal>
  );
};

export default ShowcheckinModal;
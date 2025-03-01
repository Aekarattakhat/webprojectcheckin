//หน้าจอเช็คชื่อ
//เป็น modal เอาไปใส่ใน classroom mange compoent
//ลิ้งกับปุ่ม เพื่มการเช็คชื่อของ classroom mange
import { db } from "@/config";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import Modal from "react-modal";

const ShowcheckinModal = ({ ShowcheckinModal, setShowcheckinModal }) => {
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [showStudents, setShowStudents] = useState(false);
  const [password, setPassword] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "classroom"));
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const selectedClassroom = items.find((item) => item.id === "1");
      setClassroom(selectedClassroom);

      if (selectedClassroom?.students) {
        setStudents(Object.values(selectedClassroom.students));
      }
    };

    if (ShowcheckinModal) {
      fetchData();
    }
  }, [ShowcheckinModal]);

  const closeModal = () => {
    setShowcheckinModal(false);
  };

  const handleApplyPassword = async () => {
    if (!classroom) return;

    const classroomRef = doc(db, "classroom", classroom.id);

    try {
      await updateDoc(classroomRef, { "info.password": password });
      setUpdateMessage("Password updated successfully!");
      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (error) {
      console.error("Error updating password:", error);
      setUpdateMessage("Failed to update password.");
    }
  };

  return (
    <Modal isOpen={ShowcheckinModal} ariaHideApp={false}>
      <h1 className="text-xl font-bold bg-black bg-opacity-50 p-2 rounded">Show Check-in</h1>
      <div
        className="p-4 border rounded-lg text-white relative"
        style={{
          backgroundImage: classroom?.info?.photo ? `url(${classroom.info.photo})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "300px",
          padding: "20px",
        }}
      >
        {classroom ? (
          <div className="bg-black bg-opacity-50 p-4 rounded">
            <h2 className="text-lg font-bold">{classroom.info?.name}</h2>
            <p>Room: {classroom.info?.room}</p>
            <p>Code: {classroom.info?.code}</p>
            <p>Owner: {classroom.owner}</p>

            <div className="mt-4">
              <label className="text-white py-2 px-4 rounded-lg">Set New Code : </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white-500 text-black py-2 px-4 rounded-lg"
                placeholder="Enter new password"
              />

              <div className="flex justify-between mt-2">
                <button
                  onClick={() => setShowStudents(!showStudents)}
                  className="bg-yellow-500 text-white py-2 px-4 rounded-lg"
                >
                  {showStudents ? "Hide Students" : "Show Students"}
                </button>

                <button
                  onClick={handleApplyPassword}
                  className="bg-green-500 text-white py-2 px-4 rounded-lg"
                >
                  Apply
                </button>
              </div>

              {updateMessage && <p className="text-sm text-yellow-300 mt-2">{updateMessage}</p>}
            </div>

            {/* รายชื่อนักเรียน */}
            {showStudents && (
              <div className="mt-4 bg-gray-800 p-3 rounded">
                <h3 className="font-bold text-white">Students:</h3>
                <ul>
                  {students.length > 0 ? (
                    students.map((student, index) => (
                      <li key={index} className="text-white">
                        {student.name} (ID: {student.stidid}) - Status: {student.status}
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

        <button
          onClick={closeModal}
          className="w-full bg-blue-500 text-white py-2 rounded-lg mt-4"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ShowcheckinModal;

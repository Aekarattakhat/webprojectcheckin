import React, { useState } from "react";
import Modal from "react-modal";
import { db } from "@/config";
import QAModal from "./qandA";

const ShowcheckinModal = ({ ShowcheckinModal, setShowcheckinModal, course }) => {
  const [showQAModal, setShowQAModal] = useState(false);

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

            {/* ปุ่มเปิด QAModal */}
            <button 
              onClick={() => setShowQAModal(true)} 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-600"
            >
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

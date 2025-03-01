import React, { useState } from "react";
import AddClassModal from "@/components/modal/addClass";
import { db } from "@/config";
import { doc, getDoc, setDoc, deleteDoc, collection } from "firebase/firestore";


const ShowClassComponent = ({ classes, setClasses, user, onManageClass }) => {
  const [showAddClassModal, setShowAddClassModal] = useState(false);

  const handleAddClass = () => {
    setShowAddClassModal(true);
  };

  const deleteClass = (courseId) => {
    if (confirm("Are you sure you want to delete this course?")) {
      deleteDoc(doc(db, "classroom", courseId))
        .then(() => {
          console.log("Class deleted from Firestore.");
          // อัปเดต state เพื่อลบวิชาออกจาก UI
          setClasses(classes.filter((course) => course.id !== courseId));
        })
        .catch((error) => {
          console.error("Error deleting class:", error);
        });
    }
  };

  return (
    <div className="p-4">
      <h4 className="mt-3 text-lg font-semibold">My Classes</h4>
      <button
        onClick={handleAddClass}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-blue-600"
      >
        Add Class
      </button>
      <ul className="mt-4 space-y-2">
        {classes.map((course) => (
          <li
            key={course.id}
            className="flex items-center justify-between p-2 bg-gray-100 rounded-lg shadow-sm"
          >
            <span className="text-gray-800">{course.info.name}</span>
            <div className="space-x-2">
              <button
                onClick={() => onManageClass(course.id)}
                className="bg-green-500 text-white px-2 py-1 rounded-lg text-sm hover:bg-green-600"
              >
                Manage
              </button>
              <button
                onClick={() => deleteClass(course.id)}
                className="bg-red-500 text-white px-2 py-1 rounded-lg text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <AddClassModal
        showAddClassModal={showAddClassModal}
        setShowAddClassModal={setShowAddClassModal}
        user={user.uid}
      />
    </div>
  );
};

export default ShowClassComponent;
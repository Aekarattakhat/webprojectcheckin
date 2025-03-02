import React, { useState } from "react";
import AddClassModal from "@/components/modal/addClass";
import { db } from "@/config";
import { doc, deleteDoc, collection } from "firebase/firestore";

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
          setClasses(classes.filter((course) => course.id !== courseId));
        })
        .catch((error) => {
          console.error("Error deleting class:", error);
        });
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg w-full max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-gray-800">My Classes</h4>
        <button
          onClick={handleAddClass}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          + Add Class
        </button>
      </div>
      <ul className="space-y-3">
        {classes.map((course) => (
          <li
            key={course.id}
            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
          >
            <span className="text-gray-900 font-medium">{course.info.name}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => onManageClass(course.id)}
                className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition"
              >
                Manage
              </button>
              <button
                onClick={() => deleteClass(course.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition"
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
        user={user?.uid ?? ""}
      />
    </div>
  );
};

export default ShowClassComponent;

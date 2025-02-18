import React, { useState } from "react";
import AddClassModal from "@/components/modal/addClass";
import { db } from "@/config";
import { doc, getDoc, setDoc, deleteDoc,collection} from "firebase/firestore";

const ShowClassComponent = ({ classes, setClasses, user }) => {
    const [showAddClassModa,setShowAddClassModa] = useState(false)
    const handleAddClass = ()=>{setShowAddClassModa(true)}

    const deleteClass = (courseId) =>{
        if (confirm("Are you sure you want to delete this course?")) {
            deleteDoc(doc(db,"classroom",courseId))
                .then(() => {
                    console.log("Class deleted from Firestore.");
                })
                .catch((error) => {
                    console.error("Error deleting class:", error);
                });
        }
    }

    return (
        <div>
            <h4 className="mt-3">My Classs</h4>
            <button variant="primary" onClick={handleAddClass}>Add Class</button>
            <ul>
                {classes.map(course => (
                    <li key={course.id}>
                        {course.info.name} 
                        <button size="sm" onClick={() => alert("Manage: " + course.name)}>Manage</button>
                        <button size="sm" variant="danger" className="mx-2" onClick={() => deleteClass(course.id)}>Delete</button>
                        
                    </li>
                ))}
            </ul> 

                <AddClassModal showAddClassModal={showAddClassModa} setShowAddClassModa={setShowAddClassModa} user={user.uid}/>
        </div>
    )
}

export default ShowClassComponent

import React from "react";
import { db } from "@/config";
import { doc, getDoc, setDoc, serverTimestamp,collection, query, where,onSnapshot } from "firebase/firestore";

const ShowClassComponent = ({classes,setClasses})=>{
    const addClass = ()=> {
        setState({ showAddClassModal: true });
    }

    return (
        <div>
            <h4 className="mt-3">My Classs</h4>
            <button variant="primary" onClick={() => addClass()}>Add Class</button>
            <ul>
                {classes.map(course => (
                    <li key={course.id}>
                        {course.name}
                        <button size="sm" onClick={() => alert("Manage: " + course.name)}>Manage</button>
                        <button size="sm" variant="danger" className="mx-2" onClick={() => deleteClass(course.id)}>Delete</button>
                        
                    </li>
                ))}
                </ul>
        </div>
    )
}

export default ShowClassComponent
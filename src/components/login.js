import { auth, db } from "@/config";
import { GoogleAuthProvider,signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp,collection, query, where,onSnapshot } from "firebase/firestore";
import React from 'react';


const LoginComponent = ({state, setState,setClasses}) => {
    const fetchClasss = (userId) => {
        const classRef = collection(db, "classroom");
        const q = query(classRef, where("owner", "==", userId));
    
        onSnapshot(q, (snapshot) => {
            const classroom = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(classroom,"fgfffffffffffffff")
            setClasses(classroom);
        }); 
    };

    const google_login = () => {
        const provider = new GoogleAuthProvider();
        provider.addScope("profile");
        provider.addScope("email");
    
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
    
                if (user) {
                    const userRef = doc(db, "user", user.uid);
    
                    getDoc(userRef)
                        .then((docSnapshot) => {
                            if (!docSnapshot.exists()) {
                                setDoc(userRef, {
                                    uid: user.uid,
                                    name: user.displayName,
                                    email: user.email,
                                    photoURL: user.photoURL,
                                    createdAt: serverTimestamp()
                                });
                            }
                            fetchClasss(user.uid)
                            setState({...state, user: user.toJSON() });
                        })
                        .catch((error) => {
                            console.error("Error checking user by UID:", error);
                        });
                }
            })
            .catch((error) => {
                console.error("Error logging in:", error);
            });
    };

    const google_logout = () => {
        if (confirm("Are you sure?")) {
            auth.signOut().then(() => {
                setState({...state, user: null, classes: null});
            });
        }
    }

    if (!state.user) {
        return <button onClick={() => google_login()}>Login</button>;
    } else {
        return (
            <div>
                <button onClick={() => google_logout()}>Logout</button>
            </div>
        );
    }
}

export default LoginComponent
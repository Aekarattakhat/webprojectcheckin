import { auth, db } from "@/config";
import { GoogleAuthProvider,signInWithPopup } from "firebase/auth";
import React from 'react';


const LoginComponent = ({user, setState}) => {
    const componentDidMount = () => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setState({ user: user.toJSON() });
                fetchClasss(user.uid);
            } else {
                setState({ user: null, classes: [] });
            }
        });
    }

    const fetchClasss = (userId) => {
        db.collection("classroom")
            .where("owner", "==", userId)
            .onSnapshot((snapshot) => {
                const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setState({ classes });
            });
    }

    const google_login = () => {
        var provider = new GoogleAuthProvider();
        provider.addScope("profile");
        provider.addScope("email");
        signInWithPopup(auth,provider)
            .then((result) => {
                const user = result.user;

                if (user) {
                    const userRef = db.collection("user").doc(user.uid);

                    userRef.get().then((doc) => {
                        if (!doc.exists) {
                            userRef.set({
                                uid: user.uid,
                                name: user.displayName,
                                email: user.email,
                                photoURL: user.photoURL,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        }

                        setState({ user: user.toJSON() });
                        fetchClasss(user.uid);
                    }).catch((error) => {
                        console.error("Error checking user by UID:", error);
                    });
                }
            })
            .catch((error) => {
                console.error("Error logging in:", error);
            });
    }

    const google_logout = () => {
        if (confirm("Are you sure?")) {
            auth.signOut().then(() => {
                setState({ user: null, classes: [] });
            });
        }
    }

    console.log(setState)
    if (!user) {
        return <button onClick={() => google_login()}>Login</button>;
    } else {
        return (
            <div>
                <button onClick={() => google_logout()}>Logout</button>
            </div>
        );
    }
}

export {LoginComponent}
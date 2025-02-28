import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth,db } from "./cofig";
import { doc, getDoc, setDoc, serverTimestamp} from "firebase/firestore";

export const signUp = async (email, password,studentId, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userRef = doc(db, "user", user.uid);
    await setDoc(userRef, {
        uid: user.uid,
        name: name,
        stdId: studentId,
        email: user.email,
        photoURL: "",
        status: 2,
        createdAt: serverTimestamp()
    });

    const userData = await getDoc(userRef)
    return userData.data();
  } catch (error) {
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userRef = doc(db, "user", user.uid);

    const userData = await getDoc(userRef)
    return userData.data();
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

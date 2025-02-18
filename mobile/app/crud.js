import { db} from "./cofig";
import { collection, getDocs,addDoc } from 'firebase/firestore';

export const getAllData = async (collectionName) => {
    const snap = await getDocs(collection(db, collectionName))
    return snap
};

export const createData = async(collectionName,data)=>{
    const snap = await addDoc(collection(db, collectionName))
};
'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/config';
import { collection, getDocs, addDoc, setDoc, doc, query, where, getDoc, runTransaction } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';

const ClassroomManagement = ({ cid, onClose }) => {
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      const courseRef = doc(db, 'classroom', cid);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists()) {
        setCourse({ id: courseSnap.id, ...courseSnap.data() });
      } else {
        console.log("No such course!");
      }
    };

    const fetchCheckinCount = async () => {
      const counterRef = doc(db, `classroom/${cid}/checkinCounter`, 'counter');
      const counterSnap = await getDoc(counterRef);
      const count = counterSnap.exists() ? counterSnap.data().count || 0 : 0;
      // ไม่ต้องตั้งค่า checkinNumber ใน state เพราะใช้ Firestore ในการจัดการ
    };

    fetchCourse();
    fetchCheckinCount();
  }, [cid]);

  const fetchStudents = async () => {
    try {
      const studentsRef = collection(db, `classroom/${cid}/students`);
      const querySnapshot = await getDocs(studentsRef);
      const studentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        status: doc.data().status || '0',
        stdid: doc.data().stdid
      }));
      setStudents(studentsList);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchCheckinHistory = async () => {
    try {
      const checkinsRef = collection(db, `classroom/${cid}/checkin`);
      const querySnapshot = await getDocs(checkinsRef);
      const historyList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        code: doc.data().code,
        date: doc.data().date,
        time: doc.data().time
      }));
      setCheckinHistory(historyList);
    } catch (error) {
      console.error("Error fetching check-in history:", error);
    }
  };

  const generateQRCode = () => {
    return (
      <QRCodeCanvas
        value={cid} 
        size={128}
        className="inline-block"
      />
    );
  };

  const addCheckin = async () => {
    try {
      const newCheckinNumber = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, `classroom/${cid}/checkinCounter`, 'counter');
        const counterDoc = await transaction.get(counterRef);

        let count = 1;
        if (counterDoc.exists()) {
          count = (counterDoc.data().count || 0) + 1;
        }

        transaction.set(counterRef, {
          count: count
        }, { merge: true });

        return count;
      });

      const cno = `CHECKIN_${newCheckinNumber}`;
      const checkinDocRef = doc(db, `classroom/${cid}/checkin`, cno);
      const currentDate = new Date();
      await setDoc(checkinDocRef, {
        code: course?.info?.code || 'ABC123',
        date: currentDate.toISOString().split('T')[0],
        time: currentDate.toISOString()
      });

      const scoresRef = collection(db, `classroom/${cid}/checkin/${cno}/scores`);
      const batchPromises = students.map(student =>
        addDoc(scoresRef, {
          uid: student.stdid,
          name: student.name,
          status: '0',
          date: currentDate.toISOString()
        })
      );
      await Promise.all(batchPromises);

      fetchCheckinHistory();
    } catch (error) {
      console.error("Error adding check-in:", error);
    }
  };

  if (!course) return <div>Loading...</div>;

  return (
    <div className="classroom-management p-4 bg-gray-100 rounded-lg shadow-md" style={{ backgroundImage: `url(${course?.info?.backgroundImage || 'none'})` }}>
      <h2 className="text-2xl font-bold mb-4">{course.info?.name || 'Unnamed Course'} (CID: {course.id})</h2>
      <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-lg mb-4 hover:bg-red-600">
        Close
      </button>

      <button 
        onClick={() => setShowQRCode(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-blue-600"
      >
        Show QR Code
      </button>
      {showQRCode && generateQRCode()}

      <button onClick={fetchStudents} className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-green-600">
        Show Students List
      </button>
      {students.length > 0 && (
        <table className="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">ลำดับ</th>
              <th className="border border-gray-300 p-2">รหัส</th>
              <th className="border border-gray-300 p-2">ชื่อ</th>
              <th className="border border-gray-300 p-2">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id} className="border border-gray-300">
                <td className="border border-gray-300 p-2">{index + 1}</td>
                <td className="border border-gray-300 p-2">{student.stdid}</td>
                <td className="border border-gray-300 p-2">{student.name}</td>
                <td className="border border-gray-300 p-2">{student.status === '0' ? 'ยังไม่เช็คชื่อ' : 'เช็คชื่อแล้ว'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={addCheckin} className="bg-purple-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-purple-600">
        Add Check-in
      </button>
      

      <h3 className="text-xl font-semibold mt-6">Check-in History</h3>
      <ul className="mt-2 list-disc pl-5">
        {checkinHistory.map((checkin, index) => (
          <li key={index} className="text-gray-700">
            {checkin.code} - {new Date(`${checkin.date}T${checkin.time}`).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassroomManagement;
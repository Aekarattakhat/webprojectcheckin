'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/config';
import { collection, getDocs, addDoc, setDoc, doc, getDoc, runTransaction,onSnapshot} from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import ShowcheckinModal from '@/components/modal/showcheckin';


const ClassroomManagement = ({ cid, onClose }) => {
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [checkins, setCheckins] = useState("");

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

    const fetchCheckinHistory = async () => {
  try {
    onSnapshot(doc(db, "classroom", cid), (docSnap) => {
      if (docSnap.exists()) {
        const checkinData = docSnap.data().checkin || {}; // ป้องกัน undefined
        const checkins = Object.keys(checkinData).map(key => ({
          id: key,
          ...checkinData[key]
        }));
        setCheckinHistory(checkins);
      } else {
        setCheckinHistory([]);
        console.log("No check-in history found.");
      }
    });
  } catch (error) {
    console.error("Error fetching check-in history:", error);
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
    fetchCheckinHistory();
  }, [cid]);

  const fetchStudents = async () => {
    try {
      const studentsRef = doc(db, `classroom`, `${cid}`);
      const querySnapshot = await getDoc(studentsRef);
      console.log(querySnapshot.data()["students"])
      console.log(querySnapshot.data())
      const studentsList = Object.entries(querySnapshot.data()["students"]).map(([key, student]) => ({
        id: key,
        name: student.name,
        status: student.status || '0',
        stdid: student.stdid
      }));

      setStudents(studentsList);
    } catch (error) {
      console.error("Error fetching students:", error);
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

      
    } catch (error) {
      console.error("Error adding check-in:", error);
    }
  };

  if (!course) return <div>Loading...</div>;


  return (
    <div className="classroom-management p-4 bg-gray-100 rounded-lg shadow-md" style={{ backgroundImage: `url(${course?.info?.backgroundImage || 'none'})` }}>
      <h2 className="text-2xl font-bold mb-4">{course.info?.name || 'Unnamed Course'} (CID: {course.id})</h2>
      <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-lg mb-4 hover:bg-red-600">Close</button>

      <button onClick={() => setShowQRCode(!showQRCode)} className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-blue-600">{showQRCode ? 'Hide QR Code' : 'Show QR Code'}</button>{showQRCode && generateQRCode()}

      <button onClick={() => {setShowStudents(!showStudents);if (!showStudents) fetchStudents();}} className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-green-600">{showStudents ? 'Hide Students List' : 'Show Students List'}</button>{showStudents && students.length > 0 && <table className="w-full mt-4 border-collapse border border-gray-300"><thead><tr className="bg-gray-200">
        <th className="border border-gray-300 p-2">ลำดับ</th>
        <th className="border border-gray-300 p-2">รหัส</th>
        <th className="border border-gray-300 p-2">ชื่อ</th>
        <th className="border border-gray-300 p-2">สถานะ</th>
        </tr></thead><tbody>{students.map((student, index) => (<tr key={student.id} className="border border-gray-300">
          <td className="border border-gray-300 p-2">{index + 1}</td><td className="border border-gray-300 p-2">{student.stdid}</td><td className="border border-gray-300 p-2">{student.name}</td><td className="border border-gray-300 p-2">{student.status === '0' ? 'ยังไม่เช็คชื่อ' : 'เช็คชื่อแล้ว'}</td></tr>))}</tbody></table>}

      <h3 className="text-xl font-semibold mt-6">Check-in History</h3> 
      {checkinHistory &&(
        <table className="w-full mt-4 border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">ลำดับ</th>
            <th className="border border-gray-300 p-2">วันที่-เวลา</th>
            <th className="border border-gray-300 p-2">จำนวนคนเข้าเรียน</th>
            <th className="border border-gray-300 p-2">สถานะ</th>
            <th className="border border-gray-300 p-2">จัดการ</th>
          </tr>
        </thead>
        <tbody>
  {checkinHistory.map((checkin, index) => {
    // ตรวจสอบและแปลงค่า date
    let formattedDate = "ไม่พบข้อมูล";
    
    if (checkin.date) {
      if (typeof checkin.date === "string") {
        // แปลง String -> Date
        formattedDate = new Date(Date.parse(checkin.date)).toLocaleString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      } else if (checkin.date.toDate) {
        // กรณีเป็น Firestore Timestamp
        formattedDate = checkin.date.toDate().toLocaleString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      }
    }

    return (
      <tr key={checkin.id || index} className="border border-gray-300">
        <td className="border border-gray-300 p-2">{index + 1}</td>
        <td className="border border-gray-300 p-2">{formattedDate}</td>
        <td className="border border-gray-300 p-2">{Object.keys(checkin.students || {}).length}</td>
        <td className="border border-gray-300 p-2">{checkin.status || "ไม่ระบุ"}</td>
        <td className="border border-gray-300 p-2">
          <button
            onClick={() => setShowCheckin(true)}
            className="bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600"
          >
            เช็คชื่อ
          </button>
          <button
            onClick={() => addEmptyCheckin()}
            className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600"
          >
            เพิ่ม
          </button>
        </td>
      </tr>
    );
  })}
</tbody>
      </table>
      )}

      <ShowcheckinModal
        ShowcheckinModal={showCheckin} 
        setShowcheckinModal={setShowCheckin} 
        course={course}/>
    </div>
  );
};

export default ClassroomManagement;
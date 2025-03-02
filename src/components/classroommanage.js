'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/config';
import { collection, getDocs, addDoc, setDoc, doc, getDoc, runTransaction,onSnapshot,updateDoc} from 'firebase/firestore';
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
  const [cno,setcno] = useState(1);

  const handleCNO = (cno) => {
    setcno(cno)
    setShowCheckin(true)
  };


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

  const generateRandomPassword = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); 
  };

  

  const addCheckin = async () => {
    const classid = course.id
    const classRef = doc(db, "classroom", classid);
    const classSnap = await getDoc(classRef);

    if (classSnap.exists()) {
        const classData = classSnap.data();
        const checkinData = classData['checkin'] || {}; // ถ้ายังไม่มี checkin ให้เป็น object ว่าง

        // หาหมายเลข checkin ล่าสุด แล้วเพิ่มใหม่
        const newCheckinId = Object.keys(checkinData).length + 1;
        const password = generateRandomPassword();

        // สร้างโครงสร้างข้อมูลใหม่
        const newCheckin = {
            
            date: new Date().toISOString(),
            password: password,
            status: "1"
        };

        // อัปเดตข้อมูล checkin ใหม่กลับไปยัง Firestore
        await updateDoc(classRef, {
            [`checkin.${newCheckinId}`]: newCheckin
        });

        console.log("Check-in added successfully:", newCheckin);
    } else {
        console.log("Classroom not found!");
    }
};

  if (!course) return <div>Loading...</div>;


  return (
    <div className="classroom-management p-4 bg-gray-100 rounded-lg shadow-md" style={{ backgroundImage: `url(${course?.info?.photo || 'none'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
  <h2 className="text-2xl font-bold mb-4 bg-black bg-opacity-50 text-white p-2 rounded-lg inline-block">{course.info?.name || 'Unnamed Course'} (CID: {course.id})</h2>
  
  <div className="flex gap-2 mb-4">
    <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Close</button>
    <button onClick={() => setShowQRCode(!showQRCode)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">{showQRCode ? 'Hide QR Code' : 'Show QR Code'}</button>
    <button onClick={() => {setShowStudents(!showStudents);if (!showStudents) fetchStudents();}} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">{showStudents ? 'Hide Students List' : 'Show Students List'}</button>
    <button onClick={() => addCheckin()}className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"> ADD</button>
  </div>
  
  {showQRCode && generateQRCode()}
  
  {showStudents && students.length > 0 && <table className="w-full mt-4 border-collapse border border-gray-300 bg-white bg-opacity-80 rounded-lg"><thead><tr className="bg-gray-200">
    <th className="border border-gray-300 p-2">ลำดับ</th>
    <th className="border border-gray-300 p-2">รหัส</th>
    <th className="border border-gray-300 p-2">ชื่อ</th>
    <th className="border border-gray-300 p-2">สถานะ</th>
    </tr></thead><tbody>{students.map((student, index) => (<tr key={student.id} className="border border-gray-300">
      <td className="border border-gray-300 p-2">{index + 1}</td><td className="border border-gray-300 p-2">{student.stdid}</td><td className="border border-gray-300 p-2">{student.name}</td><td className="border border-gray-300 p-2">{student.status === '0' ? 'ยังไม่เช็คชื่อ' : 'เช็คชื่อแล้ว'}</td></tr>))}</tbody></table>}

  <h3 className="text-xl font-semibold mt-6 bg-black bg-opacity-50 text-white p-2 rounded-lg inline-block">Check-in History</h3> 
  {checkinHistory &&(
    <table className="w-full mt-4 border-collapse border border-gray-300 bg-white bg-opacity-80 rounded-lg">
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
            onClick={() => handleCNO(index+1)}
            className="bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600"
          >
            เช็คชื่อ
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
        cno = {cno}
        setShowcheckinModal={setShowCheckin} 
        course={course}/>
    </div>
  );
};

export default ClassroomManagement;

'use client'
import { useState } from 'react';
import  LoginComponent  from '@/components/login';
import  ShowProfileUserComponent  from '@/components/showProfileuser';
import ShowClassComponent from '@/components/showClass';
import ShowcheckinModal from '@/components/modal/showcheckin';

export default function Home() {
  
  const [state, setState] = useState({
    user: null,
    image: null,
    url: "",
    progress: 0,
  });

  const [classes, setClasses] = useState(null);
  const [showCheckin, setShowCheckin] = useState(false); // เพิ่ม state สำหรับ modal

  return (
    <div>
      <LoginComponent state={state} setState={setState} setClasses={setClasses} />
      
      {state.user && <ShowProfileUserComponent state={state} setState={setState} />}
      {classes && <ShowClassComponent classes={classes} user={state.user} />}

      {/* ปุ่มเปิด Modal */}
      <button 
        onClick={() => setShowCheckin(true)} 
        className="bg-green-500 text-white p-2 rounded-lg mt-4"
      >
        Add Check-in
      </button>

      {/* Showcheckin Modal */}
      <ShowcheckinModal ShowcheckinModal={showCheckin} setShowcheckinModal={setShowCheckin} />
    </div>
  );
}

'use client'
import { useState } from 'react';
import LoginComponent from '@/components/login';
import ShowProfileUserComponent from '@/components/showProfileuser';
import ShowClassComponent from '@/components/showClass';
import ClassroomManage from '@/components/classroommanage';

export default function Home() {
  const [state, setState] = useState({
    user: null,
    image: null,
    url: "",
    progress: 0,
  });

  const [classes, setClasses] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  const handleManageClass = (cid) => {
    setSelectedClass(cid);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Classroom heckin System</h1>

        <div className="mb-4">
          <LoginComponent state={state} setState={setState} setClasses={setClasses} />
        </div>

        {state.user && (
          <div className="mb-4 border-t pt-4">
            <ShowProfileUserComponent state={state} setState={setState} />
          </div>
        )}

        {classes && state.user && (
          <div className="mt-4 border-t pt-4">
            <ShowClassComponent 
              classes={classes} 
              user={state.user} 
              onManageClass={handleManageClass} 
            />
          </div>
        )}

        {selectedClass && (
          <div className="mt-4">
            <ClassroomManage cid={selectedClass} onClose={() => setSelectedClass(null)} />
          </div>
        )}
      </div>
    </div>
  );
}

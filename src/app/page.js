'use client'
import { useState } from 'react';
import  LoginComponent  from '@/components/login';
import  ShowProfileUserComponent  from '@/components/showProfileuser';
import ShowClassComponent from '@/components/showClass';
import AddClassModal from "./modal/addClass";

export default function Home() {

  const [state, setState] = useState({
    user: null,
    showAddClassModal: false,
    newClassName: "",
    image: null,
    url: "",
    progress: 0,
  });

  const [classes,setClasses] = useState(null)

  return (
    <div>
      <LoginComponent state={state} setState={setState} setClasses={setClasses}/>
      
      {state.user && 
      <ShowProfileUserComponent state={state} setState={setState}/>}

      {classes && 
      <ShowClassComponent classes={classes} />}
    </div>
  );
}

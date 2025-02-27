'use client'
import { useState } from 'react';
import  LoginComponent  from '@/components/login';
import  ShowProfileUserComponent  from '@/components/showProfileuser';
import ShowClassComponent from '@/components/showClass';
import QAModal from '@/components/modal/qandA';


export default function Home() {

  const [state, setState] = useState({
    user: null,
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
      <ShowClassComponent classes={classes} user={state.user}/>}

      <QAModal showQAModal={false}/>
    </div>
  );
}

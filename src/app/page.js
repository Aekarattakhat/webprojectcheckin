'use client'
import { useState } from 'react';
import { LoginComponent } from '@/components/login';

export default function Home() {
  const stateInit = {
    user: null,
    classes: [],
    showAddClassModal: false,
    newClassName: "",
    image: null,
    url: "",
    progress: 0,
  };

  const [state, setState] = useState(stateInit);

  return (
    <div>
      <LoginComponent user={state.user} setState={setState}/>
    
    </div>
  );
}

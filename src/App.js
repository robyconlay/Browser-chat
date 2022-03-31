import React, { useState, useRef } from 'react';
import './App.css';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData} from 'react-firebase-hooks/firestore';

const app = initializeApp({
  apiKey: "AIzaSyDBb1Z5CZGEuuC1HG41LpvJ0Rd9ZhS7iJw",
  authDomain: "superchat-bcd43.firebaseapp.com",
  projectId: "superchat-bcd43",
  storageBucket: "superchat-bcd43.appspot.com",
  messagingSenderId: "611659710540",
  appId: "1:611659710540:web:b904cb6474aaf179a874e9",
  measurementId: "G-37M82XYTWX"
})

const auth = getAuth(app);
const firestore = getFirestore(app);
const provider = new GoogleAuthProvider();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className='App'>
      <header >
        <h1>React chat</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {
  return (
    <button className='sign-in' onClick={() => signInWithPopup(auth, provider)}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => signOut(auth)}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef();

  const messagesRef = collection(firestore, 'messages');
  const q = query(messagesRef, orderBy('createdAt'), limit(25));

  const [messages, loading, error] = useCollectionData(q);
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <main>
        {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && <span>Collection: Loading...</span>}
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}> </span>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder='Say something nice' />
        <button type='submit'>Send</button>
      </form>

    </>
  )

}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  )
}

export default App;

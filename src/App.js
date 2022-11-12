import './App.css';

import React, { useRef, useState } from 'react'

import base_image from './asset/rock_eyebrow.jpg'

import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import 'firebase/compat/auth'
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

firebase.initializeApp({
  // Secret!!
})

const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {
  // If user not signed in, user = null
  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header className="App-header">
        <h1>Jeremy's Web Chat</h1>
        <Signout />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn/>}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function Signout() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef()

  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(100) // Word limit per user

  const [messages] = useCollectionData(query, {idField: 'id'})

  const [formvalue, setFormValue] = useState('')

  const sendMessage = async(e) => {
    e.preventDefault() // Prevent from refreshing page when sending text 

    const {uid, photoURL} = auth.currentUser

    await messagesRef.add({
      text: formvalue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('')

    dummy.current.scrollIntoView({behavior: 'smooth'})
  }

  return (
    <>
      <div class="box"></div>
      <div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
        
        <span ref={dummy}></span>
      </div>

      <div class="box"></div>
      <form onSubmit={sendMessage}>
        <input value={formvalue} onChange={(e) => setFormValue(e.target.value)}/>

        <button type="submit">Submit</button>
      </form>
    </>
  )
}

function ChatMessage(props){
  const {text, uid, photoURL } = props.message

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'

  return (
    <div className={`message was ${messageClass}`}>
      <img src={photoURL || base_image} alt='' />
      <p>{text}</p>
    </div>
  )
}

export default App;
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, collection, addDoc, onSnapshot, orderBy, query, serverTimestamp 
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import inco from '../assets/inco.png';
import pf from '../assets/pf.png';
import whiteinco from '../assets/whiteinco.png';
import images from '../assets/images.png';
import files from '../assets/files.png';

// ✅ Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC3_tHNbsQ18MWwsHCrVMbD52dLN3PKuIo",
  authDomain: "chat-app-c3b1f.firebaseapp.com",
  projectId: "chat-app-c3b1f",
  storageBucket: "chat-app-c3b1f.firebasestorage.app",
  messagingSenderId: "484848932459",
  appId: "1:484848932459:web:8bed347251852dcaec032e",
  measurementId: "G-FPLYG2ZE50"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isIncognito, setIsIncognito] = useState(false);

  // Auth: sign in anonymously if no user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        await signInAnonymously(auth);
      } else {
        setUser(u);
      }
    });
    return unsubscribe;
  }, []);

  // Listen to Firestore messages in real-time
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    try {
      await addDoc(collection(db, "messages"), {
        text: input,
        userId: user.uid,
        displayName: isIncognito ? "Anonymous" : "CurrentUser",
        timestamp: serverTimestamp(),
      });
      setInput(""); // clear box
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleImageUpload = (files) => {
  if (!files || files.length === 0) return;
  console.log("Image file:", files[0]);
  // Handle image upload logic
  };

  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;
    console.log("Other file:", files[0]);
    // Handle file upload logic
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-white shadow">
        {/* Left Section (Back + Profile + Name) */}
        <div className="flex items-center gap-2">
          <button className="p-2">&larr;</button>
          <img 
            src={pf} 
            alt="profile"
            className="w-10 h-10 rounded-full"
          />
          <span className="font-semibold">Fun Friday Group</span>
        </div>

        {/* Right Section (Incognito Button with Image) */}
        <button 
          onClick={() => setIsIncognito(!isIncognito)} 
          className={`p-1 rounded-full border ${isIncognito ? "border-gray-800" : "border-gray-300"}`}
        >
          <img 
            src={inco}
            alt="incognito"
            className="w-8 h-8"
          />
        </button>
      </header>


      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.userId === user?.uid;
          return (
            <div 
              key={msg.id} 
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-xs px-3 py-2 rounded-lg shadow 
                ${isOwn ? "bg-red-800 text-white" : "bg-gray-300 text-black"}`}>
                {!isOwn && (
                  <span className="block text-xs font-semibold mb-1">
                    {msg.displayName}
                  </span>
                )}
                <span>{msg.text}</span>
                <div className="text-[10px] mt-1 opacity-70">
                  {msg.timestamp?.toDate?.().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}
                </div>
              </div>
            </div>
          );
        })}
      </div>
         {/* Anonymous Mode Banner */}
          {isIncognito && (
            <div className="flex items-center justify-center text-sm bg-white text-yellow-800 py-5 border-t gap-2 shadow-[0_-6px_10px_-2px_rgba(0,0,0,0.1),0_-3px_6px_-3px_rgba(0,0,0,0.06)]">
              <img src={whiteinco} className="w-9 h-8" />
              <span>Now you're appearing as Anonymous!</span>
              <img src={whiteinco} className="w-9 h-8" />
            </div>

          )}
      <div className="flex items-center p-3 bg-white shadow space-x-2 relative">
  {/* Main container with relative positioning */}
  <div className="relative flex-1">
    {/* Text input */}
    <input
      type="text"
      placeholder="Type a message..."
      className="w-full pl-4 pr-24 py-2 border rounded-full outline-none" // Add right padding
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
    />

    {/* Buttons positioned inside the container */}
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
      {/* Image upload button */}
      <label className="cursor-pointer">
        <img 
          src={images}
          alt="incognito"
          className="w-6 h-6"
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageUpload(e.target.files)}
        />
      </label>

      {/* File upload button */}
      <label className="cursor-pointer">
        <img 
          src={files}
          alt="incognito"
          className="w-6 h-6"
        />
        <input
          type="file"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </label>
    </div>
  </div>

  {/* Send button */}
  <button
    onClick={sendMessage}
    className="ml-1 px-4 py-2 bg-red-800 text-white rounded-full"
  >
    ➤
  </button>
</div>
    </div>
  );
}
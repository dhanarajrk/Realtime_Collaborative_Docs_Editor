import React, { useEffect, useState } from 'react'
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from 'react-router-dom'; //to get documentId

const TOOLBAR_OPTIONS = [      //Extra/Custom toolbar options to add as Quill modules
  [ {header: [1,2,3,4,5,6,false] } ],
  [ {font: []} ],
  [ {list: "ordered"}, {list: "bullet"} ],
  ["bold", "italic", "underline"],
  [ {color: []}, {background: []} ],
  [ {script: "sub"}, {script: "super"} ],
  [ {align: []} ],
  ["image", "blockquote", "code-block"],
  ["clean"]
]

const SAVE_INTERVAL_MS = 2000; //every 2 second save

const TextEditor = () => {
    const[socket, setSocket] = useState();
    const[quill, setQuill] = useState();
    const {id: documentId} = useParams();   //"id" from params is renamed as documentId
    console.log(documentId);


    useEffect(() => {
      const s = io("http://localhost:3001") //server/backend port   (tiggers "connection event" for backend io.on("connection", ) to listen )
      setSocket(s);

      // Ensure there's only one Quill instance
      if (!document.querySelector('.ql-toolbar')) {
        const q = new Quill('.container', { theme: "snow", modules:{toolbar: TOOLBAR_OPTIONS} });

        q.disable()             //disabling quill until a document from server is loaded using "load-document" listen event
        q.setText("Loading...")
        setQuill(q);
      }

      return() =>{   //cleans up socket when component unmounts
        s.disconnect();
      }
    }, []);

    //Another useEffect for Quill text-change handler API
    useEffect(() =>{
      if(socket == null || quill == null) return; //make sure there is a socket & quill

      const quillChangeHandler = (delta, oldDelta, source) =>{  //detla: piece of changed part, source: who made the changes? user or api?
        if(source !== "user") return;
        socket.emit("send-changes", delta);  //if changes is made by user, then emit delta data to backend 
      }

      quill.on('text-change', quillChangeHandler);  //turn on quill text-change listener along with handler function

      return() =>{
        quill.off('text-change', quillChangeHandler); //clear/off quill listener
      }
    },[socket, quill])

    //Another useEffect to listen "receive-changes" broadcasted from backend/server and make delta changes
    useEffect(() =>{
      if(socket == null || quill == null) return; 

      const receiveChangeHandler = (delta) =>{  
        quill.updateContents(delta);
      }

      socket.on('receive-changes', receiveChangeHandler);  //listen to "receive-changes" event broadcasted by server/backend and pass as delta in receiveChangeHandler function

      return() =>{
        socket.off('receive-changes', receiveChangeHandler);  
      }
    },[socket, quill])

    //Another useEffect to create seperate rooms for each documentId
    useEffect(() => {
      if(socket == null || quill == null) return;

      socket.emit('get-document', documentId) //send documentId to backend to attach a room for its respective document id

      socket.once("load-document", (document) => { //"load-document" event sent from backend is listened once and setContents in quill
        quill.setContents(document);
        quill.enable()    //Enable text editor only after receiving document from server/backend
      })

    },[socket, quill, documentId])

    //UseEffect for saving-document emit
    useEffect(() =>{
      if(socket==null || quill==null) return;

      //run save every SAVE_INTERVAL_MS = 2000 (2 second)
      const interval = setInterval(() =>{
        socket.emit('save-document', quill.getContents())
      }, SAVE_INTERVAL_MS)

      return () => {
        clearInterval(interval);
      }
    },[socket, quill])
  

    return <div className="container"></div>;

}

export default TextEditor
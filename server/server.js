import { Server } from "socket.io"
import mongoose from "mongoose";
import DocumentModel from "./models/Document.js";

mongoose.connect("mongodb://localhost:27017/Online_Docs_Editor");

const defaultValue= ""

            //server/backend port
const io = new Server(3001, {     
    cors: {
        origin: "http://localhost:3000", //client port
        methods: ["GET", "POST"],
    }
});

io.on("connection", (socket) => {       //listens to any connection event triggered by frontend io

    socket.on("get-document", async (documentId) => {  //listen to documentId event from frontend
        const document = await findOrCreateDocument(documentId);
        socket.join(documentId)  //sockets whoever joins in this specific documentId room can talk to each other
        socket.emit('load-document', document.data)

        socket.on("send-changes", (delta)=>{
            //console.log(delta);
            socket.broadcast.to(documentId).emit("receive-changes", delta); //"receive-changes" broadcasted to frontend for specific documentId, so that changes will be made only for those users who are in same room(same documentId)
        })

        socket.on("save-document", async (data) => {
            await DocumentModel.findByIdAndUpdate(documentId, {data})
        })
  })
})

async function findOrCreateDocument(id){  //if documentId exists then return document. ELSE: create new document with passed id and return it 
    if (id==null) return;

    const document = await DocumentModel.findById(id)
    if(document) return document
    //else  
    return await DocumentModel.create({_id: id, data: defaultValue});
}
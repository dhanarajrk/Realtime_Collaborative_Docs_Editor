import mongoose, { mongo } from "mongoose";

const documentSchema = new mongoose.Schema({
    _id: String,
    data: Object,
})

const DocumentModel = mongoose.model("onlinedoc", documentSchema);

export default DocumentModel;
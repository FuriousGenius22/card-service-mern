import { ObjectId, Schema, model } from "mongoose";

export interface ActiveSessionDoc {
  _id: ObjectId;
  user: ObjectId;
  createdAt: Date;
}

const activeSessionSchema = new Schema<ActiveSessionDoc>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '15d' // Automatically delete after 15 days, matching JWT
  }
});

const ActiveSessionModel = model("ActiveSession", activeSessionSchema);

export default ActiveSessionModel;

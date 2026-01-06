import { ObjectId, Schema, model } from "mongoose";
import bcrypt from "bcrypt";

export interface UserDoc {
  _id: ObjectId;
  email: string;
  password?: string;
  role: "user" | "author";
  name?: string;
  signedUp: boolean;
  avatar?: { url:string; id: string };
  authorId?: ObjectId;
  books: ObjectId[];
  orders?: ObjectId[];
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<UserDoc>({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ["user", "author"],
    default: "user",
  },
  signedUp: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: Object,
    url: String,
    id: String,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: "Author",
  },
  books: [
    {
      type: Schema.ObjectId,
      ref: "Book",
    },
  ],
  orders: [
    {
      type: Schema.ObjectId,
      ref: "Order",
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password!, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password || "");
};

const UserModel = model("User", userSchema);

export default UserModel;

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
}, {
  timestamps: true,
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

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
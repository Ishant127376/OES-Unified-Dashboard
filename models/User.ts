import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export type UserRole = "Admin" | "Sub-User";

const loginActivitySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    timestamp: {
      type: Date,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Sub-User"],
      required: true,
    },
    assignedDevices: {
      type: [String],
      required: true,
      default: [],
      validate: {
        validator: (arr: unknown) =>
          Array.isArray(arr) && arr.every((s) => typeof s === "string" && /^\d{10}$/.test(s)),
        message: "assignedDevices must be an array of 10-digit serial strings",
      },
    },
    loginActivity: {
      type: [loginActivitySchema],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument>) ||
  mongoose.model<UserDocument>("User", userSchema);

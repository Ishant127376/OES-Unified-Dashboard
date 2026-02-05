import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export type DeviceStatus = "Online" | "Offline" | "Warning";

const deviceSchema = new Schema(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
      validate: {
        validator: (v: unknown) => typeof v === "string" && /^\d{10}$/.test(v),
        message: "serialNumber must be exactly 10 digits",
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    macAddress: {
      type: String,
      required: true,
      trim: true,
    },
    firmwareVersion: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Online", "Offline", "Warning"],
      required: true,
      default: "Offline",
    },
    assignedUsers: {
      type: [Schema.Types.ObjectId],
      required: true,
      default: [],
      ref: "User",
    },

    // Existing UI expects these fields; keep optional to avoid regressions.
    location: { type: String, required: false, default: "—" },
    protocol: { type: String, required: false, default: "MQTT" },
  },
  { timestamps: true }
);

export type DeviceDocument = InferSchemaType<typeof deviceSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Device: Model<DeviceDocument> =
  (mongoose.models.Device as Model<DeviceDocument>) ||
  mongoose.model<DeviceDocument>("Device", deviceSchema);

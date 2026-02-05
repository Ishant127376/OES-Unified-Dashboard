import { dbConnect } from "@/lib/mongodb";

// Back-compat: older code imports connectToDb from this module.
export async function connectToDb() {
  return dbConnect();
}

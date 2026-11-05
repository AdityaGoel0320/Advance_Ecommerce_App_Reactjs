import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { store, UserType } from "./store";
import uploadImage from "./upload";

export function validateProfileImage(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPG, PNG, or WebP profile photo.");
  }
  if (file.size > 5 * 1024 * 1024) throw new Error("Profile photos must be 5 MB or smaller.");
}

export async function saveAccountProfile(profile: UserType, firstName: string, lastName: string, file: File | null) {
  const user = auth.currentUser;
  if (!user || user.uid !== profile.id) throw new Error("Please sign in again to update your profile.");
  if (!firstName.trim()) throw new Error("Enter your first name.");
  if (file) validateProfileImage(file);
  const avatar = file ? await uploadImage(file) : user.photoURL || profile.avatar || "";
  if (auth.currentUser?.uid !== user.uid) throw new Error("Your session changed. Please sign in again.");
  await updateProfile(user, { displayName: `${firstName.trim()} ${lastName.trim()}`.trim(), photoURL: avatar || null });
  const updated = { ...profile, firstName: firstName.trim(), lastName: lastName.trim(), avatar };
  if (auth.currentUser?.uid !== user.uid) throw new Error("Your session changed. Please sign in again.");
  store.setState({ currentUser: updated });
  try {
    await setDoc(doc(db, "users", user.uid), updated, { merge: true });
    return null;
  } catch (error) {
    console.error("Account updated, but extended profile could not be saved", error);
    return "Your name and photo were updated, but additional profile details could not be saved. Please try saving again.";
  }
}

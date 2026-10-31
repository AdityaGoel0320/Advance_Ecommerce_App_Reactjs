import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";

const upload = async (file: File): Promise<string> => {
  const date = new Date();
  const storageRef = ref(storage, `images/${date + file.name}`);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      uploadTask.cancel();
      reject(new Error("Profile image upload timed out."));
    }, 15000);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("upload is " + progress + "% done");
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then(resolve, reject)
          .finally(() => clearTimeout(timeout));
      }
    );
  });
};

export default upload;

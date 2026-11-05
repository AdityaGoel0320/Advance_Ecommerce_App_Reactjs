import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ChangeEvent, useEffect, useState } from "react";
import uploadImage from "../../lib/upload";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import Login from "./Login";
import { MdPhotoLibrary } from "react-icons/md";
import Label from "./Label";
import toast from "react-hot-toast";
import { store } from "../../lib/store";
import { validateProfileImage } from "../../lib/profile";

const Registration = () => {
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [avatar, setAvatar] = useState<{ file: File | null; url: string }>({
    file: null,
    url: "",
  });
  useEffect(() => () => { if (avatar.url) URL.revokeObjectURL(avatar.url); }, [avatar.url]);
  const handleAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        validateProfileImage(file);
        setAvatar({
          file,
          url: URL.createObjectURL(file),
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Choose a valid profile photo.");
      }
    }
    e.target.value = "";
  };

  const handleRegistration = async (e: any) => {
    e.preventDefault();
    if (loading) return;
    setErrMsg("");
    setLoading(true);
    const formData = new FormData(e.target);
    const { firstName, lastName, email, password }: any =
      Object.fromEntries(formData);
    // console.log("name", firstName, lastName, email, password, avatar.url);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      try {
        await updateProfile(res.user, { displayName: `${firstName} ${lastName}`.trim() });
        void store.getState().getUserInfo(res.user.uid);
        let imgUrl = null;
        if (avatar.file) {
          imgUrl = await uploadImage(avatar.file);
          await updateProfile(res.user, { photoURL: imgUrl });
        }
        await setDoc(doc(db, "users", res.user.uid), {
          firstName,
          lastName,
          email,
          avatar: imgUrl,
          id: res.user.uid,
        });
        void store.getState().getUserInfo(res.user.uid);
      } catch (profileError) {
        console.error("Account created, but profile could not be saved", profileError);
        toast.error("Your account was created, but your profile could not be saved.");
      }
      setLogin(true);
    } catch (error: any) {
      let errorMessage;
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email.";
          break;
        case "auth/missing-password":
          errorMessage = "Please enter a password.";
          break;
        case "auth/weak-password":
          errorMessage = "Use a password with at least six characters.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Unable to connect. Check your connection and try again.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Registration is unavailable. Please contact the store.";
          break;
        case "auth/email-already-in-use":
          errorMessage = "This email is already in use. Try another email.";
          break;
        // Add more cases as needed
        default:
          errorMessage = "An error occurred. Please try again.";
      }
      console.log("Error", error);
      setErrMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {login ? (
        <Login setLogin={setLogin} />
      ) : (
        <div className="panel mx-auto max-w-2xl">
          <form
            onSubmit={handleRegistration}
            className="mx-auto p-6 sm:p-8"
          >
            <div className="border-b border-line pb-5">
              <h2 className="text-2xl font-bold text-ink">
                Create your account
              </h2>
              <p className="mt-2 text-sm leading-6 text-subtle">
                A little about you. A better shopping experience.
              </p>
            </div>

            <div className="pb-5">
              <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <Label title="First name" htmlFor="firstName" />
                  <div className="mt-2">
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      className="block h-11 w-full rounded-xl border border-line bg-muted px-4 text-sm text-ink focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <Label title="Last name" htmlFor="lastName" />
                  <div className="mt-2">
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      className="block h-11 w-full rounded-xl border border-line bg-muted px-4 text-sm text-ink focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
                <div className="sm:col-span-4">
                  <Label title="Email address" htmlFor="register-email" />
                  <div className="mt-2">
                    <input
                      name="email"
                      id="register-email"
                      type="email"
                      className="block h-11 w-full rounded-xl border border-line bg-muted px-4 text-sm text-ink focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
                <div className="sm:col-span-4">
                  <Label title="Password" htmlFor="register-password" />
                  <div className="mt-2">
                    <input
                      name="password"
                      id="register-password"
                      type="password"
                      className="block h-11 w-full rounded-xl border border-line bg-muted px-4 text-sm text-ink focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <div className="mt-2 flex items-center gap-x-3">
                    <div className="flex-1">
                      <Label title="Profile photo" htmlFor="file-upload" />
                      <div className="mt-2 flex justify-center rounded-xl border border-dashed border-line px-4 py-4">
                        <div className="text-center flex flex-col items-center">
                          <div className="w-14 h-14 border border-gray-600 rounded-full p-1">
                            {avatar?.url ? (
                              <img
                                src={avatar?.url}
                                alt="user image"
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <MdPhotoLibrary
                                className="mx-auto h-full w-full text-gray-500"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <div className="mt-4 flex items-center mb-1 text-sm leading-6 text-subtle">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-lg px-3 py-2 bg-muted font-semibold text-indigo-600 dark:text-indigo-400 focus-within:ring-2 focus-within:ring-indigo-600"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="sr-only"
                                onChange={handleAvatar}
                              />
                            </label>
                          </div>
                          <p className="text-xs leading-5 text-subtle">
                            PNG, JPG, WebP up to 5 MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {errMsg && (
              <p className="bg-white/90 text-red-600 text-center py-1 rounded-md tracking-wide font-semibold">
                {errMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="primary-button mt-5 w-full"
            >
              {loading ? "Loading..." : "Create account"}
            </button>
          </form>

          <p className="text-sm leading-6 text-subtle text-center px-6 pb-8">
            Already have an Account{" "}
            <button
              onClick={() => setLogin(true)}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default Registration;

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiCamera, FiHeart, FiLogOut, FiPackage, FiShield, FiShoppingBag } from "react-icons/fi";
import toast from "react-hot-toast";
import { auth } from "../../lib/firebase";
import { store, UserType } from "../../lib/store";
import { saveAccountProfile, validateProfileImage } from "../../lib/profile";
import FormattedPrice from "../FormattedPrice";
import UserAvatar from "./UserAvatar";

const UserProfile = ({ currentUser }: { currentUser: UserType }) => {
  const cart = store((state) => state.cartProduct);
  const favorites = store((state) => state.favoriteProduct);
  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [lastName, setLastName] = useState(currentUser.lastName);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [pending, setPending] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFirstName(currentUser.firstName);
    setLastName(currentUser.lastName);
  }, [currentUser.firstName, currentUser.lastName]);

  useEffect(() => {
    if (!photo) { setPreview(""); return; }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const choosePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      validateProfileImage(file);
      setPhoto(file);
      setMessage("");
    } catch (error) {
      const text = error instanceof Error ? error.message : "The photo could not be selected.";
      setMessage(text);
      toast.error(text);
    }
    event.target.value = "";
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setMessage("");
    try {
      const warning = await saveAccountProfile(currentUser, firstName, lastName, photo);
      setPhoto(null);
      if (warning) {
        setMessage(warning);
        toast.error(warning);
      } else {
        toast.success("Your profile has been updated.");
      }
    } catch (error) {
      console.error("Unable to save profile", error);
      const text = error instanceof Error ? error.message : "Your profile could not be saved. Please try again.";
      setMessage(text);
      toast.error(text);
    } finally {
      setPending(false);
    }
  };

  const signOut = async () => {
    setSigningOut(true);
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Unable to sign out", error);
      toast.error("Unable to sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
  const cartTotal = cart.reduce((total, item) => total + item.discountedPrice * item.quantity, 0);
  const dirty = !!photo || firstName !== currentUser.firstName || lastName !== currentUser.lastName;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="panel overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-400 sm:h-32" />
        <div className="relative flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="w-fit rounded-2xl border-4 border-surface bg-surface shadow-panel">
              <UserAvatar name={fullName} src={preview || currentUser.avatar} className="h-24 w-24 text-3xl sm:h-28 sm:w-28" />
            </div>
            <div className="min-w-0 sm:pb-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Your account</p>
              <h1 className="mt-1 break-words text-2xl font-bold sm:text-3xl">{fullName || "Welcome back"}</h1>
              <p className="mt-1 break-all text-sm text-subtle">{currentUser.email}</p>
            </div>
          </div>
          <button type="button" disabled={signingOut || pending} onClick={signOut}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-semibold transition hover:bg-muted disabled:opacity-50">
            <FiLogOut /> {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/cart" className="panel flex items-center gap-4 p-5 transition hover:border-indigo-400">
          <span className="rounded-xl bg-indigo-500/10 p-3 text-indigo-500"><FiShoppingBag size={24} /></span>
          <div className="min-w-0"><p className="text-xs text-subtle">In your cart</p><p className="mt-1 text-lg font-bold">{cart.reduce((count, item) => count + item.quantity, 0)} items</p><p className="text-xs text-subtle"><FormattedPrice amount={cartTotal} /></p></div>
        </Link>
        <Link to="/favorite" className="panel flex items-center gap-4 p-5 transition hover:border-indigo-400">
          <span className="rounded-xl bg-rose-500/10 p-3 text-rose-500"><FiHeart size={24} /></span>
          <div><p className="text-xs text-subtle">Your wishlist</p><p className="mt-1 text-lg font-bold">{favorites.length} favorites</p><p className="text-xs text-subtle">Saved for later</p></div>
        </Link>
        <Link to="/orders" className="panel flex items-center gap-4 p-5 transition hover:border-indigo-400">
          <span className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500"><FiPackage size={24} /></span>
          <div><p className="text-xs text-subtle">Purchase history</p><p className="mt-1 text-lg font-bold">Your orders</p><p className="inline-flex items-center gap-1 text-xs text-subtle">View order details <FiArrowUpRight /></p></div>
        </Link>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <section className="panel p-6 sm:p-8">
          <h2 className="text-xl font-bold">Personal details</h2>
          <p className="mt-2 text-sm text-subtle">Make this space yours. Update your name and profile photo.</p>
          <form onSubmit={save} className="mt-6 space-y-6">
            <fieldset disabled={pending} className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <UserAvatar name={fullName} src={preview || currentUser.avatar} className="h-16 w-16 text-xl" />
                <div>
                  <label htmlFor="profile-photo" className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold hover:bg-muted focus-within:ring-2 focus-within:ring-indigo-500">
                    <FiCamera /> Change photo
                    <input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} className="sr-only" />
                  </label>
                  <p className="mt-2 text-xs text-subtle">JPG, PNG, or WebP. Up to 5 MB.</p>
                  {photo && <p className="mt-1 max-w-60 truncate text-xs text-indigo-500">{photo.name} (not saved yet)</p>}
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div><label htmlFor="profile-first-name" className="text-sm font-medium">First name</label>
                  <input id="profile-first-name" required autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-line bg-muted px-4 text-sm focus:border-indigo-500" />
                </div>
                <div><label htmlFor="profile-last-name" className="text-sm font-medium">Last name</label>
                  <input id="profile-last-name" autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-line bg-muted px-4 text-sm focus:border-indigo-500" />
                </div>
              </div>
              <div><label htmlFor="profile-email" className="text-sm font-medium">Email address</label>
                <input id="profile-email" type="email" readOnly value={currentUser.email}
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-muted px-4 text-sm text-subtle" />
                <p className="mt-2 text-xs text-subtle">Your sign-in email is managed by your authentication provider.</p>
              </div>
            </fieldset>
            {message && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{message}</p>}
            <div className="flex flex-wrap gap-3 border-t border-line pt-5">
              <button type="submit" disabled={pending || !dirty} className="primary-button">{pending ? "Saving profile..." : "Save changes"}</button>
              {dirty && <button type="button" disabled={pending} onClick={() => {
                setFirstName(currentUser.firstName); setLastName(currentUser.lastName); setPhoto(null); setMessage("");
              }} className="rounded-xl border border-line px-5 py-3 text-sm font-semibold hover:bg-muted">Cancel</button>}
            </div>
          </form>
        </section>
        <aside className="panel p-6">
          <span className="inline-flex rounded-xl bg-indigo-500/10 p-3 text-indigo-500"><FiShield size={24} /></span>
          <h2 className="mt-4 text-lg font-bold">Account & security</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="text-subtle">Account status</dt><dd className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">Signed in</dd></div>
            <div><dt className="text-subtle">Email verification</dt><dd className="mt-1 font-medium">{auth.currentUser?.emailVerified ? "Verified" : "Not verified"}</dd></div>
            <div><dt className="text-subtle">Preferred currency</dt><dd className="mt-1 font-medium">Indian Rupee (INR)</dd></div>
          </dl>
          <p className="mt-6 border-t border-line pt-5 text-xs leading-6 text-subtle">Your cart and wishlist stay saved on this device. Use the theme button in the header to make yourself at home.</p>
        </aside>
      </div>
    </div>
  );
};

export default UserProfile;

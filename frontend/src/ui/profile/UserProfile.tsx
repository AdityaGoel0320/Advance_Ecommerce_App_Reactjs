import { auth } from "../../lib/firebase";
import { FiUser } from "react-icons/fi";

const UserProfile = ({ currentUser }: any) => {
  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="panel relative isolate overflow-hidden px-6 py-12 text-center sm:px-16">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Welcome back, dear{" "}
          <span>
            <span className="text-indigo-500 font-semibold">
              {currentUser?.firstName} {currentUser?.lastName}
            </span>
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-subtle">
          Your favorites, orders, and next discoveries. All in one place.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4">
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt="Your profile"
              className="w-32 h-32 rounded-2xl border border-line object-cover p-1"
            />
          ) : (
            <FiUser aria-label="Your profile" className="w-32 h-32 rounded-2xl bg-muted p-6 text-subtle" />
          )}
          <button
            onClick={() => auth.signOut()}
            className="primary-button w-52"
          >
            Log out
          </button>
        </div>
        <svg
          viewBox="0 0 1024 1024"
          className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
          aria-hidden="true"
        >
          <circle
            cx={512}
            cy={512}
            r={512}
            fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
            fillOpacity="0.12"
          />
          <defs>
            <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
              <stop stopColor="#7775D6" />
              <stop offset={1} stopColor="#E935C1" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default UserProfile;

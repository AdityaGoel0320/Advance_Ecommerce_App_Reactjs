import { useEffect, useState } from "react";

interface Props {
  name: string;
  src?: string;
  className?: string;
}

const UserAvatar = ({ name, src, className = "h-12 w-12" }: Props) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "ME";
  return src && !failed ? (
    <img src={src} alt={`${name || "Your"} profile`} data-profile-avatar="true"
      onError={() => { console.error("Profile photo could not be loaded"); setFailed(true); }}
      className={`${className} shrink-0 rounded-2xl object-cover`} />
  ) : (
    <span role="img" aria-label={`${name || "Your"} profile initials`}
      className={`${className} flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white`}>
      {initials}
    </span>
  );
};

export default UserAvatar;

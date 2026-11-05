import React from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  children?: React.ReactNode;
  className?: string;
}

const Container = ({ children, className }: Props) => {
  const newClassName = twMerge(
    "w-full max-w-screen-xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8",
    className
  );
  return <div className={newClassName}>{children}</div>;
};

export default Container;

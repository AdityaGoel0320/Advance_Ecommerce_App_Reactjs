const Label = ({ title, htmlFor }: { title: string; htmlFor: string }) => {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium leading-6 text-ink"
    >
      {title}
    </label>
  );
};

export default Label;

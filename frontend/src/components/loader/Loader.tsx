import { Spinner } from "../ui/spinner";

const Loader = () => {
  return (
    <div className="flex w-screen max-w-full justify-center">
      <Spinner className="mt-28 size-8" />
    </div>
  );
};

export default Loader;

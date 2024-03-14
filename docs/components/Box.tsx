import { ReactNode } from "react";
import { MdOutlineLibraryBooks } from "react-icons/md";

type Props = {
  children: ReactNode;
};

export default function MyApp({ children }: Props) {
  return (
    <div className="glass w-40 h-40 flex flex-col items-center justify-center text-4xl gap-y-2 rounded-xl">
      <MdOutlineLibraryBooks />
      <h2 className="text-lg text-white">{children}</h2>
    </div>
  );
}

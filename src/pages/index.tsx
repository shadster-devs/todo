import Image from "next/image";
import { Inter } from "next/font/google";
import Todo from "@/components/Todo";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
      <div className="flex flex-col items-center justify-center min-h-screen">
    <Todo/>
      </div>
  );
}

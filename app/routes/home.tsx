import type { Route } from "./+types/home";
import { Wordle } from "~/components/wordle";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <div className="p-4 h-screen flex flex-col justify-center items-center">
    <h1 className="text-2xl text-center mb-8">Wordle Game</h1>
    <Wordle />
  </div>;
}

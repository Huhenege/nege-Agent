import { redirect } from "next/navigation";

export default function Home() {
  // Normally you'd check auth state here, but for this skeleton:
  redirect("/login");
}

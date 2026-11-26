import { redirect } from "next/navigation";

/** Old /login URL always goes to the new home sign-in page. */
export default function LoginPage() {
  redirect("/");
}

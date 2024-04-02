import SignUpForm from "./sign-up-form";
import getUsername from "@/actions/auth/get-username";
import { redirect } from "next/navigation";

export default async function Page({ searchParams }: { searchParams: { returnUrl?: string } }) {
  const username = await getUsername();

  if (username) {
    if (searchParams.returnUrl) {
      redirect(searchParams.returnUrl);
    } else {
      redirect("/")
    }
  }

  return (
    <div className="w-full h-screen flex flex-col justify-center">
      <div>
        <SignUpForm returnUrl={searchParams.returnUrl} />
      </div>
    </div>
  )
}
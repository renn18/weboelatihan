import { SignIn } from "@clerk/nextjs";

export default function Page() {
    // Clerk akan merender UI Sign-In yang lengkap
    return (
        <div className="flex justify-center items-center min-h-screen">
            <SignIn />
        </div>
    );
}
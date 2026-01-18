import { UserProfile } from '@clerk/nextjs';

export default function UserProfilePage() {
  return (
    <main className="flex justify-center py-10">
      <UserProfile
        routing="path"
        path="/user-profile"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-3xl',
            card: 'shadow-lg border border-gray-200',
          },
        }}
      />
    </main>
  );
}

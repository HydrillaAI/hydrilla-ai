"use client";

import { CommunityProvider, useCommunity } from "@/components/community/CommunityProvider";
import { ProfileView } from "@/components/community/ProfileView";

/** Your own profile, inside the app shell (like a profile tab). Others see it at /@username. */
export default function MyProfilePage() {
  return (
    <CommunityProvider>
      <MyProfile />
    </CommunityProvider>
  );
}

function MyProfile() {
  const { me, meLoaded } = useCommunity();

  if (!me) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        {meLoaded ? (
          <p className="text-sm text-neutral-500">
            We couldn&apos;t load your profile.{" "}
            <button type="button" onClick={() => window.location.reload()} className="font-medium text-neutral-900 underline">
              Try again
            </button>
          </p>
        ) : (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-800" />
        )}
      </div>
    );
  }

  return (
    <div className="community-root pb-10">
      <ProfileView profile={me} inApp />
    </div>
  );
}

import { ProfileSettings } from "@social/components/profile-settings";

export default function ProfileSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-bold mb-4 sm:text-2xl sm:mb-6">Edit Profile</h1>
      <ProfileSettings />
    </div>
  );
}

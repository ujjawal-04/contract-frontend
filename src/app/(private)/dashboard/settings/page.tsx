"use client";

// Import the settings component as a default import, not a named import
import Settings from "@/components/dashboard/settings";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <Settings/>
    </div>
  );
}
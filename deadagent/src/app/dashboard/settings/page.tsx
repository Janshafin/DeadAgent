import React from 'react';
import { SettingsForm } from '@/components/dashboard/settings/SettingsForm';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-[32px] font-normal text-[#c9a84c]">
          Vault Settings
        </h1>
        <p className="font-sans text-[12px] font-light text-[#d0c5b2] max-w-xl leading-relaxed tracking-[0.05em]">
          Configure your protocol preferences, notification channels, and emergency contacts. All changes are auto-saved.
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}

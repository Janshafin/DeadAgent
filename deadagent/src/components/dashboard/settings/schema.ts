import { z } from 'zod';
import { isAddress as viemIsAddress } from 'viem';

// Wrapper to prevent viem's type narrowing (0x${string}) from leaking into Zod schema
const isValidEthAddress = (val: string): boolean => viemIsAddress(val);

export const settingsSchema = z.object({
  // ENS Profile
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(64, 'Display name too long')
    .transform((val) => val.replace(/[<>]/g, '')),
  avatarUrl: z.string().url().optional().or(z.literal('')),

  // Notifications
  emailAlerts: z.boolean(),
  browserPush: z.boolean(),
  telegramWebhook: z
    .string()
    .url('Must be a valid URL')
    .refine((val) => val.startsWith('https://'), { message: 'Must use HTTPS' })
    .optional()
    .or(z.literal('')),

  // Heartbeat
  heartbeatDays: z.number().min(1).max(30),

  // Emergency Contacts — validated with viem isAddress()
  emergencyContacts: z.array(
    z.object({
      label: z
        .string()
        .min(1, 'Label required')
        .max(64)
        .transform((val) => val.replace(/[<>]/g, '')),
      address: z
        .string()
        .min(1, 'Address required')
        .refine((val) => isValidEthAddress(val), {
          message: 'Invalid Ethereum address',
        }),
    })
  ),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

// Input type for form defaults (before Zod transforms/refinements)
type SettingsInput = z.input<typeof settingsSchema>;

export const DEFAULT_SETTINGS: SettingsInput = {
  displayName: '',
  avatarUrl: '',
  emailAlerts: true,
  browserPush: false,
  telegramWebhook: '',
  heartbeatDays: 7,
  emergencyContacts: [{ label: 'Primary Heir', address: '' }],
};

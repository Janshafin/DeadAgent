import { z } from 'zod';
import { isAddress } from 'viem';

/**
 * Shared Zod validators for wallet addresses and common inputs.
 * Uses viem's isAddress() for proper EIP-55 checksum validation.
 */

// ── Wallet Address ─────────────────────────────────────────
export const walletAddressSchema = z
  .string()
  .min(1, 'Address is required')
  .refine((val) => isAddress(val), {
    message: 'Invalid Ethereum address (must be a valid checksummed 0x address)',
  });

// ── ENS Name ───────────────────────────────────────────────
export const ensNameSchema = z
  .string()
  .min(3, 'ENS name too short')
  .max(255)
  .regex(/^[a-z0-9.-]+\.eth$/, 'Must be a valid .eth ENS name');

// ── Safe Text (prevents XSS in free-form fields) ──────────
export const safeTextSchema = z
  .string()
  .max(2000, 'Input too long')
  .transform((val) => val.replace(/[<>]/g, ''));

// ── URL ────────────────────────────────────────────────────
export const safeUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .refine((val) => val.startsWith('https://'), {
    message: 'URL must use HTTPS',
  });

// ── Display Name ───────────────────────────────────────────
export const displayNameSchema = z
  .string()
  .min(1, 'Display name is required')
  .max(64, 'Display name too long')
  .transform((val) => val.replace(/[<>]/g, ''));

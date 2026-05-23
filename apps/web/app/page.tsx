import { redirect } from 'next/navigation';

/**
 * Root route — currently always sends the user to the workspace dashboard.
 * In M2 we'll fork on auth state (sign-in vs. dashboard).
 */
export default function RootPage() {
  redirect('/dashboard');
}

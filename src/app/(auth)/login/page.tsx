import { redirect } from "next/navigation";

/**
 * Legacy /login route.
 * Always send users to the new home experience at `/`
 * (Staff vs Client choice, Sign in + Create account).
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }> | { error?: string; callbackUrl?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const q = new URLSearchParams();
  if (params?.error) q.set("error", String(params.error));
  if (params?.callbackUrl) q.set("callbackUrl", String(params.callbackUrl));
  const qs = q.toString();
  redirect(qs ? `/?${qs}` : "/");
}

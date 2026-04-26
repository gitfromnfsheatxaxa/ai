import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

// Available locales
export const locales = ['en', 'ru', 'uz'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async () => {
  // Try to get locale from cookies
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale')?.value as Locale | undefined;
  
  // Fallback to default locale
  const locale = localeCookie || defaultLocale;
  
  // Validate locale
  if (!locales.includes(locale)) {
    return {
      locale: defaultLocale,
      messages: (await import(`@/messages/${defaultLocale}.json`)).default,
    };
  }
  
  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
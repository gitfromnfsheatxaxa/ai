'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'uz', label: 'O\'zbek', flag: '🇺🇿' },
] as const;

interface LanguageSwitcherProps {
  className?: string;
  onChange?: (locale: string) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className,
  onChange,
}) => {
  const locale = useLocale() as string;
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  const handleSelect = (code: string) => {
    // Set locale cookie
    document.cookie = `locale=${code}; path=/; max-age=${60 * 60 * 24 * 365}`;
    onChange?.(code);
    setIsOpen(false);
    
    // Reload to apply new locale
    window.location.reload();
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-sm font-medium text-gray-700">{currentLang.label}</span>
        <svg
          className={cn(
            'w-4 h-4 text-gray-500 transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 py-2 rounded-xl min-w-[160px]"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
            }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                  'transition-colors',
                  locale === lang.code
                    ? 'bg-teal-50/60 text-teal-700'
                    : 'hover:bg-white/50 text-gray-700'
                )}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.label}</span>
                {locale === lang.code && (
                  <svg
                    className="w-4 h-4 ml-auto text-teal-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
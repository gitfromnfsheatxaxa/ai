/**
 * Internationalization — English, Russian, Uzbek
 */

import { InlineKeyboard } from 'grammy';

export type Language = 'en' | 'ru' | 'uz';
export const DEFAULT_LANGUAGE: Language = 'en';

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: '🇬🇧 English',
  ru: '🇷🇺 Русский',
  uz: '🇺🇿 O\'zbekcha',
};

// ─── Translations ──────────────────────────────────────────────────────────────

const T = {
  en: {
    // Language selection
    choose_language: '🌐 <b>Choose your language</b>\n\nSelect the language for bot messages and meeting notes:',
    language_set: (lang: string) => `✅ Language set to ${lang}.`,

    // Welcome
    welcome: (name: string) =>
      `Welcome, <b>${name}</b>! 👋\n\nI turn your meetings into structured, actionable notes.\n\n<b>Send me:</b>\n• 🎤 A voice message or audio file\n• 📝 A text transcript\n\nI'll extract the summary, decisions, and action items.`,

    // Processing status
    initializing:  'Initializing...',
    downloading:   '⬇️ <b>Downloading audio...</b>',
    transcribing:  '🎙️ <b>Transcribing audio...</b>',
    analyzing:     '🤖 <b>Analyzing content...</b>',
    saving:        '💾 <b>Saving notes...</b>',

    // Notes saved
    notes_saved: (count: number) =>
      count > 0
        ? `✅ <b>Notes saved!</b>\n\n• ${count} action ${count === 1 ? 'item' : 'items'} extracted\n\nOpen <b>📋 My Notes</b> to review them anytime.`
        : '✅ <b>Notes saved!</b>\n\nOpen <b>📋 My Notes</b> to review them anytime.',

    // My Notes
    no_notes: '📭 <b>No meeting notes yet</b>\n\nSend a voice message or paste a transcript to create your first note!',
    my_notes_header: (total: number, page: number, totalPages: number) =>
      totalPages > 1
        ? `<b>📋 My Notes</b>  <i>page ${page} of ${totalPages} · ${total} total</i>`
        : `<b>📋 My Notes</b>  <i>${total} ${total === 1 ? 'note' : 'notes'}</i>`,
    tap_number: '<i>Tap a number to open that note.</i>',

    // Action board
    all_done: '✅ <b>All caught up!</b>\n\nNo open action items. Great job!',
    action_done: '✅ Marked as done!',
    action_done_refresh: '✅ <b>Action item marked as done!</b>\n\nTap <b>⚡ Action Board</b> to refresh your task list.',

    // Settings
    settings: (lang: string) => `⚙️ <b>Settings</b>\n\nCurrent language: ${lang}\n\nUse the button below to change it.`,
    change_language: '🌐 Change Language',

    // Help
    help: `<b>🤖 AI Meeting Notes — Help</b>\n\n<b>How it works:</b>\n1. Send a voice message, audio file, or paste a transcript\n2. The AI transcribes and analyzes it (~30–60 seconds)\n3. You receive a structured breakdown\n\n<b>Adjust notes:</b>\nSend: <i>"make it shorter" · "more formal" · "focus on action items"</i>\n\n<b>Menu:</b>\n📋 <b>My Notes</b> — Browse meetings\n⚡ <b>Action Board</b> — Open tasks\n📤 <b>Send New Meeting</b> — Tips\n⚙️ <b>Settings</b> — Language & preferences`,

    // Send new meeting
    send_new_meeting: `📤 <b>Send New Meeting</b>\n\nYou can:\n• 🎤 Send a <b>voice message</b>\n• 📁 Send an <b>audio file</b> (MP3, MP4, WAV)\n• 📝 <b>Paste transcript text</b>\n\nThe bot will transcribe and analyze it into structured notes.`,

    // Errors
    error_generic: '❌ An error occurred. Please try again.',

    // Menu button labels
    btn_my_notes:     '📋 My Notes',
    btn_action_board: '⚡ Action Board',
    btn_send_meeting: '📤 Send New Meeting',
    btn_notifications:'🛎 Notifications',
    btn_help:         '❓ Help',
    btn_settings:     '⚙️ Settings',

    // Analysis output language instruction (injected into AI system prompt)
    ai_output_lang: 'Write ALL output fields in clear, professional English.',

    // Adjustment keywords (any of these in a message triggers re-analysis)
    adjustment_keywords: ['make it shorter', 'more formal', 'focus on action', 'make it longer', 'more detailed', 'simplify', 'less formal'],
  },

  ru: {
    choose_language: '🌐 <b>Выберите язык</b>\n\nВыберите язык для сообщений бота и заметок о встречах:',
    language_set: (lang: string) => `✅ Язык установлен: ${lang}.`,

    welcome: (name: string) =>
      `Добро пожаловать, <b>${name}</b>! 👋\n\nЯ превращаю ваши встречи в структурированные заметки.\n\n<b>Отправьте мне:</b>\n• 🎤 Голосовое сообщение или аудиофайл\n• 📝 Текстовую транскрипцию\n\nЯ извлеку резюме, решения и задачи.`,

    initializing:  'Инициализация...',
    downloading:   '⬇️ <b>Загрузка аудио...</b>',
    transcribing:  '🎙️ <b>Транскрибирование...</b>',
    analyzing:     '🤖 <b>Анализ содержимого...</b>',
    saving:        '💾 <b>Сохранение заметок...</b>',

    notes_saved: (count: number) => {
      const word = count === 1 ? 'задача' : count >= 2 && count <= 4 ? 'задачи' : 'задач';
      return count > 0
        ? `✅ <b>Заметки сохранены!</b>\n\n• Извлечено ${count} ${word}\n\nОткройте <b>📋 Мои заметки</b> для просмотра.`
        : '✅ <b>Заметки сохранены!</b>\n\nОткройте <b>📋 Мои заметки</b> для просмотра.';
    },

    no_notes: '📭 <b>Заметок пока нет</b>\n\nОтправьте голосовое сообщение или вставьте текст транскрипции.',
    my_notes_header: (total: number, page: number, totalPages: number) => {
      const word = total === 1 ? 'заметка' : total >= 2 && total <= 4 ? 'заметки' : 'заметок';
      return totalPages > 1
        ? `<b>📋 Мои заметки</b>  <i>страница ${page} из ${totalPages} · всего ${total}</i>`
        : `<b>📋 Мои заметки</b>  <i>${total} ${word}</i>`;
    },
    tap_number: '<i>Нажмите на номер, чтобы открыть заметку.</i>',

    all_done: '✅ <b>Всё готово!</b>\n\nОткрытых задач нет. Отличная работа!',
    action_done: '✅ Отмечено как выполнено!',
    action_done_refresh: '✅ <b>Задача отмечена как выполненная!</b>\n\nНажмите <b>⚡ Доска задач</b> для обновления.',

    settings: (lang: string) => `⚙️ <b>Настройки</b>\n\nТекущий язык: ${lang}\n\nИспользуйте кнопку ниже для изменения.`,
    change_language: '🌐 Изменить язык',

    help: `<b>🤖 AI Meeting Notes — Помощь</b>\n\n<b>Как это работает:</b>\n1. Отправьте голосовое сообщение, аудиофайл или вставьте текст\n2. ИИ транскрибирует и анализирует (~30–60 сек)\n3. Вы получаете структурированный разбор\n\n<b>Корректировка заметок:</b>\nОтправьте: <i>"сделай короче" · "официальнее" · "только задачи" · "подробнее"</i>\n\n<b>Меню:</b>\n📋 <b>Мои заметки</b> — Прошлые встречи\n⚡ <b>Доска задач</b> — Открытые задачи\n📤 <b>Новая встреча</b> — Инструкция\n⚙️ <b>Настройки</b> — Язык и предпочтения`,

    send_new_meeting: `📤 <b>Новая встреча</b>\n\nВы можете:\n• 🎤 Отправить <b>голосовое сообщение</b>\n• 📁 Отправить <b>аудиофайл</b> (MP3, MP4, WAV)\n• 📝 <b>Вставить текст</b> транскрипции\n\nБот транскрибирует и проанализирует его.`,

    error_generic: '❌ Произошла ошибка. Попробуйте ещё раз.',

    btn_my_notes:     '📋 Мои заметки',
    btn_action_board: '⚡ Доска задач',
    btn_send_meeting: '📤 Новая встреча',
    btn_notifications:'🛎 Уведомления',
    btn_help:         '❓ Помощь',
    btn_settings:     '⚙️ Настройки',

    ai_output_lang: 'Пиши ВСЕ поля ответа на чистом профессиональном русском языке.',

    adjustment_keywords: [
      'make it shorter', 'more formal', 'focus on action', 'make it longer', 'more detailed', 'simplify',
      'короче', 'сделай короче', 'официальнее', 'формальнее', 'только задачи', 'подробнее', 'детальнее', 'упрости',
    ],
  },

  uz: {
    choose_language: '🌐 <b>Tilni tanlang</b>\n\nBot xabarlari va uchrashuv eslatmalari uchun til tanlang:',
    language_set: (lang: string) => `✅ Til o'rnatildi: ${lang}.`,

    welcome: (name: string) =>
      `Xush kelibsiz, <b>${name}</b>! 👋\n\nMen sizning uchrashuvlaringizni tuzilgan eslatmalarga aylantiraman.\n\n<b>Menga yuboring:</b>\n• 🎤 Ovozli xabar yoki audio fayl\n• 📝 Matnli transkript\n\nMen xulosa, qarorlar va vazifalarni ajrataman.`,

    initializing:  'Ishga tushirish...',
    downloading:   '⬇️ <b>Audio yuklanmoqda...</b>',
    transcribing:  '🎙️ <b>Transkripsiya qilinmoqda...</b>',
    analyzing:     '🤖 <b>Kontent tahlil qilinmoqda...</b>',
    saving:        '💾 <b>Eslatmalar saqlanmoqda...</b>',

    notes_saved: (count: number) =>
      count > 0
        ? `✅ <b>Eslatmalar saqlandi!</b>\n\n• ${count} ta vazifa ajratildi\n\n<b>📋 Eslatmalarim</b> ni ochib ko'ring.`
        : `✅ <b>Eslatmalar saqlandi!</b>\n\n<b>📋 Eslatmalarim</b> ni ochib ko'ring.`,

    no_notes: '📭 <b>Hali uchrashuvlar eslatmalari yo\'q</b>\n\nBirinchi eslatma yaratish uchun ovozli xabar yuboring yoki matn joylashtiring.',
    my_notes_header: (total: number, page: number, totalPages: number) =>
      totalPages > 1
        ? `<b>📋 Eslatmalarim</b>  <i>${page}/${totalPages}-sahifa · jami ${total}</i>`
        : `<b>📋 Eslatmalarim</b>  <i>${total} ta eslatma</i>`,
    tap_number: '<i>Eslatmani ochish uchun raqamni bosing.</i>',

    all_done: '✅ <b>Hammasi tayyor!</b>\n\nOchiq vazifalar yo\'q. Ajoyib!',
    action_done: '✅ Bajarildi deb belgilandi!',
    action_done_refresh: '✅ <b>Vazifa bajarildi deb belgilandi!</b>\n\nRo\'yxatni yangilash uchun <b>⚡ Vazifalar</b> ni bosing.',

    settings: (lang: string) => `⚙️ <b>Sozlamalar</b>\n\nJoriy til: ${lang}\n\nO'zgartirish uchun tugmani bosing.`,
    change_language: '🌐 Tilni o\'zgartirish',

    help: `<b>🤖 AI Meeting Notes — Yordam</b>\n\n<b>Qanday ishlaydi:</b>\n1. Ovozli xabar, audio fayl yuboring yoki matn joylashtiring\n2. AI transkripsiya va tahlil qiladi (~30–60 soniya)\n3. Tuzilgan xulosa olasiz\n\n<b>Eslatmalarni sozlash:</b>\nYuboring: <i>"qisqartir" · "rasmiyroq" · "faqat vazifalar" · "batafsil"</i>\n\n<b>Menyu:</b>\n📋 <b>Eslatmalarim</b> — O'tgan uchrashuvlar\n⚡ <b>Vazifalar</b> — Ochiq vazifalar\n📤 <b>Yangi uchrashuv</b> — Qo'llanma\n⚙️ <b>Sozlamalar</b> — Til va afzalliklar`,

    send_new_meeting: `📤 <b>Yangi uchrashuv</b>\n\nSiz quyidagilarni yuborishingiz mumkin:\n• 🎤 <b>Ovozli xabar</b>\n• 📁 <b>Audio fayl</b> (MP3, MP4, WAV)\n• 📝 <b>Matnli transkript</b>\n\nBot uni transkripsiya va tahlil qiladi.`,

    error_generic: '❌ Xato yuz berdi. Qayta urinib ko\'ring.',

    btn_my_notes:     '📋 Eslatmalarim',
    btn_action_board: '⚡ Vazifalar',
    btn_send_meeting: '📤 Yangi uchrashuv',
    btn_notifications:'🛎 Bildirishnomalar',
    btn_help:         '❓ Yordam',
    btn_settings:     '⚙️ Sozlamalar',

    ai_output_lang: 'Barcha javob maydonlarini to\'g\'ri, professional o\'zbek tilida yoz.',

    adjustment_keywords: [
      'make it shorter', 'more formal', 'focus on action', 'make it longer', 'more detailed', 'simplify',
      'qisqartir', 'qisqa', 'rasmiyroq', 'rasmiy', 'faqat vazifalar', 'batafsil', 'ko\'proq', 'sodda', 'soddaroq',
    ],
  },
} as const;

export type Tr = typeof T.en;

export function tr(lang: Language): Tr {
  return (T[lang] ?? T.en) as unknown as Tr;
}

// ─── Language selection inline keyboard ────────────────────────────────────────

export function getLanguageKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('🇬🇧 English',    'lang_en')
    .text('🇷🇺 Русский',    'lang_ru')
    .text("🇺🇿 O'zbekcha", 'lang_uz');
}

// ─── Main menu keyboard (language-aware) ───────────────────────────────────────

export function getMenuKeyboard(lang: Language): { text: string }[][] {
  const s = tr(lang);
  return [
    [{ text: s.btn_my_notes },     { text: s.btn_action_board }],
    [{ text: s.btn_send_meeting }, { text: s.btn_notifications }],
    [{ text: s.btn_help },         { text: s.btn_settings }],
  ];
}

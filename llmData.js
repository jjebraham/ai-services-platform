export const llmServices = [
  {
    id: 'chatgpt-plus',
    name: { en: 'ChatGPT Plus', fa: 'چت‌جی‌پی‌تی پلاس' },
    intro: {
      en: 'ChatGPT Plus gives you access to GPT‑4o, OpenAI\'s most advanced model for text, images, and voice interactions.',
      fa: 'چت‌جی‌پی‌تی پلاس به شما دسترسی به GPT-4o، پیشرفته‌ترین مدل OpenAI برای متن، تصویر و تعاملات صوتی می‌دهد.'
    },
    details: {
      en: 'Ideal for professionals, students, and creatives who need a powerful all-in-one assistant.',
      fa: 'ایده‌آل برای متخصصان، دانشجویان و افراد خلاق که به یک دستیار قدرتمند همه‌کاره نیاز دارند.'
    },
    priceUSD: 20,
    unit: { en: 'per month', fa: 'در ماه' },
    rating: 4.9,
    popularity: 95,
    features: {
      en: ['Blazing-fast responses', 'Voice conversation', 'Image analysis', 'File uploads', 'Deep Research mode'],
      fa: ['پاسخ‌های فوق‌العاده سریع', 'مکالمه صوتی', 'تحلیل تصویر', 'آپلود فایل', 'حالت تحقیق عمیق']
    },
    pros: {
      en: [
        'Blazing-fast responses with priority access',
        'Voice conversation, image analysis, and file uploads',
        '"Deep Research" mode for advanced insights',
        'Perfect for multitaskers: chat, analyze, and brainstorm in one place'
      ],
      fa: [
        'پاسخ‌های فوق‌العاده سریع با دسترسی اولویت‌دار',
        'مکالمه صوتی، تحلیل تصویر و آپلود فایل',
        'حالت "تحقیق عمیق" برای بینش‌های پیشرفته',
        'مناسب برای چندکاره‌ها: چت، تحلیل و طوفان فکری در یک مکان'
      ]
    },
    bestFor: {
      en: 'Writers, entrepreneurs, developers, everyday productivity',
      fa: 'نویسندگان، کارآفرینان، توسعه‌دهندگان، بهره‌وری روزانه'
    },
    provider: {
      en: 'OpenAI',
      fa: 'اوپن‌ای‌آی'
    },
    responseTime: {
      en: '< 1s',
      fa: '< ۱ ثانیه'
    },
    icon: '🟦'
  },
  {
    id: 'claude-pro',
    name: { en: 'Claude Pro', fa: 'کلود پرو' },
    intro: {
      en: 'Claude Pro offers unlimited access to Claude 3.5 Sonnet and Claude 3 Opus, known for its human-like reasoning and conversational depth.',
      fa: 'کلود پرو دسترسی نامحدود به Claude 3.5 Sonnet و Claude 3 Opus ارائه می‌دهد که به خاطر استدلال انسان‌مانند و عمق مکالمه شناخته شده است.'
    },
    details: {
      en: 'Great for thoughtful problem solving, coding help, and in-depth content creation.',
      fa: 'عالی برای حل مسائل متفکرانه، کمک کدنویسی و تولید محتوای عمیق.'
    },
    priceUSD: 20,
    unit: { en: 'per month', fa: 'در ماه' },
    rating: 4.8,
    popularity: 85,
    features: {
      en: ['Human-like reasoning', 'File attachments', 'Google Workspace integration', 'Collaborative teammate'],
      fa: ['استدلال انسان‌مانند', 'پیوست فایل', 'ادغام Google Workspace', 'همکار مشارکتی']
    },
    pros: {
      en: [
        'Highly contextual, nuanced conversations',
        'Supports file attachments (PDFs, code files, etc.)',
        'Integrated with tools like Google Workspace',
        'Emulates a collaborative teammate for complex tasks'
      ],
      fa: [
        'مکالمات بسیار زمینه‌ای و ظریف',
        'پشتیبانی از پیوست فایل (PDF، فایل‌های کد و غیره)',
        'ادغام با ابزارهایی مانند Google Workspace',
        'تقلید از یک همکار مشارکتی برای کارهای پیچیده'
      ]
    },
    bestFor: {
      en: 'Researchers, analysts, coders, long-form writers',
      fa: 'محققان، تحلیلگران، برنامه‌نویسان، نویسندگان طولانی'
    },
    provider: {
      en: 'Anthropic',
      fa: 'انتروپیک'
    },
    responseTime: {
      en: '< 2s',
      fa: '< ۲ ثانیه'
    },
    icon: '🟩'
  },
  {
    id: 'gemini-advanced',
    name: { en: 'Gemini Advanced', fa: 'جمنای پیشرفته' },
    intro: {
      en: 'Gemini Advanced combines Google\'s AI with deep integration into your Workspace (Docs, Sheets, Gmail).',
      fa: 'جمنای پیشرفته هوش مصنوعی گوگل را با ادغام عمیق در فضای کاری شما (Docs، Sheets، Gmail) ترکیب می‌کند.'
    },
    details: {
      en: 'It\'s designed for productivity power-users who want an AI deeply connected to their workflow.',
      fa: 'برای کاربران قدرتمند بهره‌وری طراحی شده که هوش مصنوعی عمیقاً متصل به جریان کاری‌شان می‌خواهند.'
    },
    priceUSD: 19.99,
    unit: { en: 'per month', fa: 'در ماه' },
    rating: 4.6,
    popularity: 78,
    features: {
      en: ['Gemini 1.5 Pro', 'Google Workspace integration', '2TB Google Drive', 'Smart summaries'],
      fa: ['جمنای ۱.۵ پرو', 'ادغام Google Workspace', '۲ ترابایت Google Drive', 'خلاصه‌های هوشمند']
    },
    pros: {
      en: [
        'Access to Gemini 1.5 Pro with large context window',
        'Seamless integration with Google Docs, Sheets, Gmail',
        '2 TB Google Drive storage included',
        'AI-enhanced productivity features like smart summaries and autofill'
      ],
      fa: [
        'دسترسی به جمنای ۱.۵ پرو با پنجره زمینه بزرگ',
        'ادغام یکپارچه با Google Docs، Sheets، Gmail',
        '۲ ترابایت فضای ذخیره‌سازی Google Drive شامل',
        'ویژگی‌های بهره‌وری تقویت‌شده با هوش مصنوعی مانند خلاصه‌های هوشمند و تکمیل خودکار'
      ]
    },
    bestFor: {
      en: 'Office professionals, team collaborators, workflow automation',
      fa: 'متخصصان اداری، همکاران تیمی، اتوماسیون جریان کار'
    },
    provider: {
      en: 'Google',
      fa: 'گوگل'
    },
    responseTime: {
      en: '< 2s',
      fa: '< ۲ ثانیه'
    },
    icon: '🟥'
  },
  {
    id: 'perplexity-pro',
    name: { en: 'Perplexity Pro', fa: 'پرپلکسیتی پرو' },
    intro: {
      en: 'Perplexity Pro is a multi-model AI search engine and assistant, giving you access to GPT-4 Omni, Claude 3, Gemini 1.5, and DeepSeek R1 in one subscription.',
      fa: 'پرپلکسیتی پرو یک موتور جستجو و دستیار هوش مصنوعی چندمدله است که در یک اشتراک به GPT-4 Omni، Claude 3، Gemini 1.5 و DeepSeek R1 دسترسی می‌دهد.'
    },
    details: {
      en: 'Perfect for those who want "answers with sources."',
      fa: 'مناسب برای کسانی که "پاسخ‌هایی با منابع" می‌خواهند.'
    },
    priceUSD: 20,
    unit: { en: 'per month', fa: 'در ماه' },
    rating: 4.7,
    popularity: 82,
    features: {
      en: ['Multi-model access', 'Real-time answers', 'File analysis', 'Source citations'],
      fa: ['دسترسی چندمدله', 'پاسخ‌های لحظه‌ای', 'تحلیل فایل', 'استناد منابع']
    },
    pros: {
      en: [
        'Ask complex questions and get cited, real-time answers',
        'Supports file analysis (PDFs, CSVs, images)',
        'Multi-model selection for the best response',
        'Combines AI chat and powerful search in one platform'
      ],
      fa: [
        'سوالات پیچیده بپرسید و پاسخ‌های لحظه‌ای با منبع دریافت کنید',
        'پشتیبانی از تحلیل فایل (PDF، CSV، تصاویر)',
        'انتخاب چندمدله برای بهترین پاسخ',
        'ترکیب چت هوش مصنوعی و جستجوی قدرتمند در یک پلتفرم'
      ]
    },
    bestFor: {
      en: 'Researchers, knowledge workers, AI enthusiasts who want accuracy & sources',
      fa: 'محققان، کارگران دانش، علاقه‌مندان هوش مصنوعی که دقت و منابع می‌خواهند'
    },
    provider: {
      en: 'Perplexity AI',
      fa: 'پرپلکسیتی ای‌آی'
    },
    responseTime: {
      en: '< 3s',
      fa: '< ۳ ثانیه'
    },
    icon: '🟨'
  },
  {
    id: 'supergrok',
    name: { en: 'SuperGrok', fa: 'سوپرگروک' },
    intro: {
      en: 'SuperGrok, powered by Grok 3, offers witty, conversational AI with enhanced reasoning and image generation capabilities.',
      fa: 'سوپرگروک که توسط Grok 3 قدرت می‌گیرد، هوش مصنوعی شوخ‌طبع و مکالمه‌ای با قابلیت‌های استدلال پیشرفته و تولید تصویر ارائه می‌دهد.'
    },
    details: {
      en: 'Grok blends knowledge and humor, making it a unique assistant for creative minds.',
      fa: 'گروک دانش و شوخ‌طبعی را ترکیب می‌کند و آن را به دستیاری منحصربه‌فرد برای ذهن‌های خلاق تبدیل می‌کند.'
    },
    priceUSD: 30,
    unit: { en: 'per month', fa: 'در ماه' },
    rating: 4.4,
    popularity: 72,
    features: {
      en: ['Humorous style', 'Advanced reasoning', 'Image generation', 'Creative personality'],
      fa: ['سبک طنزآمیز', 'استدلال پیشرفته', 'تولید تصویر', 'شخصیت خلاق']
    },
    pros: {
      en: [
        'Grok\'s signature humorous, informal style',
        'Handles advanced reasoning tasks with ease',
        'Supports image generation alongside chat',
        'Built by xAI (Elon Musk\'s AI company)'
      ],
      fa: [
        'سبک طنزآمیز و غیررسمی مخصوص گروک',
        'انجام کارهای استدلال پیشرفته با سهولت',
        'پشتیبانی از تولید تصویر در کنار چت',
        'ساخته شده توسط xAI (شرکت هوش مصنوعی ایلان ماسک)'
      ]
    },
    bestFor: {
      en: 'Innovators, creatives, those seeking a "fun" AI with personality',
      fa: 'نوآوران، خلاقان، کسانی که هوش مصنوعی "سرگرم‌کننده" با شخصیت می‌خواهند'
    },
    provider: {
      en: 'xAI (Elon Musk)',
      fa: 'ایکس‌ای‌آی (ایلان ماسک)'
    },
    responseTime: {
      en: '< 2s',
      fa: '< ۲ ثانیه'
    },
    icon: '🟧'
  }
];

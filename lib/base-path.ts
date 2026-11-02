// على GitHub Pages يُنشر التطبيق تحت /اسم-المستودع، فالمسارات الخام (لا روابط Link) تحتاج هذه البادئة
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const withBasePath = (path: string) => `${BASE_PATH}${path}`;

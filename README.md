# يومياتي

تطبيق ويب إسلامي شخصي، عربي بالكامل (RTL)، يعمل كتطبيق قابل للتثبيت (PWA) وبدون خادم:
مواقيت الصلاة مع التنبيهات والأذان، الأذكار اليومية مع العدّاد والفضل، الورد القرآني وتتبع الختمة، المهام والملاحظات، ولوحة رئيسية تجمع إنجاز اليوم والمتتاليات.

كل البيانات محفوظة في متصفحك (IndexedDB) ولا تُرسل إلى أي خادم. يمكن تصديرها واستيرادها من الإعدادات.

## التشغيل محليًا

```bash
npm install
npm run build
npm start
```

ثم افتح الرابط الذي يظهر في الطرفية. للتطوير: `npm run dev`.

## النشر

كل دفع إلى الفرع `main` يبني التطبيق كموقع ثابت وينشره تلقائيًا على GitHub Pages عبر
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## قيود معروفة

- التنبيهات تعمل والتطبيق مفتوح فقط (المتصفح لا يسمح بجدولة تنبيهات دقيقة في الخلفية بلا خادم).
- قد يمنع المتصفح الصوت حتى تتفاعل مع الصفحة مرة.

## مصادر البيانات

- المواقيت: [Aladhan API](https://aladhan.com/prayer-times-api)
- نص القرآن: [alquran.cloud](https://alquran.cloud/api)
- الأذكار (حصن المسلم): [Islamic-Pro-azkar-API](https://github.com/YousefAsalya/Islamic-Pro-azkar-API) و[Morning-And-Evening-Adhkar-DB](https://github.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB)، كلاهما بترخيص MIT.
- صوت الأذان: [Kiwifu/adhan-mp3](https://github.com/Kiwifu/adhan-mp3).

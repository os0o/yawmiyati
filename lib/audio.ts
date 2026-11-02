import { Howl, Howler } from "howler";
import { withBasePath } from "@/lib/base-path";

export const ADHAN_SRC = withBasePath("/audio/adhan.mp3");

let masterVolume = 0.8;

// يطبّق مستوى الصوت من الإعدادات على الأذان والنغمة معًا
export function setMasterVolume(volume: number) {
  masterVolume = volume;
  Howler.volume(volume);
}

// "load": الملف غير موجود أو تعذر تحميله، "blocked": المتصفح منع التشغيل قبل تفاعل المستخدم
export type AdhanError = "load" | "blocked";

let adhan: Howl | null = null;

// يُنشأ عند الحاجة، وعند فشل التحميل يُصفَّر فيُعاد المحاولة في التشغيل التالي بدل تعطيله للجلسة كلها
function getAdhan(onError: (reason: AdhanError) => void) {
  if (adhan) return adhan;

  const sound: Howl = new Howl({
    src: [ADHAN_SRC],
    html5: true,
    preload: true,
    onloaderror: () => {
      if (adhan === sound) adhan = null;
      onError("load");
    },
    onplayerror: () => {
      // أول تشغيل بعد تفاعل المستخدم يعيد المحاولة تلقائيًا
      sound.once("unlock", () => sound.play());
      onError("blocked");
    },
  });
  adhan = sound;
  return sound;
}

export function playAdhan(onError: (reason: AdhanError) => void = () => {}) {
  const sound = getAdhan(onError);
  if (!sound.playing()) sound.play();
}

export function stopAdhan() {
  adhan?.stop();
}

// نغمة تنبيه قصيرة للمهام تُولَّد بـ Web Audio، فلا تحتاج ملفًا صوتيًا
// إن بقي السياق معلّقًا فالمتصفح منع الصوت لعدم تفاعل المستخدم بعد
export function playChime(onBlocked: () => void = () => {}) {
  if (typeof window === "undefined" || !("AudioContext" in window)) return;
  const ctx = new AudioContext();
  void ctx.resume();
  setTimeout(() => {
    if (ctx.state !== "running") onBlocked();
  }, 300);
  [880, 1175].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + i * 0.25;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    // exponentialRamp لا يقبل الصفر، فنضع حدًا أدنى صغيرًا
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.3 * masterVolume), start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.45);
  });
  setTimeout(() => void ctx.close(), 1000);
}

// رسالة موحدة لأخطاء الأذان، تُستخدم في التنبيه التلقائي والمعاينة
export function adhanErrorToast(reason: AdhanError) {
  return reason === "blocked"
    ? { title: "المتصفح منع تشغيل الأذان", body: "اضغط في أي مكان من الصفحة ليعمل الصوت", snoozable: false }
    : { title: "تعذر تشغيل الأذان", body: `تأكد من وجود الملف ${ADHAN_SRC}`, snoozable: false };
}

export const chimeBlockedToast = {
  title: "المتصفح منع صوت التنبيه",
  body: "اضغط في أي مكان من الصفحة ليعمل الصوت في المرات القادمة",
  snoozable: false,
};

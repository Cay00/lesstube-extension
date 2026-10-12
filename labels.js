/*
 * LessTube – words the content script uses to recognise YouTube's own UI.
 *
 * Some YouTube elements have no stable id or URL (the Share / Save / Clip buttons,
 * the views / date line, the Upload button ...). The only thing that identifies them
 * is their label, and YouTube shows that label in the user's language.
 * Everything language-dependent lives here, one line per language, so a missing
 * language is a one-line fix. Loaded before content.js (see manifest.json).
 *
 * Latin-script languages come first, then ja zh ko hi ar id. The ja/zh/ko/hi/ar/id
 * entries were written from general knowledge of YouTube's wording and have not
 * been checked against every YouTube release. If a button is not recognised in
 * some language, add the label YouTube shows (right-click the button -> Inspect ->
 * aria-label) to the matching line below.
 *
 * Matching rules:
 *  - "exact" lists must equal the whole label (case-insensitive);
 *  - "substring" lists match anywhere in the label;
 *  - numeric words (views, "ago") are anchored to a digit so a video title that
 *    merely contains the word is not mistaken for the views / date line.
 */
(function (global) {
  "use strict";

  // Digits in Latin, Arabic-Indic and Devanagari form.
  const D = "[\\d\\u0660-\\u0669\\u0966-\\u096F]";

  const exact = (parts) => new RegExp("^(?:" + parts.join("|") + ")$", "i");
  const substring = (parts) => new RegExp(parts.join("|"), "i");

  /* ------------------------------------------------------------ watch metadata */

  const VIEWS_RE = substring([
    // pl en de es es fr it pt ru uk nl cs tr
    "wyświetle", "views", "aufrufe", "visualizaciones", "reproducciones", "\\bvues\\b", "visualizzazioni", "visualizações",
    "просмотр", "перегляд", "weergaven", "zhlédnutí", "görüntüleme",
    // ja zh ko hi ar id
    "視聴回数", D + "[^\\d]{0,6}回視聴",
    "[观觀]看次[数數]", "次[观觀]看",
    "조회수\\s*" + D,
    D + "[^\\d]{0,12}(?:बार देखा|बार देखे|व्यू)",
    D + "[^\\d]{0,12}مشاهد",
    D + "[^\\d]{0,10}(?:ditonton|tayangan)",
  ]);

  const DATE_RE = substring([
    // pl en de es fr it pt ru uk nl cs tr
    "\\btemu\\b", "\\bago\\b", "\\bvor\\b", "\\bhace\\b", "il y a", "\\bfa\\b", "\\bhá\\b", "назад", "тому", "geleden", "\\bpřed\\b", "önce",
    "premier", "opublikowan", "streamed", "emisj",
    // ja zh ko hi ar id: "2 days ago" patterns
    D + "\\s*(?:秒|分|時間|日|週間|か月|ヶ月|年)前",
    D + "\\s*(?:秒|分钟|分鐘|小时|小時|天|周|週|个月|個月|年)前",
    D + "\\s*(?:초|분|시간|일|주|개월|년)\\s*전",
    D + "[^\\d]{0,12}पहले",
    "(?:منذ|قبل)\\s*(?:" + D + "|يوم|ساعة|دقيقة|أسبوع|شهر|سنة|عام)",
    "yang lalu",
  ]);

  // Fixed dates: "5 Jan 2024", "Jan 5, 2024", "2024年1月5日", "2024. 1. 5.", "2024/01/05".
  const ABS_DATE_RE = /^(?:\p{Nd}{1,2}\s+[\p{L}\p{M}.\u0970]+\s+\p{Nd}{4}|[\p{L}\p{M}.\u0970]+\s+\p{Nd}{1,2},\s+\p{Nd}{4}|\p{Nd}{4}年\s*\p{Nd}{1,2}月\s*\p{Nd}{1,2}日|\p{Nd}{4}[./]\s*\p{Nd}{1,2}[./]\s*\p{Nd}{1,2}\.?)$/u;

  const LICENSE_RE = substring([
    "licencja", "license", "licence", "lizenz", "licencia", "licenza", "licença", "kategoria", "category", "kategorie", "categoría",
    "catégorie", "categoria", "lokalizacja", "location", "creative commons",
    "ライセンス", "カテゴリ", "许可|授權|授权|类别|類別", "라이선스|카테고리", "लाइसेंस|श्रेणी", "ترخيص|الفئة", "lisensi|kategori",
  ]);

  /* ------------------------------------------------------------ watch actions */

  const FUND_RE = substring([
    "zbiórk", "fundraiser", "donate", "darowizn", "spenden", "donar", "faire un don",
    "募金|寄付", "募捐|捐款|筹款|籌款", "모금|기부", "दान|चंदा", "تبرع", "donasi|penggalangan dana",
  ]);

  const MORE_CHANNEL_RE = substring([
    "więcej z tego kanału", "more videos", "more from this channel", "from this channel",
    "mehr von diesem kanal", "más de este canal", "plus de cette chaîne", "mais deste canal", "ещё с этого канала|больше с этого канала",
    "このチャンネルの(?:その他|他)", "[此该該]频?道的更多|此頻道的更多", "이 채널의 (?:다른|더)", "इस चैनल (?:के|से) (?:और|अन्य)",
    "المزيد من هذه القناة", "lainnya dari channel ini|video lain dari channel ini",
  ]);

  const ACTION_RULES = [
    ["subscribe", exact([
      "subskrybuj", "subscribe", "subskrybujesz", "subscribed", "abonnieren", "suscribirse", "s'abonner", "iscriviti", "inscrever-se",
      "подписаться", "підписатися", "abonneren", "odebírat", "abone ol",
      "チャンネル登録|登録済み", "订阅|訂閱|已订阅|已訂閱", "구독|구독 ?중", "सदस्यता लें|सदस्यता ली गई", "اشتراك|مشترك", "berlangganan|disubscribe",
    ])],
    ["join", exact([
      "dołącz", "join", "beitreten", "unirse", "rejoindre", "unisciti", "participar", "присоединиться", "приєднатися", "word lid",
      "přidat se", "katıl",
      "メンバーになる|参加", "加入", "가입", "जुड़ें", "انضمام|انضم", "gabung|bergabung",
    ])],
    ["share", exact([
      "udostępnij", "share", "teilen", "compartir", "partager", "condividi", "compartilhar", "поделиться", "поділитися", "delen",
      "sdílet", "paylaş",
      "共有", "分享", "공유", "शेयर करें|शेयर", "مشاركة", "bagikan",
    ])],
    ["download", exact([
      "pobierz", "download", "herunterladen", "descargar", "télécharger", "scarica", "baixar", "скачать", "завантажити", "downloaden",
      "stáhnout", "indir",
      "ダウンロード|オフライン", "下载|下載", "다운로드|오프라인 저장", "डाउनलोड(?: करें)?", "تنزيل", "unduh",
    ])],
    ["save", exact([
      "zapisz", "save", "speichern", "guardar", "enregistrer", "salva", "salvar", "сохранить", "зберегти", "opslaan", "uložit", "kaydet",
      "保存", "儲存", "저장", "सेव(?: करें)?|सहेजें", "حفظ", "simpan",
    ])],
    ["clip", exact([
      "klip", "clip", "ausschnitt", "recortar", "ritaglia", "criar clipe", "клип", "кліп", "knipsel",
      "クリップ", "剪辑|剪輯", "클립", "क्लिप", "مقطع", "klip",
    ])],
    ["thanks", substring([
      "super thanks", "podziękuj", "\\bthanks\\b", "danke", "gracias", "merci", "grazie", "obrigado", "спасибо", "дякую",
      "ありがとう", "谢谢|謝謝", "감사", "धन्यवाद", "شكر", "terima kasih",
    ])],
    ["notify", substring([
      "powiadom", "notification", "benachrichtig", "notificaci", "notifica",
      "уведомлен", "通知", "알림", "सूचना", "إشعار", "notifikasi|pemberitahuan",
    ])],
    ["offers", exact([
      "towary", "bilety", "oferty", "merch", "tickets", "offers",
      "merchandise", "tiket", "グッズ|チケット", "商品|门票|門票", "상품|티켓",
    ])],
    ["ask", exact([
      "ask", "zapytaj", "fragen", "preguntar", "demander", "chiedi", "perguntar", "спросить", "запитати", "vraag", "zeptat se", "sor",
      "質問", "提问|提問", "질문", "पूछें", "اسأل", "tanya",
    ])],
  ];

  /* ------------------------------------------------------------ masthead / transcript */

  const UPLOAD_RE = exact([
    "prześlij", "przeslij", "utwórz", "utworz", "create", "upload", "erstellen", "hochladen", "crear", "subir", "créer", "crea", "carica",
    "criar", "enviar", "создать", "загрузить", "створити", "завантажити", "maken", "uploaden", "vytvořit", "nahrát", "oluştur", "yükle",
    "作成|アップロード", "创建|創建|上传|上傳|新建", "만들기|업로드", "बनाएं|अपलोड", "إنشاء|تحميل|رفع", "buat|unggah",
  ]);

  const TRANSCRIPT_RE = substring([
    "transkrypc", "transcript", "transkript", "transcripci", "transcrizione", "transcrição", "расшифровк", "транскрипц",
    "文字起こし", "转录|轉錄|文字记录|文字記錄", "스크립트|대본", "ट्रांसक्रिप्ट|प्रतिलेख", "النص المكتوب|نص الفيديو", "transkrip",
  ]);

  /* ------------------------------------------------------------ left-menu "Show more / less" */

  // Fallback only: the button is found by its id first (see content.js). Compared in lower case.
  const SHOW_MORE = [
    "pokaż więcej", "show more", "mehr anzeigen", "mostrar más", "afficher plus", "mostrar mais", "ещё", "показать ещё",
    "もっと見る", "展开", "显示更多", "顯示更多", "더보기", "और दिखाएं", "عرض المزيد", "tampilkan lainnya",
  ];
  const SHOW_LESS = [
    "pokaż mniej", "show less", "weniger anzeigen", "mostrar menos", "afficher moins", "свернуть", "показать меньше",
    "表示を減らす", "收起", "显示较少", "顯示較少", "간략히 보기", "접기", "कम दिखाएं", "عرض أقل", "tampilkan lebih sedikit",
  ];

  global.YTC_LABELS = {
    VIEWS_RE, DATE_RE, ABS_DATE_RE, LICENSE_RE, FUND_RE, MORE_CHANNEL_RE, ACTION_RULES, UPLOAD_RE, TRANSCRIPT_RE, SHOW_MORE, SHOW_LESS,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = global.YTC_LABELS;
})(typeof globalThis !== "undefined" ? globalThis : this);

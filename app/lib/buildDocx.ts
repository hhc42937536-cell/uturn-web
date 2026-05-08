import {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, PageBreak, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, VerticalAlign,
  convertInchesToTwip,
} from "docx";
import { saveAs } from "file-saver";

export type DayNote = {
  morning: string;
  afternoon: string;
  evening: string;
  food: string;
  note: string;
};

export type DocxFormData = {
  destination: string;
  depCity: string;
  arrAirport?: string;
  depDate: string;
  retDate: string;
  people: string;
  budget: string;
  style: string;
  mustVisit?: string;
  memo: string;
};

// ── 靜態資料 ─────────────────────────────────────────────

export const VISA_NOTE: Record<string, string> = {
  首爾: "免簽 90 天，入境前請確認 K-ETA 申請狀態（約 NT$100，72 小時前申請）",
  釜山: "免簽 90 天，入境前請確認 K-ETA 申請狀態",
  東京: "免簽 90 天，建議出發前透過 Visit Japan Web 預先登錄入境資料",
  大阪: "免簽 90 天，建議出發前透過 Visit Japan Web 預先登錄入境資料",
  沖繩: "免簽 90 天，建議出發前透過 Visit Japan Web 預先登錄入境資料",
  曼谷: "免簽 60 天，入境時填寫 TM.6 入境卡，超過 30 天建議辦落地簽",
  新加坡: "免簽 30 天，入境前 3 天須填寫 SG Arrival Card（免費線上申請）",
  香港: "免簽 30 天（BNO 持有者另計），入境時海關可能詢問停留目的",
  胡志明市: "免簽 45 天，亦可申請 E-Visa 最長 90 天（費用約 USD 25）",
  吉隆坡: "免簽 90 天，入境 KLIA 或 KLIA2 前確認航廈，部分廉航在 KLIA2",
  馬尼拉: "免簽 30 天，持台灣護照入境菲律賓不需簽證，超過 30 天需辦延簽",
  宿霧: "免簽 30 天，同馬尼拉規定，超過 30 天需辦延簽",
  峇里島: "落地簽 30 天（USD 35），可延簽 1 次；入境有嚴格毒品管制",
  雅加達: "落地簽 30 天（USD 35），可延簽 1 次",
  澳門: "免簽 30 天，澳門幣與港幣 1:1 等值",
  上海: "需辦理中國簽證，台灣護照可申請 1-5 年多次入境；持有效多次美/英/申根簽可走 144 小時過境免簽",
  北京: "需辦理中國簽證，台灣護照可申請 1-5 年多次入境",
  廣州: "需辦理中國簽證，持有效多次美/英/申根簽可走 144 小時過境免簽",
  河內: "免簽 45 天，亦可申請 E-Visa 最長 90 天（費用約 USD 25）",
  峴港: "免簽 45 天，同越南規定",
  清邁: "免簽 60 天，同曼谷規定",
  普吉島: "免簽 60 天，同曼谷規定",
  亞庇: "免簽 90 天，同吉隆坡規定",
  蘭卡威: "免簽 90 天，同吉隆坡規定",
  檳城: "免簽 90 天，同吉隆坡規定",
  金邊: "落地簽 30 天（USD 35）或線上申請 E-Visa",
  暹粒: "落地簽 30 天（USD 35）或線上申請 E-Visa",
  福岡: "免簽 90 天，同日本規定，建議出發前完成 Visit Japan Web 登錄",
  札幌: "免簽 90 天，同日本規定，建議出發前完成 Visit Japan Web 登錄",
  名古屋: "免簽 90 天，同日本規定，建議出發前完成 Visit Japan Web 登錄",
  濟州: "免簽 90 天，同韓國規定，需確認 K-ETA 申請狀態",
  杜拜: "落地簽 30 天（免費），入境前確認護照效期 6 個月以上",
  倫敦: "需申請英國電子旅行授權 ETA（約 GBP 10），3 年多次入境效期",
  巴黎: "需申請 ETIAS（2025 年底實施），免簽 90 天",
  羅馬: "需申請 ETIAS（2025 年底實施），免簽 90 天",
  巴塞隆納: "需申請 ETIAS（2025 年底實施），免簽 90 天",
  雪梨: "需申請電子旅行授權 ETA（AUD 20），最長 12 個月多次入境",
  紐約: "需申請 ESTA（USD 21），效期 2 年",
  洛杉磯: "需申請 ESTA（USD 21），效期 2 年",
  溫哥華: "需申請 eTA（CAD 7），效期 5 年",
  多倫多: "需申請 eTA（CAD 7），效期 5 年",
  關島: "免簽 45 天（CNMI 免簽計畫），入境前填寫 Guam Visitor Pledge",
  帛琉: "落地簽 30 天（USD 50），入境時簽署帛琉誓約書（環保承諾）",
};

export const EMERGENCY: Record<string, string[]> = {
  首爾: ["台灣駐韓代表部（首爾）：+82-2-399-2780", "韓國警察報案：112", "韓國急救：119"],
  釜山: ["台灣駐韓代表部（首爾）：+82-2-399-2780", "韓國警察：112", "急救：119"],
  東京: ["台北駐日經濟文化代表處（東京）：+81-3-3280-7811", "日本警察：110", "急救救火：119"],
  大阪: ["台北駐大阪經濟文化辦事處：+81-6-6443-8481", "日本警察：110", "急救救火：119"],
  沖繩: ["台北駐那霸辦事處：+81-98-862-7008", "日本警察：110", "急救救火：119"],
  曼谷: ["台北經濟文化辦事處（曼谷）：+66-2-610-4000", "泰國警察：191", "急救：1669"],
  新加坡: ["台北代表處（新加坡）：+65-6590-9600", "新加坡警察：999", "急救：995"],
  香港: ["台灣旅遊交流辦事處：+852-2525-2515", "香港警察：999", "急救：999"],
  胡志明市: ["台北經濟文化辦事處（胡志明市）：+84-28-3825-2525", "越南警察：113", "急救：115"],
  吉隆坡: ["台北經濟文化辦事處（吉隆坡）：+60-3-2161-8684", "馬來西亞警察：999", "急救：999"],
  馬尼拉: ["台北經濟文化辦事處（馬尼拉）：+63-2-8887-6061", "菲律賓警察：911", "急救：911"],
  宿霧: ["台北經濟文化辦事處（馬尼拉）：+63-2-8887-6061", "菲律賓警察：911", "急救：911"],
  峇里島: ["台北經濟文化辦事處（雅加達）：+62-21-5201-5200", "印尼警察：110", "急救：118"],
  雅加達: ["台北經濟文化辦事處（雅加達）：+62-21-5201-5200", "印尼警察：110", "急救：118"],
  澳門: ["台灣旅遊交流辦事處（澳門）：+853-2830-6289", "澳門警察：999", "急救：999"],
  上海: ["台北經濟文化辦事處（上海）：+86-21-6278-0800", "中國警察：110", "急救：120"],
  北京: ["台北經濟文化辦事處（北京）：+86-10-6532-1919", "中國警察：110", "急救：120"],
  廣州: ["台北經濟文化辦事處（廣州）：+86-20-8360-7744", "中國警察：110", "急救：120"],
  河內: ["台北經濟文化辦事處（河內）：+84-24-3936-5581", "越南警察：113", "急救：115"],
  峴港: ["台北經濟文化辦事處（胡志明市）：+84-28-3825-2525", "越南警察：113", "急救：115"],
  清邁: ["台北經濟文化辦事處（清邁）：+66-53-263-322", "泰國警察：191", "急救：1669"],
  普吉島: ["台北經濟文化辦事處（曼谷）：+66-2-610-4000", "泰國警察：191", "急救：1669"],
  亞庇: ["台北經濟文化辦事處（吉隆坡）：+60-3-2161-8684", "警察：999", "急救：999"],
  蘭卡威: ["台北經濟文化辦事處（吉隆坡）：+60-3-2161-8684", "警察：999", "急救：999"],
  檳城: ["台北經濟文化辦事處（吉隆坡）：+60-3-2161-8684", "警察：999", "急救：999"],
  金邊: ["駐柬埔寨台北經貿辦事處：+855-23-999-875", "柬埔寨警察：117", "急救：119"],
  暹粒: ["駐柬埔寨台北經貿辦事處：+855-23-999-875", "警察：117", "急救：119"],
  福岡: ["台北駐大阪經濟文化辦事處（轄福岡）：+81-6-6443-8481", "日本警察：110", "急救：119"],
  札幌: ["台北駐日經濟文化代表處（東京）：+81-3-3280-7811", "日本警察：110", "急救：119"],
  名古屋: ["台北駐日經濟文化代表處（東京）：+81-3-3280-7811", "日本警察：110", "急救：119"],
  濟州: ["台灣駐韓代表部（首爾）：+82-2-399-2780", "韓國警察：112", "急救：119"],
  杜拜: ["台北商務辦事處（杜拜）：+971-4-340-0558", "阿聯警察：999", "急救：998"],
  關島: ["美國在台協會（台北）：+886-2-2162-2000（緊急）", "警察：911", "急救：911"],
  帛琉: ["美國在台協會（台北）：+886-2-2162-2000（緊急）", "帛琉警察：488-2526", "急救：488-1411"],
};

export const CUSTOMS: Record<string, string[]> = {
  首爾: ["超過 USD 10,000 現金須申報", "禁止攜帶肉品及蔬果入境", "酒類免稅限 1 公升，菸草免稅限 200 支"],
  釜山: ["超過 USD 10,000 現金須申報", "禁止攜帶肉品及蔬果入境"],
  東京: ["超過 JPY 1,000,000 現金須申報", "禁帶未熟果蔬、肉品（含香腸）", "進口藥品需提前申請"],
  大阪: ["超過 JPY 1,000,000 現金須申報", "禁帶未熟果蔬、肉品", "進口藥品需提前申請"],
  沖繩: ["同日本本島規定", "攜帶手信類貝殼、珊瑚需注意華盛頓公約"],
  曼谷: ["超過 USD 15,000 現金須申報", "禁止攜帶電子菸，違者可處罰款或拘留", "禁止攜帶佛像出境"],
  新加坡: ["禁止攜帶口香糖", "電子菸、水菸嚴格禁止", "藥品需附醫師處方"],
  香港: ["超過 HKD 120,000 現金須申報", "電子菸自 2023 年起全面禁止"],
  胡志明市: ["超過 USD 5,000 現金須申報", "禁帶外來植物種子", "禁帶宗教宣傳品"],
  吉隆坡: ["毒品走私可判死刑（零容忍）", "禁止攜帶豬肉相關產品進入穆斯林地區", "超過 MYR 10,000 現金須申報"],
  馬尼拉: ["毒品持有零容忍（法律嚴苛）", "香菸限 2 條免稅", "超過 PHP 10,000 或等值外幣須申報"],
  宿霧: ["毒品持有零容忍", "香菸限 2 條免稅", "超過 PHP 10,000 現金須申報"],
  峇里島: ["毒品攜帶可判死刑（印尼法律）", "禁止攜帶新鮮蔬果入境", "禁止攜帶宗教書籍外觀物品"],
  雅加達: ["毒品攜帶可判死刑", "禁止攜帶豬肉相關產品（穆斯林國家）", "禁止攜帶色情品"],
  澳門: ["賭場入場年齡限制 21 歲", "超過 MOP 120,000 現金須申報", "電子菸自 2023 年起管制"],
  上海: ["禁止攜帶台灣出版品含政治敏感內容", "超過 USD 5,000 現金須申報", "禁止攜帶新鮮蔬果肉品"],
  北京: ["禁止攜帶台灣出版品含政治敏感內容", "超過 USD 5,000 現金須申報", "禁止攜帶新鮮蔬果肉品"],
  廣州: ["超過 USD 5,000 現金須申報", "禁止攜帶蔬果肉品", "禁止攜帶政治敏感出版品"],
  河內: ["超過 USD 5,000 現金須申報", "禁帶外來植物種子", "禁帶宗教宣傳品"],
  峴港: ["同越南規定，超過 USD 5,000 現金須申報", "禁帶植物種子及新鮮蔬果"],
  清邁: ["禁止攜帶電子菸（罰款 + 拘留）", "禁止攜帶佛像出境", "超過 USD 15,000 現金須申報"],
  普吉島: ["禁止攜帶電子菸（罰款 + 拘留）", "禁止攜帶佛像出境", "超過 USD 15,000 現金須申報"],
  亞庇: ["毒品走私可判死刑", "禁止攜帶豬肉相關產品進入穆斯林地區", "超過 MYR 10,000 現金須申報"],
  蘭卡威: ["毒品走私可判死刑", "蘭卡威為免稅島，酒類在島內購買較便宜", "超過 MYR 10,000 現金須申報"],
  檳城: ["毒品走私可判死刑", "禁止攜帶豬肉相關產品進入穆斯林地區", "超過 MYR 10,000 現金須申報"],
  金邊: ["毒品持有嚴格管制", "超過 USD 10,000 現金須申報", "禁止攜帶武器及色情品"],
  暹粒: ["毒品持有嚴格管制", "超過 USD 10,000 現金須申報", "禁止帶走吳哥窟文物"],
  福岡: ["超過 JPY 1,000,000 現金須申報", "禁帶未熟果蔬、肉品", "進口藥品需提前申請"],
  札幌: ["超過 JPY 1,000,000 現金須申報", "禁帶未熟果蔬、肉品", "進口藥品需提前申請"],
  名古屋: ["超過 JPY 1,000,000 現金須申報", "禁帶未熟果蔬、肉品", "進口藥品需提前申請"],
  濟州: ["超過 USD 10,000 現金須申報", "禁止攜帶肉品及蔬果入境", "酒類免稅限 1 公升"],
  杜拜: ["禁止攜帶豬肉、酒精（公共場所）", "電子菸在杜拜合法但需購買當地品牌", "超過 AED 60,000 現金須申報"],
  關島: ["禁止攜帶蔬果肉品（美國農業規定）", "超過 USD 10,000 現金須申報"],
  帛琉: ["禁止攜帶珊瑚礁及海洋生物出境（帛琉誓約）", "超過 USD 10,000 現金須申報"],
};

const PACKING: Record<string, string[][]> = {
  韓國: [
    ["證件類", "護照、備份身分證、台幣/韓元現金、信用卡（Visa/Master）、T-money 交通卡"],
    ["衣物類", "依季節準備（冬季需厚外套+保暖內層）、舒適步行鞋"],
    ["電子產品", "手機+充電器、行動電源（≤27,000mAh）、A 型轉接頭（韓國插座）"],
    ["健康與衛生", "常備藥（感冒、腸胃、過敏）、防曬、口罩"],
    ["旅遊必備", "旅遊保險證明、緊急聯絡清單、Kakao T / Naver Map APP"],
  ],
  日本: [
    ["證件類", "護照、備份身分證、日幣現金（日本現金用量大）、Suica/PASMO 交通卡"],
    ["衣物類", "依季節準備、舒適步行鞋、便攜雨傘（日本常下雨）"],
    ["電子產品", "手機+充電器、行動電源（≤27,000mAh）、A 型轉接頭（日本插座）"],
    ["健康與衛生", "常備藥、防曬、口罩（日本口罩文化）"],
    ["旅遊必備", "旅遊保險、Visit Japan Web 登錄完成截圖、Google Maps / Yahoo 乗換案内 APP"],
  ],
  東南亞: [
    ["證件類", "護照、備份身分證、美金/當地現金、信用卡"],
    ["衣物類", "輕薄透氣衣物、薄外套（冷氣很強）、防水拖鞋"],
    ["電子產品", "手機+充電器（防水袋保護）、行動電源"],
    ["健康與衛生", "防蚊液（必備）、腸胃藥、止瀉藥、防曬、濕紙巾"],
    ["旅遊必備", "旅遊保險（含醫療）、當地 SIM 卡（機場買）、Grab APP"],
  ],
};

function getPackingList(destination: string): string[][] {
  const korea = ["首爾", "釜山", "濟州"];
  const japan = ["東京", "大阪", "沖繩", "福岡", "札幌", "名古屋"];
  if (korea.includes(destination)) return PACKING["韓國"];
  if (japan.includes(destination)) return PACKING["日本"];
  return PACKING["東南亞"];
}

// ── 顏色常數 ─────────────────────────────────────────────
const C = {
  primary:  "3A2E26",
  accent:   "A86F5A",
  accentLt: "F0E6DF",
  light:    "FDF6ED",
  section:  "F5F1EA",
  gray:     "8A7F73",
  border:   "D8D2C7",
  text:     "4B4037",
  white:    "FFFFFF",
  muted:    "CCBBAA",
  // 時段左欄底色（淡色，僅用在 icon/label 欄）
  morning:  "FEF3E8",
  afternoon:"EAF3FE",
  evening:  "F0EAF8",
  food:     "E8F5E8",
  note:     "F5F1EA",
};

// ── 日期輔助 ─────────────────────────────────────────────

function fmtDate(s: string) {
  if (!s) return "";
  const d = new Date(s + "T00:00:00");
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(dateStr: string, n: number) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
function getWeekday(dateStr: string) {
  if (!dateStr) return "";
  return `週${WEEKDAYS[new Date(dateStr + "T00:00:00").getDay()]}`;
}

// ── 邊框輔助 ─────────────────────────────────────────────

const NO_BORDER = {
  top:    { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left:   { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right:  { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

const THIN_BORDER = {
  top:    { style: BorderStyle.SINGLE, size: 4, color: C.border },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: C.border },
  left:   { style: BorderStyle.SINGLE, size: 4, color: C.border },
  right:  { style: BorderStyle.SINGLE, size: 4, color: C.border },
};

// ── Section 標題 ─────────────────────────────────────────

function h2(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: C.accent, font: "微軟正黑體" })],
    spacing: { before: 360, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.accent } },
  });
}

function h3(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color: C.text, font: "微軟正黑體" })],
    spacing: { before: 200, after: 80 },
  });
}

function body(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, color: C.text, font: "微軟正黑體" })],
    spacing: { before: 40, after: 40 },
    indent: { left: convertInchesToTwip(0.15) },
  });
}

function bullet(text: string) {
  return new Paragraph({
    children: [new TextRun({ text: `• ${text}`, size: 20, color: C.text, font: "微軟正黑體" })],
    indent: { left: convertInchesToTwip(0.3) },
    spacing: { before: 50, after: 50 },
  });
}

function spacer(pt = 120) {
  return new Paragraph({ children: [new TextRun("")], spacing: { before: pt, after: 0 } });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ── 封面頁（Table 實作，確保全頁深色背景） ───────────────

function buildCover(form: DocxFormData, dateRange: string): Table {
  const coverRow = (content: Paragraph[]) =>
    new TableRow({
      children: [
        new TableCell({
          borders: NO_BORDER,
          shading: { type: ShadingType.SOLID, fill: C.primary },
          children: content,
        }),
      ],
    });

  const cp = (text: string, opts: {
    size?: number; bold?: boolean; color?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    before?: number; after?: number;
  } = {}) =>
    new Paragraph({
      children: [new TextRun({
        text,
        size: opts.size ?? 20,
        bold: opts.bold,
        color: opts.color ?? C.white,
        font: "微軟正黑體",
      })],
      alignment: opts.align ?? AlignmentType.CENTER,
      spacing: { before: opts.before ?? 60, after: opts.after ?? 60 },
    });

  const infoRows: Paragraph[] = [
    cp(""),
    cp(`✈️  出發城市　${form.depCity}`, { color: C.muted }),
    ...(form.arrAirport ? [cp(`🛬  抵達機場　${form.arrAirport}`, { color: C.muted })] : []),
    cp(`👤  出行人數　${form.people} 人`, { color: C.muted }),
    ...(form.budget ? [cp(`💰  旅遊預算　${form.budget}`, { color: C.muted })] : []),
    ...(form.style  ? [cp(`🎯  旅遊風格　${form.style}`,  { color: C.muted })] : []),
    cp(""),
    cp("", { before: 0, after: 400 }),
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: NO_BORDER,
    rows: [
      coverRow([
        cp("TRAVEL PLAN", { size: 18, color: "7A6A5A", before: 600, after: 80 }),
        cp(`${form.destination}　旅遊計畫書`, { size: 52, bold: true, before: 80, after: 100 }),
        cp(dateRange, { size: 28, color: C.muted, before: 0, after: 240 }),
        ...infoRows,
        cp("由 出國優轉 AbroadUturn 計畫書工作室製作", { size: 16, color: "5A5050", before: 60, after: 600 }),
      ]),
    ],
  });
}

// ── 每日行程卡片（Table 實作） ────────────────────────────

const DAY_COLORS = ["4A3828", "2A4A6A", "2A5A3A", "5A2A5A", "3A5A2A", "5A4A2A", "2A2A5A"];

function slotCell(icon: string, label: string, value: string, bg: string): TableRow {
  return new TableRow({
    children: [
      // 左欄：icon + label
      new TableCell({
        width: { size: 18, type: WidthType.PERCENTAGE },
        borders: NO_BORDER,
        shading: { type: ShadingType.SOLID, fill: bg },
        verticalAlign: VerticalAlign.TOP,
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: icon, size: 22, font: "微軟正黑體" }),
              new TextRun({ text: `\n${label}`, size: 16, bold: true, color: C.gray, font: "微軟正黑體" }),
            ],
            spacing: { before: 100, after: 100 },
            indent: { left: convertInchesToTwip(0.15) },
          }),
        ],
      }),
      // 右欄：內容（白底，文字清晰）
      new TableCell({
        width: { size: 82, type: WidthType.PERCENTAGE },
        borders: { ...NO_BORDER, left: { style: BorderStyle.SINGLE, size: 6, color: bg } },
        shading: { type: ShadingType.SOLID, fill: C.white },
        verticalAlign: VerticalAlign.TOP,
        children: [
          new Paragraph({
            children: [new TextRun({ text: value || "—", size: 20, color: value ? C.text : "BBBBBB", font: "微軟正黑體" })],
            spacing: { before: 80, after: 80 },
            indent: { left: convertInchesToTwip(0.15) },
          }),
        ],
      }),
    ],
  });
}

function buildDayCard(day: DayNote, index: number, totalDays: number, depDate: string): (Table | Paragraph)[] {
  const dateStr = addDays(depDate, index);
  const dayLabel =
    index === 0 ? `Day 1  ·  抵達日` :
    index === totalDays - 1 ? `Day ${index + 1}  ·  返程日` :
    `Day ${index + 1}`;
  const dateLabel = dateStr ? `${fmtDate(dateStr)}（${getWeekday(dateStr)}）` : "";
  const headerColor = DAY_COLORS[index % DAY_COLORS.length];

  const headerRow = new TableRow({
    children: [
      new TableCell({
        columnSpan: 2,
        borders: NO_BORDER,
        shading: { type: ShadingType.SOLID, fill: headerColor },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: `  ${dayLabel}`, bold: true, size: 22, color: C.white, font: "微軟正黑體" }),
              new TextRun({ text: `    ${dateLabel}`, size: 18, color: "CCCCCC", font: "微軟正黑體" }),
            ],
            spacing: { before: 120, after: 120 },
          }),
        ],
      }),
    ],
  });

  const hasContent = [day.morning, day.afternoon, day.evening, day.food].some(v => v.trim());

  const slots: TableRow[] = hasContent
    ? [
        slotCell("🌅", "上午", day.morning, C.morning),
        slotCell("☀️", "下午", day.afternoon, C.afternoon),
        slotCell("🌙", "晚上", day.evening, C.evening),
        slotCell("🍜", "美食", day.food, C.food),
        ...(day.note?.trim() ? [slotCell("📝", "備忘", day.note, C.note)] : []),
      ]
    : [
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              borders: NO_BORDER,
              shading: { type: ShadingType.SOLID, fill: "FAFAFA" },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "（本日行程尚未填寫）", size: 19, color: "BBBBBB", italics: true, font: "微軟正黑體" })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 160, after: 160 },
                }),
              ],
            }),
          ],
        }),
      ];

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: THIN_BORDER,
    rows: [headerRow, ...slots],
  });

  return [table, spacer(100)];
}

// ── 打包清單表格 ─────────────────────────────────────────

function buildPackingTable(rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: THIN_BORDER,
    rows: rows.map(([cat, items], i) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 22, type: WidthType.PERCENTAGE },
            borders: NO_BORDER,
            shading: { type: ShadingType.SOLID, fill: i % 2 === 0 ? "EDE6DC" : "F5F0E8" },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                children: [new TextRun({ text: cat, bold: true, size: 19, color: C.accent, font: "微軟正黑體" })],
                indent: { left: convertInchesToTwip(0.15) },
                spacing: { before: 100, after: 100 },
              }),
            ],
          }),
          new TableCell({
            width: { size: 78, type: WidthType.PERCENTAGE },
            borders: { ...NO_BORDER, left: { style: BorderStyle.SINGLE, size: 2, color: C.border } },
            shading: { type: ShadingType.SOLID, fill: i % 2 === 0 ? C.white : "FFFDF8" },
            children: [
              new Paragraph({
                children: [new TextRun({ text: items, size: 19, color: C.text, font: "微軟正黑體" })],
                indent: { left: convertInchesToTwip(0.15) },
                spacing: { before: 100, after: 100 },
              }),
            ],
          }),
        ],
      })
    ),
  });
}

// ── 主函式 ───────────────────────────────────────────────

export async function buildAndDownloadDocx(form: DocxFormData, days: DayNote[]) {
  const visa = VISA_NOTE[form.destination] ?? "請出發前確認最新簽證規定。";
  const emergency = EMERGENCY[form.destination] ?? ["請查詢外交部領事事務局官網：www.boca.gov.tw"];
  const customs = CUSTOMS[form.destination] ?? ["請至目的地海關官網確認最新規定。"];
  const packing = getPackingList(form.destination);
  const dateRange = `${fmtDate(form.depDate)} – ${fmtDate(form.retDate)}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const children: any[] = [];

  // ── 封面頁 ──────────────────────────────────────────
  children.push(buildCover(form, dateRange));
  children.push(pageBreak());

  // ── 簽證 & 海關 ──────────────────────────────────────
  children.push(h2("🛂  簽證 & 海關資訊"));
  children.push(h3("簽證說明"));
  children.push(body(visa));
  children.push(spacer(40));
  children.push(h3("海關注意事項"));
  for (const item of customs) children.push(bullet(item));
  children.push(spacer(40));
  children.push(h3("緊急聯絡資訊"));
  for (const line of emergency) children.push(bullet(line));
  children.push(pageBreak());

  // ── 每日行程 ─────────────────────────────────────────
  children.push(h2("📅  每日行程"));
  children.push(spacer(40));
  for (let i = 0; i < days.length; i++) {
    children.push(...buildDayCard(days[i], i, days.length, form.depDate));
  }
  children.push(pageBreak());

  // ── 打包清單 ─────────────────────────────────────────
  children.push(h2("🧳  打包清單"));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `以下為前往 ${form.destination} 的建議攜帶物品清單：`, size: 20, color: C.gray, font: "微軟正黑體" })],
      spacing: { before: 80, after: 120 },
    })
  );
  children.push(buildPackingTable(packing));
  children.push(spacer());

  // ── 備忘事項 ─────────────────────────────────────────
  if (form.memo.trim()) {
    children.push(h2("📝  備忘事項"));
    for (const line of form.memo.split("\n")) children.push(body(line || " "));
    children.push(spacer());
  }

  // ── 頁尾 ─────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "⚠️  簽證 / 海關資訊僅供參考，出發前請以官方公告為準。", size: 17, color: "AAAAAA", italics: true, font: "微軟正黑體" })],
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.border } },
      spacing: { before: 240, after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "出國優轉 AbroadUturn  ·  uturn-web.vercel.app", size: 17, color: "AAAAAA", font: "微軟正黑體" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
    })
  );

  const doc = new Document({
    numbering: { config: [] },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 800, right: 800 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${form.destination}_${form.depDate}_旅遊計畫書.docx`);
}

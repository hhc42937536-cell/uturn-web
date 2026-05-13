// 飯店推薦資料（從 LINE Bot hotels.py 移植）

export interface HotelEstimate {
  priceRange: string;   // TWD / 晚
  rating: string;       // Agoda 平均評分
  area: string;         // 推薦住宿區域
}

export interface HotelPick {
  name: string;
  location: string;
  agodaKeyword: string; // 搜尋關鍵字
}

export const HOTEL_ESTIMATES: Record<string, HotelEstimate> = {
  東京:     { priceRange: "1,200~3,500", rating: "8.5", area: "新宿・淺草・池袋" },
  大阪:     { priceRange: "900~2,800",   rating: "8.3", area: "難波・心齋橋・梅田" },
  沖繩:     { priceRange: "800~2,200",   rating: "8.3", area: "那霸・國際通・美浜" },
  福岡:     { priceRange: "900~2,500",   rating: "8.3", area: "博多・天神・中洲" },
  北海道:   { priceRange: "1,000~3,000", rating: "8.4", area: "札幌市中心・すすきの" },
  名古屋:   { priceRange: "800~2,500",   rating: "8.2", area: "榮・名古屋站・伏見" },
  首爾:     { priceRange: "800~2,500",   rating: "8.4", area: "弘大・明洞・江南" },
  釜山:     { priceRange: "700~2,000",   rating: "8.2", area: "海雲台・西面・南浦洞" },
  濟州:     { priceRange: "700~2,000",   rating: "8.2", area: "濟州市・中文觀光地" },
  曼谷:     { priceRange: "500~2,000",   rating: "8.2", area: "暹羅・素坤逸・考山路" },
  清邁:     { priceRange: "400~1,500",   rating: "8.4", area: "古城區・尼曼路・夜市" },
  普吉島:   { priceRange: "600~3,000",   rating: "8.3", area: "巴東海灘・卡塔・老普吉" },
  新加坡:   { priceRange: "1,500~4,500", rating: "8.6", area: "烏節路・牛車水・克拉碼頭" },
  吉隆坡:   { priceRange: "500~2,000",   rating: "8.2", area: "武吉免登・KLCC・茨廠街" },
  蘭卡威:   { priceRange: "800~3,500",   rating: "8.4", area: "珍南海灘・東方村" },
  峇里島:   { priceRange: "600~2,500",   rating: "8.5", area: "庫塔・烏布・水明漾" },
  胡志明市: { priceRange: "400~1,500",   rating: "8.1", area: "第一郡・濱城市場周邊" },
  河內:     { priceRange: "350~1,200",   rating: "8.0", area: "還劍湖・老城區・西湖" },
  峴港:     { priceRange: "400~1,800",   rating: "8.3", area: "美溪海灘・峴港市中心" },
  香港:     { priceRange: "1,800~5,000", rating: "8.4", area: "尖沙咀・旺角・銅鑼灣" },
  澳門:     { priceRange: "1,200~4,000", rating: "8.3", area: "路氹城・澳門半島" },
  上海:     { priceRange: "800~3,000",   rating: "8.3", area: "外灘・靜安寺・徐匯" },
  北京:     { priceRange: "700~2,500",   rating: "8.2", area: "王府井・三里屯・西城" },
  馬尼拉:   { priceRange: "500~2,500",   rating: "8.0", area: "馬卡蒂・BGC・馬尼拉灣" },
  宿霧:     { priceRange: "400~1,800",   rating: "8.2", area: "宿霧市・麥克坦島" },
  杜拜:     { priceRange: "2,000~8,000", rating: "8.6", area: "迪拜瑪麗娜・下城・棕櫚島" },
  倫敦:     { priceRange: "2,500~8,000", rating: "8.3", area: "西區・國王十字・肖爾迪奇" },
  巴黎:     { priceRange: "2,000~7,000", rating: "8.2", area: "歌劇院・馬黑・蒙馬特" },
  關島:     { priceRange: "1,200~4,000", rating: "8.3", area: "土蒙灣・阿加尼亞" },
  帛琉:     { priceRange: "1,500~5,000", rating: "8.4", area: "科羅州・梅勒凱奧克" },
};

export const HOTEL_PICKS: Record<string, HotelPick[]> = {
  東京: [
    { name: "JR Kyushu Hotel Blossom Shinjuku", location: "新宿站旁，步行 3 分鐘", agodaKeyword: "JR Kyushu Hotel Blossom Shinjuku" },
    { name: "Daiwa Roynet Hotel Ginza Premier", location: "銀座/東京站，交通極便", agodaKeyword: "Daiwa Roynet Hotel Ginza" },
    { name: "Richmond Hotel Premier Asakusa", location: "淺草・上野圈，感受老東京", agodaKeyword: "Richmond Hotel Asakusa" },
  ],
  大阪: [
    { name: "Hotel Monterey Grasmere Osaka", location: "JR 難波站直結，購物超方便", agodaKeyword: "Hotel Monterey Grasmere Osaka" },
    { name: "Hotel Vischio Osaka by Granvia", location: "梅田站旁，JR 大阪站步行 5 分", agodaKeyword: "Hotel Vischio Osaka" },
    { name: "Cross Hotel Osaka", location: "道頓堀旁，心齋橋徒步圈", agodaKeyword: "Cross Hotel Osaka" },
  ],
  首爾: [
    { name: "L7 Hongdae by LOTTE", location: "弘大站旁，接機鐵路直達", agodaKeyword: "L7 Hongdae by LOTTE" },
    { name: "Nine Tree Premier Hotel Myeongdong 2", location: "明洞・乙支路，購物美食圈", agodaKeyword: "Nine Tree Premier Hotel Myeongdong" },
    { name: "LOTTE City Hotel Myeongdong", location: "明洞市中心，交通最便", agodaKeyword: "LOTTE City Hotel Myeongdong" },
  ],
  曼谷: [
    { name: "Citadines Sukhumvit 8 Bangkok", location: "素坤逸 BTS 站旁，便利超市就在樓下", agodaKeyword: "Citadines Sukhumvit 8" },
    { name: "ibis Bangkok Siam", location: "暹羅 BTS 直達，購物圈中心", agodaKeyword: "ibis Bangkok Siam" },
    { name: "Riva Surya Bangkok", location: "考山路河畔，文青風格", agodaKeyword: "Riva Surya Bangkok" },
  ],
  峇里島: [
    { name: "Stones Hotel – Legend Bali", location: "水明漾市中心，步行逛街", agodaKeyword: "Stones Hotel Bali" },
    { name: "Katamama", location: "水明漾精品飯店，工藝設計", agodaKeyword: "Katamama Bali" },
    { name: "Komaneka at Bisma", location: "烏布森林景觀，安靜療癒", agodaKeyword: "Komaneka Bisma" },
  ],
  新加坡: [
    { name: "ibis Singapore on Bencoolen", location: "Bugis 捷運站旁，鬧中取靜", agodaKeyword: "ibis Singapore Bencoolen" },
    { name: "Hotel Boss", location: "拉瓦勒街附近，超高CP值", agodaKeyword: "Hotel Boss Singapore" },
    { name: "Andaz Singapore", location: "Bugis+ 旁，設計型精品飯店", agodaKeyword: "Andaz Singapore" },
  ],
  香港: [
    { name: "iclub Sheung Wan Hotel", location: "上環地鐵站旁，中西區精品", agodaKeyword: "iclub Sheung Wan" },
    { name: "Mira Moon", location: "銅鑼灣精品，設計感強", agodaKeyword: "Mira Moon Hong Kong" },
    { name: "The Salisbury – YMCA of Hong Kong", location: "尖沙咀天星碼頭旁，維港景觀", agodaKeyword: "Salisbury YMCA Hong Kong" },
  ],
  胡志明市: [
    { name: "Liberty Central Saigon Riverside Hotel", location: "第一郡河畔，步行逛濱城市場", agodaKeyword: "Liberty Central Saigon Riverside" },
    { name: "Silverland Jolie Hotel & Spa", location: "第一郡市中心，步行範圍廣", agodaKeyword: "Silverland Jolie Hotel" },
    { name: "The Reverie Saigon", location: "高端首選，金融塔旁", agodaKeyword: "The Reverie Saigon" },
  ],
};

// Agoda 搜尋 URL 產生器
export function agodaUrl(keyword: string, depDate?: string, retDate?: string): string {
  const q = encodeURIComponent(keyword);
  let url = `https://www.agoda.com/search?q=${q}&los=3&rooms=1&adults=2`;
  if (depDate) url += `&checkIn=${depDate}`;
  if (retDate) url += `&checkOut=${retDate}`;
  return url;
}

// Booking.com 搜尋 URL 產生器
export function bookingUrl(city: string, depDate?: string, retDate?: string): string {
  const q = encodeURIComponent(city);
  let url = `https://www.booking.com/search.html?ss=${q}&lang=zh-tw&selected_currency=TWD`;
  if (depDate) url += `&checkin=${depDate}`;
  if (retDate) url += `&checkout=${retDate}`;
  return url;
}

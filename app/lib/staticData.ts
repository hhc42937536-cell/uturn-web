export const VISA_DATA = [
  { city: "首爾", country: "韓國", type: "免簽" as const, days: 90, notes: "持中華民國護照可免簽入境，停留最長90天" },
  { city: "釜山", country: "韓國", type: "免簽" as const, days: 90, notes: "同首爾，持ROC護照免簽90天" },
  { city: "東京", country: "日本", type: "免簽" as const, days: 90, notes: "免簽停留90天，但需有回程機票" },
  { city: "大阪", country: "日本", type: "免簽" as const, days: 90, notes: "同東京，大阪入境適用" },
  { city: "沖繩", country: "日本", type: "免簽" as const, days: 90, notes: "日本領土，適用同一規定" },
  { city: "曼谷", country: "泰國", type: "免簽" as const, days: 60, notes: "2024年起升級為免簽60天，可申請延長30天" },
  { city: "新加坡", country: "新加坡", type: "免簽" as const, days: 30, notes: "免簽30天，可延長至90天，建議預先申請ICA" },
  { city: "香港", country: "香港", type: "免簽" as const, days: 90, notes: "持ROC護照可免簽入境香港停留90天" },
  { city: "胡志明市", country: "越南", type: "電子簽" as const, days: 90, notes: "須預先申請e-visa，費用約USD 25，90天單次" },
];

export const EMERGENCY_DATA = [
  { city: "首爾", embassy: "駐韓國台北代表部 +82-2-399-2780", police: "112", ambulance: "119", sim: "KT、SK電信，機場有售，7天約TWD 400", hospital: "延世大學醫院 +82-2-2228-5800" },
  { city: "東京", embassy: "台北駐日經濟文化代表處 +81-3-3280-7811", police: "110", ambulance: "119", sim: "IIJmio、楽天Mobile，成田/羽田機場有售", hospital: "東京慈惠會醫科大學附屬病院 +81-3-3433-1111" },
  { city: "大阪", embassy: "台北駐大阪經濟文化辦事處 +81-6-6443-8481", police: "110", ambulance: "119", sim: "同東京，關西機場有售", hospital: "大阪大學醫學部附屬病院 +81-6-6879-5111" },
  { city: "曼谷", embassy: "駐泰國台北經濟貿易辦事處 +66-2-670-0200", police: "191", ambulance: "1669", sim: "DTAC、AIS，素萬那普機場入境大廳有售，7天約TWD 300", hospital: "Bumrungrad International +66-2-066-8888" },
  { city: "新加坡", embassy: "台北駐新加坡經濟文化辦事處 +65-6500-0100", police: "999", ambulance: "995", sim: "StarHub、Singtel，樟宜機場有售", hospital: "Singapore General Hospital +65-6222-3322" },
  { city: "香港", embassy: "台灣香港事務局 +852-2525-8315", police: "999", ambulance: "999", sim: "中國移動、3HK，機場到達大廳有售，5天約TWD 200", hospital: "瑪麗醫院 +852-2255-3838" },
  { city: "胡志明市", embassy: "駐胡志明市台北經濟文化辦事處 +84-28-3825-7902", police: "113", ambulance: "115", sim: "Viettel、Mobifone，新山一機場有售，7天約TWD 150", hospital: "FV Hospital +84-28-5411-3333" },
  { city: "沖繩", embassy: "台北駐日經濟文化代表處那霸分處 +81-98-862-7008", police: "110", ambulance: "119", sim: "同日本，那霸機場有售", hospital: "琉球大學醫學部附屬病院 +81-98-895-3331" },
  { city: "釜山", embassy: "駐釜山台北代表部 +82-51-466-7088", police: "112", ambulance: "119", sim: "同首爾，金海機場有售", hospital: "釜山大學病院 +82-51-240-7000" },
];

export const SEASON_DATA = [
  { city: "首爾", flag: "🇰🇷", best: [3, 4, 5, 9, 10], ok: [6, 11], avoid: [1, 2, 7, 8, 12] },
  { city: "東京", flag: "🇯🇵", best: [3, 4, 10, 11], ok: [5, 6, 9, 12], avoid: [1, 2, 7, 8] },
  { city: "大阪", flag: "🇯🇵", best: [3, 4, 10, 11], ok: [5, 6, 9, 12], avoid: [1, 2, 7, 8] },
  { city: "沖繩", flag: "🇯🇵", best: [4, 5, 10, 11], ok: [3, 6, 9, 12], avoid: [1, 2, 7, 8] },
  { city: "釜山", flag: "🇰🇷", best: [5, 6, 9, 10], ok: [3, 4, 11], avoid: [1, 2, 7, 8, 12] },
  { city: "曼谷", flag: "🇹🇭", best: [11, 12, 1, 2], ok: [3, 10], avoid: [4, 5, 6, 7, 8, 9] },
  { city: "新加坡", flag: "🇸🇬", best: [2, 3, 7, 8], ok: [1, 4, 9, 10], avoid: [11, 12, 5, 6] },
  { city: "香港", flag: "🇭🇰", best: [10, 11, 12, 3], ok: [1, 2, 4, 9], avoid: [5, 6, 7, 8] },
  { city: "胡志明市", flag: "🇻🇳", best: [12, 1, 2, 3], ok: [4, 11], avoid: [5, 6, 7, 8, 9, 10] },
];

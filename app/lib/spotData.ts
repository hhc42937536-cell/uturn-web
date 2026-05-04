export type Spot = {
  id: string;
  name: string;
  category: "景點" | "美食" | "購物" | "體驗";
  lat: number;
  lng: number;
  duration: string;  // 建議停留時間
  tip: string;
};

export const CITY_SPOTS: Record<string, Spot[]> = {
  SEL: [
    { id: "sel-1",  name: "景福宮",          category: "景點", lat: 37.5796, lng: 126.9770, duration: "2hr", tip: "早上9點前人少，可租韓服拍照" },
    { id: "sel-2",  name: "北村韓屋村",       category: "景點", lat: 37.5826, lng: 126.9830, duration: "1.5hr", tip: "嘉會洞31號是最美拍攝點" },
    { id: "sel-3",  name: "仁寺洞",           category: "購物", lat: 37.5742, lng: 126.9850, duration: "1.5hr", tip: "傳統工藝品、韓紙、傳統茶" },
    { id: "sel-4",  name: "弘大",             category: "購物", lat: 37.5563, lng: 126.9233, duration: "3hr", tip: "拍貼、咖啡廳、獨立品牌集中地" },
    { id: "sel-5",  name: "明洞 Olive Young", category: "購物", lat: 37.5633, lng: 126.9846, duration: "2hr", tip: "4層旗艦店，App領折扣再購" },
    { id: "sel-6",  name: "東大門 DDP",       category: "景點", lat: 37.5669, lng: 127.0092, duration: "2hr", tip: "夜間燈光超美，Doota Mall深夜到凌晨4點" },
    { id: "sel-7",  name: "COEX Mall",        category: "購物", lat: 37.5115, lng: 127.0595, duration: "2hr", tip: "SM Town Museum、星空圖書館在此" },
    { id: "sel-8",  name: "益善洞韓屋街",     category: "景點", lat: 37.5739, lng: 126.9956, duration: "1.5hr", tip: "保存最完整的韓屋群，文青咖啡廳林立" },
    { id: "sel-9",  name: "漢江公園",         category: "體驗", lat: 37.5285, lng: 126.9367, duration: "2hr", tip: "外送炸雞野餐，首爾人週末必去" },
    { id: "sel-10", name: "廣藏市場",         category: "美食", lat: 37.5697, lng: 126.9988, duration: "1.5hr", tip: "綠豆煎餅、生章魚、麻藥紫菜飯卷必吃" },
    { id: "sel-11", name: "梨泰院",           category: "體驗", lat: 37.5344, lng: 126.9940, duration: "2hr", tip: "多元文化融合，特色小店與夜生活" },
    { id: "sel-12", name: "HYBE Insight",     category: "體驗", lat: 37.5326, lng: 126.9703, duration: "2hr", tip: "BTS展覽，需提前1-2週訂票" },
  ],
  TYO: [
    { id: "tyo-1",  name: "淺草寺",           category: "景點", lat: 35.7148, lng: 139.7967, duration: "1.5hr", tip: "仲見世通商店街必逛，早晨人少" },
    { id: "tyo-2",  name: "上野公園",         category: "景點", lat: 35.7146, lng: 139.7736, duration: "2hr", tip: "博物館群集中，春天賞櫻聖地" },
    { id: "tyo-3",  name: "新宿御苑",         category: "景點", lat: 35.6851, lng: 139.7104, duration: "2hr", tip: "《你的名字》外景地，需購票" },
    { id: "tyo-4",  name: "澀谷十字路口",     category: "景點", lat: 35.6595, lng: 139.7004, duration: "1hr", tip: "Scramble Square 11樓觀景台俯瞰最震撼" },
    { id: "tyo-5",  name: "原宿竹下通",       category: "購物", lat: 35.6702, lng: 139.7027, duration: "1.5hr", tip: "可麗餅是必吃，潮流少女文化發源地" },
    { id: "tyo-6",  name: "新宿歌舞伎町",     category: "體驗", lat: 35.6953, lng: 139.7038, duration: "2hr", tip: "夜晚燈光絢爛，哥吉拉頭像在東急廣場屋頂" },
    { id: "tyo-7",  name: "秋葉原",           category: "購物", lat: 35.7022, lng: 139.7742, duration: "3hr", tip: "電器、動漫、女僕咖啡廳，3C必掃" },
    { id: "tyo-8",  name: "築地外市場",       category: "美食", lat: 35.6654, lng: 139.7707, duration: "2hr", tip: "豐洲是內市場，築地外市場散步美食更適合觀光客" },
    { id: "tyo-9",  name: "台場",             category: "景點", lat: 35.6247, lng: 139.7757, duration: "2.5hr", tip: "鋼彈立像、富士電視台、彩虹橋夜景" },
    { id: "tyo-10", name: "晴空塔",           category: "景點", lat: 35.7101, lng: 139.8107, duration: "2hr", tip: "634m，夜景是東京第一；下方商場也很好逛" },
    { id: "tyo-11", name: "銀座",             category: "購物", lat: 35.6717, lng: 139.7649, duration: "2hr", tip: "頂級百貨、無印良品旗艦店、東急Plaza" },
    { id: "tyo-12", name: "代官山蔦屋書店",   category: "體驗", lat: 35.6490, lng: 139.7027, duration: "1.5hr", tip: "最美書店之一，中目黑運河旁" },
  ],
  OSA: [
    { id: "osa-1",  name: "道頓堀",           category: "美食", lat: 34.6687, lng: 135.5013, duration: "2hr", tip: "章魚燒、蟹道樂、格力高巨型招牌必拍" },
    { id: "osa-2",  name: "黑門市場",         category: "美食", lat: 34.6647, lng: 135.5065, duration: "1.5hr", tip: "大阪廚房，生魚片・松葉蟹・黑毛和牛" },
    { id: "osa-3",  name: "大阪城",           category: "景點", lat: 34.6873, lng: 135.5262, duration: "2hr", tip: "天守閣可遠眺全大阪，周邊公園免費" },
    { id: "osa-4",  name: "心齋橋",           category: "購物", lat: 34.6724, lng: 135.5013, duration: "2.5hr", tip: "美國村、歐美風選品店、藥妝密集" },
    { id: "osa-5",  name: "環球影城 USJ",     category: "體驗", lat: 34.6654, lng: 135.4323, duration: "全天", tip: "哈利波特、任天堂世界；早晨超快通關" },
    { id: "osa-6",  name: "新世界通天閣",     category: "景點", lat: 34.6523, lng: 135.5059, duration: "1.5hr", tip: "100年歷史・串炸發源地・老大阪氛圍" },
    { id: "osa-7",  name: "難波",             category: "購物", lat: 34.6687, lng: 135.5011, duration: "2hr", tip: "Bic Camera、Yodobashi 電器掃貨" },
    { id: "osa-8",  name: "梅田空中庭園",     category: "景點", lat: 34.7056, lng: 135.4940, duration: "1hr", tip: "夕陽時刻最美，環形天空步道震撼" },
  ],
  BKK: [
    { id: "bkk-1",  name: "臥佛寺",           category: "景點", lat: 13.7465, lng: 100.4930, duration: "1.5hr", tip: "泰國最大臥佛，必做正宗泰式按摩" },
    { id: "bkk-2",  name: "大皇宮",           category: "景點", lat: 13.7500, lng: 100.4913, duration: "2hr", tip: "需著正式服裝，翡翠佛寺同園區" },
    { id: "bkk-3",  name: "恰圖恰週末市集",   category: "購物", lat: 13.7999, lng: 100.5508, duration: "3hr", tip: "8000+攤位，僅週末開，二手・手工藝・寵物" },
    { id: "bkk-4",  name: "Siam Paragon",     category: "購物", lat: 13.7464, lng: 100.5347, duration: "2hr", tip: "BTS Siam站，頂樓水族館；旁邊 MBK 更親民" },
    { id: "bkk-5",  name: "鄭王廟",           category: "景點", lat: 13.7439, lng: 100.4888, duration: "1hr", tip: "渡船過湄南河，黃昏光線最美" },
    { id: "bkk-6",  name: "唐人街耀華力路",   category: "美食", lat: 13.7392, lng: 100.5105, duration: "2hr", tip: "夜間美食街：燕窩、炸螃蟹、海鮮麵" },
    { id: "bkk-7",  name: "Asiatique河濱夜市",category: "體驗", lat: 13.7192, lng: 100.5126, duration: "2.5hr", tip: "夜市+碼頭景觀，摩天輪是地標" },
    { id: "bkk-8",  name: "Lebua 空中酒吧",   category: "體驗", lat: 13.7221, lng: 100.5163, duration: "1.5hr", tip: "《醉後大丈夫2》取景地，需smart casual" },
  ],
  SIN: [
    { id: "sin-1",  name: "濱海灣花園",       category: "景點", lat: 1.2816, lng: 103.8636, duration: "3hr", tip: "超級樹叢夜間燈光秀 19:45 & 20:45" },
    { id: "sin-2",  name: "烏節路",           category: "購物", lat: 1.3048, lng: 103.8318, duration: "2hr", tip: "ION Orchard、Paragon，新加坡精品大道" },
    { id: "sin-3",  name: "克拉碼頭",         category: "體驗", lat: 1.2905, lng: 103.8463, duration: "2hr", tip: "酒吧區、河道遊船，夜晚最熱鬧" },
    { id: "sin-4",  name: "小印度",           category: "體驗", lat: 1.3066, lng: 103.8518, duration: "1.5hr", tip: "慕達發中心、竹腳市場，異國香料飄香" },
    { id: "sin-5",  name: "牛車水",           category: "景點", lat: 1.2838, lng: 103.8445, duration: "1.5hr", tip: "新加坡唐人街，斯里馬里安曼廟附近" },
    { id: "sin-6",  name: "聖陶沙名勝世界",   category: "體驗", lat: 1.2540, lng: 103.8238, duration: "全天", tip: "環球影城、水世界、S.E.A水族館" },
    { id: "sin-7",  name: "麥士威熟食中心",   category: "美食", lat: 1.2803, lng: 103.8448, duration: "1hr", tip: "天天海南雞飯 + 陳兆記炒蘿蔔糕必點" },
    { id: "sin-8",  name: "Marina Bay Sands", category: "景點", lat: 1.2834, lng: 103.8607, duration: "1.5hr", tip: "無邊際泳池僅住客可用，觀景台公開" },
  ],
};

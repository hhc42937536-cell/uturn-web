export type DayPlan = {
  theme: string;
  am: string;
  pm: string;
  eve: string;
  rainy?: string; // 雨天備案
};

export type CityData = {
  city_name: string;
  flag: string;
  arrival: { pm: string; eve: string };
  full_days: DayPlan[];
  departure: { am: string; pm: string };
  must_eat: string[];
  card_name: string;
  card_tip: string;
  transport_tips: string[];
  apps: { name: string; icon: string; desc: string }[];
  insider_tips: string[];
};

export const CITY_CODE: Record<string, string> = {
  首爾: "SEL", 東京: "TYO", 大阪: "OSA", 曼谷: "BKK",
  新加坡: "SIN", 香港: "HKG", 沖繩: "OKA", 胡志明市: "SGN", 釜山: "PUS",
};

export const CITY_DATA: Record<string, CityData> = {
  SEL: {
    city_name: "首爾", flag: "🇰🇷",
    arrival: {
      pm: "弘大逛街・延南洞咖啡街——《我的ID是江南美人》拍攝地「弘大入口站」周邊，塗鴉牆、獨立品牌小店密度最高，延南洞咖啡街寧靜版的弘大，適合第一天慢慢逛",
      eve: "弘大炸雞街初體驗——「Nene Chicken（네네치킨）」醬辣口味是當地學生最愛；「橋村炸雞（교촌치킨）」蜂蜜醬是 IU 愛吃的款式，《我叫金三順》也常出現",
    },
    full_days: [
      {
        theme: "宮殿&韓服體驗",
        am: "景福宮（경복궁）——朝鮮王朝 500 年政治心臟，建於 1395 年。《椅子上的男人》《雲畫的月光》《陽光先生》均在此取景。推薦「光化門韓服館」₩30,000/2hr，光化門廣場角度可同時拍到北岳山 + 勤政殿，絕美",
        pm: "仁寺洞傳統工藝街——賣傳統茶・手工藝品・韓紙，《請回答1988》德善他們常逛的街景。北村韓屋村——600年前朝鮮貴族住宅區，嘉會洞31號前坡道俯瞰首爾最上相，平日早晨9點前人少，下午變人潮洶湧",
        eve: "清溪川步道——2005年復原的人工溪流，全長6km，是首爾打卡夜景第一名。廣橋橋墩下仰拍是IG最多人用的構圖，《步步驚心：麗》也曾在此取景",
        rainy: "☂️ 改去國立中央博物館（免費、全室內，收藏朝鮮王朝文物超壯觀）+ 光化門 D Tower 地下街購物，完全不淋雨",
      },
      {
        theme: "美妝&Olive Young掃貨",
        am: "Olive Young 明洞旗艦店（4層樓）——BLACKPINK Jisoo 代言的 HERA、NewJeans 愛用的 LANEIGE、BTS 防彈少年團推薦的 VT Cosmetics 全在這，比免稅店便宜 10-20%，記得掃描 App 領折扣券再結帳",
        pm: "明洞藥妝一條街——跟老闆說「台灣來的」有機會多送小樣；「ETUDE House」明洞本店色號最齊。樂天百貨地下食品街——韓國甜點品牌 Sulbing（雪冰）在這有分店，草莓牛奶冰絕對排隊",
        eve: "東大門設計廣場（DDP）夜景——由扎哈・哈蒂設計的流線型建築，夜間燈光超美，是首爾最具未來感的地標。旁邊「Doota Mall」深夜到凌晨 4 點都開，批發客的天堂",
        rainy: "☂️ 直衝東大門 Lotte 免稅店或新羅免稅店，全室內、空調涼爽，加上韓元弱的時候比香港貴桑免稅店還划算",
      },
      {
        theme: "拍貼&潮流文化",
        am: "弘大大頭貼街（인생네컷）——「LIFE4CUT」是最多人排的品牌；「Photoism」拍出來最白最美，有各種 KPOP 明星聯名機台；「돈룩업（Don't Look Up）」風格最文青。建議連拍 3 間比風格，₩4,000 起",
        pm: "梨大服飾街——梨花女子大學前商圈，韓系穿搭平價聖地，ZARA 的韓版款式比台灣多。建大入口 Common Ground（건대입구）——韓國最大貨櫃屋商場，200 個藍色貨櫃拼成的 IG 打卡地，《星你》《她愛上了我的謊》取景地，4樓頂樓俯瞰視角最美",
        eve: "望遠漢江公園炸雞外送野餐——用 Baemin（배달의민족）App 外送，30分鐘內送達，啤酒超商買，河邊吹風看夜景，才是首爾人真實的週末生活",
        rainy: "☂️ 弘大「포토스트리트（Photo Street）」室內拍貼館繼續衝；홍대 카페거리咖啡廳跳店（每間都有韓系概念裝潢），雨天最適合逛咖啡廳",
      },
      {
        theme: "K-POP 聖地朝聖",
        am: "HYBE INSIGHT（하이브 인사이트）——BTS 的母公司 HYBE 開設的沉浸式展覽，展示 BTS・TOMORROW X TOGETHER・ENHYPEN 等團的創作過程。需提前 1-2 週在官網訂票，中文語音導覽可選",
        pm: "COEX SM Town Museum——SM Entertainment 旗下（EXO・NCT・aespa・Red Velvet）互動展，旁邊官方商店有限量周邊。YG Shop 弘大官方店——BLACKPINK・BIGBANG 周邊，全韓唯一官方實體店，限量商品只有這裡有",
        eve: "南山首爾塔（N Seoul Tower）——海拔 480m，被 IU、BIGBANG 等無數歌手拍過MV的地標。搭纜車上山是遊客路線，當地人從南山公園爬 20 分鐘上去，沿途夜景更美。「Hancook 旋轉餐廳」在同棟，邊用餐邊看首爾全景",
        rainy: "☂️ COEX Mall 全室內：Starfield Library（全韓最美書店）+ Aquarium 水族館 + SM Museum + 無數餐廳，下雨天可在這待一整天",
      },
      {
        theme: "韓國醫美體驗",
        am: "狎鷗亭・清潭洞皮膚科診所——肉毒桿菌（₩50,000起）、玻尿酸、皮秒雷射等項目比台灣便宜 40-60%。推薦「JK 整形外科」「BK Plastic Surgery」，需提前 2 週Email預約，診所有中文翻譯",
        pm: "狎鷗亭羅德奧街——首爾最高端的精品街，Chanel・Dior 首爾旗艦店都在這。Dosan Park 附近韓系選品店——「Gentle Monster」（眼鏡）、「Museum by LOTTE」是韓國潮流品牌集散地，IU 常被狗仔拍到在此購物",
        eve: "Starfield COEX Mall 夜逛——6萬本書的「Starfield Library」書架拍照打卡；B1美食街 「Wang Thai」泰國菜在韓國出乎意料地好吃；「江南 BONGCHU 串燒」是排隊名店",
        rainy: "☂️ 醫美門診本來就在室內，雨天最適合排醫美！下午順便逛 COEX 的「SM Town Museum」（₩16,000，附周邊折扣券）",
      },
      {
        theme: "近郊自然小旅行",
        am: "南怡島（남이섬）——《冬季戀歌》裴勇俊・崔智友的經典拍攝地，楓葉季（10-11月）時整個島染紅，被《孤獨的美食家》推薦過。渡輪₩16,000 來回，從加平站出發約1小時。或改去北漢山健行，韓劇《我的ID是江南美人》取景",
        pm: "三清洞古道咖啡廳街——景福宮後方的安靜小巷，《來自星星的你》都敏俊家的場景靈感來源，「三清洞 Sujebi（수제비）」手工麵疙瘩是當地人推薦的在地餐廳",
        eve: "新沙洞林蔭大道（가로수길）——夏天梧桐樹成蔭，兩側盡是設計師品牌小店。「Gentle Monster」眼鏡、「Ader Error」選品都在這，IU、孔劉等明星常被狗仔拍到低調逛這",
        rainy: "☂️ 改去龍山「전쟁기념관（War Memorial of Korea）」免費參觀，重現韓國近代戰爭史，展覽深刻。梨泰院咖啡廳雨天散步，《梨泰院 Class》朴新路（박새로이）餐廳 DanBam 的場景附近",
      },
    ],
    departure: {
      am: "仁川機場免稅店最後補購——Olive Young 機場店（含 Laneige / VT / Romand 全系列）比市區貴 5-10% 但比台灣便宜。「新羅免稅店」接駁車從明洞飯店出發，市區辦理登機後手提行李直接上飛機，行李寄放超方便",
      pm: "仁川機場搭機——建議 T2 航廈（大韓・Delta 使用）的美食區比 T1 好吃，嘗試「孔陶（공도）」傳統韓定食",
    },
    must_eat: [
      "삼겹살（五花肉燒肉）▸ 推薦「新村炭火烤肉（신촌참숯구이）」50年老店，炭火燒不是瓦斯爐；「麻浦大哥（마포대감）」IU 曾光顧，江南區最有名",
      "부대찌개（部隊鍋）▸ 韓戰後美軍剩餘 SPAM・起司發明的療癒料理。新村「劉林部隊鍋（유림부대찌개）」是50年老店，吃飯時間排長龍是正常的",
      "치맥（炸雞配啤酒）▸ 漢江公園外送必點。「橋村炸雞（교촌치킨）」蜂蜜醬是 IU 推薦款；「bhc炸雞」脆皮最香",
      "냉면（冷麵）▸ 「優來屋（우래옥）」1946年開業，BTS RM 在 Weverse 推薦過，平日也要排 30 分鐘；平壤冷麵風格，湯底清澈卻鮮甜",
      "떡볶이（辣炒年糕）▸ 廣藏市場現做떡볶이是首爾最古老版本，口感Q彈；弘大「女神떡볶이（엽기떡볶이）」辣度4級是網紅必打卡，《Running Man》曾來拍",
      "순두부찌개（嫩豆腐鍋）▸ 景福宮旁「土俗村（토속촌）」——藍色大門老宅子，韓國前總統盧武鉉也是常客，蔘雞湯是招牌，排隊但值得",
    ],
    card_name: "T-money 卡",
    card_tip: "在 GS25 / CU / 7-Eleven 購買，卡費 ₩2,500，也可在便利商店消費結帳",
    transport_tips: [
      "2號線最重要——弘大 / 新村 / 梨大 / 江南 / 建大入口全在這條綠線",
      "Kakao Map 比 Google Maps 更準確，韓文地名直接複製貼上搜尋",
      "深夜可搭「Owl Bus（올빼미버스）」夜間公車，T-money 可用，比計程車便宜一半",
    ],
    apps: [
      { name: "Kakao Map", icon: "🗺️", desc: "韓國最準的地圖，必裝" },
      { name: "Kakao T", icon: "🚕", desc: "韓國叫車，比計程車安全不被坑" },
      { name: "Naver Map", icon: "📍", desc: "餐廳評價參考，韓文評論更真實" },
    ],
    insider_tips: [
      "Olive Young 明洞旗艦店：App 下載後每週有折扣券，結帳前記得掃碼，可再省5-10%",
      "明洞到東大門搭地鐵 4 號線只要 3 站，深夜 2 點 Doota Mall 還開著，逛累再回去",
      "漢江公園炸雞外送：Baemin App 下載後可改英文介面，地圖選漢江公園 pin 點即可外送",
      "仁川機場出發前留 3 小時：市內辦理登機（城站/弘大站）手提行李直接上機，超方便",
    ],
  },

  TYO: {
    city_name: "東京", flag: "🇯🇵",
    arrival: { pm: "淺草寺・仲見世商店街", eve: "上野・秋葉原逛街初探" },
    full_days: [
      { theme: "藥妝&美妝大採購", am: "松本清・大國藥妝（肌研 / 安耐曬）", pm: "唐吉訶德免稅掃貨（伴手禮 + 雜貨）", eve: "新宿歌舞伎町美食" },
      { theme: "電器天堂", am: "秋葉原 Yodobashi・BIC CAMERA（吹風機 / 電鍋）", pm: "秋葉原動漫街・SOFMAP", eve: "上野阿美橫丁小吃" },
      { theme: "潮流聖地", am: "原宿竹下通・表參道精品", pm: "澀谷109・SKY 走廊俯瞰全景", eve: "澀谷美食街" },
      { theme: "皇居&銀座", am: "皇居外苑・二重橋", pm: "銀座高島屋・松屋逛街", eve: "築地場外市場海鮮" },
      { theme: "近郊小旅行", am: "鎌倉高德院大佛・小町通老街", pm: "江之島海景", eve: "橫濱中華街夜市" },
      { theme: "迪士尼 or teamLab", am: "東京迪士尼（或台場 teamLab 光影藝術）", pm: "日本橋三越地下伴手禮", eve: "東京鐵塔夜景" },
      { theme: "最後衝刺補貨", am: "新宿東急 HANDS・Loft（生活雜貨）", pm: "新宿伊勢丹地下食品館", eve: "拉麵橫丁最後一碗" },
    ],
    departure: { am: "成田・羽田機場免稅店最後採購（限定商品多）", pm: "搭機" },
    must_eat: [
      "一蘭拉麵（一蘭）▸ 每個座位都有隔板，「一人用餐文化」的發源地，湯頭配方100年不變，新宿・澀谷・上野全有分店，深夜也開",
      "迴轉壽司スシロー▸ 日本評比連年第一，比台灣日本料理便宜一半，鮭魚肚・海膽・和牛握壽司各¥165-330，澀谷・池袋均有分店",
      "牛丼吉野家▸ 創業1899年，深夜3點也開著，《深夜食堂》精神象徵，「超特盛」是日本人宿醉必吃，¥500內搞定一餐",
      "炸豬排銀座梅林▸ 1927年開業，東京最老炸豬排名店，用麵包粉慢炸90分鐘，外皮酥脆不油膩，昭和天皇曾是座上客，午間套餐¥2,000超划算",
      "壽喜燒今半▸ 上野本店創業1895年，和牛甜鹹醬汁是東京壽喜燒代名詞，外國旅客必訂，建議提前2週線上預約",
    ],
    card_name: "Suica / PASMO",
    card_tip: "建議用 Apple Pay / Google Pay 綁 Suica，手機版無押金限制，最方便",
    transport_tips: ["山手線環繞市區，大部分景點靠這條線", "Google Maps 日本可直接規劃地鐵路線，超準確", "深夜 12 點後末班車，要注意時間"],
    apps: [
      { name: "Google Maps", icon: "🗺️", desc: "日本地鐵規劃超準，含月台資訊" },
      { name: "Suica App", icon: "💳", desc: "手機綁 Suica，無押金限制" },
      { name: "GO App", icon: "🚕", desc: "日本最主要叫車 App" },
    ],
    insider_tips: [
      "teamLab 需提前 3–4 週在官網買，5–8 月幾乎天天完售",
      "淺草寺攝影最佳時段是早上 6:30–7:30，幾乎無遊客",
      "Don Quijote 免稅門檻 ¥5,500 含稅，集中一次買最省",
      "JR Pass 出發前在台灣兌換，日本境內購買幾乎貴 30%",
    ],
  },

  OSA: {
    city_name: "大阪", flag: "🇯🇵",
    arrival: { pm: "道頓堀・心齋橋初探", eve: "道頓堀章魚燒・螃蟹道樂" },
    full_days: [
      { theme: "大阪古蹟", am: "大阪城公園・天守閣", pm: "黑門市場海鮮午餐・難波", eve: "通天閣・新世界串炸" },
      { theme: "京都一日遊", am: "伏見稻荷大社千本鳥居", pm: "祇園・清水寺・三年坂", eve: "錦市場夜市" },
      { theme: "神戶小旅行", am: "北野異人館・風見雞館", pm: "南京町中華街・神戶港夜景", eve: "神戶牛排" },
      { theme: "購物天堂", am: "心齋橋筋・SHINSAIBASHI OPA", pm: "美國村・日本橋電電城", eve: "難波 Parks 美食" },
    ],
    departure: { am: "關西機場免稅店最後採購", pm: "搭機" },
    must_eat: ["章魚燒", "大阪燒", "串炸", "551 蓬萊豬肉包（伴手禮）", "明太子醬油拉麵"],
    card_name: "ICOCA",
    card_tip: "可在東京用 Suica 代替，ICOCA / Suica 全國互通，押金 ¥500",
    transport_tips: ["御堂筋線是大阪最重要的一條，記住這條就夠了", "京都來回建議搭阪急電鐵，比新幹線便宜很多", "難波與心齋橋步行距離，不需搭車"],
    apps: [
      { name: "Google Maps", icon: "🗺️", desc: "大阪地鐵路線規劃" },
      { name: "GO App", icon: "🚕", desc: "日本計程車叫車" },
      { name: "ICOCA App", icon: "💳", desc: "電子 ICOCA 儲值管理" },
    ],
    insider_tips: [
      "USJ 哈利波特區建議購買「Express Pass 7」，否則排隊 90–120 分鐘",
      "551 蓬萊豬肉包最新鮮在難波本店，週末常排隊 20 分鐘",
      "道頓堀拍招牌最佳位置在戎橋上，傍晚 18-19 點燈最美",
      "心齋橋 OPA 週末 14–17 點最擠，建議上午逛",
    ],
  },

  BKK: {
    city_name: "曼谷", flag: "🇹🇭",
    arrival: { pm: "考山路・查克里街初探", eve: "Asiatique 碼頭夜市" },
    full_days: [
      { theme: "皇朝文化", am: "大皇宮・玉佛寺", pm: "臥佛寺（正宗古法按摩）・昭披耶河遊船", eve: "Asiatique 碼頭夜市・旋轉木馬" },
      { theme: "購物天堂", am: "暹羅廣場 Siam Paragon・MBK 百貨", pm: "Central World・ICON Siam（最新最大）", eve: "On Nut 夜市在地美食" },
      { theme: "市集&水上", am: "美功鐵道市場（火車穿越奇景）", pm: "安帕瓦水上市場（週末）/ 恰圖恰週末市場", eve: "空中酒吧 Vertigo 夜景" },
      { theme: "文化&按摩", am: "鄭王廟（黎明寺）・渡船觀光", pm: "Jim Thompson 泰絲工廠・OTOP 手工藝", eve: "Silom 路美食街" },
    ],
    departure: { am: "Big C・Tops 超市最後掃伴手禮・NaRaYa 包包", pm: "素萬那普機場搭機" },
    must_eat: ["泰式炒河粉（Pad Thai）", "冬蔭功湯（Tom Yum Goong）", "芒果糯米飯", "椰子冰淇淋", "泰式奶茶"],
    card_name: "兔子卡（Rabbit Card）＋ MRT 儲值卡",
    card_tip: "BTS 和 MRT 各自獨立不互通，分別買卡；Grab 最方便",
    transport_tips: ["Grab 在曼谷非常好用，比計程車便宜且不被坑", "暹羅站是 BTS 兩條線的交叉點，記住這個站", "去大皇宮建議搭船（昭披耶河快船），省錢又有趣"],
    apps: [
      { name: "Grab", icon: "🚗", desc: "曼谷必裝，叫車不被坑價" },
      { name: "Google Maps", icon: "🗺️", desc: "BTS / MRT 路線規劃" },
      { name: "12Go Asia", icon: "🚌", desc: "購買火車 / 巴士 / 渡輪票" },
    ],
    insider_tips: [
      "大皇宮著裝嚴格，短褲短裙無法入場，現場有借衣服但要排隊",
      "臥佛寺按摩正宗古法，30 分鐘約 ฿420，物超所值",
      "曼谷街頭芒果糯米飯下午才有，上午不一定買得到",
      "ICON Siam 週末人很多，先去頂樓後再往下逛",
    ],
  },

  SIN: {
    city_name: "新加坡", flag: "🇸🇬",
    arrival: { pm: "牛車水唐人街・印度街", eve: "克拉碼頭夜景・酒吧" },
    full_days: [
      { theme: "海灣奇景", am: "濱海灣花園（擎天樹）", pm: "魚尾獅公園・濱海藝術中心", eve: "金沙空中花園夜景" },
      { theme: "聖淘沙樂園", am: "環球影城", pm: "聖淘沙海灘・S.E.A. 海洋館", eve: "怡豐城 Vivocity" },
      { theme: "文化探索", am: "小印度・阿拉伯街", pm: "哈芝巷壁畫街・蘇丹清真寺", eve: "老巴剎美食中心" },
      { theme: "自然&購物", am: "新加坡植物園（世界遺產）", pm: "烏節路 ION Orchard 購物", eve: "老巴剎夜市飽肚" },
    ],
    departure: { am: "樟宜機場 Jewel 瀑布打卡・免稅店採購", pm: "搭機" },
    must_eat: ["海南雞飯", "辣椒螃蟹", "肉骨茶", "咖椰醬吐司", "沙爹"],
    card_name: "EZ-Link 卡",
    card_tip: "也可用 Visa / Mastercard 感應直接搭乘，不一定要買卡，非常方便",
    transport_tips: ["新加坡地鐵覆蓋率超高，幾乎哪都到", "信用卡感應（Contactless）可直接搭，省去買卡", "Grab 也很普遍，機場往市區可考慮"],
    apps: [
      { name: "Grab", icon: "🚗", desc: "機場進市區或跨區移動首選" },
      { name: "Google Maps", icon: "🗺️", desc: "MRT / 公車路線規劃" },
      { name: "Klook", icon: "🎡", desc: "景點門票優惠（環球 / 聖淘沙）" },
    ],
    insider_tips: [
      "環球影城最好工作日去，週末排隊時間是平日的 2-3 倍",
      "濱海灣花園超級樹燈光秀每晚 7:45 和 8:45，免費觀看",
      "老巴剎夜間才開齊所有攤位，約晚上 7 點後最熱鬧",
      "樟宜機場 Jewel 瀑布免費進入，值得提早到機場逛",
    ],
  },

  HKG: {
    city_name: "香港", flag: "🇭🇰",
    arrival: { pm: "尖沙咀漫步・星光大道", eve: "幻彩詠香江燈光秀" },
    full_days: [
      { theme: "太平山頂", am: "太平山頂纜車・盧吉道健行", pm: "中環蘭桂坊・石板街", eve: "廟街夜市" },
      { theme: "大嶼山佛境", am: "昂坪360纜車・天壇大佛", pm: "大澳水鄉", eve: "旺角女人街夜市" },
      { theme: "購物美食", am: "銅鑼灣時代廣場・SOGO", pm: "赤柱殖民地建築・海灘", eve: "油麻地廟街燒鵝" },
      { theme: "深水埗文青", am: "深水埗鴨寮街・花墟", pm: "灣仔藍屋・PMQ 元創方", eve: "灣仔避風塘炒蟹" },
    ],
    departure: { am: "機場快線・市區辦理登機（節省時間）", pm: "搭機" },
    must_eat: ["燒鵝飯（鏞記）", "蝦餃燒賣（飲茶）", "魚蛋粉", "菠蘿油", "楊枝甘露"],
    card_name: "八達通（Octopus Card）",
    card_tip: "旅客版八達通含機場快線單程票，更划算；離港時可退押金 HK$50",
    transport_tips: ["機場快線是往返機場最快方式，可市區辦理登機", "天星小輪 HK$4 橫渡維港，便宜又有景色", "叮叮車（電車）港島段觀光超推薦"],
    apps: [
      { name: "Google Maps", icon: "🗺️", desc: "港鐵 MTR 路線規劃" },
      { name: "MTR Mobile", icon: "🚇", desc: "官方 App，即時班次與票價" },
      { name: "HKTaxi", icon: "🚕", desc: "香港叫的士 App" },
    ],
    insider_tips: [
      "幻彩詠香江燈光秀每晚 8 點，尖沙咀星光大道觀賞位置最佳",
      "太平山頂纜車週末大排長龍，建議平日早上或網上預購",
      "飲茶推薦早上 10 點前到，品項最齊全且不用排隊",
      "旺角花墟道週末最熱鬧，新奇花卉品種多，拍照好去處",
    ],
  },

  OKA: {
    city_name: "沖繩", flag: "🇯🇵",
    arrival: { pm: "那霸國際通・牧志公設市場", eve: "守禮門・首里城夜景" },
    full_days: [
      { theme: "海洋天堂", am: "美麗海水族館・海洋博公園", pm: "古宇利島・古宇利大橋", eve: "恩納沙灘漫步" },
      { theme: "離島浮潛", am: "渡嘉敷島或座間味島（浮潛）", pm: "珊瑚礁體驗", eve: "牧志燒肉居酒屋" },
      { theme: "南部歷史", am: "首里城公園・玉陵", pm: "齋場御嶽世界遺產", eve: "國際通藥妝掃貨" },
    ],
    departure: { am: "DFS 免稅店・泡盛帶回家", pm: "那霸機場搭機" },
    must_eat: ["沖繩苦瓜炒豆腐（ゴーヤチャンプルー）", "沖繩麵（ソーキそば）", "塔可飯", "海葡萄", "藍瓶泡盛"],
    card_name: "OKICA 卡",
    card_tip: "Suica 在沖繩不能搭單軌！中北部景點強烈建議租車，大眾交通很少",
    transport_tips: ["中北部（美麗海水族館 / 古宇利島）強烈建議租車", "那霸市區用 ゆいレール 單軌即可", "離島（渡嘉敷 / 座間味）搭渡輪，泊港碼頭出發"],
    apps: [
      { name: "Google Maps", icon: "🗺️", desc: "沖繩離島也準，離線地圖先下載" },
      { name: "Times Car", icon: "🚗", desc: "沖繩租車推薦，網站有中文" },
      { name: "じゃらん Jalan", icon: "🏨", desc: "租車・飯店預訂" },
    ],
    insider_tips: [
      "美麗海水族館週末人很多，建議平日早上 9 點開館時進入",
      "古宇利大橋拍照最佳點在橋頭停車場，停車免費",
      "渡嘉敷島浮潛需提前預訂，夏季 6-8 月早早售完",
      "國際通藥妝下午 3 點後折扣最多，關店前更便宜",
    ],
  },

  SGN: {
    city_name: "胡志明市", flag: "🇻🇳",
    arrival: { pm: "范五老街（背包客街）・濱城市場", eve: "濱城市場夜市海鮮" },
    full_days: [
      { theme: "歷史文化", am: "統一宮・聖母大教堂・中央郵局", pm: "戰爭遺址博物館", eve: "Bui Vien 夜生活街" },
      { theme: "近郊古城", am: "古芝地道體驗", pm: "湄公河三角洲遊船", eve: "農貿市場晚市" },
      { theme: "美食購物", am: "Ben Thanh Market 掃貨殺價", pm: "Vincom Center 購物中心", eve: "屋頂酒吧 Chill Skybar" },
    ],
    departure: { am: "Co.opmart 超市掃伴手禮", pm: "新山一機場搭機" },
    must_eat: ["越南河粉（Phở）", "越南法棍（Bánh mì）", "春捲", "椰子咖啡", "甘蔗蝦"],
    card_name: "Grab（無交通卡）",
    card_tip: "目前地鐵只有 1 號線剛通車，Grab 是最主要交通工具，請先安裝",
    transport_tips: ["Grab 是最主要交通工具，非常普遍且安全", "Grab Bike（摩托車）便宜又快，塞車時超實用", "市區景點集中，很多地方可以步行"],
    apps: [
      { name: "Grab", icon: "🚗", desc: "胡志明必裝，含 Grab Bike 摩托車" },
      { name: "Google Maps", icon: "🗺️", desc: "路線規劃，離線地圖先下載" },
    ],
    insider_tips: [
      "Ben Thanh Market 殺價從標價的 40% 起喊，別客氣",
      "古芝地道選「Ben Duoc」段比「Ben Dinh」段更壯觀",
      "Pho 河粉推薦早上 7-9 點吃，正宗店家下午就收攤",
      "Bui Vien 夜生活街週五六人潮最多，注意隨身財物",
    ],
  },

  PUS: {
    city_name: "釜山", flag: "🇰🇷",
    arrival: { pm: "海雲台海灘散步・冬柏島", eve: "海雲台海鮮街大餐" },
    full_days: [
      { theme: "彩色山城", am: "甘川文化村（彩色壁畫小巷）", pm: "釜山塔・龍頭山公園", eve: "南浦洞 BIFF 廣場夜市" },
      { theme: "自然絕景", am: "太宗台公園（懸崖海景）", pm: "松島海上纜車", eve: "廣安里海灘・廣安大橋夜景" },
      { theme: "市場&購物", am: "札嘎其魚市場（現撈海鮮）", pm: "國際市場・BIFF廣場", eve: "西面美食街夜宵" },
    ],
    departure: { am: "西面地下街最後補購", pm: "金海機場免稅店・搭機" },
    must_eat: ["돼지국밥（豬骨湯飯）", "밀면（釜山冷麵）", "씨앗호떡（芝麻煎餅）", "現撈海鮮刺身", "烤肉골목"],
    card_name: "T-money 卡",
    card_tip: "和首爾同一張卡，首爾釜山間都可用，不需另購",
    transport_tips: ["西面是釜山交通樞紐，換乘 1/2 號線在這裡先記住", "甘川文化村沒有直達地鐵，搭到土城站再轉公車 2 號", "計程車用 Kakao T，截圖飯店地址給司機看"],
    apps: [
      { name: "Kakao Map", icon: "🗺️", desc: "釜山公車路線最準，必裝" },
      { name: "Kakao T", icon: "🚕", desc: "叫計程車安全方便，可刷卡" },
      { name: "Naver Map", icon: "📍", desc: "路線規劃備選" },
    ],
    insider_tips: [
      "甘川文化村早上 9 點前人少好拍照，下午會塞滿遊客",
      "海雲台海灘夏季（7-8 月）人山人海，春秋季最適合",
      "札嘎其魚市場買完海鮮可上樓加工，費用另計但新鮮值得",
      "廣安大橋夜景每月 1 日有彩燈秀，提前確認時程",
    ],
  },
};

// ── 特別需求關鍵字 → 最適合排入的 full_days index (0-based) ──────────────────
export const CITY_KEYWORDS: Record<string, Record<string, number>> = {
  SEL: {
    "景福宮": 0, "韓服": 0, "仁寺洞": 0, "北村": 0,
    "明洞": 1, "Olive": 1, "藥妝": 1, "東大門": 1, "DDP": 1,
    "拍貼": 2, "貼紙": 2, "梨大": 2, "新村": 2, "建大": 2, "貨櫃": 2, "Common Ground": 2,
    "BTS": 3, "HYBE": 3, "kpop": 3, "K-POP": 3, "SM": 3, "YG": 3, "偶像": 3,
    "醫美": 4, "皮膚科": 4, "江南": 4, "狎鷗亭": 4, "清潭": 4,
    "北漢山": 5, "南怡島": 5, "近郊": 5,
  },
  TYO: {
    "藥妝": 0, "淺草": 0, "上野": 0,
    "秋葉原": 1, "動漫": 1, "電器": 1,
    "原宿": 2, "澀谷": 2, "表參道": 2,
    "銀座": 3, "皇居": 3, "築地": 3,
    "鎌倉": 4, "江之島": 4, "橫濱": 4,
    "迪士尼": 5, "teamLab": 5,
  },
  OSA: {
    "大阪城": 0, "黑門": 0, "通天閣": 0,
    "京都": 1, "伏見稻荷": 1, "清水寺": 1,
    "神戶": 2, "有馬溫泉": 2,
    "心齋橋": 3, "美國村": 3, "購物": 3,
  },
  BKK: {
    "大皇宮": 0, "玉佛寺": 0, "臥佛寺": 0,
    "暹羅": 1, "ICON Siam": 1, "購物": 1,
    "鐵道市場": 2, "水上市場": 2, "恰圖恰": 2,
    "鄭王廟": 3, "按摩": 3,
  },
  SIN: {
    "濱海灣": 0, "擎天樹": 0, "金沙": 0,
    "環球": 1, "聖淘沙": 1,
    "小印度": 2, "阿拉伯街": 2,
    "植物園": 3, "烏節路": 3,
  },
  HKG: {
    "太平山": 0, "中環": 0,
    "大嶼山": 1, "大佛": 1, "大澳": 1,
    "銅鑼灣": 2, "赤柱": 2,
    "深水埗": 3, "灣仔": 3,
  },
  OKA: {
    "美麗海": 0, "古宇利": 0,
    "浮潛": 1, "渡嘉敷": 1, "座間味": 1,
    "首里城": 2, "國際通": 2,
  },
  SGN: {
    "統一宮": 0, "教堂": 0, "郵局": 0,
    "古芝": 1, "湄公河": 1,
    "Ben Thanh": 2, "屋頂": 2,
  },
  PUS: {
    "甘川": 0, "龍頭山": 0,
    "太宗台": 1, "纜車": 1, "廣安": 1,
    "札嘎其": 2, "市場": 2,
  },
};

// ── 城市 Unsplash 照片 ────────────────────────────────────────────────────────
export const CITY_PHOTOS: Record<string, string> = {
  SEL: "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1800&q=80",
  TYO: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1800&q=80",
  OSA: "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1800&q=80",
  BKK: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1800&q=80",
  SIN: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1800&q=80",
  HKG: "https://images.unsplash.com/photo-1506870293436-6e6a45ec8b5e?auto=format&fit=crop&w=1800&q=80",
  OKA: "https://images.unsplash.com/photo-1615680022648-2db11101c73a?auto=format&fit=crop&w=1800&q=80",
  SGN: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1800&q=80",
  PUS: "https://images.unsplash.com/photo-1591197172062-c718f82aba20?auto=format&fit=crop&w=1800&q=80",
};

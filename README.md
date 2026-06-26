# cheng-en-tsai.github.io

[![Website](https://img.shields.io/badge/Website-avery320.github.io-2563eb?logo=googlechrome&logoColor=white)](https://avery320.github.io/cheng-en-tsai.github.io/)
[![Splide.js](https://img.shields.io/badge/Splide.js-Carousel-1f2937?logo=javascript&logoColor=white)](https://splidejs.com/)
[![Marked.js](https://img.shields.io/badge/Marked.js-Markdown%20Parser-0f172a?logo=markdown&logoColor=white)](https://marked.js.org/)
[![License](https://img.shields.io/badge/License-MIT-16a34a.svg)](#授權)

個人作品集網站，採用工具列與彈出式專案選單的互動介面設計。

## 網頁風格

- 上方工具列全寬顯示，專案分類由 menu 按鈕開啟浮層選單
- 主內容區獨立捲動，專案選單不佔用閱讀寬度
- 行動裝置沿用相同的彈出式選單互動
- 使用 Markdown 管理內容
- 支援首頁扉頁封面（Notion 風格）
- 支援圖片並排網格（Justified Gallery）
- 支援文字/圖片/影片多欄混合排版（可設定欄寬比例）
- 支援影片播放、GIF-like 影片與 iframe 嵌入
- URL Hash 路由，支援上一頁/下一頁（預設進入 `about`）
- 視窗縮放時自動重新計算圖片排版

## 技術

- HTML / CSS / JavaScript
- Marked.js（Markdown 解析）
- Splide.js（gallery 輪播）

## Splide API 整合

- 套件來源：`index.html` 透過 jsDelivr 載入 Splide core CSS 與 runtime JS。
- 結構來源：`js/markdown-extensions.js` 輸出 Splide 規範結構（`splide / splide__track / splide__list / splide__slide`）。
- 初始化來源：`js/widgets.js` 以 `new Splide(...)` 建立主輪播與縮圖輪播，並使用 `main.sync(thumbs)` 做連動。
- 主要 API：
  - `new Splide(mainElement, options)`
  - `new Splide(thumbsElement, options)`
  - `main.sync(thumbs)`
  - `thumbs.mount()` / `main.mount()`
  - `main.go('<' | '>')`

## 專案結構

```text
├── index.html                    # 入口頁：載入樣式與腳本、定義主內容與導航容器
├── css/
│   ├── typography.css            # 字體 token 與標題/導航字級
│   ├── panels.css                # 工具列、內容面板、彈出式選單
│   ├── style.css                 # 內容區與媒體通用樣式（表格 / iframe / layout）
│   ├── grid.css                  # :::grid 的 Justified 圖片排版
│   └── gallery.css               # :::gallery 輪播圖庫與 lightbox 樣式
├── js/
│   ├── app.js                    # 應用啟動、Hash 路由、內容載入、導航互動
│   ├── markdown-extensions.js    # 自訂 Markdown 指令解析與 HTML 輸出
│   ├── options.js                # 共用媒體/圖庫參數解析（border/radius/height）
│   ├── justify.js                # 圖片網格比例計算與重排
│   └── widgets.js                # gallery 互動元件掛載（Splide + lightbox）
└── content/
    ├── config.json               # 分類與專案清單（menu 選單來源）
    ├── about.md                  # About 頁內容
    └── <CATEGORY>/<PROJECT>/     # 專案資料夾（含 content.md / assets）
```

## 自訂 Markdown 語法

### 排版語法

#### Grid（圖片並排）
```md
:::grid
![title](url)
![title](url)
:::
```

- `:::grid` 用於圖片並排，套用 Justified Gallery。
- 圖片標題由 `![title](url)` 的 `title` 產生，置中顯示於圖片下方。
- 連續兩張圖片不需要空行，也可正確顯示各自標題。

#### Gallery（輪播圖庫）
```md
:::gallery{height=280px,border=false,radius=true}
![](url)
![title](url)
:::
```

- `:::gallery` 會輸出主視窗 + 下方縮圖，並啟用左右循環輪播與點擊放大檢視。
- 放大檢視僅顯示圖片與左右切換，不顯示 caption 文字。
- 區塊參數支援：`height`、`border`、`radius`。
- `height` 以 `px` 為規格（例如 `280px`；純數字會自動轉為 `px`）。
- `border/radius` 套用在 gallery 主視窗，不套用在縮圖。
- `gallery` 內單張圖片僅支援 `![...](...)`，不支援單張 `{border,radius}`。

#### Layout（文字 / 圖片 / 影片混合）
```md
:::layout[40,60]
@slot
![封面圖](assets/cover.jpg)
@slot
### 文字說明
這裡可以放段落、清單或其他 Markdown。
:::end-layout
```

```md
:::layout[25,35,40]
@slot
![img1](assets/a.jpg)
@slot
@video[Demo](https://example.com/demo.mp4)
@slot
@iframe[Site](https://example.com)
:::end-layout
```

- `:::layout[40,60]` 的數字代表各欄比例，會自動正規化為 100%。
- 若比例格式不正確，或比例數量與欄位數不一致，會自動平均分配。
- 欄位由 `@slot` 分隔。

#### 分行
```md
第一行文字 @br 第二行文字
```

```md
第一行 @br(2) 第三行
```

- `@br`：分行 1 次。
- `@br(n)`：分行 `n` 次（目前上限 6）。

### 媒體功能語法

#### Cover
```md
@cover(url)
```

- 封面容器會以中心裁切，比例為 `16:4`，並填滿目前內容區寬度。

#### 圖片

```md
![title](url)
![title](url){border=true,radius=true}
```

- `title` 會顯示在圖片下方並置中。
- 不需要標題可用 `![](url)`。
- 可在尾端加樣式參數：`{border=true,radius=true}`。
- 一般圖片（含單張顯示與 `layout` 內圖片）預設左右填滿當前欄位（`width: 100%`）。
- 圖片高度會隨寬度等比例調整（`height: auto`）。

#### 影片

```md
@video[title](url)
@video[title](url){border=true,radius=true}
```

- `title` 可為空：`@video[](url)`。
- 可在尾端加樣式參數：`{border=true,radius=true}`。
- 支援常見影片格式（如 `mp4`、`webm`、`ogg/ogv`、`mov`；實際播放能力依瀏覽器而定）。

#### GIF-like 影片

```md
@gif[title](url)
@gif[title](url){border=true,radius=true}
```

- 語法與 `@video` 相同：`title` 可為空，例：`@gif[](url)`。
- 可在尾端加樣式參數：`{border=true,radius=true}`。
- 行為為自動播放、循環、靜音、行動裝置內嵌播放（`autoplay + loop + muted + playsinline`）。
- 支援常見影片格式（如 `mp4`、`webm`、`ogg/ogv`、`mov`；實際播放能力依瀏覽器而定）。

#### 嵌入網頁

```md
@iframe[title](url)
@iframe[title](url){border=true,radius=true}
```

- `title` 可為空：`@iframe[](url)`。
- 可在尾端加樣式參數：`{border=true,radius=true}`。
- 非影片型 `@iframe` 會在右下角顯示極簡 `Full` 圖示按鈕，可直接進入全螢幕。
- 影片型嵌入（如 YouTube/Vimeo）不顯示自訂按鈕，維持播放器原生全螢幕控制。

#### 共用媒體樣式參數

- 適用於 `![]()`、`@video`、`@gif`、`@iframe`，以及 `:::gallery` 區塊參數。
- 寫法：在語法尾端加 `{key=value,key=value}`。
- 目前支援：
  - `border=true|false`（預設 `false`）
  - `radius=true|false`（預設 `true`）
  - 僅接受 `true` / `false` 兩種值（其他寫法會回退預設）
- 視覺效果：
  - `border=true` 時套用 `2px` 邊框。
  - `radius=true` 時套用 `8px` 圓角。
- 補充：`:::gallery` 區塊內每張圖片不解析 `{border,radius}`，由區塊參數統一控制。

## 新增專案

1. 在 `content/` 下對應分類資料夾（如 `PROJECT`、`ROBOT`、`DESIGN`、`WORKSHOP`）建立新專案資料夾。
2. 在該資料夾內新增 `content.md`。
3. 更新 `content/config.json`，加入專案 ID 到對應分類。
4. 專案會依照 `content/config.json` 順序顯示。

## 授權

MIT License

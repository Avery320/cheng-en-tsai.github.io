# [Portfolio](https://avery320.github.io/cheng-en-tsai.github.io/)

個人作品集網站，採用分屏式互動介面設計。

## 網頁風格

- 上方工具列全寬顯示，右側導航位於工具列下方（桌機/手機一致）
- 三欄式佈局：左側章節大綱、中央內容區、右側分類導航
- 左側章節大綱自動擷取 `h1~h6`，可收合章節並同步目前閱讀位置
- 左側大綱與中央內容採獨立捲動，長頁面閱讀更穩定
- 行動裝置優化：直式畫面自動隱藏左側大綱，右側改為漢堡選單側邊欄
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

## 專案結構

```text
├── index.html
├── css/
│   ├── typography.css
│   ├── grid.css
│   ├── panels.css
│   └── style.css
├── js/
│   ├── app.js
│   └── markdown-extensions.js
└── content/
    ├── config.json
    ├── about.md
    ├── PROJECT/
    ├── ROBOT/
    ├── DESIGN/
    └── WORKSHOP/
```

## 自訂 Markdown 語法

### Cover

```md
@cover(url)
```

- 封面容器會以中心裁切，比例為 `16:4`，並填滿目前內容區寬度。

### Grid

```md
:::grid
![title](url)
![title](url)
:::
```

- `:::grid` 主要用途是圖片並排。
- 圖片標題由 `![title](url)` 的 `title` 產生，置中顯示於圖片下方。
- 連續兩張圖片不需要空行，也可正確顯示各自標題。

### Layout（文字/圖片/影片混合）

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

### Media

#### 圖片

```md
![title](url)
```

- `title` 會顯示在圖片下方並置中。
- 不需要標題可用 `![](url)`。
- 一般圖片（含單張顯示與 `layout` 內圖片）預設左右填滿當前欄位（`width: 100%`）。
- 圖片高度會隨寬度等比例調整（`height: auto`）。
- `:::grid` 仍維持 Justified Gallery 的列對齊規則。

#### 影片

```md
@video[title](url)
```

- `title` 可為空：`@video[](url)`。
- 支援常見影片格式（如 `mp4`、`webm`、`ogg/ogv`、`mov`；實際播放能力依瀏覽器而定）。

#### GIF-like 影片

```md
@gif[title](url)
```

- 語法與 `@video` 相同：`title` 可為空，例：`@gif[](url)`。
- 行為為自動播放、循環、靜音、行動裝置內嵌播放（`autoplay + loop + muted + playsinline`）。
- 支援常見影片格式（如 `mp4`、`webm`、`ogg/ogv`、`mov`；實際播放能力依瀏覽器而定）。

#### 嵌入網頁

```md
@iframe[title](url)
```

- `title` 可為空：`@iframe[](url)`。
- 非影片型 `@iframe` 會在右下角顯示極簡 `Full` 圖示按鈕，可直接進入全螢幕。
- 影片型嵌入（如 YouTube/Vimeo）不顯示自訂按鈕，維持播放器原生全螢幕控制。

#### 分行

```md
第一行文字 @br 第二行文字
```

```md
第一行 @br(2) 第三行
```

- `@br`：分行 1 次。
- `@br(n)`：分行 `n` 次（目前上限 6）。

### 文件大綱面板

- 會自動讀取目前頁面的 `h1~h6` 建立左側章節大綱。
- 支援巢狀階層、章節收合與展開（符號：`⌵` / `▸`）。
- 捲動中央內容時，左側會自動高亮目前章節，並自動將 active 項目捲動到可視區。

### 語法相容性

- 舊語法 `@cover[url]`、`@video[url]`、`@iframe[url]` 已不支援。

## 新增專案

1. 在 `content/` 下對應分類資料夾（如 `PROJECT`、`ROBOT`、`DESIGN`、`WORKSHOP`）建立新專案資料夾。
2. 在該資料夾內新增 `content.md`。
3. 更新 `content/config.json`，加入專案 ID 到對應分類。
4. 專案會依照 `content/config.json` 順序顯示。

## 授權

MIT License

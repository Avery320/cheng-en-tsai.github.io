# [Portfolio](https://avery320.github.io/cheng-en-tsai.github.io/)

個人作品集網站,採用分屏式互動介面設計。

## 網頁風格

- 左右分屏佈局,左側展示內容,右側為導航
- 行動裝置優化：直式畫面自動切換為隱藏式側邊欄
- 使用 Markdown 管理所有內容
- 支援首頁扉頁封面（Notion 風格）
- 支援圖片並排網格 (Justified Gallery)
- 支援文字/圖片/影片多欄混合排版（可設定欄寬百分比）
- 支援影片播放與 iframe 嵌入
- URL Hash 路由,支援上一頁/下一頁（預設進入 `home`）
- 視窗縮放時自動重新計算圖片排版

## 技術

- HTML / CSS / JavaScript
- Marked.js (Markdown 解析)

## 專案結構

```
├── index.html
├── css/
│   ├── style.css
│   ├── typography.css
│   └── grid.css
├── js/
│   ├── app.js
│   └── markdown-extensions.js
└── content/
    ├── config.json
    ├── landing.md
    ├── about.md
    ├── PROJECT/
    ├── ROBOT/
    ├── DESIGN/
    └── WORKSHOP/
```

## 自訂 Markdown 語法

### Cover
#### 扉頁封面:
```
@cover[url]
```
註記：
- 封面容器會將圖片以中心點柴切成16:4的比列，填滿目前內容區寬度。

### Layout"
#### 圖片並排:
```
:::grid
![title](url)
![title](url)
:::
```

#### 文字圖片混合排版（左右 / 多欄）

- 混合排版規則:
  - `:::layout[40,60]` 中的數字代表各欄比例,會自動正規化為 100%，若未提供比例,或比例格式不正確,會自動平均分配欄寬。
  - 欄位由 `@slot` 分隔,比例數量需對應欄位數量

基礎語法
```
:::layout[40,60] 
@slot
![img](assets/cover.jpg)
@slot
### 文字說明
這裡可以放段落、清單或其他 Markdown。
:::end-layout
```

多欄混合排版（同一行多張圖片與文字）
```
:::layout[25,35,40] 
@slot
![img1](assets/a.jpg)
@slot
![img2](assets/b.jpg)
@slot
### Notes
可混用文字、圖片、@video、@iframe、:::grid。
:::end-layout
```

> 註記：
> - `:::grid` 主要用於圖片並排，建議只放圖片。
> - 若放入 `@video` 或 `@iframe` 雖可能被解析，但排版與 justify 行為不保證。
> - `:::layout` 支援在欄位中混用文字、圖片、`@video`、`@iframe`、連結網址。
> - 需要「圖片 + 影片 + 網址」混合內容時，優先使用 `:::layout`。


### Media
#### 圖片:
```
![title](url)
```
- `title` 會顯示在圖片下方並置中。
- 若不需標題可用：`![](url)`。

#### 影片:
```
@video[title](url)
```
- `title` 可為空：`@video[](url)`。
- 舊語法 `@video[url]` 不支援。

#### 嵌入網頁:
```
@iframe[title](url)
```
- `title` 可為空：`@iframe[](url)`。
- 舊語法 `@iframe[url]` 不支援。

## 新增專案

1. 在 `content/` 下的對應分類資料夾（如 `PROJECT`, `ROBOT`, `DESIGN`, `WORKSHOP`）建立新的專案資料夾。
2. 在該資料夾內新增 `content.md`
3. 更新 `content/config.json` 加入專案 ID 到對應分類。
4. 專案會依照 `content/config.json` 的順序顯示專案內容。

## 本地開發

```
python3 -m http.server 8000
```

開啟 http://localhost:8000

## 授權

MIT License

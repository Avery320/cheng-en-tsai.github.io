# [Portfolio](https://avery320.github.io/cheng-en-tsai.github.io/)

個人作品集網站,採用分屏式互動介面設計。

## 網頁風格

- 左右分屏佈局,左側展示內容,右側為導航
- 行動裝置優化：直式畫面自動切換為隱藏式側邊欄
- 使用 Markdown 管理所有內容
- 支援圖片並排網格 (Justified Gallery)
- 支援影片播放與 iframe 嵌入
- URL Hash 路由,支援上一頁/下一頁
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
    ├── about.md
    ├── PROJECT/
    ├── ROBOT/
    ├── DESIGN/
    └── WORKSHOP/
```

## 自訂 Markdown 語法

圖片並排:
```
:::grid
![alt](url)
![alt](url)
:::
```

影片:
```
@video[url]
```

嵌入網頁:
```
@iframe[url]
```

## 新增專案

1. 在 `content/` 下的對應分類資料夾（如 `PROJECT`, `ROBOT`, `DESIGN`, `WORKSHOP`）建立新的專案資料夾
2. 在該資料夾內新增 `content.md`
3. 更新 `content/config.json` 加入專案 ID 到對應分類
4. 專案會依照 `content/config.json` 的順序顯示專案內容

## 本地開發

```
python3 -m http.server 8000
```

開啟 http://localhost:8000

## 授權

MIT License

# Portfolio

個人作品集網站,採用分屏式互動介面設計。

## 功能特色

- 左右分屏佈局,左側展示內容,右側為導航
- 使用 Markdown 管理所有內容
- 支援圖片並排網格 (Justified Gallery)
- 支援影片播放與 iframe 嵌入
- URL Hash 路由,支援上一頁/下一頁
- 視窗縮放時自動重新計算圖片排版

## 技術

- HTML / CSS / JavaScript
- Marked.js (Markdown 解析)
- Noto Sans TC 字體

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
    └── DEVELOP/
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

1. 在 content/PROJECT/ 或 content/DEVELOP/ 建立資料夾
2. 在資料夾內新增 content.md
3. 更新 content/config.json 加入專案 ID

## 本地開發

```
python3 -m http.server 8000
```

開啟 http://localhost:8000

## 授權

MIT License

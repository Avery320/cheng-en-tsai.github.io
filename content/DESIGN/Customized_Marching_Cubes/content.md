# Customized_Marching_Cubes

- Designer: Avery Tsai
- Location: Pingtung, Taiwan  
- Date: 2023.06

---

## Introduction
:::layout[50,50]
@slot
本作品以 Marching Cubes 演算法為基礎，從體素（Voxel）資料所對應的基本拓樸出發，發展一系列可被重新詮釋的幾何構件與造型變化。透過將不同 case 視為形態語彙的組成單元，作品得以在規則框架內持續延伸，生成多種具有辨識度的三維型態。

在建模流程上，作品主要以 Rhino SubD 進行造型塑形，將原本較為離散、硬邊的體素幾何轉化為連續且具張力的曲面形式。形態生成的驅動方式包含隨機點位在體素空間中的分佈控制，以及引入如 康威生命遊戲（Game of Life） 等規則型演算法，讓局部結構依條件演化並形成不同的構件組合。

進一步延伸時，作品也嘗試將每個型態視為獨立單元，透過演算法定義其行為與任務，並使不同型態之間能以規則進行組合，形成多型態協同的系統構想。整體而言，本作品聚焦於以既有演算法為生成起點，結合 SubD 的建模語言，探索體素拓樸在造型與組構上的多種可能性。
@br(4)

---
#### Game of Life
本作品使用了 Game of Life（康威生命遊戲） 規則進行迭代生成點位，並將每次迭代的結果，在空間中垂直機錄下來，轉換為 3D 的體素（Voxel）資料，作為形體生成的基礎。接著使用 Marching Cubes 從體素場中提取主要外形，形成整體輪廓。

在細部表現上，作品將 Marching Cubes 的標準案例拓樸對應為一組自訂構件（Customized Marching Cubes Elements），以構件取代原本的面片輸出，使局部結構具有更明確的造型語彙。最後依體素矩陣的位置關係進行元件聚合，完成整體構成。
@slot
![Customazied Marching Cubes Elements](https://ik.imagekit.io/cheng3n/Customized_Marching_Cubes/elements.jpg){border=true,radius=true}
:::end-layout

![Game of Life](https://ik.imagekit.io/cheng3n/Customized_Marching_Cubes/game_of_life.jpg)

#### Random Point Generation
:::layout[30,35,35]
@slot
除了特定空間點的生成外，也可採用隨機或特定點位分佈作為起點，先在目標空間中以亂數產生點雲，並可透過密度、範圍或分層規則控制其分佈特徵。接著將點位轉換為 3D 體素資料，形成可供提取的體素場。

後續同樣以 Marching Cubes 從體素場中生成主要外形，並進一步以自訂構件取代標準面片輸出，最後透過體素矩陣的對位關係完成元件聚合與整體構成。 
@slot
![](https://ik.imagekit.io/cheng3n/Customized_Marching_Cubes/gif01.gif){border=true,radius=true}
@slot
![](https://ik.imagekit.io/cheng3n/Customized_Marching_Cubes/gif02.gif){border=true,radius=true}
:::end-layout

## 軌道漂流城｜Orbit-Drift City
在近地軌道的場景中，元件聚合體被視為一座正在移動的拼裝城市：由大量模組單元在空間中堆疊、銜接，形成可穿越的縫隙、框架與艙體般的結構層。隨著位置與視角改變，同一座結構呈現兩種截然不同的畫面感——掠過夜側（Night-Side Pass） 時，地表光帶成為背景，強調結構的尺度與貼近地球的速度感；轉向深空（Deep-Space Turn） 時，背景轉為星海與遠方的地球，模組細節被拉出更強的輪廓與景深，讓「漂浮中的空間構築」更清晰可讀。
:::grid
![掠過夜側｜Night-Side Pass](https://ik.imagekit.io/cheng3n/Customized_Marching_Cubes/001.jpg)
![轉向深空｜Deep-Space Turn](https://ik.imagekit.io/cheng3n/Customized_Marching_Cubes/001-2.jpg)
:::

## 零件星雲 | Module Nebula
在宇宙場景中，元件群以漂浮聚合的方式形成一片片鬆散卻有結構的「模組雲團」，像是碎片化艙體與拼裝殘骸在軌道上緩慢漂移。透過調整聚合密度、連結方式與分佈範圍，讓同一套元件在空間中呈現不同的聚落形態：近看能讀到大量細碎的拼接痕跡與局部結構，遠看則形成清楚的輪廓與流動方向，拉出前後景深與尺度層次，強化整體的漂浮感與空間張力。
:::grid
![](https://ik.imagekit.io/cheng3n/Customized_Marching_Cubes/Section%20in%20Universe_%E5%B7%A5%E4%BD%9C%E5%8D%80%E5%9F%9F%201.jpg?updatedAt=1765525969324)
![零件星雲 | Module Nebula](https://ik.imagekit.io/cheng3n/Customized_Marching_Cubes/Section%20in%20Universe-02.jpg?updatedAt=1765525968916)
![](https://ik.imagekit.io/cheng3n/Customized_Marching_Cubes/Section%20in%20Universe-03.jpg?updatedAt=1765525968583)
:::

## 模組化地景 | Modular Terrain
元件以不同的聚合狀態呈現：有些群落漂浮在空中，像是尚未落地的模組雲團；有些則逐步接地、堆疊、延展，形成更具重量感的巨構或遺跡。模組沿著地形聚集，長出柱狀量體、洞口般的框架與牆體斷面，建立清楚的尺度與空間層次。畫面同時保留兩種閱讀：近看是密集的拼接細節與單元語彙，遠看則是地景輪廓與結構張力的整體構成。
:::grid
![](https://ik.imagekit.io/cheng3n/Customized_Marching_Cubes/002.jpg)
![](https://ik.imagekit.io/cheng3n/Customized_Marching_Cubes/003.jpg?updatedAt=1772043550549)
![](https://ik.imagekit.io/cheng3n/Customized_Marching_Cubes/004.jpg)
:::

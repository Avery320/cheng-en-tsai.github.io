# Graphcrete
## : Robotic 3D Concrete Printing for Mold Construction Methodology
- 設計與製造: 蔡承恩
- 結構設計: 沈實
- 指導老師：顏嘉慶、沈揚庭、杜怡萱
- 時間: 2024.11
---

## 介紹
本專案是以機械手臂混凝土列印製造混凝構件做為混凝土模板使用，內部以鋼筋混凝土作為柱子的結構，探索混凝土列印構件用於建築構件的可行性。

:::grid
![](https://ik.imagekit.io/cheng3n/Graphcrete/001.png?updatedAt=1770897662130)
![](https://ik.imagekit.io/cheng3n/Graphcrete/002.jpeg?updatedAt=1770897640818)
![](https://ik.imagekit.io/cheng3n/Graphcrete/003.jpg?updatedAt=1770897639932)
:::

## 設計
本次形體設計是希望表現出列印工法所形成的積層表面的特色，與參數化形體的設計流程衍生到機器人製造的控制做整合，所以將本設計分為「造型、紋理、網格」三個層次。
:::layout[40,60] 
@slot
1. 造型：
在造型設計上主要以結構為前提考量的設計，並在長寬 60 公分的平面與鋼筋籠段面為直徑 45 公分的條件之下做造型的變化。
2. 紋理：
設計是以 Multi-scale Truchet Pattern 創作出來的圖形做為混凝土列印的表面紋理。其特色是以簡單單元並引入多尺度的向度所構成的有趣圖形，以此結合網格結構對於造型尺度的控制。
3. 網格：
網格是一種在 3D 建模與電腦圖形領域中廣泛應用的資料結構，是由頂點 (Vertex)、邊 (Edge) 和面 (Face) 所構成，用於表示 3D 物體的形狀與表面。
@br(1)
本設計以造型作為基礎，將形體以菱形網格型態進行重構，並利用網格結構的特性控制整體造型與造型的尺度與細節。
@slot
![Design Diagram](https://ik.imagekit.io/cheng3n/Graphcrete/%E5%BD%A2%E9%AB%94%E8%A8%AD%E8%A8%88.png?updatedAt=1770897658350)
:::end-layout
本設計方法以結構條件作為造型依據，先將柱體幾何轉換為可參數化控制的網格表面，再透過網格控制特性疊加 Multi-scale Truchet Pattern，進而產生具有多層次紋理表現的柱子設計。

### 造型
:::layout[40,60] 
@slot
- 造型設計上主要以結構為前提考量的設計，依照混凝土技術規則鋼筋保護層 40 公釐的規定，因此設計以圓柱體型態作為初始造型，再加上 60 公釐作為保護層的寬限，因此柱子斷面會在 450 至 570 公釐間做型態變化。
- 另外為了符合結構型態的前提下，增加柱體在形態上的變化，以下寬上窄的方針設計，在超出結構範圍的部分則採用雙層列印的方式，外層為完成面，符合整體柱子的紋理樣態，內層直接以 450 公釐的圓形斷面作為結構層。
@slot
![Structure Design](https://ik.imagekit.io/cheng3n/Graphcrete/str_design.jpeg?updatedAt=1770897653054)
:::end-layout


### 紋理
:::layout[50,50] 
- 紋理設計是以幾何邏輯與視覺層次為核心原則，透過 Truchet Pattern 的圖樣語彙，再以 Multi-scale Truchet Pattern 的多尺度概念進行延展。此設計方式不僅使紋理在局部具備細節變化，同時在整體上呈現秩序與隨機之間的張力。
![MultiScaleTruchetPattern_01](https://ik.imagekit.io/cheng3n/Graphcrete/MultiScaleTruchetPattern_01.jpg?updatedAt=1770897644550)

![MultiScaleTruchetPattern_02](https://ik.imagekit.io/cheng3n/Graphcrete/MultiScaleTruchetPattern_02.jpg?updatedAt=1770897643741)
@slot
![Mapping Pattern](https://ik.imagekit.io/cheng3n/Graphcrete/MappingPattern.jpeg?updatedAt=1770897649109)
:::end-layout

### 網格
:::layout[40,60] 
@slot
- 網格是一種在 3D 建模與電腦圖形領域中廣泛應用的資料結構，是由頂點 (Vertex)、邊 (Edge) 和面 (Face) 所構成，用於表示 3D 物體的形狀與表面。
- 本設計以造型作為基礎，將形體以菱形網格型態進行重構，並利用網格結構的特性控制整體造型與造型的尺度與細節（大小與密度）。
@br(2)
![Facade](https://ik.imagekit.io/cheng3n/Graphcrete/facade.png?updatedAt=1770897662159)
@slot
![Mesh](https://ik.imagekit.io/cheng3n/Graphcrete/mesh.png?updatedAt=1770897644920){border=true,radius=true}
:::end-layout


## 列印

:::layout[40,60] 
@slot
- < To be Continue...>

@slot
![Segmented Printing Model](https://ik.imagekit.io/cheng3n/Graphcrete/segmented_printing_model.png?updatedAt=1770897656293)
:::end-layout


### Module01 Printing Demo
@video[](https://ik.imagekit.io/cheng3n/Graphcrete/M1_printing_demo.mp4)

### Module06 Printing Demo
@video[](https://ik.imagekit.io/cheng3n/Graphcrete/M6_printing_demo.mp4?updatedAt=1765226514854)



## 建造流程
:::layout[30,35,35]
@slot
Graphcrete 的建造流程是將製造完成的混凝土模具透過吊掛的方式在現場組裝，後續澆灌混凝土形成混凝土構件。
@slot
![3DCP CONSTRUCTION](https://ik.imagekit.io/cheng3n/Graphcrete/3DCP_CONSTRUCTION0.jpg?updatedAt=1770897640286)
@slot
![Construction Workflow](https://ik.imagekit.io/cheng3n/Graphcrete/construction_workflow.gif?updatedAt=1770897678323)
:::end-layout

## 施工過程
:::grid
![3DCP_CONSTRUCTION01](https://ik.imagekit.io/cheng3n/Graphcrete/3DCP_CONSTRUCTION1.png?updatedAt=1770897664873)
![3DCP_CONSTRUCTION02](https://ik.imagekit.io/cheng3n/Graphcrete/3DCP_CONSTRUCTION2.png?updatedAt=1770897666085)
![3DCP_CONSTRUCTION03](https://ik.imagekit.io/cheng3n/Graphcrete/3DCP_CONSTRUCTION3.png?updatedAt=1770897664444)
![3DCP_CONSTRUCTION04](https://ik.imagekit.io/cheng3n/Graphcrete/3DCP_CONSTRUCTION4.png?updatedAt=1770897665425)
:::


## Graphcrete
![Graphcrete](https://ik.imagekit.io/cheng3n/Graphcrete/graphcrete_01?updatedAt=1765216268493)

## Thanks
- 特別感謝：式奧建築 毛映壹設計師
- 實驗協助：杜孟澤、鄭又碩、鄭睿
- 施工團隊：式奧建築、王宓琦、黃廉凱、陳宥豪、杜孟澤、徐薇、翁凱凌

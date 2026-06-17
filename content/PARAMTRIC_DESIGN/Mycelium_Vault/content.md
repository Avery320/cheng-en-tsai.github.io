# Mycelium_Vault
- Designer and researcher: Cheng-En Tsai(蔡承恩), Huai-An Tai(戴淮安)
- Advisor: Yu-Liang Hsu(徐宇亮), Chia-Ching Yen(顏嘉慶)
- Studio: Biomass Materials x Algorithm Structure Studio (BMAS Stuido)
- Location: Tainan, Taiwan  
- Date: 2024.12
---

:::grid
![](https://ik.imagekit.io/cheng3n/Mycelium_Vault/%E8%A1%A8%E7%8F%BE%E6%B3%95Poster_%E6%9C%9F%E4%B8%AD%E8%A8%88%E7%95%AB%E7%A0%94%E7%A9%B6%E6%88%90%E6%9E%9C%E5%B1%95%E7%A4%BA.png)
![](https://ik.imagekit.io/cheng3n/Mycelium_Vault/%E8%A1%A8%E7%8F%BE%E6%B3%95Poster_%E7%94%9F%E7%89%A9%E6%9D%90%E6%96%99%E8%A9%A6%E9%A9%97%E7%A0%94%E7%A9%B6%E6%88%90%E6%9E%9C.png)
![](https://ik.imagekit.io/cheng3n/Mycelium_Vault/%E8%A1%A8%E7%8F%BE%E6%B3%95Poster_%E6%BC%94%E7%AE%97%E8%A8%AD%E8%A8%88%E7%A0%94%E7%A9%B6%E6%88%90%E6%9E%9C%E5%B1%95%E7%A4%BA.png)
:::

## Introduction
隨著全球環境保護議題日益受到重視，能源消耗與永續發展已成為當代設計領域的重要關注焦點。在此背景下，建築材料與其製造與生產方式，亦面臨重新檢視與轉型的需求。如何在設計與建造過程中回應永續性議題，並降低對環境之負擔，已成為當前建築設計的重要課題。本設計以生物質材料為研究前提，以**菌絲體**作為研究對象。透過對材料特性之分析，以及生產流程與加工方法之實際操作與探討，嘗試建立菌絲體材料應用於建築構件之可行性。

本設計研究以將菌絲體以製造成**菌絲體磚**作為構築系統之基本單元，設計操作上以 X-Site 為基地條件，結合開羅五邊形鑲嵌（Cairo Pentagonal Tiling）與特魯謝圖樣（Truchet Pattern）之幾何邏輯，發展出多樣化之模組化磚單元。透過不同磚單元之組合，建構出拱形臨時構築，並藉此探討幾何生成、構造系統與材料應用之整合可能。

## 材料研究與試驗

### 菌絲體磚生產加工方法

:::layout[50,50] 
@slot
菌絲體磚的製作流程因不同研究與應用而有所差異，相關方法亦呈現多元發展，但整體而言，主要可歸納為原料均質化、滅菌、接種、模具培養與活性去除五個步驟。

首先，將生物基材進行同質化處理，使其達到適當的粒徑與含水狀態，並均勻混合後進行滅菌，以避免雜菌干擾後續培養過程。接續將處理後的基材進行菌絲接種，並填入預先設計的模具中進行培養，使菌絲於材料內部生長並形成結構。待菌絲生長至一定程度後，透過乾燥等方式去除其活性，使材料性質穩定。

在不同研究中，亦會透過調整培養環境條件，或添加特定化學物質以促進反應效率與生長速率，進而改變菌絲體材料的物理性質與機械性能。這些變因使菌絲體材料在強度、密度與耐久性等方面呈現多樣化特徵，並提供後續在設計與應用上的彈性與可能性。
@slot
< ...... >
:::end-layout

### 菌絲體磚生產加工方法

![material_manufacturing_process](https://ik.imagekit.io/cheng3n/Mycelium_Vault/brick_manufacturing_process.jpg)

## 設計運算
< ...... >
### 設計策略
:::layout[40,60] 
@slot
在研究過程中發現，菌絲體材料具備良好的抗壓性能與輕質特性，使其在承壓型構造中具有潛在優勢。因此，在構造設計上，本研究選擇以拱形構造作為發展方向，藉由拱結構之力學特性，使材料能有效發揮其抗壓能力，同時在達成大跨距的條件下，維持構造之輕量性與穩定性。

在設計發展過程中，本研究亦面臨幾何形式上的選擇與限制，特別是在三維自由曲面與二維曲面之間進行取捨。一方面希望保有設計上的彈性與形式變化，另一方面亦需考量材料製作、模具加工與組裝施工等技術條件所帶來之限制。因此，本研究在設計策略上，採取以可控制之曲面系統作為基礎，以兼顧設計表現與實際製作之可行性。
@slot
![design_strategy](https://ik.imagekit.io/cheng3n/Mycelium_Vault/strategy.png)
:::end-layout

依照上述條件限制，本研究將演算式設計作為主要方法，聚焦於解決磚構造之佈磚問題，透過演算法建立磚單元之排列與組構邏輯。進一步結合幾何圖樣之操作，探討如何透過圖樣生成之方式，整合材料特性與構造系統，使菌絲體磚在輕質條件下，仍能有效形成穩定之抗壓結構。

### 開羅五邊形鑲嵌與特魯謝圖樣
< ...... >

### 設計演算架構
< ...... >

## X-Site 設計提案

將設定完成之演算架構套用於拱頂構造後，可生成如圖所示之結果。透過特魯謝圖樣（Truchet Pattern）於曲面上的連續迭代，使圖樣沿拱頂表面綿延展開，形成具連續性之幾何構成。在設計操作上，本研究建立十六種不同之特魯謝圖樣單元，並透過亂數選擇之方式進行配置，使圖樣於拱頂表面形成具變異性的開孔分布，進而呈現類似有機生成之視覺效果。
@br(2)
在基地設計構想上，本研究以 X-Site 原有較為線性的動線作為出發，嘗試透過三跨拱頂構造之置入，打破既有空間之單一流動方向，並重新組織廣場空間之使用方式。拱頂構造不僅作為結構系統，同時亦成為空間經驗之介面，透過其尺度與連續性，創造出具有引導性與停留性的空間節點。

:::grid
![X-Site_plan](https://ik.imagekit.io/cheng3n/Mycelium_Vault/x-site_plan.png){border=true,radius=true}
![X-site_perspective](https://ik.imagekit.io/cheng3n/Mycelium_Vault/x-site_perspective.png){border=true,radius=true}
:::

## Design Rendering
:::grid
![](https://ik.imagekit.io/cheng3n/Mycelium_Vault/%E8%A8%AD%E8%A8%88%E5%9C%96%E8%AA%AA%E8%88%87%E6%95%88%E6%9E%9C%E5%9C%964.png?updatedAt=1765291394423)
![](https://ik.imagekit.io/cheng3n/Mycelium_Vault/%E8%A8%AD%E8%A8%88%E5%9C%96%E8%AA%AA%E8%88%87%E6%95%88%E6%9E%9C%E5%9C%965.png?updatedAt=1765291395237)
![](https://ik.imagekit.io/cheng3n/Mycelium_Vault/%E8%A8%AD%E8%A8%88%E5%9C%96%E8%AA%AA%E8%88%87%E6%95%88%E6%9E%9C%E5%9C%966.png?updatedAt=1765291392889)
![](https://ik.imagekit.io/cheng3n/Mycelium_Vault/%E8%A8%AD%E8%A8%88%E5%9C%96%E8%AA%AA%E8%88%87%E6%95%88%E6%9E%9C%E5%9C%9610.png?updatedAt=1765291394252)
:::

:::grid
![](https://ik.imagekit.io/cheng3n/Mycelium_Vault/%E8%A8%AD%E8%A8%88%E5%9C%96%E8%AA%AA%E8%88%87%E6%95%88%E6%9E%9C%E5%9C%968.png?updatedAt=1765291395698)
![](https://ik.imagekit.io/cheng3n/Mycelium_Vault/%E8%A8%AD%E8%A8%88%E5%9C%96%E8%AA%AA%E8%88%87%E6%95%88%E6%9E%9C%E5%9C%969.png?updatedAt=1765291394580)
![](https://ik.imagekit.io/cheng3n/Mycelium_Vault/%E8%A8%AD%E8%A8%88%E5%9C%96%E8%AA%AA%E8%88%87%E6%95%88%E6%9E%9C%E5%9C%9611.png?updatedAt=1765291395846)
![](https://ik.imagekit.io/cheng3n/Mycelium_Vault/%E8%A8%AD%E8%A8%88%E5%9C%96%E8%AA%AA%E8%88%87%E6%95%88%E6%9E%9C%E5%9C%9612.png?updatedAt=1765291394192)
:::


## Design Model
:::grid
![model_plan](https://ik.imagekit.io/cheng3n/Mycelium_Vault/Model_Plan.png)
![model_section](https://ik.imagekit.io/cheng3n/Mycelium_Vault/Model_Section.png)
![model_perspective](https://ik.imagekit.io/cheng3n/Mycelium_Vault/Model_Perspective.png)
:::


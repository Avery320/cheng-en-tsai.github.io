# 智慧建造：
## 基於數位雙生演算與機械手臂列印發展減碳預鑄免拆模鋼筋混凝土柱體工法之研究
- 計劃主持人：顏嘉慶
- 協同主持人：沈揚庭
- 研究成員：黃廉凱、蔡承恩、杜孟澤
- 研究期程：114.03.28 - 114.12.31
---

## 計劃背景
當前建築工程營造(Architecture, Engineering & Construction, AEC) 產業正處於轉型關鍵期。雖然整體工程技術體系已相對成熟，但施工現場仍高度依賴高風險、勞力密集的傳統工法，使得作業安全、工期穩定性與現場管理效能，長期受到人力結構與施工條件波動的影響。隨著缺工與少子化趨勢加劇，營造端面臨的人力壓力與生產不確定性持續上升，也促使產業必須尋找更具可預測性與可擴展性的建造模式。

在此背景下，混凝土預鑄工法因具備離場製造的生產特性，以及品質與精度可控的優勢，被視為同時回應人力需求與減碳目標的重要方向。然而，現行預鑄系統在面對複雜造型與多樣化構造需求時，仍存在明顯限制，導致預鑄難以有效支援現代建築對設計自由度與客製化的期待。換言之，產業目前所欠缺的，並非單一工法的改良，而是一套能夠兼顧效率、品質與設計彈性的整合性策略，使預鑄能從標準化生產，進一步擴展至「可被量化管理與客製化」的標準流程。

基於上述問題意識，本計畫扣合總統府「國家氣候變遷對策委員會」、「淨零路徑」主軸，將研究目標歸納為三項具體方向：
1. 以預鑄導向的建造策略，降低對現場人力的依賴，回應缺工趨勢下營造流程在安全性與工期穩定性上的需求。
2.	以數位製造作為生產主軸，提升構件品質與製造精度，建立更一致、更可控的建築生產模式。
3.	整合數位雙生演算與機械手臂列印流程，發展可支援客製化的免拆模減碳預鑄工法，使預鑄能進一步擴展到複雜造型與多樣化構造的應用情境。

## 材料研究

### 材料參數試驗
此階段的測試中以水泥、河沙、黏著劑、減水劑、早強防水劑、水作為主要列印材料。以固定的機器列印參數與水泥、河沙、黏著劑配比，以調整早強防水劑、減水劑與水此類水泥添加劑的配比為目標，測試不同配比對於列印材料工作度的影響。

#### 實驗試體
測試方式以圓柱體作為形體進行列印，測試材料堆積過程的工作度、支撐性與穩定度。
:::grid
![試體編號M1.0_02-01](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/M1.0_02-01.JPG)
![試體編號M1.0_02-02](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/M1.0_02-02.jpg)
![試體編號M2.0_02-01](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/M2.0_02-01.JPG)
![試體編號M2.0_02-02](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/M2.0_02-02.jpg)
:::

#### 實驗過程
@video[](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/IMG_9974.MOV)

### 材料結構試驗
3D 水泥列印屬於逐層堆疊的增材製造流程，材料在成形過程中會因列印路徑方向與層間堆疊方式而呈現明顯的異向性（Anisotropy）。其中，層與層之間的黏結界面往往是結構中相對脆弱的環節。
@br(1)
本研究採用 5x5x5cm³ 立方體作為試體，沿三個互相垂直的軸向（X、Y、Z）進行抗壓測試，分別對應平行於列印路徑、橫斷於列印路徑、以及垂直於層間黏結面的方向。
![](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/str_test_diagram.jpg)

試體以 15x15x15cm³ 立方體(切除後的尺寸)大小列印，裁切成 5x5x5cm³ 立方體作為試體，分別測試 x, y, z 三個方向的抗壓強度。

#### 試體列印
:::grid
![試體列印](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/cylinder_printing_01.jpg)
![試體](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/cylinder_printing_02.jpg)
![試體養護](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/cylinder_printing_03.jpg)
![養護後試體](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/cylinder_printing_04.jpg)
:::

#### 試體裁切
:::grid

![試體裁切](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/cylinder_cutting_01.jpg)
![X 向切面](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/cutting_section_02.jpg)
![Y 向切面](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/cutting_section_03.jpg)
![試體](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/cylinder.jpg?)
:::


#### 抗壓測試
:::grid
![試體001](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/compression_test_001.jpg)
![試體002](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/compression_test_102.jpg)
![試體201](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/compression_test_201.jpg)
![試體202](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/compression_test_202.jpg)
:::

## 殼體製造與澆置

### 模組列印
:::grid
![](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/m5_printing.jpg)
![](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/m5_printing2.jpg)
![](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/m5_printing3.jpg)
:::

### 模具組裝
:::grid
![](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/mold_assembly01.jpg)
![](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/mold_assembly02.jpg)
![](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/mold_assembly03.jpg)
:::

### 混凝土澆置


## 研究成果

## Surface Detail
:::grid
![Surface Detail01](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/srf01.JPG)
![Surface Detail02](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/srf02.JPG)
![Surface Detail03](https://ik.imagekit.io/cheng3n/%E5%BB%BA%E7%AF%89%E7%A0%94%E7%A9%B6%E6%89%80/srf03.JPG)
:::

## 討論

本研究之結論指出，3D 列印混凝土外模（免拆模）工法在「複雜幾何落地」與「製造流程數位化」兩個面向展現出明確價值。其核心優勢在於可將構件外形直接轉化為可製造的成形層，突破傳統模板在造型調適性上的限制，使複雜曲面與非典型構件得以在更可控的製程條件下被穩定製作。由於外模在灌注後可保留於構件中成為結構的一部分，此一設計邏輯亦使模板不再僅是一次性施工耗材，而是轉化為構件的功能層，進一步強化構件成形的整體一致性與工序整合效率。

在施工與生產流程上，本研究強調以數位化方式串接設計、規劃與製造環節，使構件從模型資訊到現場執行具備更高的可預測性。透過將造型資訊、製程參數與施工流程納入同一套規劃框架，可降低現場試誤與反覆調整所造成的不確定性，並提升品質穩定性與工期掌控能力。此一由設計到製造的整合路徑，使免拆模外模不僅是造型工具，更是一種能支援工程管理與生產控制的建造策略。

同時，本研究亦建立可持續擴充的量化評估架構，作為技術落地與導入決策的依據。該架構聚焦於四項指標：碳排、時間、空間與成本，分別對應環境負荷、製程效率、場域調度與資源投入等關鍵面向。此四項指標可用於後續建立列印作業的節點模型與參數化估算方法，支援不同尺度與不同造型構件的製造規劃，並作為技術優化與應用策略調整的依據。

綜合而言，本研究確認 3D 列印混凝土外模（免拆模）工法具備推動複雜構造數位製造的潛力，能在提升造型自由度的同時，建立更可控、更可驗證的建造流程。其成果不僅提供一條面向複雜構件的可行製造路徑，也為後續在永續性、效率與工程落地層面的深化研究奠定基礎。


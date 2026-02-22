# 整合機械手臂與電腦視覺發展自組立低碳循環建材暨建構系統
## The Integration of Robotic Arm and Computer Vision Apply to the Development of Self-Construction Low Carbon Circular Materials and Tectonics System
- 計劃主持人：沈揚庭（建築）
- 共同主持人：蘇文鈺（資工）、劉光晏（土木）、顏嘉慶（建築）
- 計畫助理: 蔡承恩（建築）、曾裕翔（資工）、劉宇庭（土木）
- 時間: 2024.11
---

## 專案背景
隨著少子化與高齡化趨勢加劇，建築產業面臨嚴重的人力短缺與施工品質不穩問題。傳統工地高度依賴人工，難以在複雜且變動的環境中維持效率與精準度。本研究導入機械手臂、自走車與電腦視覺技術，結合數位雙生模型，發展一套智慧化施工系統，驗證機器人在工地環境中自主移動與自動疊磚的可行性，作為智慧工地發展的基礎實踐。

## 專案介紹-自主移動疊磚機器人
本研究提出一套整合自走車導航與數位雙生疊磚機制的智慧建造系統，核心目標為實現機器人在工地環境中的自主移動與自動疊磚作業。系統以 Jetson Nano 為控制核心，採用 ROS 架構整合感測、控制與資料處理功能。系統包含兩項主要任務：
1. Lidar 導航與自走車避障：
透過 Lidar 掃描環境建立地圖，進行路徑規劃與即時避障，使 AGV 能在工地環境中安全移動。
2. 空間放樣與數位雙生疊磚系統：
利用 RealSense 與 ArUco Code 進行空間定位與手眼校正，完成虛實座標轉換後，由機械手臂依預設路徑自動夾取並堆疊磚塊。

![](https://ik.imagekit.io/cheng3n/Robotic_Tectionics/storyboard.jpg)


## 研究與技術架構

:::layout[50,50] 
@slot
#### Lidar 導航與自走車避障
本系統透過搭載 Lidar 的自走車（AGV）進行現場即時掃描，並於 Foxglove 平台建立環境模型，完成自主導航與避障。系統流程包含三個階段：
1. 地圖掃描：Lidar 掃描環境並建立空間地圖，作為導航依據。
2. 路徑規劃：Jetson Nano 根據即時資料計算行進路線，並因應環境變動進行動態調整。
3. 移動避障：由 ESP32 控制車體運動，於行進中持續修正路徑，確保安全穩定移動。
@slot
#### 空間放樣與數位雙生疊磚系統
本系統整合空間定位、虛實座標轉換與機械手臂控制，實現數位雙生疊磚流程，包涵三項主要功能：
1. 空間定位：使用 RealSense 掃描 ArUco Code，完成手眼校正與機械手臂座標定位（Base0）。
2. 座標轉換：透過 Rhino 與 Grasshopper 建立模型與施工路徑，並將虛擬路徑轉換至真實施工空間。
3. 自動疊磚：經由 ROS 傳送控制指令，機械手臂依預設路徑自動夾取並精準堆疊磚塊。
:::end-layout

![tech_flowchart](https://ik.imagekit.io/cheng3n/Robotic_Tectionics/tech_flowchart.png?updatedAt=1771754481215)


## 研究成果
@iframe[](https://player.vimeo.com/video/1033609545)

## 感謝
本研究特別感謝王宓琦、賴溡雨、曾裕翔、林庭崇各位學長、姐與同學們在技術與測試上的協助，以及感謝成功大學數位自造工坊（Rac-coon）在設備上的支援。


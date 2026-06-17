# 整合機械手臂與電腦視覺發展自組立低碳循環建材暨建構系統
### The Integration of Robotic Arm and Computer Vision Apply to the Development of Self-Construction Low Carbon Circular Materials and Tectonics System


## 專案背景
本計畫以智慧工地為應用場景，探索機器人在建築施工流程中的自動化協作可能。研究整合機械手臂、自走車、電腦視覺與數位雙生模型，聚焦於工地環境中的自主移動、定位感知與自動疊磚流程，作為機器人施工系統導入現場的基礎實踐。

## 自主移動疊磚機器人
計畫以自動疊磚作業作為智慧工地的實驗任務，聚焦於機器人如何在工地環境中完成移動、定位與施工動作的整合。系統以 Jetson Nano 作為控制核心，並透過 ROS 架構串接自走車導航、環境感測、空間定位與機械手臂控制。系統主要包含兩個部分：
1. 透過 LiDAR 進行環境建圖、路徑規劃與即時避障，使自走車能在場域中自主移動。
2. 透過 RealSense 與 ArUco Code 進行空間定位與手眼校正，建立數位模型與實體場域之間的座標對應，讓機械手臂能依據預設路徑完成夾取與疊磚作業。

![tech_flowchart](https://ik.imagekit.io/cheng3n/Robotic_Tectionics/tech_flowchart.png?updatedAt=1771754481215)

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

![](https://ik.imagekit.io/cheng3n/Robotic_Tectionics/storyboard.jpg){border=true,radius=false}




## 研究成果
@iframe[](https://player.vimeo.com/video/1033609545)


## Project Team
- 計劃主持人：沈揚庭（建築）
- 共同主持人：蘇文鈺（資工）、劉光晏（土木）、顏嘉慶（建築）
- 計畫助理: 蔡承恩（建築）、曾裕翔（資工）、劉宇庭（土木）
- 時間: 2024.11

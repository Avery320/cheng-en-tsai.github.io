# RoboSim

- Developer: Avery Tsai
- Update: 2026.02

- GitHub: [RoboSim](https://github.com/avery320/robot-demo)
- Web Link: [RoboSim](https://avery320.github.io/robot-demo/javascript/example/bundle/main.html)

## Introduction
- RoboSim 是一個輕量化的機器人控制與可視化平台，系統以 Javascript 開發支援網頁版的多設備使用，並可透過 Rust 封裝轉譯為跨平台桌面應用程式。
- 該平台目前以上銀機械手臂為對象進行開發，使用 ROS Bridge 與 ROS 進行連線。後端建立**逆向運動學（Axis, MoveJ, MoveL）**與**數位訊號控制（Digital Output）**、**等待（WAIT）** 等相關指令[**hiwin_rak**](#ROBOT/Hiwin_rak)；前端將這些控制方法整合成可直覺操作介面，希望使用者可以以 **No-Code** 的方式於操作機器人。
- 系統同時整合 ROS 常用視覺化 Topic，例如 /MarkerArray、/Image、/TF 等，並於平台內即時顯示；此外亦整合 roslog 輸出資訊，呈現 ROS 運行期間的 console 訊息，以協助使用者即時掌握機器人狀態。
- RoboSim 具備完整的座標系統架構，並整合六軸機械手臂之 IK 解耦機制。使用者可直接拖曳末端執行器（End Effector）以更新 TCP 位姿與 Joint 狀態，並將運算結果傳送至 ROS 進行實際控制。
- RoboSim 以上述功能為基礎，延伸至 **No-code 卡片控制方法** 與 [**Grasshopper 整合**](#ROBOT/RoboSimxGrasshopper)。

:::grid
@gif[urdf_loader](https://ik.imagekit.io/cheng3n/RoboSim/urdf_loader.mov/ik-video.mp4?updatedAt=1770955681418)
@gif[robosim_tcp](https://ik.imagekit.io/cheng3n/RoboSim/tcp_ctrl.mov)
@gif[ros_topic](https://ik.imagekit.io/cheng3n/RoboSim/ros_topic.mov/ik-video.mp4?updatedAt=1770956633417)
:::

### RoboSim Interface
RoboSim 的介面分為 **模型操作介面**、**控制面板**與**工具列**三大部分，以及 **Dock** 模組工具用於依照專案需求調整介面布局。

:::layout[40,60]
@slot
1. 模型操作介面：操作機器人模型與顯示機器人狀態，並有完整的座標系統與相機視角，可透過滑鼠與鍵盤控制相機視角與操作模型。
2. 控制面板：主要的功能區塊，包括基礎的 **Visualization** 用於各種控制按鈕集成、**Topic Panel** 訂閱 ROS Topic 顯示資訊、**roslog** 顯示 ROS 運行時的 console 信息等；以及以此擴充的 **Card Programming** 使用卡片控制發布的 No-code 控制方法、[**GHBridge**](#ROBOT/RoboSimxGrasshopper) 用於 Grasshopper 介面控制橋樑等工具，與 **terminal** 集成，可直接調用電腦上的 terminal 運行 docker ，時現在同一個介面上啟動機器人完整功能。
3. 工具列：包含 URDF 模型加載、ROS Bridge 連線，控制面板的啟用管理。
@slot
@video[](https://ik.imagekit.io/cheng3n/RoboSim/robosim_operation.mp4)
:::end-layout

### ROS Topic Visualizer
RoboSim 依照使用需求開發相關的 ROS Message 顯示功能，目前支援 /PlanningMotion, /MarkerArray, /Image, /Pose, /TF 五種 ROS Massege 的顯示。
- /PlanningMotion：載入相關環境模型，並可用於機械手臂路徑規劃時的碰撞機算。
- /MarkerArray：用於顯示機機械手臂的路徑規劃軌跡。
- /Image：支援 RealSense 等相機設備的影像畫面顯示。
- /Pose：顯示機器人末端執行器座標姿態。
- /TF：顯示機器人位置與偵測資料的座標軸。

:::grid
![PlanningScene](https://ik.imagekit.io/cheng3n/RoboSim/PlanningScene.png)
![MarkerArray](https://ik.imagekit.io/cheng3n/RoboSim/MarkerArray.png)
![Image](https://ik.imagekit.io/cheng3n/RoboSim/Image.png)
![Pose](https://ik.imagekit.io/cheng3n/RoboSim/Pose.png)
![TF](https://ik.imagekit.io/cheng3n/RoboSim/TF.png)
:::

## [Demo](https://avery320.github.io/robot-demo/javascript/example/bundle/main.html)
- <目前僅開放前端操作，無逆向運動學功能。>
前端可使用的功能包括：
- 機器人基礎互動控制：
- Card Program：可直接紀錄 joint, /tcp 數值，透過 slider 可以進行播放。
- Pose Control：可偵測左手關節姿態，簡易的控制機器人。
- Terminal ：連線到電腦的 terminal，可直接操作電腦上的 docker。

@iframe[](https://avery320.github.io/robot-demo/javascript/example/bundle/main.html)

## 相關應用
@iframe[鋼筋放置](https://www.youtube.com/embed/gtMqxSNJJpk)
@iframe[連線操作](https://www.youtube.com/embed/xsttGVKjYsg)

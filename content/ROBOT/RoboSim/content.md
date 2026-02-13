# RoboSim

- Developer: Avery Tsai
- Update: 2026.02

- GitHub: [RoboSim](https://github.com/avery320/robot-demo)
- Web Link: [RoboSim](https://avery320.github.io/robot-demo/javascript/example/bundle/main.html)

## Introduction
- RoboSim 是一個輕量化的機器人控制與可視化平台，系統以 Javascript 開發與透過 Rust 轉換成桌面應用兩種方式呈現。
- 該平台目前以上銀機械手臂為對象進行開發，使用 ROS Bridge 與 ROS 進行連線。後端建立**逆向運動學（Axis, MoveJ, MoveL）**與**數位訊號控制（Digital Output）**、**等待（WAIT）**等相關指令；前端將這些控制方法整合成可直覺操作介面，希望使用者可以以 **No-Code** 的方式於操作機器人。
- 同時整合了 ROS 中相關視覺化的 ROS Topic ，如 /MarkerArray, /Image, /TF 等，將其視覺化顯示在平台中；以及 roslog 顯示 ROS 運行時的 console 信息，方便使用者了解機器人狀態。
- 擁有完整的**座標系統**，與整合六軸機械手臂的 **IK 解耦**，使用者可以直接拖曳控制末端執行器即可更新 TCP 位置與 Joint 狀態，然後將數值發送至 ROS 調用相關方法進行控制。
- RoboSim 以上述功能為基礎，延伸至 **No-code 卡片控制方法** 與 [**Grasshopper 整合**](#ROBOT/RoboSimxGrasshopper)。

:::grid
![urdf_loader](https://ik.imagekit.io/cheng3n/RoboSim/urdf_loader.mov/ik-video.mp4?updatedAt=1770955681418)
![robosim_tcp](https://ik.imagekit.io/cheng3n/RoboSim/tcp_ctrl.mov)
![ros_topic](https://ik.imagekit.io/cheng3n/RoboSim/ros_topic.mov/ik-video.mp4?updatedAt=1770956633417)
:::

### RoboSim Interface
- RoboSim 的介面分為 **模型操作介面**、**控制面板**與**工具列**三大部分，以及 **Dock Layout** 模組工具用於依照專案需求調整介面布局。

:::layout[35,65]
@slot
1. 模型操作介面：操作機器人模型與顯示機器人狀態，並有完整的座標系統與相機視角，可透過滑鼠與鍵盤控制相機視角與操作模型。
2. 控制面板：主要的功能區塊，包括基礎的 **Visualization** 用於各種控制按鈕集成、**Topic Panel** 訂閱 ROS Topic 顯示資訊、**roslog** 顯示 ROS 運行時的 console 信息等；以及以此擴充的 **Card Programming** 使用卡片控制發布的 No-code 控制方法、[**GHBridge**](#ROBOT/RoboSimxGrasshopper) 用於 Grasshopper 介面控制橋樑等工具，與 **terminal** 集成，可直接調用電腦上的 terminal 運行 docker ，時現在同一個介面上啟動機器人完整功能。
3. 工具列：包含 URDF 模型加載、ROS Bridge 連線，控制面板的啟用管理。
@slot
@video[https://ik.imagekit.io/cheng3n/RoboSim/robosim_operation.mp4]
:::end-layout

### ROS Topic Visualizer
- RoboSim 目前支援 /PlanningMotion, /MarkerArray, /Image, /Pose, /TF 五種 ROS Massege 的顯示。 

:::grid
![PlanningScene](https://ik.imagekit.io/cheng3n/RoboSim/PlanningScene.png)
![MarkerArray](https://ik.imagekit.io/cheng3n/RoboSim/MarkerArray.png)
![Image](https://ik.imagekit.io/cheng3n/RoboSim/Image.png)
![Pose](https://ik.imagekit.io/cheng3n/RoboSim/Pose.png)
![TF](https://ik.imagekit.io/cheng3n/RoboSim/TF.png)
:::

## [Demo](https://avery320.github.io/robot-demo/javascript/example/bundle/main.html)
- <目前僅開放前端操作，無逆向運動學功能。>
@iframe[https://avery320.github.io/robot-demo/javascript/example/bundle/main.html]



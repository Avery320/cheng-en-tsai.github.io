# RoboSim

- Developer: Avery Tsai
- Update: 2026.02

- GitHub: [RoboSim](https://github.com/avery320/robot-demo)
- Web Link: [RoboSim](https://avery320.github.io/robot-demo/javascript/example/bundle/main.html)

## Introduction
- RoboSim 是一個輕量化的機器人控制與可視化平台，系統以 Javascript 開發與透過 Rust 轉換成桌面應用兩種方式呈現。
- 該平台目前以上銀機械手臂為對象進行開發，使用 ROS Bridge 與 ROS 進行連線。後端建立逆向運動學（Axis, MoveJ, MoveL）與數位訊號控制（Digital Output）、等待（WAIT）等相關指令；前端將這些控制方法整合成可直覺操作介面，希望使用者可以以 No-Code 的方式於操作機器人。
- RoboSim 也整合了 ROS 中相關視覺化的 Topic ，如 /MarkerArray, /Image, /TF 等，將其視覺化顯示在平台中，方便使用者了解機器人狀態。
- 研究也以此為基礎，延伸至 **No-code 卡片控制方法** 與 [**Grasshopper 整合**](#ROBOT/RoboSimxGrasshopper)。

:::grid
<!-- ![Robot_loader]() -->
![RoboSim_tcp](https://ik.imagekit.io/cheng3n/RoboSim/robosim_tcp.gif?updatedAt=1770898850454)
<!-- ![ROS_topic](https://ik.imagekit.io/cheng3n/RoboSim/ros_topic.gif?updatedAt=1770900953976) -->
:::

### RoboSim UI

### ROS Topic Visualizer

:::layout[33.33,33.33,33.33]
@slot
- RoboSim 目前支援 /PlanningMotion, /MarkerArray, /Image, /Pose, /TF 五種 ROS Massege 的顯示。 
@slot
![PlanningScene](https://ik.imagekit.io/cheng3n/RoboSim/PlanningScene.png)
@slot
![MarkerArray](https://ik.imagekit.io/cheng3n/RoboSim/MarkerArray.png)
:::end-layout

:::layout[33.33,33.33,33.33]
@slot
![Image](https://ik.imagekit.io/cheng3n/RoboSim/Image.png)
@slot
![Pose](https://ik.imagekit.io/cheng3n/RoboSim/Pose.png)
@slot
![TF](https://ik.imagekit.io/cheng3n/RoboSim/TF.png)
:::end-layout


## [Demo](https://avery320.github.io/robot-demo/javascript/example/bundle/main.html)
- <目前僅開放前端操作，無逆向運動學功能。>
@iframe[https://avery320.github.io/robot-demo/javascript/example/bundle/main.html]



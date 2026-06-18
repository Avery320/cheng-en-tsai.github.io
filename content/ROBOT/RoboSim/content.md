# RoboSim

- Developer: Avery Tsai
- Update: 2026.06

- GitHub: [RoboSim](https://github.com/avery320/robot-demo)
- Web Link: [RoboSim](https://avery320.github.io/robot-demo/javascript/example/bundle/main.html)
- Link: [ros-docker](#ROBOT/ROS_Docker)

## Introduction
RoboSim 是一個面向營建機器人應用的控制平台，聚焦在銜接建築設計資料與機械手臂建造流程之間的落差。平台整合機器人模型顯示、幾何資料管理、Grasshopper 資料串接與控制流程，讓參數化設計中的空間與路徑資訊能更直覺地進入機器人操作環境。

RoboSim 以 URDF 作為機器人模型與控制資訊的核心基礎，前段整合了，並整合 Offline Programming（ROS2） 與 Online Control 兩種控制系統。Offline Programming 適用於預先規劃、模擬與重複性較高的建造任務，產生穩定、可執行的機器人路徑與程式檔案；Online Control 則面向現場操作情境，透過即時感測與狀態回饋，協助操作者理解現場環境與機器人狀態，進行更即時的操作判斷與控制。

### 特色
- 以 URDF 驅動。
- ROS2 整合，ROS Topic 發布與訂閱。
- 正向和逆向運動學（FK/IK）求解器，KUKA 與 HIWIN 機器人程式生成。
- 幾何顯示與模擬。
- Grasshopper Connector 整合 Grasshopper 中的操作。

## [Demo-Web](https://avery320.github.io/robot-demo/javascript/example/bundle/main.html)
@iframe[](https://avery320.github.io/robot-demo/javascript/example/bundle/main.html)

## ik-slover
@iframe[](https://www.youtube.com/embed/EqTBp9LsCHo?si=MSp6UrwfVoZ-PqWi)

## gh connector - control tcp
@iframe[](https://youtube.com/embed/APWbzOoPNg0?si=NARThvoNcCnVnz8a)

## Connect ROS backend and using Ipad control HIWIN robotic arm
@iframe[Ipad Control HIWIN Robotic Arm](https://www.youtube.com/embed/KUGkMLKQvHI)

## 相關應用
:::layout[50,50]
@slot
@iframe[鋼筋放置](https://www.youtube.com/embed/gtMqxSNJJpk)
@slot
@iframe[連線操作](https://www.youtube.com/embed/xsttGVKjYsg)
:::end-layout

# Robosim x Grasshopper

- Developer: Avery Tsai
- Update: 2026.02

## Introduction
- RoboSim x Grasshopper 是將 RoboSim 的機器人控制功能與 Grasshopper 串接。（請見 [RoboSim](#ROBOT/RoboSim)）
- 透過在 RoboSim 引入了一個中繼伺服器（relay server），使用 WebSocket 獲取機器人狀態並發送至指定的端口。在 Grasshopper 端使用 UDP 監聽該端口以獲取即時關節數據。
- URDF 模型請見 [URDF_Loader](#ROBOT/URDF_Loader)。

---

## Demo
@iframe[https://ik.imagekit.io/cheng3n/RoboSim/connectgh.mp4]

## RoboSim & Grasshopper UI
:::grid
![robosimUI](https://ik.imagekit.io/cheng3n/RoboSim/robosimUI.png?updatedAt=1770900765312)
![gh](https://ik.imagekit.io/cheng3n/RoboSim/gh.png?updatedAt=1770900798735)
:::

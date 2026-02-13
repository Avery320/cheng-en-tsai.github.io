# Hiwin Robot Arm Kinematics (hiwin_rak)

- Developer: Avery Tsai
- Update: 2025.12

## Introdcution
Hiwin_rak 這是一個基於 ROS 開發的 Hiwin 機械手臂控制專案，採用即時控制的方式控制機器人，專案以上銀科技官方提供的 [hiwin_ros](https://github.com/HIWINCorporation/hiwin_ros.git) 為基礎，使用 [hiwin_robot_client_library](https://github.com/HIWINCorporation/hiwin_robot_client_library.git) 中的 TCP 協議與實體機械手臂通訊達到透過 ROS 控制機器人的目標。

目前提供了 **Axis (關節數值控制)**, **moveJ (關節運動)**, **moveL (空間運動)** 三種運動控制方式，以及與 **digital output（數位控制）** 及 **WAIT(等待)** 的控制方法。

## ROS Massage
本專案定義 MotionCommand 與 MotionSequence 兩種 ROS Message 用於序列化控制指令，MotionCommand 包含了 **Axis**, **moveJ**, **moveL**, **digital output**, **WAIT** 五種控制指令的基礎格式，MotionSequence 則是將多個 MotionCommand 的序列進行封裝，使用 JSONL 的格式進行儲存與讀取，內容如下：
- {"motion_type": "axis", "joint1": 45.0, "joint2": 0.0, "joint3": 0.0, "joint4": 180.0, "joint5": 0.0, "joint6": -180.0} 
- {"motion_type": "moveJ", "x": -1.0, "y": 0.0, "z": 0.5, "roll": 0.0, "pitch": 0.0, "yaw": 90.0}
- {"motion_type": "moveL", "x": -1.0, "y": 0.0, "z": 0.8, "roll": 0.0, "pitch": 0.0, "yaw": 90.0}
- {"DO": 0, "state": "on"},
- {"wait_time": 5.0},

### 方法
< to be continue...>

## 架構
Hiwin_rak 採用低耦合的模組化分層架構，將整體功能劃分為四個主要層級，分別核心算法層（src/core）、工具層（src/utils）、節點層（scripts）與使用者介面層（ui），此一架構設計的目的，在於將控制、運算等不同層級的腳本分開管理，以利後續擴充與維護。

:::layout[30,70] 
@slot
- 核心算法（src/core）：核心模組負責實際的運算與控制邏輯，包含「運動控制」、「指令載入」、「序列發布」與「執行回饋」等控制流程功能。
- 工具層（src/utils）：工具函式為支援 Core 模組運行的相關輔助功能。包含「錯誤處理」、「資源清理」、「座標轉換」、與「運動規劃參數設定」各類基礎服務。
- 腳本（scripts）：腳本主要是將相關的功能組織成 ROS 節點，負責訂閱與發布 ROS Topics、Services，調用相關功能執行對應之控制流程。
- 使用者介面（ui）：提供基本的控制介面，包含控制按鈕、狀態顯示等元素，方便使用者操作與監控。
@slot
![hiwin_rak_flowchart](content/ROBOT/Hiwin_rak/asset/hiwin_rak_architecture.png)
:::end-layout

## 流程
:::layout[50,50] 
@slot
Hiwin_rak 的控制流程主要由 motion_executor.py 與 planner_node.py 兩個節點運行：
- planner_node.py 用於讀取 JOSNL 檔案中的 MotionSequence 資料並將其發佈至 /motion_sequence topic。
- motion_executor.py 則負責訂閱 /motion_sequence 並逐行發布 MotionCommand 資料，之後會進行解析調用相應的控制方法執行，並返回執行狀態，直到序列結束。
---
---
Hiwin_rak 的使用者介面提供基本的控制按鈕與狀態顯示，方便使用者操作與查看狀態。

![rviz](content/ROBOT/Hiwin_rak/asset/rviz.png)
![ui](content/ROBOT/Hiwin_rak/asset/ui.png)

@slot
![rak_flowchart](content/ROBOT/Hiwin_rak/asset/rak_flowchart.png)
:::end-layout

## Demo
< to be continue...>

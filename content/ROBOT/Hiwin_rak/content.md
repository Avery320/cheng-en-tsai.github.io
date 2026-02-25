<!-- @cover(https://example.com/cover.jpg) -->

# Hiwin Robot Arm Kinematics (hiwin_rak)

- Developer: Avery Tsai
- Update: 2025.12

## Introdcution
Hiwin_rak 這是一個基於 ROS 開發的 Hiwin 機械手臂控制專案，採用即時控制的方式控制機器人，專案以上銀科技官方提供的 [hiwin_ros](https://github.com/HIWINCorporation/hiwin_ros.git) 為基礎，使用 [hiwin_robot_client_library](https://github.com/HIWINCorporation/hiwin_robot_client_library.git) 中的 TCP 協議與實體機械手臂通訊達到透過 ROS 控制機器人的目標。
@br(2)
目前提供了 **Axis (關節數值控制)**, **moveJ (關節運動)**, **moveL (空間運動)** 三種運動控制方式，以及 **digital output（數位控制）** 和 **WAIT(等待)** 的控制方法。
@br(2)
本專案用於控制 HIWIN 機械手臂夾取鋼筋，放置於混凝土模具中為目標，因此該控制方法自定義 ROS Message 與使用 JSONL 的檔案格式，與設計常使用的 Rhino/Grasshopper 軟體整合，其目的為使用 Rhino/Grasshopper 進行機械手臂的工作路徑規劃，並交由 ROS 計算機器人的運動軌跡控制機器人。
@br(2)
本專也與 [**RoboSim**](#ROBOT/RoboSim) 進行整合，將該方法以 docker 的方式打包運行，使用 RoboSim 完整的控制介面進行操作。

![hiwin_rak + HIWIN Robotic Arm + Grasshopper]()

## 資料結構定義
本專案定義 MotionCommand 與 MotionSequence 兩種 ROS Message，用於序列化控制指令並以 JSONL 格式儲存與讀取。MotionCommand 提供五種基礎指令格式： **Axis**, **moveJ**, **moveL**, **digital output**, **WAIT** ；MotionSequence 則封裝多筆 MotionCommand 形成可執行的指令序列。內容如下：
- {"motion_type": "axis", "joint1": 45.0, "joint2": 0.0, "joint3": 0.0, "joint4": 180.0, "joint5": 0.0, "joint6": -180.0} 
- {"motion_type": "moveJ", "x": -1.0, "y": 0.0, "z": 0.5, "roll": 0.0, "pitch": 0.0, "yaw": 90.0}
- {"motion_type": "moveL", "x": -1.0, "y": 0.0, "z": 0.8, "roll": 0.0, "pitch": 0.0, "yaw": 90.0}
- {"DO": 0, "state": "on"},
- {"wait_time": 5.0},

控制系統會依 MotionCommand 的控制模式分派至對應流程：
1. MoveJ / MoveL（空間運動）：
以 (x, y, z, roll, pitch, yaw) 描述目標位置與姿態，轉換為 /Pose 作為運動規劃輸入；MoveJ 以關節空間為主，MoveL 以末端直線運動為主，交由運動規劃模組進行 IK 與路徑規劃並生成軌跡。
2. Axis（關節控制）：
直接以各關節角度描述目標狀態，仍透過關節空間規劃流程執行，以保留插值與安全檢查等機制。
3. DO（數位輸出）：
用於同步控制末端執行器等 I/O 行為，透過 hiwin_ros 擴充之 /set_digital_output 服務設定輸出狀態，不涉及機械手臂運動本體。
4. WAIT（時間控制）：
用於流程節奏與時序控制，透過 rospy.sleep() 進行等待，再繼續後續指令。

控制方法先讀取 JSONL 檔案並解析其中的 MotionSequence，再依各 MotionCommand 的控制模式呼叫對應的運動規劃或流程控制函式，最後將產生的控制結果即時發布至機械手臂控制介面，驅動機械手臂執行指令序列。

## 運算核心方法
Hiwin_rak 採用低耦合的模組化分層架構，並依照控制流程，將整體功能劃分為四個主要層級，分別核心算法層（src/core）、工具層（src/utils）、節點層（scripts）與使用者介面層（ui），此一架構設計的目的，在於將控制、運算等不同層級的腳本分開管理，以利後續擴充與維護。

:::layout[30,70] 
@slot
- 核心算法（src/core）：核心模組負責實際的運算與控制邏輯，包含「運動控制」、「指令載入」、「序列發布」與「執行回饋」等控制流程功能。
- 工具層（src/utils）：工具函式為支援 Core 模組運行的相關輔助功能。包含「錯誤處理」、「資源清理」、「座標轉換」、與「運動規劃參數設定」各類基礎服務。
- 腳本（scripts）：腳本主要是將相關的功能組織成 ROS 節點，負責訂閱與發布 ROS Topics、Services，調用相關功能執行對應之控制流程。
- 使用者介面（ui）：提供基本的控制介面，包含控制按鈕、狀態顯示等元素，方便使用者操作與監控。
@slot
![hiwin_rak_flowchart](content/ROBOT/Hiwin_rak/asset/hiwin_rak_architecture.png){border=true,radius=true}
:::end-layout

## 流程
Hiwin_rak 的控制流程主要由 motion_executor.py 與 planner_node.py 兩個節點運行：
- planner_node.py 用於讀取 JOSNL 檔案中的 MotionSequence 資料並將其發佈至 /motion_sequence topic。
- motion_executor.py 則負責訂閱 /motion_sequence 並逐行發布 MotionCommand 資料，之後會進行解析調用相應的控制方法執行，並返回執行狀態，直到序列結束。

:::layout[50,50] 
@slot
Hiwin_rak 同時也提提供圖形化操作介面作為使用者與 ROS 控制系統的互動入口。
介面使用 pyqt 封裝所有開發功能，包括 Joints slider 的關節控制，/tcp 位置的 MoveJ, MoveL 控制，DO 的數位控制，速度縮放控制，JSONL 的檔案讀取與發布，以及即時狀態監控等，使後端也擁有獨立的操作介面，使使用者無須直接操作 ROS 指令即可完成機械手臂控制與系統監看。
@br(2)

![rviz](content/ROBOT/Hiwin_rak/asset/rviz.png){border=true,radius=true}
![ui](content/ROBOT/Hiwin_rak/asset/ui.png){border=true,radius=true}
@slot
![rak_flowchart](content/ROBOT/Hiwin_rak/asset/rak_flowchart.png)
:::end-layout

## Demo
@iframe[hiwin_rak Controll Panel](https://www.youtube.com/embed/NVL_IMs5jUQ)

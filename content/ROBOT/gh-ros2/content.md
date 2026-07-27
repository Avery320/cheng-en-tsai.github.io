# gh-ros2

## Introduction
gh_ros2 是 Rhino 8 / Grasshopper 的 C# plugin，用於 grasshopper 與 ROS2 串聯的工具。


### Components

| Component | 功能 |
| --- | --- |
| `ros_bridge_connector` | 使用 ROS2 rosbridge WebSocket URL。 |
| `publish_topic` | 透過 ROS2 rosbridge 發布 ROS2 JSON message。 |
| `foxglove_bridge_connector` | 使用 Foxglove bridge WebSocket URL。 |
| `foxglove_publish_topic` | 透過 Foxglove bridge 發布 ROS2 JSON message。 |
| `MarkerArray` | 將 Rhino 幾何轉成 `visualization_msgs/msg/MarkerArray` JSON message。 |
| `PlanningScene` | 將 Rhino Mesh 轉成 MoveIt 2 `moveit_msgs/msg/PlanningScene` diff message。 |
| `urdf_loader` | 載入 URDF visual mesh 資源，轉成 Grasshopper 可傳遞的 mesh asset。 |
| `robot_visualizer` | 使用已載入的 URDF visual mesh 與 joint values 建立 robot 顯示 mesh。 |
| `robot_joint_sliders` | 依 URDF movable joint order 建立 joint inputs 與 Number Slider。 |


## Publish Markerarray Topic from rhino/grasshopper
將 rhino/grasshopper 中的幾何資訊轉換成 MarkerArray 的標準資訊發佈至 ROS 中。
@iframe[](https://www.youtube.com/embed/IaVoYOQ10nc?si=RIKqviqPSIqQzHBg)

## Load Robot Model by URDF file
透過標準的 urdf 檔案在 rhino/grasshopper 中載入機器人模型與**對應的關節參數**。
@iframe[](https://www.youtube.com/embed/6xpqeLDwdts?si=_B637Cik4HOlu6D1)

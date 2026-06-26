# ROS_Docker
[GitHub](https://github.com/Avery320/ros2-docker)

## Intruduction
ROS Docker 為提供建築產業開發者連線 [RoboSim](#ROBOT/RoboSim) 的基礎開發環境（也可使用其他 ROS2），專為機器人開發者設計。

:::gallery{height=420px}
![rviz](content/ROBOT/ROS_Docker/assets/rviz.png)
![remote_development](content/ROBOT/ROS_Docker/assets/remote_development.png)
:::

使用 ROS2 Jazzy ，並採用分層架構設計，支援 VNC 遠端桌面和 SSH 連線。本專案採用兩層 Image 架構，將基礎環境與應用環境分離：

### ROS2 Base Image (jazzy/)
基礎桌面環境，包含 ROS2 Jazzy 與遠端開發工具：
- 作業系統: Ubuntu 24.04 (Noble)
- ROS2: Jazzy Desktop + Gazebo
- ROS Bridge: rosbridge_suite
- 桌面環境: MATE Desktop
- 遠端存取: VNC Server (TigerVNC) + noVNC Web 介面 + SSH Server
- 開發工具: Firefox、VSCodium、Terminator

### Industrial Robot Image (industrial_robot/)
工業機器人開發環境，以 ros2-desktop-vnc:jazzy 為基礎，加入機器人控制相關套件（支援 KUKA、ABB、FANUC、UR 等）：
核心套件:
- 控制框架: ros2-control, ros2-controllers
- 運動規劃: MoveIt2, OMPL
- 模擬整合: Gazebo (ros-gz), gz-ros2-control
- 視覺化: RViz2, RQt, PlotJuggler
- 運動學: KDL, urdf-parser, xacro
- Python 工具: transforms3d, ikpy, numpy, scipy, matplotlib

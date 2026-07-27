# RoboSight
[Github](https://github.com/Avery320/RoboSight) | [ros-docker](#ROBOT/ROS_Docker)

## Introduction
RoboSight 是一個透過 iOS 設備作為機器人外部感測裝置的專案。使用 Zonoh 作為 middleware 與 ROS 連線。目前已開發：
- IMU
  - 整合至 `/tf`
- 相機功能
  - 發送 `/robosight/camera/image_raw/compressed`
  - 發送 `/robosight/camera/camera_info`
- robot
  - 載入 [robosim_library](https://github.com/Avery320/robosim_library) 機械手臂
  - 可訂閱 `joint_states`，查看機器人當下姿態。

## RoboSight Interface
:::grid
![Start Page](content/ROBOT/RoboSight/asset/robosight.PNG)
![Camera](content/ROBOT/RoboSight/asset/camera.PNG)
![Robot](content/ROBOT/RoboSight/asset/robot.PNG)
:::

### ROS integration on [RoboSim](https://github.com/Avery320/robot-demo)
![](content/ROBOT/RoboSight/asset/ros_integration.png)


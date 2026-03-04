# ROS_Docker

- Developer: Avery Tsai
- Update: 2025.06
- GitHub: [ROS_Docker](https://github.com/Avery320/ROS_docker_GUI.git)
---

## 專案簡介
這是一個基於 Docker 的 ROS（Robot Operating System）開發環境，專為機器人開發者設計。本專案整合了 ROS Noetic、Ubuntu 20.04 和完整的桌面環境，提供了一個即用型的開發平台。主要特點包括：

- 🐳 基於 Docker 的容器化環境，確保開發環境的一致性和可移植性
- 🖥️ 整合 VNC/noVNC 服務，支援圖形化介面操作
- 🔧 預裝完整的 ROS 開發工具和 Hiwin 機器人相關依賴套件
- 🛠️ 支援 VSCode 遠端開發
- 🔄 使用 Docker Compose 進行容器管理

:::gallery{height=420px}
![rviz](content/ROBOT/ROS_Docker/assets/rviz.png)
![remote_development](content/ROBOT/ROS_Docker/assets/remote_development.png)
:::

---
## 系統套件 
本容器設計分為兩個階段分別管理，第一階段（**ros_desktop_base**）採用 ubuntu:focal 作為映像檔（Image），是一個帶有 GUI (Graphical User Interface) 的 ubuntu 環境，提供開發者透過 VNC 服務，體驗完整的圖形化介面（圖5- 3）。第二階段（**ros_core**）建立 ROS 1 作為操作系統，以 ROS Noetic 作為架構，預先安裝六軸工業機器人所需要的 ROS 開發套件作為基礎。
:::layout[50,50]
@slot
### ros_desktop_base
這是一個基於 Ubuntu 20.04 的桌面環境映像檔，提供完整的圖形化介面支援：
#### 桌面環境
- `ubuntu-mate-desktop` - Ubuntu MATE 桌面環境
- `tigervnc-standalone-server` - VNC 伺服器
- `noVNC` - 網頁版 VNC 客戶端
- `supervisor` - 進程管理工具

#### 開發工具
- `vscodium` - 開源版 VS Code
- `build-essential` - 編譯工具
- `vim`, `git`, `sudo` - 基本工具
- `python3-pip` - Python 套件管理
- `tini`, `gosu` - 容器管理工具
- `wget`, `curl` - 網路工具
- `terminator` - 終端機

@slot
### ros_core
基於 ros_desktop_base 的 ROS 開發環境映像檔，提供完整的 ROS 開發工具：

#### ROS 核心
- `ros-noetic-desktop` - ROS 桌面版本，包含基本開發工具
- `python3-ros*` - ROS 開發工具集（安裝、依賴管理、工作空間工具等）
- `rosdep` - ROS 套件依賴管理工具

#### Gazebo 模擬器
- `ros-noetic-gazebo-ros-pkgs` - Gazebo ROS 整合套件
- `ros-noetic-gazebo-ros-control` - Gazebo 控制介面
- `ros-noetic-gazebo-plugins` - Gazebo 插件集
- `ros-noetic-gazebo-msgs` - Gazebo 訊息定義
- `ros-noetic-gazebo-dev` - Gazebo 開發工具
- `ros-noetic-gazebo-ros` - Gazebo ROS 介面

:::end-layout




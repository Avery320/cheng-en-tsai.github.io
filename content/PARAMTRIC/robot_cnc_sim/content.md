# Smocking

- Designer: Avery Tsai
- Update: 2022.07

---

:::gallery{height=480px}
![](https://ik.imagekit.io/cheng3n/robot_gh/s-2.jpg)
![](https://ik.imagekit.io/cheng3n/robot_gh/s-2-2.jpg)
![](https://ik.imagekit.io/cheng3n/robot_gh/S-1.jpg)
:::

## Introduction
本專案使用 Grasshopper 的 [Robots](https://github.com/visose/Robots.git) 外掛建立機器手臂切削加工的模擬流程。透過在 GH 中定義刀具（Knife）與工件（Cutting Object）的幾何關係，將設計物件轉換為可執行的切割路徑（Cutting Paths），並在模擬環境中觀察切削後的表面紋理、凹凸變化與路徑策略所帶來的加工效果。

:::grid
![](https://ik.imagekit.io/cheng3n/robot_gh/001.jpg){border=true,radius=true}
![](https://ik.imagekit.io/cheng3n/robot_gh/002.jpg){border=true,radius=true}
:::

## Simulation
#### 單元化模組｜Unit Modules
以單一切割單元作為基礎，將相同模組重複排列與組裝，透過方向、密度與拼接節奏的調整，在同一語彙下形成連續的表面紋理與構成。此策略適合應用於大面積牆面、帶狀飾板等需要一致性與延展感的空間介面，能以規律的模組節奏建立清楚的視覺秩序。

#### 客製化模組｜Customized Modules
先定義不同切割單元的變體，依位置或規則分配各類模組進行組裝，使表面在局部紋理、尺度與轉折上產生差異，形成更具層次與變化的構件系統。此策略可用於重點牆、端景、入口視覺焦點等空間情境，讓表面紋理能回應動線、視線與尺度需求，強化空間氛圍與辨識度。

:::grid
![Unit Modules Diagram](https://ik.imagekit.io/cheng3n/robot_gh/003.jpg){border=true,radius=true}
![Continuous Texture Wall](https://ik.imagekit.io/cheng3n/robot_gh/S-1.jpg)
:::

:::grid
![Customized Modules Diagram](https://ik.imagekit.io/cheng3n/robot_gh/004.jpg){border=true,radius=true}
![Custom-Form Feature Wall](https://ik.imagekit.io/cheng3n/robot_gh/s-2-2.jpg)
:::

## 模擬流程
@gif[sim](https://ik.imagekit.io/cheng3n/robot_gh/sim.gif)

# 周边建筑立面照片来源

周边住宅、写字楼和底商的贴图由深圳本地街拍照片加工而成，照片来自 Wikimedia Commons，均为 CC0 公有领域贡献。`tools/prepare_facade_photos.py` 记录了每块贴图的裁切四角，可重新生成。

这些照片拍的不是航城学校周边的楼。它们用来提供深圳住宅立面的真实材质与构件（晾衣阳台、百叶、防盗网、空调外机），楼的位置、轮廓和层数仍按开放地图和影像估建。

| 贴图 | 原始照片 | 拍摄地 | 许可 | 加工 |
|---|---|---|---|---|
| `apartment-a.jpg` | [Bao'An Blvd Metro Ma'an Hill Station view nearby building facade July 2024](https://commons.wikimedia.org/?curid=150538821) | 宝安区宝安大道 | CC0 | 裁出右侧 5 层 × 5 开间，左右接缝羽化 |
| `apartment-b.jpg` | 同上 | 宝安区宝安大道 | CC0 | 裁出近处一栋 3 层 × 1 开间，调暖色 |
| `curtain-wall.jpg` | [JinDi 1st Road n JinDi 5th Road residential building facade June 2024](https://commons.wikimedia.org/?curid=149484130) | 福田区金地一路 | CC0 | 仰拍幕墙做透视校正，5 层 × 3 开间 |
| `podium.jpg` | 砖墙取自第一张；卷帘门和墙面取自 [Bao'An Blvd shops closed February 2025](https://commons.wikimedia.org/?curid=159344490) | 宝安区宝安大道 | CC0 | 砖墙、卷帘门为照片，玻璃门为绘制 |

底商招牌上的店名（便利店、文具 · 图书、早餐 · 包点、鲜果店）是生成的通用名称，没有使用照片里的真实店名和电话。

街道设施和行人的样式参考了同一批照片里的共享单车、护栏、水马和路牌，模型本身为程序生成，没有使用照片像素。

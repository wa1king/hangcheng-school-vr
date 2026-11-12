# 航城学校 · 3D 校园

深圳市宝安区航城学校航空路 10 号本部的三维漫游。支持俯瞰、第一人称步行、自由飞行、地点跳转和触控。外观依据公开资料重建，楼高、场地高差和构件尺寸仍待实测。

从「前往」菜单选择教学楼室内示意区，可以步行穿过走廊、上下楼梯、进教室。室内陈设参考公开课堂照片，楼梯、走廊和教室布局是示意设计。

[打开校园漫游](https://wa1king.github.io/hangcheng-school-vr/) · [查看资料来源](https://wa1king.github.io/hangcheng-school-vr/scene/sources.html)

## 本地运行

需要 Node.js 22.14 或以上。运行 `npm ci`，再运行 `npm run dev`。`npm run build` 生成 `dist`。GitHub Pages 从 `main` 分支的 `docs` 目录发布。

`tools/build_campus.py` 用开放地图数据生成场景模型。重新生成时需要 Python 3.11 或以上、NumPy、Pillow、Shapely、Mapbox Earcut 和 Windows 字体。发布模型使用 Meshopt 压缩。重新生成后可用 `npx gltfpack@1.3.0 -i public/scene/campus.glb -o public/scene/campus.packed.glb -cc -noq -kn -km -ke` 生成压缩版，再用压缩版替换 `campus.glb`。碰撞文件 `collision.glb` 使用相同参数压缩。构建后将 `dist` 内容更新到 `docs` 并保留 `.nojekyll`。

## 数据与署名

[校园平面源数据](evidence/campus-osm.geojson)来自 © OpenStreetMap contributors，遵循 [ODbL 1.0](https://www.openstreetmap.org/copyright)。卫星影像和历史实拍用于核对外观，发布场景采用自行绘制的材质。

[SimWorld 控制器许可](LICENSE.upstream) · [第三方软件许可](public/THIRD-PARTY-NOTICES.txt)

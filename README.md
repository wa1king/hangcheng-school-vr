# 航城学校 · 3D 校园

深圳市宝安区航城学校航空路 10 号本部的三维漫游。外观依据公开资料重建，楼高、场地高差和构件尺寸仍待实测。

从校门广场开始步行。课堂方位以从校门面向主楼为北。点东、南、西、北可直接看向对应方位，点左转、右转或按键盘左右方向键可转 90°。横向拖动也可转向。双指开合或滚轮可以缩放画面。

用 WASD 或触屏摇杆移动。飞行时按 E 上升、Q 下降，也可用右侧升降按钮。

从「前往」选择主教学翼、西侧活动楼、北侧教学楼或东南综合楼的入口，可以步行进楼、穿过走廊并沿楼梯到屋顶。楼内平面与主楼连廊是游览示意，教室陈设参考公开课堂照片。

[打开校园漫游](https://wa1king.github.io/hangcheng-school-vr/) · [查看资料来源](https://wa1king.github.io/hangcheng-school-vr/scene/sources.html)

墙砖、铺地和抹灰按世界坐标叠加颗粒、分缝和磨损。桌面步行视角下，校门广场和中庭铺地可映出校园实景，窗玻璃和金属使用从门廊、中庭捕获的局部反光。触屏和 VR 使用较轻量的反光方案。材质分层和低分辨率反射参考 [Saltline](https://github.com/Megasu/jimao-3a-game/blob/main/index.html#L5484-L5623)。

校门和中庭用校园照片校准植被，使用实拍 HDR 天空并将太阳对齐场景主光。校园模型的天光遮挡与间接反射离线计算，运行时叠加直射日光和室内曝光变化。实拍素材与离线光照流程参考 [CROSSTOWN 技术调研](https://ibw30loq2af.sg.larksuite.com/wiki/FlxHwL2JViYo8Oku1TTlF8rzgoe)。

## 本地运行

需要 Node.js 22.14 或以上。运行 `npm ci`，再运行 `npm run dev`。`npm run build` 生成 `dist`。GitHub Pages 从 `main` 分支的 `docs` 目录发布。

主界面左下角显示构建版本号。每次发布构建按北京时间自动生成 `YYYY.MM.DD-HHMMSS`。

`tools/build_campus.py` 生成校舍 `campus.glb` 和周边街区 `surroundings.glb`。重新生成时需要 Python 3.11 或以上、NumPy、Pillow、Shapely、Mapbox Earcut 和 Windows 字体。分别使用 `npx gltfpack@1.3.0 -i public/scene/campus.glb -o public/scene/campus.packed.glb -cc -vpf -vp 16 -vt 16 -vn 10 -kn -km -ke`（周边模型替换文件名）压缩后，用压缩版替换对应的原始文件。渲染和碰撞读取同一份几何，教室窗玻璃双面可见且有碰撞。标线和标牌等表面装饰不参与碰撞。构建后将 `dist` 内容更新到 `docs` 并保留 `.nojekyll`。

更新场景模型或主光后，运行 `node tools/bake-campus-light.mjs` 重新生成 `public/scene/campus-baked-light.bin`。它按 `scene.json` 对应的模型版本生成，浏览器在首帧后加载。

## 数据与署名

[校园平面源数据](evidence/campus-osm.geojson)来自 © OpenStreetMap contributors，遵循 [ODbL 1.0](https://www.openstreetmap.org/copyright)。卫星影像和历史实拍用于核对外观。`tools/material_scans` 内的贴图经裁色和缩放，原始材质来自 Poly Haven 的 [Granite Tile 04](https://polyhaven.com/a/granite_tile_04)、[Asphalt 02](https://polyhaven.com/a/asphalt_02)、[Terrazzo Tiles](https://polyhaven.com/a/terrazzo_tiles) 和 [White Plaster 02](https://polyhaven.com/a/white_plaster_02)，遵循 [CC0](https://polyhaven.com/license)。

[SimWorld 控制器许可](LICENSE.upstream) · [第三方软件许可](public/THIRD-PARTY-NOTICES.txt)

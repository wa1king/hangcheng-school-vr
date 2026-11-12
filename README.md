# 航城学校 · 3D 校园

深圳市宝安区航城学校航空路 10 号本部的三维漫游。外观依据公开资料重建，楼高、场地高差和构件尺寸仍待实测。

从学校正门开始步行。课堂方位以从正门向校内为北，隔着航空路向南能看到航城文体公园。点东、南、西、北可缓慢转到对应方位，点左转、右转或按键盘左右方向键可转 90°。横向拖动也可转向。双指开合或滚轮可以缩放画面。

用左下角摇杆或 WASD 移动。总览里拖动摇杆可平移画面。飞行时按 E 上升、Q 下降，也可用右侧升降按钮。游览范围沿校园围栏布置。从「前往」可选择「南望航城文体公园」「教学楼后方」和「校内西侧望路口」。

从「前往」选择主教学翼、西侧活动楼、北侧教学楼或东南综合楼的入口，可以步行进楼、穿过走廊并沿楼梯到屋顶。楼内平面与主楼连廊是游览示意，教室陈设参考公开课堂照片。

[打开校园漫游](https://wa1king.github.io/hangcheng-school-vr/) · [查看资料来源](https://wa1king.github.io/hangcheng-school-vr/scene/sources.html)

墙砖、铺地和抹灰按世界坐标叠加颗粒、分缝和磨损。桌面步行视角下，校门广场和中庭铺地可映出校园实景，窗玻璃和金属使用从门廊、中庭捕获的局部反光。触屏和 VR 使用较轻量的反光方案。材质分层和低分辨率反射参考 [Saltline](https://github.com/Megasu/jimao-3a-game/blob/main/index.html#L5484-L5623)。

校门和中庭用校园照片校准植被，使用实拍 HDR 天空并将太阳对齐场景主光。校园模型的天光遮挡与间接反射离线计算，运行时叠加直射日光和室内曝光变化。实拍素材与离线光照流程参考 [CROSSTOWN 技术调研](https://ibw30loq2af.sg.larksuite.com/wiki/FlxHwL2JViYo8Oku1TTlF8rzgoe)。

## 本地运行

需要 Node.js 22.14 或以上。运行 `npm ci`，再运行 `npm run dev`。`npm run build` 生成 `dist`。GitHub Pages 从 `main` 分支的 `docs` 目录发布。

主界面左下角显示构建版本号。每次发布构建按北京时间自动生成 `YYYY.MM.DD-HHMMSS`。

`tools/build_campus.py` 生成校舍 `campus.glb` 和周边街区 `surroundings.glb`。重新生成时需要 Python 3.11 或以上、NumPy、Pillow、Shapely、Mapbox Earcut 和 Windows 字体。分别使用 `npx gltfpack@1.3.0 -i public/scene/campus.glb -o public/scene/campus.packed.glb -cc -vpf -vp 16 -vt 16 -vn 10 -kn -km -ke`（周边模型替换文件名）压缩后，用压缩版替换对应的原始文件。校内渲染和碰撞读取同一份几何，教室窗玻璃双面可见且有碰撞。周边街区在首帧后加载，仅供观看。构建后将 `dist` 内容更新到 `docs` 并保留 `.nojekyll`。

各类立面的开间、窗台和窗楣高度、分格数记录在 `tools/facade_panels.json`，`tools/facade_kit.py` 据此为普通墙面成套生成壁柱、层间腰线、窗台、遮阳窗楣、勒脚、散水、雨水管、雨水口和空调外机，窗玻璃贴图带窗帘、灯管和课桌。样本里 `basis` 为 `inferred` 的构件是深圳校舍的常见做法，尚未逐面与照片核对，把对应项改为 `null` 即可关闭。

更新场景模型或主光后，运行 `node tools/bake-campus-light.mjs` 重新生成 `public/scene/campus-baked-light.bin`。它按 `scene.json` 对应的模型版本生成，浏览器在首帧后加载。

## 数据与署名

[校园平面](evidence/campus-osm.geojson)和[校外建筑轮廓](evidence/neighborhood-osm.geojson)来自 © OpenStreetMap contributors，遵循 [ODbL 1.0](https://www.openstreetmap.org/copyright)。卫星影像和历史实拍用于核对外观。`tools/material_scans` 内的 Poly Haven 贴图经裁色和缩放，遵循 [CC0](https://polyhaven.com/license)。行道树使用 [Island Tree 03](https://polyhaven.com/a/island_tree_03) 的树叶和树皮贴图，人行道使用 [Floor Pavement](https://polyhaven.com/a/floor_pavement)。其余场景素材见[资料来源](public/scene/sources.html)。

[SimWorld 控制器许可](LICENSE.upstream) · [第三方软件许可](public/THIRD-PARTY-NOTICES.txt)

# 航城学校本部照片贴图

照片保留为外部资料链接。仓库内提供局部裁切和校正后的建筑贴图，以及从照片纹理派生的法线、粗糙度贴图。

- 米色面砖、红棕钟楼饰面和金色中英文校名取自乐有家小学部档案中的正门近照，文件目录标记为 2018 年。材质裁切均为无人物的区域。照片署名按原发布平台。 [学校资料页](https://shenzhen.leyoujia.com/school/detail/9232.html) · [原图](https://fang-school.leyoujia.com/pic/hsl/2018-11/02/8eed3fe1-7be1-459e-a2c9-113271b2c719.JPG)
- 钟面底板取自深圳潮青会 2025 年 9 月到访领航文体中心时，隔公园拍摄的学校正面照片。原图分辨率有限，表圈、罗马数字和指针根据 2018 年正门近照重绘。照片署名按原发布平台。 [活动记录](https://www.chaoqing.org/News/Info-7105.html) · [原图](http://www.chaoqing.org/UpLoadFile/Editor/image/20260119151755_7953.jpg)

用两个原始图像重新生成贴图

```powershell
python tools/prepare_school_photos.py <正门照片> <文体中心照片>
```

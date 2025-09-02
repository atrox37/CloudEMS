# CloudEMS - 云端能源管理系统

## 项目简介

CloudEMS是一个基于Vue 3的现代化云端能源管理系统，提供实时监控、数据分析和可视化展示功能。

## 主要功能

### 美国地图下钻功能

#### 功能描述
- **美国轮廓地图展示**：显示美国各州边界和轮廓
- **发电站标记**：在地图上标记各个发电站位置，包含发光效果
- **地图下钻**：点击任意州可以下钻到该州的详细地图
- **返回功能**：通过"返回美国地图"按钮可以返回到美国轮廓地图

#### 发电站信息
每个发电站包含以下信息：
- **名称**：发电站的具体名称
- **类型**：太阳能、风力、核能、水力、火力等
- **容量**：以MW为单位的发电容量
- **状态**：在线、离线、维护中等状态
- **位置**：精确的地理坐标

#### 发电站类型及颜色
- 🟡 **太阳能**：黄色标记
- 🟢 **风力**：绿色标记
- 🔴 **核能**：红色标记
- 🔵 **水力**：蓝色标记
- 🟣 **火力**：紫色标记

#### 使用方法
1. **查看美国地图**：页面加载时显示美国轮廓地图和所有发电站
2. **查看发电站详情**：鼠标悬停在发电站标记上可查看详细信息
3. **下钻到州地图**：点击任意州区域可查看该州的详细地图和发电站
4. **返回美国地图**：在州地图页面点击"返回美国地图"按钮

#### 技术特性
- **响应式设计**：支持不同屏幕尺寸和分辨率
- **交互式地图**：支持缩放、拖拽等操作
- **实时数据**：发电站状态实时更新
- **高性能渲染**：基于ECharts的高性能地图渲染

## 技术架构

### 前端技术栈
- **Vue 3**：使用Composition API和setup语法糖
- **TypeScript**：提供类型安全和开发体验
- **ECharts**：专业的数据可视化图表库
- **Element Plus**：现代化的Vue 3 UI组件库
- **SCSS**：使用BEM规范的样式管理，支持响应式设计
- **Vite**：快速的构建工具

### 响应式设计
- **rem单位系统**：以1rem=100px为标准，实现响应式布局
- **响应式工具函数**：提供pxToResponsive和pxToRem等转换函数
- **自适应布局**：支持不同屏幕尺寸和分辨率

### 项目结构
```
src/
├── components/
│   └── charts/
│       └── USAMapChart.vue    # 美国地图组件
├── views/
│   └── HomeView/
│       └── index.vue          # 主页面
├── assets/
│   ├── jsons/
│   │   ├── USAOutlineMap.json # 美国轮廓地图数据
│   │   └── USAStatesMap.json  # 美国各州地图数据
│   └── styles/
│       └── element/           # Element Plus组件样式
├── utils/
│   ├── responsive.ts          # 响应式工具函数
│   └── pxToRemConverter.ts    # px到rem转换工具
└── ...
```

## 安装和运行

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 类型检查
```bash
npm run type-check
```

## 地图数据说明

### USAOutlineMap.json
- 包含美国各州的轮廓边界数据
- 使用GeoJSON格式
- 每个州包含id、name、geometry等属性

### USAStatesMap.json
- 包含美国各州的详细地图数据
- 使用GeoJSON格式
- 每个州包含GEO_ID、STATE、NAME、CENSUSAREA等属性

## 自定义配置

### 添加新的发电站
在`USAMapChart.vue`组件中的`powerStations`数组中添加新的发电站数据：

```typescript
{
  id: 'unique-id',
  name: '发电站名称',
  type: 'solar', // solar, wind, nuclear, hydro, thermal
  capacity: 500, // 容量(MW)
  status: 'online', // online, offline, maintenance
  coordinates: [-120.0, 40.0], // [经度, 纬度]
  state: 'California' // 所属州名
}
```

### 修改地图样式
在`USAMapChart.vue`组件的样式中修改地图颜色和布局：

```scss
.usamap-chart {
  &__map {
    background: #your-color;
  }
}
```

### 响应式单位转换
项目使用rem单位系统，以1rem=100px为标准：

```typescript
// 使用响应式工具函数
import { pxToResponsive, pxToRem } from '@/utils/responsive'

// 转换px到响应式px
const responsiveValue = pxToResponsive(100) // 根据屏幕宽度自动缩放

// 转换px到rem
const remValue = pxToRem(100) // 返回 "1rem"
```

### 样式开发规范
- 所有尺寸单位使用rem（1rem = 100px）
- 使用BEM命名规范
- 组件样式以`.voltage-class`为根选择器
- 支持响应式设计，适配不同屏幕尺寸

## 浏览器兼容性

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

## 许可证

本项目采用MIT许可证。

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交GitHub Issue
- 发送邮件至项目维护者

---

**注意**：本项目仅供学习和研究使用，请勿用于商业用途。

# 主题自适应颜色

## 改进说明

将义工管理表格中的所有硬编码颜色改为使用 Tailwind 的主题色变量，使其能够随主题切换而自动适配。

## 使用的主题色变量

### 1. 深圳义工号
- **之前**：`text-blue-600 border-blue-200 bg-blue-50`（固定蓝色）
- **现在**：`text-primary border-primary/20 bg-primary/5`（主题色）

### 2. 义工状态
- **已注册**：`bg-primary/10 text-primary border-primary/30`
- **培训中**：`bg-accent/10 text-accent-foreground border-accent/30`
- **申请中**：`bg-secondary/10 text-secondary-foreground border-secondary/30`
- **未激活**：使用 `secondary` variant（自动适配）
- **已暂停**：使用 `destructive` variant（自动适配）

### 3. 满勤档位
使用主题色的不同透明度来区分档位：

| 档位 | 颜色 | 说明 |
|------|------|------|
| 1档 | `bg-muted text-muted-foreground` | 灰色（最低） |
| 2档 | `bg-primary/5 text-primary` | 主题色 5% |
| 3档 | `bg-primary/10 text-primary` | 主题色 10% |
| 4档 | `bg-primary/15 text-primary` | 主题色 15% |
| 5档 | `bg-primary/20 text-primary` | 主题色 20% |
| 6档 | `bg-primary/25 text-primary` | 主题色 25% |

## 主题色变量说明

### Tailwind 主题色系统

```css
/* 主要颜色 */
primary          /* 主题色 */
primary-foreground /* 主题色前景色（文字） */

/* 次要颜色 */
secondary        /* 次要色 */
secondary-foreground /* 次要色前景色 */

/* 强调色 */
accent           /* 强调色 */
accent-foreground /* 强调色前景色 */

/* 中性色 */
muted            /* 柔和背景色 */
muted-foreground /* 柔和前景色 */
border           /* 边框色 */

/* 状态色 */
destructive      /* 危险/删除色 */
```

### 透明度修饰符

使用 `/` 语法设置透明度：
- `bg-primary/5` - 主题色背景，5% 透明度
- `bg-primary/10` - 主题色背景，10% 透明度
- `border-primary/20` - 主题色边框，20% 透明度

## 效果

### 切换主题前后对比

#### 蓝色主题
- 义工号：蓝色 Badge
- 档位：蓝色渐变（1-6档从浅到深）
- 状态：蓝色系

#### 绿色主题
- 义工号：绿色 Badge
- 档位：绿色渐变（1-6档从浅到深）
- 状态：绿色系

#### 紫色主题
- 义工号：紫色 Badge
- 档位：紫色渐变（1-6档从浅到深）
- 状态：紫色系

## 优势

1. **自动适配**：切换主题时，所有颜色自动更新
2. **一致性**：整个应用使用统一的主题色系
3. **可维护性**：不需要为每个主题单独定义颜色
4. **渐进式**：档位使用透明度渐变，视觉效果更自然

## 档位颜色设计

### 渐进式透明度

档位越高，主题色越深：
- 1档（2小时）：灰色（最低标准）
- 2档（4小时）：主题色 5%（很浅）
- 3档（6小时）：主题色 10%
- 4档（8小时）：主题色 15%（标准）
- 5档（10小时）：主题色 20%
- 6档（12小时）：主题色 25%（最深）

### 视觉效果

```
1档 ░         灰色
2档 ░░        很浅
3档 ░░░       浅
4档 ░░░░      中等（标准）
5档 ░░░░░     深
6档 ░░░░░░    最深（全天）
```

## 代码变更

### apps/web/src/components/VolunteerDataTable.tsx

#### 1. 深圳义工号
```tsx
// 之前
className="text-blue-600 border-blue-200 bg-blue-50"

// 现在
className="text-primary border-primary/20 bg-primary/5"
```

#### 2. 义工状态
```tsx
// 之前
registered: { className: "bg-green-50 text-green-700 border-green-200" }

// 现在
registered: { className: "bg-primary/10 text-primary border-primary/30" }
```

#### 3. 满勤档位
```tsx
// 之前
const tierColors = {
  1: "bg-slate-50 text-slate-700 border-slate-200",
  2: "bg-blue-50 text-blue-700 border-blue-200",
  // ...
};

// 现在
const tierColors = {
  1: "bg-muted text-muted-foreground border-border",
  2: "bg-primary/5 text-primary border-primary/20",
  3: "bg-primary/10 text-primary border-primary/30",
  4: "bg-primary/15 text-primary border-primary/40",
  5: "bg-primary/20 text-primary border-primary/50",
  6: "bg-primary/25 text-primary border-primary/60",
};
```

## 测试

切换不同主题，观察表格中的颜色变化：
1. 打开主题设置
2. 切换主题（蓝色、绿色、紫色等）
3. 查看义工管理表格
4. 所有 Badge 颜色应该随主题变化

## 注意事项

1. **主题配置**：确保项目中已配置主题色系统
2. **暗色模式**：主题色变量自动支持暗色模式
3. **对比度**：透明度设置确保了足够的对比度
4. **一致性**：整个应用应该使用相同的主题色变量

# 义工表单下拉框遮罩层问题修复

## 问题描述

在义工管理界面添加义工时，性别下拉框和日期选择器被对话框的遮罩层遮盖，无法正常显示和选择。

## 根本原因

z-index 层级冲突：
- Dialog 组件的 z-index: `z-[100]`
- SelectContent 的 z-index: `z-50`
- PopoverContent 的 z-index: `z-50`

由于 Select 和 Popover 的内容 z-index 低于 Dialog，导致被 Dialog 的遮罩层遮盖。

## 解决方案

将 SelectContent 和 PopoverContent 的 z-index 提高到 `z-[110]`，确保它们显示在 Dialog 之上。

### 修改文件

1. **apps/web/src/components/ui/select.tsx**
   - 将 SelectContent 的 `z-50` 改为 `z-[110]`

2. **apps/web/src/components/ui/popover.tsx**
   - 将 PopoverContent 的 `z-50` 改为 `z-[110]`

## 影响范围

- 所有在 Dialog 中使用的 Select 组件
- 所有在 Dialog 中使用的 DatePicker 组件（基于 Popover）
- 不影响其他场景的使用

## 测试建议

1. 打开义工管理页面
2. 点击"添加义工"按钮
3. 测试性别下拉框是否可以正常显示和选择
4. 测试出生日期选择器是否可以正常显示和选择
5. 测试其他所有下拉框（学历、皈依状态、健康状况等）

# 脚本命令参考

## 📋 所有可用的 npm scripts

### 开发和部署
```bash
npm run dev              # 开发模式（带热重载）
npm run format           # 格式化代码
npm run format:check     # 检查代码格式
```

### 数据库管理
```bash
npm run migrate          # 执行数据库迁移
npm run studio           # 打开 Drizzle Studio
```

### 考勤导出 ⭐
```bash
npm run export:monthly <年份> <月份>        # 导出单个月份
npm run export:batch <年份> <月份...>       # 批量导出多个月份
npm run clean-exports                       # 清理导出文件
npm run export:verify                       # 验证导出文件
npm run export:verify-detailed              # 详细验证
npm run export:verify-hours                 # 验证工时限制
npm run export:test                         # 测试导出功能
```

### 数据维护
```bash
npm run reset-passwords          # 重置明文密码（加密）
npm run check-volunteer-ids      # 检查义工 ID
npm run check-avatars            # 检查头像同步
npm run clean-avatars            # 清理重复头像
npm run generate-summary         # 生成月度考勤汇总
```

---

## 🚀 常用命令详解

### 1. 导出月度统计表

**命令：**
```bash
npm run export:monthly 2025 11
```

**说明：**
- 导出指定年份和月份的志愿者服务时间统计表
- 文件保存在 `exports/` 文件夹
- 格式符合深圳志愿者管理系统要求

**参数：**
- 第1个参数：年份（如 2025）
- 第2个参数：月份（如 11）

**示例：**
```bash
npm run export:monthly 2025 9   # 导出2025年9月
npm run export:monthly 2025 10  # 导出2025年10月
npm run export:monthly 2025 11  # 导出2025年11月
```

**高级用法：**
```bash
# 导出前清理旧文件
bash scripts/export-monthly.sh 2025 11 --clean
```

---

### 2. 批量导出

**命令：**
```bash
npm run export:batch 2025 9 10 11
```

**说明：**
- 一次性导出多个月份
- 会提示是否清理旧文件
- 显示导出进度和结果

**参数：**
- 第1个参数：年份
- 后续参数：月份列表（空格分隔）

**示例：**
```bash
npm run export:batch 2025 9 10 11      # 导出9、10、11月
npm run export:batch 2025 1 2 3 4 5 6  # 导出1-6月
```

---

### 3. 清理导出文件

**命令：**
```bash
npm run clean-exports
```

**说明：**
- 交互式清理 `exports/` 文件夹中的 Excel 文件
- 会显示文件列表并要求确认
- 安全删除，避免误操作

**示例：**
```bash
$ npm run clean-exports

====================================
🗑️  清理导出文件
====================================

📊 当前文件列表：
-rw-r--r-- 14K 志愿者服务时间统计表_2025年09月.xlsx
-rw-r--r-- 18K 志愿者服务时间统计表_2025年10月.xlsx
-rw-r--r-- 14K 志愿者服务时间统计表_2025年11月.xlsx

确认删除这 3 个文件吗？(y/N)
```

---

### 4. 验证导出文件

**基本验证：**
```bash
npm run export:verify
```
- 验证 Excel 文件格式
- 检查标题行和表头
- 显示前3行数据示例

**详细验证：**
```bash
npm run export:verify-detailed
```
- 显示每个志愿者的统计信息
- 按服务时长排序
- 显示总体统计

**验证工时限制：**
```bash
npm run export:verify-hours
```
- 检查是否有记录超过8小时
- 验证工时限制是否生效

---

### 5. 生成月度汇总

**命令：**
```bash
npm run generate-summary
```

**说明：**
- 生成上月的考勤汇总数据
- 保存到 `volunteer_checkin_summary` 表
- 用于快速查询和统计分析

**注意：**
- 这是定时任务，每月1号自动执行
- 手动执行用于补充或重新生成数据

---

### 6. 数据维护命令

**重置明文密码：**
```bash
npm run reset-passwords
```
- 将数据库中的明文密码加密
- 使用 bcrypt 加密算法

**检查义工 ID：**
```bash
npm run check-volunteer-ids
```
- 检查义工 ID 的完整性
- 发现重复或缺失的 ID

**检查头像同步：**
```bash
npm run check-avatars
```
- 检查头像文件是否同步
- 发现缺失或重复的头像

**清理重复头像：**
```bash
npm run clean-avatars
```
- 清理重复的头像文件
- 释放存储空间

---

## 📁 脚本文件位置

### Shell 脚本
```
scripts/
├── export-monthly.sh       # 月度导出
├── export-batch.sh         # 批量导出
├── clean-exports.sh        # 清理文件
└── test/
    ├── test-export.sh      # 测试导出
    └── ...
```

### TypeScript 脚本
```
scripts/
├── generate-checkin-summary.ts    # 生成汇总
├── verify-export.ts               # 验证导出
├── verify-export-detailed.ts      # 详细验证
├── verify-monthly-exports.ts      # 月度验证
├── verify-max-hours.ts            # 验证工时
├── reset-plain-passwords.ts       # 重置密码
├── check-volunteer-ids.ts         # 检查 ID
├── check-avatar-sync.ts           # 检查头像
└── clean-duplicate-avatars.ts     # 清理头像
```

---

## 🔧 直接使用脚本

如果不想使用 npm scripts，也可以直接运行脚本：

### Shell 脚本
```bash
bash scripts/export-monthly.sh 2025 11
bash scripts/export-batch.sh 2025 9 10 11
bash scripts/clean-exports.sh
bash scripts/test/test-export.sh
```

### TypeScript 脚本
```bash
bun run scripts/generate-checkin-summary.ts
bun run scripts/verify-export.ts
bun run scripts/verify-export-detailed.ts
bun run scripts/verify-monthly-exports.ts
bun run scripts/verify-max-hours.ts
```

---

## 💡 最佳实践

### 月度上报流程
```bash
# 1. 清理旧文件
npm run clean-exports

# 2. 导出上月数据
npm run export:monthly 2025 10

# 3. 验证数据
npm run export:verify-detailed

# 4. 上传到深圳志愿者管理系统
```

### 批量导出流程
```bash
# 一次性导出多个月份
npm run export:batch 2025 9 10 11

# 验证所有文件
npm run export:verify
```

### 定期维护
```bash
# 每月初执行
npm run generate-summary      # 生成上月汇总
npm run export:monthly 2025 10  # 导出上月数据

# 定期执行
npm run check-avatars         # 检查头像
npm run check-volunteer-ids   # 检查 ID
```

---

## 📚 相关文档

- [README.md](../README.md) - 项目主文档
- [考勤管理文档](./checkin/README.md) - 考勤功能文档索引
- [快速参考](./checkin/EXPORT_QUICK_REFERENCE.md) - 导出功能快速参考
- [使用指南](./checkin/EXPORT_USAGE.md) - 详细使用说明

---

## ❓ 常见问题

**Q: 如何查看所有可用的命令？**  
A: 运行 `npm run` 查看所有 scripts。

**Q: 脚本执行失败怎么办？**  
A: 检查：
1. 服务是否正常运行（`npm run dev`）
2. 数据库连接是否正常
3. 查看错误日志

**Q: 如何添加新的脚本？**  
A: 在 `package.json` 的 `scripts` 部分添加新命令。

---

**最后更新**: 2024-11-16  
**维护者**: 莲花斋开发团队

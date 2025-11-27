# 义工导入脚本

本目录包含义工数据导入相关的脚本。

## 脚本列表

### import_5_volunteers.sh
快速导入 5 个义工的 Shell 脚本

**功能**：
- 批量导入义工数据
- 支持 CSV 格式
- 自动验证数据

**使用方法**：
```bash
./import_5_volunteers.sh
```

### parse_volunteers.js
解析义工数据的 Node.js 脚本

**功能**：
- 解析 CSV/JSON 格式的义工数据
- 数据格式转换
- 数据验证

**使用方法**：
```bash
node parse_volunteers.js [input_file]
```

## 相关数据

数据文件位于 `../../data/volunteer-import/` 目录。

## 相关文档

详细文档请查看 `../../docs/volunteer/` 目录。

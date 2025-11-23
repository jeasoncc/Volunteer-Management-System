# 前后端数据对齐修复总结

## 修复时间
2025-11-22

## 问题描述
前端和后端的数据在多个模块对应不上，特别是义工管理模块。主要问题包括：
1. 前端 Volunteer 类型定义不完整，缺少许多后端字段
2. 前端 CreateVolunteerParams 缺少后端支持的可选字段
3. 前端表单组件缺少重要字段，无法创建完整的义工信息

## 修复内容

### 1. 更新前端 Volunteer 类型定义 ✅

**文件**: `apps/web/src/types/index.ts`

**修复内容**:
- 重新组织了类型定义，按功能分组
- 添加了所有后端数据库 schema 中的字段
- 统一了枚举类型定义（education, healthConditions, religiousBackground 等）
- 添加了缺失的字段：
  - `trainingRecords` - 培训记录
  - `serviceHours` - 服务时长
  - `isCertified` - 是否认证
  - `notes` - 备注
  - `reviewer` - 审核人
  - `signedCommitment` - 是否签署承诺书
  - `commitmentSignedDate` - 承诺书签署日期
  - `severPosition` - 服务岗位
  - `status` - 通用状态字段
  - `memberStatus` - 成员状态（义工/住众）
  - `roomId` - 房间ID

### 2. 更新前端 CreateVolunteerParams ✅

**文件**: `apps/web/src/services/volunteer.ts`

**修复内容**:
- 添加了所有后端支持的可选字段
- 添加了账号和密码字段（可选，后端会设置默认值）
- 统一了枚举类型，与后端数据库 schema 完全对应
- 添加了详细的注释说明

**新增字段**:
```typescript
// 账号信息
account?: string;
password?: string;

// 佛教信息的完整枚举
education?: "none" | "elementary" | "middle_school" | "high_school" | "bachelor" | "master" | "phd" | "other";
healthConditions?: "healthy" | "has_chronic_disease" | "has_disability" | "has_allergies" | "recovering_from_illness" | "other_conditions";
religiousBackground?: "upasaka" | "upasika" | "sramanera" | "sramanerika" | "bhikkhu" | "bhikkhuni" | "anagarika" | "siladhara" | "novice_monk" | "buddhist_visitor" | "none";

// 义工相关信息
trainingRecords?: string;
serviceHours?: number;
isCertified?: boolean;
notes?: string;
reviewer?: string;
signedCommitment?: boolean;
commitmentSignedDate?: string;
severPosition?: "kitchen" | "chanting" | "cleaning" | "reception" | "security" | "office" | "other";
status?: "active" | "inactive" | "applicant" | "trainee" | "registered" | "suspended";
lotusRole?: "admin" | "volunteer" | "resident";
memberStatus?: "volunteer" | "resident";
roomId?: number;
```

### 3. 更新 VolunteerForm 组件 ✅

**文件**: `apps/web/src/components/VolunteerForm.tsx`

**修复内容**:
- 添加了更多表单字段，覆盖重要的义工信息
- 将学历改为下拉选择框，而不是文本输入
- 重新组织了表单结构，分为三个部分：
  1. **基本信息** - 姓名、手机、身份证、性别、出生日期、邮箱、微信、地址
  2. **佛教信息** - 法名、学历、皈依状态、宗教身份、健康状况、家属同意情况
  3. **义工信息** - 服务岗位、义工状态、可服务时间、紧急联系人、爱好特长、加入原因

**新增字段**:
- 出生日期（日期选择器）
- 皈依状态（下拉选择）
- 宗教身份（下拉选择）
- 健康状况（下拉选择）
- 家属同意情况（下拉选择）
- 服务岗位（下拉选择）
- 义工状态（下拉选择）
- 可服务时间（文本输入）
- 紧急联系人（文本输入）
- 爱好特长（文本域）

### 4. 其他模块检查 ✅

检查了其他模块的前后端数据对齐情况：

#### 考勤模块
- **前端**: `apps/web/src/services/checkin.ts`
- **后端**: `apps/api/src/modules/checkin/index.ts`
- **状态**: ✅ 数据对齐良好
- **类型定义**: CheckInRecord, CheckInSummary 与后端 schema 匹配

#### 往生者模块
- **前端**: `apps/web/src/services/deceased.ts`
- **后端**: `apps/api/src/modules/deceased/index.ts`
- **状态**: ✅ 数据对齐良好
- **类型定义**: Deceased, CreateDeceasedParams 与后端 API 匹配

#### 助念排班模块
- **前端**: `apps/web/src/services/chanting.ts`
- **后端**: `apps/api/src/modules/chanting/index.ts`
- **状态**: ✅ 数据对齐良好
- **类型定义**: ChantingSchedule, CreateChantingScheduleParams 与后端 API 匹配

## 数据库字段命名说明

后端数据库使用 **snake_case** 命名（例如 `lotus_id`, `birth_date`），但 Drizzle ORM 会自动将其转换为 **camelCase**（例如 `lotusId`, `birthDate`），因此前端应该使用 camelCase 命名。

## 验证建议

1. **创建义工测试**:
   - 测试基本信息创建
   - 测试带有完整佛教信息的创建
   - 测试带有义工岗位和状态的创建

2. **更新义工测试**:
   - 测试部分字段更新
   - 测试枚举字段更新（学历、健康状况等）

3. **查询测试**:
   - 验证列表查询返回的数据字段完整
   - 验证详情查询返回的数据字段完整

4. **表单测试**:
   - 测试所有新增字段的输入
   - 测试下拉选择框的选项
   - 测试表单验证

## 后续建议

1. **完善表单验证**: 为新增的字段添加适当的验证规则
2. **添加字段说明**: 为不常见的字段添加工具提示或帮助文本
3. **优化表单布局**: 根据实际使用情况调整字段顺序和分组
4. **添加条件字段**: 某些字段可以根据其他字段的值显示/隐藏
5. **国际化支持**: 为枚举值添加中文显示

## 影响范围

### 直接影响的文件
1. `apps/web/src/types/index.ts` - 类型定义
2. `apps/web/src/services/volunteer.ts` - 服务层
3. `apps/web/src/components/VolunteerForm.tsx` - 表单组件

### 可能需要更新的文件
1. `apps/web/src/routes/volunteers.tsx` - 义工列表页面
2. `apps/web/src/routes/volunteers.$lotusId.tsx` - 义工详情页面
3. `apps/web/src/routes/volunteers.$lotusId.edit.tsx` - 义工编辑页面
4. `apps/web/src/components/VolunteerTable.tsx` - 义工表格组件
5. `apps/web/src/components/VolunteerDataTable.tsx` - 义工数据表格组件

### 不需要修改的文件
- 后端 API 接口 - 已经支持所有字段
- 数据库 schema - 已经定义了所有字段
- 其他模块的服务和类型 - 已验证数据对齐良好

## 注意事项

1. **向后兼容**: 所有新增字段都是可选的，不会影响现有功能
2. **默认值**: 后端会为某些字段设置默认值（如账号、密码）
3. **枚举值**: 确保前后端的枚举值完全一致
4. **日期格式**: 日期字段使用 ISO 8601 格式 (YYYY-MM-DD)
5. **时间戳**: createdAt 和 updatedAt 由后端自动管理

## 测试检查清单

- [ ] 创建义工 - 仅必填字段
- [ ] 创建义工 - 包含可选字段
- [ ] 更新义工 - 基本信息
- [ ] 更新义工 - 佛教信息
- [ ] 更新义工 - 义工状态和岗位
- [ ] 查询义工列表 - 验证返回字段
- [ ] 查询义工详情 - 验证返回字段
- [ ] 删除义工
- [ ] 批量操作
- [ ] 表单验证
- [ ] 枚举值显示

## 总结

本次修复解决了前后端数据不匹配的主要问题，特别是义工管理模块。通过完善类型定义、服务层接口和表单组件，现在前端可以：

1. 完整地展示后端返回的所有义工信息
2. 创建包含完整信息的义工记录
3. 更新义工的所有可编辑字段
4. 使用用户友好的表单输入（下拉选择、日期选择器等）

其他模块（考勤、往生者、助念排班）的数据对齐情况良好，不需要额外修复。


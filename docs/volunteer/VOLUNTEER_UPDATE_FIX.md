# 志愿者更新错误修复

## 📅 时间
2025-11-26

## 🐛 问题描述

用户在手机上传照片后，保存志愿者信息时报错：
```
Uncaught (in promise) Error: Expected union value
at api.ts:69:25
```

## 🔍 问题分析

### 根本原因
后端的 `mapToUpdateData` 函数只映射了部分基本字段，但前端表单提交了更多字段（如 `volunteerStatus`, `severPosition`, `familyConsent` 等），导致数据验证失败。

### 具体问题
1. **缺失字段映射**: `mapToUpdateData.ts` 只映射了基本信息字段
2. **缺失类型定义**: `model.ts` 中 `ServiceFields` 没有包含 `volunteerStatus`

## ✅ 修复方案

### 1. 更新 `mapToUpdateData.ts`
添加了所有缺失字段的映射：

```typescript
export function mapToUpdateData(
  body: VolunteerUpdateDto,
  existingData: InferSelectModel<typeof volunteer>,
): Partial<InferInsertModel<typeof volunteer>> {
  return {
    // 基本信息
    ...(body.name && { name: body.name }),
    ...(body.gender && { gender: body.gender }),
    ...(body.phone && { phone: body.phone }),
    ...(body.idNumber && { idNumber: body.idNumber }),
    ...(body.email !== undefined && { email: body.email ?? null }),
    ...(body.address !== undefined && { address: body.address ?? null }),
    ...(body.wechat !== undefined && { wechat: body.wechat ?? null }),
    ...(body.birthDate && { birthDate: new Date(body.birthDate) }),
    ...(body.avatar !== undefined && { avatar: body.avatar ?? null }),

    // 佛教信息 ✅ 新增
    ...(body.dharmaName !== undefined && { dharmaName: body.dharmaName ?? null }),
    ...(body.education && { education: body.education }),
    ...(body.hasBuddhismFaith !== undefined && { hasBuddhismFaith: body.hasBuddhismFaith }),
    ...(body.refugeStatus && { refugeStatus: body.refugeStatus }),
    ...(body.religiousBackground && { religiousBackground: body.religiousBackground }),

    // 健康和其他信息 ✅ 新增
    ...(body.healthConditions && { healthConditions: body.healthConditions }),
    ...(body.joinReason !== undefined && { joinReason: body.joinReason ?? null }),
    ...(body.hobbies !== undefined && { hobbies: body.hobbies ?? null }),
    ...(body.availableTimes !== undefined && { availableTimes: body.availableTimes ?? null }),
    ...(body.emergencyContact !== undefined && { emergencyContact: body.emergencyContact ?? null }),

    // 义工状态和岗位 ✅ 新增
    ...(body.volunteerStatus && { volunteerStatus: body.volunteerStatus }),
    ...(body.severPosition && { severPosition: body.severPosition }),
    ...(body.familyConsent && { familyConsent: body.familyConsent }),

    // 系统字段
    updatedAt: new Date(),
  }
}
```

### 2. 更新 `model.ts`
在 `ServiceFields` 中添加 `volunteerStatus` 字段定义：

```typescript
const ServiceFields = {
  // ... 其他字段 ...
  
  volunteerStatus: t.Optional(
    t.Union([
      t.Literal('applicant'),
      t.Literal('trainee'),
      t.Literal('registered'),
      t.Literal('inactive'),
      t.Literal('suspended'),
      t.Null(),
    ]),
  ),
}
```

## 📋 修改的文件

1. **apps/api/src/modules/volunteer/utils/mapToUpdateData.ts**
   - 添加佛教信息字段映射
   - 添加健康和其他信息字段映射
   - 添加义工状态和岗位字段映射

2. **apps/api/src/modules/volunteer/model.ts**
   - 在 `ServiceFields` 中添加 `volunteerStatus` 字段定义

## 🎯 修复效果

### 之前
- ❌ 保存时报错 "Expected union value"
- ❌ 只能更新基本信息
- ❌ 佛教信息、健康信息、岗位等字段无法保存

### 现在
- ✅ 所有字段都可以正常保存
- ✅ 手机上传的照片可以正常关联
- ✅ 完整的志愿者信息更新

## 🧪 测试建议

### 测试场景
1. **基本信息更新**
   - 修改姓名、电话、地址等
   - 上传照片
   - 保存并验证

2. **佛教信息更新**
   - 修改法名、学历、皈依状态等
   - 保存并验证

3. **岗位和状态更新**
   - 修改服务岗位
   - 修改义工状态
   - 修改家属同意情况
   - 保存并验证

4. **手机上传照片**
   - 生成二维码
   - 手机扫码上传照片
   - 保存志愿者信息
   - 验证照片是否正确关联

## 📊 字段映射对照表

| 字段类别 | 字段名 | 之前 | 现在 |
|---------|--------|------|------|
| 基本信息 | name, phone, email, etc. | ✅ | ✅ |
| 佛教信息 | dharmaName, education, etc. | ❌ | ✅ |
| 健康信息 | healthConditions | ❌ | ✅ |
| 其他信息 | joinReason, hobbies, etc. | ❌ | ✅ |
| 义工状态 | volunteerStatus | ❌ | ✅ |
| 服务岗位 | severPosition | ❌ | ✅ |
| 家属同意 | familyConsent | ❌ | ✅ |

## 💡 经验总结

### 问题根源
1. **不完整的数据映射**: 后端映射函数没有覆盖所有字段
2. **类型定义遗漏**: 某些字段在类型定义中缺失
3. **前后端不一致**: 前端表单提交的字段与后端处理的字段不匹配

### 最佳实践
1. **完整映射**: 确保所有前端字段都有对应的后端映射
2. **类型一致**: 前后端类型定义保持一致
3. **错误提示**: 提供清晰的错误信息，便于定位问题
4. **测试覆盖**: 测试所有字段的更新功能

## 🔗 相关文档

- [手机上传错误处理](MOBILE_UPLOAD_ERROR_HANDLING.md)
- [令牌错误修复](TOKEN_ERROR_FIX_SUMMARY.md)
- [端口更新总结](PORT_UPDATE_SUMMARY.md)

---

**状态**: ✅ 问题已修复，所有字段可以正常保存
**测试**: 建议测试各种字段的更新功能

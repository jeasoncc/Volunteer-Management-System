# 义工状态字段说明文档

## 状态枚举值定义

| 状态值       | 英文名     | 状态说明                                                                 |
|--------------|------------|--------------------------------------------------------------------------|
| `applicant`  | Applicant  | 申请人状态，已提交申请但尚未通过审核                                     |
| `trainee`    | Trainee    | 实习义工，已通过初步审核正在接受培训                                     |
| `registered` | Registered | 注册义工，已完成培训并通过考核                                            |
| `active`     | Active     | 活跃义工，当前正常参与服务                                               |
| `inactive`   | Inactive   | 不活跃义工，暂时不参与活动但保留资格                                     |
| `suspended`  | Suspended  | 暂停资格，因违规被临时禁止参与活动                                       |

## 状态生命周期流程图

```mermaid
stateDiagram-v2
    [*] --> applicant
    applicant --> trainee: 审核通过
    applicant --> inactive: 审核不通过
    trainee --> registered: 完成培训
    trainee --> inactive: 退出培训
    registered --> active: 开始服务
    registered --> inactive: 暂不服务
    active --> inactive: 停止服务
    active --> suspended: 违规处理
    inactive --> active: 重新激活
    suspended --> inactive: 处罚期满
-- 考勤汇总表（每日一条记录）
CREATE TABLE IF NOT EXISTS volunteer_checkin_summary (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID（外键）',
  lotus_id VARCHAR(50) NOT NULL COMMENT '莲池ID',
  name VARCHAR(50) NOT NULL COMMENT '姓名',
  date DATE NOT NULL COMMENT '日期',
  
  -- 打卡记录
  first_checkin_time TIME COMMENT '第一次打卡时间',
  last_checkin_time TIME COMMENT '最后一次打卡时间',
  checkin_count INT DEFAULT 0 COMMENT '打卡次数',
  
  -- 工时计算
  work_hours DECIMAL(4,2) DEFAULT 0 COMMENT '工作时长（小时）',
  calculation_rule VARCHAR(50) COMMENT '计算规则（single_card_3h, double_card_actual, manual_8h）',
  
  -- 考勤状态
  status ENUM('present', 'late', 'early_leave', 'absent', 'on_leave', 'manual') DEFAULT 'present' COMMENT '考勤状态',
  is_night_shift BOOLEAN DEFAULT FALSE COMMENT '是否跨夜班',
  
  -- 设备信息
  device_sn VARCHAR(50) COMMENT '设备序列号',
  body_temperature VARCHAR(10) COMMENT '体温',
  confidence VARCHAR(10) COMMENT '识别置信度',
  
  -- 备注和审批
  notes TEXT COMMENT '备注',
  is_manual BOOLEAN DEFAULT FALSE COMMENT '是否手动调整',
  adjusted_by VARCHAR(50) COMMENT '调整人',
  adjusted_at TIMESTAMP NULL COMMENT '调整时间',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_user_date (user_id, date),
  INDEX idx_lotus_id (lotus_id),
  INDEX idx_date (date),
  INDEX idx_status (status),
  INDEX idx_device_sn (device_sn),
  
  FOREIGN KEY (user_id) REFERENCES volunteer(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='义工考勤每日汇总表';

-- 考勤规则配置表
CREATE TABLE IF NOT EXISTS checkin_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rule_name VARCHAR(50) NOT NULL COMMENT '规则名称',
  rule_type VARCHAR(50) NOT NULL COMMENT '规则类型',
  rule_config JSON NOT NULL COMMENT '规则配置',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  priority INT DEFAULT 0 COMMENT '优先级（数字越大优先级越高）',
  effective_date DATE NOT NULL COMMENT '生效日期',
  expired_date DATE COMMENT '失效日期',
  description TEXT COMMENT '规则说明',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_rule_type (rule_type),
  INDEX idx_effective_date (effective_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='考勤规则配置表';

-- 插入默认规则
INSERT INTO checkin_rules (rule_name, rule_type, rule_config, effective_date, description) VALUES
('单次打卡默认工时', 'single_card_hours', '{"hours": 1, "description": "只打一次卡时默认1小时"}', '2024-01-01', '适用于老年义工忘记签退的情况'),
('双次打卡计算实际工时', 'double_card_actual', '{"max_hours": 12, "description": "打两次卡时计算实际时长，最多12小时"}', '2024-01-01', '正常签到签退情况'),
('跨夜班判断时间', 'night_shift_threshold', '{"start_hour": 20, "end_hour": 6, "description": "20:00-次日06:00算跨夜班"}', '2024-01-01', '夜班从晚上8点到次日早上6点'),
('特殊人员固定工时', 'special_user_fixed', '{"hours": 8, "user_ids": [], "description": "特定人员固定8小时"}', '2024-01-01', '某些特殊岗位固定工时');

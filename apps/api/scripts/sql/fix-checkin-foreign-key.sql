-- 修复考勤表的外键关系
-- 当前问题：使用 lotus_id 作为外键，但 lotus_id 不是主键
-- 解决方案：添加 user_id 字段，使用 volunteer.id 作为外键

-- 1. 添加 user_id 字段
ALTER TABLE volunteer_checkin 
ADD COLUMN user_id BIGINT UNSIGNED COMMENT '用户ID（外键）' AFTER id;

-- 2. 根据 lotus_id 填充 user_id
UPDATE volunteer_checkin vc
INNER JOIN volunteer v ON vc.lotus_id = v.lotus_id
SET vc.user_id = v.id;

-- 3. 设置 user_id 为 NOT NULL
ALTER TABLE volunteer_checkin 
MODIFY COLUMN user_id BIGINT UNSIGNED NOT NULL;

-- 4. 添加外键约束
ALTER TABLE volunteer_checkin
ADD CONSTRAINT fk_checkin_user 
FOREIGN KEY (user_id) REFERENCES volunteer(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- 5. 添加索引
ALTER TABLE volunteer_checkin
ADD INDEX idx_user_id (user_id);

-- 6. 添加缺失的字段（忽略已存在的错误）
ALTER TABLE volunteer_checkin ADD COLUMN device_sn VARCHAR(50) COMMENT '设备序列号' AFTER recordType;
ALTER TABLE volunteer_checkin ADD COLUMN body_temperature VARCHAR(10) COMMENT '体温' AFTER device_sn;
ALTER TABLE volunteer_checkin ADD COLUMN confidence VARCHAR(10) COMMENT '识别置信度' AFTER body_temperature;

-- 7. 添加索引（忽略已存在的错误）
ALTER TABLE volunteer_checkin ADD INDEX idx_device_sn (device_sn);
ALTER TABLE volunteer_checkin ADD INDEX idx_date_user (date, user_id);

-- 查看表结构
DESCRIBE volunteer_checkin;

-- 统一 volunteer_checkin 表的列名为下划线命名
-- 将驼峰命名的列改为下划线命名

-- 1. 重命名 recordType -> record_type
ALTER TABLE volunteer_checkin 
CHANGE COLUMN recordType record_type VARCHAR(50);

-- 2. 重命名 originTime -> origin_time
ALTER TABLE volunteer_checkin 
CHANGE COLUMN originTime origin_time VARCHAR(50);

-- 3. 重命名 recordId -> record_id
ALTER TABLE volunteer_checkin 
CHANGE COLUMN recordId record_id VARCHAR(100);

-- 4. 查看最终表结构
DESCRIBE volunteer_checkin;

-- 5. 验证数据是否完整
SELECT COUNT(*) as total_records FROM volunteer_checkin;

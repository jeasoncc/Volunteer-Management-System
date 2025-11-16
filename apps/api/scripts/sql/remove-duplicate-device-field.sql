-- 删除重复的设备字段
-- 问题：volunteer_checkin 表有两个设备字段：device_id 和 device_sn
-- 解决：删除 device_id，只保留 device_sn

-- 1. 检查当前数据
SELECT 
  'Before cleanup' as status,
  COUNT(*) as total_records,
  COUNT(DISTINCT device_id) as device_id_count,
  COUNT(DISTINCT device_sn) as device_sn_count
FROM volunteer_checkin;

-- 2. 将 device_id 的数据迁移到 device_sn（如果 device_sn 为空）
UPDATE volunteer_checkin 
SET device_sn = device_id 
WHERE device_sn IS NULL AND device_id IS NOT NULL;

-- 3. 删除 device_id 列
ALTER TABLE volunteer_checkin 
DROP COLUMN device_id;

-- 4. 验证结果
DESCRIBE volunteer_checkin;

-- 5. 检查清理后的数据
SELECT 
  'After cleanup' as status,
  COUNT(*) as total_records,
  COUNT(DISTINCT device_sn) as device_sn_count
FROM volunteer_checkin;

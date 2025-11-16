-- 添加缺失的考勤字段
-- 此脚本会忽略已存在字段的错误

-- 检查并添加 device_sn 字段
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'lotus' 
AND TABLE_NAME = 'volunteer_checkin' 
AND COLUMN_NAME = 'device_sn';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE volunteer_checkin ADD COLUMN device_sn VARCHAR(50) COMMENT ''设备序列号'' AFTER recordType',
  'SELECT ''device_sn already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 body_temperature 字段
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'lotus' 
AND TABLE_NAME = 'volunteer_checkin' 
AND COLUMN_NAME = 'body_temperature';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE volunteer_checkin ADD COLUMN body_temperature VARCHAR(10) COMMENT ''体温''',
  'SELECT ''body_temperature already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 confidence 字段
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'lotus' 
AND TABLE_NAME = 'volunteer_checkin' 
AND COLUMN_NAME = 'confidence';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE volunteer_checkin ADD COLUMN confidence VARCHAR(10) COMMENT ''识别置信度''',
  'SELECT ''confidence already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 查看最终表结构
DESCRIBE volunteer_checkin;

-- 修复所有表中的驼峰命名列为下划线命名

-- 1. 修复 deceased 表
ALTER TABLE deceased 
CHANGE COLUMN chantPostion chant_position ENUM('room-one','room-two','room-three','room-four','unknow') DEFAULT 'unknow';

-- 2. 验证修复结果
DESCRIBE deceased;
DESCRIBE chanting_schedule;
DESCRIBE volunteer_checkin;
DESCRIBE volunteer_checkin_summary;

-- 3. 检查是否还有驼峰命名的列
SELECT 
  TABLE_NAME, 
  COLUMN_NAME 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'lotus' 
  AND COLUMN_NAME REGEXP '[A-Z]'
ORDER BY TABLE_NAME, COLUMN_NAME;

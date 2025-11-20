/**
 * 格式化工具函数
 */

/**
 * 格式化手机号：138****8888
 */
export const formatPhone = (phone: string): string => {
	if (!phone || phone.length !== 11) return phone;
	return `${phone.slice(0, 3)}****${phone.slice(7)}`;
};

/**
 * 格式化身份证号：110***********1234
 */
export const formatIdNumber = (idNumber: string): string => {
	if (!idNumber || idNumber.length < 8) return idNumber;
	return `${idNumber.slice(0, 3)}***********${idNumber.slice(-4)}`;
};

/**
 * 格式化货币：¥1,234.56
 */
export const formatCurrency = (amount: number): string => {
	return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * 格式化数字：1,234,567
 */
export const formatNumber = (num: number): string => {
	return num.toLocaleString('zh-CN');
};

/**
 * 格式化百分比：12.34%
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
	return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * 格式化文件大小：1.23 MB
 */
export const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return '0 B';
	
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	
	return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * 格式化时长：将秒数转为可读时长
 * @example formatDuration(3665) => "1小时1分5秒"
 */
export const formatDuration = (seconds: number): string => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;
	
	const parts: string[] = [];
	if (hours > 0) parts.push(`${hours}小时`);
	if (minutes > 0) parts.push(`${minutes}分`);
	if (secs > 0) parts.push(`${secs}秒`);
	
	return parts.join('') || '0秒';
};

/**
 * 截断文本并添加省略号
 */
export const truncate = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength)}...`;
};

/**
 * 获取姓名首字母（用于头像）
 */
export const getInitials = (name: string): string => {
	if (!name) return '';
	return name.charAt(0).toUpperCase();
};

/**
 * 格式化性别
 */
export const formatGender = (gender: 'male' | 'female' | 'other'): string => {
	const map = {
		male: '男',
		female: '女',
		other: '其他',
	};
	return map[gender] || gender;
};

/**
 * 格式化义工状态
 */
export const formatVolunteerStatus = (
	status: 'applicant' | 'trainee' | 'registered' | 'inactive' | 'suspended'
): string => {
	const map = {
		applicant: '申请中',
		trainee: '培训中',
		registered: '已注册',
		inactive: '未激活',
		suspended: '已暂停',
	};
	return map[status] || status;
};

/**
 * 格式化角色
 */
export const formatRole = (role: 'admin' | 'volunteer' | 'resident'): string => {
	const map = {
		admin: '管理员',
		volunteer: '义工',
		resident: '居民',
	};
	return map[role] || role;
};

/**
 * 验证手机号格式
 */
export const isValidPhone = (phone: string): boolean => {
	return /^1[3-9]\d{9}$/.test(phone);
};

/**
 * 验证身份证号格式
 */
export const isValidIdNumber = (idNumber: string): boolean => {
	return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idNumber);
};

/**
 * 验证邮箱格式
 */
export const isValidEmail = (email: string): boolean => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

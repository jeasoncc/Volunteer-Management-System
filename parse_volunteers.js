// 解析义工数据的脚本
const volunteersText = `
[您提供的所有义工数据文本]
`;

// 解析函数
function parseVolunteers(text) {
  const volunteers = [];
  const lines = text.split('\n');
  let currentVolunteer = {};
  
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('---') || line.startsWith('**')) continue;
    
    if (line.startsWith('姓名:') || line.startsWith('姓名：')) {
      if (currentVolunteer.name) {
        volunteers.push(currentVolunteer);
      }
      currentVolunteer = {};
      currentVolunteer.name = line.split(/[:：]/)[1].trim();
    } else if (line.startsWith('身份证号')) {
      currentVolunteer.idNumber = line.split(/[:：]/)[1].trim();
    } else if (line.startsWith('性别')) {
      const gender = line.split(/[:：]/)[1].trim();
      currentVolunteer.gender = gender === '男' ? 'male' : 'female';
    } else if (line.startsWith('出生年月')) {
      const birthStr = line.split(/[:：]/)[1].trim();
      // 解析各种日期格式
      const match = birthStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})/);
      if (match) {
        const [_, year, month, day] = match;
        currentVolunteer.birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    } else if (line.startsWith('手机号')) {
      const phone = line.split(/[:：]/)[1].trim();
      if (phone) currentVolunteer.phone = phone;
    } else if (line.startsWith('住址')) {
      const address = line.split(/[:：]/)[1].trim();
      if (address) currentVolunteer.address = address;
    } else if (line.startsWith('邮箱')) {
      const email = line.split(/[:：]/)[1].trim();
      if (email) currentVolunteer.email = email;
    } else if (line.startsWith('深圳义工号')) {
      const volunteerId = line.split(/[:：]/)[1].trim();
      if (volunteerId && volunteerId !== '无') currentVolunteer.volunteerId = volunteerId;
    } else if (line.startsWith('微信号')) {
      const wechat = line.split(/[:：]/)[1].trim();
      if (wechat) currentVolunteer.wechat = wechat;
    } else if (line.startsWith('学历')) {
      const edu = line.split(/[:：]/)[1].trim();
      if (edu.includes('小学')) currentVolunteer.education = 'elementary';
      else if (edu.includes('初中')) currentVolunteer.education = 'middle_school';
      else if (edu.includes('高中')) currentVolunteer.education = 'high_school';
      else if (edu.includes('中专')) currentVolunteer.education = 'technical_secondary';
      else if (edu.includes('专科')) currentVolunteer.education = 'associate';
      else if (edu.includes('本科')) currentVolunteer.education = 'bachelor';
    } else if (line.startsWith('宗教信仰')) {
      const religion = line.split(/[:：]/)[1].trim();
      currentVolunteer.religiousBackground = religion.includes('佛教') ? 'upasaka' : 'none';
    } else if (line.startsWith('是否皈依')) {
      const refuge = line.split(/[:：]/)[1].trim();
      currentVolunteer.refugeStatus = refuge.includes('皈依') ? 'refuge' : 'none';
    } else if (line.startsWith('健康状况')) {
      const health = line.split(/[:：]/)[1].trim();
      if (health.includes('很好') || health.includes('无疾病')) {
        currentVolunteer.healthConditions = 'healthy';
      } else if (health.includes('一般')) {
        currentVolunteer.healthConditions = 'general';
      }
    }
  }
  
  if (currentVolunteer.name) {
    volunteers.push(currentVolunteer);
  }
  
  return volunteers;
}

const volunteers = parseVolunteers(volunteersText);
console.log(JSON.stringify(volunteers, null, 2));
console.log(`\n总共解析出 ${volunteers.length} 个义工`);

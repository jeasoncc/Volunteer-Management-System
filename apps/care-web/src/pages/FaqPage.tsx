import { SEO } from '../components/SEO';

export function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <SEO 
        title="常见问题 - 莲花生命关怀志愿者官网"
        description="莲花生命关怀项目和服务的常见问题解答。了解关于项目、志愿者和服务的常见问题，获取更多详细信息。"
        keywords="莲花生命关怀, 常见问题, FAQ, 项目问题, 志愿者问题, 服务问题"
      />
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-[#4b2f1c] mb-6">常见问题</h1>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <p className="text-[#7b6243]">
            在这里您可以找到关于莲花生命关怀项目和服务的常见问题解答。
            如果您还有其他疑问，请随时通过联系方式与我们取得联系。
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">关于项目</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">
              什么是莲花生命关怀项目？
            </h3>
            <p className="text-[#7b6243]">
              莲花生命关怀项目是一个专注于为临终患者及其家属提供身心灵全方位陪伴服务的公益项目。
              我们结合佛教慈悲理念与现代心理支持方法，致力于让每个生命都能安然走完最后一程，
              让每个家庭都能获得应有的支持。
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">
              项目的服务对象是谁？
            </h3>
            <p className="text-[#7b6243]">
              我们的服务对象主要包括：
            </p>
            <ul className="list-disc pl-5 text-[#7b6243] mt-2 space-y-1">
              <li>处于生命末期的患者</li>
              <li>患有严重疾病的患者</li>
              <li>患者的家庭成员和照护者</li>
              <li>失去亲人的哀伤者</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">
              项目的服务范围有哪些？
            </h3>
            <p className="text-[#7b6243]">
              我们提供多种类型的服务，包括病房陪伴、家属支持、告别仪式协助等。
              具体服务内容会根据服务对象的实际需求进行个性化定制。
              目前我们的服务主要覆盖XX市及周边地区。
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">关于志愿者</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">
              成为志愿者需要什么条件？
            </h3>
            <p className="text-[#7b6243]">
              基本条件包括：年满18周岁，身心健康，具有良好的道德品质和奉献精神，
              尊重生命，富有同情心和爱心，能够保证一定的服务时间，遵守团队规章制度和保密原则。
              有心理学、医学、社工等相关专业背景或志愿服务经验者优先。
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">
              志愿者需要接受哪些培训？
            </h3>
            <p className="text-[#7b6243]">
              我们为志愿者提供完整的培训体系，包括：
            </p>
            <ul className="list-disc pl-5 text-[#7b6243] mt-2 space-y-1">
              <li>岗前培训：生命关怀理念、服务规范、安全须知等</li>
              <li>专业培训：心理支持技巧、哀伤辅导、危机干预等</li>
              <li>持续教育：案例督导、技能提升、自我关怀等</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">
              志愿者的服务时间如何安排？
            </h3>
            <p className="text-[#7b6243]">
              我们理解志愿者可能有工作或其他 commitments，因此提供灵活的服务时间安排。
              志愿者可以根据自己的时间安排选择合适的服务时段。
              通常建议每周至少能保证2-4小时的服务时间。
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">关于服务</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">
              如何申请服务？
            </h3>
            <p className="text-[#7b6243]">
              您可以通过以下方式申请我们的服务：
            </p>
            <ul className="list-disc pl-5 text-[#7b6243] mt-2 space-y-1">
              <li>拨打我们的服务热线：400-XXX-XXXX</li>
              <li>发送邮件至：<span className="break-words">service@lotuscare.org</span></li>
              <li>通过官网在线留言申请</li>
            </ul>
            <p className="text-[#7b6243] mt-2">
              我们的工作人员会在收到申请后尽快与您联系，了解具体需求并安排合适的服务。
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">
              服务是否收费？
            </h3>
            <p className="text-[#7b6243]">
              莲花生命关怀是一个公益项目，我们提供的所有服务均为免费。
              但在某些特殊情况下（如需要额外资源支持），可能会产生少量费用，
              我们会提前告知并征得同意。
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">
              服务的安全性如何保障？
            </h3>
            <p className="text-[#7b6243]">
              我们高度重视服务的安全性：
            </p>
            <ul className="list-disc pl-5 text-[#7b6243] mt-2 space-y-1">
              <li>所有志愿者都经过严格筛选和背景调查</li>
              <li>志愿者接受专业培训，掌握安全防护知识</li>
              <li>建立完善的服务监督和反馈机制</li>
              <li>为志愿者和服务对象提供必要的保险保障</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">其他问题</h2>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">
                如何进行捐赠支持？
              </h3>
              <p className="text-[#7b6243]">
                您可以通过以下方式支持我们的公益事业：
              </p>
              <ul className="list-disc pl-5 text-[#7b6243] mt-2 space-y-1">
                <li>银行转账：XX银行 XX支行 账号：XXXXXXXXXXXX</li>
                <li>在线捐赠：通过官网捐赠页面进行</li>
                <li>物资捐赠：请联系了解当前所需物资清单</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">
                是否可以参观或实习？
              </h3>
              <p className="text-[#7b6243]">
                我们欢迎对生命关怀事业感兴趣的学生和专业人士前来参观学习。
                请提前至少一周通过邮件联系，说明您的身份、目的和时间安排，
                我们会根据实际情况安排接待。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
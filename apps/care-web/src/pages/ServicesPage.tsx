import { SEO } from '../components/SEO';

export function ServicesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <SEO 
        title="志愿服务 - 莲花生命关怀志愿者官网"
        description="了解莲花生命关怀志愿者团队提供的多种类型志愿服务，包括病房陪伴、家属支持、告别仪式协助等。我们的服务以专业、温暖、尊重为原则。"
        keywords="莲花生命关怀, 志愿服务, 病房陪伴, 家属支持, 告别仪式, 临终关怀"
      />
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-[#4b2f1c] mb-6">志愿服务</h1>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <p className="text-[#7b6243] mb-4">
            莲花生命关怀志愿者团队提供多种类型的志愿服务，涵盖临终关怀的各个方面。
            我们的服务以专业、温暖、尊重为原则，致力于为患者及其家属提供全方位的支持。
          </p>
          <p className="text-[#7b6243]">
            所有志愿者都经过严格筛选和专业培训，具备相应的知识和技能，能够提供高质量的服务。
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">服务类型</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#f5ecdd] flex items-center justify-center mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#c28a3a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#4b2f1c]">病房陪伴</h3>
            </div>
            <p className="text-[#7b6243] mb-4">
              在医院或护理机构中，为住院患者提供安静的陪伴，倾听他们的心声，
              协助满足一些非医疗性质的需求。
            </p>
            <div className="text-sm text-[#9c7a4f]">
              <p className="font-medium mb-1">服务内容：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>聊天交流，缓解孤独感</li>
                <li>读书读报，娱乐互动</li>
                <li>协助联系家属</li>
                <li>陪伴就医检查</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#f5ecdd] flex items-center justify-center mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#c28a3a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#4b2f1c]">家属支持</h3>
            </div>
            <p className="text-[#7b6243] mb-4">
              为患者家属提供情感支持和实用建议，帮助他们应对压力和焦虑，
              提供相关信息和资源链接。
            </p>
            <div className="text-sm text-[#9c7a4f]">
              <p className="font-medium mb-1">服务内容：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>倾听与陪伴，缓解焦虑</li>
                <li>提供照护技巧指导</li>
                <li>协助寻找社会资源</li>
                <li>悲伤辅导与心理支持</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#f5ecdd] flex items-center justify-center mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#c28a3a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#4b2f1c]">告别仪式协助</h3>
            </div>
            <p className="text-[#7b6243] mb-4">
              在合适的前提下，协助家属完成告别与追思环节，
              保持庄重与温柔，尊重文化与传统。
            </p>
            <div className="text-sm text-[#9c7a4f]">
              <p className="font-medium mb-1">服务内容：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>协助布置告别场所</li>
                <li>主持告别仪式流程</li>
                <li>提供礼仪指导</li>
                <li>后续关怀与跟进</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">服务原则</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3">专业性</h3>
            <p className="text-[#7b6243]">
              所有志愿者均接受专业培训，掌握基本的沟通技巧、心理支持方法和相关知识，
              确保服务质量和安全性。
            </p>
          </div>
          <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3">保密性</h3>
            <p className="text-[#7b6243]">
              严格遵守保密原则，保护服务对象的隐私和个人信息，
              未经允许不得向第三方透露任何相关信息。
            </p>
          </div>
          <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3">尊重性</h3>
            <p className="text-[#7b6243]">
              尊重每一位服务对象的文化背景、宗教信仰和个人意愿，
              不强加个人观点，提供个性化的服务。
            </p>
          </div>
          <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3">界限性</h3>
            <p className="text-[#7b6243]">
              明确志愿者的角色定位，不替代家属的责任，
              不提供医疗诊断和治疗建议，必要时引导寻求专业帮助。
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">服务流程</h2>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <div className="space-y-6">
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#c28a3a] flex items-center justify-center text-white font-bold mr-4">1</div>
              <div>
                <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">需求评估</h3>
                <p className="text-[#7b6243]">与服务对象或家属沟通，了解具体需求和服务期望。</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#c28a3a] flex items-center justify-center text-white font-bold mr-4">2</div>
              <div>
                <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">匹配志愿者</h3>
                <p className="text-[#7b6243]">根据需求特点，安排合适的专业志愿者提供服务。</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#c28a3a] flex items-center justify-center text-white font-bold mr-4">3</div>
              <div>
                <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">实施服务</h3>
                <p className="text-[#7b6243]">志愿者按计划开展服务，定期反馈服务情况。</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#c28a3a] flex items-center justify-center text-white font-bold mr-4">4</div>
              <div>
                <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">跟踪回访</h3>
                <p className="text-[#7b6243]">服务结束后进行回访，了解满意度并收集改进建议。</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
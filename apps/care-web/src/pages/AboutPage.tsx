import { SEO } from '../components/SEO';

export function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <SEO 
        title="关于我们 - 莲花生命关怀志愿者官网"
        description="了解莲花生命关怀项目的起源、使命愿景和核心价值观。我们致力于为临终患者及其家属提供身心灵全方位的陪伴服务。"
        keywords="莲花生命关怀, 关于我们, 项目起源, 使命愿景, 核心价值观, 志愿者团队"
      />
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-[#4b2f1c] mb-6">关于我们</h1>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#4b2f1c] mb-4">莲花生命关怀的起源</h2>
          <p className="text-[#7b6243] mb-4">
            莲花生命关怀项目起源于寺院长期的助念与临终关怀实践。我们深信，在生命的最后阶段，
            每个人都值得被温柔对待，每个家庭都需要专业的支持与陪伴。
          </p>
          <p className="text-[#7b6243] mb-4">
            从2018年开始，我们的志愿者团队逐步形成了一套完整的关怀体系，结合佛教慈悲理念与现代
            心理支持方法，为临终者及其家属提供身心灵全方位的陪伴服务。
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">我们的使命与愿景</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3">使命</h3>
            <ul className="list-disc pl-5 text-[#7b6243] space-y-2">
              <li>为临终者提供有尊严的陪伴</li>
              <li>为家属提供情感支持与资源链接</li>
              <li>推动社会对生命末期关怀的认知</li>
              <li>培养专业的生命关怀志愿者团队</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3">愿景</h3>
            <ul className="list-disc pl-5 text-[#7b6243] space-y-2">
              <li>让每个生命都能安然走完最后一程</li>
              <li>让每个家庭都能获得应有的支持</li>
              <li>建立可持续的社区关怀网络</li>
              <li>传承与发展本土化的关怀智慧</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">核心价值观</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-lg p-4 text-center">
            <div className="text-[#c28a3a] font-semibold mb-2">慈悲</div>
            <p className="text-xs text-[#7b6243]">以慈悲心对待每一个生命</p>
          </div>
          <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-lg p-4 text-center">
            <div className="text-[#c28a3a] font-semibold mb-2">尊重</div>
            <p className="text-xs text-[#7b6243]">尊重个体信仰与文化差异</p>
          </div>
          <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-lg p-4 text-center">
            <div className="text-[#c28a3a] font-semibold mb-2">专业</div>
            <p className="text-xs text-[#7b6243]">持续学习提升服务能力</p>
          </div>
          <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-lg p-4 text-center">
            <div className="text-[#c28a3a] font-semibold mb-2">奉献</div>
            <p className="text-xs text-[#7b6243]">无私奉献传递温暖力量</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">团队介绍</h2>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <p className="text-[#7b6243] mb-4">
            我们的团队由来自不同背景的专业人士和爱心志愿者组成，包括心理咨询师、医护人员、
            社工、宗教师以及经过专业培训的志愿者。每位成员都经过严格的筛选和培训，具备相应的
            专业知识和服务能力。
          </p>
          <p className="text-[#7b6243]">
            团队定期开展督导会议、技能培训和心灵成长活动，确保服务质量的同时也关注志愿者自身的
            身心健康与成长。
          </p>
        </div>
      </section>
    </div>
  );
}
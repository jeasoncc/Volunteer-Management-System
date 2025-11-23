import { SEO } from '../components/SEO';

export function JoinPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <SEO 
        title="加入我们 - 莲花生命关怀志愿者官网"
        description="成为莲花生命关怀志愿者！了解志愿者要求、加入流程和培训体系。无论您是专业人士还是爱心人士，只要有一颗慈悲的心和奉献的精神，都可以加入我们。"
        keywords="莲花生命关怀, 加入我们, 志愿者招募, 志愿者要求, 加入流程, 培训体系"
      />
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-[#4b2f1c] mb-6">加入我们</h1>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <p className="text-[#7b6243] mb-4">
            莲花生命关怀志愿者团队欢迎您的加入！我们相信，每一个生命都值得被温柔对待，
            每一份善意都能为他人带来温暖与力量。
          </p>
          <p className="text-[#7b6243]">
            无论您是专业人士还是爱心人士，只要您有一颗慈悲的心和奉献的精神，
            都可以成为我们的一员，共同为临终关怀事业贡献力量。
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">志愿者要求</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3">基本条件</h3>
            <ul className="list-disc pl-5 text-[#7b6243] space-y-2">
              <li>年满18周岁，身心健康</li>
              <li>具有良好的道德品质和奉献精神</li>
              <li>尊重生命，富有同情心和爱心</li>
              <li>能够保证一定的服务时间</li>
              <li>遵守团队规章制度和保密原则</li>
            </ul>
          </div>
          <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3">优先条件</h3>
            <ul className="list-disc pl-5 text-[#7b6243] space-y-2">
              <li>有心理学、医学、社工等相关专业背景</li>
              <li>有志愿服务或公益活动经验</li>
              <li>熟悉佛教文化或有宗教背景</li>
              <li>具备良好的沟通能力和应变能力</li>
              <li>能够接受定期培训和督导</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">加入流程</h2>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <div className="space-y-8">
            <div className="flex">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#c28a3a] flex items-center justify-center text-white font-bold mr-4">1</div>
              <div>
                <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">提交申请</h3>
                <p className="text-[#7b6243]">填写志愿者申请表，提供个人基本信息和相关经历。</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#c28a3a] flex items-center justify-center text-white font-bold mr-4">2</div>
              <div>
                <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">初步筛选</h3>
                <p className="text-[#7b6243]">工作人员对申请材料进行审核，符合条件者进入下一轮。</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#c28a3a] flex items-center justify-center text-white font-bold mr-4">3</div>
              <div>
                <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">面试面谈</h3>
                <p className="text-[#7b6243]">安排面试面谈，了解申请者的动机、能力和适应性。</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#c28a3a] flex items-center justify-center text-white font-bold mr-4">4</div>
              <div>
                <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">基础培训</h3>
                <p className="text-[#7b6243]">参加基础培训课程，学习相关知识和技能。</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#c28a3a] flex items-center justify-center text-white font-bold mr-4">5</div>
              <div>
                <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">见习服务</h3>
                <p className="text-[#7b6243]">在资深志愿者指导下参与实际服务，积累经验。</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#c28a3a] flex items-center justify-center text-white font-bold mr-4">6</div>
              <div>
                <h3 className="text-lg font-semibold text-[#4b2f1c] mb-2">正式录用</h3>
                <p className="text-[#7b6243]">通过考核评估后，正式成为莲花生命关怀志愿者。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">培训体系</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3">岗前培训</h3>
            <p className="text-[#7b6243] mb-3">
              新志愿者必须完成的入门培训，包括理念介绍、服务规范、安全须知等。
            </p>
            <div className="text-sm text-[#9c7a4f]">
              <p className="font-medium mb-1">培训内容：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>生命关怀理念</li>
                <li>服务伦理与边界</li>
                <li>沟通技巧</li>
                <li>安全防护</li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3">专业培训</h3>
            <p className="text-[#7b6243] mb-3">
              针对不同服务类型的专项培训，提升专业服务能力。
            </p>
            <div className="text-sm text-[#9c7a4f]">
              <p className="font-medium mb-1">培训内容：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>心理支持技巧</li>
                <li>哀伤辅导</li>
                <li>危机干预</li>
                <li>案例研讨</li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3">持续教育</h3>
            <p className="text-[#7b6243] mb-3">
              定期举办的督导会议、经验分享和进阶课程。
            </p>
            <div className="text-sm text-[#9c7a4f]">
              <p className="font-medium mb-1">培训内容：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>案例督导</li>
                <li>技能提升</li>
                <li>自我关怀</li>
                <li>团队建设</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">志愿者权益</h2>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3">服务保障</h3>
              <ul className="list-disc pl-5 text-[#7b6243] space-y-2">
                <li>提供必要的服务保险</li>
                <li>配备专业督导支持</li>
                <li>定期健康关怀</li>
                <li>服务时长认证</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3">成长机会</h3>
              <ul className="list-disc pl-5 text-[#7b6243] space-y-2">
                <li>专业技能培训</li>
                <li>参与项目策划</li>
                <li>国内外交流学习</li>
                <li>优秀志愿者表彰</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
import { SEO } from '../components/SEO';

export function StoriesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <SEO 
        title="项目故事 - 莲花生命关怀志愿者官网"
        description="莲花生命关怀项目故事和案例分享。了解我们的志愿服务经历、感人故事和成功案例，感受生命关怀的力量。"
        keywords="莲花生命关怀, 项目故事, 案例分享, 志愿服务经历, 感人故事, 成功案例"
      />
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-[#4b2f1c] mb-6">项目故事</h1>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <p className="text-[#7b6243]">
            在这里，我们分享莲花生命关怀志愿者团队的服务经历和感人故事。
            每一个故事都承载着生命的重量和爱的力量。
          </p>
        </div>
      </section>

      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 故事卡片 1 */}
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center text-sm text-[#9c7a4f] mb-3">
              <span className="bg-[#f5ecdd] px-2 py-1 rounded">案例分享</span>
              <span className="ml-3">2025年10月</span>
            </div>
            <h3 className="text-xl font-semibold text-[#4b2f1c] mb-3">
              陪伴李奶奶走完最后一程
            </h3>
            <p className="text-[#7b6243] mb-4">
              李奶奶是一位独居老人，患有晚期癌症。在她生命的最后三个月里，
              我们的志愿者团队轮流陪伴她，为她读书、聊天，帮助她缓解疼痛和孤独感。
              在志愿者的陪伴下，李奶奶安详地走完了人生最后一程。
            </p>
            <a href="#" className="text-[#c28a3a] hover:text-[#b37623] font-medium">
              阅读全文 →
            </a>
          </div>

          {/* 故事卡片 2 */}
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center text-sm text-[#9c7a4f] mb-3">
              <span className="bg-[#f5ecdd] px-2 py-1 rounded">志愿者故事</span>
              <span className="ml-3">2025年9月</span>
            </div>
            <h3 className="text-xl font-semibold text-[#4b2f1c] mb-3">
              从受助者到志愿者的转变
            </h3>
            <p className="text-[#7b6243] mb-4">
              张女士在失去父亲后，深受我们志愿者的帮助和支持。
              一年后，她主动申请成为志愿者，用自己的经历去帮助其他面临同样困境的家庭。
              她说："是志愿者的陪伴让我走出了阴霾，现在我想把这份温暖传递下去。"
            </p>
            <a href="#" className="text-[#c28a3a] hover:text-[#b37623] font-medium">
              阅读全文 →
            </a>
          </div>

          {/* 故事卡片 3 */}
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center text-sm text-[#9c7a4f] mb-3">
              <span className="bg-[#f5ecdd] px-2 py-1 rounded">团队故事</span>
              <span className="ml-3">2025年8月</span>
            </div>
            <h3 className="text-xl font-semibold text-[#4b2f1c] mb-3">
              夏日送清凉，关爱社区老人
            </h3>
            <p className="text-[#7b6243] mb-4">
              在炎热的夏季，我们的志愿者团队组织了"夏日送清凉"活动，
              为社区中的独居老人送去防暑降温用品和贴心陪伴。
              活动不仅为老人们带去了物质帮助，更重要的是精神慰藉。
            </p>
            <a href="#" className="text-[#c28a3a] hover:text-[#b37623] font-medium">
              阅读全文 →
            </a>
          </div>

          {/* 故事卡片 4 */}
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center text-sm text-[#9c7a4f] mb-3">
              <span className="bg-[#f5ecdd] px-2 py-1 rounded">特别报道</span>
              <span className="ml-3">2025年7月</span>
            </div>
            <h3 className="text-xl font-semibold text-[#4b2f1c] mb-3">
              疫情期间的坚守与奉献
            </h3>
            <p className="text-[#7b6243] mb-4">
              在疫情期间，我们的志愿者团队克服重重困难，
              通过电话、视频等方式为服务对象提供远程陪伴和支持。
              虽然不能面对面，但志愿者们的关爱从未间断。
            </p>
            <a href="#" className="text-[#c28a3a] hover:text-[#b37623] font-medium">
              阅读全文 →
            </a>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">分享您的故事</h2>
        <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-xl p-6">
          <p className="text-[#7b6243] mb-4">
            如果您有与莲花生命关怀相关的故事想要分享，欢迎与我们联系。
            您的故事可能会帮助到更多需要帮助的人，也可能会激励更多人加入我们的志愿者团队。
          </p>
          <a 
            href="/contact" 
            className="inline-block px-6 py-2 bg-[#c28a3a] text-white rounded-md hover:bg-[#b37623] focus:outline-none focus:ring-2 focus:ring-[#c28a3a]"
          >
            联系我们
          </a>
        </div>
      </section>
    </div>
  );
}
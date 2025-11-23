import { SEO } from '../components/SEO';

export function NewsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <SEO 
        title="新闻动态 - 莲花生命关怀志愿者官网"
        description="关注莲花生命关怀的最新动态、活动通知和媒体报道。了解我们的最新活动、培训信息和媒体报道内容。"
        keywords="莲花生命关怀, 新闻动态, 活动通知, 媒体报道, 志愿者培训, 最新活动"
      />
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-[#4b2f1c] mb-6">新闻动态</h1>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <p className="text-[#7b6243]">
            关注莲花生命关怀的最新动态、活动通知和媒体报道。
          </p>
        </div>
      </section>

      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 新闻卡片 1 */}
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-center text-sm text-[#9c7a4f] mb-3 gap-2">
              <span className="bg-[#f5ecdd] px-2 py-1 rounded">活动</span>
              <span>2025年11月15日</span>
            </div>
            <h3 className="text-xl font-semibold text-[#4b2f1c] mb-3">
              第五届生命关怀志愿者培训圆满结束
            </h3>
            <p className="text-[#7b6243] mb-4">
              为期三天的第五届生命关怀志愿者培训于上周末顺利落幕，共有45名新志愿者完成培训。
              本次培训邀请了多位专家学者进行专题讲座，内容涵盖沟通技巧、心理支持、哀伤辅导等。
            </p>
            <a href="#" className="text-[#c28a3a] hover:text-[#b37623] font-medium">
              阅读全文 →
            </a>
          </div>

          {/* 新闻卡片 2 */}
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-center text-sm text-[#9c7a4f] mb-3 gap-2">
              <span className="bg-[#f5ecdd] px-2 py-1 rounded">报道</span>
              <span>2025年11月8日</span>
            </div>
            <h3 className="text-xl font-semibold text-[#4b2f1c] mb-3">
              《生命时报》专访莲花生命关怀项目负责人
            </h3>
            <p className="text-[#7b6243] mb-4">
              近日，《生命时报》对莲花生命关怀项目负责人进行了专访，深入探讨了我国临终关怀
              事业的发展现状和未来方向。采访中，项目负责人分享了多年来的实践经验和服务心得。
            </p>
            <a href="#" className="text-[#c28a3a] hover:text-[#b37623] font-medium">
              阅读全文 →
            </a>
          </div>

          {/* 新闻卡片 3 */}
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-center text-sm text-[#9c7a4f] mb-3 gap-2">
              <span className="bg-[#f5ecdd] px-2 py-1 rounded">通知</span>
              <span>2025年11月1日</span>
            </div>
            <h3 className="text-xl font-semibold text-[#4b2f1c] mb-3">
              关于调整志愿者服务时间安排的通知
            </h3>
            <p className="text-[#7b6243] mb-4">
              为更好地满足服务对象需求并保障志愿者权益，自12月1日起，我们将对志愿者服务时间
              安排进行调整。请各位志愿者关注新的排班表并按时到岗服务。
            </p>
            <a href="#" className="text-[#c28a3a] hover:text-[#b37623] font-medium">
              阅读全文 →
            </a>
          </div>

          {/* 新闻卡片 4 */}
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-center text-sm text-[#9c7a4f] mb-3 gap-2">
              <span className="bg-[#f5ecdd] px-2 py-1 rounded">活动</span>
              <span>2025年10月25日</span>
            </div>
            <h3 className="text-xl font-semibold text-[#4b2f1c] mb-3">
              重阳节特别活动：温暖陪伴行动
            </h3>
            <p className="text-[#7b6243] mb-4">
              在重阳节来临之际，我们组织了"温暖陪伴行动"，为社区中的独居老人提供陪伴服务。
              活动得到了社区居民的热烈响应和一致好评，共有30名志愿者参与了此次活动。
            </p>
            <a href="#" className="text-[#c28a3a] hover:text-[#b37623] font-medium">
              阅读全文 →
            </a>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">媒体资源</h2>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-[#e0d4bf] rounded-lg p-4">
              <h3 className="font-semibold text-[#4b2f1c] mb-2">官方Logo</h3>
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-32 mb-3 flex items-center justify-center text-gray-500">
                Logo展示区域
              </div>
              <a href="#" className="text-sm text-[#c28a3a] hover:text-[#b37623]">
                下载高清版本
              </a>
            </div>
            <div className="border border-[#e0d4bf] rounded-lg p-4">
              <h3 className="font-semibold text-[#4b2f1c] mb-2">宣传海报</h3>
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-32 mb-3 flex items-center justify-center text-gray-500">
                海报展示区域
              </div>
              <a href="#" className="text-sm text-[#c28a3a] hover:text-[#b37623]">
                下载宣传材料
              </a>
            </div>
            <div className="border border-[#e0d4bf] rounded-lg p-4">
              <h3 className="font-semibold text-[#4b2f1c] mb-2">媒体报道</h3>
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-32 mb-3 flex items-center justify-center text-gray-500">
                媒体报道展示区域
              </div>
              <a href="#" className="text-sm text-[#c28a3a] hover:text-[#b37623]">
                查看更多报道
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
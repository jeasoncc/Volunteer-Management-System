import { SEO } from '../components/SEO';
import { useNotification } from '../components/NotificationManager';

export function ContactPage() {
  const { showNotification } = useNotification();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification('您的留言已成功提交，我们会尽快回复您。', 'success');
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <SEO 
        title="联系我们 - 莲花生命关怀志愿者官网"
        description="联系莲花生命关怀志愿者团队。获取我们的联系方式、办公地址和在线留言方式。如果您有任何问题、建议或合作意向，欢迎与我们联系。"
        keywords="莲花生命关怀, 联系我们, 联系方式, 办公地址, 在线留言, 志愿者团队"
      />
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-[#4b2f1c] mb-6">联系我们</h1>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <p className="text-[#7b6243] mb-4">
            感谢您对莲花生命关怀志愿者团队的关注。如果您有任何问题、建议或合作意向，
            欢迎通过以下方式与我们联系。
          </p>
          <p className="text-[#7b6243]">
            我们将尽快回复您的来信，并竭诚为您提供帮助。
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">联系方式</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-4">电子邮箱</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[#9c7a4f]">一般咨询</p>
                <p className="text-[#7b6243] font-medium break-words">info@lotuscare.org</p>
              </div>
              <div>
                <p className="text-sm text-[#9c7a4f]">志愿者申请</p>
                <p className="text-[#7b6243] font-medium break-words">volunteer@lotuscare.org</p>
              </div>
              <div>
                <p className="text-sm text-[#9c7a4f]">合作洽谈</p>
                <p className="text-[#7b6243] font-medium break-words">partnership@lotuscare.org</p>
              </div>
            </div>
          </div>
          <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-4">电话/微信</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[#9c7a4f]">工作时间</p>
                <p className="text-[#7b6243] font-medium">09:00-17:00 (周一至周五)</p>
              </div>
              <div>
                <p className="text-sm text-[#9c7a4f]">联系电话</p>
                <p className="text-[#7b6243] font-medium">400-XXX-XXXX</p>
              </div>
              <div>
                <p className="text-sm text-[#9c7a4f]">微信公众号</p>
                <p className="text-[#7b6243] font-medium">莲花生命关怀</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">办公地址</h2>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3">实地访问</h3>
              <p className="text-[#7b6243] mb-2">地址：XX省XX市XX区XX路XX号XX大厦X层</p>
              <p className="text-[#7b6243] mb-4">邮编：XXXXXX</p>
              <p className="text-sm text-[#9c7a4f]">
                温馨提示：如需实地访问，请提前预约，以便我们为您提供更好的服务。
              </p>
            </div>
            <div className="md:w-1/2">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center text-gray-500">
                地图位置展示区域
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">在线留言</h2>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#4b2f1c] mb-1">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 border border-[#d9c7a9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c28a3a]"
                  placeholder="请输入您的姓名"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#4b2f1c] mb-1">
                  邮箱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-[#d9c7a9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c28a3a]"
                  placeholder="请输入您的邮箱"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-[#4b2f1c] mb-1">
                主题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                className="w-full px-3 py-2 border border-[#d9c7a9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c28a3a]"
                placeholder="请输入留言主题"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[#4b2f1c] mb-1">
                留言内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                rows={5}
                className="w-full px-3 py-2 border border-[#d9c7a9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c28a3a]"
                placeholder="请输入您的留言内容"
                required
              ></textarea>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="privacy"
                className="mr-2"
                required
              />
              <label htmlFor="privacy" className="text-sm text-[#7b6243]">
                我已阅读并同意隐私政策
              </label>
            </div>
            <div>
              <button
                type="submit"
                className="px-6 py-2 bg-[#c28a3a] text-white rounded-md hover:bg-[#b37623] focus:outline-none focus:ring-2 focus:ring-[#c28a3a]"
              >
                提交留言
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
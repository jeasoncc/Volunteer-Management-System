import { SEO } from '../components/SEO';

export function DonatePage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <SEO 
        title="捐赠支持 - 莲花生命关怀志愿者官网"
        description="支持莲花生命关怀公益事业。了解如何通过资金捐赠、物资捐赠或志愿服务等方式支持我们的工作，共同为临终关怀事业贡献力量。"
        keywords="莲花生命关怀, 捐赠支持, 公益捐赠, 资金捐赠, 物资捐赠, 志愿服务"
      />
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-[#4b2f1c] mb-6">捐赠支持</h1>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <p className="text-[#7b6243] mb-4">
            莲花生命关怀是一个纯公益项目，所有服务均免费提供。
            我们的工作离不开社会各界的支持和帮助。
          </p>
          <p className="text-[#7b6243]">
            您的每一份捐赠都将用于支持我们的志愿服务工作，
            帮助更多需要关怀的生命和家庭。
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">捐赠方式</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#c28a3a]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              在线捐赠
            </h3>
            <p className="text-[#7b6243] mb-4">
              通过我们的官方捐赠平台进行在线捐款，方便快捷，实时到账。
            </p>
            <button className="px-4 py-2 bg-[#c28a3a] text-white rounded-md hover:bg-[#b37623] focus:outline-none focus:ring-2 focus:ring-[#c28a3a]">
              立即捐赠
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#c28a3a]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              银行转账
            </h3>
            <p className="text-[#7b6243] mb-2">
              开户银行：XX银行 XX支行
            </p>
            <p className="text-[#7b6243] mb-2">
              账户名称：莲花生命关怀志愿者团队
            </p>
            <p className="text-[#7b6243] mb-4">
              银行账号：XXXXXXXXXXXX
            </p>
            <p className="text-sm text-[#9c7a4f]">
              转账时请备注"捐赠"及您的联系方式，以便我们及时与您联系确认。
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#c28a3a]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              物资捐赠
            </h3>
            <p className="text-[#7b6243] mb-4">
              捐赠物资可以帮助我们更好地服务对象。
              当前急需物资清单请联系我们获取。
            </p>
            <a 
              href="/contact" 
              className="inline-block px-4 py-2 border border-[#c28a3a] text-[#c28a3a] rounded-md hover:bg-[#f5ecdd] focus:outline-none focus:ring-2 focus:ring-[#c28a3a]"
            >
              联系我们
            </a>
          </div>

          <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#c28a3a]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              志愿服务
            </h3>
            <p className="text-[#7b6243] mb-4">
              除了资金和物资捐赠，您还可以通过志愿服务的方式支持我们。
              您的时间和技能同样宝贵。
            </p>
            <a 
              href="/join" 
              className="inline-block px-4 py-2 border border-[#c28a3a] text-[#c28a3a] rounded-md hover:bg-[#f5ecdd] focus:outline-none focus:ring-2 focus:ring-[#c28a3a]"
            >
              了解详情
            </a>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">捐赠用途</h2>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3">直接服务</h3>
              <ul className="list-disc pl-5 text-[#7b6243] space-y-2">
                <li>志愿者培训和督导</li>
                <li>服务对象交通补贴</li>
                <li>服务所需物资采购</li>
                <li>服务场地租赁费用</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#4b2f1c] mb-3">运营管理</h3>
              <ul className="list-disc pl-5 text-[#7b6243] space-y-2">
                <li>项目宣传和推广</li>
                <li>办公场地和设备</li>
                <li>项目管理和行政费用</li>
                <li>志愿者保险和福利</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">感谢信</h2>
        <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-xl p-6">
          <p className="text-[#7b6243] mb-4">
            亲爱的捐赠者：
          </p>
          <p className="text-[#7b6243] mb-4">
            感谢您对莲花生命关怀项目的信任和支持。
            您的每一份捐赠都将成为照亮他人生命之路的明灯，
            都将为更多家庭带去温暖和希望。
          </p>
          <p className="text-[#7b6243] mb-4">
            我们承诺将每一分钱都用在最需要的地方，
            并定期公布捐赠使用情况，接受社会监督。
          </p>
          <p className="text-[#7b6243]">
            再次感谢您的慷慨相助！
          </p>
          <p className="text-[#7b6243] mt-4">
            莲花生命关怀志愿者团队 敬上
          </p>
        </div>
      </section>
    </div>
  );
}
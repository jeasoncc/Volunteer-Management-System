import { SEO } from '../components/SEO';

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <SEO 
        title="莲花生命关怀志愿者官网"
        description="莲花生命关怀志愿者团队，面向临终关怀、重症陪护、家属支持等场景，以温柔、稳定、可信赖的陪伴，守护生命最后一段路程中的安宁与尊严。"
        keywords="莲花生命关怀, 志愿者, 临终关怀, 生命陪伴, 重症陪护, 家属支持"
      />
      <section className="mb-16 flex flex-col items-start gap-8 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="mb-3 text-xs font-medium tracking-[0.2em] text-[#b18a54]">
            LOTUS LIFE CARE VOLUNTEERS
          </p>
          <h1 className="mb-4 text-3xl font-semibold leading-relaxed text-[#402314] sm:text-4xl">
            在生命的光影之间，
            <br />
            陪伴每一份不易与无常。
          </h1>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-[#7b6243]">
            莲花生命关怀志愿者团队，面向临终关怀、重症陪护、家属支持等场景，
            以温柔、稳定、可信赖的陪伴，守护生命最后一段路程中的安宁与尊严。
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <a
              href="/join"
              className="rounded-full bg-[#c28a3a] px-5 py-2 font-medium text-white shadow-sm hover:bg-[#b37623]"
            >
              我要成为志愿者
            </a>
            <a
              href="/about"
              className="rounded-full border border-[#d9c7a9] px-5 py-2 text-[#6b4a2b] hover:bg-[#f1e4cf]"
            >
              了解莲花生命关怀
            </a>
          </div>
        </div>
        <div className="mt-8 w-full flex-1 sm:mt-0">
          <div className="relative overflow-hidden rounded-2xl border border-[#e0d4bf] bg-[#fdf8ee] p-6 shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#f4e3c2,_transparent_55%)]" />
            <div className="relative space-y-3 text-sm text-[#735639]">
              <p className="font-medium">你可以在这里找到：</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>关于志愿服务内容与原则的说明</li>
                <li>加入莲花生命关怀的流程与准备</li>
                <li>面向家属与照护者的支持信息</li>
              </ul>
              <p className="pt-2 text-xs text-[#9c7a4f]">
                * 本官网目前仅提供项目介绍与报名指引，所有信息以实际安排为准。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="mb-14">
        <h2 className="mb-3 text-base font-semibold text-[#4b2f1c]">关于莲花生命关怀</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-[#7b6243]">
          莲花生命关怀源自寺院长期的助念与关怀实践，我们希望在尊重宗教传统与专业照护的基础上，
          为临终者与家属提供更温柔、可持续的陪伴支持。我们相信：善意的陪伴、本真的聆听与安稳的陪护，
          能够在生命最不容易的时刻，带来一份安然与被理解的力量。
        </p>
      </section>

      <section id="services" className="mb-14">
        <h2 className="mb-3 text-base font-semibold text-[#4b2f1c]">志愿服务方向</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#e0d4bf] bg-[#fdf8ee] p-4 text-sm text-[#725437]">
            <div className="mb-2 text-sm font-semibold">病房陪伴</div>
            <p className="text-xs leading-relaxed">
              在医院或机构中，为病友提供安静陪伴、倾听与简单支持，尊重个人信仰与选择。
            </p>
          </div>
          <div className="rounded-xl border border-[#e0d4bf] bg-[#fdf8ee] p-4 text-sm text-[#725437]">
            <div className="mb-2 text-sm font-semibold">家属支持</div>
            <p className="text-xs leading-relaxed">
              陪伴家属面对病情变化与情绪压力，提供有限度的陪谈与信息指引，协助找到更多支持资源。
            </p>
          </div>
          <div className="rounded-xl border border-[#e0d4bf] bg-[#fdf8ee] p-4 text-sm text-[#725437]">
            <div className="mb-2 text-sm font-semibold">告别仪式协助</div>
            <p className="text-xs leading-relaxed">
              在合适的前提下，协助家属完成告别与追思环节，保持庄重与温柔，尊重文化与传统。
            </p>
          </div>
        </div>
      </section>

      <section id="join" className="mb-14">
        <h2 className="mb-3 text-base font-semibold text-[#4b2f1c]">如何加入我们</h2>
        <p className="mb-3 text-sm leading-relaxed text-[#7b6243]">
          莲花生命关怀志愿者主要面向心理稳定、有一定陪伴经验或愿意接受系统培训的成人开放。
          为了保障服务质量与安全，我们会在正式参与前安排基础培训与简要面谈。
        </p>
        <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-[#7b6243]">
          <li>填写意向报名表（线上表单或线下纸质）</li>
          <li>参加说明会或基础培训</li>
          <li>完成初步面谈与分组</li>
          <li>在资深志愿者陪同下参与服务</li>
        </ol>
        <p className="text-xs text-[#9c7a4f]">
          目前线上报名表正在筹备中，如有意向可先通过下方联系方式与我们联络。
        </p>
      </section>

      <section id="contact" className="border-t border-[#e0d4bf] pt-6 text-sm text-[#7b6243]">
        <h2 className="mb-3 text-base font-semibold text-[#4b2f1c]">联系方式</h2>
        <p className="mb-1">邮箱：example@lotuscare.org（示例，可根据实际修改）</p>
        <p className="mb-1">微信/电话：请在实际运营时补充公开联系方式</p>
        <p className="text-xs text-[#9c7a4f]">
          为保护隐私，目前不公开具体服务地点与个案信息。更多详情可在实际运营时逐步完善。
        </p>
      </section>
    </div>
  );
}
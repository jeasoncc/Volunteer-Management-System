export function Footer() {
  return (
    <footer className="border-t border-[#e0d4bf] bg-[#f5ecdd]/80 py-6 text-center text-sm text-[#9c7a4f]">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <div className="font-semibold text-[#6b4a2b]">莲花生命关怀志愿者</div>
            <div className="text-xs mt-1">Lotus Life Care Volunteers</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div>
              <div className="font-medium text-[#6b4a2b] mb-2">关于我们</div>
              <ul className="text-xs space-y-1">
                <li><a href="/about" className="hover:text-[#a0672a]">组织介绍</a></li>
                <li><a href="/about#mission" className="hover:text-[#a0672a]">使命愿景</a></li>
                <li><a href="/about#team" className="hover:text-[#a0672a]">团队成员</a></li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-[#6b4a2b] mb-2">志愿服务</div>
              <ul className="text-xs space-y-1">
                <li><a href="/services#hospital" className="hover:text-[#a0672a]">病房陪伴</a></li>
                <li><a href="/services#family" className="hover:text-[#a0672a]">家属支持</a></li>
                <li><a href="/services#ceremony" className="hover:text-[#a0672a]">告别仪式</a></li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-[#6b4a2b] mb-2">加入我们</div>
              <ul className="text-xs space-y-1">
                <li><a href="/join#process" className="hover:text-[#a0672a]">报名流程</a></li>
                <li><a href="/join#training" className="hover:text-[#a0672a]">培训计划</a></li>
                <li><a href="/faq" className="hover:text-[#a0672a]">常见问题</a></li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-[#6b4a2b] mb-2">支持我们</div>
              <ul className="text-xs space-y-1">
                <li><a href="/stories" className="hover:text-[#a0672a]">项目故事</a></li>
                <li><a href="/donate" className="hover:text-[#a0672a]">捐赠支持</a></li>
                <li><a href="/volunteer" className="hover:text-[#a0672a]">志愿服务</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="pt-4 mt-4 border-t border-[#e0d4bf] text-xs">
          <div className="mb-2">
            联系我们：example@lotuscare.org | 微信/电话：请在实际运营时补充
          </div>
          <div>
            © {new Date().getFullYear()} 莲花生命关怀志愿者. 保留所有权利.
          </div>
        </div>
      </div>
    </footer>
  );
}
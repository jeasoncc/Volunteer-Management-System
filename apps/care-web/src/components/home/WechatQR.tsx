import { MessageCircle } from 'lucide-react';

export function WechatQR() {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#07c160]/10 rounded-full mb-4">
            <MessageCircle className="w-5 h-5 text-[#07c160]" />
            <span className="text-[#07c160] font-medium">关注我们</span>
          </div>
          
          <div className="bg-[#faf8f5] rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto bg-white rounded-xl flex items-center justify-center mb-2 shadow-sm">
                  <span className="text-[#a8a29e] text-xs">公众号二维码</span>
                </div>
                <p className="text-sm text-[#2d2a26] font-medium">微信公众号</p>
                <p className="text-xs text-[#6b6560]">获取最新资讯</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 mx-auto bg-white rounded-xl flex items-center justify-center mb-2 shadow-sm">
                  <span className="text-[#a8a29e] text-xs">服务号二维码</span>
                </div>
                <p className="text-sm text-[#2d2a26] font-medium">微信服务号</p>
                <p className="text-xs text-[#6b6560]">在线咨询预约</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

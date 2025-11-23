import { SEO } from '../components/SEO';
import { useNotification } from '../components/NotificationManager';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Breadcrumb } from '../components/Breadcrumb';

export function TestPage() {
  const { showNotification } = useNotification();
  
  const handleShowNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: '这是一个成功通知示例',
      error: '这是一个错误通知示例',
      warning: '这是一个警告通知示例',
      info: '这是一个信息通知示例'
    };
    
    showNotification(messages[type], type);
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <SEO 
        title="测试页面 - 莲花生命关怀志愿者官网"
        description="测试页面，用于验证网站功能和组件"
        keywords="莲花生命关怀, 测试页面, 功能验证"
      />
      
      <Breadcrumb items={[{ label: '测试页面' }]} />
      
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-[#4b2f1c] mb-6">测试页面</h1>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <p className="text-[#7b6243]">
            这是一个测试页面，用于验证网站的各种功能和组件是否正常工作。
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">通知组件测试</h2>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleShowNotification('success')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              显示成功通知
            </button>
            <button
              onClick={() => handleShowNotification('error')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              显示错误通知
            </button>
            <button
              onClick={() => handleShowNotification('warning')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              显示警告通知
            </button>
            <button
              onClick={() => handleShowNotification('info')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              显示信息通知
            </button>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">加载指示器测试</h2>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col items-center">
              <LoadingSpinner size="sm" />
              <span className="mt-2 text-sm text-[#7b6243]">小尺寸</span>
            </div>
            <div className="flex flex-col items-center">
              <LoadingSpinner size="md" />
              <span className="mt-2 text-sm text-[#7b6243]">中等尺寸</span>
            </div>
            <div className="flex flex-col items-center">
              <LoadingSpinner size="lg" />
              <span className="mt-2 text-sm text-[#7b6243]">大尺寸</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-[#4b2f1c] mb-6">响应式测试</h2>
        <div className="bg-white rounded-xl border border-[#e0d4bf] p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-lg p-4 text-center">
              <div className="text-[#c28a3a] font-semibold mb-2">列1</div>
              <p className="text-xs text-[#7b6243]">响应式网格</p>
            </div>
            <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-lg p-4 text-center">
              <div className="text-[#c28a3a] font-semibold mb-2">列2</div>
              <p className="text-xs text-[#7b6243]">响应式网格</p>
            </div>
            <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-lg p-4 text-center">
              <div className="text-[#c28a3a] font-semibold mb-2">列3</div>
              <p className="text-xs text-[#7b6243]">响应式网格</p>
            </div>
            <div className="bg-[#fdf8ee] border border-[#e0d4bf] rounded-lg p-4 text-center">
              <div className="text-[#c28a3a] font-semibold mb-2">列4</div>
              <p className="text-xs text-[#7b6243]">响应式网格</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
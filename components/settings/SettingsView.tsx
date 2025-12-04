import React, { useState } from 'react';
import Avatar from '../common/Avatar';
import { 
  User, CreditCard, Bell, Shield, Download, Trash2, Home, BookOpen, Crown, 
  Settings, Palette, Info, ChevronRight, Smartphone, Mail, Lock, LogOut,
  Moon, Sun, Check, Monitor, Globe, Clock, Volume2, CheckSquare
} from 'lucide-react';

const SettingsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState('个人资料');
  const [themeColor, setThemeColor] = useState('sage');

  const menuItems = [
    { id: '个人资料', icon: User },
    { id: '账号与安全', icon: Shield },
    { id: '高级会员', icon: Crown },
    { id: '提醒与通知', icon: Bell },
    { id: '通用设置', icon: Settings },
    { id: '主题外观', icon: Palette },
    { id: '关于我们', icon: Info },
  ];

  const renderProfile = () => (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <h2 className="text-xl font-bold text-gray-800 mb-6">个人资料</h2>
        
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center gap-6">
            <div className="relative group cursor-pointer">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-sage-50 flex items-center justify-center bg-sage-100">
                    <Avatar size="lg" />
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
                    更换
                </div>
            </div>
            <div className="flex-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">昵称</label>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-medium text-gray-800">1372668345</span>
                    <button className="text-xs text-sage-600 hover:text-sage-700 font-medium ml-2 flex items-center gap-1">
                        编辑 <Settings size={12} />
                    </button>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                    <Smartphone className="text-gray-400" size={20} />
                    <div>
                        <div className="text-sm font-medium text-gray-700">手机号</div>
                        <div className="text-xs text-gray-400">未绑定</div>
                    </div>
                </div>
                <button className="text-xs px-3 py-1.5 bg-sage-50 text-sage-600 rounded-full hover:bg-sage-100 transition-colors">去绑定</button>
            </div>
            <div className="p-4 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                    <Mail className="text-gray-400" size={20} />
                    <div>
                        <div className="text-sm font-medium text-gray-700">邮箱</div>
                        <div className="text-xs text-gray-400">1372668345@qq.com</div>
                    </div>
                </div>
                <span className="text-xs text-gray-400">已验证</span>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                    <Lock className="text-gray-400" size={20} />
                    <div>
                        <div className="text-sm font-medium text-gray-700">微信登录</div>
                        <div className="text-xs text-gray-400">chainfind</div>
                    </div>
                </div>
                <span className="text-xs text-sage-600">已绑定</span>
            </div>
        </div>
        
        <div className="mt-8 flex justify-between items-center">
            <button className="text-sage-600 hover:text-sage-700 text-sm flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-sage-50 transition-colors">
                 <LogOut size={16} /> 退出登录
            </button>
            <button className="text-gray-400 hover:text-red-500 text-sm px-4 py-2 transition-colors">
                注销账号
            </button>
        </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <h2 className="text-xl font-bold text-gray-800 mb-6">账号与安全</h2>
        
        <div className="space-y-6">
            <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">登录安全</h3>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-4 flex items-center justify-between border-b border-gray-50">
                        <div>
                            <div className="text-sm font-medium text-gray-700">修改密码</div>
                            <div className="text-xs text-gray-400 mt-0.5">定期修改密码可以保护账号安全</div>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-700">双重验证 (2FA)</div>
                            <div className="text-xs text-gray-400 mt-0.5">在登录新设备时需要验证码</div>
                        </div>
                        <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-pointer transition-colors hover:bg-gray-300">
                            <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">设备管理</h3>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-4 flex items-center justify-between border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-sage-50 text-sage-600 rounded-full flex items-center justify-center">
                                <Monitor size={16} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-700">Windows PC (当前设备)</div>
                                <div className="text-xs text-gray-400">Chrome • 北京 • 刚刚</div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center">
                                <Smartphone size={16} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-700">iPhone 14 Pro</div>
                                <div className="text-xs text-gray-400">App v6.1 • 上海 • 2天前</div>
                            </div>
                        </div>
                        <button className="text-xs text-red-400 hover:text-red-500">移除</button>
                    </div>
                </div>
            </section>
        </div>
    </div>
  );

  const renderPremium = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
         <div className="bg-gradient-to-r from-sage-50 to-white p-8 rounded-2xl border border-sage-100 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Crown size={120} className="text-sage-500 rotate-12" />
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden">
                            <Avatar size="lg" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                1372668345，你好
                            </h2>
                            <p className="text-sm text-sage-600 font-medium mt-1">你的会员截止: 2031-01-26</p>
                        </div>
                     </div>
                     <button className="text-gray-400 hover:text-gray-600 text-xs underline">支付历史/退款</button>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-8">
                    {[
                        { title: '单月会员', price: '¥14', deal: '¥11.8', sub: '单月高级会员服务' },
                        { title: '季度会员', price: '¥42', deal: '¥34.8', sub: '季度高级会员服务' },
                        { title: '半年会员', price: '¥84', deal: '¥68', sub: '半年高级会员服务' },
                        { title: '一年会员', price: '¥168', deal: '¥118', sub: '一年高级会员服务' },
                        { title: '三年会员', price: '¥448', deal: '¥298', sub: '三年高级会员服务' }
                    ].slice(0, 4).map((plan) => (
                        <div key={plan.title} className="bg-white/80 backdrop-blur border border-white/50 rounded-xl p-4 text-center shadow-sm cursor-pointer hover:scale-105 transition-transform hover:shadow-md hover:border-sage-200">
                            <h3 className="text-gray-600 font-medium mb-2">{plan.title}</h3>
                            <div className="text-xs text-gray-400 line-through mb-1">{plan.price}</div>
                            <div className="text-2xl font-bold text-sage-600 mb-2">{plan.deal}</div>
                            <div className="text-[10px] text-gray-500">{plan.sub}</div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 flex justify-center">
                    <button className="px-12 py-3 bg-sage-500 hover:bg-sage-600 text-white rounded-full font-medium shadow-lg shadow-sage-200 transition-all active:scale-95 text-lg">
                        立即续费
                    </button>
                </div>
            </div>
         </div>

         <div className="mt-12 border-t border-gray-100 pt-8">
             <div className="flex items-center justify-center gap-4 text-gray-400 mb-8">
                 <div className="h-px bg-gray-200 flex-1"></div>
                 <h3 className="text-gray-500 font-medium">会员特权</h3>
                 <div className="h-px bg-gray-200 flex-1"></div>
             </div>
             <div className="grid grid-cols-2 gap-6">
                 <div className="flex gap-4 p-5 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors">
                     <div className="w-12 h-12 rounded-2xl bg-sage-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                         <BookOpen size={24} />
                     </div>
                     <div>
                         <h4 className="font-bold text-gray-800 text-base">日历月视图</h4>
                         <p className="text-sm text-gray-500 mt-2 leading-relaxed">很直观地按月管理任务规划</p>
                     </div>
                 </div>
                 <div className="flex gap-4 p-5 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors">
                     <div className="w-12 h-12 rounded-2xl bg-sage-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                         <Clock size={24} />
                     </div>
                     <div>
                         <h4 className="font-bold text-gray-800 text-base">三日时间轴视图</h4>
                         <p className="text-sm text-gray-500 mt-2 leading-relaxed">精确到5分钟粒度的时间轴视图，并支持丰富的手势操作来管理任务</p>
                     </div>
                 </div>
             </div>
         </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <h2 className="text-xl font-bold text-gray-800 mb-6">提醒与通知</h2>
        
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <Clock className="text-gray-400" size={20} />
                        <div>
                            <div className="text-sm font-medium text-gray-700">每日提醒时间</div>
                            <div className="text-xs text-gray-400">每天早上发送今日待办摘要</div>
                        </div>
                    </div>
                    <input type="time" defaultValue="09:00" className="bg-gray-50 border-gray-200 rounded px-2 py-1 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-sage-400" />
                </div>
                <div className="p-4 flex items-center justify-between border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <Volume2 className="text-gray-400" size={20} />
                        <div>
                            <div className="text-sm font-medium text-gray-700">提醒音效</div>
                            <div className="text-xs text-gray-400">任务到期时的提示音</div>
                        </div>
                    </div>
                    <select className="bg-gray-50 border-gray-200 rounded px-2 py-1 text-sm text-gray-600 focus:outline-none">
                        <option>默认 (叮咚)</option>
                        <option>清脆</option>
                        <option>风铃</option>
                        <option>无</option>
                    </select>
                </div>
                 <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Moon className="text-gray-400" size={20} />
                        <div>
                            <div className="text-sm font-medium text-gray-700">勿扰模式</div>
                            <div className="text-xs text-gray-400">在 22:00 - 07:00 期间不接收提醒</div>
                        </div>
                    </div>
                     <div className="w-10 h-6 bg-sage-500 rounded-full relative cursor-pointer transition-colors">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderGeneral = () => (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <h2 className="text-xl font-bold text-gray-800 mb-6">通用设置</h2>
        
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
             <div className="p-4 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <Globe className="text-gray-400" size={20} />
                    <span className="text-sm font-medium text-gray-700">语言 (Language)</span>
                </div>
                <select className="bg-gray-50 border-gray-200 rounded px-2 py-1 text-sm text-gray-600 focus:outline-none">
                    <option>简体中文</option>
                    <option>English</option>
                    <option>日本語</option>
                </select>
            </div>
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <Calendar className="text-gray-400" size={20} />
                    <span className="text-sm font-medium text-gray-700">每周开始于</span>
                </div>
                <select className="bg-gray-50 border-gray-200 rounded px-2 py-1 text-sm text-gray-600 focus:outline-none">
                    <option>周一</option>
                    <option>周日</option>
                    <option>周六</option>
                </select>
            </div>
            <div className="p-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <BookOpen className="text-gray-400" size={20} />
                    <div>
                        <div className="text-sm font-medium text-gray-700">智能日期识别</div>
                        <div className="text-xs text-gray-400">输入 "明天下午开会" 自动设置时间</div>
                    </div>
                </div>
                 <div className="w-10 h-6 bg-sage-500 rounded-full relative cursor-pointer transition-colors">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderTheme = () => (
     <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <h2 className="text-xl font-bold text-gray-800 mb-6">主题外观</h2>

        <section className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">纯色主题</h3>
            <div className="grid grid-cols-5 gap-4">
                {[
                    { id: 'sage', color: 'bg-sage-500' },
                    { id: 'blue', color: 'bg-blue-500' },
                    { id: 'teal', color: 'bg-teal-600' },
                    { id: 'purple', color: 'bg-purple-500' },
                    { id: 'rose', color: 'bg-rose-500' },
                    { id: 'red', color: 'bg-red-500' },
                    { id: 'indigo', color: 'bg-indigo-600' },
                    { id: 'gray', color: 'bg-gray-800' },
                    { id: 'slate', color: 'bg-slate-500' },
                    { id: 'stone', color: 'bg-stone-400' },
                ].map(t => (
                    <button 
                        key={t.id}
                        onClick={() => setThemeColor(t.id)}
                        className={`aspect-square rounded-2xl ${t.color} flex items-center justify-center transition-transform hover:scale-105 shadow-sm relative`}
                    >
                        {themeColor === t.id && (
                            <div className="bg-white/20 p-1 rounded-full">
                                <Check size={16} className="text-white" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </section>

        <section>
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">基本信息</h3>
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">悬浮球大小</span>
                    <div className="flex items-center gap-3 w-48">
                         <input type="range" className="w-full accent-sage-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                         <span className="text-xs text-gray-500 w-6">3.8</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 flex items-center gap-1">设置字体 <Info size={12} className="text-gray-400"/></span>
                    <select className="bg-white border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-600 focus:outline-none w-48">
                        <option>微软雅黑</option>
                        <option>PingFang SC</option>
                        <option>Arial</option>
                    </select>
                </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">字体大小</span>
                    <div className="flex items-center gap-3 w-48">
                         <input type="range" className="w-full accent-sage-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                         <span className="text-xs text-gray-500 w-6">13</span>
                    </div>
                </div>
             </div>
        </section>
     </div>
  );

  const renderAbout = () => (
     <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
         <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-6">
             <div className="w-20 h-20 bg-sage-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-sage-200">
                 <CheckSquare size={40} className="text-white" />
             </div>
             <h2 className="text-2xl font-bold text-gray-800">TickTick Clone</h2>
             <p className="text-gray-400 text-sm mt-1">Version 5.9.29 (2024)</p>
         </div>

         <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
             {[
                 '闪点教程',
                 '重复任务',
                 '多人共享',
                 '闪点轻笔记',
                 '任务颜色',
                 '常见问题'
             ].map((item, i) => (
                 <div key={item} className="p-4 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer last:border-0">
                     <div className="flex items-center gap-3">
                         {i === 0 ? <Crown size={18} className="text-sage-500"/> : i === 1 ? <Clock size={18} className="text-gray-400"/> : i === 2 ? <User size={18} className="text-gray-400"/> : <Settings size={18} className="text-gray-400"/> }
                         <span className="text-sm font-medium text-gray-700">{item}</span>
                     </div>
                     <ChevronRight size={16} className="text-gray-300" />
                 </div>
             ))}
         </div>

         <div className="mt-8 text-center space-y-2">
             <div className="flex items-center justify-center gap-6 text-sm text-sage-600 font-medium">
                 <button className="flex items-center gap-1 hover:underline"><Home size={14}/> 前往官网</button>
                 <button className="flex items-center gap-1 hover:underline"><BookOpen size={14}/> 操作引导</button>
             </div>
             <p className="text-xs text-gray-400 mt-4">Copyright © 2024 TickTick Team. All rights reserved.</p>
         </div>
     </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case '个人资料': return renderProfile();
      case '账号与安全': return renderSecurity();
      case '高级会员': return renderPremium();
      case '提醒与通知': return renderNotifications();
      case '通用设置': return renderGeneral();
      case '主题外观': return renderTheme();
      case '关于我们': return renderAbout();
      default: return renderProfile();
    }
  };

  return (
    <div className="h-full w-full bg-white flex flex-col">
        {/* Header (Secondary) */}
        <div className="hidden md:flex h-14 border-b border-gray-100 bg-gray-50 items-center px-8 flex-shrink-0">
             <div className="flex gap-8">
                 {['我的信息', '基本信息', '模块设置', '快捷键', '主题设置', '桌面小组件', '关注我们'].map((item) => (
                     <button key={item} className="text-sm text-gray-500 hover:text-sage-600 transition-colors font-medium relative group">
                         {item}
                         <span className="absolute bottom-[-17px] left-0 w-full h-0.5 bg-sage-500 scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                     </button>
                 ))}
             </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="hidden md:block w-64 bg-gray-50/50 border-r border-gray-100 flex-shrink-0 p-4 overflow-y-auto">
                 <div className="space-y-1">
                    {menuItems.map((item) => (
                        <button 
                            key={item.id} 
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                                activeSection === item.id 
                                ? 'bg-white text-sage-700 shadow-sm border border-gray-100' 
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                        >
                            <item.icon size={18} className={activeSection === item.id ? 'text-sage-500' : 'text-gray-400'} />
                            {item.id}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
                 {renderContent()}
            </div>
        </div>
    </div>
  );
};

// Simple Calendar icon component for re-use if needed, though Lucide has one.
const Calendar = ({ size, className }: { size?: number, className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

export default SettingsView;
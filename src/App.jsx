import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Settings, Image as ImageIcon, Send, 
  CalendarHeart, Cloud, Quote, History, RefreshCw, 
  Save, Mail, CheckCircle, Upload, Download, Code,
  Layers, Sliders, User, Lock, Clock, Type, Palette
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('preview');
  const cardRef = useRef(null);
  const [toastMsg, setToastMsg] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // 基础配置状态
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('loveCardConfig');
    return saved ? JSON.parse(saved) : {
      eventTitle: '养宝宝',
      anniversaryDate: '2026-01-18',
      roleAName: '小明',
      roleBName: '小红',
      city: '北京',
      emailHost: 'smtp.qq.com',
      emailUser: '',
      emailPass: '',
      receiveEmail: '',
      pushTime: '08:00'
    };
  });

  // 卡片动态数据状态
  const [cardData, setCardData] = useState({
    style: 'split', 
    glassOpacity: 0.4, 
    glassBlur: 16,
    contentType: 'standard', 
    hitokoto: '我将在茫茫人海中寻访我唯一之灵魂伴侣。得之，我幸；不得，我命。',
    customHtml: '<div style="text-align:center;"><h2 style="color:#e11d48;font-size:1.5rem;font-weight:bold;">特别的爱</h2><p style="color:#4b5563;margin-top:10px;">给特别的你</p></div>',
    weather: '晴转多云 22°C ~ 28°C',
    days: 520, 
    background: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
    daysFont: 'system-ui',
    daysColor: '#e11d48', 
    daysShadow: true,      
    daysWeight: '900',     
  });

  const fontOptions = [
    { label: '系统默认', value: 'system-ui, sans-serif' },
    { label: '优雅衬线', value: 'Georgia, serif' },
    { label: '硬核黑体', value: '"Arial Black", sans-serif' },
    { label: '现代圆体', value: 'ui-rounded, "Hiragino Sans GB", sans-serif' },
    { label: '等宽复古', value: 'ui-monospace, monospace' },
    { label: '书写感', value: '"Apple Chancery", cursive' },
    { label: 'Impact', value: 'Impact, sans-serif' },
    { label: 'Times', value: '"Times New Roman", serif' },
  ];

  const [history] = useState([
    { date: '2024-03-14', img: 'https://images.unsplash.com/photo-1516589174184-c685266e48fc?q=80&w=400&auto=format&fit=crop', title: '相恋 55 天' },
  ]);

  // 计算天数
  useEffect(() => {
    const start = new Date(config.anniversaryDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setCardData(prev => ({ ...prev, days: diffDays }));
  }, [config.anniversaryDate]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveConfig = () => {
    localStorage.setItem('loveCardConfig', JSON.stringify(config));
    showToast('配置已保存！');
  };

  // 修复后的下载函数：精准定位卡片 DOM 并处理渲染兼容性
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        await new Promise((resolve) => {
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }
      
      // html2canvas 渲染配置优化
      const canvas = await window.html2canvas(cardRef.current, { 
        useCORS: true,       // 允许跨域图片
        scale: 2,            // 提高清晰度
        backgroundColor: null, // 背景透明
        logging: false,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        onclone: (clonedDoc) => {
            // 在克隆的 DOM 中强制修正一些样式以防万一
            const clonedCard = clonedDoc.querySelector('[data-card-root]');
            if (clonedCard) {
                clonedCard.style.transform = 'none';
                clonedCard.style.margin = '0';
            }
        }
      });
      
      const link = document.createElement('a');
      link.download = `恋爱卡片-${config.eventTitle}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('卡片已精准保存');
    } catch (err) {
      console.error(err);
      showToast('生成失败，请检查网络或图片权限');
    } finally {
      setIsDownloading(false);
    }
  };

  const fetchHitokoto = async () => {
    try {
      const res = await fetch('https://v1.hitokoto.cn/?c=i&c=k');
      const data = await res.json();
      setCardData(prev => ({ ...prev, hitokoto: data.hitokoto, contentType: 'standard' }));
    } catch (error) {
      showToast('获取一言失败');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardData(prev => ({ ...prev, background: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const refreshBackground = () => {
    const randomId = Math.floor(Math.random() * 1000);
    setCardData(prev => ({
      ...prev,
      background: `https://picsum.photos/seed/${randomId}/800/1200`
    }));
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row font-sans text-gray-800 relative">
      {toastMsg && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2 animate-in fade-in zoom-in duration-300">
          <CheckCircle size={18} className="text-green-400" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* 侧边栏 */}
      <aside className="w-full md:w-64 bg-white shadow-lg flex flex-col z-20 border-r border-gray-100">
        <div className="p-6 flex items-center justify-center space-x-2 border-b border-gray-100">
          <Heart className="text-rose-500 fill-rose-500" size={24} />
          <h1 className="text-lg font-bold tracking-tight">{config.eventTitle}</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavItem icon={<CalendarHeart />} label="卡片预览" active={activeTab === 'preview'} onClick={() => setActiveTab('preview')} />
          <NavItem icon={<Settings />} label="全局设置" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <NavItem icon={<History />} label="历史记录" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto relative bg-slate-50">
        {activeTab === 'preview' && (
          <div className="w-full h-full min-h-screen flex flex-col xl:flex-row items-start">
            
            {/* 左侧：卡片预览容器 */}
            <div className="flex-1 w-full h-full min-h-[700px] flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
              <div 
                className="absolute inset-0 z-0 transition-all duration-1000 scale-105"
                style={{ 
                  backgroundImage: `url(${cardData.background})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  filter: 'brightness(0.85)'
                }}
              />
              <div className="absolute inset-0 z-1 bg-black/10 backdrop-blur-[2px]"></div>

              {/* 卡片主体：增加 data-card-root 标记以便于下载时定位 */}
              <div 
                ref={cardRef} 
                data-card-root="true"
                className="z-10 w-full max-w-[380px] aspect-[1/1.3] rounded-[48px] shadow-2xl overflow-hidden flex flex-col relative transition-all duration-500 transform-gpu"
              >
                {cardData.style === 'glass' && (
                  <div className="w-full h-full flex flex-col items-center text-center p-8 relative">
                    <div className="absolute inset-0 z-0"
                      style={{ 
                        backgroundColor: `rgba(255, 255, 255, ${cardData.glassOpacity})`, 
                        backdropFilter: `blur(${cardData.glassBlur}px)`, 
                        WebkitBackdropFilter: `blur(${cardData.glassBlur}px)` 
                      }} 
                    />
                    
                    <div className="relative z-10 w-full h-full flex flex-col items-center">
                      {/* 天气部分调整为相对布局，避免导出位移 */}
                      <div className="flex justify-center items-center space-x-2 text-[10px] font-bold text-gray-600 mb-8 uppercase tracking-widest pt-2">
                          <Cloud size={14} className="text-blue-500" />
                          <span>{config.city} • {cardData.weather}</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center w-full">
                         <div className="flex items-center justify-center mb-4">
                            <Heart size={16} className="text-rose-500 fill-rose-500 mr-2" />
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">{config.eventTitle}</h2>
                          </div>
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">相爱第</p>
                          
                          <div className="text-7xl mb-6 transition-all duration-300"
                            style={{ 
                                fontFamily: cardData.daysFont,
                                color: cardData.daysColor,
                                fontWeight: cardData.daysWeight,
                                textShadow: cardData.daysShadow ? `0 4px 12px ${cardData.daysColor}40` : 'none',
                                letterSpacing: '-0.05em'
                            }}>
                            {cardData.days}
                          </div>

                          <div className="w-full px-4">
                             {cardData.contentType === 'standard' ? (
                                <p className="text-sm text-gray-700 italic leading-relaxed font-medium">"{cardData.hitokoto}"</p>
                              ) : (
                                <div className="w-full text-sm leading-relaxed text-gray-700" dangerouslySetInnerHTML={{ __html: cardData.customHtml }} />
                              )}
                          </div>
                      </div>
                      <div className="w-full pt-6 flex justify-between items-center text-[10px] text-gray-500 font-mono font-bold mt-4 opacity-60 uppercase">
                        <span>{new Date().toLocaleDateString()}</span>
                        <span>Sweet Love</span>
                      </div>
                    </div>
                  </div>
                )}

                {cardData.style === 'split' && (
                  <div className="w-full h-full flex flex-col bg-white">
                    <div className="relative h-[55%] w-full overflow-hidden">
                      <img crossOrigin="anonymous" src={cardData.background} className="w-full h-full object-cover" alt="Background" />
                      {/* 修复：将天气信息嵌入图片层内，但使用绝对定位确保对齐 */}
                      <div className="absolute top-6 right-6 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center space-x-2 shadow-sm border border-white/50 z-20">
                        <Cloud size={14} className="text-blue-400" />
                        <span className="text-[10px] font-bold text-gray-600 tracking-tight">{config.city} • {cardData.weather}</span>
                      </div>
                    </div>
                    <div className="flex-1 bg-gradient-to-b from-white to-rose-50/20 p-8 pt-6 flex flex-col items-center text-center">
                      <div className="flex items-center justify-center mb-4">
                        <Heart size={14} className="text-rose-500 fill-rose-500 mr-2 opacity-80" />
                        <h2 className="text-lg font-black text-slate-700 tracking-tight">{config.eventTitle}</h2>
                      </div>
                      <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">相爱第</p>
                      
                      <div className="flex items-baseline mb-4 transition-all duration-300">
                        <span className="text-6xl leading-none"
                            style={{ 
                                fontFamily: cardData.daysFont,
                                color: cardData.daysColor,
                                fontWeight: cardData.daysWeight,
                                textShadow: cardData.daysShadow ? `0 4px 10px ${cardData.daysColor}30` : 'none'
                            }}>
                          {cardData.days}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 ml-1.5 uppercase tracking-widest font-mono">Days</span>
                      </div>

                      <div className="flex-1 w-full flex items-center justify-center px-4">
                        {cardData.contentType === 'standard' ? (
                          <p className="text-sm text-gray-600 italic leading-relaxed font-medium">"{cardData.hitokoto}"</p>
                        ) : (
                          <div className="w-full text-sm leading-relaxed text-gray-700" dangerouslySetInnerHTML={{ __html: cardData.customHtml }} />
                        )}
                      </div>
                      <div className="w-full pt-4 flex justify-between items-center text-[9px] text-gray-400 font-bold border-t border-gray-100 mt-4 uppercase tracking-widest font-mono">
                        <span>{new Date().toLocaleDateString()}</span>
                        <span>Sweet Love</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 底部操作 */}
              <div className="z-10 flex space-x-4 mt-12">
                <button onClick={handleDownload} className="px-8 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold flex items-center space-x-2 hover:bg-gray-50 transition shadow-lg active:scale-95">
                  {isDownloading ? <RefreshCw className="animate-spin" size={16}/> : <Download size={16} />}
                  <span>保存卡片</span>
                </button>
                <button onClick={() => showToast('模拟发送成功！')} className="px-8 py-3 bg-rose-500 text-white rounded-full text-sm font-bold flex items-center space-x-2 hover:bg-rose-600 shadow-xl shadow-rose-200 transition active:scale-95">
                  <Send size={16} />
                  <span>立即发送</span>
                </button>
              </div>
            </div>

            {/* 右侧：属性控制面板 */}
            <div className="w-full xl:w-[480px] bg-white border-l border-gray-100 p-8 overflow-y-auto min-h-screen">
              <div className="max-w-md mx-auto space-y-8 pb-12">
                
                <section>
                  <h3 className="text-sm font-bold mb-4 flex items-center text-gray-700"><Layers size={16} className="mr-2 text-rose-500"/> 视觉模板</h3>
                  <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                    <button onClick={() => setCardData({...cardData, style: 'split'})} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${cardData.style === 'split' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>拼贴模式</button>
                    <button onClick={() => setCardData({...cardData, style: 'glass'})} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${cardData.style === 'glass' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>毛玻璃模式</button>
                  </div>
                </section>

                <section className="bg-rose-50/20 p-6 rounded-[40px] border border-rose-100">
                  <h3 className="text-sm font-bold mb-5 flex items-center text-gray-800"><Type size={16} className="mr-2 text-rose-500"/> 数字样式自定义</h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">字体选择</label>
                        <div className="grid grid-cols-2 gap-3">
                            {fontOptions.map(font => (
                                <button 
                                    key={font.value}
                                    onClick={() => setCardData({...cardData, daysFont: font.value})}
                                    className={`relative h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center overflow-hidden bg-white ${cardData.daysFont === font.value ? 'border-rose-500 shadow-md ring-4 ring-rose-50' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}
                                >
                                    <div 
                                        style={{ 
                                            fontFamily: font.value, 
                                            color: cardData.daysColor,
                                            textShadow: cardData.daysShadow ? `0 2px 6px ${cardData.daysColor}30` : 'none',
                                            fontWeight: cardData.daysWeight 
                                        }}
                                        className="text-3xl leading-none mb-1"
                                    >
                                        {cardData.days}
                                    </div>
                                    <span className="text-[9px] text-gray-400 font-medium truncate w-full text-center px-2">{font.label}</span>
                                    {cardData.daysFont === font.value && (
                                        <div className="absolute top-2 right-2">
                                            <CheckCircle size={14} className="text-rose-500 fill-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-end space-x-4">
                        <div className="flex-1 space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                                <Palette size={12} className="mr-1"/> 颜色
                            </label>
                            <div className="flex bg-white p-2 rounded-2xl border border-gray-100 items-center space-x-3">
                                <input 
                                    type="color" 
                                    value={cardData.daysColor} 
                                    onChange={(e) => setCardData({...cardData, daysColor: e.target.value})}
                                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                                />
                                <input 
                                    type="text" 
                                    value={cardData.daysColor.toUpperCase()} 
                                    onChange={(e) => setCardData({...cardData, daysColor: e.target.value})}
                                    className="flex-1 bg-transparent text-xs font-mono font-bold text-gray-600 outline-none"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={() => setCardData({...cardData, daysShadow: !cardData.daysShadow})}
                            className={`p-4 rounded-2xl transition-all border flex items-center justify-center ${cardData.daysShadow ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-200' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
                            title="文字阴影"
                        >
                            <Layers size={20} />
                        </button>
                    </div>
                  </div>
                </section>

                {cardData.style === 'glass' && (
                  <section className="bg-white p-6 rounded-[32px] border border-gray-100 space-y-6">
                    <h3 className="text-sm font-bold flex items-center text-gray-700"><Sliders size={16} className="mr-2 text-rose-500"/> 毛玻璃调节</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest"><span>透明度</span><span>{Math.round(cardData.glassOpacity * 100)}%</span></div>
                            <input type="range" min="0" max="0.9" step="0.05" value={cardData.glassOpacity} onChange={(e) => setCardData({...cardData, glassOpacity: parseFloat(e.target.value)})} className="w-full accent-rose-500 h-1.5 bg-gray-100 rounded-lg appearance-none" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest"><span>模糊度</span><span>{cardData.glassBlur}px</span></div>
                            <input type="range" min="0" max="40" step="1" value={cardData.glassBlur} onChange={(e) => setCardData({...cardData, glassBlur: parseInt(e.target.value)})} className="w-full accent-rose-500 h-1.5 bg-gray-100 rounded-lg appearance-none" />
                        </div>
                    </div>
                  </section>
                )}

                <section>
                  <h3 className="text-sm font-bold mb-4 flex items-center text-gray-700"><ImageIcon size={16} className="mr-2 text-rose-500"/> 背景底图</h3>
                  <div className="grid grid-cols-1 gap-3">
                      <label className="flex items-center justify-center py-5 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50 hover:border-rose-200 transition group">
                          <input type="file" className="hidden" onChange={handleImageUpload} />
                          <Upload size={18} className="mr-2 text-gray-400 group-hover:text-rose-500 transition" />
                          <span className="text-xs text-gray-500 group-hover:text-rose-600 font-medium">上传本地图片</span>
                      </label>
                      <button onClick={refreshBackground} className="w-full py-4 bg-white border border-gray-100 text-gray-600 text-[11px] rounded-2xl hover:bg-gray-50 font-bold transition flex items-center justify-center active:scale-[0.98]">
                          <RefreshCw size={14} className="mr-2 text-rose-500"/> 换一张网络图片
                      </button>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold mb-4 flex items-center text-gray-700"><Quote size={16} className="mr-2 text-rose-500"/> 文案内容</h3>
                  <div className="flex bg-gray-100 p-1 rounded-xl mb-4 text-[10px] font-bold text-gray-400">
                    <button onClick={() => setCardData({...cardData, contentType: 'standard'})} className={`flex-1 py-2 rounded-lg transition ${cardData.contentType === 'standard' ? 'bg-white text-rose-600 shadow-sm' : ''}`}>文字</button>
                    <button onClick={() => setCardData({...cardData, contentType: 'html'})} className={`flex-1 py-2 rounded-lg transition ${cardData.contentType === 'html' ? 'bg-white text-rose-600 shadow-sm' : ''}`}>HTML卡片</button>
                  </div>
                  {cardData.contentType === 'standard' ? (
                    <div className="space-y-3">
                      <textarea className="w-full h-24 p-4 bg-gray-50 border-none rounded-2xl text-xs text-gray-600 focus:ring-1 focus:ring-rose-200 outline-none resize-none shadow-inner leading-relaxed" value={cardData.hitokoto} onChange={(e) => setCardData({...cardData, hitokoto: e.target.value})} />
                      <button onClick={fetchHitokoto} className="w-full py-3 bg-gray-900 text-white text-[11px] rounded-xl hover:bg-black font-bold transition shadow-lg">换一句心里话</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea className="w-full h-32 p-4 bg-slate-900 text-rose-200 font-mono rounded-2xl text-[10px] outline-none resize-none shadow-2xl border-2 border-slate-800" value={cardData.customHtml} onChange={(e) => setCardData({...cardData, customHtml: e.target.value})} />
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        )}

        {/* 基础配置面板 */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto py-12 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-black tracking-tight flex items-center"><Settings className="mr-2 text-rose-500" /> 全局基础配置</h2>
            <div className="bg-white rounded-[48px] p-10 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2 border-b border-gray-50 pb-4 mb-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <CalendarHeart size={14} className="mr-2" /> 纪念日信息
                </h4>
              </div>
              <FormInput label="纪念标题" value={config.eventTitle} onChange={e => setConfig({...config, eventTitle: e.target.value})} />
              <FormInput label="起始日期" type="date" value={config.anniversaryDate} onChange={e => setConfig({...config, anniversaryDate: e.target.value})} />
              <FormInput label="你的称呼" icon={<User size={14}/>} value={config.roleAName} onChange={e => setConfig({...config, roleAName: e.target.value})} />
              <FormInput label="TA的称呼" icon={<User size={14}/>} value={config.roleBName} onChange={e => setConfig({...config, roleBName: e.target.value})} />
              <FormInput label="相识城市" icon={<Cloud size={14}/>} value={config.city} onChange={e => setConfig({...config, city: e.target.value})} />
              
              <div className="md:col-span-2 border-b border-gray-50 pb-4 mt-6 mb-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <Mail size={14} className="mr-2" /> 自动化推送 (SMTP)
                </h4>
              </div>
              <FormInput label="推送时间" type="time" value={config.pushTime} onChange={e => setConfig({...config, pushTime: e.target.value})} />
              <FormInput label="SMTP 服务" placeholder="如 smtp.qq.com" value={config.emailHost} onChange={e => setConfig({...config, emailHost: e.target.value})} />
              <FormInput label="发件账号" icon={<Mail size={14}/>} value={config.emailUser} onChange={e => setConfig({...config, emailUser: e.target.value})} />
              <FormInput label="发件授权码" icon={<Lock size={14}/>} type="password" value={config.emailPass} onChange={e => setConfig({...config, emailPass: e.target.value})} />
              <div className="md:col-span-2">
                <FormInput label="接收邮箱 (多个地址用逗号)" value={config.receiveEmail} onChange={e => setConfig({...config, receiveEmail: e.target.value})} />
              </div>

              <div className="md:col-span-2 pt-8">
                <button onClick={handleSaveConfig} className="w-full py-5 bg-rose-500 text-white rounded-[24px] font-bold hover:bg-rose-600 transition flex items-center justify-center space-x-2 shadow-xl shadow-rose-100 active:scale-[0.98]">
                  <Save size={18} />
                  <span>保存设置到本地存储</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 历史轨迹 */}
        {activeTab === 'history' && (
          <div className="max-w-5xl mx-auto py-12 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-black tracking-tight flex items-center"><History className="mr-2 text-rose-500" /> 纪念日足迹</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
              {history.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-[40px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                  <div className="aspect-[4/5] rounded-[30px] overflow-hidden mb-4">
                    <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" alt="history" />
                  </div>
                  <div className="px-2 pb-2">
                    <p className="text-base font-bold text-gray-800 truncate">{item.title}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono tracking-widest uppercase">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 mb-1 ${active ? 'bg-rose-500 text-white font-bold shadow-xl shadow-rose-200' : 'text-gray-400 hover:bg-rose-50 hover:text-rose-400'}`}>
    {React.cloneElement(icon, { size: 18 })}
    <span className="text-sm tracking-wide">{label}</span>
  </button>
);

const FormInput = ({ label, type = "text", value, onChange, icon, placeholder }) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
      {icon && <span className="mr-1 opacity-50">{icon}</span>}
      {label}
    </label>
    <input 
      type={type} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder}
      className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-rose-100 focus:ring-4 focus:ring-rose-50/50 outline-none text-sm transition-all shadow-inner" 
    />
  </div>
);

export default App;
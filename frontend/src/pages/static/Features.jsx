import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();
  const allFeatures = [
    {
      icon: Video,
      title: t('feature_1_title'),
      desc: t('feature_1_desc')
    },
    {
      icon: Calendar,
      title: t('feature_2_title'),
      desc: t('feature_2_desc')
    },
    {
      icon: FileText,
      title: t('feature_3_title'),
      desc: t('feature_3_desc')
    },
    {
      icon: Shield,
      title: t('feature_4_title'),
      desc: t('feature_4_desc')
    },
    {
      icon: Bell,
      title: t('feature_5_title'),
      desc: t('feature_5_desc')
    },
    {
      icon: Smartphone,
      title: t('feature_6_title'),
      desc: t('feature_6_desc')
    }
  ];

  return (
    <PublicLayout>
      <div className="py-20 bg-white">
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center px-6 mb-24">
          <h1 className="text-5xl font-black text-gray-900 mb-6">
            {t('features_hero_1')} <br/> <span className="text-primary-600">{t('features_hero_2')}</span>
          </h1>
          <p className="text-xl text-gray-500">{t('features_hero_sub')}</p>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-10 grid md:grid-cols-3 gap-10 mb-32">
          {allFeatures.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-2xl transition-all group"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-600 mb-6 shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-all">
                <f.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Section Spécialiste */}
        <div className="max-w-7xl mx-auto px-10 mb-32">
          <div className="bg-gray-900 rounded-[4rem] p-16 text-white flex flex-col md:flex-row items-center gap-16 overflow-hidden relative">
            <div className="flex-1 relative z-10">
              <h2 className="text-4xl font-bold mb-6">{t('feature_special_title')}</h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                {t('feature_special_sub')}
              </p>
              <ul className="space-y-4">
                {[t('feature_zap_1'), t('feature_zap_2'), t('feature_zap_3')].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-primary-400 font-bold">
                    <Zap size={18} /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 relative z-10">
               <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[3rem] shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center"><Video /></div>
                    <p className="font-bold">{t('consultation_room_title')}...</p>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-white/10 rounded-full w-full"></div>
                    <div className="h-4 bg-white/10 rounded-full w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded-full w-1/2"></div>
                  </div>
               </div>
            </div>
            <Activity size={300} className="absolute -bottom-20 -right-20 text-white/5" />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};


export default Features;

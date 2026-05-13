import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();
  const stats = [
    { label: t('stat_doctors'), value: "500+" },
    { label: t('stat_cities'), value: "24" },
    { label: t('stat_consultations'), value: "10k+" },
    { label: t('stat_satisfaction'), value: "98%" },
  ];

  return (
    <PublicLayout>
      <div className="py-20 px-10 bg-white">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-xs font-bold inline-block mb-6 uppercase tracking-wider">
              {t('about_mission_label')}
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
              {t('about_hero_1')} <span className="text-primary-600">{t('about_hero_2')}</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-8">
              {t('about_hero_sub')}
            </p>
            <div className="flex gap-4">
              <button className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-700 shadow-xl shadow-primary-600/20 transition-all">
                {t('about_join_btn')}
              </button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="bg-primary-600 rounded-[3rem] aspect-square overflow-hidden shadow-2xl relative z-10">
               <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center p-12 text-center text-white">
                  <Activity size={100} className="opacity-20 absolute -top-10 -right-10" />
                  <p className="text-2xl font-bold italic">{t('about_quote')}</p>
               </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-full h-full bg-gray-50 rounded-[3rem] -z-10 border border-gray-100"></div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto mb-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                <p className="text-4xl font-black text-primary-600 mb-2">{s.value}</p>
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="max-w-6xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('about_values_title')}</h2>
          <div className="grid md:grid-cols-3 gap-12 mt-16">
            {[
              { icon: Heart, title: t('value_1_title'), desc: t('value_1_desc') },
              { icon: Award, title: t('value_2_title'), desc: t('value_2_desc') },
              { icon: Globe, title: t('value_3_title'), desc: t('value_3_desc') }
            ].map((v, i) => (
              <div key={i} className="space-y-6">
                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto">
                  <v.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{v.title}</h3>
                <p className="text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};


export default About;

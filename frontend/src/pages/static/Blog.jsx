import React from 'react';
import PublicLayout from '../../components/PublicLayout';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calendar, User, ArrowRight } from 'lucide-react';

const Blog = () => {
  const { t } = useTranslation();

  const posts = [
    {
      id: 1,
      title: "Comment la télémédecine change la donne au Maroc",
      excerpt: "Découvrez comment les nouvelles technologies facilitent l'accès aux soins dans les zones reculées.",
      date: "10 Mai 2026",
      author: "Dr. Amine",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      title: "5 conseils pour une consultation vidéo réussie",
      excerpt: "Préparez votre espace et votre connexion pour une expérience optimale avec votre médecin.",
      date: "08 Mai 2026",
      author: "Équipe ClinicFlow",
      image: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <PublicLayout>
      <div className="py-20 px-10 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-5xl font-black text-gray-900 mb-6">{t('blog_title')}</h1>
          <p className="text-xl text-gray-500">{t('blog_sub')}</p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          {posts.map((post, i) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative h-80 rounded-[3rem] overflow-hidden mb-8 shadow-xl">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-4 px-2">
                <span className="flex items-center gap-2"><Calendar size={16} /> {post.date}</span>
                <span className="flex items-center gap-2"><User size={16} /> {post.author}</span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4 px-2 group-hover:text-primary-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-500 leading-relaxed mb-6 px-2">
                {post.excerpt}
              </p>
              
              <button className="flex items-center gap-2 text-primary-600 font-bold px-2 group-hover:gap-4 transition-all">
                {t('blog_read_more')} <ArrowRight size={20} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

export default Blog;

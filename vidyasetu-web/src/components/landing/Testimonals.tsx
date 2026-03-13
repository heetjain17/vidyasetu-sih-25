import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export const Testimonials: React.FC = () => {
  const { t } = useTranslation();

  const reviews = [
    {
      text: t("landing.testimonials.review1"),
      author: t("landing.testimonials.review1Author"),
      role: t("landing.testimonials.review1Role"),
      img: "https://picsum.photos/id/64/100/100",
    },
    {
      text: t("landing.testimonials.review2"),
      author: t("landing.testimonials.review2Author"),
      role: t("landing.testimonials.review2Role"),
      img: "https://picsum.photos/id/91/100/100",
    },
    {
      text: t("landing.testimonials.review3"),
      author: t("landing.testimonials.review3Author"),
      role: t("landing.testimonials.review3Role"),
      img: "https://picsum.photos/id/177/100/100",
    },
  ];

  return (
    <section className=" overflow-hidden relative">
      <div className="container mx-auto px-6 text-center mb-16 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold mb-4"
        >
          {t("landing.testimonials.title")}
        </motion.h2>
        <p className="text-xl text-text-secondary">
          {t("landing.testimonials.subtitle")}
        </p>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, type: "spring", stiffness: 100 }}
              whileHover={{ y: -15, scale: 1.02 }}
              className="bg-card p-8 rounded-2xl shadow-sm border border-border flex flex-col items-center text-center hover:border-primary/30 transition-colors"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden mb-6 border-4 border-surface shadow-md relative group">
                <img
                  src={review.img}
                  alt={review.author}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:opacity-90"
                />
              </div>
              <div className="mb-6 relative">
                <span className="absolute -top-4 -left-2 text-4xl text-primary/20 font-serif">
                  "
                </span>
                <p className="text-lg italic text-text-secondary relative z-10 px-2">
                  {review.text}
                </p>
                <span className="absolute -bottom-4 -right-2 text-4xl text-primary/20 font-serif">
                  "
                </span>
              </div>
              <div className="mt-auto border-t border-border pt-6 w-full">
                <h4 className="font-bold text-lg">{review.author}</h4>
                <span className="text-sm text-secondary font-medium">
                  {review.role}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

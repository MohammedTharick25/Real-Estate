import { motion } from "framer-motion";

const reviews = [
  {
    id: 1,
    name: "John Doe",
    text: "Found my dream home in just two weeks! Excellent service.",
    role: "Homeowner",
  },
  {
    id: 2,
    name: "Sarah Smith",
    text: "The land acquisition process was transparent and fast.",
    role: "Investor",
  },
  {
    id: 3,
    name: "Mike Ross",
    text: "The best real estate platform I've ever used. 10/10.",
    role: "CEO, Tech Corp",
  },
];

export default function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <h2
          id="testimonials-heading"
          className="text-3xl md:text-4xl font-black text-center mb-12 text-slate-900 dark:text-white"
        >
          What Our Clients Say
        </h2>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              whileHover={{ y: -8 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl dark:shadow-black/30 transition-all duration-300"
            >
              {/* Review Text */}
              <p className="italic text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                "{review.text}"
              </p>

              {/* Name */}
              <h4 className="font-bold text-slate-900 dark:text-white">
                {review.name}
              </h4>

              {/* Role */}
              <span className="text-sm text-brand font-medium">
                {review.role}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

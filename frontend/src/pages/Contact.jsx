import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div className="bg-gradient-to-b from-white via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-black min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Contact Our Experts
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg">
            We are here to help you find your next big investment.
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-md">
                <Phone />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Call Us
                </h4>

                <p className="text-slate-600 dark:text-slate-400">
                  +1 (234) 567-890
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-md">
                <Mail />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Email Us
                </h4>

                <p className="text-slate-600 dark:text-slate-400">
                  contact@estatehub.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-md">
                <MapPin />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Office Address
                </h4>

                <p className="text-slate-600 dark:text-slate-400">
                  123 Luxury Way, Beverly Hills, CA
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-blue-100 dark:border-slate-800 transition-colors">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-4 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-400/30 text-slate-900 dark:text-white placeholder:text-slate-400"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-4 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-400/30 text-slate-900 dark:text-white placeholder:text-slate-400"
              />

              <input
                type="text"
                placeholder="Subject"
                className="md:col-span-2 w-full p-4 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-400/30 text-slate-900 dark:text-white placeholder:text-slate-400"
              />

              <textarea
                placeholder="How can we help you?"
                className="md:col-span-2 w-full p-4 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl h-40 outline-none focus:ring-2 ring-blue-400/30 text-slate-900 dark:text-white placeholder:text-slate-400"
              ></textarea>

              <button className="md:col-span-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all">
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="mt-16 h-96 rounded-3xl overflow-hidden shadow-inner grayscale hover:grayscale-0 transition-all duration-700">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3405.846566556824!2d-118.4003563!3d34.0736204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc04d6d147ab%3A0xd6c7c379279a478d!2sBeverly%20Hills%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000000"
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

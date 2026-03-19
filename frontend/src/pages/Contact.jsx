import { Mail, Phone, MapPin } from "lucide-react";
import emailjs from "@emailjs/browser";
import { useRef } from "react";
import { t } from "@lingui/macro";
import { toast } from "react-hot-toast";

export default function Contact() {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAIL_SERVICE_ID,
        import.meta.env.VITE_EMAIL_TEMPLATE_ID,
        form.current,
        import.meta.env.VITE_EMAIL_PUBLIC_KEY,
      )
      .then(
        () => {
          toast.success(t`Message sent successfully!`);
          form.current.reset();
        },
        (error) => {
          toast.error(t`Failed to send message`);
          console.error(error);
        },
      );
  };

  return (
    <div className="bg-linear-to-b from-white via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-black min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t`Contact Our Experts`}
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg">
            {t`We are here to help you find your next big investment.`}
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-md">
                <Phone />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  {t`Call Us`}
                </h4>

                <p className="text-slate-600 dark:text-slate-400">
                  +91 97916 74849
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-4 bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-md">
                <Mail />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  {t`Email Us`}
                </h4>

                <p className="text-slate-600 dark:text-slate-400">
                  estatera@gmail.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-4 bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-md">
                <MapPin />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  {t`Office Address`}
                </h4>

                <p className="text-slate-600 dark:text-slate-400">
                  Pudupattinam, Kalpakkam, Tamil Nadu, India
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-blue-100 dark:border-slate-800 transition-colors">
            <form
              ref={form}
              onSubmit={sendEmail}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <input
                name="user_name"
                type="text"
                placeholder={t`Full Name`}
                className="w-full p-4 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-400/30 text-slate-900 dark:text-white placeholder:text-slate-400 transition"
                required
              />

              <input
                name="user_email"
                type="email"
                placeholder={t`Email Address`}
                className="w-full p-4 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-400/30 text-slate-900 dark:text-white placeholder:text-slate-400 transition"
                required
              />

              <input
                name="subject"
                type="text"
                placeholder={t`Subject`}
                className="md:col-span-2 w-full p-4 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-400/30 text-slate-900 dark:text-white placeholder:text-slate-400 transition"
                required
              />

              <textarea
                name="message"
                placeholder={t`How can we help you?`}
                className="md:col-span-2 w-full p-4 h-40 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-400/30 text-slate-900 dark:text-white placeholder:text-slate-400 transition resize-none"
                required
              ></textarea>

              <button
                type="submit"
                className="md:col-span-2 bg-linear-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
              >
                {t`Send Message`}
              </button>
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="mt-16 h-96 rounded-3xl overflow-hidden shadow-inner grayscale hover:grayscale-0 transition-all duration-700">
          <iframe
            src="https://www.google.com/maps?q=Chennai,Tamil%20Nadu&output=embed"
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

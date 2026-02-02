"use client";
import { motion } from "framer-motion";
import { useContactInfo } from "../../utils/contactInfo";

export default function AboutPage() {
  const { contactPhone, supportEmail } = useContactInfo();
  return (
    <>
      {/* Hero-style Header */}
      <section className="relative bg-gradient-to-b from-yellow-200 to-white py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto px-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About WeTrainEducation & Tech
          </h1>
          <p className="text-lg text-gray-700">
            Empowering businesses and professionals through innovative
            technology, comprehensive training, and marketing excellence.
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Bengali Version */}
          <div className="text-gray-700 leading-7 mb-10 border border-yellow-300 rounded-lg p-6 bg-yellow-50">
            <h2 className="text-2xl font-bold mb-4">আমাদের সম্পর্কে</h2>
            <p className="mb-4">
              WeTrainEducation & Tech হল একটি গতিশীল প্রযুক্তি ও শিক্ষা সংস্থা
              যা ব্যবসা এবং পেশাদারদের ডিজিটাল যুগে সফল হতে সাহায্য করে। আমরা
              বিশ্বাস করি যে সঠিক প্রশিক্ষণ, উদ্ভাবনী সফটওয়্যার সমাধান এবং
              কার্যকর মার্কেটিং কৌশল যেকোনো ব্যবসাকে নতুন উচ্চতায় নিয়ে যেতে
              পারে।
            </p>

            <h3 className="text-xl font-bold mb-3">আমাদের মিশন</h3>
            <p className="mb-4">
              আমাদের মিশন হল বিশ্বমানের শিক্ষা, এন্টারপ্রাইজ সফটওয়্যার এবং
              মার্কেটিং পরিষেবা প্রদান করা যা আমাদের ক্লায়েন্টদের ব্যবসায়িক
              লক্ষ্য অর্জনে সহায়তা করে। আমরা প্রযুক্তি এবং উদ্ভাবনকে কাজে
              লাগিয়ে সমস্যার সৃজনশীল সমাধান প্রদান করি।
            </p>

            <h3 className="text-xl font-bold mb-3">আমাদের মূল্যবোধ</h3>
            <div className="mb-4 space-y-2">
              <p>
                • <strong>সততা:</strong> আমরা স্বচ্ছতা এবং সততার সাথে প্রতিটি
                প্রকল্প পরিচালনা করি
              </p>
              <p>
                • <strong>উৎকর্ষতা:</strong> গুণমান এবং উদ্ভাবন আমাদের সকল কাজের
                মূল
              </p>
              <p>
                • <strong>গ্রাহক সন্তুষ্টি:</strong> আপনার সাফল্য আমাদের সাফল্য
              </p>
              <p>
                • <strong>ক্রমাগত শিক্ষা:</strong> আমরা সর্বদা নতুন প্রযুক্তি
                এবং পদ্ধতি শিখছি
              </p>
              <p>
                • <strong>টিমওয়ার্ক:</strong> একসাথে আমরা আরও বেশি অর্জন করতে
                পারি
              </p>
            </div>

            <h3 className="text-xl font-bold mb-3">আমাদের সেবা</h3>
            <p className="mb-3">
              আমরা নিম্নলিখিত তিনটি প্রধান ক্ষেত্রে বিশেষজ্ঞ পরিষেবা প্রদান করি:
            </p>
            <div className="mb-4 space-y-2">
              <p>
                <strong>১. পেশাদার প্রশিক্ষণ:</strong> ওয়েব ডেভেলপমেন্ট,
                ডিজিটাল মার্কেটিং, ব্যবসায় ব্যবস্থাপনা এবং আরও অনেক কিছুতে
                ব্যাপক কোর্স
              </p>
              <p>
                <strong>২. এন্টারপ্রাইজ সফটওয়্যার:</strong> স্কুল ম্যানেজমেন্ট
                সিস্টেম, ই-কমার্স প্ল্যাটফর্ম, পিওএস সিস্টেম এবং কাস্টম সমাধান
              </p>
              <p>
                <strong>৪. মার্কেটিং সেবা:</strong> ডিজিটাল বিজ্ঞাপন, সোশ্যাল
                মিডিয়া ম্যানেজমেন্ট, এসইও এবং ব্র্যান্ড ডেভেলপমেন্ট
              </p>
            </div>

            <h3 className="text-xl font-bold mb-3">যোগাযোগ</h3>
            <p>
              প্রশ্ন বা সহযোগিতার জন্য আমাদের সাথে যোগাযোগ করুন: <br />
              <strong>ইমেইল:</strong> {supportEmail} <br />
              <strong>ফোন:</strong> {contactPhone}
            </p>
          </div>

          {/* English Version */}
          <div className="text-gray-700 leading-7 space-y-6">
            <h2 className="text-2xl font-bold mb-4">Who We Are</h2>
            <p>
              WeTrainEducation & Tech is a dynamic technology and education
              company dedicated to helping businesses and professionals thrive
              in the digital age. We believe that the right training, innovative
              software solutions, and effective marketing strategies can
              transform any organization. With expertise across education,
              enterprise software, and digital marketing, we deliver
              comprehensive solutions tailored to your unique needs.
            </p>

            <h3 className="text-xl font-bold">Our Story</h3>
            <p>
              Foundation to Democratize Access to World-class Technology
              Education and Services, WeTrainEducation & Tech has grown to serve
              hundreds of businesses and thousands of students. We started with
              a simple mission: to bridge the gap between skills and
              opportunities in Bangladesh&apos;s growing tech ecosystem. Today,
              we&apos;re proud to be a trusted partner for businesses seeking
              growth through digital transformation.
            </p>

            <h3 className="text-xl font-bold">Our Core Values</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Integrity:</strong> Transparent communication and honest
                practices in every project
              </li>
              <li>
                <strong>Excellence:</strong> Commitment to quality, innovation,
                and continuous improvement
              </li>
              <li>
                <strong>Customer-Centric:</strong> Your success is our
                success&mdash;we&apos;re invested in your goals
              </li>
              <li>
                <strong>Continuous Learning:</strong> We stay ahead of
                technology trends and industry best practices
              </li>
              <li>
                <strong>Collaboration:</strong> Teamwork and partnership drive
                better outcomes
              </li>
            </ul>

            <h3 className="text-xl font-bold">What We Offer</h3>
            <p>We specialize in three core areas:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Professional Training & Courses:</strong>{" "}
                Industry-relevant programs in web development, digital
                marketing, business management, and emerging technologies
              </li>
              <li>
                <strong>Enterprise Software Solutions:</strong> Custom-built and
                off-the-shelf software for schools, retail, e-commerce, CRM, and
                beyond
              </li>
              <li>
                <strong>Digital Marketing Services:</strong> From strategy and
                content creation to paid advertising, social media management,
                and SEO optimization
              </li>
            </ul>

            <h3 className="text-xl font-bold">Our Team</h3>
            <p>
              Our team brings together strategists, developers, designers, and
              marketing experts with diverse backgrounds and expertise.
              We&apos;re passionate about solving complex challenges and
              delivering measurable results. Every team member is committed to
              upholding our values and supporting your success.
            </p>

            <h3 className="text-xl font-bold">Why Choose Us?</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Proven Track Record:</strong> 200+ projects delivered,
                50+ enterprise clients, 2,000+ trained professionals
              </li>
              <li>
                <strong>Industry Certifications:</strong> ISO 9001 certified
                with expertise across major cloud platforms
              </li>
              <li>
                <strong>Customized Solutions:</strong> We don&apos;t believe in
                one-size-fits-all; every client gets a tailored approach
              </li>
              <li>
                <strong>24/7 Support:</strong> Our team is always ready to
                assist you
              </li>
              <li>
                <strong>Competitive Pricing:</strong> World-class quality at
                affordable rates
              </li>
            </ul>

            <h3 className="text-xl font-bold">Let&apos;s Work Together</h3>
            <p>
              Whether you need training, software development, marketing
              assistance, or a combination of services, we&apos;re here to help.
              Reach out to us today and let&apos;s discuss how WeTrainEducation
              & Tech can support your growth journey.
            </p>

            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-300 rounded-lg">
              <h3 className="text-lg font-bold mb-2">Contact Information</h3>
              <p className="mb-2">
                <strong>Email:</strong>{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-yellow-600 hover:underline"
                >
                  {supportEmail}
                </a>
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                <a
                  href={`tel:${contactPhone}`}
                  className="text-yellow-600 hover:underline"
                >
                  {contactPhone}
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}

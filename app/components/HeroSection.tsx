export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Amplify Your Brand with
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-yellow)] to-[var(--secondary-yellow)]">
            Strategic Marketing
          </span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto text-gray-200">
          Drive growth and maximize your ROI with our data-driven marketing
          solutions designed to elevate your business
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-[var(--primary-yellow)] hover:bg-[var(--secondary-yellow)] text-gray-900 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
            Get Free Strategy Session
          </button>
          <button className="border-2 border-[var(--primary-yellow)] text-[var(--primary-yellow)] hover:bg-[var(--primary-yellow)] hover:text-gray-900 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300">
            View Our Work
          </button>
        </div>
      </div>
    </section>
  );
}

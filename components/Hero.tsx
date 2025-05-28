import ThemeToggleButton from "@/components/ThemeToggleButton";

export default function Hero() {
  return (
    <section
      className="hero min-h-screen"
      style={{
        backgroundImage:
          "url(https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://www.myswitzerland.com/-/media/celum%20connect/2025/03/12/07/45/22/saas-fee-aerial.jpg)",
      }}
    >
      <div className="absolute top-0 right-0">
        <ThemeToggleButton></ThemeToggleButton>
      </div>
      <div className="hero-overlay"></div>
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-xl">
          <h1 className="font-heading mb-5 text-8xl font-bold">Avena</h1>
          <p className="font-p text-xl">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. In qui
            odio, hic ut corrupti facilis illo, amet assumenda temporibus earum
            minima id necessitatibus. Id suscipit sequi dolorum sit. Eligendi
            saepe quia culpa voluptatibus magnam laboriosam autem dolorem ipsa
            necessitatibus soluta.
          </p>
        </div>
      </div>
    </section>
  );
}

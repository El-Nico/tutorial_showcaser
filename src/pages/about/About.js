import Footer from "../home/shared/footer/Footer";
import { Header } from "../home/shared/header/Header";
import "./About.css";

export function About() {
  return (
    <div id="About">
      <Header showSelect={false} />
      <main>
        <div>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eveniet
          repudiandae saepe porro quos vero hic sequi itaque amet est,
          distinctio ea nemo architecto eum fugiat id quaerat dolores molestiae
          omnis quo eius dolor sit aliquid. Ipsum ab perferendis aliquam modi
          velit, cupiditate atque at. Blanditiis nisi a porro sit laborum.
        </div>
      </main>
      <Footer />
    </div>
  );
}

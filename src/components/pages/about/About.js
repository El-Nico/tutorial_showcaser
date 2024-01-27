import Footer from "../../shared/footer/Footer";
import { Header } from "../../shared/header/Header";
import "./About.css";

export function About() {
  return (
    <div id="About">
      <Header showSelect={false} />
      <main>
        <div className="about-about-text">
          A React web application that dynamically generates web showcases of
          selected projects from my GitHub repositories using the firebase
          hosting API, the GitHub API and firebase cloud functions.{" "}
          <a
            href="https://nicholas-eruba.com/articles/project_showcaser"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn More
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}

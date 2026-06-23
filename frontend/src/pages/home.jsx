import HomePulse from "../components/HomePulse";
import Posts from "../components/Posts";
import Share from "../components/Share";
import Stories from "../components/Stories";

const Home = () => {
  return (
    <div className="uks-feed">
      <HomePulse />
      <Stories />
      <Share />
      <Posts />
    </div>
  );
};

export default Home;

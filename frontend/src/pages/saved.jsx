import { Bookmark, CollectionsBookmark } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../axios";
import Post from "../components/Post";

const Saved = () => {
  const { data: posts = [], isPending, error } = useQuery({
    queryKey: ["saved-posts"],
    queryFn: () => makeRequest.get("/saved").then((res) => res.data),
  });

  return (
    <div className="uks-saved-page">
      <section className="uks-settings-hero">
        <div>
          <span className="uks-kicker">
            <CollectionsBookmark fontSize="small" />
            Saved
          </span>
          <h1>Your saved posts</h1>
          <p>Keep useful posts, market finds, and updates in one private collection.</p>
        </div>
        <Bookmark />
      </section>

      <section className="uks-post-list">
        {error ? (
          <div className="uks-card uks-empty">Could not load saved posts.</div>
        ) : isPending ? (
          <div className="uks-skeleton-stack">
            <div />
            <div />
          </div>
        ) : posts.length === 0 ? (
          <div className="uks-card uks-instagram-empty">
            <h3>No saved posts yet</h3>
            <p>Tap Save on any post to keep it here.</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <Post key={`${post.id}-${post.savedAt || index}`} post={post} />
          ))
        )}
      </section>
    </div>
  );
};

export default Saved;

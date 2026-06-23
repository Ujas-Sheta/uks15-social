/* eslint-disable react/prop-types */
import { makeRequest } from "../axios";
import Post from "./Post";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

const Posts = ({ userId }) => {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const { isPending, error, data = [] } = useQuery({
    queryKey: ["posts", userId, page],
    queryFn: () => {
      const params = new URLSearchParams({ page });
      if (userId) params.set("userId", userId);
      return makeRequest.get(`/posts?${params}`).then((res) => res.data);
    },
    placeholderData: keepPreviousData,
  });

  return (
    <div className="uks-post-list">
      {error ? (
        <div className="uks-card uks-empty">Something went wrong loading posts.</div>
      ) : isPending ? (
        <div className="uks-skeleton-stack">
          <div />
          <div />
          <div />
        </div>
      ) : data.length === 0 && page === 0 ? (
        <div className="uks-card uks-empty">
          No posts yet. Follow people or share your first update.
        </div>
      ) : (
        <>
          {data.map((post, index) => (
            <Post post={post} key={`${post.id}-${index}`} />
          ))}
          <div className="uks-pagination">
            {page > 0 && (
              <button
                className="uks-secondary-btn"
                onClick={() => setPage((p) => p - 1)}
              >
                ← Newer
              </button>
            )}
            {data.length === PAGE_SIZE && (
              <button
                className="uks-secondary-btn"
                onClick={() => setPage((p) => p + 1)}
              >
                Older →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Posts;

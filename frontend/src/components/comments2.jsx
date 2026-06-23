/* eslint-disable react/prop-types */
import { useContext, useState } from "react";
import { makeRequest } from "../axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { AuthContext } from "../context/AuthContext";
import { profileUrl } from "../utils/upload";

const Comments = ({ postId }) => {
  const [desc, setDesc] = useState("");
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { isPending, data = [] } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () =>
      makeRequest.get("/comments?postId=" + postId).then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: (newComment) => makeRequest.post("/comments", newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    if (!desc.trim()) return;
    mutation.mutate({ desc, postId });
    setDesc("");
  };

  return (
    <section className="uks-comments">
      <form className="uks-comment-form" onSubmit={handleClick}>
        <img
          src={profileUrl(currentUser.profilePic)}
          alt=""
        />
        <input
          type="text"
          placeholder="Write a thoughtful comment"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button type="submit" disabled={!desc.trim()}>
          Send
        </button>
      </form>

      {isPending ? (
        <p className="uks-muted">Loading comments...</p>
      ) : data.length === 0 ? (
        <p className="uks-muted">Start the discussion.</p>
      ) : (
        <div className="uks-comment-list">
          {data.map((comment) => (
            <article key={comment.id} className="uks-comment">
              <img
                src={profileUrl(comment.profilePic)}
                alt=""
              />
              <div>
                <div className="uks-comment__bubble">
                  <strong>{comment.name || comment.username}</strong>
                  <p>{comment.desc}</p>
                </div>
                <small>{moment(comment.createdAt).fromNow()}</small>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Comments;

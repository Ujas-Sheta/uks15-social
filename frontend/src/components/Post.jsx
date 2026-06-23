/* eslint-disable react/prop-types */
import {
  ChatBubbleOutline,
  DeleteOutline,
  Favorite,
  FavoriteBorder,
  IosShare,
  Bookmark,
  BookmarkBorder,
  MoreHoriz,
} from "@mui/icons-material";
import Comments from "./comments2";
import { useContext, useState } from "react";
import { makeRequest } from "../axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/useToast";
import { Link } from "react-router-dom";
import moment from "moment";
import { uploadUrl, profileUrl } from "../utils/upload";

const Post = ({ post }) => {
  const { currentUser } = useContext(AuthContext);
  const { showToast } = useToast();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const queryClient = useQueryClient();
  const reactions = [
    { type: "like", label: "Like", icon: "👍" },
    { type: "love", label: "Love", icon: "❤️" },
    { type: "haha", label: "Haha", icon: "😄" },
    { type: "wow", label: "Wow", icon: "😮" },
    { type: "sad", label: "Sad", icon: "😢" },
  ];

  const { isPending, data: likes = [] } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: () =>
      makeRequest.get("/likes?postId=" + post.id).then((res) => res.data),
  });

  const likeMutation = useMutation({
    mutationFn: async (reactionType) => {
      if (reactionType === myReaction?.reactionType) {
        await makeRequest.delete("/likes?postId=" + post.id);
      } else {
        await makeRequest.post("/likes", { postId: post.id, reactionType });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likes", post.id] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const { data: savedStatus = { saved: false } } = useQuery({
    queryKey: ["saved-status", post.id],
    queryFn: () => makeRequest.get(`/saved/${post.id}`).then((res) => res.data),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (savedStatus.saved) {
        await makeRequest.delete(`/saved/${post.id}`);
      } else {
        await makeRequest.post(`/saved/${post.id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-status", post.id] });
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
      showToast(savedStatus.saved ? "Removed from saved posts." : "Post saved.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (postId) => makeRequest.delete("/posts/" + postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      showToast("Post deleted from your feed.");
    },
  });

  const repostMutation = useMutation({
    mutationFn: () => makeRequest.post(`/posts/${post.id}/repost`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      showToast("Reposted to your feed. Your followers can see it now.");
    },
    onError: () => {
      showToast("Repost failed. Please try again.", "error");
    },
  });

  const myReaction = likes.find((like) => Number(like.userId) === Number(currentUser.id));
  const reactionCounts = likes.reduce((acc, like) => {
    acc[like.reactionType] = (acc[like.reactionType] || 0) + 1;
    return acc;
  }, {});
  const topReactions = reactions.filter((reaction) => reactionCounts[reaction.type]);
  const selectedReaction =
    reactions.find((reaction) => reaction.type === myReaction?.reactionType) || reactions[0];

  return (
    <article className="uks-card uks-post">
      <header className="uks-post__header">
        <Link to={`/profile/${post.userId}`} className="uks-post__author">
          <img
            src={profileUrl(post.profilePic)}
            alt={`${post.username} profile`}
          />
          <span>
            <strong>{post.name || post.username}</strong>
            <small>{moment(post.createdAt).fromNow()} · Public</small>
          </span>
        </Link>

        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="uks-plain-icon" title="Post options">
            <MoreHoriz />
          </button>
          <ul tabIndex={0} className="dropdown-content uks-dropdown menu">
            {post.userId === currentUser.id && (
              <li>
                <button onClick={() => deleteMutation.mutate(post.id)}>
                  <DeleteOutline /> Delete post
                </button>
              </li>
            )}
            <li>
              <button onClick={() => saveMutation.mutate()}>
                {savedStatus.saved ? <Bookmark /> : <BookmarkBorder />}
                {savedStatus.saved ? "Unsave post" : "Save post"}
              </button>
            </li>
          </ul>
        </div>
      </header>

      {post.Desc && <p className="uks-post__text">{post.Desc}</p>}

      {post.img && (
        /\.(mp4|webm|ogg|mov)$/i.test(post.img) ? (
          <video
            className="uks-post__media"
            src={uploadUrl(post.img)}
            controls
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            className="uks-post__media"
            src={uploadUrl(post.img)}
            alt="Post upload"
          />
        )
      )}

      <div className="uks-post__stats">
        <span className="uks-reaction-summary">
          {topReactions.slice(0, 3).map((reaction) => (
            <b key={reaction.type}>{reaction.icon}</b>
          ))}
          {likes.length} reactions
        </span>
        <button type="button" onClick={() => setCommentsOpen(!commentsOpen)}>
          Comments
        </button>
      </div>

      <div className="uks-post__actions">
        <div className="uks-reaction-action">
          <button
            type="button"
            className={myReaction ? "is-active" : ""}
            onClick={() => likeMutation.mutate(selectedReaction.type)}
            disabled={isPending}
          >
            {myReaction ? <Favorite /> : <FavoriteBorder />}
            {myReaction ? selectedReaction.label : "React"}
          </button>
          <div className="uks-reaction-picker">
            {reactions.map((reaction) => (
              <button
                key={reaction.type}
                type="button"
                onClick={() => likeMutation.mutate(reaction.type)}
                title={reaction.label}
              >
                <span>{reaction.icon}</span>
                <small>{reaction.label}</small>
              </button>
            ))}
          </div>
        </div>
        <button type="button" onClick={() => setCommentsOpen(!commentsOpen)}>
          <ChatBubbleOutline />
          Comment
        </button>
        <button
          type="button"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className={savedStatus.saved ? "is-active" : ""}
        >
          {savedStatus.saved ? <Bookmark /> : <BookmarkBorder />}
          Save
        </button>
        <button
          type="button"
          onClick={() => repostMutation.mutate()}
          disabled={repostMutation.isPending}
        >
          <IosShare />
          {repostMutation.isPending ? "Reposting" : "Repost"}
        </button>
      </div>

      {commentsOpen && <Comments postId={post.id} />}
    </article>
  );
};

export default Post;

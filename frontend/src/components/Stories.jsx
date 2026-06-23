import {
  Add,
  ArrowBackIosNew,
  ArrowForwardIos,
  Close,
} from "@mui/icons-material";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import AddStory from "./addStory";
import { makeRequest } from "../axios";
import { AuthContext } from "../context/AuthContext";
import { uploadUrl, profileUrl } from "../utils/upload";

const Stories = () => {
  const [openAddStory, setAddStory] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const { currentUser } = useContext(AuthContext);

  const { isPending, data = [] } = useQuery({
    queryKey: ["stories"],
    queryFn: () => makeRequest.get("/stories").then((res) => res.data),
  });

  const storyGroups = useMemo(() => {
    const grouped = data.reduce((acc, story) => {
      const storyUserId = story.userId || story.userid;
      if (!acc.has(storyUserId)) {
        acc.set(storyUserId, {
          userId: storyUserId,
          username: story.username,
          name: story.name,
          profilePic: story.profilePic,
          isMine: Number(storyUserId) === Number(currentUser.id),
          stories: [],
        });
      }
      acc.get(storyUserId).stories.push(story);
      return acc;
    }, new Map());

    return Array.from(grouped.values()).sort((a, b) => {
      if (a.isMine) return -1;
      if (b.isMine) return 1;
      return new Date(b.stories[0].createdAt) - new Date(a.stories[0].createdAt);
    });
  }, [currentUser.id, data]);

  const activeGroup =
    activeGroupIndex === null ? null : storyGroups[activeGroupIndex];
  const activeStory = activeGroup?.stories[activeStoryIndex];

  const openStoryGroup = (groupIndex) => {
    setActiveGroupIndex(groupIndex);
    setActiveStoryIndex(0);
  };

  const closeViewer = useCallback(() => {
    setActiveGroupIndex(null);
    setActiveStoryIndex(0);
  }, []);

  const goNext = useCallback(() => {
    if (!activeGroup) return;
    if (activeStoryIndex < activeGroup.stories.length - 1) {
      setActiveStoryIndex((index) => index + 1);
      return;
    }
    if (activeGroupIndex < storyGroups.length - 1) {
      setActiveGroupIndex((index) => index + 1);
      setActiveStoryIndex(0);
      return;
    }
    closeViewer();
  }, [activeGroup, activeGroupIndex, activeStoryIndex, closeViewer, storyGroups.length]);

  const goPrevious = useCallback(() => {
    if (!activeGroup) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex((index) => index - 1);
      return;
    }
    if (activeGroupIndex > 0) {
      const previousGroup = storyGroups[activeGroupIndex - 1];
      setActiveGroupIndex((index) => index - 1);
      setActiveStoryIndex(previousGroup.stories.length - 1);
    }
  }, [activeGroup, activeGroupIndex, activeStoryIndex, storyGroups]);

  useEffect(() => {
    if (!activeStory) return undefined;
    const timeoutId = window.setTimeout(goNext, 5200);
    return () => window.clearTimeout(timeoutId);
  }, [activeStory, activeStoryIndex, activeGroupIndex, goNext]);

  return (
    <>
      <section className="uks-stories" aria-label="Stories">
        {isPending ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="uks-story uks-story--loading" />
          ))
        ) : (
          <>
            {storyGroups.some((group) => group.isMine) ? (
              storyGroups.map((group, index) => (
                <button
                  key={group.userId}
                  type="button"
                  className={`uks-story ${group.isMine ? "uks-story--mine" : ""}`}
                  onClick={() => openStoryGroup(index)}
                >
                  <img src={uploadUrl(group.stories[0].img)} alt="" />
                  <span>
                    {group.isMine ? "My story" : group.name || group.username}
                    <small>{group.stories.length} update{group.stories.length > 1 ? "s" : ""}</small>
                  </span>
                </button>
              ))
            ) : (
              <button
                type="button"
                className="uks-story uks-story--create"
                onClick={() => setAddStory(true)}
              >
                <img src={profileUrl(currentUser.profilePic)} alt="" />
                <span>
                  <Add />
                  My story
                  <small>Add your first update</small>
                </span>
              </button>
            )}

            {storyGroups.some((group) => group.isMine) && (
              <button
                type="button"
                className="uks-story uks-story--add"
                onClick={() => setAddStory(true)}
              >
                <span>
                  <Add />
                  Add story
                </span>
              </button>
            )}
          </>
        )}
      </section>

      {openAddStory &&
        createPortal(<AddStory setAddStory={setAddStory} />, document.body)}

      {activeStory &&
        createPortal(
        <div className="uks-story-viewer" role="dialog" aria-modal="true">
          <div className="uks-story-viewer__stage">
            <div className="uks-story-progress">
              {activeGroup.stories.map((story, index) => (
                <span
                  key={story.id}
                  className={
                    index < activeStoryIndex
                      ? "is-complete"
                      : index === activeStoryIndex
                      ? "is-current"
                      : ""
                  }
                />
              ))}
            </div>

            <header className="uks-story-viewer__header">
              <img src={profileUrl(activeGroup.profilePic)} alt="" />
              <span>
                <strong>{activeGroup.isMine ? "My story" : activeGroup.name || activeGroup.username}</strong>
                <small>@{activeGroup.username}</small>
              </span>
              <button type="button" onClick={closeViewer} title="Close story">
                <Close />
              </button>
            </header>

            <img
              className="uks-story-viewer__media"
              src={uploadUrl(activeStory.img)}
              alt={`${activeGroup.username} story`}
            />

            <button
              type="button"
              className="uks-story-nav uks-story-nav--prev"
              onClick={goPrevious}
              disabled={activeGroupIndex === 0 && activeStoryIndex === 0}
              title="Previous story"
            >
              <ArrowBackIosNew />
            </button>
            <button
              type="button"
              className="uks-story-nav uks-story-nav--next"
              onClick={goNext}
              title="Next story"
            >
              <ArrowForwardIos />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Stories;

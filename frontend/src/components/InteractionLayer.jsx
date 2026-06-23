import { useEffect } from "react";

const InteractionLayer = () => {
  useEffect(() => {
    let frameId;

    const updateScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight || 1;
      const progress = Math.min(window.scrollY / scrollable, 1);
      document.documentElement.style.setProperty("--scroll-progress", progress);
    };

    const updatePointer = (event) => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
      });
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("pointermove", updatePointer, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("pointermove", updatePointer);
    };
  }, []);

  return (
    <>
      <div className="uks-pointer-glow" aria-hidden="true" />
      <div className="uks-scroll-progress" aria-hidden="true" />
    </>
  );
};

export default InteractionLayer;

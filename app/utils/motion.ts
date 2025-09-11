export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

type Direction = "left" | "right" | "up" | "down" | "";

export const fadeIn = (
  direction: Direction = "",
  type: "spring" | "tween" = "spring",
  delay = 0,
  duration = 1
) => {
  let x = 0;
  let y = 0;

  if (direction === "left") x = 100;
  if (direction === "right") x = -100;
  if (direction === "up") y = 100;
  if (direction === "down") y = -100;

  return {
    hidden: { x, y, opacity: 0 },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type,
        delay,
        duration,
        ease: "easeOut",
      },
    },
  };
};

export const textVariant = (delay = 0) => ({
  hidden: {
    y: 50,
    opacity: 0,
  },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      duration: 1.25,
      delay,
    },
  },
});

export const zoomIn = (delay = 0, duration = 1) => ({
  hidden: {
    scale: 0,
    opacity: 0,
  },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "tween",
      delay,
      duration,
      ease: "easeOut",
    },
  },
});

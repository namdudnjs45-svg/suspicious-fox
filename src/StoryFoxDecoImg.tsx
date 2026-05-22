import { useState } from "react";
import { storyPublicFoxSrc } from "./storyFoxUrl";

export function StoryFoxDecoImg(props: {
  versionKey?: string;
  filename: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  const { filename, className, width, height, versionKey = "story-ui-stage" } = props;
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <img
      className={className}
      src={storyPublicFoxSrc(versionKey, filename)}
      alt=""
      aria-hidden
      decoding="async"
      width={width}
      height={height}
      onError={() => setVisible(false)}
    />
  );
}

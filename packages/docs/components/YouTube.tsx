import React from "react";

const link: React.CSSProperties = {
  color: "inherit",
};

const container: React.CSSProperties = {
  border: "1px solid #888",
  borderRadius: 10,
  overflow: "hidden",
  marginBottom: 30,
  display: "flex",
  flexDirection: "row",
};

const thumbnail: React.CSSProperties = {
  height: 100,
  display: "inline",
  marginBottom: 0,
  borderRight: "1px solid #888",
};

const right: React.CSSProperties = {
  padding: 16,
  lineHeight: 1.5,
  display: "flex",
  flex: 1,
  flexDirection: "column",
  justifyContent: "center",
};

const wouldYouRather: React.CSSProperties = {
  fontSize: ".9em",
};

const light: React.CSSProperties = {
  opacity: 0.5,
};

export const YouTube: React.FC<{
  minutes: number;
  href: string;
  title: string;
  thumb: string;
}> = ({ minutes, href, title, thumb }) => {
  return (
    <a href={href} target="_blank" style={link}>
      <div style={container}>
        <img style={thumbnail} src={thumb} />
        <div style={right}>
          <div style={wouldYouRather}>
            Also available as a {minutes}min video
          </div>{" "}
          <div>
            <strong>{title}</strong>
          </div>
        </div>
      </div>
    </a>
  );
};

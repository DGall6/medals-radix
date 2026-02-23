function MedalSvg(props) {
  return (
    <svg
      viewBox="0 0 20 20"
      height="20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <ellipse cx={9.985} cy={9.985} rx={9.985} ry={9.985} fill={props.color} />
      <ellipse
        style={{
          transformBox: "fill-box",
          transformOrigin: "50% 50%",
        }}
        cx={8}
        cy={8}
        rx={8.611}
        ry={8.611}
        transform="matrix(1 0 .0062 1 1.985 1.985)"
        fill="none"
        stroke="#333"
        strokeWidth=".4px"
      />
      <ellipse
        cx={5.393}
        cy={9.009}
        rx={1.999}
        ry={1.999}
        fill="none"
        stroke="#000"
        strokeWidth=".4px"
      />
      <ellipse
        cx={7.701}
        cy={10.992}
        rx={1.999}
        ry={1.999}
        fill="none"
        stroke="#000"
        strokeWidth=".4px"
      />
      <ellipse
        cx={10}
        cy={9.132}
        rx={1.999}
        ry={1.999}
        fill="none"
        stroke="#000"
        strokeWidth=".4px"
      />
      <ellipse
        cx={12.298}
        cy={10.974}
        rx={1.999}
        ry={1.999}
        fill="none"
        stroke="#000"
        strokeWidth=".4px"
      />
      <ellipse
        cx={14.607}
        cy={9.185}
        rx={1.999}
        ry={1.999}
        fill="none"
        stroke="#000"
        strokeWidth=".4px"
      />
    </svg>
  );
}

export default MedalSvg;
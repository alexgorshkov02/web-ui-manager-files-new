import * as React from "react";
import { Fragment } from "react";

export default function Breadcrumb({
  pathSegments,
  onHomeClick,
  onElementClick,
}) {
    
  return (
    <div>
      <span onClick={onHomeClick} style={{ cursor: "pointer" }}>
        {pathSegments?.length === 0 ||
        (pathSegments?.length === 1 && pathSegments[0] === "")
          ? "Home"
          : "Home\\"}
      </span>
      {pathSegments?.map((segment, index) => (
        <Fragment key={index}>
          <span onClick={onElementClick} style={{ cursor: "pointer" }}>
            {segment}
          </span>
          {index < pathSegments?.length - 1 && <span>{"\\"}</span>}
        </Fragment>
      ))}
    </div>
  );
}

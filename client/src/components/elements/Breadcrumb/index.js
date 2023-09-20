export default function Breadcrumb({ pathSegments, onClick, onHomeClick }) {
    return (
      <div>
        <span onClick={onHomeClick} style={{ cursor: "pointer" }}>
          {pathSegments.length === 0 ? "Home" : "Home\\"}
        </span>
        {pathSegments.map((segment, index) => (
          <span key={index} onClick={onClick} style={{ cursor: "pointer" }}>
            {segment}
            {index < pathSegments.length - 1 && <span>{"\\"}</span>}
          </span>
        ))}
      </div>
    );
  }
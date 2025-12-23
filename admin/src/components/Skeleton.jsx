export default function Skeleton({ rows = 5, columns = 7 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr className="sk" key={`sk-row-${rowIndex}`}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={`sk-col-${rowIndex}-${colIndex}`}>
              <span className="sk-line" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

import { Link } from "react-router";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: Props) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={item.label}>
            {index < items.length - 1 && item.to ? (
              <>
                <Link to={item.to}>{item.label}</Link>
                <span className="separator" aria-hidden="true">
                  /
                </span>
              </>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

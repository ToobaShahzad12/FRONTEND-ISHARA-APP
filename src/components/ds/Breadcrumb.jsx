import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default function Breadcrumb({ items = [], parentLabel, parentTo }) {
  if (!items.length && !parentTo) return null;

  return (
    <nav aria-label="Breadcrumb">
      {parentTo && (
        <Link to={parentTo} className="ds-breadcrumb-mobile-back">
          <ArrowLeft size={16} strokeWidth={2} className="ds-rtl-flip" aria-hidden="true" />
          <span>{parentLabel || "Back"}</span>
        </Link>
      )}

      <ol className={`ds-breadcrumb ${parentTo ? "ds-breadcrumb--desktop" : ""}`.trim()}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 && (
                <li aria-hidden="true">
                  <ChevronRight size={14} strokeWidth={2} className="ds-rtl-flip" />
                </li>
              )}
              <li>
                {isLast || !item.to ? (
                  <span
                    className={isLast ? "ds-breadcrumb-current" : undefined}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link to={item.to}>{item.label}</Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function makeHref(basePath: string, page: number) {
  return `${basePath}?page=${page}`;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');

  pages.push(total);
  return pages;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <nav className="flex items-center justify-center gap-1 pt-4" aria-label="Pagination">
      {isFirst ? (
        <span className="inline-flex items-center justify-center size-9 rounded-md text-muted-foreground opacity-40 cursor-not-allowed">
          <ChevronLeft className="size-4" />
        </span>
      ) : (
        <Link
          href={makeHref(basePath, currentPage - 1)}
          className="inline-flex items-center justify-center size-9 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Link>
      )}

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="inline-flex items-center justify-center size-9 text-muted-foreground text-sm">
            &hellip;
          </span>
        ) : (
          <Link
            key={page}
            href={makeHref(basePath, page)}
            className={`inline-flex items-center justify-center size-9 rounded-md text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        ),
      )}

      {isLast ? (
        <span className="inline-flex items-center justify-center size-9 rounded-md text-muted-foreground opacity-40 cursor-not-allowed">
          <ChevronRight className="size-4" />
        </span>
      ) : (
        <Link
          href={makeHref(basePath, currentPage + 1)}
          className="inline-flex items-center justify-center size-9 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Link>
      )}
    </nav>
  );
}

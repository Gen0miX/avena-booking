import { BookingFilters } from "@/hooks/usebookings";
import { FaSort } from "react-icons/fa";

interface SortFilterProps {
  filters: BookingFilters;
  updateFilters: (newFilters: Partial<BookingFilters>) => void;
}

export default function SortFilter({
  filters,
  updateFilters,
}: SortFilterProps) {
  const options = [
    { value: "dates:asc", label: "Dates ↑" },
    { value: "dates:desc", label: "Dates ↓" },
    { value: "name:asc", label: "Nom ↑" },
    { value: "name:desc", label: "Nom ↓" },
    { value: "status:asc", label: "Statut ↑" },
    { value: "status:desc", label: "Statut ↓" },
    { value: "price:asc", label: "Prix ↑" },
    { value: "price:desc", label: "Prix ↓" },
  ];

  const currentValue = `${filters.sortBy}:${filters.sortOrder}`;

  return (
    <div className="flex bg-base-300 rounded justify-center items-center border border-primary/50 max-w-48">
      <FaSort className="m-2" size={20}></FaSort>
      <select
        className="select w-full max-w-xs font-p rounded-l-none border-0 border-l border-primary/50"
        value={currentValue}
        onChange={(e) => {
          const [sortBy, sortOrder] = e.target.value.split(":") as [
            typeof filters.sortBy,
            typeof filters.sortOrder,
          ];
          updateFilters({ sortBy, sortOrder });
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="font-p">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

import { BookingFilters } from "@/hooks/usebookings";
import { FaFilter } from "react-icons/fa";

interface StatusFilterProps {
  filters: BookingFilters;
  updateFilters: (newFilters: Partial<BookingFilters>) => void;
}

export default function StatusFilter({
  filters,
  updateFilters,
}: StatusFilterProps) {
  const statusOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: 1, label: "En attente" },
    { value: 2, label: "Confirmée" },
    { value: 3, label: "Terminée" },
    { value: 4, label: "Annulée" },
  ];

  return (
    <div className="flex bg-base-300 rounded justify-center items-center border border-primary/50 max-w-48">
      <FaFilter className="m-2" size={20}></FaFilter>
      <select
        className="select w-full max-w-xs font-p rounded-l-none border-0 border-l border-primary/50"
        value={filters.status}
        onChange={(e) =>
          updateFilters({
            status: e.target.value === "all" ? "all" : parseInt(e.target.value),
          })
        }
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value} className="font-p">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

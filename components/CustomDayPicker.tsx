import {
  DayPicker,
  DateRange,
  DropdownNav,
  Dropdown,
  MonthsDropdown,
} from "react-day-picker";
import { frCH } from "react-day-picker/locale";
import { useEffect, useState } from "react";
import { fetchOccupiedDates } from "@/utils/bookings";

function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isDateInList(date: Date, list: Date[]) {
  const d = normalizeDate(date);
  return list.some((item) => normalizeDate(item).getTime() === d.getTime());
}

type CustomDayPickerProps =
  | {
      mode: "readOnly";
    }
  | {
      mode: "selectable";
      selectedRange: DateRange | undefined;
      onSelect: (range: DateRange | undefined) => void;
    };

export default function CustomDayPicker(props: CustomDayPickerProps) {
  const [occupiedDates, setOccupiedDates] = useState<Date[]>([]);

  useEffect(() => {
    fetchOccupiedDates().then(setOccupiedDates);
  }, []);

  const today = normalizeDate(new Date());

  const handleSelect = (range: DateRange | undefined) => {
    if (props.mode !== "selectable") return;

    if (!range?.from || !range?.to) {
      props.onSelect(range);
      return;
    }

    const current = new Date(range.from);
    const end = new Date(range.to);

    while (current <= end) {
      const normalized = normalizeDate(current);
      if (normalized < today || isDateInList(normalized, occupiedDates)) {
        // Une date invalide est dans la plage => annuler la sélection
        return;
      }
      current.setDate(current.getDate() + 1);
    }
    console.log(range);
    props.onSelect(range);
  };

  if (props.mode === "readOnly") {
    return (
      <DayPicker
        className="react-day-picker self-center sm:scale-110"
        showOutsideDays
        locale={frCH}
        modifiers={{ occupied: occupiedDates }}
        modifiersClassNames={{
          occupied: "occupied",
        }}
      />
    );
  }

  return (
    <DayPicker
      className="react-day-picker"
      showOutsideDays
      locale={frCH}
      mode="range"
      selected={props.selectedRange}
      onSelect={handleSelect}
      required={false}
      disabled={[{ before: today }, today, ...occupiedDates]}
      modifiers={{ occupied: occupiedDates }}
      modifiersClassNames={{
        occupied: "occupied",
        range_start:
          "bg-primary text-primary-content rounded-l-full font-bold hover:text-primary transition-all duration-200",
        range_end:
          "bg-primary text-primary-content rounded-r-full font-bold hover:text-primary transition-all duration-200",
        range_middle: "bg-primary transition-all duration-200",
        selected:
          "bg-primary text-primary-content font-semibold hover:text-primary ",
      }}
    />
  );
}

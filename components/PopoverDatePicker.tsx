import { useState } from "react";
import { DateRange } from "react-day-picker";
import { IoCalendarOutline } from "react-icons/io5";
import CustomDayPicker from "./CustomDayPicker";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";

interface PopoverDatePickerProps {
  selectedRange?: DateRange;
  onSelect: (range: DateRange | undefined) => void;
  className?: string;
  excludeRange?: DateRange; // à ignorer dans l'occupation
  initialMonth?: Date;
}

export default function PopoverDatePicker({
  selectedRange,
  onSelect,
  className = "",
  excludeRange,
  initialMonth,
}: PopoverDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(8),
      flip({
        fallbackAxisSideDirection: "start",
      }),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
    placement: "bottom",
  });

  // Utilisation des hooks d'interactions de Floating UI
  const click = useClick(context, {
    toggle: true,
    ignoreMouse: false,
    event: "mousedown",
  });
  const dismiss = useDismiss(context, {
    enabled: isOpen,
    outsidePress: true,
    outsidePressEvent: "mousedown",
  });
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  // Gère le choix de date
  const handleDateSelect = (range: DateRange | undefined) => {
    onSelect(range);
  };

  // Formatte l'affichage des dates
  const formatDateRange = () => {
    if (selectedRange?.from && selectedRange?.to) {
      return `${selectedRange.from.toLocaleDateString(
        "fr-FR"
      )} - ${selectedRange.to.toLocaleDateString("fr-FR")}`;
    } else if (selectedRange?.from) {
      return selectedRange.from.toLocaleDateString("fr-FR");
    }
    return null;
  };

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        className={`flex items-center gap-2 input input-primary input-border ${className}`}
        type="button"
        aria-label="Sélectionner une période"
      >
        <IoCalendarOutline className="text-xl text-base-content/70" />
        {formatDateRange() || (
          <span className="text-base-content/50">Choisir une période</span>
        )}
      </button>

      <FloatingPortal>
        {isOpen && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-50 rounded-xl border border-primary/50 bg-base-200 shadow-lg p-2"
          >
            <CustomDayPicker
              mode="selectable"
              selectedRange={selectedRange}
              onSelect={handleDateSelect}
              excludeRange={excludeRange}
              initialMonth={initialMonth}
            />
          </div>
        )}
      </FloatingPortal>
    </>
  );
}

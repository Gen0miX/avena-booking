import { useEffect, useState } from "react";
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
}

export default function PopoverDatePicker({
  selectedRange,
  onSelect,
  className = "",
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
    toggle: false,
    ignoreMouse: false,
    event: "mousedown",
  });
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    role,
  ]);

  // Gestion manuelle de la fermeture
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Vérifie si le clic est à l'extérieur du référence ET du floating
      if (
        refs.reference.current &&
        refs.floating.current &&
        refs.reference.current instanceof HTMLElement &&
        !refs.reference.current.contains(target) &&
        !refs.floating.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    // Délai pour éviter la fermeture immédiate
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, refs]);

  // Gère le choix de date et fermeture uniquement si range complet
  const handleDateSelect = (range: DateRange | undefined) => {
    onSelect(range);
    // Ferme seulement si on a une plage complète (from et to)
    if (range?.from && range?.to) {
      setIsOpen(true);
    }
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
            />
          </div>
        )}
      </FloatingPortal>
    </>
  );
}

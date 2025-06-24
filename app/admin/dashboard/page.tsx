import BookingTable from "@/components/BookingTable";
export default function DashboardPage() {
  return (
    <main className="p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-heading font-semibold mb-6">
        Tableau des réservations
      </h1>
      <BookingTable />
    </main>
  );
}

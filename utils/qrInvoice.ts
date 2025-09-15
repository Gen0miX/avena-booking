import { SwissQRBill } from "swissqrbill/pdf";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export interface QRBillData {
  currency: "CHF" | "EUR";
  amount?: number;
  reference?: string;
  unstructuredMessage?: string;
  creditor: {
    name: string;
    address: string;
    buildingNumber?: string;
    zip: number | string;
    city: string;
    country: "CH" | "LI";
    account: string;
  };
  debtor: {
    name: string;
    address: string;
    buildingNumber: string;
    zip: number | string;
    city: string;
    country: "CH" | "LI";
  };
}

export async function generateQRBillPDF(data: QRBillData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];

      // Créer un nouveau document PDF
      const pdf = new PDFDocument({
        size: "A4",
        margin: 0,
        font: path.join(process.cwd(), "public", "fonts", "WorkSans.ttf"),
      });

      const fontPath = path.join(
        process.cwd(),
        "public",
        "fonts",
        "WorkSans.ttf"
      );
      pdf.registerFont("Helvetica", fs.readFileSync(fontPath));
      pdf.registerFont("Helvetica-Bold", fs.readFileSync(fontPath));
      pdf.registerFont("Helvetica-Oblique", fs.readFileSync(fontPath));

      // Créer la QR Bill
      const qrBill = new SwissQRBill(data, { language: "FR" });

      // Attacher la QR Bill au document PDF
      qrBill.attachTo(pdf);

      // Collecter les chunks du PDF
      pdf.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      pdf.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      pdf.on("error", (error: Error) => {
        reject(error);
      });

      // Finaliser le document
      pdf.end();
    } catch (error) {
      reject(error);
    }
  });
}

// 3. Fonction spécifique pour vos réservations
export async function createBookingQRBill(bookingData: {
  fname: string;
  lname: string;
  price: number;
  bookingId: number;
}): Promise<Buffer> {
  // Convertir le prix en nombre si c'est une chaîne
  const amount =
    typeof bookingData.price === "string"
      ? parseFloat(bookingData.price)
      : bookingData.price;

  const qrBillData: QRBillData = {
    currency: "CHF",
    amount: amount,
    unstructuredMessage: `Réservation #${bookingData.bookingId} - ${bookingData.fname} ${bookingData.lname}`,
    creditor: {
      name: "Réganély Noémie",
      address: "Ch. de Beaulieu",
      buildingNumber: "1",
      zip: "1752",
      city: "Villars-sur-Glâne",
      country: "CH",
      account: "CH64 0076 8125 0290 8410 3",
    },
    debtor: {
      name: `${bookingData.fname} ${bookingData.lname}`,
      address: "",
      buildingNumber: "",
      zip: "",
      city: "",
      country: "CH",
    },
  };

  return generateQRBillPDF(qrBillData);
}

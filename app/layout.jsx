import "./globals.css";

export const metadata = {
  title: "Mentor Board",
  description: "Твой персональный ментор",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}

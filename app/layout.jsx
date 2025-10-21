export const metadata = {
  title: "Mentor Web UI",
  description: "Adaptive AI Mentor Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, padding: 0, fontFamily: 'sans-serif', background: '#f9fafb' }}>
        {children}
      </body>
    </html>
  );
}

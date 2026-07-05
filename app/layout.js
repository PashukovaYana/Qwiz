import "./globals.css";
import { Inter, Space_Grotesk } from "next/font/google";

// Шрифты подключаем через next/font — они скачиваются при сборке и раздаются
// с нашего сервера (без обращения к Google в рантайме).
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Метаданные вкладки браузера
export const metadata = {
  title: "Quiz Arena — квизы в реальном времени",
  description: "Платформа для проведения квизов в реальном времени",
};

// Общий каркас всех страниц
export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  const filePath = path.join(process.cwd(), "legal", "privacy.md");
  const markdown = fs.readFileSync(filePath, "utf-8");

  return (
    <div className="min-h-screen bg-[#181818] flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-2 pt-20">
        <div className="w-full max-w-2xl bg-[#232323] rounded-xl shadow-lg p-8 border border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Privacy Policy
          </h1>
          <article className="prose prose-invert prose-lg max-w-none text-gray-200">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
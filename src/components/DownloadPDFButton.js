import { toast } from 'react-toastify';
import ReactDOMServer from 'react-dom/server';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import RecipePDF from './RecipePDF';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DownloadPDFButton({
  recipe,
  user,
  downloadsToday,
  setDownloadsToday,
}) {
  // Helper: Convert image URL to Base64 data URL
  async function toBase64(url) {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert image to Base64:', error);
      return null;
    }
  }

  const handleDownloadPDF = async () => {
    if (!recipe) return;

    // --- Restrict guests ---
    if (!user) {
      toast.error('Please log in to download PDFs.');
      return;
    }

    // --- Placeholder for premium logic ---
    const isPremium = user.isPremium;

    // --- Download limit logic ---
    const today = new Date().toISOString().slice(0, 10);
    const statRef = doc(db, 'users', user.uid, 'downloadStats', today);
    const statSnap = await getDoc(statRef);
    const count = statSnap.exists() ? statSnap.data().count : 0;

    if (!user.isPremium && count >= 3) {
      toast.info(
        'You have reached your daily download limit. Upgrade to premium for unlimited downloads!'
      );
      return;
    }

    // --- Increment count in Firestore ---
    await setDoc(statRef, { count: count + 1 }, { merge: true });
    setDownloadsToday((prev) => prev + 1);

    // --- PDF generation logic (your existing code) ---
    // Convert recipe image to base64 for CORS-safe rendering
    let imageDataUrl = null;
    if (recipe.image?.url) {
      imageDataUrl = await toBase64(recipe.image.url);
      if (!imageDataUrl) {
        imageDataUrl = '/assets/placeholder.jpg';
      }
    }

    // Render RecipePDF to static HTML
    const htmlString = ReactDOMServer.renderToStaticMarkup(
      <RecipePDF
        recipe={{
          ...recipe,
          image: { ...recipe.image, url: imageDataUrl || recipe.image?.url },
        }}
      />
    );

    // Create temp div and set innerHTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '794px'; // A4 width at 96dpi
    tempDiv.style.background = '#FFF8E7';
    document.body.appendChild(tempDiv);

    // Wait for all images in tempDiv to load
    const images = tempDiv.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            })
      )
    );
    await new Promise((r) => setTimeout(r, 100));

    // --- Find the instructions container and steps ---
    let instructionsBox = tempDiv.querySelector('.fh254-instructions-outer');
    if (instructionsBox) instructionsBox = instructionsBox.closest('div');
    const instructionSteps = tempDiv.querySelectorAll(
      '.fh254-instruction-step, ol > li'
    );

    // --- Render the top section (everything above instructions) ---
    let topSectionHeight = 0;
    if (instructionsBox) {
      topSectionHeight = instructionsBox.offsetTop;
    }
    if (!topSectionHeight || topSectionHeight < 10) {
      const instructionsHeading = Array.from(
        tempDiv.querySelectorAll('h2')
      ).find((h) => h.textContent?.toLowerCase().includes('instruction'));
      if (instructionsHeading) {
        topSectionHeight = instructionsHeading.offsetTop;
      } else {
        topSectionHeight = tempDiv.offsetHeight - 1;
      }
    }
    if (!topSectionHeight || topSectionHeight < 10) {
      alert('Could not determine top section height for PDF export.');
      document.body.removeChild(tempDiv);
      return;
    }

    const topSectionCanvas = await html2canvas(tempDiv, {
      useCORS: true,
      backgroundColor: '#FFF8E7',
      width: 794,
      height: topSectionHeight,
      windowWidth: 794,
    });

    // --- Prepare PDF ---
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFillColor(255, 248, 231); // #FFF8E7
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    const headerHeightMm = 18;
    const footerHeightMm = 16;
    const pxToMm = pageWidth / topSectionCanvas.width;

    // --- Prepare logo for header ---
    const logoUrl = '/assets/flavorhubicon.png';
    let logoBase64 = null;
    try {
      const resp = await fetch(logoUrl);
      const blob = await resp.blob();
      logoBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      logoBase64 = null;
    }

    function drawHeaderFooter(pdf, pageNum, totalPages) {
      pdf.setFillColor(255, 248, 231);
      pdf.rect(0, 0, pageWidth, headerHeightMm, 'F');
      const logoSize = 7;
      const logoY = 6;
      const logoX = 4;
      if (logoBase64) {
        pdf.addImage(logoBase64, 'PNG', logoX, logoY, logoSize, logoSize);
      }
      let textX = logoX + logoSize + 2;
      const baseY = logoY + logoSize - 1;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#232323');
      pdf.text('flavor', textX, baseY, { baseline: 'bottom' });
      const flavorWidth = pdf.getTextWidth('flavor');
      textX += flavorWidth;
      pdf.setTextColor('#D32F2F');
      pdf.text('HUB', textX, baseY, { baseline: 'bottom' });
      const hubWidth = pdf.getTextWidth('HUB');
      textX += hubWidth;
      pdf.setTextColor('#2E7D32');
      pdf.text('254', textX, baseY, { baseline: 'bottom' });
      pdf.setTextColor('#232323');
      const footerTop = pageHeight - footerHeightMm;
      pdf.setFillColor(240, 240, 240);
      pdf.rect(0, footerTop, pageWidth, footerHeightMm, 'F');
      const footerY = footerTop + footerHeightMm / 2 + 2;
      pdf.setFontSize(11);
      pdf.setTextColor('#2E7D32');
      pdf.setFont('helvetica', 'normal');
      pdf.text('© 2025 flavorHUB254', 10, footerY);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#232323');
      pdf.text(recipe.title, pageWidth / 2, footerY, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor('#D32F2F');
      pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 10, footerY, {
        align: 'right',
      });
      pdf.setTextColor('#232323');
    }

    drawHeaderFooter(pdf, 1, 1);
    let y = headerHeightMm;
    const topSectionHeightMm = topSectionCanvas.height * pxToMm;
    pdf.addImage(
      topSectionCanvas.toDataURL('image/png'),
      'PNG',
      0,
      y,
      pageWidth,
      topSectionHeightMm
    );
    y += topSectionHeightMm;

    let pageNum = 1;
    let instructionImages = [];
    for (let i = 0; i < instructionSteps.length; i++) {
      const li = instructionSteps[i];
      const liCanvas = await html2canvas(li, {
        useCORS: true,
        backgroundColor: '#fff',
        width: li.offsetWidth,
        height: li.offsetHeight,
        windowWidth: li.offsetWidth,
      });
      const liHeightMm = liCanvas.height * pxToMm;
      instructionImages.push({
        img: liCanvas.toDataURL('image/png'),
        heightMm: liHeightMm,
      });
    }
    const instructionsCanvas = await html2canvas(instructionsBox, {
      useCORS: true,
      backgroundColor: '#FFF8E7',
      width: instructionsBox.offsetWidth,
      height: instructionsBox.offsetHeight,
      windowWidth: instructionsBox.offsetWidth,
    });

    for (let i = 0; i < instructionImages.length; i++) {
      const { img, heightMm } = instructionImages[i];
      if (y + heightMm > pageHeight - footerHeightMm - 2) {
        pdf.addPage();
        pageNum++;
        pdf.setFillColor(255, 248, 231);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        drawHeaderFooter(pdf, pageNum, 1);
        y = headerHeightMm;
      }
      pdf.addImage(img, 'PNG', 18, y, pageWidth - 36, heightMm);
      y += heightMm + 0.5;
    }

    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      drawHeaderFooter(pdf, i, totalPages);
    }

    pdf.save(`FlavorHUB254-${recipe.title.replace(/\s+/g, '_')}.pdf`);
    document.body.removeChild(tempDiv);
  };

  return (
    <button
      className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-2 py-2 rounded-lg font-semibold text-sm transition"
      onClick={handleDownloadPDF}
    >
      <svg className="w-5 h-5" viewBox="0 0 512 512" fill="none">
        {/* ...icon SVG... */}
        <svg className="w-5 h-5" viewBox="0 0 512 512" fill="none">
          <polygon
            fill="#B12A27"
            points="475.435,117.825 475.435,512 47.791,512 47.791,0.002 357.613,0.002 412.491,54.881"
          />
          <rect
            x="36.565"
            y="34.295"
            width="205.097"
            height="91.768"
            fill="#F2F2F2"
          />
          <polygon
            opacity="0.08"
            fill="#040000"
            points="475.435,117.825 475.435,512 47.791,512 47.791,419.581 247.705,219.667 259.54,207.832 266.098,201.273 277.029,190.343 289.995,177.377 412.491,54.881"
          />
          <polygon
            fill="#771B1B"
            points="475.435,117.836 357.599,117.836 357.599,0"
          />
        </svg>
      </svg>
      Download PDF
    </button>
  );
}

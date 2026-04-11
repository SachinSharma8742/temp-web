import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ── Contact Info ──
const BRAND = 'Design Your India';
const EMAIL = 'designyourindia@gmail.com';
const PHONE = '+91 96495 50551';
const WHATSAPP = '+91 99990 22503';
const WEBSITE = 'www.designyourindia.com';

/**
 * Load an image as base64 Data URL for jsPDF.
 */
function loadImageAsDataURL(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Downscale to keep PDF size manageable
      const maxSize = 200;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Strip timestamp junk from parsed activities.
 */
function cleanActivity(text) {
  if (!text) return null;
  if (/^\[\d+:\d+\s*(am|pm),/.test(text)) return null;
  if (/^Design Your India/i.test(text.trim())) return null;
  if (/^\d+\s*Night/i.test(text.trim()) && text.trim().length < 30) return null;
  return text;
}

/**
 * Format price string to "Rs. XX,XXX"
 */
function formatPrice(str) {
  if (!str) return null;
  const digits = str.replace(/[^\d]/g, '');
  if (!digits) return null;
  return `Rs. ${Number(digits).toLocaleString('en-IN')}`;
}

/**
 * Main PDF generator.
 */
export async function generateItineraryPDF({ destinationName, subtitle, packageData }) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const PW = doc.internal.pageSize.getWidth();   // 210
  const PH = doc.internal.pageSize.getHeight();   // 297
  const M = 16;
  const W = PW - M * 2;

  // Colors
  const BLUE = [30, 64, 175];
  const DARK = [15, 23, 42];
  const MID = [71, 85, 105];
  const LIGHT = [100, 116, 139];
  const BG = [241, 245, 249];
  const WHITE = [255, 255, 255];
  const ACCENT = [59, 130, 246];

  // ── Load logo ──
  let logoData = null;
  try {
    logoData = await loadImageAsDataURL('/logo.png');
  } catch (e) { /* silently skip logo */ }

  // ── Footer ──
  const addFooter = (pageNum) => {
    doc.setFillColor(...BG);
    doc.rect(0, PH - 11, PW, 11, 'F');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...LIGHT);
    doc.text(`${BRAND}  |  ${EMAIL}  |  ${PHONE}`, M, PH - 4.5);
    doc.text(`${pageNum}`, PW - M, PH - 4.5, { align: 'right' });
  };

  // ── Page break helper ──
  const ensureSpace = (y, needed = 30) => {
    if (y + needed > PH - 16) {
      addFooter(doc.internal.getNumberOfPages());
      doc.addPage();
      return 16;
    }
    return y;
  };

  // ═══════════════════════════════════════════════════════════════════════
  // COVER PAGE
  // ═══════════════════════════════════════════════════════════════════════

  // Blue header
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, PW, 96, 'F');

  // Accent bar
  doc.setFillColor(...ACCENT);
  doc.rect(0, 96, PW, 2, 'F');

  // Logo (top-left corner of the blue band)
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', M, 8, 18, 18);
    } catch (e) { /* skip */ }
  }

  // Brand name (next to logo)
  const brandX = logoData ? M + 22 : M;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...WHITE);
  doc.text('DESIGN YOUR INDIA', brandX, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(200, 215, 240);
  doc.text('Crafting Extraordinary Journeys Across India', brandX, 24);

  // Destination name — big hero
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(...WHITE);
  const destLines = doc.splitTextToSize(destinationName.toUpperCase(), W - 4);
  doc.text(destLines, M, 48);

  // Subtitle
  let heroBottomY = 48 + destLines.length * 11;
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(200, 215, 255);
    doc.text(subtitle, M, heroBottomY);
    heroBottomY += 8;
  }

  // Package title text inside the blue band
  if (heroBottomY < 90) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(180, 200, 240);
    const pkgLines = doc.splitTextToSize(packageData.title, W - 4);
    doc.text(pkgLines, M, heroBottomY + 2);
  }

  // ── Below header: Package Title + Info Cards ──
  let y = 106;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  const titleLines = doc.splitTextToSize(packageData.title, W);
  doc.text(titleLines, M, y);
  y += titleLines.length * 6 + 6;

  // Price + Duration cards side by side
  const price = formatPrice(packageData.price);
  const numDays = packageData.days?.length || 0;
  const cardW = (W - 6) / 2;

  // Price card
  doc.setFillColor(...BG);
  doc.roundedRect(M, y, cardW, 22, 2, 2, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...LIGHT);
  doc.text('STARTING FROM', M + 6, y + 8);
  if (price) {
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLUE);
    doc.text(price, M + 6, y + 16);
    // "per person" on separate line to avoid overlap
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...LIGHT);
    doc.text('per person', M + 6, y + 20.5);
  } else {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLUE);
    doc.text('Contact Us', M + 6, y + 17);
  }

  // Duration card
  const dx = M + cardW + 6;
  doc.setFillColor(...BG);
  doc.roundedRect(dx, y, cardW, 22, 2, 2, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...LIGHT);
  doc.text('DURATION', dx + 6, y + 8);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(numDays > 0 ? `${numDays} Days` : 'Flexible', dx + 6, y + 17);

  y += 30;

  // ═══════════════════════════════════════════════════════════════════════
  // ITINERARY SECTION HEADER
  // ═══════════════════════════════════════════════════════════════════════

  doc.setFillColor(...DARK);
  doc.roundedRect(M, y, W, 8.5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...WHITE);
  doc.text('DETAILED DAY-WISE ITINERARY', M + 5, y + 5.8);
  y += 14;

  // ═══════════════════════════════════════════════════════════════════════
  // DAY-BY-DAY
  // ═══════════════════════════════════════════════════════════════════════

  packageData.days.forEach((day, idx) => {
    const dayNum = day.day || idx + 1;
    const dayTitle = day.title || `Day ${dayNum}`;
    const activities = (day.activities || []).map(cleanActivity).filter(Boolean);
    const highlight = day.highlight || '';

    // Estimate height
    let estH = 12;
    activities.forEach(act => {
      const lines = doc.splitTextToSize(act, W - 16);
      estH += lines.length * 4.2 + 1.2;
    });
    if (highlight) estH += 10;

    y = ensureSpace(y, Math.min(estH, 55));

    // Day badge
    doc.setFillColor(...BLUE);
    doc.roundedRect(M, y, 15, 6.5, 1.2, 1.2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...WHITE);
    doc.text(`DAY ${dayNum}`, M + 2, y + 4.5);

    // Day title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...DARK);
    const dtLines = doc.splitTextToSize(dayTitle, W - 20);
    doc.text(dtLines, M + 19, y + 4.5);
    y += Math.max(dtLines.length * 4.5, 7) + 4;

    // Activities
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MID);

    activities.forEach(activity => {
      y = ensureSpace(y, 8);
      const lines = doc.splitTextToSize(activity, W - 16);
      lines.forEach((line, li) => {
        y = ensureSpace(y, 5);
        if (li === 0) {
          doc.setFillColor(...ACCENT);
          doc.circle(M + 4.5, y - 0.8, 0.7, 'F');
        }
        doc.text(line, M + 9, y);
        y += 4;
      });
      y += 0.8;
    });

    // Highlight
    if (highlight) {
      y = ensureSpace(y, 12);
      const hlText = `Highlight: ${highlight}`;
      const hlLines = doc.splitTextToSize(hlText, W - 14);
      const hlH = hlLines.length * 4 + 4;
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(M + 2, y - 1, W - 4, hlH, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bolditalic');
      doc.setFontSize(7);
      doc.setTextColor(...BLUE);
      hlLines.forEach(line => {
        doc.text(line, M + 6, y + 2.5);
        y += 4;
      });
      y += 3;
    }

    // Separator
    y += 2;
    doc.setDrawColor(225, 230, 240);
    doc.setLineWidth(0.15);
    doc.line(M, y, PW - M, y);
    y += 5;
  });

  // ═══════════════════════════════════════════════════════════════════════
  // INCLUSIONS
  // ═══════════════════════════════════════════════════════════════════════

  const GOLD = [197, 165, 114]; // Brand Gold
  const NEUTRAL = [100, 116, 139]; // Muted Slate

  const inclusions = [
    'Accommodation in Hotel / Camp as per itinerary',
    'Volvo tickets both side (if required)',
    'Buffet breakfast and dinner on all days',
    'Highly-Experienced driver cum guide',
    'Sightseeing as per itinerary',
    'All toll tax, parking, fuel and driver allowances',
    'Any Permit fee if required',
    'All applicable taxes',
    'Comfortable and hygienic vehicle for sightseeing on all days as per the itinerary (as per group size)',
  ];

  const exclusions = [
    '5% GST',
    'Train or Airfare',
    'Personal Expenses like Entry charges, Telephone, Fax, Internet, Laundry, etc.',
    'Any Extra Meals',
    'Any extra excursions or sightseeing apart from the tour itinerary',
    'Any entry fees for the museum, park, Jeep safari or anything else',
    'Room Heater Charges',
    'Insurance',
    'Anything which is not included in the inclusion',
    'Expenses caused by factors beyond our control like rail and flight delays, roadblocks, vehicle malfunctions, political disturbances etc.',
    'We shall not be responsible for any delays & alterations in the programme or expenses incurred – directly or indirectly – due to natural hazards, flight cancellations, weather, sickness, landslides, political closures (Strike, Hartal, Bandh) or any untoward incidents.',
  ];

  // Inclusions header
  y = ensureSpace(y, 20);
  doc.setFillColor(252, 250, 245); // Very light gold tint
  doc.roundedRect(M, y, W, 8.5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text('INCLUSIONS', M + 5, y + 5.8);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...MID);
  inclusions.forEach(item => {
    y = ensureSpace(y, 6);
    doc.setTextColor(...GOLD);
    doc.text('\u2022', M + 4, y); // Bullet
    doc.setTextColor(...MID);
    const lines = doc.splitTextToSize(item, W - 14);
    lines.forEach(line => {
      doc.text(line, M + 10, y);
      y += 4;
    });
    y += 1;
  });

  y += 4;

  // Exclusions header
  y = ensureSpace(y, 20);
  doc.setFillColor(...BG); // Pure neutral tint
  doc.roundedRect(M, y, W, 8.5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text('EXCLUSIONS', M + 5, y + 5.8);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...NEUTRAL);
  exclusions.forEach(item => {
    y = ensureSpace(y, 6);
    doc.setTextColor(...NEUTRAL);
    doc.text('\u2022', M + 4, y); // Bullet
    doc.setTextColor(...NEUTRAL);
    const lines = doc.splitTextToSize(item, W - 14);
    lines.forEach(line => {
      doc.text(line, M + 10, y);
      y += 3.8;
    });
    y += 1;
  });

  y += 6;

  // ═══════════════════════════════════════════════════════════════════════
  // CONTACT CARD (end of itinerary)
  // ═══════════════════════════════════════════════════════════════════════

  y = ensureSpace(y, 48);

  // Card background
  doc.setFillColor(...BLUE);
  doc.roundedRect(M, y, W, 40, 3, 3, 'F');

  // Heading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...WHITE);
  doc.text('Ready to Book This Journey?', M + 8, y + 11);

  // Subtext
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 215, 255);
  doc.text('Contact our tour specialists for customized pricing and availability.', M + 8, y + 18);

  // Contact details
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text(`Email: ${EMAIL}`, M + 8, y + 26);
  doc.text(`Phone: ${PHONE}`, M + 8, y + 32);
  doc.text(`WhatsApp: ${WHATSAPP}`, M + W / 2, y + 32);

  // ═══════════════════════════════════════════════════════════════════════
  // ADD FOOTERS/HEADERS TO ALL PAGES
  // ═══════════════════════════════════════════════════════════════════════

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i);
    
    // Pro Header on every page
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    if (i > 1) {
      doc.text(BRAND, M, 10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...LIGHT);
      doc.text(`Contact: ${PHONE} | @designyourindia`, PW - M, 10, { align: 'right' });
      
      // Fine thin line under header
      doc.setDrawColor(...BG);
      doc.setLineWidth(0.1);
      doc.line(M, 12, PW - M, 12);
    }
  }

  // ── Download ──
  const fileName = `${destinationName.replace(/\s+/g, '-')}-Itinerary.pdf`;
  doc.save(fileName);
}


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'mr';

export interface Translations {
  // Navigation
  navHome: string;
  navCategories: string;
  navPhoto: string;
  navDots: string;
  navMath: string;
  navTracing: string;
  navPuzzles: string;
  navBook: string;
  navShop: string;
  navAdmin: string;
  cart: string;

  // Hero
  tagline: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  startFree: string;
  exploreCategories: string;
  myBook: string;

  // How it works
  howItWorks: string;
  howItWorksSub: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;

  // Studios Header
  studiosTitle: string;
  studiosSub: string;
  launchStudio: string;

  // Photo Studio
  photoTitle: string;
  photoSub: string;
  uploadPhoto: string;
  instantSamples: string;
  aiPromptTitle: string;
  aiPromptPlaceholder: string;
  enhanceBtn: string;
  stylePreset: string;
  sensitivity: string;
  thickness: string;
  brightness: string;
  contrast: string;
  addToBook: string;
  downloadPng: string;

  // Dots Studio
  dotsTitle: string;
  dotsSub: string;
  chooseSubject: string;
  dotCountLabel: string;
  guideLines: string;
  uploadCustomDots: string;
  marathiNumbersToggle: string;

  // Math Studio
  mathTitle: string;
  mathSub: string;
  ageBracket: string;
  showAnswerKey: string;
  newProblems: string;

  // Tracing Studio
  tracingTitle: string;
  tracingSub: string;
  tracingType: string;
  charsToTrace: string;

  // Puzzles Studio
  puzzlesTitle: string;
  puzzlesSub: string;
  puzzleType: string;
  wordSearch: string;
  maze: string;
  wordTheme: string;
  newGrid: string;

  // Book Builder
  bookTitle: string;
  bookSub: string;
  coverSettings: string;
  titleInput: string;
  subtitleInput: string;
  childNameInput: string;
  themeInput: string;
  pageSize: string;
  orientation: string;
  emptyBookTitle: string;
  emptyBookDesc: string;
  downloadPdfBtn: string;

  // Store
  storeTitle: string;
  storeSub: string;
  allProducts: string;
  digitalPdfs: string;
  physicalBooks: string;
  addToCart: string;
  checkout: string;
  subtotal: string;
  discount: string;
  total: string;

  // Admin
  adminTitle: string;
  adminSub: string;
  authRequired: string;
  pinPlaceholder: string;
  unlockBtn: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    navHome: 'Home',
    navCategories: 'Categories',
    navPhoto: 'Photo to Outline',
    navDots: 'Connect Dots',
    navMath: 'Maths Studio',
    navTracing: 'Tracing',
    navPuzzles: 'Puzzles & Mazes',
    navBook: 'My Book',
    navShop: 'Shop',
    navAdmin: 'Admin',
    cart: 'Cart',

    tagline: 'Create, Learn, Color & Play!',
    heroBadge: 'Zero-Budget • 100% Client-Side Engine • Print-Ready',
    heroTitle: 'Create Your Own Magical Learning & Coloring Books!',
    heroSubtitle: 'Turn your imagination, family photos, and educational goals into beautiful coloring pages, numbered connect-the-dots, verified maths worksheets, and custom printable books.',
    startFree: 'Start Creating Free',
    exploreCategories: 'Explore 15 Activities',
    myBook: 'My Book',

    howItWorks: 'How It Works',
    howItWorksSub: 'Simple 3-step creation process for parents and teachers.',
    step1Title: 'Choose or Upload',
    step1Desc: 'Pick from 15 activity types or upload any family photo, toy, or pet image.',
    step2Title: 'Customize & Generate',
    step2Desc: 'Adjust outline thickness, dot counts, math levels, or tracing guide letters.',
    step3Title: 'Compile & Print',
    step3Desc: 'Add pages to your custom activity book and export a print-ready A4/Letter PDF.',

    studiosTitle: 'Interactive Creation Studios',
    studiosSub: 'All engines run locally in the browser with zero paid subscriptions.',
    launchStudio: 'Launch Studio',

    photoTitle: 'Turn Your Photo Into a Coloring Page',
    photoSub: 'Upload family photos, drawings, pets, or cars. Runs 100% in your browser with zero paid API costs.',
    uploadPhoto: 'Upload Photo (JPG, PNG, WEBP)',
    instantSamples: 'Or Try Instant Samples:',
    aiPromptTitle: 'AI Coloring Prompt & Idea Assistant',
    aiPromptPlaceholder: 'e.g. Space cat on Mars, Princess dragon',
    enhanceBtn: 'Enhance',
    stylePreset: 'Coloring Style',
    sensitivity: 'Outline Sensitivity',
    thickness: 'Line Thickness',
    brightness: 'Brightness',
    contrast: 'Contrast',
    addToBook: 'Add to My Activity Book',
    downloadPng: 'Download PNG',

    dotsTitle: 'Connect the Dots Generator',
    dotsSub: 'Sequential numbered dots following real geometric contours without random placements.',
    chooseSubject: 'Choose Subject Outline',
    dotCountLabel: 'Difficulty / Number of Dots',
    guideLines: 'Display Light Dotted Guide Lines',
    uploadCustomDots: 'Or Upload Photo to Extract Dots',
    marathiNumbersToggle: 'Marathi Numerals (१, २, ३...)',

    mathTitle: 'Educational Maths Worksheet Generator',
    mathSub: '100% programmatically validated equations without fractional remainders or negative subtraction errors.',
    ageBracket: 'Age Bracket',
    showAnswerKey: 'Reveal Answer Key Overlay',
    newProblems: 'Generate New Problem Set',

    tracingTitle: 'Handwriting & Tracing Studio',
    tracingSub: 'Standardized elementary 3-line ruling with green directional stroke-start indicators.',
    tracingType: 'Category',
    charsToTrace: 'Characters to Trace (Up to 4)',

    puzzlesTitle: 'Puzzles & Brain Games Studio',
    puzzlesSub: 'Algorithmic word search puzzles and guaranteed solvable single-path mazes.',
    puzzleType: 'Puzzle Type',
    wordSearch: 'Word Search',
    maze: 'Maze Labyrinth',
    wordTheme: 'Word Bank Theme',
    newGrid: 'Generate New Grid',

    bookTitle: 'Personalized Activity Book Builder',
    bookSub: 'Reorder pages, personalize title and child\'s name, then export a print-ready PDF book.',
    coverSettings: 'Cover & Layout Settings',
    titleInput: 'Book Title',
    subtitleInput: 'Subtitle',
    childNameInput: 'Child\'s Name (Personalized Badge)',
    themeInput: 'Book Theme',
    pageSize: 'Paper Size',
    orientation: 'Orientation',
    emptyBookTitle: 'Your Activity Book is currently empty',
    emptyBookDesc: 'Visit Photo-to-Coloring, Connect Dots, Maths, or Tracing studios and click "Add to My Activity Book".',
    downloadPdfBtn: 'Download Printable Book',

    storeTitle: 'ColorCraft Educational Store',
    storeSub: 'Printable digital curriculum bundles and physical book previews. (Payment gateway in Demo Mode).',
    allProducts: 'All Products',
    digitalPdfs: 'Digital PDFs',
    physicalBooks: 'Physical Books',
    addToCart: 'Add to Cart',
    checkout: 'Complete Test Checkout',
    subtotal: 'Subtotal',
    discount: 'Discount',
    total: 'Total',

    adminTitle: 'ColorCraft Administration & Telemetry',
    adminSub: 'System verification status, local resource footprint, and operations control.',
    authRequired: 'Admin Authorization Required',
    pinPlaceholder: 'Enter PIN (Demo: 7788)',
    unlockBtn: 'Unlock Dashboard',
  },
  mr: {
    navHome: 'मुख्यपृष्ठ',
    navCategories: 'सर्व प्रकार',
    navPhoto: 'फोटो ते रेखाचित्र',
    navDots: 'ठिपके जोडा',
    navMath: 'गणित कार्यपत्रिका',
    navTracing: 'अक्षर गिरवा',
    navPuzzles: 'कोडी व भुलभुलैया',
    navBook: 'माझे पुस्तक',
    navShop: 'दुकान',
    navAdmin: 'अ‍ॅडमिन',
    cart: 'कार्ट',

    tagline: 'तयार करा, शिका, रंगवा आणि खेळा!',
    heroBadge: 'शून्य खर्च • १००% ब्राउझर-आधारित • प्रिंटसाठी तयार',
    heroTitle: 'तुमचे स्वतःचे जादुई शिक्षण आणि रंगभरण पुस्तक बनवा!',
    heroSubtitle: 'तुमची कल्पनाशक्ती, कौटुंबिक फोटो आणि शैक्षणिक ध्येये सुंदर रंगीत पाने, ठिपके जोडा, पडताळलेले गणित वर्कशीट आणि प्रिंट करता येणाऱ्या पुस्तकात रूपांतरित करा.',
    startFree: 'मोफत तयार करायला सुरुवात करा',
    exploreCategories: '१५ शैक्षणिक उपक्रम पहा',
    myBook: 'माझे पुस्तक',

    howItWorks: 'हे कसे कार्य करते',
    howItWorksSub: 'पालक आणि शिक्षकांसाठी सोपी ३-टप्प्यांची निर्मिती प्रक्रिया.',
    step1Title: 'निवडा किंवा अपलोड करा',
    step1Desc: '१५ उपक्रमांमधून निवडा किंवा कोणताही कौटुंबिक फोटो, खेळणे किंवा पाळीव प्राण्याचा फोटो अपलोड करा.',
    step2Title: 'सानुकूलित करा व तयार करा',
    step2Desc: 'रेषांची जाडी, ठिपक्यांची संख्या, गणिताची पातळी किंवा गिरवण्यासाठी अक्षरे बदला.',
    step3Title: 'संकलित करा व प्रिंट करा',
    step3Desc: 'तुमच्या वैयक्तिक पुस्तकात पृष्ठे जोडा आणि उच्च-गुणवत्तेची A4/Letter PDF डाउनलोड करा.',

    studiosTitle: 'परस्परसंवादी निर्मिती स्टुडिओ',
    studiosSub: 'कोणत्याही सशुल्क वर्गणीशिवाय सर्व इंजिन थेट ब्राउझरमध्ये मोफत चालतात.',
    launchStudio: 'स्टुडिओ सुरू करा',

    photoTitle: 'तुमच्या फोटोचे रंगभरणी पानामध्ये रूपांतर करा',
    photoSub: 'कौटुंबिक फोटो, चित्रे, प्राणी किंवा वाहने अपलोड करा. शून्य खर्चात थेट ब्राउझरमध्ये चालते.',
    uploadPhoto: 'फोटो अपलोड करा (JPG, PNG, WEBP)',
    instantSamples: 'किंवा नमुना फोटो वापरून पहा:',
    aiPromptTitle: 'AI चित्र कल्पना सहाय्यक',
    aiPromptPlaceholder: 'उदा. मंगळावर मांजर, बागेतील ससा',
    enhanceBtn: 'सुधारा',
    stylePreset: 'रंगभरण शैली',
    sensitivity: 'रेषा संवेदनशीलता',
    thickness: 'रेषेची जाडी',
    brightness: 'प्रकाशाची तीव्रता',
    contrast: 'कॉन्ट्रास्ट',
    addToBook: 'माझ्या अ‍ॅक्टिव्हिटी पुस्तकात जोडा',
    downloadPng: 'PNG डाउनलोड करा',

    dotsTitle: 'संख्या ठिपके जोडा जनरेटर',
    dotsSub: 'प्रत्यक्ष भौमितिक आकारांनुसार अनुक्रमिक ठिपके जोडून सुंदर चित्र प्रकट करा.',
    chooseSubject: 'चित्राचा आकार निवडा',
    dotCountLabel: 'काठिण्य पातळी / ठिपक्यांची संख्या',
    guideLines: 'हलक्या तुटक मार्गदर्शक रेषा दाखवा',
    uploadCustomDots: 'किंवा ठिपक्यांसाठी स्वतःचा फोटो अपलोड करा',
    marathiNumbersToggle: 'मराठी अंक (१, २, ३...) वापरा',

    mathTitle: 'शैक्षणिक गणित कार्यपत्रिका जनरेटर',
    mathSub: 'अपूर्णांक किंवा वजाबाकीच्या चुका नसलेले १००% संगणकीय पडताळणी केलेले गणित प्रश्न.',
    ageBracket: 'वयोगट',
    showAnswerKey: 'उत्तर तालिका (Answer Key) दाखवा',
    newProblems: 'नवीन प्रश्न संच तयार करा',

    tracingTitle: 'हस्ताक्षर व अक्षरलेखन सराव स्टुडिओ',
    tracingSub: 'शालेय नियमांनुसार प्रमाणित ३-रेषा पद्धत आणि दिशादर्शक हिरवे ठिपके.',
    tracingType: 'प्रकार निवडा',
    charsToTrace: 'गिरवण्यासाठी अक्षरे / अंक (जास्तीत जास्त ४)',

    puzzlesTitle: 'शब्द शोध आणि भुलभुलैया (Mazes)',
    puzzlesSub: 'बुद्धिमत्ता वाढवणारे शब्द शोध कोडी आणि अचूक मार्ग असलेली भूलभूलैय्या कोडी.',
    puzzleType: 'कोड्याचा प्रकार',
    wordSearch: 'शब्द शोध (Word Search)',
    maze: 'भुलभुलैया (Labyrinth Maze)',
    wordTheme: 'शब्दांची थीम',
    newGrid: 'नवीन कोडे तयार करा',

    bookTitle: 'वैयक्तिकृत अ‍ॅक्टिव्हिटी पुस्तक निर्माता',
    bookSub: 'पृष्ठांचा क्रम बदला, पुस्तकाचे नाव आणि मुलाचे नाव वैयक्तिकृत करा, आणि प्रिंट-रेडी PDF मिळवा.',
    coverSettings: 'कव्हर आणि लेआउट सेटिंग्ज',
    titleInput: 'पुस्तकाचे नाव',
    subtitleInput: 'उपशीर्षक',
    childNameInput: 'मुलाचे नाव (विशेष कव्हर बॅज)',
    themeInput: 'पुस्तकाची थीम',
    pageSize: 'कागदाचा आकार',
    orientation: 'दिशानिर्देश (Orientation)',
    emptyBookTitle: 'तुमचे अ‍ॅक्टिव्हिटी पुस्तक रिकामे आहे',
    emptyBookDesc: 'फोटो-ते-रंगकाम, ठिपके जोडा, गणित किंवा अक्षरलेखन स्टुडिओमध्ये जाऊन "पुस्तकात जोडा" वर क्लिक करा.',
    downloadPdfBtn: 'प्रिंट करण्यायोग्य पुस्तक डाउनलोड करा',

    storeTitle: 'कलरक्राफ्ट शैक्षणिक स्टोअर',
    storeSub: 'प्रिंट करण्यायोग्य डिजिटल संच आणि छापील पुस्तकांची झलक. (डेमो मोड).',
    allProducts: 'सर्व उत्पादने',
    digitalPdfs: 'डिजिटल PDF',
    physicalBooks: 'छापील पुस्तके',
    addToCart: 'कार्टमध्ये जोडा',
    checkout: 'चाचणी चेकआउट पूर्ण करा',
    subtotal: 'एकूण रक्कम',
    discount: 'सूट (Discount)',
    total: 'अंतिम रक्कम',

    adminTitle: 'कलरक्राफ्ट प्रशासन व टेलिमेट्री',
    adminSub: 'प्रणाली पडताळणी स्थिती, स्थानिक संसाधने आणि कार्यप्रदर्शन.',
    authRequired: 'प्रशासक अधिकृतता आवश्यक',
    pinPlaceholder: 'पिन टाका (डेमो: 7788)',
    unlockBtn: 'डॅशबोर्ड उघडा',
  },
};

/**
 * Converts western arabic numbers to Devanagari / Marathi numerals
 */
export function toMarathiDigits(num: number | string): string {
  const devanagari = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/[0-9]/g, (d) => devanagari[parseInt(d, 10)]);
}

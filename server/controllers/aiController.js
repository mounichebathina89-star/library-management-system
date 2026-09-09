import Book from '../models/Book.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'llama-3.3-70b-versatile';

// Helper to call Groq API
const callGroq = async (messages, temperature = 0.7, max_tokens = 1024) => {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    throw new Error('Groq API Key not configured');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages,
      temperature,
      max_tokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Groq API error:', errorText);
    throw new Error(`Groq API responded with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
};

const buildCopilotFallback = (query, bookCount, issuedCount, pendingCount, overdueCount) => {
  const normalizedQuery = query.toLowerCase();

  if (/^(hi|hello|hey|good morning|good afternoon)\b/.test(normalizedQuery)) {
    return `Hello! I am your LibraryHub Copilot. The library currently has ${bookCount} books, ${issuedCount} active loans, ${pendingCount} pending requests, and ${overdueCount} overdue loans. Ask me about circulation, cataloging, acquisitions, or member engagement.`;
  }

  if (normalizedQuery.includes('overdue') || normalizedQuery.includes('late')) {
    return `There are ${overdueCount} overdue loans right now. Review those records first, send a friendly reminder with the due date, and prioritize high-demand titles for follow-up. Keep the reminder workflow consistent so members know exactly what happens next.`;
  }

  if (normalizedQuery.includes('category') || normalizedQuery.includes('demand') || normalizedQuery.includes('popular')) {
    return `For demand planning, compare issued loans with available copies by category. Start with the most frequently issued shelves, check pending requests (${pendingCount}), and add copies only where demand stays above available stock across multiple review periods.`;
  }

  if (normalizedQuery.includes('catalog') || normalizedQuery.includes('book')) {
    return `For the ${bookCount}-book catalog, keep book codes unique and searchable, complete author and category metadata, and verify available copies after every issue or return. This keeps member search and circulation records trustworthy.`;
  }

  return `I can help with that. Based on the current library snapshot of ${bookCount} books, ${issuedCount} active loans, ${pendingCount} pending requests, and ${overdueCount} overdue loans, begin by checking the records most closely related to your question and turn the result into one clear action for this week.`;
};

// 1. Librarian AI Analytics Generator
export const generateLibrarianAnalytics = asyncHandler(async (req, res) => {
  // Aggregate real system state
  const totalBooks = await Book.countDocuments();
  const totalUsers = await User.countDocuments({ role: 'user' });
  const issuedBooks = await Transaction.countDocuments({ status: 'issued' });
  const returnedBooks = await Transaction.countDocuments({ status: 'returned' });
  const pendingRequests = await Transaction.countDocuments({ status: 'pending' });
  const overdueBooks = await Transaction.countDocuments({
    status: 'issued',
    dueDate: { $lt: new Date() },
  });

  const categories = await Book.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const recentBooks = await Book.find().select('title author category bookCode').limit(6);

  const statsContext = {
    totalBooks,
    totalUsers,
    issuedBooks,
    returnedBooks,
    pendingRequests,
    overdueBooks,
    topCategories: categories.map((c) => `${c._id} (${c.count})`).join(', '),
    recentTitles: recentBooks.map((b) => `"${b.title}" [${b.bookCode}] (${b.category})`).join(', '),
  };

  const systemPrompt = `You are the Lead Library Intelligence Officer & AI Data Scientist for LibraryHub.
Analyze the current library statistics and generate an executive, cutting-edge analytical intelligence report for the Head Librarian.
Format your output in clean, professional JSON with the following keys:
{
  "executiveSummary": "Concise high-level overview of library health and circulation velocity",
  "circulationHealth": "Analysis of the issue-to-return ratio and member engagement",
  "overdueRiskAssessment": "Analysis of overdue rate and recommended risk mitigation steps",
  "recommendedAcquisitions": ["List of 3 specific book genres or trending topics to acquire"],
  "actionableInsights": [
    "3 specific, data-backed actions the librarian should take this week"
  ]
}
Ensure the output is strictly valid JSON without any markdown code fence wrappers or backticks.`;

  const userPrompt = `Here is the current live library data:
- Total Catalog Titles: ${statsContext.totalBooks}
- Registered Active Members: ${statsContext.totalUsers}
- Currently Issued Loans: ${statsContext.issuedBooks}
- Successfully Returned: ${statsContext.returnedBooks}
- Pending User Borrow Applications: ${statsContext.pendingRequests}
- Overdue Loans: ${statsContext.overdueBooks}
- Categories in Stock: ${statsContext.topCategories}
- Sample Books: ${statsContext.recentTitles}

Generate the JSON intelligence report now.`;

  try {
    const rawAiText = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 0.3, 1000);

    // Clean JSON if model returned code blocks
    let cleaned = rawAiText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleaned);

    res.status(200).json({
      success: true,
      analytics: parsed,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Falling back to rule-based AI analytics:', error.message);
    // Intelligent fallback
    const fallbackAnalytics = {
      executiveSummary: `The library currently houses ${totalBooks} unique titles serving ${totalUsers} active members. Circulation activity is steady with ${issuedBooks} books on loan and ${returnedBooks} completed returns.`,
      circulationHealth: `Turnover rate is healthy. ${pendingRequests} pending applications indicate sustained reader interest.`,
      overdueRiskAssessment: overdueBooks > 0
        ? `${overdueBooks} books are currently overdue. Automated reminder notifications and member check-ins are strongly recommended.`
        : `Outstanding books are all within their due periods, reflecting exceptional borrower compliance.`,
      recommendedAcquisitions: [
        'Artificial Intelligence & Modern Data Science',
        'Contemporary Fiction & Award-Winning Literature',
        'Interactive Science & Technology Manuals',
      ],
      actionableInsights: [
        `Review and process the ${pendingRequests} pending physical borrow applications.`,
        `Inspect shelf availability for high-demand categories: ${categories[0]?._id || 'Fiction'}.`,
        'Promote e-content digital access to relieve physical circulation bottlenecks.',
      ],
    };

    res.status(200).json({
      success: true,
      analytics: fallbackAnalytics,
      generatedAt: new Date().toISOString(),
      isFallback: true,
    });
  }
});

// 2. Librarian AI Copilot (Interactive Assistant)
export const librarianCopilot = asyncHandler(async (req, res) => {
  const { query, history = [] } = req.body;

  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a query for the Librarian Copilot',
    });
  }

  // Get fast library snapshot context
  const bookCount = await Book.countDocuments();
  const userCount = await User.countDocuments({ role: 'user' });
  const issuedCount = await Transaction.countDocuments({ status: 'issued' });
  const pendingCount = await Transaction.countDocuments({ status: 'pending' });
  const overdueCount = await Transaction.countDocuments({ status: 'issued', dueDate: { $lt: new Date() } });

  const systemPrompt = `You are the LibraryHub AI Librarian Copilot, an expert advisor for library administration, cataloging, book acquisitions, circulation rules, and reader community engagement.
Library Context:
- Total Catalog: ${bookCount} books
- Registered Members: ${userCount} users
- Active Issued Loans: ${issuedCount}
- Pending Physical Applications: ${pendingCount}
- Overdue Loans: ${overdueCount}

Provide authoritative, concise, polite, and actionable advice formatted in clean markdown.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: query },
  ];

  try {
    const reply = await callGroq(messages, 0.6, 800);
    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.warn('Librarian Copilot provider unavailable:', error.message);
    res.status(200).json({
      success: true,
      reply: buildCopilotFallback(query, bookCount, issuedCount, pendingCount, overdueCount),
      isFallback: true,
    });
  }
});

// 3. User AI Library Assistant (Book discovery, reading recommendations, guidance)
export const userAssistant = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a message for the Library Assistant',
    });
  }

  // Fetch sample titles from actual library catalog to recommend real books
  let catalogList = 'The live catalog is temporarily unavailable.';
  try {
    const sampleBooks = await Book.find()
      .select('title author category bookCode isEContent shelfLocation')
      .limit(15);
    if (sampleBooks.length > 0) {
      catalogList = sampleBooks
        .map((b) => `- "${b.title}" by ${b.author} [Code: ${b.bookCode}, Category: ${b.category}, Format: ${b.isEContent ? 'E-Content & Physical' : 'Physical'}]`)
        .join('\n');
    }
  } catch (error) {
    console.warn('AI catalog context unavailable:', error.message);
  }

  const systemPrompt = `You are Athena, the intelligent AI Library Concierge of LibraryHub.
Your goal is to help users discover wonderful books, provide summaries, explain difficult concepts, and guide them on how to use the library.

Here are books currently available in our library catalog:
${catalogList}

When recommending books:
1. Prioritize recommending books from our catalog whenever relevant, including their exact Book Code (e.g. BK-1001) so users can easily apply to borrow them or read them!
2. Explain how users can read e-content instantly in the "Open Digital Library" module or apply for physical books with the Book Code in the "Physical Library" module.
3. Be warm, inspiring, educational, and concise. Use clear markdown with emojis.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  try {
    const reply = await callGroq(messages, 0.7, 800);
    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      reply: `Hello! 📚 I am Athena, your AI Library Concierge. Looking for a great read? We have classic and modern masterpieces available in our library! Check out our catalog, copy the Book Code (like BK-1001) to apply for physical borrowing, or head to our Open Digital Library to read live or download e-content directly! How can I assist your reading journey today?`,
    });
  }
});

export default {
  generateLibrarianAnalytics,
  librarianCopilot,
  userAssistant,
};

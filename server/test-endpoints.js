// Comprehensive automated test script for LibraryHub API
const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('🚀 Starting LibraryHub API automated test suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, errorDetails = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${errorDetails}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const healthRes = await fetch(`${BASE_URL}/health`).then((r) => r.json());
    assert(healthRes.success === true, 'Server Health Check');

    // 2. Fixed Librarian Login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@library.com', password: 'Admin@123' }),
    }).then((r) => r.json());

    assert(adminLoginRes.success === true && adminLoginRes.user.role === 'admin', 'Fixed Librarian Login (admin@library.com)', JSON.stringify(adminLoginRes));
    const adminToken = adminLoginRes.token;

    // 3. User Login
    const userLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sarah@example.com', password: 'Reader@123' }),
    }).then((r) => r.json());

    assert(userLoginRes.success === true && userLoginRes.user.role === 'user', 'Member Login (sarah@example.com)', JSON.stringify(userLoginRes));
    const userToken = userLoginRes.token;

    // 4. Books Retrieval & Code Lookup
    const booksRes = await fetch(`${BASE_URL}/books`).then((r) => r.json());
    assert(booksRes.success === true && booksRes.books.length > 0, `Fetch all books (Found ${booksRes.books?.length || 0})`);

    const gatsbyBook = await fetch(`${BASE_URL}/books/code/BK-1001`).then((r) => r.json());
    assert(gatsbyBook.success === true && gatsbyBook.book?.bookCode === 'BK-1001', 'Lookup book by Book Code BK-1001');

    // 5. E-Content Filter
    const eContentRes = await fetch(`${BASE_URL}/books?eContentOnly=true`).then((r) => r.json());
    assert(eContentRes.success === true && eContentRes.books.every((b) => b.isEContent), 'Filter books by eContentOnly=true');

    // 6. Librarian adds a new book with dynamic book code
    const dynamicCode = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBookRes = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: `Deep Work & Modern Focus ${Date.now().toString().slice(-4)}`,
        author: 'Cal Newport',
        category: 'Productivity',
        bookCode: dynamicCode,
        totalCopies: 4,
        shelfLocation: 'Rack P1',
        isEContent: true,
        eBookType: 'text',
        eBookContent: '# Deep Work\n\nRules for Focused Success in a Distracted World.',
      }),
    }).then((r) => r.json());

    assert(newBookRes.success === true && newBookRes.book?.bookCode === dynamicCode, `Librarian adds book with dynamic code ${dynamicCode}`, JSON.stringify(newBookRes));

    // 7. Member applies to borrow physical book with the dynamic book code
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const applyRes = await fetch(`${BASE_URL}/transactions/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        bookCode: dynamicCode,
        fromDate: today.toISOString(),
        toDate: nextWeek.toISOString(),
        notes: 'Borrow application for thesis assignment',
      }),
    }).then((r) => r.json());

    assert(applyRes.success === true && applyRes.transaction?.status === 'pending', 'User submits physical borrow application (status: pending)', JSON.stringify(applyRes));
    const pendingTransId = applyRes.transaction?._id;

    // 8. Librarian reviews and approves application
    const reviewRes = await fetch(`${BASE_URL}/transactions/${pendingTransId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: 'approve',
        notes: 'Approved by librarian. Please pick up at circulation desk.',
      }),
    }).then((r) => r.json());

    assert(reviewRes.success === true && reviewRes.transaction?.status === 'approved', 'Librarian approves borrow application (status: approved)', JSON.stringify(reviewRes));

    // 9. Librarian physically issues the book (records intake time & decrements copy)
    const issueRes = await fetch(`${BASE_URL}/transactions/${pendingTransId}/issue`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        intakeTime: new Date().toISOString(),
        notes: 'Book physically collected by member.',
      }),
    }).then((r) => r.json());

    assert(issueRes.success === true && issueRes.transaction?.status === 'issued', 'Librarian issues book and records physical intake time', JSON.stringify(issueRes));

    // 10. Direct walk-in issue by librarian
    const directRes = await fetch(`${BASE_URL}/transactions/direct-issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        bookCode: dynamicCode,
        userName: 'Alice Walkin',
        userEmail: `alice_${Date.now()}@walkin.com`,
        userPhone: '5551234567',
        intakeTime: new Date().toISOString(),
        notes: 'Direct front-desk checkout',
      }),
    }).then((r) => r.json());

    assert(directRes.success === true && directRes.transaction?.borrowType === 'direct_librarian', 'Librarian logs direct physical walk-in loan with intake time', JSON.stringify(directRes));
    const directTransId = directRes.transaction?._id;

    // 11. Return the direct book
    const returnRes = await fetch(`${BASE_URL}/transactions/${directTransId}/return`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    }).then((r) => r.json());

    assert(returnRes.success === true && returnRes.transaction?.status === 'returned', 'Librarian processes book return (status: returned)', JSON.stringify(returnRes));

    // 12. Dashboard statistics
    const statsRes = await fetch(`${BASE_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());

    assert(
      statsRes.success === true &&
        statsRes.stats?.totalBooks > 0 &&
        statsRes.stats?.totalUsers > 0 &&
        statsRes.stats?.issuedBooks >= 0 &&
        statsRes.stats?.returnedBooks >= 0 &&
        statsRes.stats?.availableBooks >= 0,
      'Dashboard stats contains totalBooks, totalUsers, issuedBooks, returnedBooks, and availableBooks',
      JSON.stringify(statsRes.stats)
    );

    // 13. User AI Assistant endpoint
    const aiUserRes = await fetch(`${BASE_URL}/ai/user-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Can you recommend a great classic novel in the library?' }),
    }).then((r) => r.json());

    assert(aiUserRes.success === true && aiUserRes.reply?.length > 20, 'User AI Library Assistant generated recommendation');

    // 14. Librarian AI Analytics endpoint
    const aiAdminRes = await fetch(`${BASE_URL}/ai/librarian-analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    }).then((r) => r.json());

    assert(
      aiAdminRes.success === true && aiAdminRes.analytics?.executiveSummary,
      'Librarian AI Analytical Dashboard intelligence report generated',
      JSON.stringify(aiAdminRes.analytics)
    );

    // 15. Librarian AI Copilot query endpoint
    const aiCopilotRes = await fetch(`${BASE_URL}/ai/librarian-copilot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ query: 'What are the top 3 best practices for cataloging new scientific books?' }),
    }).then((r) => r.json());

    assert(aiCopilotRes.success === true && aiCopilotRes.reply?.length > 20, 'Librarian AI Copilot response received');

    console.log(`\n🏁 Test Suite Finished: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('❌ Unexpected test error:', err);
    process.exit(1);
  }
};

runTests();

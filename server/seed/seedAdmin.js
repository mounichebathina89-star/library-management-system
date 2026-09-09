import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Transaction from '../models/Transaction.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing collections
    await User.deleteMany({});
    await Book.deleteMany({});
    await Transaction.deleteMany({});

    // 1. Create fixed Librarian / Admin User
    const admin = await User.create({
      name: 'Head Librarian',
      email: 'admin@library.com',
      password: 'Admin@123',
      phone: '9876543210',
      role: 'admin',
      isActive: true,
    });

    console.log('✓ Fixed Librarian created:', admin.email);

    // 2. Create sample members with pre-save password hashing
    const users = await Promise.all([
      User.create({
        name: 'John Student',
        email: 'john@example.com',
        password: 'Student@123',
        phone: '9876543211',
        role: 'user',
        isActive: true,
      }),
      User.create({
        name: 'Sarah Reader',
        email: 'sarah@example.com',
        password: 'Reader@123',
        phone: '9876543212',
        role: 'user',
        isActive: true,
      }),
      User.create({
        name: 'Mike Scholar',
        email: 'mike@example.com',
        password: 'Scholar@123',
        phone: '9876543213',
        role: 'user',
        isActive: true,
      }),
    ]);

    console.log('✓ Sample users created:', users.length);

    // 3. Create rich books with Book Codes, E-Content, and Physical copies
    const books = await Book.insertMany([
      {
        title: 'The Great Gatsby',
        bookCode: 'BK-1001',
        isbn: '978-0-7432-7356-5',
        author: 'F. Scott Fitzgerald',
        category: 'Fiction',
        publisher: 'Scribner Classic Editions',
        publicationYear: 1925,
        description: 'A classic novel exploring decadence, idealism, and the illusion of the American Dream in the Jazz Age.',
        coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
        totalCopies: 5,
        availableCopies: 4,
        shelfLocation: 'Rack A1 - Tier 2',
        language: 'English',
        isEContent: true,
        eBookType: 'text',
        eBookUrl: 'https://www.gutenberg.org/ebooks/64317',
        eBookContent: `# The Great Gatsby
By F. Scott Fitzgerald

### Chapter I
In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since.

“Whenever you feel like criticizing any one,” he told me, “just remember that all the people in this world haven’t had the advantages that you’ve had.”

He didn’t say any more, but we’ve always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I’m inclined to reserve all judgements, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores. The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men.

Reserving judgements is a matter of infinite hope. I am still a little afraid of missing something if I forget that, as my father snobbishly suggested, and I snobbishly repeat, a sense of the fundamental decencies is parcelled out unequally at birth.

### Chapter II
About half way between West Egg and New York the motor road hastily joins the railroad and runs beside it for a quarter of a mile, so as to shrink away from a certain desolate area of land. This is a valley of ashes—a fantastic farm where ashes grow like wheat into ridges and hills and grotesque gardens; where ashes take the forms of houses and chimneys and rising smoke and, finally, with a transcendent effort, of men who move dimly and already crumbling through the powdery air.`,
      },
      {
        title: '1984 - A Dystopian Masterpiece',
        bookCode: 'BK-1002',
        isbn: '978-0-451-52493-2',
        author: 'George Orwell',
        category: 'Dystopian',
        publisher: 'Secker & Warburg',
        publicationYear: 1949,
        description: 'A chilling vision of totalitarian surveillance, thought control, and the survival of individual truth.',
        coverImage: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=600',
        totalCopies: 6,
        availableCopies: 5,
        shelfLocation: 'Rack B2 - Tier 1',
        language: 'English',
        isEContent: true,
        eBookType: 'link',
        eBookUrl: 'https://archive.org/details/1984-george-orwell',
        eBookContent: `# 1984
By George Orwell

### Part 1, Chapter 1
It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.

The hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster, too large for indoor display, had been tacked to the wall. It depicted simply an enormous face, more than a metre wide: the face of a man of about forty-five, with a heavy black moustache and ruggedly handsome features. Winston made for the stairs. It was no use trying the lift. Even at the best of times it was seldom working, and at present the electric current was cut off during daylight hours. It was part of the economy drive in preparation for Hate Week.

The flat was seven flights up, and Winston, who was thirty-nine and had a varicose ulcer above his right ankle, went slowly, resting several times on the way. On each landing, opposite the lift-shaft, the poster with the enormous face gazed from the wall. It was one of those pictures which are so contrived that the eyes follow you about when you move. BIG BROTHER IS WATCHING YOU, the caption beneath it ran.`,
      },
      {
        title: 'A Brief History of Time',
        bookCode: 'BK-1003',
        isbn: '978-0-553-38016-3',
        author: 'Stephen Hawking',
        category: 'Science',
        publisher: 'Bantam Books',
        publicationYear: 1988,
        description: 'From the Big Bang to Black Holes, a landmark exploration of modern physics and cosmology.',
        coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600',
        totalCopies: 4,
        availableCopies: 3,
        shelfLocation: 'Rack S1 - Tier 4',
        language: 'English',
        isEContent: true,
        eBookType: 'text',
        eBookUrl: 'https://openlibrary.org/works/OL1815124W/A_Brief_History_of_Time',
        eBookContent: `# A Brief History of Time
By Stephen Hawking

### Chapter 1: Our Picture of the Universe
A well-known scientist (some say it was Bertrand Russell) once gave a public lecture on astronomy. He described how the earth orbits around the sun and how the sun, in turn, orbits around the center of a vast collection of stars called our galaxy.

At the end of the lecture, a little old lady at the back of the room got up and said: "What you have told us is rubbish. The world is really a flat plate supported on the back of a giant tortoise."

The scientist gave a superior smile before replying, "What is the tortoise standing on?"

"You're very clever, young man, very clever," said the old lady. "But it's turtles all the way down!"

Most people would find the picture of our universe as an infinite tower of tortoises rather ridiculous, but why do we think we know better? What do we know about the universe, and how do we know it? Where did the universe come from, and where is it going? Did the universe have a beginning, and if so, what happened before then? What is the nature of time? Will it ever come to an end?`,
      },
      {
        title: 'Pride and Prejudice',
        bookCode: 'BK-1004',
        isbn: '978-0-141-43951-8',
        author: 'Jane Austen',
        category: 'Romance',
        publisher: 'Penguin Classics',
        publicationYear: 1813,
        description: 'A romantic masterpiece dissecting societal manners, morality, and unexpected love in Regency England.',
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
        totalCopies: 6,
        availableCopies: 6,
        shelfLocation: 'Rack C3 - Tier 2',
        language: 'English',
        isEContent: true,
        eBookType: 'text',
        eBookUrl: 'https://www.gutenberg.org/ebooks/1342',
        eBookContent: `# Pride and Prejudice
By Jane Austen

### Chapter 1
It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"

Mr. Bennet replied that he had not.

"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."

Mr. Bennet made no answer.

"Do you not want to know who has taken it?" cried his wife impatiently.

"You want to tell me, and I have no objection to hearing it."`,
      },
      {
        title: 'To Kill a Mockingbird',
        bookCode: 'BK-1005',
        isbn: '978-0-06-112008-4',
        author: 'Harper Lee',
        category: 'Fiction',
        publisher: 'J.B. Lippincott & Co.',
        publicationYear: 1960,
        description: 'A powerful story of racial injustice, moral courage, and childhood empathy in the American South.',
        coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
        totalCopies: 4,
        availableCopies: 3,
        shelfLocation: 'Rack A2 - Tier 1',
        language: 'English',
        isEContent: false,
        eBookType: 'none',
        eBookUrl: '',
      },
      {
        title: 'The Hobbit',
        bookCode: 'BK-1006',
        isbn: '978-0-547-92822-8',
        author: 'J.R.R. Tolkien',
        category: 'Fantasy',
        publisher: 'George Allen & Unwin',
        publicationYear: 1937,
        description: 'The exhilarating journey of Bilbo Baggins to reclaim the lost dwarf kingdom of Erebor from Smaug.',
        coverImage: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?auto=format&fit=crop&q=80&w=600',
        totalCopies: 5,
        availableCopies: 5,
        shelfLocation: 'Rack F1 - Tier 3',
        language: 'English',
        isEContent: true,
        eBookType: 'link',
        eBookUrl: 'https://openlibrary.org/works/OL262758W/The_Hobbit',
      },
      {
        title: 'Clean Code: A Handbook of Agile Craftsmanship',
        bookCode: 'BK-1007',
        isbn: '978-0-132-35088-4',
        author: 'Robert C. Martin',
        category: 'Technology',
        publisher: 'Prentice Hall',
        publicationYear: 2008,
        description: 'A must-read guide for software engineers detailing clean design, refactoring, and code aesthetics.',
        coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=600',
        totalCopies: 4,
        availableCopies: 4,
        shelfLocation: 'Rack T2 - Tier 1',
        language: 'English',
        isEContent: true,
        eBookType: 'link',
        eBookUrl: 'https://openlibrary.org/works/OL15844427W/Clean_Code',
      },
      {
        title: 'The Design of Everyday Things',
        bookCode: 'BK-1008',
        isbn: '978-0-465-05065-9',
        author: 'Don Norman',
        category: 'Design',
        publisher: 'Basic Books',
        publicationYear: 2013,
        description: 'The foundational primer on cognitive design, human usability, and thoughtful product interactions.',
        coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600',
        totalCopies: 3,
        availableCopies: 2,
        shelfLocation: 'Rack D1 - Tier 2',
        language: 'English',
        isEContent: false,
        eBookType: 'none',
        eBookUrl: '',
      },
    ]);

    console.log('✓ Sample books created:', books.length);

    // 4. Create sample transactions
    const gatsby = books.find((b) => b.bookCode === 'BK-1001');
    const orwell = books.find((b) => b.bookCode === 'BK-1002');
    const hawking = books.find((b) => b.bookCode === 'BK-1003');
    const norman = books.find((b) => b.bookCode === 'BK-1008');

    const john = users[0];
    const sarah = users[1];
    const mike = users[2];

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const inTenDays = new Date();
    inTenDays.setDate(inTenDays.getDate() + 10);

    const inSevenDays = new Date();
    inSevenDays.setDate(inSevenDays.getDate() + 7);

    await Transaction.insertMany([
      // Active issued loan for John (The Great Gatsby)
      {
        user: john._id,
        book: gatsby._id,
        bookCode: gatsby.bookCode,
        bookTitle: gatsby.title,
        borrowType: 'application',
        status: 'issued',
        issueDate: fiveDaysAgo,
        dueDate: inTenDays,
        requestFromDate: fiveDaysAgo,
        requestToDate: inTenDays,
        applicantInfo: {
          name: john.name,
          email: john.email,
          phone: john.phone,
        },
        librarianNotes: 'Approved and physically handed over.',
      },
      // Active issued loan for Sarah (1984)
      {
        user: sarah._id,
        book: orwell._id,
        bookCode: orwell.bookCode,
        bookTitle: orwell.title,
        borrowType: 'direct_librarian',
        status: 'issued',
        issueDate: twoDaysAgo,
        dueDate: inSevenDays,
        requestFromDate: twoDaysAgo,
        requestToDate: inSevenDays,
        applicantInfo: {
          name: sarah.name,
          email: sarah.email,
          phone: sarah.phone,
        },
        librarianNotes: 'Walk-in issue recorded by librarian.',
      },
      // Pending request from Mike for A Brief History of Time
      {
        user: mike._id,
        book: hawking._id,
        bookCode: hawking.bookCode,
        bookTitle: hawking.title,
        borrowType: 'application',
        status: 'pending',
        requestFromDate: new Date(),
        requestToDate: inTenDays,
        dueDate: inTenDays,
        applicantInfo: {
          name: mike.name,
          email: mike.email,
          phone: mike.phone,
        },
        librarianNotes: 'Required for physics seminar research.',
      },
      // Returned transaction for John (Design of Everyday Things)
      {
        user: john._id,
        book: norman._id,
        bookCode: norman.bookCode,
        bookTitle: norman.title,
        borrowType: 'application',
        status: 'returned',
        issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        returnDate: yesterday,
        applicantInfo: {
          name: john.name,
          email: john.email,
          phone: john.phone,
        },
        librarianNotes: 'Returned in pristine condition.',
      },
    ]);

    console.log('✓ Sample transactions created');
    console.log('\n=======================================');
    console.log('✅ DATABASE SEED COMPLETE');
    console.log('Fixed Librarian Login:');
    console.log('Email:    admin@library.com');
    console.log('Password: Admin@123');
    console.log('---------------------------------------');
    console.log('Sample Member Logins:');
    console.log('john@example.com / Student@123');
    console.log('sarah@example.com / Reader@123');
    console.log('mike@example.com / Scholar@123');
    console.log('=======================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

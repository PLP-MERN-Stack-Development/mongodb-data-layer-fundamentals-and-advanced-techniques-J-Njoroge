// insert_books.js
// Usage:
// 1) Set MONGODB_URI to your Atlas connection string before running.
// 2) npm install mongodb
// 3) node insert_books.js

require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('ERROR: MONGODB_URI environment variable not set. Set it to your Atlas connection string.');
  console.error('Example (macOS / Linux):');
  console.error('  export MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/plp_bookstore?retryWrites=true&w=majority"');
  console.error('Example (PowerShell):');
  console.error('  $env:MONGODB_URI = "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/plp_bookstore?retryWrites=true&w=majority"');
  process.exit(1);
}

const dbName = 'plp_bookstore';
const collectionName = 'books';

const books = [
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Fiction', published_year: 1960, price: 12.99, in_stock: true, pages: 336, publisher: 'J. B. Lippincott & Co.' },
  { title: '1984', author: 'George Orwell', genre: 'Dystopian', published_year: 1949, price: 10.99, in_stock: true, pages: 328, publisher: 'Secker & Warburg' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Fiction', published_year: 1925, price: 9.99, in_stock: true, pages: 180, publisher: "Charles Scribner's Sons" },
  { title: 'Brave New World', author: 'Aldous Huxley', genre: 'Dystopian', published_year: 1932, price: 11.50, in_stock: false, pages: 311, publisher: 'Chatto & Windus' },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy', published_year: 1937, price: 14.99, in_stock: true, pages: 310, publisher: 'George Allen & Unwin' },
  { title: 'The Catcher in the Rye', author: 'J.D. Salinger', genre: 'Fiction', published_year: 1951, price: 8.99, in_stock: true, pages: 224, publisher: 'Little, Brown and Company' },
  { title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'Romance', published_year: 1813, price: 7.99, in_stock: true, pages: 432, publisher: 'T. Egerton, Whitehall' },
  { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', genre: 'Fantasy', published_year: 1954, price: 19.99, in_stock: true, pages: 1178, publisher: 'Allen & Unwin' },
  { title: 'Animal Farm', author: 'George Orwell', genre: 'Political Satire', published_year: 1945, price: 8.50, in_stock: false, pages: 112, publisher: 'Secker & Warburg' },
  { title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Fiction', published_year: 1988, price: 10.99, in_stock: true, pages: 197, publisher: 'HarperOne' },
  { title: 'Moby Dick', author: 'Herman Melville', genre: 'Adventure', published_year: 1851, price: 12.50, in_stock: false, pages: 635, publisher: 'Harper & Brothers' },
  { title: 'Wuthering Heights', author: 'Emily Brontë', genre: 'Gothic Fiction', published_year: 1847, price: 9.99, in_stock: true, pages: 342, publisher: 'Thomas Cautley Newby' }
];

async function run() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const db = client.db(dbName);
    const coll = db.collection(collectionName);

    // If collection exists and has documents, drop it to ensure a clean insert
    const existing = await coll.countDocuments();
    if (existing > 0) {
      console.log(`Collection "${collectionName}" exists and has ${existing} documents. Dropping collection...`);
      await coll.drop();
      console.log('Dropped existing collection.');
    }

    const res = await coll.insertMany(books);
    console.log(`Inserted ${res.insertedCount} documents into ${dbName}.${collectionName}`);

    // Print inserted items summary
    const docs = await coll.find({}).project({ title: 1, author: 1, published_year: 1, _id: 0 }).toArray();
    console.log('\nInserted books:');
    docs.forEach((d, i) => console.log(`${i + 1}. ${d.title} — ${d.author} (${d.published_year})`));
  } catch (err) {
    console.error('Error inserting books:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

run();

/*
 * Example MongoDB queries you can try after running this script:
 *
 * 1. Find all books:
 *    db.books.find()
 *
 * 2. Find books by a specific author:
 *    db.books.find({ author: "George Orwell" })
 *
 * 3. Find books published after 1950:
 *    db.books.find({ published_year: { $gt: 1950 } })
 *
 * 4. Find books in a specific genre:
 *    db.books.find({ genre: "Fiction" })
 *
 * 5. Find in-stock books:
 *    db.books.find({ in_stock: true })
 */ 
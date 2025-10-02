// run_queries.js - Node.js version of queries.js
// This script executes all the MongoDB queries using Node.js instead of mongosh

require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('ERROR: MONGODB_URI environment variable not set.');
  process.exit(1);
}

const dbName = 'plp_bookstore';
const collectionName = 'books';

async function runAllQueries() {
  const client = new MongoClient(uri);
  
  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('Connected to MongoDB Atlas\n');
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    console.log('='.repeat(60));
    console.log('TASK 2: BASIC CRUD OPERATIONS');
    console.log('='.repeat(60));

    // Find all books in Fiction genre
    console.log('\n1. Books in Fiction genre:');
    const fictionBooks = await collection.find({ genre: "Fiction" }).toArray();
    fictionBooks.forEach(book => console.log(`   ${book.title} by ${book.author}`));

    // Find books published after 1950
    console.log('\n2. Books published after 1950:');
    const modernBooks = await collection.find({ published_year: { $gt: 1950 } }).toArray();
    modernBooks.forEach(book => console.log(`   ${book.title} (${book.published_year})`));

    // Find books by George Orwell
    console.log('\n3. Books by George Orwell:');
    const orwellBooks = await collection.find({ author: "George Orwell" }).toArray();
    orwellBooks.forEach(book => console.log(`   ${book.title} (${book.published_year})`));

    // Update the price of The Alchemist
    console.log('\n4. Updating price of "The Alchemist"...');
    const updateResult = await collection.updateOne(
      { title: "The Alchemist" }, 
      { $set: { price: 11.99 } }
    );
    console.log(`   Modified ${updateResult.modifiedCount} document(s)`);

    // Delete Moby Dick (if it exists)
    console.log('\n5. Deleting "Moby Dick"...');
    const deleteResult = await collection.deleteOne({ title: "Moby Dick" });
    console.log(`   Deleted ${deleteResult.deletedCount} document(s)`);

    console.log('\n' + '='.repeat(60));
    console.log('TASK 3: ADVANCED QUERIES');
    console.log('='.repeat(60));

    // Books in stock AND published after 2010
    console.log('\n6. Books in stock published after 2010:');
    const recentInStock = await collection.find({ 
      in_stock: true, 
      published_year: { $gt: 2010 } 
    }).toArray();
    if (recentInStock.length === 0) {
      console.log('   No books found (none published after 2010)');
    } else {
      recentInStock.forEach(book => console.log(`   ${book.title} (${book.published_year})`));
    }

    // Projection: only title, author, price
    console.log('\n7. Books with title, author, and price only:');
    const projectedBooks = await collection.find({}, { 
      projection: { title: 1, author: 1, price: 1, _id: 0 } 
    }).toArray();
    projectedBooks.slice(0, 5).forEach(book => 
      console.log(`   ${book.title} by ${book.author} - $${book.price}`)
    );
    console.log(`   ... (showing first 5 of ${projectedBooks.length} books)`);

    // Sorting by price ascending (limit 5)
    console.log('\n8. 5 Cheapest books:');
    const cheapestBooks = await collection.find().sort({ price: 1 }).limit(5).toArray();
    cheapestBooks.forEach(book => console.log(`   ${book.title} - $${book.price}`));

    // Sorting by price descending (limit 5)
    console.log('\n9. 5 Most expensive books:');
    const expensiveBooks = await collection.find().sort({ price: -1 }).limit(5).toArray();
    expensiveBooks.forEach(book => console.log(`   ${book.title} - $${book.price}`));

    // Pagination example - Page 1
    console.log('\n10. Pagination (Page 1 - first 5 books):');
    const page1 = await collection.find().sort({ title: 1 }).skip(0).limit(5).toArray();
    page1.forEach((book, index) => console.log(`    ${index + 1}. ${book.title}`));

    // Pagination example - Page 2
    console.log('\n11. Pagination (Page 2 - next 5 books):');
    const page2 = await collection.find().sort({ title: 1 }).skip(5).limit(5).toArray();
    page2.forEach((book, index) => console.log(`    ${index + 6}. ${book.title}`));

    console.log('\n' + '='.repeat(60));
    console.log('TASK 4: AGGREGATION PIPELINES');
    console.log('='.repeat(60));

    // Average price by genre
    console.log('\n12. Average price by genre:');
    const avgPriceByGenre = await collection.aggregate([
      { $group: { _id: "$genre", avgPrice: { $avg: "$price" }, count: { $sum: 1 } } },
      { $sort: { avgPrice: -1 } }
    ]).toArray();
    avgPriceByGenre.forEach(genre => 
      console.log(`    ${genre._id}: $${genre.avgPrice.toFixed(2)} (${genre.count} books)`)
    );

    // Author with the most books
    console.log('\n13. Author with the most books:');
    const topAuthor = await collection.aggregate([
      { $group: { _id: "$author", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray();
    if (topAuthor.length > 0) {
      console.log(`    ${topAuthor[0]._id}: ${topAuthor[0].count} books`);
    }

    // Books by publication decade
    console.log('\n14. Books by publication decade:');
    const booksByDecade = await collection.aggregate([
      { $project: { decade: { $multiply: [ { $floor: { $divide: ["$published_year", 10] } }, 10 ] } } },
      { $group: { _id: "$decade", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    booksByDecade.forEach(decade => 
      console.log(`    ${decade._id}s: ${decade.count} books`)
    );

    console.log('\n' + '='.repeat(60));
    console.log('TASK 5: INDEXING');
    console.log('='.repeat(60));

    // Create index on title
    console.log('\n15. Creating index on title field...');
    await collection.createIndex({ title: 1 });
    console.log('    ✓ Index created on title field');

    // Create compound index on author and published_year
    console.log('\n16. Creating compound index on author and published_year...');
    await collection.createIndex({ author: 1, published_year: -1 });
    console.log('    ✓ Compound index created on author and published_year');

    // List all indexes
    console.log('\n17. Current indexes on books collection:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      const keys = Object.keys(index.key).map(key => 
        `${key}:${index.key[key]}`
      ).join(', ');
      console.log(`    ${index.name}: {${keys}}`);
    });

    // Example explain query
    console.log('\n18. Query execution stats (using index):');
    const explainResult = await collection.find({ title: "To Kill a Mockingbird" })
      .explain("executionStats");
    console.log(`    Execution time: ${explainResult.executionStats.executionTimeMillis}ms`);
    console.log(`    Documents examined: ${explainResult.executionStats.totalDocsExamined}`);
    console.log(`    Documents returned: ${explainResult.executionStats.totalDocsReturned}`);
    console.log(`    Index used: ${explainResult.executionStats.executionStages?.indexName || 'None'}`);

    console.log('\n' + '='.repeat(60));
    console.log('ALL QUERIES COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nConnection closed.');
  }
}

// Run all queries
runAllQueries().catch(console.error);
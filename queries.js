// queries.js  (mongosh commands)
// Usage:
// 1) Connect with mongosh to your Atlas cluster (paste your SRV connection string).
//    Example: mongosh "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/plp_bookstore"
// 2) Once connected, run: load('queries.js')  OR paste desired lines.

// Ensure we are on the right DB
//use plp_bookstore;

// -------------------- Task 2: Basic CRUD --------------------
// Find all books in a specific genre (example: Fiction)
db.books.find({ genre: "Fiction" }).pretty();

// Find books published after a certain year (example: 1950)
db.books.find({ published_year: { $gt: 1950 } }).pretty();

// Find books by a specific author (example: George Orwell)
db.books.find({ author: "George Orwell" }).pretty();

// Update the price of a specific book (example: The Alchemist)
db.books.updateOne({ title: "The Alchemist" }, { $set: { price: 11.99 } });

// Delete a book by its title (example: Moby Dick)
db.books.deleteOne({ title: "Moby Dick" });

// -------------------- Task 3: Advanced Queries --------------------
// Books that are in stock AND published after 2010
db.books.find({ in_stock: true, published_year: { $gt: 2010 } }).pretty();

// Projection: return only title, author, price
db.books.find({}, { projection: { title: 1, author: 1, price: 1, _id: 0 } }).pretty();

// Sorting by price ascending and descending (limit 10)
db.books.find().sort({ price: 1 }).limit(10).pretty();
db.books.find().sort({ price: -1 }).limit(10).pretty();

// Pagination (5 per page):
// Page 1
db.books.find().sort({ title: 1 }).skip(0).limit(5).pretty();
// Page 2
db.books.find().sort({ title: 1 }).skip(5).limit(5).pretty();

// -------------------- Task 4: Aggregation Pipelines --------------------
// Average price of books by genre
db.books.aggregate([
  { $group: { _id: "$genre", avgPrice: { $avg: "$price" }, count: { $sum: 1 } } },
  { $sort: { avgPrice: -1 } }
]).pretty();

// Author with the most books
db.books.aggregate([
  { $group: { _id: "$author", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 1 }
]).pretty();

// Group books by publication decade and count them
db.books.aggregate([
  { $project: { decade: { $multiply: [ { $floor: { $divide: ["$published_year", 10] } }, 10 ] } } },
  { $group: { _id: "$decade", count: { $sum: 1 } } },
  { $sort: { _id: 1 } }
]).pretty();

// -------------------- Task 5: Indexing --------------------
// Create an index on the title field
db.books.createIndex({ title: 1 });

// Create a compound index on author and published_year
db.books.createIndex({ author: 1, published_year: -1 });

// Use explain() to demonstrate index improvement (run before and after creating index to compare)
// Example explain:
db.books.find({ title: "To Kill a Mockingbird" }).explain("executionStats");

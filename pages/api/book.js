import { withIronSessionApiRoute } from "iron-session/next";
import sessionOptions from "../../config/session";
import db from "../../db";

// this handler runs for /api/book with any request method (GET, POST, etc)
export default withIronSessionApiRoute(async function handler(req, res) {
  // Check if user is logged in
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ error: "User not logged in" });
  }
  try {
    let requestBody =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    switch (req.method) {
      case "POST":
        const addedBook = await db.book.add(user.id, requestBody);
        if (!addedBook) {
          req.session.destroy(); // Destroy session if user not found
          return res.status(401).json({ error: "User not found" });
        }
        return res.status(200).json({ message: "Book added successfully" });

      case "DELETE":
        const bookId = requestBody.id;
        const isRemoved = await db.book.remove(user.id, bookId);
        if (!isRemoved) {
          req.session.destroy(); // Destroy session if user not found
          return res.status(401).json({ error: "User not found" });
        }
        return res.status(200).json({ message: "Book removed successfully" });

      default:
        return res.status(404).end();
    }
  } catch (err) {
    // Handle any errors, such as invalid JSON or database errors
    return res.status(400).json({ error: err.message });
  }
}, sessionOptions);

import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import methodOverride from "method-override";

const app = express();
const port = 3000;

// Using middleware to make styling show up, render ejs files, and handle delete
// request
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Create Blogs Directory variable to be used in different request handling
const blogsDir = path.join("public", "blogs");

function pathForFiles(directory, fileName) {
  return path.join(`${directory}`, `${fileName}.json`);
}

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/blogs", (req, res) => {
  const blogList = [];

  // Check to see if directory exists
  if (fs.existsSync(blogsDir)) {
    // Read all file names in directory
    const files = fs.readdirSync(blogsDir);

    // Loop through each file
    files.forEach(file => {
      // Look for only JSON files
      if (path.extname(file) === ".json") {
        const filePath = path.join(blogsDir, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        try {
          const blogData = JSON.parse(fileContent);
          // Adding parsed data to list
          blogList.push(blogData);
        } catch (e) {
          console.error(`Error parsing JSON file: ${file}`);
        }
      }
    });
  }

  // Pass the list of all blog posts to the EJS template
  res.render("blogs.ejs", { blogs: blogList });
});

app.post("/blogs", (req, res) => {
  const newBlogTitle = req.body.blogTitle;
  const newBlogFile = newBlogTitle.replaceAll(" ", "");
  const newBlogContent = req.body.blogContent;

  // Adding date to data to make visible to user on blog post page
  const postedDate = new Date();

  // Formatting the date for the blog
  const formattedDate = postedDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const blogData = {
    flName : newBlogFile,
    title : newBlogTitle,
    content: newBlogContent,
    postDate: formattedDate
  };

  const filePath = pathForFiles(blogsDir, newBlogFile);

  fs.writeFile(filePath, JSON.stringify(blogData, null, 2), (err) => {
    if(err) {
      console.error("Failed to save blog post: ", err);
      return res.status(500).send("Error saving blog post.");
    }
    console.log(`Blog post "${newBlogTitle}" has been saved.`);
    res.redirect("/blogs");
  });
});

app.get("/blogs/:blogTitle", (req, res) => {
  // Get blogTitle parameter from the URL
  const blogTitle = req.params.blogTitle;

  // Create full file path using pathForFiles function
  const filePath = pathForFiles(blogsDir, blogTitle);
  
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      // If file doesn't exist
      res.status(404).send("404.ejs");
      return;
    }
    try {
      // Parse JSON data
      const blogData = JSON.parse(data);

      // Render new blogpost.ejs template with data
      res.render("blogpost.ejs", blogData);
    } catch (parseError) {
      res.status(500).send("Error parsing blog data");
    }
  });
});

app.delete("/blogs/:blogTitle", (req, res) => {
  const blogTitle = req.params.blogTitle;
  const filePath = pathForFiles(blogsDir, blogTitle);
 
  fs.unlink(filePath, (err) => {
    if (err) {
      // Handle if the file doesn't exist
      if (err.code === "ENOENT") {
        console.error(`Attempted to delete a non-existent file: ${filePath}`);
        // Redirect back to blog page since error is backend issue.
        return res.redirect("/blogs");
      }
      console.error(`Failed to delete blog post: ${err}`);
      return res.status(500).send("There was an error deleting the blog post.");
    }
    console.log(`Blog post "${blogTitle}" has been successfully deleted.`);
    res.redirect("/blogs?alert=blog-deleted");
  });
});

app.patch("/blogs/:blogTitle", (req, res) => {
  const blogTitle = req.params.blogTitle;
  const filePath = pathForFiles(blogsDir, blogTitle);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      // If file doesn't exist
      console.error(`Error reading file for update: ${err}`);
      return res.status(404).send("Blog not found")
    }
    try {
      // Parse JSON data
      const blogData = JSON.parse(data);
      
      // Get new content from request body
      const updatedContent = req.body.blogContent;

      // Update blog content
      if (updatedContent) {
        blogData.content = updatedContent;
      }
      fs.writeFile(filePath, JSON.stringify(blogData, null, 2), (writeErr) => {
        if (writeErr) {
          console.error("Failed to update blog post: ",writeErr);
          return res.status(500).send("Error updating blog post");
        }
        console.log(`Blog post "${blogTitle}" has been updated.`);
        res.redirect(`/blogs/${blogTitle}`);
      });
    } catch (parseError) {
      console.error("Error parsing blog data for update: ", parseError);
      res.status(500).send("Error parsing blog data.");
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
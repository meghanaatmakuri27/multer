const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://admin:admin@cluster0.kyiehv9.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/Images");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

const Photo = mongoose.model("Photo", {
  filename: String, // You can add more fields as needed
  path: String,
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const photo = new Photo({
      filename: req.file.filename,
      path: req.file.path,
    });

    await photo.save();

    console.log("Photo information saved in the database");
    console.log(req.body);
    console.log(req.file);

    res
      .status(200)
      .json({ message: "File uploaded and saved to the database" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error saving the file to the database" });
  }
});
// Add this route to your Express backend
app.get("/api/photos/:photoId", async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photoId);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // In this example, we're sending the photo data as JSON
    res.json(photo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching the photo" });
  }
});
app.get("/api/photos", async (req, res) => {
  try {
    const photos = await Photo.find();
    res.json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching photos" });
  }
});

app.listen(3001, () => {
  console.log("Server is running");
});

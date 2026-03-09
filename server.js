const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Path to data file
const DATA_FILE = path.join(__dirname, 'data', 'cases.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure directories and data file exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from root directory and uploads directory
app.use(express.static(__dirname));
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Helper to read/write cases
const getCases = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const saveCases = (cases) => fs.writeFileSync(DATA_FILE, JSON.stringify(cases, null, 2));

// API Endpoints

// GET all cases
app.get('/api/cases', (req, res) => {
    try {
        const cases = getCases();
        res.json(cases);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cases' });
    }
});

// GET single case by ID
app.get('/api/cases/:id', (req, res) => {
    try {
        const cases = getCases();
        const caseItem = cases.find(c => c.id === req.params.id);
        if (caseItem) {
            res.json(caseItem);
        } else {
            res.status(404).json({ error: 'Case not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST new case
app.post('/api/cases', upload.array('images', 10), (req, res) => {
    try {
        const { title, category, description, link } = req.body;
        const images = req.files ? req.files.map(f => `uploads/${f.filename}`) : [];

        const newCase = {
            id: uuidv4(),
            title: title || 'New Project',
            category: category || 'Category',
            description: description || '',
            link: link || '#',
            images: images,
            createdAt: new Date().toISOString()
        };

        const cases = getCases();
        cases.push(newCase);
        saveCases(cases);

        res.status(201).json(newCase);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add case' });
    }
});

// PUT (update) existing case
app.put('/api/cases/:id', upload.array('newImages', 10), (req, res) => {
    try {
        const cases = getCases();
        const index = cases.findIndex(c => c.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Case not found' });
        }

        const { title, category, description, link, existingImages } = req.body;

        // Parse existing images that were kept
        let finalImages = [];
        if (existingImages) {
            if (Array.isArray(existingImages)) {
                finalImages = existingImages;
            } else {
                finalImages = [existingImages];
            }
        }

        // Add any newly uploaded images
        if (req.files && req.files.length > 0) {
            const newUploadedImages = req.files.map(f => `/uploads/${f.filename}`);
            finalImages = [...finalImages, ...newUploadedImages];
        }

        cases[index] = {
            ...cases[index],
            title: title || cases[index].title,
            category: category || cases[index].category,
            description: description || cases[index].description,
            link: link || cases[index].link,
            images: finalImages,
            updatedAt: new Date().toISOString()
        };

        // Note: I am intentionally NOT deleting the unlinked image files here for simplicity, 
        // but in a production app you would run fs.unlinkSync on elements removed from finalImages.

        saveCases(cases);
        res.json(cases[index]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update case' });
    }
});

// DELETE a case
app.delete('/api/cases/:id', (req, res) => {
    try {
        const cases = getCases();
        const index = cases.findIndex(c => c.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Case not found' });
        }

        const deletedCase = cases.splice(index, 1)[0];
        saveCases(cases);

        // Optional: delete associated images
        if (deletedCase.images && deletedCase.images.length > 0) {
            deletedCase.images.forEach(imgPath => {
                const fullPath = path.join(__dirname, imgPath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            });
        }

        res.json({ message: 'Case deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete case' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Admin dashboard: http://localhost:${PORT}/admin.html`);
});

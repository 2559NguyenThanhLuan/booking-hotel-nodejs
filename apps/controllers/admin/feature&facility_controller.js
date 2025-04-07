var express = require("express");
var connection = require("../../database/db_config");
var router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const uploadDir = path.join(__dirname, '../uploads');

async function ensureUploadDir() {
    try {
        await fs.access(uploadDir);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(uploadDir, { recursive: true });
        } else {
            throw error;
        }
    }
}

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await ensureUploadDir();
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/svg+xml') {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file SVG!'));
        }
    }
});

function queryToPromise(query) {
    return new Promise((resolve, reject) => {
        connection.query(query, (err, results) => {
            if(err) reject(err);
            else resolve(results);
        });
    });
}

router.get("/", async function(req, res) {
    try {
        const [features, facilities] = await Promise.all([
            queryToPromise("SELECT * FROM features"),
            queryToPromise("SELECT * FROM facilities"),
        ]);

        return res.render("admin/service.ejs", {
            features: features,
            facilities: facilities,
        });
    } catch(err) {
        console.error("Error fetching: ", err.message);
        res.status(500).send("Database error");
    }
});

router.post('/addFeature', async function(req, res) {
    try {
        const {feature_name} = req.body;

        const q = "INSERT INTO features(name) VALUES (?)";

        const result = connection.query(q, [feature_name]);
       
    
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No features found to insert" });
        }
    
        return res.redirect("features-facilities");
    } catch (error) {
        console.error("Error fetching: ", error.message);
        res.status(500).send("Database error");
    }
});

router.post('/deleteFeature/:id', async function(req, res) {
    try {
        const id = req.params.id;
        const q = "DELETE FROM features WHERE id=?";

        connection.query(q, [id], function(err) {
            if(err) console.log(err);   
            res.redirect("/admin/features-facilities");
        });
    } catch (error) {
        console.error("Delete error:", error.message);
        res.status(500).send("Failed to delete feature");
    }
});

router.post('/addFacilities', upload.single('facility_icon'),async function(req,res) {
    try {
        const {facility_name, facility_desc} = req.body;
        const iconPath = req.file ? `/uploads/${req.file.filename}` : null;

        const q = "INSERT INTO `facilities`(`icon`, `name`, `description`) VALUES (?,?,?)"

        connection.query(q, [iconPath,facility_name,facility_desc], function(err) {
            if(err) console.log(err);

            res.redirect("/admin/features-facilities");
        })
    } catch (error) {
        console.error("Delete error:", error.message);
        res.status(500).send("Failed to delete facility");
    }
});

router.post('/deleteFacility/:id', async function(req, res) {
    try {
        const id = req.params.id;
        const q = "DELETE FROM facilities WHERE id=?";

        connection.query(q, [id], function(err) {
            if(err) console.log(err);   
            res.redirect("/admin/features-facilities");
        });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).send("Failed to delete facility");
    }
});
module.exports = router;
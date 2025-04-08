var express = require("express");
var router = express.Router();
var connection = require("../../database/db_config");
  

function queryToPromise(query, values = []) {
  return new Promise((resolve, reject) => {
    connection.query(query, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

router.get("/", async function(req, res) {
  try {
    const [settings, contact_details, team_details] = await Promise.all([
      queryToPromise("SELECT * FROM settings"),
      queryToPromise("SELECT * FROM contact_details"),
      queryToPromise("SELECT * FROM team_details")
    ]);

    res.render("admin/settings.ejs", {
      settings: settings,
      contact_details: contact_details,
      team_details: team_details
    });
  } catch (error) {
    console.error("Error fetching data: ", error.message);
    res.status(500).json({ error: "Database error" });
  }
});


router.post("/getAllSettings", async function(req, res) {
  try {
    const { site_title, site_about } = req.body;
    

    if (!site_title || !site_about) {
      return res.status(400).json({ error: "site_title and site_about are required" });
    }

    const q = "UPDATE `settings` SET `site_title` = ?, `site_about` = ? WHERE 1";
    const result = await queryToPromise(q, [site_title, site_about]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No settings found to update" });
    }

    return res.redirect("/admin/settings");
  } catch (error) {
    console.error("Error updating settings:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/updateContacts", async function(req, res) {
  try {
      const { address, gmap, phone, email, iframe } = req.body;  

      const q = "UPDATE contact_details SET address=?,gmap=?,phone=?,email=?,iframe=? WHERE 1";

      connection.query(q, [address, gmap, phone, email, iframe], function(err) {
        if(err) {
          return res.status(404).json({ message: "No contact found to update" });
        }
        res.redirect("/admin/settings");
      })
  
  } catch (error) {
      console.error("Error updating contacts:", error.message);
      res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/managementTeam", async function(req, res) {
  try {
      const {member_name, picture} = req.body;
    
      const q = "INSERT INTO team_details(name, picture) VALUES (?, ?)";
      connection.query(q, [member_name, picture], function(err) {
        if(err) console.log(err)
        res.redirect("/admin/settings");
      });
  } catch (error) {
      console.error("Error updating contacts:", error.message);
      res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/deleteTeam/:id", async function(req, res) {
  try {
    const id = req.params.id;
    
    const q = "DELETE FROM `team_details` WHERE sr_no=?";
    connection.query(q, [id], function(err) {
      if(err) console.log(err)
      res.redirect("/admin/settings");
    });
} catch (error) {
    console.error("Error updating contacts:", error.message);
    res.status(500).json({ error: "Internal server error" });
}
})

module.exports = router;
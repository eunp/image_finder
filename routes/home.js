var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'public/images/upload' });

router.post('/upload', upload.single('imagefile'), function(req, res, next) {
  res.json({
    file: req.file,
    status: 'upload successful'
  });
});

module.exports = router;

var express = require('express');
var fs = require('fs');
var path = require('path');

var imghash = require('imghash');
var hamming = require('hamming-distance');
// Hamming distance of 0 means that the images are very similar
// Greater the value the less similar the images
var hammingThreshold = 20;

var router = express.Router();
var imageDir = 'public/images/upload';

router.get('/imgs', function(req, res, next) {
  fs.readdir(imageDir, function(err, files) {
    if (err) {
      return next(err)
    }
    files = files.filter(function(f) {
      return !f.match(/^\./)
    })
    res.json({
      files: files
    });
  });
});

router.get('/imgs/:imgId', function(req, res, next) {
  fs.stat(path.join(imageDir,req.params.imgId), function(err, fstat) {
    if (err) {
      return next(err)
    }
    fs.readdir(imageDir, function(err, files) {
      if (err) {
        return next(err)
      }
      files = files.filter(function(f) {
        return ! (f.match(/^\./) || f === req.params.imgId)
      })

      var matchedFiles = [];
      var i = 0;
      var hash = [];
      hash.push(imghash.hash(path.join(imageDir,req.params.imgId)));
      while (files[i]) {
        hash.push(imghash.hash(path.join(imageDir,files[i])));
        i++
      }

      Promise
      .all(hash)
      .then((results) => {
        var dist;
        for (var i = 1; i < results.length; i++) {
          dist = hamming(results[0],results[i]);
          if (dist <= hammingThreshold) {
            // files array doesn't include the original file so we subtract 1
            matchedFiles.push({ name: files[i - 1], score: dist })
          }
        }
        res.json({
          matches: matchedFiles
        });
      });
    });
  });
});

module.exports = router;

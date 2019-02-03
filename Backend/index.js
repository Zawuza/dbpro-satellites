const path = require('path');
const pgp = require('pg-promise')();
const db = pgp('postgres://postgres:admin@andreizawuza.tk:5432/mygisdb');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const size = {
   3: 50,
   2: 250,
   1: 500,
   0: 750
};

app.use(function (req, res, next) {

   // Website you wish to allow to connect
   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

   // Request methods you wish to allow
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

   // Request headers you wish to allow
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

   // Set to true if you need the website to include cookies in the requests sent
   // to the API (e.g. in case you use sessions)
   res.setHeader('Access-Control-Allow-Credentials', true);

   // Pass to next layer of middleware
   next();
});

app.get('/:zoomLevel/:rid/patch.png', (req, res) => {
   const maxImgSize = 200;
   req.params['currentSize'] = size[req.params.zoomLevel];
   req.params['imgSize'] = req.params.currentSize > maxImgSize ? maxImgSize : req.params.currentSize;

   db.one(
      'SELECT encode(ST_AsPNG(ST_Resize(rast, ${imgSize}, ${imgSize})), \'hex\') FROM berlin${currentSize} WHERE rid = ${rid}',
      req.params
   )
   .then(function (data) {
      res.writeHead(200, {'Content-Type': 'image/png'});
      res.end(Buffer.from(data.encode, 'hex'));
   })
   .catch(function (error) {
      console.log('ERROR:', error)
   })
});

app.get('/get_coordinates_by_ids', (req, res) => {

   const ids = JSON.parse(req.query.ids);
   const zoomLevel = JSON.parse(req.query.zoomLevel);

   const currentSize = size[zoomLevel];

   if (ids.length == 0) {
      res.end();
   }

   const query = `SELECT rid, ST_RasterToWorldCoordY(rast,1,${currentSize}) AS x1, ST_RasterToWorldCoordX(rast,1,${currentSize}) AS y1, 
   ST_RasterToWorldCoordY(rast,${currentSize},1) AS x2, ST_RasterToWorldCoordX(rast,${currentSize},1) AS y2  FROM BERLIN${currentSize} 
   WHERE rid = ANY(array${req.query.ids})`;

   db.many(query)
   .then(function (data) {
   
      res.json(data);
   })
   .catch(function (error) {
      console.error('ERROR:', error)
   })
});

app.get('/map/:file', (req, res) => {
   const file = req.params.file;
   res.sendFile(path.resolve('map/' + file));
});

app.get('*', (req, res) => { 
   res.sendFile(path.resolve('map/index.html')); 
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
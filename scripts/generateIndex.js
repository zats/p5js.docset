require('../p5js.docset/Contents/Resources/Documents/js/data');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
// remove existent docset if exists
const INDEX_PATH = '../p5js.docset/Contents/Resources/docSet.dsidx';
if (fs.existsSync(INDEX_PATH)) {
  fs.unlinkSync(INDEX_PATH);
}
const db = new sqlite3.Database(INDEX_PATH);


function createIndex(name, type, path) {
  return `INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES ('${name}', '${type}', '${path}');`
}

function generateIndex() {
  db.serialize(() => {
    db.run('CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT);');

    for (const classitem of referenceData.classitems) {
      if (classitem.name && classitem.itemtype && classitem.class) {
        let dashItemType = null;
        if (classitem.itemtype == 'method') {
          db.run(createIndex(classitem.name, 'Function', `index.html#/${classitem.class}/${classitem.name}`));
        } else if (classitem.itemtype == 'property') {
          if (classitem.name == classitem.name.toUpperCase()) {
            dashItemType = 'Constant';
          } else {
            dashItemType = 'Property';
          }
        }
        if (dashItemType) {
          const query = createIndex(classitem.name, dashItemType, `index.html#/${classitem.class}/${classitem.name}`);
          db.run(query);
        }
      }
    }

    for (const classId in referenceData.classes) {
      const { name } = referenceData.classes[classId];
      if (name) {
        const query = createIndex(name, 'Class', `index.html#/${name}`);
        db.run(query);
      }

    }
  });
  db.close();
}


generateIndex();
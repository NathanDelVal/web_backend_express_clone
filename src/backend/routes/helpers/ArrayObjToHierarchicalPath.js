module.exports = {


  async ArrayObjToHierarchical(arrayObj) {
  arrayObj=JSON.parse(JSON.stringify(arrayObj))
//console.log("sliced -> ", arrayObj.slice(0, 3)); 
//console.log("arrayObj ", arrayObj)

  var title = '_id';                 //nome do arquivo ou pasta
  var parent_level = 'parent';       //pasta a qual pertence


  // index each item by title
  var indexed = arrayObj.reduce(function (result, item) {
      result[item[title]] = item;
      return result;
  }, {});

  // retain the root items only
  var result = arrayObj.filter(function (item) {
      // get parent
      var parent = indexed[item[parent_level]];
      // make sure to remove unnecessary keys
      //delete item[parent_level];
      //delete item[isDirectory];

      // has parent?
      if (parent) {
          // add item as a child
          parent.items = (parent.items || []).concat(item);
      }

      // This part determines if the item is a root item or not
      return !parent;
  });

  //console.log("resultresult ->", result)
  //var x = JSON.stringify(result, 0, 4)

  //console.log("ss" ,JSON.stringify(result.slice(0,4), 0, 4));

  return JSON.stringify(result, 0, 4);

},



  async ArrayObjToHierarchical2(array, parent, children) {

    var allCards = [
      { title: "A", parent_id: "root", has_children: true },
      { title: "A1", parent_id: "A", has_children: true },
      { title: "A11", parent_id: "A1", has_children: false },
      { title: "A12", parent_id: "A1", has_children: false },
      { title: "A13", parent_id: "A1", has_children: false },
      { title: "B", parent_id: "root", has_children: true },
      { title: "B1", parent_id: "A", has_children: true },
      { title: "B11", parent_id: "B1", has_children: false },
      { title: "B12", parent_id: "B1", has_children: false },
      { title: "B13", parent_id: "B1", has_children: false }
    ];
    // index each item by title
    var indexed = allCards.reduce(function (result, item) {
      result[item.title] = item;
      return result;
    }, {});

    // retain the root items only
    var result = allCards.filter(function (item) {

      // get parent
      var parent = indexed[item.parent_id];

      // make sure to remove unnecessary keys
      delete item.parent_id;
      delete item.has_children;

      // has parent?
      if (parent) {
        // add item as a child
        parent.children = (parent.children || []).concat(item);
      }

      // This part determines if the item is a root item or not
      return !parent;
    });

    var x = JSON.stringify(result, 0, 4)

    console.log(JSON.parse(x));

    return JSON.parse(x)
  }


}
var sqlanywhere = require("sqlanywhere");
var anyWhereDataBase = sqlanywhere.createConnection();

//TODO: add proccess.env...
var conectionConfig = {
  Host: "my-t3500:49152",
  Server: "Demo16",
  UserID: "DBA",
  Password: "sql",
  DatabaseName: "sample",
};

anyWhereDataBase.connect(conectionConfig, function (error) {
  if (error) {
    console.log(error);
    return;
  }
  console.log("Connected.");

  anyWhereDataBase.exec("SELECT DB_NAME()", function (error, result) {
    if (error) {
      console.log(error);
      return;
    }
    console.log("Result: ", result);
  });

  anyWhereDataBase.disconnect(function (error) {
    console.log("Disconnected.");
  });
});

module.export = {
  anyWhereDataBase,
};

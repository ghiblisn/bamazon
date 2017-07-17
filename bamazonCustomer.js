var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 8889,

  user: "root",
  password: "root",

  database:"bamazon"
});

connection.connect(function(err){
  if(err) throw err;
  console.log("connection as id " + connection.threadId);
})

displayAvailableItems(true);

function displayAvailableItems(promptBuy) {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    for (var i = 0; i< res.length; i++){
      console.log("ID: "+res[i].item_id+" | Name: "+res[i].product_name +" | $"+ res[i].price+" | Units: "+ res[i].stock_quantity)
    }
    console.log("----------------------------");
    if(promptBuy){
        buyPrompt();
    }
  });
}

function buyPrompt() {
  inquirer.prompt([
    {
    type:"input",
    message:"What's the ID of the item you would like to purchase?",
    name:"id"
    },
    {
    type:"input",
    message:"How many units would you like?",
    name:"unit"
    }
  ]).then(function(user){
    connection.query(
      "SELECT * FROM products WHERE ?",
      {
        item_id: user.id,
      },
      function(err, res) {
        if (err) throw err;
        if(parseInt(user.unit)>parseInt(res[0].stock_quantity)){
            console.log("Insufficient quantity!")
        }
        else{
            buyUpdate(user.id,parseInt(res[0].stock_quantity)-parseInt(user.unit),user.unit, res[0].price);
        };
      }
    );
  })
}

function buyUpdate(id, unitLeft, unitBuy, price){
    connection.query(
    "INSERT INTO products SET ?",
      [
        {
          stock_quantity: unitLeft
        },
        {
          item_id: id
        }
      ],
      function(err, res) {
        if (err) throw err;
        console.log("Transaction completed! \n Total cost: $"+ parseFloat(unitBuy)*parseFloat(price));
        displayAvailableItems(false);
      }
    );
}
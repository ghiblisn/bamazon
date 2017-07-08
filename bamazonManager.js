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
});

managerPrompt();

function managerPrompt() {
  inquirer.prompt([
    {
    type:"list",
    message:"What would you like to do?",
    choices: ["View Products for Sale","View Low Inventory", "Add to Inventory", "Add New Product"],
    name:"id"
    }
  ]).then(function(user){
    switch(user.id){
        case "View Products for Sale":
            displayAvailableItems(false);
            break;
        case "View Low Inventory":
            displayAvailableItems(true);
            break;
        case "Add to Inventory":
            addUnitPrompt();
            break;
        case "Add New Product":
            addProductPrompt();
            break;
    }
  });
};


function displayAvailableItems(low) {
    if(low){
        var lowInventory = "WHERE stock_quantity < 5"
    }
    else{
        var lowInventory = ""
    };
    connection.query("SELECT * FROM products " + lowInventory, function(err, res) {
        if (err) throw err;
        for (var i = 0; i< res.length; i++){
        console.log("ID: "+res[i].item_id+" | Name: "+res[i].product_name +" | $"+ res[i].price+" | Units: "+ res[i].stock_quantity)
        }
        console.log("----------------------------");
    });
};

function addProductPrompt() {
  inquirer.prompt([
    {
    type:"input",
    message:"What's the product name?",
    name:"name"
    },
    {
    type:"input",
    message:"Which department is the product in?",
    name:"department"
    },
    {
    type:"input",
    message:"How much does the product cost?",
    name:"price"
    },
    {
    type:"input",
    message:"How many units are in stock?",
    name:"unit"
    }
  ]).then(function(user){
    connection.query(
      "INSERT INTO products SET ?",
        {
            product_name: user.name,
            department_name: user.department,
            price: user.price,
            stock_quantity: user.unit,
        },
      function(err, res) {
        if (err) throw err;
      }
    );
  })
};

function addUnitPrompt() {
  inquirer.prompt([
    {
    type:"input",
    message:"What's the ID of the item you would like to add?",
    name:"id"
    },
    {
    type:"input",
    message:"How many units would you like to add into inventory?",
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
        addUnitUpdate(user.id,parseInt(res[0].stock_quantity)+parseInt(user.unit));
      }
    );
  })
}


function addUnitUpdate(id, unit){
    connection.query(
    "UPDATE products SET ? WHERE ?",
      [
        {
          stock_quantity: unit
        },
        {
          item_id: id
        }
      ],
      function(err, res) {
        if (err) throw err;
        console.log("Units add!");
        displayAvailableItems(false);
      }
    )
};

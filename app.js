const Sequelize = require("sequelize");
const db = new Sequelize("postgres://localhost/zara");
const express = require("express");
const { STRING} = Sequelize;
const app = express();


const employees = db.define("employees", {
  name: {
    type: STRING,
    allowNull: false,
    unique: true
  },
});

const locations = db.define("locations", {
  place: {
    type: STRING,
    allowNull: false,
    unique: true
  },
});

const collection = db.define("collection", {
  item: {
    type: STRING,
    allowNull: false,
    unique: true
  }
});

locations.belongsTo(employees);
employees.hasMany(locations);
employees.belongsTo(employees, {as: "manager"});

const syncAndSeed = async () => {
  await db.sync({ force: true });

  const [larry, bob, curly, sue, henry] = await Promise.all([
    employees.create({ name: 'larry'}),
    employees.create({ name: 'bob'}),
    employees.create({ name: 'curly'}),
    employees.create({ name: 'sue'}),
    employees.create({ name: 'henry'})
  ]);

    larry.managerId= bob.id;
    curly.managerId = bob.id;
    sue.managerId = bob.id;
    henry.managerId = bob.id;


    await Promise.all([
      larry.save(), bob.save(), curly.save(), sue.save(), henry.save()
    ]);

 await locations.create({ place: 'Soho', employeeId: 1});
 await locations.create({ place: 'UES', employeeId: 2});
 await locations.create({ place: 'UWS', employeeId: 3});
 await locations.create({ place: 'Midtown', employeeId: 4});
 await locations.create({ place: 'Broadway', employeeId: 5});


 const [jacket, coat, scarf] = await Promise.all([
  collection.create({item: 'jacket'}),
  collection.create({item: 'coat'}),
  collection.create({item: 'scarf'})
]);


};

app.get("/api/employees", async(req, res, next) => {
  try{
    const [Employees] = await Promise.all([
      employees.findAll({
        include: [locations]
      })
    ]);

    res.send(Employees);
  }catch(ex){
    console.log(ex);
  }
});


app.get("/api/locations", async(req,res,next)=>{
  try{

    const [Locations] = await Promise.all([
      locations.findAll({
        include: [employees]
      })
    ])

    res.send(Locations);
  }catch(ex){
    console.log(ex);
  }
})

app.get("/api/fall_collection", async(req, res, next) =>{
  try{
    const [Collection] = await Promise.all([
      collection.findAll()
    ]);
    res.send(Collection);
  }catch(ex){
    console.log(ex)
  }
})


const init = async () => {
  try{
   await syncAndSeed()
   const port = process.env.PORT || 1337;
   app.listen(port, () => console.log("listening to port 1337"));
  }catch(ex){
    console.log(ex);
  }
};

init();

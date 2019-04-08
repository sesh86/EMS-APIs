var mongoose=require('mongoose');
const _app=require('./config.js');
var cors=require('cors');

mongoose.connect('mongodb://'+_app.user+':'+_app.pwd+'@cluster0-shard-00-00-lemrd.mongodb.net:27017,cluster0-shard-00-01-lemrd.mongodb.net:27017,cluster0-shard-00-02-lemrd.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin',{useNewUrlParser: true});

var user = mongoose.model('users', { name: String, email:String, password:String,role:String });

var enquiry = mongoose.model('queries', { name: String, email:String, phone:Number,product:String,type:String,location:String,assignedTo:String,purchasePlan:String,followupDate:Date,status:String });

var followup = mongoose.model('followups', { enquiry_id: String, comment:String,commentDate:Date });

const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/createUser',cors(), function (req, res) {
    
  if(validateToken(req.headers.jwt)!=='Valid'){res.send('Invalid token'); return}

    let l_user = new user(req.body);
    l_user.save(function (err) {
        res.send('User Created');
    });
})

app.post('/createEnquiry', cors(),function (req, res) {
  if(validateToken(req.headers.jwt)!=='Valid'){res.send('Invalid token'); return}

  let l_enquiry = new enquiry(req.body);
  l_enquiry.save(function (err) {
      res.send('Enquiry Submitted');
  });
});

app.post('/createFollowup', cors(),function (req, res) {
  
  if(validateToken(req.headers.jwt)!=='Valid'){res.send('Invalid token'); return}

  let l_followup = new followup(req.body);
  l_followup.save(function (err) {
      res.send('Followup Added');
  });
});

function validateToken(p_jwt){
  if(!p_jwt)
  {
    return('Invalid Token')
  }
  else{
    
    try{
      jwt.verify(p_jwt, 'secret')
    }
    catch(e){return('Invalid Token');}
  }
  return 'Valid';
}

app.post('/getFollowup',cors(), function (req, res) {
    if(validateToken(req.headers.jwt)!=='Valid'){res.send('Invalid token'); return}

    followup.find({enquiry_id:req.body.id},function(err,data){
      res.send(data);
    });
});

app.post('/updateEnquiry', cors(),function (req, res) {
  
  if(validateToken(req.headers.jwt)!=='Valid'){res.send('Invalid token'); return}

  let l_upd=req.body
  enquiry.updateOne({_id:l_upd._id},{status:l_upd.status,followupDate:new Date(l_upd.followupDate)},function (err, data) {
      res.send(data);
  });
});


app.post('/getEnquiries',cors(), function (req, res) {
  if(validateToken(req.headers.jwt)!=='Valid'){res.send('Invalid token'); return}

  enquiry.find(function(err,data){
      res.send(data);
  });
});

app.post('/getEnquiry',cors(), function (req, res) {
  if(validateToken(req.headers.jwt)!=='Valid'){res.send('Invalid token'); return}

  enquiry.find({_id:req.body.id},function(err,data){
      res.send(data);
  });
});

app.post('/login', cors(),function (req, res) {
  console.log('body---',req.body);
  let l_user = req.body;
  user.find(l_user,{"email":1,"name":2,"role":3},function(err,data){
    console.log(data[0])
    
    let l_data=JSON.stringify(data[0]);

    if(data.length){
      jwt.sign(l_data,'secret',
      (err,token)=>{
        console.log(token);
        res.status(200).json(token);
        res.send(token);
      })
    }
    else
      res.send('Invalid User Name or password')
  });
})
app.post('/verify',cors(),function(req,res){
  console.log(req.body)
  res.send(jwt.verify(req.body.jwt, 'secret'));
})



app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

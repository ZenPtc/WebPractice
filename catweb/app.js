const 	express 	= require("express"),
		app     	= express(),
		mongoose 	= require("mongoose"),
		morgan 		= require("morgan");

//////////////////////////////////setting//////////////////////////////////
mongoose.connect("mongodb://localhost/catwebDB");
app.set("view engine","ejs");

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded())

////////////////////////////////////data////////////////////////////////////
//user
const userSchema = new mongoose.Schema({
		name: String,
		pwd: String
	});
const User = mongoose.model("User",userSchema);
//token
const tokenSchema = new mongoose.Schema({
		tokenId: String
	});
const Token = mongoose.model("Token",tokenSchema);

//findHome cat
const fhcatSchema = new mongoose.Schema({
		image: String,
		owner: String,
		description: String
	});
const FhCat = mongoose.model("FhCat",fhcatSchema);
//needblood cat
const nbcatSchema = new mongoose.Schema({
		image: String,
		owner: String,
		bloodGroup: String,
		description: String
	});
const NbCat = mongoose.model("NbCat",nbcatSchema);
//lost cat
const lostcatSchema = new mongoose.Schema({
		image: String,
		owner: String,
		place: String,
		description: String
	});
const LostCat = mongoose.model("LostCat",lostcatSchema);

/////////////////////////////////middleware/////////////////////////////////
const checkToken = function(req,res,next){
	const tokenId = req.body.tokenId;
	
	Token.findOne({tokenId:tokenId},(err,foundToken)=>{
		if(err){
			res.send(err);
		}else if(foundToken===null){ //cannot find token
			res.send("Please sign in");
		}else{
			req.tokenId = tokenId;
			next();
		}
	})
}

///////////////////////////////////route///////////////////////////////////
//page
app.get("/",(req,res) =>{				res.render("home");			})
app.get("/signUp",(req,res) =>{			res.render("signUp");		})
app.get("/signIn",(req,res) =>{			res.render("signIn");		})
app.get("/signOut",(req,res) =>{		res.render("signOut");		})
app.get("/findHome/form",(req,res) =>{	res.render("findHomeForm");	})
app.get("/blood/form",(req,res) =>{		res.render("bloodForm");	})
app.get("/lostCat/form",(req,res) =>{	res.render("lostCatForm");	})
//show cat
app.get("/findHome",(req,res) =>{
	FhCat.find({},(err,allFhCat)=>{
		if(err){
			res.send(err);
		}else{
			res.render("findHome", {allFhCat:allFhCat});	
		}
	})
})

app.get("/blood",(req,res) =>{
	NbCat.find({},(err,allNbCat)=>{
		if(err){
			res.send(err);
		}else{
			res.render("blood", {allNbCat:allNbCat});	
		}
	})
})

app.get("/lostCat",(req,res) =>{
	LostCat.find({},(err,allLostCat)=>{
		if(err){
			res.send(err);
		}else{
			res.render("lostCat", {allLostCat:allLostCat});	
		}
	})
})

//details
app.get("/findHome/:catId",(req,res) =>{
	const catId = req.params.catId;
	
	FhCat.findOne({_id:catId},(err,cat)=>{
		if(err){
			res.send(err);
		}else{
			res.render("findHomeInfo", {cat:cat});	
		}
	})
})

app.get("/blood/:catId",(req,res) =>{
	const catId = req.params.catId;
	
	NbCat.findOne({_id:catId},(err,cat)=>{
		if(err){
			res.send(err);
		}else{
			res.render("bloodInfo", {cat:cat});	
		}
	})
})

app.get("/lostCat/:catId",(req,res) =>{
	const catId = req.params.catId;
	
	LostCat.findOne({_id:catId},(err,cat)=>{
		if(err){
			res.send(err);
		}else{
			res.render("lostCatInfo", {cat:cat});	
		}
	})
})

//user
app.post("/signUp",(req,res)=>{
	const name = req.body.name,
		  pwd = req.body.pwd;
	
	const newUser = new User({
		name: name,
		pwd: pwd
	});
	
	newUser.save((err,user)=>{ //save user to db
		if(err){
			res.send(err);
		}else{
			res.redirect("/");
		}
	});
});

app.post("/signIn",(req,res)=>{
	const name = req.body.name,
		  pwd = req.body.pwd;
	
	User.findOne({name:name},(err,foundUser)=>{ //find user
		if(err){
			res.send(err);
		}else if(foundUser===null){ //can't find username
			res.send("Cannot find user");
		}else{
			if(foundUser.pwd === pwd){ //if signIn success -> create token
				const newToken = new Token({
					tokenId: foundUser._id
				});
				newToken.save((err,token)=>{
					if(err){
						res.send(err);
					}else{
						res.redirect("/"); //Received a token
					}
				});
			}else{
				res.send("Wrong password");
			}
		}
	})
});

app.post("/signOut",checkToken,(req,res)=>{
	Token.remove({tokenId:req.tokenId},(err,removedToken)=>{
		if(err){
			res.send(err);
		}else{
			res.redirect("/"); //token has been removed
		}
	})
});
//post
app.post("/findHome",checkToken,(req,res)=>{
	const image = req.body.image,
		  description = req.body.description;
	
	User.findOne({_id:req.tokenId},(err,foundUser)=>{
		if(err){
			res.send(err);
		}else{
			const newFhCat = new FhCat({
				image: image,
				owner: foundUser.name,
				description: description
			});

			newFhCat.save((err,cat)=>{ //save findhomeCat to db
				if(err){
					res.send(err);
				}else{
					res.redirect("/findHome");
				}
			});
		}
	})
})

app.post("/blood",checkToken,(req,res)=>{
	const image = req.body.image,
		  bloodGroup = req.body.bloodGroup,
		  description = req.body.description;
	
	User.findOne({_id:req.tokenId},(err,foundUser)=>{
		if(err){
			res.send(err);
		}else{
			const newNbCat = new NbCat({
				image: image,
				owner: foundUser.name,
				bloodGroup: bloodGroup,
				description: description
			});

			newNbCat.save((err,cat)=>{ //save needBlood Cat to db
				if(err){
					res.send(err);
				}else{
					res.redirect("/blood");
				}
			});
		}
	})
})

app.post("/lostCat",checkToken,(req,res)=>{
	const image = req.body.image,
		  place = req.body.place,
		  description = req.body.description;
	
	User.findOne({_id:req.tokenId},(err,foundUser)=>{
		if(err){
			res.send(err);
		}else{
			const newLostCat = new LostCat({
				image: image,
				owner: foundUser.name,
				place: place,
				description: description
			});

			newLostCat.save((err,cat)=>{ //save lostCat to db
				if(err){
					res.send(err);
				}else{
					res.redirect("/lostCat");
				}
			});
		}
	})
})
//////////////////////////////////listen//////////////////////////////////
app.listen(3000,function(){
	console.log("Serving catweb on port 3000");
})
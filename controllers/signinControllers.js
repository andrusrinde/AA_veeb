const mysql = require("mysql2/promise");
const argon2 = require("argon2");
const dbInfo = require("../../../../../vp2025config");

const dbConf = {
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
};

//@desc Page for logging in
//@route GET /signin
//@access public

const signinPage = (req, res)=>{
	res.render("signin", {notice: "Sisesta palun oma kasutajatunnus ja parool!"});
};

//@desc log in
//@route POST /signin
//@access public

const signinPagePost = async (req, res)=>{
	let conn;
	console.log(req.body);
	//Andmete lihtsam valideerimine
	if(
	  !req.body.emailInput ||
	  !req.body.passwordInput
	){
	  let notice = "Sisselogimise andmed on puudulikud!";
	  console.log(notice);
	  return res.render("signin", {notice: notice});
	}
	try {
		conn = await mysql.createConnection(dbConf);
		//Küsime andmebaasist sisestatud kasutajatunnusega kasutaja id ja parooli
		let sqlReq = "SELECT id, password FROM users_aa WHERE email = ?";
		const [users] = await conn.execute(sqlReq, [req.body.emailInput]);
		if(users.length === 0){
		  let notice = "Kasutajatunnus ja/või parool on vale!";
	      console.log(notice);
	      return res.render("signin", {notice: notice});
		}
		const user = users[0];
		//kontrollime, kas sisestatud paroolist saab sellise räsi nagu andmebaasis
		const match = await argon2.verify(user.password, req.body.passwordInput);
		//kui parool ja räsi klapivad
		if(match){
			//logisime sisse
			//let notice = "Oled sisse loginud!";
			//return res.render("signin", {notice: notice});
			//võtame kasutusele sessioonimuutujad
			req.session.userId = user.id;
			sqlReq = "SELECT first_name, last_name FROM users_aa WHERE id = ?";
			const [users] = await conn.execute(sqlReq, [req.session.userId]);
			req.session.userFirstName = users[0].first_name;
			req.session.userLastName = users[0].last_name;
			return res.redirect("/home");
		} else {
			//ei loginud sisse
			let notice = "Kasutajatunnus ja/või parool on vale!";
	        console.log(notice);
	        return res.render("signin", {notice: notice});
		}
		res.render("signin", {notice: "Miski läks valesti!"});
	}
	catch(err){
		console.log(err);
		res.render("signin", {notice: "Tehniline viga!"});
	}
	finally {
		if(conn){
			await conn.end();
			console.log("Andmebaasiühendus suletud!");
		}
	}
};

module.exports = {
	signinPage,
	signinPagePost
};
exports.isLogin = function(req, res, next){
	if(req.session != null){
		if(req.session.userId){
			//console.log("Sees on kasutaja id: " + req.session.userId);
			next();
		} else {
			//console.log("Sessioonimuutujat pole, keegi ei ole sisseloginud.");
			return res.redirect("/signin");
		}
	} else {
		//console.log("sessiooni pole.");
		return res.redirect("/signin");
	}
}
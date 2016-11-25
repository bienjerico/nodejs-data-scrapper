var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

/* get artist */
app.get('/process-artists', function (req, res) {

	request('http://www.tcelectronic.com/artists/studio-pros', function (error, response, body) {

		console.log("Start Data Scraping...");

		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(body);
			var list = $("#featured-studio-pros");
			var listDetails = list.find("ul li h3 a");
			var obj = {artists: []};
			var cnt = 0;

			listDetails.each(function(){

				var artist = $(this).attr("href");
				var artistUrl = 'http://www.tcelectronic.com/'+artist;

				  	request('http://www.tcelectronic.com/'+artist, function (error, response, body) {

						if (!error && response.statusCode == 200) {
							var $ = cheerio.load(body);
							var productdata = "";

							$("#artist-products li").each(function(){
								productdata += $(this).find("span").first().text();
								productdata += ',';
							})
								
							obj.artists.push({
											image : $(".artist-banner-image").attr('src'),
											h2 : $("#variable-banner-text h2").text(),
											h3 : $("#variable-banner-text h3").text(),
											p : $("#variable-banner-text p").text(),
											desc : $("#artist-description").children().text(),
											products : productdata
										}) 
							fs.writeFile('studio-pros.json', JSON.stringify(obj, null, 4), 'utf-8');
							cnt++;
						  	console.log(cnt +' - '+ $("#variable-banner-text h2").text());
						}
			  		})
			})
		}
	})
})

/* display artist */
app.get('/artists',function(req,res){
	fs.readFile('studio-pros.json', 'utf8', function (err, data) {

	    if (err) throw err; // we'll not consider error handling for now

	    var obj = JSON.parse(data);
	    var artists = obj.artists;
	    var result = "<html><body><table table=1 cellpadding=0>";
	    var cnt = 1;

	    for(var x = 0 ; x < artists.length ; x++){
			var image = artists[x].image; 
			var name = artists[x].h2; 
			var bandname = artists[x].h3; 
			var message = artists[x].p; 
			var desc = artists[x].desc; 
			var products = artists[x].products; 

			result += "<tr><td>"+cnt+"</td><td>"+image+"</td><td>"+name+"</td><td>"+bandname+"</td><td>"+message+"</td><td>"+desc+"</td><td>"+products+"</td></tr>";
			cnt++;
	    }

	    result += "</table></body></html>";
	    res.send(result);
	
	});
});



app.listen(3000);